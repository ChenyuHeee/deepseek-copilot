/**
 * Local LRU cache for DeepSeek reasoning_content.
 *
 * VS Code does not pass reasoning_content back to providers in multi-turn
 * conversations. This cache captures the reasoning from each streamed response,
 * keys it by a fingerprint of the assistant turn, and re-injects it into the
 * message history before the next API call so DeepSeek does not 400.
 */

const MAX_ENTRIES = 512;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB hard cap

export const ENTRY_SIZE_WARN_BYTES = 512 * 1024; // 512 KB — log if exceeded
export const TOTAL_BYTES_WARN = 8 * 1024 * 1024; // 8 MB — log if exceeded

/** Serialised form stored in VS Code globalState for persistence across restarts. */
export interface CachedTurn {
	fp: string;
	reasoning: string;
}

/**
 * Compute a stable fingerprint for an assistant turn.
 *
 * Prefers tool_calls (name:id tuples — highly stable) over visible text.
 * Falls back to whitespace-normalised visible text when no tool calls were
 * emitted.  Returns null when there is no anchor (empty text + no tool calls).
 */
export function fingerprintAssistantTurn(opts: {
	text: string;
	toolCalls?: Array<{ id: string; name: string }>;
}): string | null {
	if (opts.toolCalls && opts.toolCalls.length > 0) {
		return "tc:" + opts.toolCalls.map((tc) => `${tc.name}:${tc.id}`).join(",");
	}
	const normalised = opts.text.trim().replace(/\s+/g, " ");
	if (!normalised) {
		return null;
	}
	// Cap at 200 chars so very long responses don't produce huge keys.
	return "tx:" + normalised.slice(0, 200);
}

/** Oldest-first LRU cache capped by entry count and total byte size. */
export class ReasoningCache {
	static readonly ENTRY_SIZE_WARN_BYTES = ENTRY_SIZE_WARN_BYTES;
	static readonly TOTAL_BYTES_WARN = TOTAL_BYTES_WARN;
	static readonly MAX_TOTAL_BYTES = MAX_TOTAL_BYTES;

	private readonly _map = new Map<string, string>(); // insertion order = LRU
	private _totalBytes = 0;
	private readonly _maxEntries: number;
	private _onChange?: () => void;

	constructor(maxEntries = MAX_ENTRIES) {
		this._maxEntries = maxEntries;
	}

	size(): number {
		return this._map.size;
	}

	keys(): string[] {
		return Array.from(this._map.keys());
	}

	get(fp: string): string | undefined {
		const val = this._map.get(fp);
		if (val !== undefined) {
			// Refresh to most-recent position (LRU)
			this._map.delete(fp);
			this._map.set(fp, val);
		}
		return val;
	}

	set(fp: string, reasoning: string): void {
		if (this._map.has(fp)) {
			const old = this._map.get(fp)!;
			this._totalBytes -= Buffer.byteLength(old, "utf8");
			this._map.delete(fp);
		}
		const bytes = Buffer.byteLength(reasoning, "utf8");
		this._totalBytes += bytes;
		this._map.set(fp, reasoning);

		// Evict oldest entries until within limits
		while (
			(this._map.size > this._maxEntries || this._totalBytes > MAX_TOTAL_BYTES) &&
			this._map.size > 0
		) {
			const oldest = this._map.keys().next().value!;
			const oldBytes = Buffer.byteLength(this._map.get(oldest)!, "utf8");
			this._totalBytes -= oldBytes;
			this._map.delete(oldest);
		}

		this._onChange?.();
	}

	stats(): { entryCount: number; totalBytes: number } {
		return { entryCount: this._map.size, totalBytes: this._totalBytes };
	}

	/** Serialise to a plain array for VS Code globalState persistence. */
	serialize(): CachedTurn[] {
		return Array.from(this._map.entries()).map(([fp, reasoning]) => ({ fp, reasoning }));
	}

	/** Restore from a previously serialised snapshot. */
	restore(turns: CachedTurn[]): void {
		this._map.clear();
		this._totalBytes = 0;
		for (const t of turns) {
			this.set(t.fp, t.reasoning);
		}
	}

	/** Register a callback fired after every cache write (debounce in caller). */
	setOnChange(cb: () => void): void {
		this._onChange = cb;
	}
}

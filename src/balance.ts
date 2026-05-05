import * as vscode from "vscode";

const BALANCE_API_URL = "https://api.deepseek.com/user/balance";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const BALANCE_CACHE_STATE_KEY = "deepseek.balanceCache";

/** Balance info for a single currency returned by DeepSeek API. */
export interface DeepSeekBalanceInfo {
	currency: string;
	total_balance: string;
	granted_balance: string;
	topped_up_balance: string;
}

/** Full balance API response. */
export interface DeepSeekBalanceResponse {
	is_available: boolean;
	balance_infos: DeepSeekBalanceInfo[];
}

/** Cached balance data persisted in globalState. */
interface CachedBalance {
	timestamp: number;
	data: DeepSeekBalanceResponse | null;
	error?: string;
}

/**
 * Fetch the user's balance from the DeepSeek API.
 * Returns null if the API key is missing.
 */
export async function fetchBalance(apiKey: string): Promise<DeepSeekBalanceResponse> {
	const response = await fetch(BALANCE_API_URL, {
		method: "GET",
		headers: {
			"Accept": "application/json",
			"Authorization": `Bearer ${apiKey}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Balance API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`);
	}

	return (await response.json()) as DeepSeekBalanceResponse;
}

/**
 * Manages a VS Code StatusBarItem that displays DeepSeek balance and
 * estimated token usage.  The item lives in the bottom-right status bar,
 * similar to the native Copilot UI.
 */
export class BalanceStatusBarManager {
	private readonly _statusBarItem: vscode.StatusBarItem;
	private _refreshTimer: ReturnType<typeof setTimeout> | undefined;
	private _totalInputTokens = 0;
	private _totalOutputTokens = 0;
	private _cachedBalance: CachedBalance | null = null;

	constructor(
		private readonly _getApiKey: () => Promise<string | undefined>,
		private readonly _globalState: vscode.Memento,
	) {
		this._statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			1, // priority — push it toward the right edge (lower number = righter)
		);
		this._statusBarItem.name = "DeepSeek Balance";
		this._statusBarItem.tooltip = "DeepSeek 余额 & 用量";
		this._statusBarItem.text = "$(loading~spin) DeepSeek";
		this._statusBarItem.command = "huggingface.refreshBalance";
		this._statusBarItem.show();

		// Restore cached balance & token counts from previous session
		const saved = this._globalState.get<CachedBalance>(BALANCE_CACHE_STATE_KEY);
		if (saved) {
			this._cachedBalance = saved;
			this._updateDisplay();
		}

		// Initial fetch
		void this._refresh();
	}

	/** Called by the provider after each successful API call to track usage. */
	recordUsage(inputTokens: number, outputTokens: number): void {
		this._totalInputTokens += inputTokens;
		this._totalOutputTokens += outputTokens;
		this._updateDisplay();
	}

	/** Manually refresh balance (e.g. via command). */
	async refresh(): Promise<void> {
		await this._refresh();
	}

	/** Format the status bar compact text. */
	private _buildCompactText(): string {
		const balance = this._cachedBalance?.data;
		if (!balance) {
			// We still show token usage even if balance hasn't been fetched
			if (this._totalInputTokens > 0 || this._totalOutputTokens > 0) {
				return `$(pulse) ${this._formatTokens(this._totalInputTokens + this._totalOutputTokens)}`;
			}
			return `$(question) DeepSeek`;
		}

		if (!balance.is_available) {
			return `$(warning) DeepSeek 余额不足`;
		}

		// Find CNY balance (preferred) or first available currency
		const info = balance.balance_infos.find((b) => b.currency === "CNY")
			?? balance.balance_infos[0];

		if (!info) {
			return `$(check) DeepSeek`;
		}

		const total = parseFloat(info.total_balance);
		const symbol = info.currency === "CNY" ? "¥" : info.currency;

		// Compact: symbol + total balance
		return `$(credit-card) ${symbol}${total.toFixed(2)}`;
	}

	/** Format the full tooltip with detailed info. */
	private _buildTooltip(): string {
		const balance = this._cachedBalance?.data;
		const lines: string[] = ["**DeepSeek 余额 & 用量**", ""];

		if (balance) {
			if (balance.is_available) {
				for (const info of balance.balance_infos) {
					const symbol = info.currency === "CNY" ? "¥" : info.currency;
					lines.push(`💰 总余额: ${symbol}${info.total_balance}`);
					lines.push(`   ├ 充值余额: ${symbol}${info.topped_up_balance}`);
					lines.push(`   └ 赠送余额: ${symbol}${info.granted_balance}`);
				}
			} else {
				lines.push("⚠️ 余额不足，账户已欠费");
			}
		} else if (this._cachedBalance?.error) {
			lines.push(`❌ 获取余额失败: ${this._cachedBalance.error}`);
		} else {
			lines.push("$(loading~spin) 正在获取余额...");
		}

		lines.push("");

		if (this._totalInputTokens > 0 || this._totalOutputTokens > 0) {
			lines.push(`📊 本次会话用量 (估算)`);
			lines.push(`   ├ 输入: ${this._formatTokens(this._totalInputTokens)}`);
			lines.push(`   └ 输出: ${this._formatTokens(this._totalOutputTokens)}`);
			lines.push(`   └ 合计: ${this._formatTokens(this._totalInputTokens + this._totalOutputTokens)}`);
		} else {
			lines.push("📊 本次会话暂无用量统计");
		}

		const cached = this._cachedBalance;
		if (cached && cached.timestamp) {
			const ago = Math.round((Date.now() - cached.timestamp) / 1000);
			lines.push("");
			lines.push(`🕐 余额缓存于 ${this._formatTimeAgo(ago)} 前`);
		}

		lines.push("");
		lines.push("点击刷新余额 | 右键管理API Key");

		return lines.join("\n");
	}

	private _updateDisplay(): void {
		this._statusBarItem.text = this._buildCompactText();
		this._statusBarItem.tooltip = new vscode.MarkdownString(this._buildTooltip());
	}

	private async _refresh(): Promise<void> {
		try {
			const apiKey = await this._getApiKey();
			if (!apiKey) {
				this._cachedBalance = { timestamp: Date.now(), data: null, error: "未配置 API Key" };
				this._updateDisplay();
				return;
			}

			const data = await fetchBalance(apiKey);
			this._cachedBalance = { timestamp: Date.now(), data };
			// Persist to globalState so data survives restarts
			void this._globalState.update(BALANCE_CACHE_STATE_KEY, this._cachedBalance);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error("[DeepSeek Balance] Fetch failed:", msg);
			this._cachedBalance = { timestamp: Date.now(), data: null, error: msg };
		}
		this._updateDisplay();
	}

	/** Schedule periodic refresh. */
	startAutoRefresh(): void {
		this.stopAutoRefresh();
		this._refreshTimer = setInterval(() => {
			void this._refresh();
		}, REFRESH_INTERVAL_MS);
	}

	/** Stop periodic refresh (cleanup). */
	stopAutoRefresh(): void {
		if (this._refreshTimer) {
			clearInterval(this._refreshTimer);
			this._refreshTimer = undefined;
		}
	}

	/** Dispose the status bar item and clean up. */
	dispose(): void {
		this.stopAutoRefresh();
		this._statusBarItem.dispose();
	}

	// ---- formatting helpers ----

	private _formatTokens(n: number): string {
		if (n >= 1_000_000) {
			return `${(n / 1_000_000).toFixed(1)}M`;
		}
		if (n >= 1_000) {
			return `${(n / 1_000).toFixed(1)}K`;
		}
		return String(n);
	}

	private _formatTimeAgo(seconds: number): string {
		if (seconds < 60) {
			return `${seconds} 秒`;
		}
		if (seconds < 3600) {
			return `${Math.floor(seconds / 60)} 分钟`;
		}
		return `${Math.floor(seconds / 3600)} 小时`;
	}
}

import * as vscode from "vscode";
import { HuggingFaceChatModelProvider } from "./provider";

export function activate(context: vscode.ExtensionContext) {
	// Build a descriptive User-Agent to help quantify API usage
	const ext = vscode.extensions.getExtension("ChenyuHeee.deepseek-v4-pro-copilot");
	const extVersion = ext?.packageJSON?.version ?? "unknown";
	const vscodeVersion = vscode.version;
	// Keep UA minimal: only extension version and VS Code version
	const ua = `huggingface-vscode-chat/${extVersion} VSCode/${vscodeVersion}`;

	const provider = new HuggingFaceChatModelProvider(context.secrets, ua);
	// Register the Hugging Face provider under the vendor id used in package.json
	vscode.lm.registerLanguageModelChatProvider("huggingface", provider);

	// Management command to configure API key
	context.subscriptions.push(
		vscode.commands.registerCommand("huggingface.manage", async () => {
			const existing = await context.secrets.get("deepseek.apiKey");
			const apiKey = await vscode.window.showInputBox({
				title: "DeepSeek API Key",
				prompt: existing ? "Update your DeepSeek API key" : "Enter your DeepSeek API key",
				ignoreFocusOut: true,
				password: true,
				value: existing ?? "",
			});
			if (apiKey === undefined) {
				return; // user canceled
			}
			if (!apiKey.trim()) {
				await context.secrets.delete("deepseek.apiKey");
				vscode.window.showInformationMessage("DeepSeek API key cleared.");
				return;
			}
			await context.secrets.store("deepseek.apiKey", apiKey.trim());
			vscode.window.showInformationMessage("DeepSeek API key saved.");
		})
	);
}

export function deactivate() {}

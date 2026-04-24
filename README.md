# DeepSeek V4 Pro for GitHub Copilot Chat

Use [DeepSeek V4 Pro](https://api-docs.deepseek.com/) in VS Code with GitHub Copilot Chat, powered by the official DeepSeek API.

---

## ⚡ Quick Start

1. Install the extension by running:
   ```bash
   npx @vscode/vsce package --no-dependencies -o deepseek-v4-pro-copilot.vsix
   code --install-extension deepseek-v4-pro-copilot.vsix
   ```
2. Open VS Code's chat interface.
3. Run `Cmd+Shift+P` → **Manage DeepSeek V4 Pro Provider**.
4. Enter your [DeepSeek API Key](https://platform.deepseek.com/api_keys).
5. In the Copilot Chat model picker, select **deepseek-v4-pro**. 🥳

---

## Requirements

- VS Code 1.104.0 or higher.
- GitHub Copilot extension installed.
- [DeepSeek API Key](https://platform.deepseek.com/api_keys).

## 🛠️ Development

```bash
git clone https://github.com/ChenyuHeee/deepseek-v4-pro-copilot
cd deepseek-v4-pro-copilot
npm install
npm run compile
```

Press F5 to launch an Extension Development Host.

Common scripts:
- Build: `npm run compile`
- Watch: `npm run watch`

---

## Support & License

- Open issues: https://github.com/ChenyuHeee/deepseek-v4-pro-copilot/issues
- License: MIT

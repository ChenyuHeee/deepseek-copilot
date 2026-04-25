# DeepSeek for GitHub Copilot Chat

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

Use **DeepSeek V4 Flash** and **DeepSeek V4 Pro** directly inside VS Code's GitHub Copilot Chat, powered by the official [DeepSeek API](https://api-docs.deepseek.com/).

| Model | Context | Thinking Mode | Best For |
|---|---|---|---|
| `deepseek-v4-flash` | 64K tokens | ✗ | Fast everyday tasks |
| `deepseek-v4-pro` | 1M tokens | ✓ | Complex reasoning, large codebases |

### Prerequisites

Before you start, make sure you have:

- [VS Code](https://code.visualstudio.com/) 1.104.0 or higher
- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) extension installed and signed in
- A [DeepSeek API Key](https://platform.deepseek.com/api_keys) (free to create an account)

### Step 1 — Download the extension

Go to the [Releases page](https://github.com/ChenyuHeee/deepseek-v4-pro-copilot/releases) and download the latest `deepseek-copilot.vsix` file.

### Step 2 — Install the extension

**Option A — Via VS Code UI (recommended for beginners)**

1. Open VS Code
2. Click the **Extensions** icon in the left sidebar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Click the `···` menu at the top-right of the Extensions panel
4. Select **Install from VSIX...**
5. Choose the downloaded `deepseek-copilot.vsix` file
6. Click **Install**

**Option B — Via terminal**

```bash
code --install-extension /path/to/deepseek-copilot.vsix
```

### Step 3 — Enter your DeepSeek API key

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) to open the Command Palette
2. Type **Manage DeepSeek Provider** and press Enter
3. Paste your [DeepSeek API Key](https://platform.deepseek.com/api_keys) and press Enter

### Step 4 — Select a model and start chatting

1. Open the Copilot Chat panel (click the chat icon in the sidebar, or press `Ctrl+Alt+I` / `Cmd+Option+I`)
2. Click the model selector at the top of the chat panel
3. Choose **DeepSeek V4 Flash** or **DeepSeek V4 Pro**
4. Start chatting! 🎉

### Development

```bash
git clone https://github.com/ChenyuHeee/deepseek-v4-pro-copilot
cd deepseek-v4-pro-copilot
npm install
npm run compile
```

Press `F5` to launch an Extension Development Host.

---

<a name="中文"></a>

## 中文

在 VS Code 的 GitHub Copilot Chat 中直接使用 **DeepSeek V4 Flash** 和 **DeepSeek V4 Pro**，通过官方 [DeepSeek API](https://api-docs.deepseek.com/) 驱动。

| 模型 | 上下文长度 | 思考模式 | 适合场景 |
|---|---|---|---|
| `deepseek-v4-flash` | 64K tokens | ✗ | 日常快速任务 |
| `deepseek-v4-pro` | 1M tokens | ✓ | 复杂推理、大型代码库 |

### 使用前准备

请确认你已经具备：

- [VS Code](https://code.visualstudio.com/) 1.104.0 或更高版本
- 已安装并登录 [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) 扩展
- 一个 [DeepSeek API Key](https://platform.deepseek.com/api_keys)（注册账号免费获取）

### 第一步 — 下载插件

前往 [Releases 页面](https://github.com/ChenyuHeee/deepseek-v4-pro-copilot/releases)，下载最新版本的 `deepseek-copilot.vsix` 文件。

### 第二步 — 安装插件

**方式 A — 通过 VS Code 界面安装（推荐新手使用）**

1. 打开 VS Code
2. 点击左侧侧边栏的 **扩展** 图标（或按 `Ctrl+Shift+X` / `Cmd+Shift+X`）
3. 点击扩展面板右上角的 `···` 菜单
4. 选择 **从 VSIX 安装...**
5. 选择刚下载的 `deepseek-copilot.vsix` 文件
6. 点击 **安装**

**方式 B — 通过终端安装**

```bash
code --install-extension /path/to/deepseek-copilot.vsix
```

### 第三步 — 输入 DeepSeek API Key

1. 按 `Ctrl+Shift+P`（Windows/Linux）或 `Cmd+Shift+P`（macOS）打开命令面板
2. 输入 **Manage DeepSeek Provider** 并按回车
3. 粘贴你的 [DeepSeek API Key](https://platform.deepseek.com/api_keys) 并按回车

### 第四步 — 选择模型，开始对话

1. 打开 Copilot Chat 面板（点击侧边栏的聊天图标，或按 `Ctrl+Alt+I` / `Cmd+Option+I`）
2. 点击对话框顶部的模型选择器
3. 选择 **DeepSeek V4 Flash** 或 **DeepSeek V4 Pro**
4. 开始聊天！🎉

---

## Support & License

- Issues: https://github.com/ChenyuHeee/deepseek-v4-pro-copilot/issues
- License: MIT

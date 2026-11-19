# 可灵 AI for Pi

[English · Global setup](README.md)

在 [Pi](https://pi.dev) 中用自然语言调用可灵 AI，生成图片和视频，使用参考素材和可复用主体（Element），并查询任务进度和结果。插件内置远程 MCP 连接和创作 Skills，通过浏览器授权可灵账号。

## 快速开始

### 1. 安装插件

需要 Pi、Node.js 22.19 或更新版本，以及可灵账号。第一次使用 Pi，可先按 [Pi 快速入门](https://docs.pi.dev/latest/quickstart) 安装 Pi 并配置供 Pi 对话使用的模型。可灵账号在第 3 步单独授权。

如果以前通过仓库路径安装过，先用 `pi list` 找到该路径，再执行 `pi remove <原安装路径>`。从 1.0.5 升级的用户请先看[迁移步骤](README.md#upgrade-from-105)。

在终端运行：

```bash
pi install npm:kling-ai-pi
pi
```

### 2. 选择国内区

在 Pi 的输入框依次运行：

```text
/kling-region china
/kling-region
```

看到 `Kling AI region: china` 后，使用 [klingai.com](https://klingai.com/) 的可灵账号授权。新安装默认使用国际区 `global`，对应 [kling.ai](https://kling.ai/) 账号。已经授权过其他区域时，先按下方的步骤退出并切换。

### 3. 登录并连接

在 Pi 中执行 `/mcp-auth kling-ai`，按浏览器提示登录可灵并授权。授权完成后回到 Pi，依次运行：

```text
/mcp reconnect kling-ai
/mcp
```

在状态面板确认只有一个 `kling-ai` 连接，状态为已连接。插件会随账号区域加载对应 MCP 地址，OAuth 凭据保存在操作系统的凭据存储中。

### 4. 查询账号和灵感值

在 Pi 里发送下面这句话做一次只读验证：

```text
请用可灵 AI 插件查询当前账号和可用灵感值，只调用只读查询工具。
```

Pi 返回账号和可用灵感值，表示连接成功。

## 试着创作

| 想做什么 | 可以在 Pi 里这样说 |
| --- | --- |
| 文生图 | 用可灵 AI 生成一张 16:9 的城市夜景，雨后路面映出霓虹灯。先给我看最终参数，等我确认后再提交。 |
| 图生视频 | 用我提供的图片作首帧，生成一段 5 秒视频。镜头缓慢向前，保留原图构图。先给我看最终参数，等我确认后再提交，并查询到任务完成。 |
| 查询已有任务 | 用可灵 AI 查询任务 `<generationId>` 的当前状态。如果已经完成，请返回结果。 |

做图生视频时，把图片附到 Pi 会话里，或提供本地文件路径和参考用途。Pi 会通过 `who_am_i` 获取当前账号可用的模型和参数。生成使用个人空间的付费灵感值，确认参数后再提交。提交后可用返回的 `generationId` 查询进度和结果。

根据[国内官方指南](https://klingai.com/app/mcp/guide)，生成结果链接有效期为 24 小时，建议及时下载保存。

## 切换账号或区域

先保存进行中任务的 `generationId`，再在 Pi 中运行：

```text
/mcp logout kling-ai
/kling-region global
```

按[登录步骤](#3-登录并连接)使用国际区账号重新授权。切回国内区时用 `/kling-region china`。在同一区域换账号时，退出后直接重新授权。

| 账号区域 | Pi 插件连接地址 | 官方指南 |
| --- | --- | --- |
| 国内区 `china` | `https://klingai.com/mcp/plugin` | [国内可灵 MCP 与 CLI 指南](https://klingai.com/app/mcp/guide) |
| 国际区 `global` | `https://kling.ai/mcp/plugin` | [国际可灵 MCP 与 CLI 指南](https://kling.ai/app/mcp/guide) |

Pi 安装插件后会自动配置上表中的连接地址。其他 MCP 客户端若需要手动填写服务地址，请按对应区域的官方指南操作。

## 常见问题

- **登录后工具仍不可用**。先用 `/kling-region` 核对区域，再重新执行[登录步骤](#3-登录并连接)。远程终端可按 Pi 提示在本地浏览器授权，并将回调地址填入 Pi 的 OAuth 输入框。
- **生成提交超时**。先查询已有任务。如果有 `generationId`，用它查询；如果只有 `taskTraceId`，先保留该编号，查明提交状态后再决定是否重试。
- **启动时报 `process.cwd` 或 `uv_cwd`**。在终端执行 `cd ~`，再运行 `pi`。

# 📱 Telegram Notify Action - 增强版

[![版本](https://img.shields.io/badge/version-3.0.0-blue.svg)](#)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green.svg)](#)
[![许可证](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![测试](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#)

<!-- 语言导航 -->
<div align="center">

### 🌐 语言 / Language / Язык

| [🇺🇸 English](../en/README.md) | [🇨🇳 **中文**](README.md) | [🇷🇺 Русский](../ru/README.md) |
| :---------------------------: | :----------------------: | :---------------------------: |
|  **Complete Documentation**   |       **完整文档**       |    **Полная документация**    |

</div>

---

强大而功能丰富的 GitHub Action，用于向 Telegram 发送通知，具有高级功能，包括文件上传、**base64 支持**、**智能图像处理**、消息模板、内联键盘、重试逻辑等等。

## 🚀 功能特性

### 核心功能

- ✅ **发送和编辑消息** - 发送新消息或编辑现有消息
- 📁 **文件上传** - 发送文档、图像、视频和其他文件类型
- 🎨 **消息模板** - 为不同场景预构建的模板
- ⌨️ **内联键盘** - 带有 URL 和回调的交互式按钮
- 🔄 **重试逻辑** - 具有指数退避的自动重试
- 🌍 **多语言支持** - 支持中文、英文和俄文
- 🧵 **主题支持** - 向特定论坛主题/线程发送消息

### 高级功能

- 🎯 **条件发送** - 根据工作流状态发送通知
- 🔒 **内容保护** - 防止消息转发和保存
- 📊 **GitHub 上下文** - 自动 GitHub 变量替换
- 🎛️ **灵活配置** - 广泛的自定义选项
- 📈 **全面测试** - 具有高覆盖率的完整测试套件
- 🛡️ **错误处理** - 优雅的错误处理和详细的日志记录

### 🆕 增强的文件上传功能

- 📤 **Base64 上传** - 直接从 base64 编码数据发送文件
- 🖼️ **智能图像处理** - 自动 C2PA 元数据检测和处理
- 🎛️ **强制照片模式** - 覆盖自动文件类型转换
- 🔍 **智能文件处理** - 为 Telegram 自动优化文件类型

## 📦 快速开始

### 基础用法

```yaml
- name: 发送 Telegram 通知
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "您好，来自 GitHub Actions! 🚀"
```

### 使用模板

```yaml
- name: 成功通知
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    language: zh
    message: "部署成功完成！"
    template_vars: |
      {
        "deployStatus": "成功",
        "version": "v1.2.3"
      }
```

### 文件上传

```yaml
- name: 发送报告
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./reports/test-results.json
    file_type: document
    caption: "📊 测试结果报告"
```

### 交互式消息

```yaml
- name: 交互式通知
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "🎉 新版本已准备就绪！"
    inline_keyboard: |
      [
        {"text": "📥 下载", "url": "https://github.com/user/repo/releases/latest"},
        {"text": "📖 更新日志", "url": "https://github.com/user/repo/blob/main/CHANGELOG.md"}
      ]
```

### 🆕 Base64 文件上传

```yaml
- name: 发送生成的图像
  run: |
    # 生成或转换图像为 base64
    base64_data=$(base64 -i screenshot.png)
    echo "image_data=$base64_data" >> $GITHUB_OUTPUT
  id: convert

- name: 发送 Base64 图像
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_base64: ${{ steps.convert.outputs.image_data }}
    file_name: "screenshot.png"
    file_type: "photo"
    caption: "📸 生成的截图"
```

### 🖼️ 智能图像处理

```yaml
- name: 发送带 C2PA 处理的图像
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./image-with-metadata.png
    file_type: "photo"
    # 检测到 C2PA 元数据时自动转换为文档
    caption: "🖼️ 智能处理的图像"

- name: 强制作为照片发送
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./image-with-metadata.png
    file_type: "photo"
    force_as_photo: "true" # 即使有 C2PA 元数据也强制作为照片
    caption: "🖼️ 强制作为照片（可能有处理问题）"
```

## 🤖 AI 驱动的自动集成
*📄 [AI 集成规则](../../.ai-integration-rules) | [在线最新规则](https://github.com/asychin/telegram-notify-action/blob/main/.ai-integration-rules)*

**v3 新功能！** 让 AI 自动将 `telegram-notify-action` 集成到您的仓库中，并进行最佳配置。

### 🧠 智能分析

AI 集成系统会自动分析您的仓库以：

- 🔍 **检测项目类型** - Node.js、Python、Go、Docker、Kubernetes 等
- 📋 **分析现有工作流** - 了解您当前的 CI/CD 管道
- 🎯 **识别部署模式** - 简单、复杂或企业级部署
- 🔒 **检查安全设置** - 扫描现有的 Telegram 密钥和配置

### 💬 交互式配置

系统会智能地询问您：

#### 通知偏好

- **基础** - 简单的成功/失败通知
- **详细** - 包括提交信息、分支、持续时间
- **动态** - 实时更新与进度跟踪
- **全面** - 完整的管道与统计信息

#### 视觉格式

- **最小** - 仅文本通知
- **标准** - 基本状态表情符号
- **丰富** - 增强的表情符号和格式
- **动画** - 进度条和动态指示器

#### 交付风格

- **分离** - 每个阶段的单独消息
- **更新** - 带有进度更新的单条消息
- **线程** - 主题中的线程消息
- **混合** - 组合更新与最终摘要

### 🎯 智能模板选择

基于您的项目结构，AI 自动选择最佳模板：

| 项目类型     | 推荐模板           | 功能              |
| ------------ | ------------------ | ----------------- |
| **基础项目** | `success`/`error`  | 简单状态通知      |
| **标准项目** | `deploy`           | 构建 + 部署与统计 |
| **企业级**   | `comprehensive`    | 多阶段与进度跟踪  |
| **微服务**   | `service-specific` | 按服务通知        |

### 🛠️ 集成策略

#### 非破坏性集成

- ✅ 保留现有工作流结构
- ✅ 添加通知而不破坏更改
- ✅ 条件通知（仅成功/失败）

#### 增强集成

- 🔄 作业间实时进度跟踪
- 📊 动态消息更新与统计
- ⏱️ 部署时间和性能指标

#### 企业集成

- 🌍 多环境通知
- 🎯 按服务进度跟踪
- 🛡️ 高级故障分析和调试
- 🔄 回滚通知和健康检查

### 📋 自动 PR 生成

AI 系统创建全面的 Pull Request：

```markdown
🔔 使用 telegram-notify-action@v3 添加 Telegram 通知

## 📋 已添加内容:

- [x] 智能部署通知
- [x] 实时进度更新
- [x] 丰富的表情符号格式
- [x] 安全的密钥配置

## ⚙️ 需要设置:

1. 将 `TELEGRAM_BOT_TOKEN` 添加到仓库密钥
2. 将 `TELEGRAM_CHAT_ID` 添加到仓库密钥
3. 审查和自定义通知偏好

## 🧪 测试:

- 测试通知将发送到指定聊天
- 使用分期部署验证配置
```

### 🔒 安全与最佳实践

AI 集成确保：

- 🛡️ **从不暴露令牌** 在代码或日志中
- 🔐 **使用仓库密钥** 处理所有敏感数据
- 📊 **清理错误消息** 防止数据泄露
- ⚡ **最小性能影响** 对现有工作流

### 🚀 开始使用 AI 集成

> **即将推出：** AI 驱动的集成将通过 GitHub Marketplace 和独立工具提供。敬请期待更新！

目前，请使用上述全面的手动集成示例，或联系我们获取企业 AI 集成服务。

## 📖 输入参数

### 必需参数

| 参数             | 描述                | 示例                                |
| ---------------- | ------------------- | ----------------------------------- |
| `telegram_token` | Telegram 机器人令牌 | `${{ secrets.TELEGRAM_BOT_TOKEN }}` |
| `chat_id`        | Telegram 聊天 ID    | `${{ secrets.TELEGRAM_CHAT_ID }}`   |

### 消息参数

| 参数                       | 描述         | 默认值  | 示例                             |
| -------------------------- | ------------ | ------- | -------------------------------- |
| `message`                  | 消息文本     | -       | `"你好世界!"`                    |
| `parse_mode`               | 消息解析模式 | `HTML`  | `HTML`, `Markdown`, `MarkdownV2` |
| `disable_web_page_preview` | 禁用链接预览 | `true`  | `true`, `false`                  |
| `disable_notification`     | 静默发送     | `false` | `true`, `false`                  |
| `language`                 | 界面语言     | `en`    | `en`, `ru`, `zh`                 |

### 高级消息参数

| 参数                          | 描述                   | 默认值  | 示例            |
| ----------------------------- | ---------------------- | ------- | --------------- |
| `message_thread_id`           | 论坛主题 ID            | -       | `123`           |
| `message_id`                  | 要编辑的消息 ID        | -       | `456`           |
| `reply_to_message_id`         | 回复消息 ID            | -       | `789`           |
| `protect_content`             | 保护内容免受转发       | `false` | `true`, `false` |
| `allow_sending_without_reply` | 如果回复目标丢失则发送 | `true`  | `true`, `false` |
| `message_effect_id`           | 消息效果 ID            | -       | `effect_id`     |
| `business_connection_id`      | 商业连接 ID            | -       | `business_id`   |

### 文件上传参数

| 参数             | 描述                       | 默认值     | 示例                                  |
| ---------------- | -------------------------- | ---------- | ------------------------------------- |
| `file_path`      | 文件路径                   | -          | `./report.pdf`                        |
| `file_base64`    | Base64 编码的文件内容      | -          | `iVBORw0KGgoAAAANSUhEUgAAAA...`       |
| `file_name`      | 文件名（base64 时必需）    | -          | `"screenshot.png"`                    |
| `file_type`      | 文件类型                   | `document` | `photo`, `document`, `video`, `audio` |
| `force_as_photo` | 即使有元数据也强制作为照片 | `false`    | `true`, `false`                       |
| `caption`        | 文件说明                   | -          | `"📊 报告"`                           |

> **注意**: 使用 `file_path` 或 `file_base64` 中的一个（不能同时使用）。使用 `file_base64` 时，`file_name` 是必需的。

### 模板参数

| 参数            | 描述             | 默认值 | 示例                                                               |
| --------------- | ---------------- | ------ | ------------------------------------------------------------------ |
| `template`      | 模板名称         | -      | `success`, `error`, `warning`, `info`, `deploy`, `test`, `release` |
| `template_vars` | 模板变量（JSON） | `{}`   | `{"version": "v1.0.0"}`                                            |

### 交互功能

| 参数              | 描述             | 默认值 | 示例                                               |
| ----------------- | ---------------- | ------ | -------------------------------------------------- |
| `inline_keyboard` | 内联键盘（JSON） | -      | `[{"text": "按钮", "url": "https://example.com"}]` |

### 重试配置

| 参数                     | 描述                     | 默认值 | 示例 |
| ------------------------ | ------------------------ | ------ | ---- |
| `max_retries`            | 常规错误最大重试次数     | `5`    | `5`  |
| `retry_delay`            | 初始重试延迟（秒）       | `1`    | `2`  |
| `max_rate_limit_retries` | 速率限制错误最大重试次数 | `8`    | `10` |

### 条件发送

| 参数              | 描述           | 默认值  | 示例            |
| ----------------- | -------------- | ------- | --------------- |
| `send_on_failure` | 仅在失败时发送 | `false` | `true`, `false` |
| `send_on_success` | 仅在成功时发送 | `false` | `true`, `false` |

## 📤 输出参数

| 参数          | 描述                 | 示例                             |
| ------------- | -------------------- | -------------------------------- |
| `message_id`  | 已发送/编辑消息的 ID | `123456`                         |
| `success`     | 操作成功状态         | `true`, `false`                  |
| `file_id`     | 上传文件的 ID        | `BAADBAADrwADBREAAYag2eLJxJVvAg` |
| `retry_count` | 重试次数             | `2`                              |

## 🖼️ 智能图像处理

此 action 包含智能图像处理功能，以更好地兼容 Telegram：

### C2PA 元数据检测

该 action 自动检测 PNG 图像中的 C2PA（内容来源和真实性联盟）元数据，这些元数据在作为照片发送到 Telegram 时可能会导致处理问题。

#### 默认行为（推荐）

```yaml
- name: 智能图像上传
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: "image-with-metadata.png"
    file_type: "photo"
    # 检测到 C2PA 元数据时自动转换为"文档"
```

#### 强制作为照片（谨慎使用）

```yaml
- name: 强制照片上传
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: "image-with-metadata.png"
    file_type: "photo"
    force_as_photo: "true" # ⚠️ 可能导致处理问题
```

### 何时使用 `force_as_photo`

- ✅ **使用时机**: 需要图像在 Telegram 聊天中显示为照片
- ❌ **避免时机**: 图像包含 C2PA 元数据（默认处理更安全）
- ⚠️ **警告**: 带有元数据的强制照片可能在 Telegram 端处理失败

### Base64 处理

Base64 上传支持相同的智能处理：

```yaml
- name: 带智能处理的 Base64
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_base64: ${{ steps.convert.outputs.image_data }}
    file_name: "generated-image.png"
    file_type: "photo"
    # 相同的 C2PA 检测适用于 base64 数据
```

## 🎨 消息模板

📚 **[完整模板系统文档 →](TEMPLATE-SYSTEM.md)**

该 action 包含用于常见场景的预构建模板：

### 可用模板

| 模板      | 描述         | 使用场景               |
| --------- | ------------ | ---------------------- |
| `success` | 成功通知     | 成功的部署、构建       |
| `error`   | 错误通知     | 失败的工作流、关键问题 |
| `warning` | 警告通知     | 非关键问题、弃用       |
| `info`    | 信息通知     | 一般更新、公告         |
| `deploy`  | 部署通知     | 应用程序部署           |
| `test`    | 测试结果通知 | 测试套件结果           |
| `release` | 发布通知     | 新版本、版本更新       |

### 模板变量

模板支持使用 `{{variable}}` 语法进行变量替换：

```yaml
template_vars: |
  {
    "version": "v2.0.0",
    "deployStatus": "成功",
    "testStatus": "通过",
    "coverage": "95%",
    "customMessage": "附加信息"
  }
```

### 自动变量

Action 提供三种类型的自动变量：

#### GitHub 上下文变量

基本的 GitHub 工作流信息自动可用：

- `repository` - 仓库名称 (`user/repo`)
- `refName` - 分支/标签名称 (`main`, `develop`)
- `sha` - 完整提交 SHA
- `shortSha` - 短提交 SHA（7 个字符）
- `actor` - 触发工作流的用户
- `workflow` - 工作流名称
- `job` - 作业名称
- `runId` - 工作流运行 ID
- `runNumber` - 工作流运行编号
- `eventName` - 触发工作流的事件
- `repositoryName` - 仅仓库名称（不含所有者）
- `repositoryOwnerName` - 仅仓库所有者名称

#### 事件上下文变量（v3 新功能）

基于 GitHub 事件类型自动提取的特定事件变量：

**对于 `issues` 事件：**

- `author` - Issue 作者
- `issueNumber` - Issue 编号
- `issueTitle` - Issue 标题
- `issueState` - Issue 状态
- `issueBody` - Issue 描述
- `labels` - 逗号分隔的标签列表
- `assignees` - 逗号分隔的受理人列表
- `createdAt` - Issue 创建日期
- `updatedAt` - Issue 最后更新日期

**对于 `pull_request` 事件：**

- `author` - PR 作者
- `prNumber` - Pull Request 编号
- `prTitle` - Pull Request 标题
- `prState` - Pull Request 状态
- `prBody` - Pull Request 描述
- `prUrl` - Pull Request URL
- `baseBranch` - 目标分支
- `headBranch` - 源分支
- `isDraft` - 是否为草稿
- `mergeable` - 是否可合并
- `labels` - 逗号分隔的标签列表
- `assignees` - 逗号分隔的受理人列表

**对于 `push` 事件：**

- `pusher` - 推送用户
- `commitCount` - 提交数量
- `lastCommitMessage` - 最后一次提交消息
- `lastCommitAuthor` - 最后一次提交作者
- `lastCommitId` - 最后一次提交 ID

**对于 `release` 事件：**

- `releaseAuthor` - 发布作者
- `releaseName` - 发布名称
- `releaseTag` - 发布标签
- `releaseBody` - 发布说明
- `isPrerelease` - 是否为预发布
- `isDraft` - 是否为草稿
- `releaseCreatedAt` - 发布创建日期

**对于 `workflow_run` 事件：**

- `workflowName` - 工作流名称
- `workflowStatus` - 工作流状态
- `workflowConclusion` - 工作流结论
- `workflowId` - 工作流 ID
- `workflowRunNumber` - 工作流运行编号
- `workflowActor` - 工作流执行者

#### URL 变量（v3 新功能）

现成可用的 GitHub URL：

- `runUrl` - 当前工作流运行 URL
- `commitUrl` - 当前提交 URL
- `workflowUrl` - 工作流定义 URL
- `compareUrl` - 与基础分支的比较 URL
- `issuesUrl` - 仓库 Issues 页面 URL
- `pullRequestsUrl` - 仓库 Pull Requests 页面 URL
- `releasesUrl` - 仓库发布页面 URL

> **注意**：所有这些变量在模板中自动可用，无需手动配置！

## 📁 文件上传支持

### 支持的文件类型

| 类型         | 描述                    | 最大大小 |
| ------------ | ----------------------- | -------- |
| `photo`      | 图像（JPEG、PNG、WebP） | 10 MB    |
| `document`   | 任何文件类型            | 50 MB    |
| `video`      | 视频文件                | 50 MB    |
| `audio`      | 音频文件                | 50 MB    |
| `animation`  | GIF 动画                | 50 MB    |
| `voice`      | 语音消息                | 50 MB    |
| `video_note` | 视频笔记                | 50 MB    |
| `sticker`    | 贴纸文件                | 50 MB    |

### 文件上传示例

```yaml
- name: 上传测试结果
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./test-results.html
    file_type: document
    caption: |
      📊 **测试结果**

      生成时间: $(date)
      覆盖率: 95%
      状态: ✅ 通过
```

## ⌨️ 内联键盘

创建带有可点击按钮的交互式消息：

### 按钮类型

- **URL 按钮** - 打开外部链接
- **回调按钮** - 触发机器人回调（需要机器人处理）

### 键盘格式

```json
[
  [
    { "text": "按钮 1", "url": "https://example1.com" },
    { "text": "按钮 2", "url": "https://example2.com" }
  ],
  [{ "text": "全宽按钮", "url": "https://example3.com" }]
]
```

### 使用示例

```yaml
inline_keyboard: |
  [
    [
      {"text": "📊 查看工作流", "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"},
      {"text": "📝 查看提交", "url": "${{ github.server_url }}/${{ github.repository }}/commit/${{ github.sha }}"}
    ],
    [
      {"text": "🐛 报告问题", "url": "${{ github.server_url }}/${{ github.repository }}/issues/new"}
    ]
  ]
```

## 🔄 重试逻辑

该 action 包含具有指数退避的自动重试功能：

### 配置

```yaml
max_retries: 5 # 最大重试次数
retry_delay: 2 # 初始延迟（秒）（每次重试翻倍）
```

### 重试行为

1. **初始尝试** - 立即尝试发送
2. **第一次重试** - 等待 `retry_delay` 秒
3. **第二次重试** - 等待 `retry_delay * 2` 秒
4. **第三次重试** - 等待 `retry_delay * 4` 秒
5. **继续** - 直到达到 `max_retries`

## 🎯 条件发送

仅在满足特定条件时发送通知：

### 仅在失败时发送

```yaml
- name: 失败通知
  if: failure()
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: error
    language: zh
    message: "工作流失败！请检查日志。"
    send_on_failure: true
```

### 仅在成功时发送

```yaml
- name: 成功通知
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    language: zh
    message: "部署成功完成！"
    send_on_success: true
```

## 🌍 多语言支持

该 action 支持系统消息的多种语言：

### 支持的语言

- `en` - 英文（默认）
- `ru` - 俄文
- `zh` - 中文

### 使用方法

```yaml
language: zh # 使用中文界面
```

## 🛠️ 设置说明

### 1. 创建 Telegram 机器人

1. 在 Telegram 上向 [@BotFather](https://t.me/BotFather) 发送消息
2. 发送 `/newbot` 并按照说明操作
3. 保存机器人令牌

### 2. 获取聊天 ID

**个人聊天：**

1. 向您的机器人发送消息
2. 访问 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. 在响应中找到您的聊天 ID

**群组聊天：**

1. 将机器人添加到群组
2. 发送一条提及机器人的消息
3. 访问 getUpdates URL
4. 找到群组聊天 ID（负数）

### 3. 配置 GitHub 密钥

将这些密钥添加到您的仓库：

- `TELEGRAM_BOT_TOKEN` - 您的机器人令牌
- `TELEGRAM_CHAT_ID` - 您的聊天 ID

## 📝 示例

### 完整的 CI/CD 工作流

```yaml
name: 带 Telegram 通知的 CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 运行测试
        run: npm test
        id: tests

      - name: 测试结果
        if: always()
        uses: asychin/telegram-notify-action@v3
        with:
          telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          template: ${{ steps.tests.outcome == 'success' && 'test' || 'error' }}
          language: zh
          message: |
            🧪 **测试结果**

            状态: ${{ steps.tests.outcome }}
            分支: ${{ github.ref_name }}
            提交: ${{ github.sha }}
          template_vars: |
            {
              "testStatus": "${{ steps.tests.outcome }}",
              "coverage": "95%"
            }
          inline_keyboard: |
            [
              {"text": "📊 查看详情", "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}
            ]

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 部署
        run: echo "部署中..."
        id: deploy

      - name: 部署通知
        uses: asychin/telegram-notify-action@v3
        with:
          telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          template: deploy
          language: zh
          message: "🚀 生产环境部署完成！"
          template_vars: |
            {
              "deployStatus": "成功",
              "version": "v1.0.0"
            }
```

### 带报告的文件上传

```yaml
- name: 生成报告
  run: |
    echo "生成测试报告..."
    npm run test:report

- name: 发送报告
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./reports/test-report.html
    file_type: document
    caption: |
      📊 **测试报告**

      生成时间: $(date)
      测试: 150 通过，0 失败
      覆盖率: 95.2%
    inline_keyboard: |
      [
        {"text": "📈 在线查看", "url": "https://your-site.com/reports"}
      ]
```

### 消息编辑

```yaml
- name: 开始进程
  id: start
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "⏳ 开始部署进程..."

- name: 部署应用程序
  run: |
    echo "部署中..."
    sleep 30
    echo "部署完成！"

- name: 更新状态
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message_id: ${{ steps.start.outputs.message_id }}
    message: |
      ✅ **部署完成！**

      持续时间: 30 秒
      状态: 成功
      版本: v1.2.3
    inline_keyboard: |
      [
        {"text": "🌐 查看网站", "url": "https://your-site.com"}
      ]
```

## 🧪 测试

该 action 包含全面的测试：

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 运行覆盖率测试
npm run test:coverage

# 运行代码检查
npm run lint
```

## 🤝 贡献

1. Fork 仓库
2. 创建您的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交您的更改（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

## 📄 许可证

此项目使用 MIT 许可证 - 有关详细信息，请参阅 [LICENSE](../../LICENSE) 文件。

## 🐛 故障排除

### 常见问题

**机器人没有响应:**

- 验证机器人令牌是否正确
- 确保机器人没有被阻止
- 检查机器人是否有必要的权限

**文件上传失败:**

- 检查文件大小限制
- 验证文件路径是否正确
- 确保支持文件类型

**模板不工作:**

- 验证模板名称是否正确
- 检查 template_vars JSON 格式
- 确保提供了所有必需的变量

**重试逻辑不工作:**

- 检查网络连接
- 验证重试配置
- 查看错误日志获取详细信息

### 调试模式

通过在您的仓库中将 `ACTIONS_STEP_DEBUG` 密钥设置为 `true` 来启用调试日志记录。

## 🆕 v3.0.0 新功能

### 🎯 自动事件上下文（新功能！）

- **智能事件检测** - 根据 GitHub 事件类型自动提取相关变量
- **Issue 变量** - 对于 `issues` 事件自动提供作者、标题、标签、受理人
- **PR 变量** - 对于 `pull_request` 事件提供 PR 详情、分支、草稿状态
- **Push 变量** - 对于 `push` 事件提供提交数量、最后提交信息
- **Release 变量** - 对于 `release` 事件提供发布详情、说明、标签
- **无需配置** - 所有变量无需手动设置即可使用

### 🌐 现成可用的 URL 变量（新功能！）

- **预构建 URL** - `{{runUrl}}`、`{{commitUrl}}`、`{{workflowUrl}}` 等
- **简化模板** - 无需手动构建 URL
- **一致格式** - 所有 URL 遵循相同模式
- **GitHub 企业版支持** - 与自定义 GitHub 服务器兼容

### 🔄 增强的重试逻辑

- **分离速率限制** - 速率限制错误的独立重试计数器
- **智能退避** - 针对不同错误类型的不同策略
- **可配置限制** - `max_rate_limit_retries` 参数
- **更好的错误消息** - 更丰富的重试日志

### 📤 增强的文件上传

- 📤 **Base64 上传支持** - 直接从 base64 编码数据发送文件
- 🖼️ **智能图像处理** - 自动 C2PA 元数据检测
- 🎛️ **强制照片模式** - 使用 `force_as_photo` 覆盖自动文件类型转换
- 🔍 **智能处理** - 优化文件处理以更好地兼容 Telegram

### 🛡️ 高级安全和功能

- 🔒 **业务连接** - 支持 Telegram Business API
- ✨ **消息效果** - 支持消息效果（星星、心形等）
- 📊 **扩展的 GitHub 上下文** - 20+ 额外的 GitHub 变量可用
- 🏃 **Runner 信息** - 操作系统、架构、环境详情

### 🧪 测试和质量

- ✅ **全面的测试套件** 覆盖所有功能
- 🛡️ **健壮的错误处理** 用于所有边缘情况
- 📊 **增强的验证** 用于所有参数
- 🔧 **更好的调试** 包含详细日志

### 📖 文档

- 📚 **完全重写** - 所有文档为 v3 更新
- 🌍 **多语言** - 英文、俄文、中文文档
- 📋 **更多示例** - 所有功能的广泛使用示例
- 🎯 **清晰的迁移指南** - 从 v2 轻松升级

## 📞 支持

- 📖 [文档](README.md)
- 🎨 [模板系统指南](TEMPLATE-SYSTEM.md)
- 🐛 [报告问题](https://github.com/asychin/telegram-notify-action/issues)
- 💬 [讨论](https://github.com/asychin/telegram-notify-action/discussions)
- 📧 [联系](mailto:moloko@skofey.com)

## 🙏 致谢

- 感谢所有贡献者
- 受 GitHub Actions 社区启发
- 为开发者用 ❤️ 构建

---

**由 [Sychin Andrey](https://github.com/asychin) 用 ❤️ 制作**

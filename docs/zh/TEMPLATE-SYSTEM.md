# 🎨 Telegram Notify Action 模板系统

<!-- 语言导航 -->
<div align="center">

### 🌐 语言 / Language / Язык

| [🇺🇸 English](../en/TEMPLATE-SYSTEM.md) | [🇨🇳 **中文**](TEMPLATE-SYSTEM.md) | [🇷🇺 Русский](../ru/TEMPLATE-SYSTEM.md) |
| :------------------------------------: | :-------------------------------: | :------------------------------------: |
|       **Template System Guide**        |         **模板系统指南**          |  **Руководство по системе шаблонов**   |

</div>

---

用于创建动态 Telegram 通知的模板系统完整指南。

## 📖 目录

- [模板系统概述](#-模板系统概述)
- [预构建模板](#-预构建模板)
- [变量语法](#-变量语法)
- [可用变量](#-可用变量)
- [多语言支持](#-多语言支持)
- [使用示例](#-使用示例)
- [创建自定义消息](#-创建自定义消息)
- [HTML 标记](#-html-标记)
- [最佳实践](#-最佳实践)
- [模板调试](#-模板调试)

## 🚀 模板系统概述

Telegram Notify Action 模板系统支持通过自动变量替换创建动态消息。每个模板支持：

- **GitHub 上下文变量** - 自动可用的工作流数据
- **自定义变量** - 通过 `template_vars` 传递的数据
- **多语言支持** - 中文、英文和俄文
- **HTML 标记** - Telegram 兼容的格式化支持

### 模板引擎架构

```mermaid
graph TD
    A[输入数据] --> B[模板选择]
    B --> C[模板加载]
    C --> D[变量合并]
    D --> E[值替换]
    E --> F[HTML 清理]
    F --> G[最终消息]

    H[GitHub 上下文] --> D
    I[模板变量] --> D
    J[自定义消息] --> D
```

## 📋 预构建模板

### `success` - 成功执行

用于成功完成流程的通知。

**中文：**

```html
✅ <b>成功</b>

仓库: {{repository}} 分支: {{refName}} 提交: {{sha}} 执行者: {{actor}} 工作流:
{{workflow}} {{customMessage}}
```

### `error` - 执行错误

用于错误和失败通知。

**中文：**

```html
❌ <b>错误</b>

仓库: {{repository}} 分支: {{refName}} 提交: {{sha}} 执行者: {{actor}} 工作流:
{{workflow}} 任务状态: {{jobStatus}} {{customMessage}}
```

### `warning` - 警告通知

用于非关键警告。

**中文：**

```html
⚠️ <b>警告</b>

仓库: {{repository}} 分支: {{refName}} 工作流: {{workflow}} {{customMessage}}
```

### `info` - 信息消息

用于一般通知和信息。

**中文：**

```html
ℹ️ <b>信息</b>

仓库: {{repository}} 分支: {{refName}} 执行者: {{actor}} {{customMessage}}
```

### `deploy` - 部署

用于应用程序部署通知。

**中文：**

```html
🚀 <b>部署</b>

仓库: {{repository}} 分支: {{refName}} 提交: {{sha}} 运行: #{{runNumber}}
部署者: {{actor}} 状态: {{deployStatus}} {{customMessage}}
```

### `test` - 测试结果

用于测试报告。

**中文：**

```html
🧪 <b>测试结果</b>

仓库: {{repository}} 分支: {{refName}} 提交: {{sha}} 运行: #{{runNumber}}
测试状态: {{testStatus}} 覆盖率: {{coverage}} {{customMessage}}
```

### `release` - 新版本发布

用于新版本发布通知。

**中文：**

```html
🎉 <b>新版本发布</b>

仓库: {{repository}} 版本: {{version}} 标签: {{tag}} 发布者: {{actor}}
{{releaseNotes}} {{customMessage}}
```

## 🔧 变量语法

模板中的变量使用双花括号语法：

```text
{{变量名}}
```

### 替换规则

1. **找到变量** - 替换为值
2. **未找到变量** - 保持原样 (`{{unknownVar}}`)
3. **空值** - 替换为空字符串

### 处理示例

**模板：**

```html
仓库: {{repository}} 未知: {{unknownVariable}} 空值: {{emptyValue}}
```

**变量：**

```json
{
  "repository": "user/repo",
  "emptyValue": ""
}
```

**结果：**

```html
仓库: user/repo 未知: {{unknownVariable}} 空值:
```

## 📊 可用变量

### GitHub 上下文（自动可用）

| 变量         | 描述          | 示例                   |
| ------------ | ------------- | ---------------------- |
| `repository` | 仓库名称      | `user/awesome-project` |
| `refName`    | 分支/标签名称 | `main`, `feature/auth` |
| `sha`        | 提交 SHA      | `a1b2c3d4e5f6...`      |
| `actor`      | 用户          | `john-doe`             |
| `workflow`   | 工作流名称    | `CI/CD Pipeline`       |
| `job`        | 作业名称      | `build-and-test`       |
| `runId`      | 工作流运行 ID | `123456789`            |
| `runNumber`  | 运行编号      | `42`                   |
| `eventName`  | 触发事件      | `push`, `pull_request` |
| `jobStatus`  | 作业状态      | `success`, `failure`   |

### URL 变量（自动可用）

用于内联键盘和消息的现成链接：

| 变量              | 描述           | 示例                                                    |
| ----------------- | -------------- | ------------------------------------------------------- |
| `workflowUrl`     | 工作流链接     | `https://github.com/user/repo/actions/workflows/ci.yml` |
| `runUrl`          | 当前运行链接   | `https://github.com/user/repo/actions/runs/123456`      |
| `commitUrl`       | 提交链接       | `https://github.com/user/repo/commit/abc123...`         |
| `compareUrl`      | 与基础分支比较 | `https://github.com/user/repo/compare/main...feature`   |
| `issuesUrl`       | Issues 页面    | `https://github.com/user/repo/issues`                   |
| `pullRequestsUrl` | PR 页面        | `https://github.com/user/repo/pulls`                    |
| `releasesUrl`     | 发布页面       | `https://github.com/user/repo/releases`                 |

### 格式化变量（自动可用）

| 变量                  | 描述                 | 示例                     |
| --------------------- | -------------------- | ------------------------ |
| `shortSha`            | 短 SHA（7 字符）     | `abc1234`                |
| `repositoryName`      | 仓库名称（仅名称）   | `telegram-notify-action` |
| `repositoryOwnerName` | 所有者名称（仅名称） | `asychin`                |

### 系统变量（自动可用）

| 变量         | 描述              | 示例                             |
| ------------ | ----------------- | -------------------------------- |
| `serverUrl`  | GitHub 服务器 URL | `https://github.com`             |
| `workspace`  | 工作空间路径      | `/home/runner/work/repo`         |
| `runnerOs`   | 运行器操作系统    | `Linux`                          |
| `runnerArch` | 运行器架构        | `X64`                            |
| `jobId`      | 当前作业 ID       | `1234567`                        |
| `actionPath` | Action 路径       | `/home/runner/work/_actions/...` |

### 特殊变量

| 变量            | 描述                 | 使用     |
| --------------- | -------------------- | -------- |
| `customMessage` | `message` 参数的内容 | 附加文本 |

### 自定义变量

通过 `template_vars` 参数以 JSON 格式传递：

```yaml
template_vars: |
  {
    "version": "v2.1.0",
    "environment": "production",
    "deployStatus": "成功",
    "testStatus": "通过",
    "coverage": "95%",
    "duration": "3分45秒"
  }
```

## 🌍 多语言支持

### 语言选择

模板语言由 `language` 参数确定：

```yaml
language: en  # English
language: ru  # Русский
language: zh  # 中文（默认如上）
```

### 支持的语言

- **English (`en`)** - 所有模板的完整支持
- **Russian (`ru`)** - 所有模板的完整支持
- **中文 (`zh`)** - 所有模板的完整支持

### 回退机制

如果指定语言的模板未找到，将使用英文版本。

## 💡 使用示例

### 基本模板使用

```yaml
- name: 成功通知
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    message: "部署成功完成！"
    language: zh
```

### 带自定义变量的模板

```yaml
- name: 测试结果
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: test
    message: "所有测试通过！🎉"
    language: zh
    template_vars: |
      {
        "testStatus": "✅ 全部通过",
        "coverage": "95.8%",
        "duration": "2分34秒",
        "failedTests": "0",
        "totalTests": "127"
      }
```

### 带详细信息的部署模板

```yaml
- name: 部署通知
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: deploy
    language: zh
    message: |
      🎯 **部署详情：**

      - 环境：生产环境
      - 数据库已迁移：✅
      - CDN 缓存已清理：✅
      - 健康检查：✅
    template_vars: |
      {
        "deployStatus": "✅ 成功",
        "version": "${{ github.ref_name }}",
        "environment": "生产环境",
        "deployTime": "3分45秒"
      }
```

### 条件模板使用

```yaml
- name: 条件模板
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: ${{ job.status == 'success' && 'success' || 'error' }}
    message: ${{ job.status == 'success' && '一切正常！' || '出现问题了！' }}
    language: zh
    template_vars: |
      {
        "status": "${{ job.status }}",
        "conclusion": "${{ job.conclusion }}"
      }
```

### 使用 URL 变量创建内联键盘

```yaml
- name: 带链接的增强通知
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    message: |
      ✅ **构建成功！**

      仓库：{{repositoryName}}
      提交：{{shortSha}} 由 {{actor}}
      分支：{{refName}}
    inline_keyboard: |
      [
        {"text": "🔗 查看提交", "url": "${{ github.server_url }}/${{ github.repository }}/commit/${{ github.sha }}"},
        {"text": "📊 查看运行", "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"},
        {"text": "🏠 仓库", "url": "${{ github.server_url }}/${{ github.repository }}"}
      ]
```

**URL 变量的优势：**

- **简化语法**：使用 `{{runUrl}}` 而不是 `${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}`
- **一致格式**：无需手动构建 URL
- **即用即得**：在所有模板中可用，无需额外配置

> **注意**：URL 变量如 `{{runUrl}}`、`{{commitUrl}}` 仅在**消息文本**中有效，不适用于 `inline_keyboard`。对于内联键盘，请使用 GitHub Actions 变量或通过 `template_vars` 传递 URL。

## 🎨 创建自定义消息

### 不使用模板

```yaml
- name: 自定义消息
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: |
      🔧 <b>自定义通知</b>

      仓库：${{ github.repository }}
      分支：${{ github.ref_name }}
      触发者：${{ github.actor }}

      这里是自定义详情...
```

### 结合模板和自定义消息

```yaml
- name: 增强模板
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    language: zh
    message: |
      <b>部署摘要：</b>
      - 更新的服务：5个
      - 停机时间：0秒
      - 性能提升：+15%

      <a href="https://app.example.com">🌐 打开应用</a>
    template_vars: |
      {
        "deployStatus": "零停机成功"
      }
```

## 📝 HTML 标记

### 支持的标签

Telegram 支持有限的 HTML 标签集：

| 标签                       | 描述     | 示例                                     |
| -------------------------- | -------- | ---------------------------------------- |
| `<b>`, `<strong>`          | 粗体文本 | `<b>重要</b>`                            |
| `<i>`, `<em>`              | 斜体文本 | `<i>强调</i>`                            |
| `<u>`, `<ins>`             | 下划线   | `<u>下划线</u>`                          |
| `<s>`, `<strike>`, `<del>` | 删除线   | `<s>已删除</s>`                          |
| `<span>`                   | 容器     | `<span class="tg-spoiler">剧透</span>`   |
| `<tg-spoiler>`             | 剧透     | `<tg-spoiler>隐藏文本</tg-spoiler>`      |
| `<a>`                      | 链接     | `<a href="https://example.com">链接</a>` |
| `<code>`                   | 内联代码 | `<code>console.log()</code>`             |
| `<pre>`                    | 代码块   | `<pre>function() { ... }</pre>`          |

### 自动清理

系统自动删除不支持的标签：

**输入文本：**

```html
<div class="container">
  <h1>标题</h1>
  <b>粗体文本</b>
  <script>
    alert("hack");
  </script>
</div>
```

**结果：**

```html
标题 <b>粗体文本</b>
```

### 格式化示例

```html
🎯 <b>部署状态</b>

<i>环境：</i> <code>production</code> <i>版本：</i> <code>{{version}}</code>
<i>状态：</i> <b>{{deployStatus}}</b>

<a href="https://app.example.com">🌐 打开应用</a>

<pre>
构建时间：{{buildTime}}
部署时间：{{deployTime}}
总时间：{{totalTime}}
</pre>

<tg-spoiler>秘密部署密钥：{{secretKey}}</tg-spoiler>
```

## 🏆 最佳实践

### 1. 变量命名

```yaml
# ✅ 好 - 描述性名称
template_vars: |
  {
    "deploymentStatus": "成功",
    "buildDuration": "3分45秒",
    "testCoverage": "95.8%"
  }

# ❌ 差 - 不清楚的名称
template_vars: |
  {
    "status": "ok",
    "time": "3:45",
    "percent": "95.8"
  }
```

### 2. 消息结构

```yaml
# ✅ 好 - 清晰的结构
message: |
  <b>📊 构建摘要</b>

  <i>状态：</i> {{buildStatus}}
  <i>持续时间：</i> {{buildDuration}}
  <i>测试：</i> {{testResults}}

  <b>🚀 下一步：</b>
  {{nextSteps}}

# ❌ 差 - 无结构
message: "构建 {{buildStatus}} 耗时 {{buildDuration}} 测试 {{testResults}} 下一步 {{nextSteps}}"
```

### 3. 错误处理

```yaml
# ✅ 好 - 条件检查
template_vars: |
  {
    "testStatus": "${{ steps.test.outcome == 'success' && '✅ 通过' || '❌ 失败' }}",
    "coverage": "${{ steps.coverage.outputs.percentage || '不适用' }}"
  }
```

### 4. 使用表情符号

```yaml
# ✅ 好 - 适度使用
message: "🎉 部署成功！版本 {{version}} 现已上线。"

# ❌ 差 - 过度使用表情符号
message: "🎉🚀✨🎯 部署 🎊🎈 成功！🌟⭐ 版本 {{version}} 🎁🎀 现已上线！🔥💯"
```

## 🔍 模板调试

### 启用调试模式

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

### 检查变量

```yaml
- name: 调试模板变量
  run: |
    echo "仓库：${{ github.repository }}"
    echo "引用：${{ github.ref_name }}"
    echo "执行者：${{ github.actor }}"
    echo "作业状态：${{ job.status }}"
```

### 测试模板

```yaml
- name: 模板测试
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: test
    language: zh
    message: "测试模板系统"
    template_vars: |
      {
        "testMode": true,
        "debugInfo": "模板变量测试",
        "timestamp": "${{ github.run_number }}"
      }
```

### JSON 语法验证

```bash
# 本地 JSON 验证
echo '{"key": "value", "number": 42}' | jq .

# 在 GitHub Actions 中
- name: 验证 JSON
  run: |
    cat << 'EOF' | jq .
    {
      "version": "v1.0.0",
      "status": "success"
    }
    EOF
```

## 🚨 常见错误

### 1. template_vars 中的无效 JSON

```yaml
# ❌ 错误 - 未转义的引号
template_vars: |
  {
    "message": "Hello "world""
  }

# ✅ 修复
template_vars: |
  {
    "message": "Hello \"world\""
  }
```

### 2. 不存在的变量

```yaml
# ⚠️ 变量不会被替换
template: success
message: "构建 {{buildNumber}} 完成"
# buildNumber 未在 template_vars 中定义
```

### 3. 不支持的 HTML 标签

```yaml
# ❌ 标签将被删除
message: |
  <div class="alert">
    <h2>警告</h2>
    <p>这很重要</p>
  </div>

# ✅ 支持的标签
message: |
  <b>警告</b>

  这很重要
```

## 📚 其他资源

- [主要文档](README.md)
- [使用示例](../../examples/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [GitHub Actions 上下文](https://docs.github.com/en/actions/learn-github-actions/contexts)

---

**🔧 模板系统设计用于在 GitHub Actions 工作流中实现最大的灵活性和易用性。**

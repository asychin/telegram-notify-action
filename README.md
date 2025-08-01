# Telegram Notify Action - Noty4U

<div align="center">

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/asychin/telegram-notify-action)](https://github.com/asychin/telegram-notify-action/releases)
[![GitHub](https://img.shields.io/github/license/asychin/telegram-notify-action)](LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/asychin/telegram-notify-action/test.yml)](https://github.com/asychin/telegram-notify-action/actions)

**Enhanced GitHub Action for sending Telegram notifications with advanced features**

</div>

## 🌐 Documentation

Choose your preferred language:

<div align="center">

| Language       | Documentation                                 | Description                          |
| -------------- | --------------------------------------------- | ------------------------------------ |
| 🇺🇸 **English** | **[📖 Read English Docs](docs/en/README.md)** | Complete documentation in English    |
| 🇷🇺 **Русский** | **[📖 Читать на русском](docs/ru/README.md)** | Полная документация на русском языке |
| 🇨🇳 **中文**    | **[📖 阅读中文文档](docs/zh/README.md)**      | 完整的中文文档                       |

</div>

## ⚡ Quick Start

```yaml
- name: Send Telegram notification
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    message: "Deployment completed successfully!"
```

## 🔧 Features

### Core Features

- ✅ **Message Templates** - Predefined templates for different scenarios
- ✅ **File Support** - Send photos, documents, videos, and more
- ✅ **Base64 Upload** - Send files directly from base64 encoded data
- ✅ **Smart Image Processing** - Automatic C2PA metadata detection
- ✅ **Auto Context Variables** - Automatic GitHub and event context extraction
- ✅ **Inline Keyboards** - Interactive buttons in messages
- ✅ **Thread Support** - Send to specific message threads/topics
- ✅ **Message Editing** - Edit existing messages with new content
- ✅ **Retry Logic** - Robust error handling with exponential backoff

### 🤖 AI-Powered Integration

_📄 [AI Integration Rules](./.ai-integration-rules) | [Latest Rules Online](https://github.com/asychin/telegram-notify-action/blob/main/.ai-integration-rules)_

Get telegram-notify-action automatically integrated into your project by AI assistants (ChatGPT, Claude, Copilot, etc.)!

#### ⚡ Quick Start with AI

**Option 1: Use AI Integration Rules**

```bash
# Download AI rules to your repository
curl -o .ai-integration-rules https://raw.githubusercontent.com/asychin/telegram-notify-action/main/.ai-integration-rules

# Then ask any AI:
# "Use the .ai-integration-rules file to add Telegram notifications to my project"
```

**Option 2: Direct AI Command**

```
Ask any AI assistant:
"Use https://github.com/asychin/telegram-notify-action/blob/main/.ai-integration-rules
to integrate Telegram notifications into my GitHub project"
```

#### 🎯 What AI Will Do

- 🔍 **Analyze** your repository structure and existing workflows
- ❓ **Ask questions** about your notification preferences and requirements
- 🛠️ **Generate** optimized workflow files with correct templates and variables
- 📋 **Provide** setup instructions for Telegram bot and secrets
- ✅ **Validate** everything against current v3.1.0 standards

#### 🔧 For Existing Implementations

Already have telegram-notify-action but with errors? AI can audit and fix it:

```
Ask AI: "Audit my telegram-notify-action setup and fix all errors according to v3.1.0 standards"
[Provide your workflow files]
```

AI will:

- 🔍 Find all errors (wrong templates, deprecated parameters, format issues)
- 📋 Create detailed error report with line numbers
- 🛠️ Generate corrected versions with explanations
- 📖 Cross-reference against official documentation

#### 🌍 Supported Languages

- 🇺🇸 English - Full AI integration support
- 🇷🇺 Русский - Полная поддержка ИИ интеграции
- 🇨🇳 中文 - 完整的 AI 集成支持

### Advanced Features

- 🎯 **Conditional Sending** - Send notifications based on workflow status
- 🔒 **Content Protection** - Prevent message forwarding and saving
- 📊 **Event Context** - Automatic extraction of event-specific variables
- 🎛️ **Rate Limiting** - Smart handling of Telegram API limits
- 🌍 **URL Variables** - Ready-to-use GitHub URLs (commitUrl, runUrl, etc.)
- 📈 **Comprehensive Testing** - Full test suite with high coverage

## 📚 Additional Resources

- **[📖 Complete Documentation](docs/en/README.md)** - Full documentation with all features
- **[🎨 Template System](docs/en/TEMPLATE-SYSTEM.md)** - Learn about message templates and variables
- **[📋 Examples](examples/)** - Ready-to-use workflow examples
- **[📝 Changelog](CHANGELOG.md)** - Version history and updates

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/asychin">Sychin Andrey</a>
</div>

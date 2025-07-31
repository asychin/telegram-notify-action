# Telegram Notify Action - Noty4U

<div align="center">

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/asychin/telegram-notify-action)](https://github.com/asychin/telegram-notify-action/releases)
[![GitHub](https://img.shields.io/github/license/asychin/telegram-notify-action)](LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/asychin/telegram-notify-action/test.yml)](https://github.com/asychin/telegram-notify-action/actions)

**Enhanced GitHub Action for sending Telegram notifications with advanced features**

![Telegram Bot](test-image.png)

</div>

## 🌐 Documentation

Choose your preferred language:

<div align="center">

| Language | Documentation | Description |
|----------|---------------|-------------|
| 🇺🇸 **English** | **[📖 Read English Docs](docs/en/README.md)** | Complete documentation in English |
| 🇷🇺 **Русский** | **[📖 Читать на русском](docs/ru/README.md)** | Полная документация на русском языке |
| 🇨🇳 **中文** | **[📖 阅读中文文档](docs/zh/README.md)** | 完整的中文文档 |

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

- ✅ **Message Templates** - Predefined templates for different scenarios
- ✅ **File Support** - Send photos, documents, videos, and more
- ✅ **Auto Context Variables** - Automatic GitHub context extraction
- ✅ **Inline Keyboards** - Interactive buttons in messages
- ✅ **Thread Support** - Send to specific message threads
- ✅ **Retry Logic** - Robust error handling with exponential backoff
- ✅ **Multi-language** - Support for English, Russian, and Chinese

## 📚 Additional Resources

- **[Template System](TEMPLATE-SYSTEM.md)** - Learn about message templates and variables
- **[Auto Context Variables](docs/AUTO-CONTEXT-VARIABLES.md)** - Automatic variable extraction
- **[Examples](examples/)** - Ready-to-use workflow examples
- **[Changelog](CHANGELOG.md)** - Version history and updates

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/asychin">Sychin Andrey</a>
</div>

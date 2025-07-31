# 📱 Telegram Notify Action - Enhanced

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](#)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#)

<!-- Language Navigation -->
<div align="center">

### 🌐 Language / 语言 / Язык

| [🇺🇸 English](docs/en/README.md) | [🇨🇳 中文](docs/zh/README.md) | [🇷🇺 Русский](docs/ru/README.md) |
| :-----------------------------: | :--------------------------: | :-----------------------------: |
|   **Complete Documentation**    |         **完整文档**         |     **Полная документация**     |

</div>

---

A powerful and feature-rich GitHub Action for sending notifications to Telegram with advanced capabilities including file uploads, **base64 support**, **smart image processing**, message templates, inline keyboards, retry logic, and much more.

**强大而功能丰富的 GitHub Action，用于向 Telegram 发送通知，具有高级功能，包括文件上传、base64 支持、智能图像处理、消息模板、内联键盘、重试逻辑等等。**

**Мощное и многофункциональное GitHub Action для отправки уведомлений в Telegram с расширенными возможностями, включая загрузку файлов, поддержку base64, умную обработку изображений, шаблоны сообщений, встроенные клавиатуры, логику повторов и многое другое.**

## 🚀 Features / 功能特性 / Возможности

<table>
<tr>
<td width="33%">

**🇺🇸 English**

- ✅ Send & Edit Messages
- 📁 File Uploads
- 🎨 Message Templates
- ⌨️ Inline Keyboards
- 🔄 Retry Logic
- 🌍 Multi-language Support
- 🧵 Thread Support
- 🎯 Conditional Sending
- 📤 Base64 Upload
- 🖼️ Smart Image Processing

</td>
<td width="33%">

**🇨🇳 中文**

- ✅ 发送和编辑消息
- 📁 文件上传
- 🎨 消息模板
- ⌨️ 内联键盘
- 🔄 重试逻辑
- 🌍 多语言支持
- 🧵 主题支持
- 🎯 条件发送
- 📤 Base64 上传
- 🖼️ 智能图像处理

</td>
<td width="33%">

**🇷🇺 Русский**

- ✅ Отправка и редактирование
- 📁 Загрузка файлов
- 🎨 Шаблоны сообщений
- ⌨️ Встроенные клавиатуры
- 🔄 Логика повторов
- 🌍 Многоязычность
- 🧵 Поддержка тем
- 🎯 Условная отправка
- 📤 Загрузка Base64
- 🖼️ Умная обработка изображений

</td>
</tr>
</table>

## 📦 Quick Start / 快速开始 / Быстрый старт

### Basic Usage / 基础用法 / Базовое использование

```yaml
- name: Send Telegram Notification
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "Hello from GitHub Actions! 🚀"
    # 您好，来自 GitHub Actions! 🚀
    # Привет из GitHub Actions! 🚀
```

### Using Templates / 使用模板 / Использование шаблонов

```yaml
- name: Success Notification
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    message: "Deployment completed successfully!"
    language: en # en/zh/ru
    template_vars: |
      {
        "deployStatus": "successful",
        "version": "v1.2.3"
      }
```

### File Upload / 文件上传 / Загрузка файлов

```yaml
- name: Send Report
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./reports/test-results.json
    file_type: document
    caption: "📊 Test Results Report"
```

## 📚 Complete Documentation / 完整文档 / Полная документация

<div align="center">

|    Language    |        Main Documentation         |              Template System               |         Examples         |
| :------------: | :-------------------------------: | :----------------------------------------: | :----------------------: |
| 🇺🇸 **English** | [📖 README.md](docs/en/README.md) | [🎨 Templates](docs/en/TEMPLATE-SYSTEM.md) | [💡 Examples](examples/) |
|  🇨🇳 **中文**   | [📖 README.md](docs/zh/README.md) | [🎨 模板系统](docs/zh/TEMPLATE-SYSTEM.md)  |   [💡 示例](examples/)   |
| 🇷🇺 **Русский** | [📖 README.md](docs/ru/README.md) |  [🎨 Шаблоны](docs/ru/TEMPLATE-SYSTEM.md)  | [💡 Примеры](examples/)  |

</div>

### 🎯 Featured Example: Advanced Repository Monitoring

**NEW!** Check out our comprehensive monitoring example with advanced template usage:

- **📝 Dynamic template selection** based on GitHub events
- **🌍 Multi-language support** (Russian templates)
- **📊 Rich monitoring** for Issues, PRs, and repository health
- **🎨 Creative template usage** (deploy for PRs, test for health checks)

👉 **[examples/advanced-monitoring.yml](examples/advanced-monitoring.yml)**

> **🎨 Latest Update:** Switched to Markdown formatting for better readability and mobile experience!

## ⚙️ Configuration / 配置 / Конфигурация

### Required Parameters / 必需参数 / Обязательные параметры

| Parameter        | Description / 描述 / Описание                                      | Example / 示例 / Пример             |
| ---------------- | ------------------------------------------------------------------ | ----------------------------------- |
| `telegram_token` | Telegram Bot Token<br/>Telegram 机器人令牌<br/>Токен Telegram бота | `${{ secrets.TELEGRAM_BOT_TOKEN }}` |
| `chat_id`        | Telegram Chat ID<br/>Telegram 聊天 ID<br/>ID чата Telegram         | `${{ secrets.TELEGRAM_CHAT_ID }}`   |

### Key Parameters / 主要参数 / Основные параметры

| Parameter     | Description / 描述 / Описание                                   | Default | Example                       |
| ------------- | --------------------------------------------------------------- | ------- | ----------------------------- |
| `message`     | Message text / 消息文本 / Текст сообщения                       | -       | `"Hello World!"`              |
| `template`    | Pre-built template / 预构建模板 / Готовый шаблон                | -       | `success`, `error`, `warning` |
| `language`    | Interface language / 界面语言 / Язык интерфейса                 | `en`    | `en`, `zh`, `ru`              |
| `file_path`   | File to upload / 上传文件 / Файл для загрузки                   | -       | `./report.pdf`                |
| `file_base64` | Base64 file content / Base64 文件内容 / Содержимое файла Base64 | -       | `iVBORw0K...`                 |

> 📋 **For complete parameter list / 完整参数列表 / Полный список параметров:**
>
> - [🇺🇸 English Parameters](docs/en/README.md#input-parameters)
> - [🇨🇳 中文参数](docs/zh/README.md#输入参数)
> - [🇷🇺 Русские параметры](docs/ru/README.md#входные-параметры)

## 🛠️ Setup / 安装 / Установка

### 1. Create Telegram Bot / 创建 Telegram 机器人 / Создание Telegram бота

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow instructions / 发送 `/newbot` 并按照说明操作 / Отправьте `/newbot` и следуйте инструкциям
3. Save the bot token / 保存机器人令牌 / Сохраните токен бота

### 2. Get Chat ID / 获取聊天 ID / Получение ID чата

**For personal chat / 个人聊天 / Для личного чата:**

1. Message your bot / 发消息给你的机器人 / Напишите боту
2. Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find your chat ID / 找到你的聊天 ID / Найдите ID чата

### 3. Configure Secrets / 配置密钥 / Настройка секретов

Add to your repository settings / 添加到存储库设置 / Добавьте в настройки репозитория:

- `TELEGRAM_BOT_TOKEN` - Your bot token / 你的机器人令牌 / Ваш токен бота
- `TELEGRAM_CHAT_ID` - Your chat ID / 你的聊天 ID / Ваш ID чата

## 🤝 Contributing / 贡献 / Участие в разработке

We welcome contributions! / 欢迎贡献！/ Мы приветствуем участие!

1. Fork the repository / 分叉存储库 / Форкните репозиторий
2. Create feature branch / 创建功能分支 / Создайте ветку функции
3. Make your changes / 进行更改 / Внесите изменения
4. Submit pull request / 提交拉取请求 / Отправьте pull request

> 📖 **Full contributing guide / 完整贡献指南 / Полное руководство по участию:**
>
> - [🇺🇸 CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License / 许可证 / Лицензия

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

本项目使用 MIT 许可证 - 有关详细信息，请参阅 [LICENSE](LICENSE) 文件。

Этот проект лицензирован под лицензией MIT - см. файл [LICENSE](LICENSE) для получения подробной информации.

## 📞 Support / 支持 / Поддержка

<div align="center">

|         Type         |                                   English                                    |                                 中文                                  |                                     Русский                                     |
| :------------------: | :--------------------------------------------------------------------------: | :-------------------------------------------------------------------: | :-----------------------------------------------------------------------------: |
| 📖 **Documentation** |                          [Docs](docs/en/README.md)                           |                       [文档](docs/zh/README.md)                       |                        [Документация](docs/ru/README.md)                        |
|   🎨 **Templates**   |                     [Guide](docs/en/TEMPLATE-SYSTEM.md)                      |                  [指南](docs/zh/TEMPLATE-SYSTEM.md)                   |                    [Руководство](docs/ru/TEMPLATE-SYSTEM.md)                    |
|    🐛 **Issues**     |  [Report Issues](https://github.com/asychin/telegram-notify-action/issues)   | [报告问题](https://github.com/asychin/telegram-notify-action/issues)  | [Сообщить о проблеме](https://github.com/asychin/telegram-notify-action/issues) |
|  💬 **Discussions**  | [Discussions](https://github.com/asychin/telegram-notify-action/discussions) | [讨论](https://github.com/asychin/telegram-notify-action/discussions) |   [Обсуждения](https://github.com/asychin/telegram-notify-action/discussions)   |

</div>

## 🙏 Acknowledgments / 致谢 / Благодарности

- Thanks to all contributors / 感谢所有贡献者 / Спасибо всем участникам
- Inspired by the GitHub Actions community / 受 GitHub Actions 社区启发 / Вдохновлено сообществом GitHub Actions
- Built with ❤️ for developers / 为开发者用 ❤️ 构建 / Создано с ❤️ для разработчиков

---

<div align="center">

**Made with ❤️ by [Sychin Andrey](https://github.com/asychin)**

**由 [Sychin Andrey](https://github.com/asychin) 用 ❤️ 制作**

**Создано с ❤️ от [Sychin Andrey](https://github.com/asychin)**

</div>

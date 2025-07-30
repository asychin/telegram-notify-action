# 📱 Telegram Notify Action

A powerful GitHub Action for sending and editing Telegram notifications with support for message threads and dynamic environments.

## ✨ Features

- ✅ Send new messages to Telegram
- ✅ Edit existing messages
- ✅ Support for topics/forums (message_thread_id)
- ✅ Dynamic environment support (dev, prod, staging)
- ✅ HTML formatting with clickable GitHub profile links
- ✅ Return message_id for subsequent operations
- ✅ Comprehensive error handling
- ✅ Multilingual support (English/Russian)

## 🚀 Quick Start

```yaml
- name: Send Telegram notification
  uses: asychin/telegram-notify-action@v1
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ vars.TELEGRAM_CHAT_ID }}
    message: |
      🚀 <b>Deployment Started</b>

      <b>Repository:</b> ${{ github.repository }}
      <b>Branch:</b> <code>${{ github.ref_name }}</code>
      <b>Initiated by:</b> <a href="${{ github.server_url }}/${{ github.actor }}">${{ github.actor }}</a>

      <a href="${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}">📊 View Workflow</a>
```

## 📋 Inputs

| Input                      | Required | Description                             | Default |
| -------------------------- | -------- | --------------------------------------- | ------- |
| `telegram_token`           | ✅       | Telegram Bot Token                      |         |
| `chat_id`                  | ✅       | Telegram Chat ID                        |         |
| `message`                  | ✅       | Message text to send                    |         |
| `message_thread_id`        | ❌       | Message thread ID for topics            |         |
| `message_id`               | ❌       | Message ID to edit (for updates)        |         |
| `parse_mode`               | ❌       | Parse mode (HTML, Markdown, MarkdownV2) | `HTML`  |
| `disable_web_page_preview` | ❌       | Disable link previews                   | `true`  |
| `disable_notification`     | ❌       | Send silently                           | `false` |
| `language`                 | ❌       | Language for log messages (en, ru)      | `en`    |

## 📤 Outputs

| Output       | Description                      |
| ------------ | -------------------------------- |
| `message_id` | ID of the sent/edited message    |
| `success`    | Whether operation was successful |

## 🔄 Dynamic Environment Support

Use with environment-specific variables:

```yaml
# Automatically selects variables based on branch name
telegram_token: ${{ secrets[format('TELEGRAM_BOT_TOKEN_{0}', github.ref_name)] }}
chat_id: ${{ vars[format('TELEGRAM_CHAT_ID_{0}', github.ref_name)] }}
```

**Required Variables:**

- Secrets: `TELEGRAM_BOT_TOKEN_DEV`, `TELEGRAM_BOT_TOKEN_PROD`
- Variables: `TELEGRAM_CHAT_ID_DEV`, `TELEGRAM_CHAT_ID_PROD`

## 📝 Examples

### Basic Usage

```yaml
- uses: asychin/telegram-notify-action@v1
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ vars.TELEGRAM_CHAT_ID }}
    message: "Hello from GitHub Actions! 👋"
```

### Message Editing

```yaml
- name: Send initial message
  id: initial
  uses: asychin/telegram-notify-action@v1
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ vars.TELEGRAM_CHAT_ID }}
    message: "🔄 Process starting..."

- name: Update message
  uses: asychin/telegram-notify-action@v1
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ vars.TELEGRAM_CHAT_ID }}
    message_id: ${{ steps.initial.outputs.message_id }}
    message: "✅ Process completed!"
```

### Send to Topic

```yaml
- uses: asychin/telegram-notify-action@v1
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ vars.TELEGRAM_CHAT_ID }}
    message_thread_id: ${{ vars.TELEGRAM_TOPIC_ID }}
    message: "Message to specific topic"
```

### Russian Language Support

```yaml
- uses: asychin/telegram-notify-action@v1
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ vars.TELEGRAM_CHAT_ID }}
    language: ru
    message: |
      📦 <b>Новый коммит в репозиторий</b>

      <b>Репозиторий:</b> ${{ github.repository }}
      <b>Ветка:</b> <code>${{ github.ref_name }}</code>
      <b>Автор:</b> <a href="${{ github.server_url }}/${{ github.actor }}">${{ github.actor }}</a>
```

### Full Deployment Example

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Send start notification
        id: start
        uses: asychin/telegram-notify-action@v1
        with:
          telegram_token: ${{ secrets[format('TELEGRAM_BOT_TOKEN_{0}', github.ref_name)] }}
          chat_id: ${{ vars[format('TELEGRAM_CHAT_ID_{0}', github.ref_name)] }}
          message: |
            🚀 <b>Deployment Started</b>

            <b>Repository:</b> ${{ github.repository }}
            <b>Branch:</b> <code>${{ github.ref_name }}</code>
            <b>Initiated by:</b> <a href="${{ github.server_url }}/${{ github.actor }}">${{ github.actor }}</a>

            <a href="${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}">📊 View Workflow</a>

      # Your deployment steps here...

      - name: Send completion notification
        if: always()
        uses: asychin/telegram-notify-action@v1
        with:
          telegram_token: ${{ secrets[format('TELEGRAM_BOT_TOKEN_{0}', github.ref_name)] }}
          chat_id: ${{ vars[format('TELEGRAM_CHAT_ID_{0}', github.ref_name)] }}
          message_id: ${{ steps.start.outputs.message_id }}
          message: |
            ${{ job.status == 'success' && '✅' || '❌' }} <b>Deployment ${{ job.status == 'success' && 'Completed' || 'Failed' }}</b>

            <b>Repository:</b> ${{ github.repository }}
            <b>Branch:</b> <code>${{ github.ref_name }}</code>
            <b>Initiated by:</b> <a href="${{ github.server_url }}/${{ github.actor }}">${{ github.actor }}</a>
            <b>Duration:</b> ${{ steps.deploy.conclusion }}

            <a href="${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}">📊 View Workflow</a>
```

## 🤖 Bot Setup

1. Create bot via [@BotFather](https://t.me/BotFather)
2. Get bot token and add to GitHub Secrets
3. Add bot to your chat/channel
4. For channels: make bot an administrator
5. Get chat ID using [@userinfobot](https://t.me/userinfobot)
6. Add chat ID to GitHub Variables

## 🔧 Troubleshooting

### "Bad Request: chat not found"

- Ensure bot is added to the chat
- For channels/supergroups: make bot an administrator
- Verify chat ID is correct

### "Forbidden: bot was blocked"

- Bot was blocked by user (for private chats)
- User must start conversation with bot first

## 🌐 Language Support

The action supports multiple languages for log messages:

- **English** (`en`) - default language
- **Russian** (`ru`) - русский язык

Set the `language` parameter to `ru` for Russian log messages:

```yaml
- uses: asychin/telegram-notify-action@v1
  with:
    language: ru
    # ... other parameters
```

## 📊 HTML Formatting

Supported HTML tags:

- `<b>text</b>` - **bold**
- `<i>text</i>` - _italic_
- `<code>text</code>` - `monospace`
- `<pre>text</pre>` - `preformatted`
- `<a href="url">text</a>` - [links](url)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## ⭐ Support

If this action helped you, please ⭐ star the repository!

---

Created with ❤️ for the GitHub Actions community

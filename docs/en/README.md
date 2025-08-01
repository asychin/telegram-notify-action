# 📱 Telegram Notify Action - Enhanced

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](#)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#)

<!-- Language Navigation -->
<div align="center">

### 🌐 Language / 语言 / Язык

| [🇺🇸 **English**](README.md) | [🇨🇳 中文](../zh/README.md) | [🇷🇺 Русский](../ru/README.md) |
| :-------------------------: | :------------------------: | :---------------------------: |
| **Complete Documentation**  |        **完整文档**        |    **Полная документация**    |

</div>

---

A powerful and feature-rich GitHub Action for sending notifications to Telegram with advanced capabilities including file uploads, **base64 support**, **smart image processing**, message templates, inline keyboards, retry logic, and much more.

## 🚀 Features

### Core Features

- ✅ **Send & Edit Messages** - Send new messages or edit existing ones
- 📁 **File Uploads** - Send documents, images, videos, and other file types
- 🎨 **Message Templates** - Pre-built templates for different scenarios
- ⌨️ **Inline Keyboards** - Interactive buttons with URLs and callbacks
- 🔄 **Retry Logic** - Automatic retry with exponential backoff
- 🌍 **Multi-language** - Support for English, Russian, and Chinese
- 🧵 **Thread Support** - Send messages to specific forum topics/threads

### Advanced Features

- 🎯 **Conditional Sending** - Send notifications based on workflow status
- 🔒 **Content Protection** - Prevent message forwarding and saving
- 📊 **GitHub Context** - Automatic GitHub variables substitution
- 🎛️ **Flexible Configuration** - Extensive customization options
- 📈 **Comprehensive Testing** - Full test suite with high coverage
- 🛡️ **Error Handling** - Graceful error handling and detailed logging

### 🆕 Enhanced File Upload Features

- 📤 **Base64 Upload** - Send files directly from base64 encoded data
- 🖼️ **Smart Image Handling** - Automatic C2PA metadata detection and processing
- 🎛️ **Force Photo Mode** - Override automatic file type conversion
- 🔍 **Intelligent File Processing** - Automatic file type optimization for Telegram

## 📦 Quick Start

### Basic Usage

```yaml
- name: Send Telegram Notification
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "Hello from GitHub Actions! 🚀"
```

### Using Templates

```yaml
- name: Success Notification
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    message: "Deployment completed successfully!"
    template_vars: |
      {
        "deployStatus": "successful",
        "version": "v1.2.3"
      }
```

### File Upload

```yaml
- name: Send Report
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./reports/test-results.json
    file_type: document
    caption: "📊 Test Results Report"
```

### Interactive Message

```yaml
- name: Interactive Notification
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "🎉 New release is ready!"
    inline_keyboard: |
      [
        {"text": "📥 Download", "url": "https://github.com/user/repo/releases/latest"},
        {"text": "📖 Changelog", "url": "https://github.com/user/repo/blob/main/CHANGELOG.md"}
      ]
```

### 🆕 Base64 File Upload

```yaml
- name: Send Generated Image
  run: |
    # Generate or convert image to base64
    base64_data=$(base64 -i screenshot.png)
    echo "image_data=$base64_data" >> $GITHUB_OUTPUT
  id: convert

- name: Send Base64 Image
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_base64: ${{ steps.convert.outputs.image_data }}
    file_name: "screenshot.png"
    file_type: "photo"
    caption: "📸 Generated screenshot"
```

### 🖼️ Smart Image Handling

```yaml
- name: Send Image with C2PA Handling
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./image-with-metadata.png
    file_type: "photo"
    # Automatically converts to document if C2PA metadata detected
    caption: "🖼️ Image with smart processing"

- name: Force Send as Photo
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./image-with-metadata.png
    file_type: "photo"
    force_as_photo: "true" # Forces photo even with C2PA metadata
    caption: "🖼️ Forced as photo (may have processing issues)"
```

## 📖 Input Parameters

### Required Parameters

| Parameter        | Description        | Example                             |
| ---------------- | ------------------ | ----------------------------------- |
| `telegram_token` | Telegram Bot Token | `${{ secrets.TELEGRAM_BOT_TOKEN }}` |
| `chat_id`        | Telegram Chat ID   | `${{ secrets.TELEGRAM_CHAT_ID }}`   |

### Message Parameters

| Parameter                  | Description           | Default | Example                          |
| -------------------------- | --------------------- | ------- | -------------------------------- |
| `message`                  | Message text          | -       | `"Hello World!"`                 |
| `parse_mode`               | Message parse mode    | `HTML`  | `HTML`, `Markdown`, `MarkdownV2` |
| `disable_web_page_preview` | Disable link previews | `true`  | `true`, `false`                  |
| `disable_notification`     | Send silently         | `false` | `true`, `false`                  |
| `language`                 | Interface language    | `en`    | `en`, `ru`, `zh`                 |

### Advanced Message Parameters

| Parameter                     | Description                  | Default | Example         |
| ----------------------------- | ---------------------------- | ------- | --------------- |
| `message_thread_id`           | Forum topic ID               | -       | `123`           |
| `message_id`                  | Message ID to edit           | -       | `456`           |
| `reply_to_message_id`         | Reply to message ID          | -       | `789`           |
| `protect_content`             | Protect from forwarding      | `false` | `true`, `false` |
| `allow_sending_without_reply` | Send if reply target missing | `true`  | `true`, `false` |
| `message_effect_id`           | Message effect ID            | -       | `effect_id`     |
| `business_connection_id`      | Business connection ID       | -       | `business_id`   |

### File Upload Parameters

| Parameter        | Description                     | Default    | Example                               |
| ---------------- | ------------------------------- | ---------- | ------------------------------------- |
| `file_path`      | Path to file                    | -          | `./report.pdf`                        |
| `file_base64`    | Base64 encoded file content     | -          | `iVBORw0KGgoAAAANSUhEUgAAAA...`       |
| `file_name`      | File name (required for base64) | -          | `"screenshot.png"`                    |
| `file_type`      | Type of file                    | `document` | `photo`, `document`, `video`, `audio` |
| `force_as_photo` | Force photo even with metadata  | `false`    | `true`, `false`                       |
| `caption`        | File caption                    | -          | `"📊 Report"`                         |

> **Note**: Use either `file_path` OR `file_base64` (not both). When using `file_base64`, `file_name` is required.

### Template Parameters

| Parameter       | Description               | Default | Example                                                            |
| --------------- | ------------------------- | ------- | ------------------------------------------------------------------ |
| `template`      | Template name             | -       | `success`, `error`, `warning`, `info`, `deploy`, `test`, `release` |
| `template_vars` | Template variables (JSON) | `{}`    | `{"version": "v1.0.0"}`                                            |

### Interactive Features

| Parameter         | Description            | Default | Example                                              |
| ----------------- | ---------------------- | ------- | ---------------------------------------------------- |
| `inline_keyboard` | Inline keyboard (JSON) | -       | `[{"text": "Button", "url": "https://example.com"}]` |

### Retry Configuration

| Parameter     | Description                   | Default | Example |
| ------------- | ----------------------------- | ------- | ------- |
| `max_retries` | Maximum retry attempts        | `3`     | `5`     |
| `retry_delay` | Initial retry delay (seconds) | `1`     | `2`     |

### Conditional Sending

| Parameter         | Description          | Default | Example         |
| ----------------- | -------------------- | ------- | --------------- |
| `send_on_failure` | Send only on failure | `false` | `true`, `false` |
| `send_on_success` | Send only on success | `false` | `true`, `false` |

## 📤 Output Parameters

| Parameter     | Description               | Example                          |
| ------------- | ------------------------- | -------------------------------- |
| `message_id`  | ID of sent/edited message | `123456`                         |
| `success`     | Operation success status  | `true`, `false`                  |
| `file_id`     | ID of uploaded file       | `BAADBAADrwADBREAAYag2eLJxJVvAg` |
| `retry_count` | Number of retry attempts  | `2`                              |

## 🖼️ Smart Image Processing

This action includes intelligent image processing capabilities for better Telegram compatibility:

### C2PA Metadata Detection

The action automatically detects C2PA (Coalition for Content Provenance and Authenticity) metadata in PNG images, which can cause processing issues when sent as photos to Telegram.

#### Default Behavior (Recommended)

```yaml
- name: Smart Image Upload
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: "image-with-metadata.png"
    file_type: "photo"
    # Automatically converts to "document" if C2PA metadata detected
```

#### Force as Photo (Use with Caution)

```yaml
- name: Force Photo Upload
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: "image-with-metadata.png"
    file_type: "photo"
    force_as_photo: "true" # ⚠️ May cause processing issues
```

### When to Use `force_as_photo`

- ✅ **Use when**: You need images to appear as photos in Telegram chat
- ❌ **Avoid when**: Image contains C2PA metadata (default handling is safer)
- ⚠️ **Warning**: Forced photos with metadata may fail to process on Telegram's side

### Base64 Processing

Base64 uploads support the same smart processing:

```yaml
- name: Base64 with Smart Processing
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_base64: ${{ steps.convert.outputs.image_data }}
    file_name: "generated-image.png"
    file_type: "photo"
    # Same C2PA detection applies to base64 data
```

## 🎨 Message Templates

📚 **[Complete Template System Documentation →](TEMPLATE-SYSTEM.md)**

The action includes pre-built templates for common scenarios:

### Available Templates

| Template  | Description               | Use Case                          |
| --------- | ------------------------- | --------------------------------- |
| `success` | Success notification      | Successful deployments, builds    |
| `error`   | Error notification        | Failed workflows, critical issues |
| `warning` | Warning notification      | Non-critical issues, deprecations |
| `info`    | Information notification  | General updates, announcements    |
| `deploy`  | Deployment notification   | Application deployments           |
| `test`    | Test results notification | Test suite results                |
| `release` | Release notification      | New releases, version updates     |

### Template Variables

Templates support variable substitution using `{{variable}}` syntax:

```yaml
template_vars: |
  {
    "version": "v2.0.0",
    "deployStatus": "successful",
    "testStatus": "passed",
    "coverage": "95%",
    "customMessage": "Additional information"
  }
```

### GitHub Context Variables

The following GitHub context variables are automatically available:

- `repository` - Repository name
- `refName` - Branch/tag name
- `sha` - Commit SHA
- `actor` - User who triggered the workflow
- `workflow` - Workflow name
- `job` - Job name
- `runId` - Workflow run ID
- `runNumber` - Workflow run number
- `eventName` - Event that triggered the workflow

## 📁 File Upload Support

### Supported File Types

| Type         | Description              | Max Size |
| ------------ | ------------------------ | -------- |
| `photo`      | Images (JPEG, PNG, WebP) | 10 MB    |
| `document`   | Any file type            | 50 MB    |
| `video`      | Video files              | 50 MB    |
| `audio`      | Audio files              | 50 MB    |
| `animation`  | GIF animations           | 50 MB    |
| `voice`      | Voice messages           | 50 MB    |
| `video_note` | Video notes              | 50 MB    |
| `sticker`    | Sticker files            | 50 MB    |

### File Upload Example

```yaml
- name: Upload Test Results
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./test-results.html
    file_type: document
    caption: |
      📊 **Test Results**

      Generated: $(date)
      Coverage: 95%
      Status: ✅ Passed
```

## ⌨️ Inline Keyboards

Create interactive messages with clickable buttons:

### Button Types

- **URL Buttons** - Open external links
- **Callback Buttons** - Trigger bot callbacks (requires bot handling)

### Keyboard Format

```json
[
  [
    { "text": "Button 1", "url": "https://example1.com" },
    { "text": "Button 2", "url": "https://example2.com" }
  ],
  [{ "text": "Full Width Button", "url": "https://example3.com" }]
]
```

### Example Usage

```yaml
inline_keyboard: |
  [
    [
      {"text": "📊 View Workflow", "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"},
      {"text": "📝 View Commit", "url": "${{ github.server_url }}/${{ github.repository }}/commit/${{ github.sha }}"}
    ],
    [
      {"text": "🐛 Report Issue", "url": "${{ github.server_url }}/${{ github.repository }}/issues/new"}
    ]
  ]
```

## 🔄 Retry Logic

The action includes automatic retry functionality with exponential backoff:

### Configuration

```yaml
max_retries: 5 # Maximum number of retry attempts
retry_delay: 2 # Initial delay in seconds (doubles each retry)
```

### Retry Behavior

1. **Initial Attempt** - Try sending immediately
2. **First Retry** - Wait `retry_delay` seconds
3. **Second Retry** - Wait `retry_delay * 2` seconds
4. **Third Retry** - Wait `retry_delay * 4` seconds
5. **Continue** - Until `max_retries` reached

## 🎯 Conditional Sending

Send notifications only when specific conditions are met:

### Send on Failure Only

```yaml
- name: Failure Notification
  if: failure()
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: error
    message: "Workflow failed! Please check the logs."
    send_on_failure: true
```

### Send on Success Only

```yaml
- name: Success Notification
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    message: "Deployment completed successfully!"
    send_on_success: true
```

## 🌍 Multi-language Support

The action supports multiple languages for system messages:

### Supported Languages

- `en` - English (default)
- `ru` - Russian
- `zh` - Chinese

### Usage

```yaml
language: ru # Use Russian interface
```

## 🛠️ Setup Instructions

### 1. Create a Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the instructions
3. Save the bot token

### 2. Get Chat ID

**For personal chat:**

1. Message your bot
2. Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find your chat ID in the response

**For group chat:**

1. Add bot to the group
2. Send a message mentioning the bot
3. Visit the getUpdates URL
4. Find the group chat ID (negative number)

### 3. Configure GitHub Secrets

Add these secrets to your repository:

- `TELEGRAM_BOT_TOKEN` - Your bot token
- `TELEGRAM_CHAT_ID` - Your chat ID

## 📝 Examples

### Complete CI/CD Workflow

```yaml
name: CI/CD with Telegram Notifications

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

      - name: Run Tests
        run: npm test
        id: tests

      - name: Test Results
        if: always()
        uses: asychin/telegram-notify-action@v3
        with:
          telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          template: ${{ steps.tests.outcome == 'success' && 'test' || 'error' }}
          message: |
            🧪 **Test Results**

            Status: ${{ steps.tests.outcome }}
            Branch: ${{ github.ref_name }}
            Commit: ${{ github.sha }}
          template_vars: |
            {
              "testStatus": "${{ steps.tests.outcome }}",
              "coverage": "95%"
            }
          inline_keyboard: |
            [
              {"text": "📊 View Details", "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}
            ]

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy
        run: echo "Deploying..."
        id: deploy

      - name: Deployment Notification
        uses: asychin/telegram-notify-action@v3
        with:
          telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          template: deploy
          message: "🚀 Deployment to production completed!"
          template_vars: |
            {
              "deployStatus": "successful",
              "version": "v1.0.0"
            }
```

### File Upload with Report

```yaml
- name: Generate Report
  run: |
    echo "Generating test report..."
    npm run test:report

- name: Send Report
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./reports/test-report.html
    file_type: document
    caption: |
      📊 **Test Report**

      Generated: $(date)
      Tests: 150 passed, 0 failed
      Coverage: 95.2%
    inline_keyboard: |
      [
        {"text": "📈 View Online", "url": "https://your-site.com/reports"}
      ]
```

### Message Editing

```yaml
- name: Start Process
  id: start
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "⏳ Starting deployment process..."

- name: Deploy Application
  run: |
    echo "Deploying..."
    sleep 30
    echo "Deployment complete!"

- name: Update Status
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message_id: ${{ steps.start.outputs.message_id }}
    message: |
      ✅ **Deployment Complete!**

      Duration: 30 seconds
      Status: Success
      Version: v1.2.3
    inline_keyboard: |
      [
        {"text": "🌐 View Site", "url": "https://your-site.com"}
      ]
```

## 🧪 Testing

The action includes comprehensive testing:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Bot not responding:**

- Verify bot token is correct
- Ensure bot is not blocked
- Check if bot has necessary permissions

**File upload fails:**

- Check file size limits
- Verify file path is correct
- Ensure file type is supported

**Template not working:**

- Verify template name is correct
- Check template_vars JSON format
- Ensure all required variables are provided

**Retry logic not working:**

- Check network connectivity
- Verify retry configuration
- Review error logs for details

### Debug Mode

Enable debug logging by setting the `ACTIONS_STEP_DEBUG` secret to `true` in your repository.

## 🆕 What's New in v2.0.0

### Enhanced File Upload

- 📤 **Base64 Upload Support** - Send files directly from base64 encoded data
- 🖼️ **Smart Image Processing** - Automatic C2PA metadata detection
- 🎛️ **Force Photo Mode** - Override automatic file type conversion with `force_as_photo`
- 🔍 **Intelligent Processing** - Optimized file handling for better Telegram compatibility

### Technical Improvements

- ✅ **16 comprehensive tests** covering all new functionality
- 🧪 **Full test coverage** for base64 and force_as_photo features
- 🛡️ **Robust error handling** for invalid base64 data
- 📊 **Enhanced validation** for file parameters

### Developer Experience

- 📖 **Updated documentation** with extensive examples
- 🎯 **Clear usage guidelines** for C2PA metadata handling
- ⚠️ **Helpful warnings** for potential processing issues
- 🔧 **Better debugging** information

## 📞 Support

- 📖 [Documentation](README.md)
- 🎨 [Template System Guide](TEMPLATE-SYSTEM.md)
- 🐛 [Report Issues](https://github.com/asychin/telegram-notify-action/issues)
- 💬 [Discussions](https://github.com/asychin/telegram-notify-action/discussions)
- 📧 [Contact](mailto:moloko@skofey.com)

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by the GitHub Actions community
- Built with ❤️ for developers

---

**Made with ❤️ by [Sychin Andrey](https://github.com/asychin)**

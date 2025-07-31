#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Polyfill for FormData and fetch if needed (Node.js < 18)
let FormData, fetch;
try {
  FormData = globalThis.FormData;
  fetch = globalThis.fetch;
} catch {
  // Fallback for older Node.js versions
  const { FormData: FormDataPolyfill } = require("formdata-polyfill/esm");
  const fetchPolyfill = require("node-fetch");
  FormData = FormDataPolyfill;
  fetch = fetchPolyfill;
}

/**
 * Telegram Notify Action - Enhanced Version
 * Sends or updates Telegram messages with advanced features:
 * - File attachments (photos, documents, videos, etc.)
 * - Message templates with variable substitution
 * - Inline keyboards
 * - Retry logic with exponential backoff
 * - Conditional sending based on workflow status
 * - Enhanced error handling and logging
 */

class TelegramNotify {
  constructor() {
    // Basic configuration
    this.token = process.env.TELEGRAM_TOKEN;
    this.chatId = process.env.CHAT_ID;
    this.message = process.env.MESSAGE;
    this.messageThreadId = process.env.MESSAGE_THREAD_ID;
    this.messageId = process.env.MESSAGE_ID;
    this.parseMode = process.env.PARSE_MODE || "HTML";
    this.disableWebPagePreview =
      process.env.DISABLE_WEB_PAGE_PREVIEW === "true";
    this.disableNotification = process.env.DISABLE_NOTIFICATION === "true";
    this.language = process.env.LANGUAGE || "en";

    // Enhanced parameters
    this.replyToMessageId = process.env.REPLY_TO_MESSAGE_ID;
    this.protectContent = process.env.PROTECT_CONTENT === "true";
    this.allowSendingWithoutReply =
      process.env.ALLOW_SENDING_WITHOUT_REPLY !== "false";
    this.messageEffectId = process.env.MESSAGE_EFFECT_ID;
    this.businessConnectionId = process.env.BUSINESS_CONNECTION_ID;

    // File support
    this.filePath = process.env.FILE_PATH;
    this.fileBase64 = process.env.FILE_BASE64;
    this.fileName = process.env.FILE_NAME;
    this.fileType = process.env.FILE_TYPE || "document";
    this.forceAsPhoto = process.env.FORCE_AS_PHOTO === "true";
    this.caption = process.env.CAPTION;

    // Template support
    this.template = process.env.TEMPLATE;
    this.templateVars = this.parseJSON(process.env.TEMPLATE_VARS) || {};

    // Inline keyboard support
    this.inlineKeyboard = this.parseJSON(process.env.INLINE_KEYBOARD);

    // Retry configuration
    this.maxRetries = parseInt(process.env.MAX_RETRIES) || 3;
    this.retryDelay = parseInt(process.env.RETRY_DELAY) || 1;

    // Conditional sending
    this.sendOnFailure = process.env.SEND_ON_FAILURE === "true";
    this.sendOnSuccess = process.env.SEND_ON_SUCCESS === "true";

    // GitHub context
    this.githubContext = {
      repository: process.env.GITHUB_REPOSITORY,
      refName: process.env.GITHUB_REF_NAME,
      sha: process.env.GITHUB_SHA,
      actor: process.env.GITHUB_ACTOR,
      workflow: process.env.GITHUB_WORKFLOW,
      job: process.env.GITHUB_JOB,
      runId: process.env.GITHUB_RUN_ID,
      runNumber: process.env.GITHUB_RUN_NUMBER,
      eventName: process.env.GITHUB_EVENT_NAME,
      jobStatus: process.env.JOB_STATUS,
    };

    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    this.messages = this.getLocalizedMessages();
    this.retryCount = 0;
  }

  /**
   * Parse JSON string safely
   */
  parseJSON(jsonString) {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      this.warning(
        `Failed to parse JSON: ${jsonString}. Error: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Get localized messages
   */
  getLocalizedMessages() {
    const messages = {
      en: {
        tokenRequired: "TELEGRAM_TOKEN is required",
        chatIdRequired: "CHAT_ID is required",
        messageOrFileRequired:
          "Either MESSAGE, FILE_PATH, or TEMPLATE is required",
        sendingMessage: "Sending new Telegram message...",
        sendingFile: "Sending file to Telegram...",
        sendingToThread: "Sending message to thread:",
        editingMessage: "Editing message with ID:",
        messageSent: "Message sent successfully! Message ID:",
        messageEdited: "Message edited successfully! Message ID:",
        fileSent: "File sent successfully! File ID:",
        failed: "Failed to send/edit Telegram message:",
        telegramApiError: "Telegram API error:",
        requestFailed: "Request failed:",
        retryAttempt: "Retry attempt",
        maxRetriesReached: "Maximum retry attempts reached",
        conditionalSkip:
          "Skipping notification due to conditional sending rules",
        templateNotFound: "Template not found:",
        fileNotFound: "File not found:",
        invalidFileType: "Invalid file type:",
      },
      ru: {
        tokenRequired: "Требуется TELEGRAM_TOKEN",
        chatIdRequired: "Требуется CHAT_ID",
        messageOrFileRequired: "Требуется MESSAGE, FILE_PATH или TEMPLATE",
        sendingMessage: "Отправка нового сообщения в Telegram...",
        sendingFile: "Отправка файла в Telegram...",
        sendingToThread: "Отправка сообщения в тред:",
        editingMessage: "Редактирование сообщения с ID:",
        messageSent: "Сообщение отправлено успешно! ID сообщения:",
        messageEdited: "Сообщение отредактировано успешно! ID сообщения:",
        fileSent: "Файл отправлен успешно! ID файла:",
        failed: "Не удалось отправить/отредактировать сообщение Telegram:",
        telegramApiError: "Ошибка Telegram API:",
        requestFailed: "Запрос не выполнен:",
        retryAttempt: "Попытка повтора",
        maxRetriesReached: "Достигнуто максимальное количество попыток",
        conditionalSkip: "Пропуск уведомления из-за условных правил отправки",
        templateNotFound: "Шаблон не найден:",
        fileNotFound: "Файл не найден:",
        invalidFileType: "Недопустимый тип файла:",
      },
      zh: {
        tokenRequired: "需要 TELEGRAM_TOKEN",
        chatIdRequired: "需要 CHAT_ID",
        messageOrFileRequired: "需要 MESSAGE、FILE_PATH 或 TEMPLATE",
        sendingMessage: "正在发送新的 Telegram 消息...",
        sendingFile: "正在发送文件到 Telegram...",
        sendingToThread: "向主题发送消息:",
        editingMessage: "正在编辑消息，ID:",
        messageSent: "消息发送成功！消息 ID:",
        messageEdited: "消息编辑成功！消息 ID:",
        fileSent: "文件发送成功！文件 ID:",
        failed: "发送/编辑 Telegram 消息失败:",
        telegramApiError: "Telegram API 错误:",
        requestFailed: "请求失败:",
        retryAttempt: "重试尝试",
        maxRetriesReached: "已达到最大重试次数",
        conditionalSkip: "由于条件发送规则跳过通知",
        templateNotFound: "模板未找到:",
        fileNotFound: "文件未找到:",
        invalidFileType: "无效的文件类型:",
      },
    };

    return messages[this.language] || messages.en;
  }

  /**
   * Get predefined message templates
   * 
   * Available templates:
   * - success ✅: For successful operations
   * - error ❌: For failed operations  
   * - warning ⚠️: For warnings and issues
   * - info ℹ️: For general information
   * - deploy 🚀: For deployments (can be used creatively for PRs)
   * - test 🧪: For test results (can be used for health checks)
   * - release 🎉: For new releases
   * 
   * Each template supports multiple languages: en, ru, zh
   */
  getMessageTemplates() {
    const templates = {
      success: {
        en: `✅ **Success**

Repository: {{repository}}
Branch: {{refName}}
Commit: {{sha}}
Actor: {{actor}}
Workflow: {{workflow}}

{{customMessage}}`,
        ru: `✅ **Успех**

Репозиторий: {{repository}}
Ветка: {{refName}}
Коммит: {{sha}}
Автор: {{actor}}
Workflow: {{workflow}}

{{customMessage}}`,
        zh: `✅ **成功**

仓库: {{repository}}
分支: {{refName}}
提交: {{sha}}
执行者: {{actor}}
工作流: {{workflow}}

{{customMessage}}`,
      },
      error: {
        en: `❌ **Error**

Repository: {{repository}}
Branch: {{refName}}
Commit: {{sha}}
Actor: {{actor}}
Workflow: {{workflow}}
Job Status: {{jobStatus}}

{{customMessage}}`,
        ru: `❌ **Ошибка**

Репозиторий: {{repository}}
Ветка: {{refName}}
Коммит: {{sha}}
Автор: {{actor}}
Workflow: {{workflow}}
Статус задачи: {{jobStatus}}

{{customMessage}}`,
        zh: `❌ **错误**

仓库: {{repository}}
分支: {{refName}}
提交: {{sha}}
执行者: {{actor}}
工作流: {{workflow}}
任务状态: {{jobStatus}}

{{customMessage}}`,
      },
      warning: {
        en: `⚠️ **Warning**

Repository: {{repository}}
Branch: {{refName}}
Workflow: {{workflow}}

{{customMessage}}`,
        ru: `⚠️ **Предупреждение**

Репозиторий: {{repository}}
Ветка: {{refName}}
Workflow: {{workflow}}

{{customMessage}}`,
        zh: `⚠️ **警告**

仓库: {{repository}}
分支: {{refName}}
工作流: {{workflow}}

{{customMessage}}`,
      },
      info: {
        en: `ℹ️ **Information**

Repository: {{repository}}
Branch: {{refName}}
Actor: {{actor}}

{{customMessage}}`,
        ru: `ℹ️ **Информация**

Репозиторий: {{repository}}
Ветка: {{refName}}
Автор: {{actor}}

{{customMessage}}`,
        zh: `ℹ️ **信息**

仓库: {{repository}}
分支: {{refName}}
执行者: {{actor}}

{{customMessage}}`,
      },
      deploy: {
        en: `🚀 **Deployment**

Repository: {{repository}}
Branch: {{refName}}
Commit: {{sha}}
Run: #{{runNumber}}

Deployed by: {{actor}}
Status: {{deployStatus}}

{{customMessage}}`,
        ru: `🚀 **Развертывание**

Репозиторий: {{repository}}
Ветка: {{refName}}
Коммит: {{sha}}
Запуск: #{{runNumber}}

Развернул: {{actor}}
Статус: {{deployStatus}}

{{customMessage}}`,
        zh: `🚀 **部署**

仓库: {{repository}}
分支: {{refName}}
提交: {{sha}}
运行: #{{runNumber}}

部署者: {{actor}}
状态: {{deployStatus}}

{{customMessage}}`,
      },
      test: {
        en: `🧪 **Test Results**

Repository: {{repository}}
Branch: {{refName}}
Commit: {{sha}}
Run: #{{runNumber}}

Test Status: {{testStatus}}
Coverage: {{coverage}}

{{customMessage}}`,
        ru: `🧪 **Результаты тестов**

Репозиторий: {{repository}}
Ветка: {{refName}}
Коммит: {{sha}}
Запуск: #{{runNumber}}

Статус тестов: {{testStatus}}
Покрытие: {{coverage}}

{{customMessage}}`,
        zh: `🧪 **测试结果**

仓库: {{repository}}
分支: {{refName}}
提交: {{sha}}
运行: #{{runNumber}}

测试状态: {{testStatus}}
覆盖率: {{coverage}}

{{customMessage}}`,
      },
      release: {
        en: `🎉 **New Release**

Repository: {{repository}}
Version: {{version}}
Tag: {{tag}}
Released by: {{actor}}

{{releaseNotes}}

{{customMessage}}`,
        ru: `🎉 **Новый релиз**

Репозиторий: {{repository}}
Версия: {{version}}
Тег: {{tag}}
Выпустил: {{actor}}

{{releaseNotes}}

{{customMessage}}`,
        zh: `🎉 **新版本发布**

仓库: {{repository}}
版本: {{version}}
标签: {{tag}}
发布者: {{actor}}

{{releaseNotes}}

{{customMessage}}`,
      },
    };

    return templates;
  }

  /**
   * Clean HTML content to remove unsupported tags
   */
  cleanHtmlContent(content) {
    if (!content) return content;

    // Telegram supports only these HTML tags: b, strong, i, em, u, ins, s, strike, del, span, tg-spoiler, a, code, pre
    const supportedTags = [
      "b",
      "strong",
      "i",
      "em",
      "u",
      "ins",
      "s",
      "strike",
      "del",
      "span",
      "tg-spoiler",
      "a",
      "code",
      "pre",
    ];

    let cleanContent = content;

    // Remove all HTML tags except supported ones
    cleanContent = cleanContent.replace(
      /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/gi,
      (match, tagName) => {
        if (supportedTags.includes(tagName.toLowerCase())) {
          return match; // Keep supported tags
        }
        return ""; // Remove unsupported tags
      }
    );

    // Also clean up any remaining malformed tags
    cleanContent = cleanContent.replace(/<[^>]*>/g, (match) => {
      // If it doesn't match a proper tag pattern, remove it
      if (!/^<\/?[a-zA-Z][a-zA-Z0-9]*(\s[^>]*)?>$/.test(match)) {
        return "";
      }
      return match;
    });

    return cleanContent;
  }

  /**
   * Process message template
   */
  processTemplate() {
    if (!this.template) return this.cleanHtmlContent(this.message);

    const templates = this.getMessageTemplates();
    const templateData = templates[this.template];

    if (!templateData) {
      throw new Error(`${this.messages.templateNotFound} ${this.template}`);
    }

    const templateText = templateData[this.language] || templateData.en;

    // Merge GitHub context with template variables
    const allVars = {
      ...this.githubContext,
      customMessage: this.message || "",
      ...this.templateVars,
    };

    // Replace template variables
    const processedText = templateText.replace(
      /\{\{(\w+)\}\}/g,
      (match, key) => {
        return allVars[key] || match;
      }
    );

    return this.cleanHtmlContent(processedText);
  }

  /**
   * Check if notification should be sent based on conditions
   */
  shouldSendNotification() {
    if (this.sendOnFailure && this.githubContext.jobStatus !== "failure") {
      this.info(this.messages.conditionalSkip);
      return false;
    }

    if (this.sendOnSuccess && this.githubContext.jobStatus !== "success") {
      this.info(this.messages.conditionalSkip);
      return false;
    }

    return true;
  }

  /**
   * Validate required inputs
   */
  validateInputs() {
    if (!this.token) {
      throw new Error(this.messages.tokenRequired);
    }
    if (!this.chatId) {
      throw new Error(this.messages.chatIdRequired);
    }
    if (!this.message && !this.filePath && !this.fileBase64 && !this.template) {
      throw new Error(this.messages.messageOrFileRequired);
    }
    if (this.fileBase64 && !this.fileName) {
      throw new Error("FILE_NAME is required when using FILE_BASE64");
    }
  }

  /**
   * Set GitHub Actions output
   */
  setOutput(name, value) {
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
      fs.appendFileSync(outputFile, `${name}=${value}\n`);
    } else {
      // Fallback to legacy format for older runners
      console.log(`::set-output name=${name}::${value}`);
    }
  }

  /**
   * Log info message
   */
  info(message) {
    console.log(`ℹ️ ${message}`);
  }

  /**
   * Log warning message
   */
  warning(message) {
    console.log(`⚠️ ${message}`);
  }

  /**
   * Log error message
   */
  error(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
  }

  /**
   * Log success message
   */
  success(message) {
    console.log(`✅ ${message}`);
  }

  /**
   * Sleep for specified milliseconds
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request to Telegram API with retry logic
   */
  async makeRequest(endpoint, payload, isFormData = false) {
    const url = `${this.baseUrl}/${endpoint}`;
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const options = {
          method: "POST",
        };

        if (isFormData) {
          options.body = payload;
        } else {
          options.headers = { "Content-Type": "application/json" };
          options.body = JSON.stringify(payload);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(
            `${this.messages.telegramApiError} ${
              data.description || "Unknown error"
            }`
          );
        }

        this.retryCount = attempt;
        return data;
      } catch (error) {
        lastError = error;

        // Handle rate limiting with longer delay
        if (error.message.includes("Too Many Requests")) {
          const retryAfterMatch = error.message.match(/retry after (\d+)/);
          const retryAfter = retryAfterMatch
            ? parseInt(retryAfterMatch[1])
            : 30;
          if (attempt < this.maxRetries) {
            this.warning(
              `Rate limited. Waiting ${retryAfter} seconds before retry...`
            );
            await this.sleep(retryAfter * 1000);
            continue; // Skip to next iteration immediately
          }
          // If we've reached max retries, break out of the loop
          break;
        }

        // Normal retry logic (only if not rate limited)
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt) * 1000; // Exponential backoff
          this.warning(
            `${this.messages.retryAttempt} ${attempt + 1}/${
              this.maxRetries + 1
            } after ${delay}ms`
          );
          await this.sleep(delay);
        }
      }
    }

    this.error(
      `${this.messages.maxRetriesReached}. ${this.messages.requestFailed} ${lastError.message}`
    );
  }
  prepareInlineKeyboard() {
    if (!this.inlineKeyboard) return null;

    let keyboard = this.inlineKeyboard;
    if (Array.isArray(keyboard) && keyboard.length > 0) {
      // If first element is not an array, wrap each button in an array
      if (!Array.isArray(keyboard[0])) {
        keyboard = keyboard.map((button) => [button]);
      }
      return { inline_keyboard: keyboard };
    }
    return null;
  }

  /**
  }

  /**
   * Prepare base message payload
   */
  getBasePayload() {
    const payload = {
      chat_id: this.chatId,
      parse_mode: this.parseMode,
      disable_web_page_preview: this.disableWebPagePreview,
      disable_notification: this.disableNotification,
    };

    // Add optional parameters
    if (this.messageThreadId) {
      payload.message_thread_id = parseInt(this.messageThreadId);
    }
    if (this.replyToMessageId) {
      payload.reply_to_message_id = parseInt(this.replyToMessageId);
    }
    if (this.protectContent) {
      payload.protect_content = this.protectContent;
    }
    if (this.allowSendingWithoutReply !== undefined) {
      payload.allow_sending_without_reply = this.allowSendingWithoutReply;
    }
    if (this.messageEffectId) {
      payload.message_effect_id = this.messageEffectId;
    }
    if (this.businessConnectionId) {
      payload.business_connection_id = this.businessConnectionId;
    }
    if (this.inlineKeyboard) {
      let keyboard = Array.isArray(this.inlineKeyboard)
        ? this.inlineKeyboard
        : [this.inlineKeyboard];
      if (keyboard.length > 0 && !Array.isArray(keyboard[0])) {
        keyboard = keyboard.map((button) => [button]);
      }
      payload.reply_markup = { inline_keyboard: keyboard };
    }

    return payload;
  }

  /**
   * Send file to Telegram
   */
  async sendFile() {
    const validFileTypes = [
      "photo",
      "document",
      "video",
      "audio",
      "animation",
      "voice",
      "video_note",
      "sticker",
    ];
    if (!validFileTypes.includes(this.fileType)) {
      throw new Error(`${this.messages.invalidFileType} ${this.fileType}`);
    }

    let fileBuffer, fileName, fileSize;

    // Handle file from path or base64
    if (this.filePath) {
      if (!fs.existsSync(this.filePath)) {
        throw new Error(`${this.messages.fileNotFound} ${this.filePath}`);
      }
      fileBuffer = fs.readFileSync(this.filePath);
      fileName = path.basename(this.filePath);
      const stats = fs.statSync(this.filePath);
      fileSize = stats.size;
    } else if (this.fileBase64) {
      try {
        fileBuffer = Buffer.from(this.fileBase64, "base64");
        fileName = this.fileName;
        fileSize = fileBuffer.length;
      } catch (error) {
        throw new Error(`Invalid base64 data: ${error.message}`);
      }
    } else {
      throw new Error("Either FILE_PATH or FILE_BASE64 must be provided");
    }

    const formData = new FormData();

    // Check file size limits
    const maxSizes = {
      photo: 10 * 1024 * 1024, // 10MB for photos
      document: 50 * 1024 * 1024, // 50MB for documents
      video: 50 * 1024 * 1024, // 50MB for videos
      audio: 50 * 1024 * 1024, // 50MB for audio
      animation: 50 * 1024 * 1024, // 50MB for animations
      voice: 50 * 1024 * 1024, // 50MB for voice
      video_note: 50 * 1024 * 1024, // 50MB for video notes
      sticker: 512 * 1024, // 512KB for stickers
    };

    const maxSize = maxSizes[this.fileType] || 50 * 1024 * 1024;
    if (fileSize > maxSize) {
      throw new Error(
        `File too large: ${(fileSize / 1024 / 1024).toFixed(
          2
        )}MB. Max allowed: ${(maxSize / 1024 / 1024).toFixed(2)}MB for ${
          this.fileType
        }`
      );
    }

    this.info(
      `File info: ${fileName} (${(fileSize / 1024).toFixed(2)}KB, type: ${
        this.fileType
      })`
    );

    // Detect MIME type based on file extension
    const mimeTypes = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".tiff": "image/tiff",
      ".mp4": "video/mp4",
      ".avi": "video/avi",
      ".mov": "video/quicktime",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".ogg": "audio/ogg",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const ext = path.extname(fileName).toLowerCase();
    const mimeType = mimeTypes[ext] || "application/octet-stream";

    // Special handling for PNG files with metadata (like C2PA)
    const processedBuffer = fileBuffer;

    // Detect if this is a PNG file (either from extension or signature)
    const isPNG =
      ext === ".png" ||
      (fileBuffer.length >= 8 &&
        fileBuffer
          .slice(0, 8)
          .equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
          ));

    if (isPNG && this.fileType === "photo") {
      // Look for C2PA or other problematic chunks
      const bufferStr = fileBuffer.toString("binary");
      if (
        bufferStr.includes("c2pa") ||
        bufferStr.includes("C2PA") ||
        bufferStr.includes("jumb")
      ) {
        const source = this.filePath
          ? `file ${fileName}`
          : `base64 data ${fileName}`;
        if (this.forceAsPhoto) {
          this.warning(
            `PNG ${source} contains C2PA metadata which may cause processing issues. Forcing to send as photo as requested (force_as_photo=true).`
          );
        } else {
          this.warning(
            `PNG ${source} contains C2PA metadata which may cause processing issues. Consider using document type instead of photo.`
          );

          // Try sending as document instead of photo if it's a photo
          if (this.fileType === "photo") {
            this.warning(
              "Switching from photo to document type for better compatibility..."
            );
            this.fileType = "document";
          }
        }
      }
    }

    // Create a Blob from the buffer with proper MIME type
    const blob = new Blob([processedBuffer], { type: mimeType });
    formData.append(this.fileType, blob, fileName);

    // Add other parameters
    const payload = this.getBasePayload();
    Object.keys(payload).forEach((key) => {
      if (payload[key] !== undefined) {
        formData.append(
          key,
          typeof payload[key] === "object"
            ? JSON.stringify(payload[key])
            : payload[key]
        );
      }
    });

    if (this.caption) {
      formData.append("caption", this.caption);
    }

    const endpoint =
      this.fileType === "photo"
        ? "sendPhoto"
        : this.fileType === "video"
        ? "sendVideo"
        : this.fileType === "audio"
        ? "sendAudio"
        : this.fileType === "animation"
        ? "sendAnimation"
        : this.fileType === "voice"
        ? "sendVoice"
        : this.fileType === "video_note"
        ? "sendVideoNote"
        : this.fileType === "sticker"
        ? "sendSticker"
        : "sendDocument";

    this.info(this.messages.sendingFile);
    const response = await this.makeRequest(endpoint, formData, true);

    return {
      messageId: response.result.message_id,
      fileId:
        response.result[this.fileType]?.file_id ||
        response.result.document?.file_id,
    };
  }

  /**
   * Send new message
   */
  async sendMessage() {
    const finalMessage = this.processTemplate();
    const payload = {
      ...this.getBasePayload(),
      text: finalMessage,
    };

    if (this.messageThreadId) {
      this.info(`${this.messages.sendingToThread} ${this.messageThreadId}`);
    }

    this.info(this.messages.sendingMessage);
    const response = await this.makeRequest("sendMessage", payload);

    return response.result.message_id;
  }

  /**
   * Edit existing message
   */
  async editMessage() {
    const finalMessage = this.processTemplate();
    const payload = {
      chat_id: this.chatId,
      message_id: parseInt(this.messageId),
      text: finalMessage,
      parse_mode: this.parseMode,
      disable_web_page_preview: this.disableWebPagePreview,
    };
    if (this.inlineKeyboard) {
      let keyboard = Array.isArray(this.inlineKeyboard)
        ? this.inlineKeyboard
        : [this.inlineKeyboard];
      if (keyboard.length > 0 && !Array.isArray(keyboard[0])) {
        keyboard = keyboard.map((button) => [button]);
      }
      payload.reply_markup = { inline_keyboard: keyboard };
    }

    this.info(`${this.messages.editingMessage} ${this.messageId}`);
    await this.makeRequest("editMessageText", payload);

    return this.messageId;
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      this.validateInputs();

      if (!this.shouldSendNotification()) {
        this.setOutput("success", "true");
        this.setOutput("message_id", "");
        this.setOutput("retry_count", "0");
        return;
      }

      let messageId, fileId;

      if (this.filePath || this.fileBase64) {
        // Send file
        const result = await this.sendFile();
        messageId = result.messageId;
        fileId = result.fileId;
        this.success(`${this.messages.fileSent} ${fileId}`);
      } else if (this.messageId) {
        // Edit existing message
        messageId = await this.editMessage();
        this.success(`${this.messages.messageEdited} ${messageId}`);
      } else {
        // Send new message
        messageId = await this.sendMessage();
        this.success(`${this.messages.messageSent} ${messageId}`);
      }

      // Set outputs for GitHub Actions
      this.setOutput("message_id", messageId);
      this.setOutput("success", "true");
      this.setOutput("file_id", fileId || "");
      this.setOutput("retry_count", this.retryCount.toString());
    } catch (error) {
      this.error(`${this.messages.failed} ${error.message}`);
      this.setOutput("success", "false");
      this.setOutput("retry_count", this.retryCount.toString());
    }
  }
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TelegramNotify };
}

// Execute the action only when run directly (not when imported)
if (require.main === module) {
  const telegramNotify = new TelegramNotify();
  telegramNotify.run();
}

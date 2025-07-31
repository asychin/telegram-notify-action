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
  const { FormData: FormDataPolyfill } = require('formdata-polyfill/esm');
  const fetchPolyfill = require('node-fetch');
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
    this.disableWebPagePreview = process.env.DISABLE_WEB_PAGE_PREVIEW === "true";
    this.disableNotification = process.env.DISABLE_NOTIFICATION === "true";
    this.language = process.env.LANGUAGE || "en";

    // Enhanced parameters
    this.replyToMessageId = process.env.REPLY_TO_MESSAGE_ID;
    this.protectContent = process.env.PROTECT_CONTENT === "true";
    this.allowSendingWithoutReply = process.env.ALLOW_SENDING_WITHOUT_REPLY !== "false";
    this.messageEffectId = process.env.MESSAGE_EFFECT_ID;
    this.businessConnectionId = process.env.BUSINESS_CONNECTION_ID;

    // File support
    this.filePath = process.env.FILE_PATH;
    this.fileType = process.env.FILE_TYPE || "document";
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
      jobStatus: process.env.JOB_STATUS
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
      this.warning(`Failed to parse JSON: ${jsonString}. Error: ${error.message}`);
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
        messageOrFileRequired: "Either MESSAGE, FILE_PATH, or TEMPLATE is required",
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
        conditionalSkip: "Skipping notification due to conditional sending rules",
        templateNotFound: "Template not found:",
        fileNotFound: "File not found:",
        invalidFileType: "Invalid file type:"
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
        invalidFileType: "Недопустимый тип файла:"
      }
    };

    return messages[this.language] || messages.en;
  }

  /**
   * Get predefined message templates
   */
  getMessageTemplates() {
    const templates = {
      success: {
        en: `✅ <b>Success</b>

Repository: {{repository}}
Branch: {{refName}}
Commit: {{sha}}
Actor: {{actor}}
Workflow: {{workflow}}

{{customMessage}}`,
        ru: `✅ <b>Успех</b>

Репозиторий: {{repository}}
Ветка: {{refName}}
Коммит: {{sha}}
Автор: {{actor}}
Workflow: {{workflow}}

{{customMessage}}`
      },
      error: {
        en: `❌ <b>Error</b>

Repository: {{repository}}
Branch: {{refName}}
Commit: {{sha}}
Actor: {{actor}}
Workflow: {{workflow}}
Job Status: {{jobStatus}}

{{customMessage}}`,
        ru: `❌ <b>Ошибка</b>

Репозиторий: {{repository}}
Ветка: {{refName}}
Коммит: {{sha}}
Автор: {{actor}}
Workflow: {{workflow}}
Статус задачи: {{jobStatus}}

{{customMessage}}`
      },
      warning: {
        en: `⚠️ <b>Warning</b>

Repository: {{repository}}
Branch: {{refName}}
Workflow: {{workflow}}

{{customMessage}}`,
        ru: `⚠️ <b>Предупреждение</b>

Репозиторий: {{repository}}
Ветка: {{refName}}
Workflow: {{workflow}}

{{customMessage}}`
      },
      info: {
        en: `ℹ️ <b>Information</b>

Repository: {{repository}}
Branch: {{refName}}
Actor: {{actor}}

{{customMessage}}`,
        ru: `ℹ️ <b>Информация</b>

Репозиторий: {{repository}}
Ветка: {{refName}}
Автор: {{actor}}

{{customMessage}}`
      },
      deploy: {
        en: `🚀 <b>Deployment</b>

Repository: {{repository}}
Branch: {{refName}}
Commit: {{sha}}
Run: #{{runNumber}}

Deployed by: {{actor}}
Status: {{deployStatus}}

{{customMessage}}`,
        ru: `🚀 <b>Развертывание</b>

Репозиторий: {{repository}}
Ветка: {{refName}}
Коммит: {{sha}}
Запуск: #{{runNumber}}

Развернул: {{actor}}
Статус: {{deployStatus}}

{{customMessage}}`
      },
      test: {
        en: `🧪 <b>Test Results</b>

Repository: {{repository}}
Branch: {{refName}}
Commit: {{sha}}
Run: #{{runNumber}}

Test Status: {{testStatus}}
Coverage: {{coverage}}

{{customMessage}}`,
        ru: `🧪 <b>Результаты тестов</b>

Репозиторий: {{repository}}
Ветка: {{refName}}
Коммит: {{sha}}
Запуск: #{{runNumber}}

Статус тестов: {{testStatus}}
Покрытие: {{coverage}}

{{customMessage}}`
      },
      release: {
        en: `🎉 <b>New Release</b>

Repository: {{repository}}
Version: {{version}}
Tag: {{tag}}
Released by: {{actor}}

{{releaseNotes}}

{{customMessage}}`,
        ru: `🎉 <b>Новый релиз</b>

Репозиторий: {{repository}}
Версия: {{version}}
Тег: {{tag}}
Выпустил: {{actor}}

{{releaseNotes}}

{{customMessage}}`
      }
    };

    return templates;
  }

  /**
   * Process message template
   */
  processTemplate() {
    if (!this.template) return this.message;

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
      ...this.templateVars
    };

    // Replace template variables
    return templateText.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return allVars[key] || match;
    });
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
    if (!this.message && !this.filePath && !this.template) {
      throw new Error(this.messages.messageOrFileRequired);
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
    return new Promise(resolve => setTimeout(resolve, ms));
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
          method: "POST"
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
            `${this.messages.telegramApiError} ${data.description || "Unknown error"}`
          );
        }

        this.retryCount = attempt;
        return data;
      } catch (error) {
        lastError = error;
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt) * 1000; // Exponential backoff
          this.warning(`${this.messages.retryAttempt} ${attempt + 1}/${this.maxRetries + 1} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    this.error(`${this.messages.maxRetriesReached}. ${this.messages.requestFailed} ${lastError.message}`);
  }

  /**
   * Prepare base message payload
   */
  getBasePayload() {
    const payload = {
      chat_id: this.chatId,
      parse_mode: this.parseMode,
      disable_web_page_preview: this.disableWebPagePreview,
      disable_notification: this.disableNotification
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
      payload.reply_markup = {
        inline_keyboard: this.inlineKeyboard
      };
    }

    return payload;
  }

  /**
   * Send file to Telegram
   */
  async sendFile() {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`${this.messages.fileNotFound} ${this.filePath}`);
    }

    const validFileTypes = ['photo', 'document', 'video', 'audio', 'animation', 'voice', 'video_note', 'sticker'];
    if (!validFileTypes.includes(this.fileType)) {
      throw new Error(`${this.messages.invalidFileType} ${this.fileType}`);
    }

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(this.filePath);
    const fileName = path.basename(this.filePath);
    
    // Create a Blob from the buffer
    const blob = new Blob([fileBuffer]);
    formData.append(this.fileType, blob, fileName);

    // Add other parameters
    const payload = this.getBasePayload();
    Object.keys(payload).forEach(key => {
      if (payload[key] !== undefined) {
        formData.append(key, typeof payload[key] === 'object' ? JSON.stringify(payload[key]) : payload[key]);
      }
    });

    if (this.caption) {
      formData.append('caption', this.caption);
    }

    const endpoint = this.fileType === 'photo' ? 'sendPhoto' : 
                    this.fileType === 'video' ? 'sendVideo' :
                    this.fileType === 'audio' ? 'sendAudio' :
                    this.fileType === 'animation' ? 'sendAnimation' :
                    this.fileType === 'voice' ? 'sendVoice' :
                    this.fileType === 'video_note' ? 'sendVideoNote' :
                    this.fileType === 'sticker' ? 'sendSticker' :
                    'sendDocument';

    this.info(this.messages.sendingFile);
    const response = await this.makeRequest(endpoint, formData, true);

    return {
      messageId: response.result.message_id,
      fileId: response.result[this.fileType]?.file_id || response.result.document?.file_id
    };
  }

  /**
   * Send new message
   */
  async sendMessage() {
    const finalMessage = this.processTemplate();
    const payload = {
      ...this.getBasePayload(),
      text: finalMessage
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
      disable_web_page_preview: this.disableWebPagePreview
    };

    if (this.inlineKeyboard) {
      payload.reply_markup = {
        inline_keyboard: this.inlineKeyboard
      };
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

      if (this.filePath) {
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
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TelegramNotify };
}

// Execute the action only when run directly (not when imported)
if (require.main === module) {
  const telegramNotify = new TelegramNotify();
  telegramNotify.run();
}

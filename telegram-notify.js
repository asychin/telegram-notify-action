#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Telegram Notify Action
 * Sends or updates Telegram messages with support for topics/threads
 */

class TelegramNotify {
  constructor() {
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

    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    this.messages = this.getLocalizedMessages();
  }

  /**
   * Get localized messages
   */
  getLocalizedMessages() {
    const messages = {
      en: {
        tokenRequired: "TELEGRAM_TOKEN is required",
        chatIdRequired: "CHAT_ID is required",
        messageRequired: "MESSAGE is required",
        sendingMessage: "Sending new Telegram message...",
        sendingToThread: "Sending message to thread:",
        editingMessage: "Editing message with ID:",
        messageSent: "Message sent successfully! Message ID:",
        messageEdited: "Message edited successfully! Message ID:",
        failed: "Failed to send/edit Telegram message:",
        telegramApiError: "Telegram API error:",
        requestFailed: "Request failed:",
      },
      ru: {
        tokenRequired: "Требуется TELEGRAM_TOKEN",
        chatIdRequired: "Требуется CHAT_ID",
        messageRequired: "Требуется MESSAGE",
        sendingMessage: "Отправка нового сообщения в Telegram...",
        sendingToThread: "Отправка сообщения в тред:",
        editingMessage: "Редактирование сообщения с ID:",
        messageSent: "Сообщение отправлено успешно! ID сообщения:",
        messageEdited: "Сообщение отредактировано успешно! ID сообщения:",
        failed: "Не удалось отправить/отредактировать сообщение Telegram:",
        telegramApiError: "Ошибка Telegram API:",
        requestFailed: "Запрос не выполнен:",
      },
    };

    return messages[this.language] || messages.en;
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
    if (!this.message) {
      throw new Error(this.messages.messageRequired);
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
   * Make HTTP request to Telegram API
   */
  async makeRequest(endpoint, payload) {
    const url = `${this.baseUrl}/${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          `${this.messages.telegramApiError} ${
            data.description || "Unknown error"
          }`
        );
      }

      return data;
    } catch (error) {
      throw new Error(`${this.messages.requestFailed} ${error.message}`);
    }
  }

  /**
   * Send new message
   */
  async sendMessage() {
    const payload = {
      chat_id: this.chatId,
      text: this.message,
      parse_mode: this.parseMode,
      disable_web_page_preview: this.disableWebPagePreview,
      disable_notification: this.disableNotification,
    };

    // Add message_thread_id if provided (for topics/forums)
    if (this.messageThreadId) {
      payload.message_thread_id = parseInt(this.messageThreadId);
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
    const payload = {
      chat_id: this.chatId,
      message_id: parseInt(this.messageId),
      text: this.message,
      parse_mode: this.parseMode,
      disable_web_page_preview: this.disableWebPagePreview,
    };

    this.info(`${this.messages.editingMessage} ${this.messageId}`);
    const response = await this.makeRequest("editMessageText", payload);

    return this.messageId;
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      this.validateInputs();

      let messageId;

      if (this.messageId) {
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
    } catch (error) {
      this.error(`${this.messages.failed} ${error.message}`);
      this.setOutput("success", "false");
    }
  }
}

// Execute the action
const telegramNotify = new TelegramNotify();
telegramNotify.run();

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
        this.parseMode = process.env.PARSE_MODE || 'HTML';
        this.disableWebPagePreview = process.env.DISABLE_WEB_PAGE_PREVIEW === 'true';
        this.disableNotification = process.env.DISABLE_NOTIFICATION === 'true';
        
        this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    }

    /**
     * Validate required inputs
     */
    validateInputs() {
        if (!this.token) {
            throw new Error('TELEGRAM_TOKEN is required');
        }
        if (!this.chatId) {
            throw new Error('CHAT_ID is required');
        }
        if (!this.message) {
            throw new Error('MESSAGE is required');
        }
    }

    /**
     * Set GitHub Actions output
     */
    setOutput(name, value) {
        const outputFile = process.env.GITHUB_OUTPUT;
        if (outputFile) {
            fs.appendFileSync(outputFile, `${name}=${value}\n`);
        }
        console.log(`::set-output name=${name}::${value}`);
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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (!response.ok || !data.ok) {
                throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
            }

            return data;
        } catch (error) {
            throw new Error(`Request failed: ${error.message}`);
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
            disable_notification: this.disableNotification
        };

        // Add message_thread_id if provided (for topics/forums)
        if (this.messageThreadId) {
            payload.message_thread_id = parseInt(this.messageThreadId);
            this.info(`Sending message to thread: ${this.messageThreadId}`);
        }

        this.info('Sending new Telegram message...');
        const response = await this.makeRequest('sendMessage', payload);
        
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
            disable_web_page_preview: this.disableWebPagePreview
        };

        this.info(`Editing message with ID: ${this.messageId}`);
        const response = await this.makeRequest('editMessageText', payload);
        
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
                this.success(`Message edited successfully! Message ID: ${messageId}`);
            } else {
                // Send new message
                messageId = await this.sendMessage();
                this.success(`Message sent successfully! Message ID: ${messageId}`);
            }

            // Set outputs for GitHub Actions
            this.setOutput('message_id', messageId);
            this.setOutput('success', 'true');

        } catch (error) {
            this.error(`Failed to send/edit Telegram message: ${error.message}`);
            this.setOutput('success', 'false');
        }
    }
}

// Execute the action
const telegramNotify = new TelegramNotify();
telegramNotify.run();
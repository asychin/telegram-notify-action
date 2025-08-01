#!/usr/bin/env node

// Debug script to test template processing

process.env.TELEGRAM_TOKEN = "test_token";
process.env.CHAT_ID = "test_chat_id";
process.env.GITHUB_REPOSITORY = "asychin/telegram-notify-action";
process.env.GITHUB_HEAD_REF = "feature/fix-formatting";
process.env.GITHUB_REF_NAME = "7/merge";
process.env.GITHUB_SHA = "c2ddf796d38d90d05b65fea71069d02c53e5dc2a";
process.env.GITHUB_ACTOR = "asychin";
process.env.GITHUB_RUN_NUMBER = "42";

// Test 1: HTML mode formatting
console.log("=== Test 1: HTML mode formatting ===");
process.env.PARSE_MODE = "HTML";
process.env.TEMPLATE = "success";
process.env.MESSAGE = "Deployment completed successfully!";

const originalMain = require.main;
require.main = null;

const TelegramNotify = require("./telegram-notify.js");
const notifier1 = new TelegramNotify();
const result1 = notifier1.processTemplate();
console.log("Result 1:");
console.log(result1);
console.log();

// Test 2: Markdown mode with customMessage
console.log("=== Test 2: Markdown mode with customMessage ===");
process.env.PARSE_MODE = "Markdown";
process.env.TEMPLATE = "deploy";
process.env.MESSAGE = "This is a test message";

delete require.cache[require.resolve("./telegram-notify.js")];
const notifier2 = new TelegramNotify();
const result2 = notifier2.processTemplate();
console.log("Result 2:");
console.log(result2);
console.log();

// Test 3: HTML mode with customMessage
console.log("=== Test 3: HTML mode with customMessage ===");
process.env.PARSE_MODE = "HTML";
process.env.TEMPLATE = "deploy";
process.env.MESSAGE = "This is a test message";

delete require.cache[require.resolve("./telegram-notify.js")];
const notifier3 = new TelegramNotify();
const result3 = notifier3.processTemplate();
console.log("Result 3:");
console.log(result3);

require.main = originalMain;

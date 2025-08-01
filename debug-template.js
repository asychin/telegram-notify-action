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
process.env.GITHUB_EVENT_NAME = "push";

// Create mock event data file
const fs = require("fs");
const path = require("path");
const eventFile = path.join(__dirname, "mock-event.json");

const mockEventData = {
  ref: "refs/heads/main",
  pusher: {
    name: "asychin",
    id: 12345,
  },
  head_commit: {
    message: "Fix template variables in deploy template",
    timestamp: "2024-08-01T14:30:00Z",
    author: {
      name: "Sychin Andrey",
    },
  },
  commits: [
    {
      id: "c2ddf796d38d90d05b65fea71069d02c53e5dc2a",
      message: "Fix template variables in deploy template",
      author: {
        name: "Sychin Andrey",
      },
      added: ["new-file.js"],
      removed: ["old-file.js"],
      modified: ["telegram-notify.js", "README.md"],
    },
  ],
};

fs.writeFileSync(eventFile, JSON.stringify(mockEventData, null, 2));
process.env.GITHUB_EVENT_PATH = eventFile;

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
console.log();

// Test 4: Russian deploy template
console.log("=== Test 4: Russian deploy template ===");
process.env.PARSE_MODE = "Markdown";
process.env.TEMPLATE = "deploy";
process.env.MESSAGE = "Тестовое сообщение деплоя";
process.env.LANGUAGE = "ru";

delete require.cache[require.resolve("./telegram-notify.js")];
const notifier4 = new TelegramNotify();
const result4 = notifier4.processTemplate();
console.log("Result 4:");
console.log(result4);

// Test 5: Release template
console.log();
console.log("=== Test 5: Release template ===");

// Mock release event data
const releaseEventData = {
  release: {
    name: "v3.1.0 - Deploy Template Fix",
    tag_name: "v3.1.0", 
    author: { login: "asychin" },
    body: "Bug fixes and improvements for deploy template variable substitution. Fixed 'dry data' issues and enhanced event context extraction.",
    prerelease: false,
    draft: false,
    created_at: "2025-01-31T10:30:00Z"
  }
};

const releaseEventFile = path.join(__dirname, "mock-release-event.json");
fs.writeFileSync(releaseEventFile, JSON.stringify(releaseEventData, null, 2));

process.env.GITHUB_EVENT_NAME = "release";
process.env.GITHUB_EVENT_PATH = releaseEventFile;
process.env.PARSE_MODE = "Markdown";
process.env.TEMPLATE = "release";
process.env.MESSAGE = "Release notification test";
process.env.LANGUAGE = "en";
process.env.TEMPLATE_VARS = JSON.stringify({
  "customMessage": "New release v3.1.0 is now available with bug fixes!"
});

delete require.cache[require.resolve("./telegram-notify.js")];
const notifier5 = new TelegramNotify();
const result5 = notifier5.processTemplate();
console.log("Result 5:");
console.log(result5);

require.main = originalMain;

// Clean up mock event files
try {
  fs.unlinkSync(eventFile);
  fs.unlinkSync(releaseEventFile);
} catch (error) {
  // Ignore cleanup errors
}

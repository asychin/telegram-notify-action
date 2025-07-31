#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Mock environment variables
process.env.TELEGRAM_TOKEN = "test_token";
process.env.CHAT_ID = "test_chat_id";
process.env.GITHUB_REPOSITORY = "user/test-repo";
process.env.GITHUB_REF_NAME = "main";
process.env.GITHUB_SHA = "abc123";
process.env.GITHUB_ACTOR = "test-user";
process.env.GITHUB_WORKFLOW = "Test Workflow";
process.env.GITHUB_JOB = "test-job";
process.env.GITHUB_RUN_ID = "123456";
process.env.GITHUB_RUN_NUMBER = "42";
process.env.GITHUB_EVENT_NAME = "issues";
process.env.JOB_STATUS = "success";

// Create mock event data
const mockEventData = {
  action: "opened",
  issue: {
    number: 123,
    title: "Test Issue",
    body: "This is a test issue",
    state: "open",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:35:00Z",
    user: {
      login: "issue-author",
      id: 12345,
    },
    labels: [{ name: "bug" }, { name: "urgent" }],
    assignees: [{ login: "assignee1" }, { login: "assignee2" }],
  },
  sender: {
    login: "trigger-user",
    id: 67890,
  },
};

// Create temporary event file
const tempEventPath = path.join(__dirname, "temp-event.json");
fs.writeFileSync(tempEventPath, JSON.stringify(mockEventData, null, 2));
process.env.GITHUB_EVENT_PATH = tempEventPath;

// Import and test TelegramNotify
const TelegramNotify = require("../telegram-notify.js");

console.log("🧪 Testing Auto Context Variables...\n");

try {
  const notifier = new TelegramNotify();

  // Test getEventContext method
  const eventContext = notifier.getEventContext();

  console.log("✅ Automatic Event Variables:");
  console.log(JSON.stringify(eventContext, null, 2));

  // Test expected variables for issues event
  const expectedVars = [
    "triggerUser",
    "triggerUserId",
    "author",
    "issueNumber",
    "issueTitle",
    "issueState",
    "issueBody",
    "createdAt",
    "updatedAt",
    "labels",
    "assignees",
    "action",
  ];

  console.log("\n🔍 Variable Verification:");
  let allGood = true;

  for (const expectedVar of expectedVars) {
    if (eventContext.hasOwnProperty(expectedVar)) {
      console.log(`✅ ${expectedVar}: ${eventContext[expectedVar]}`);
    } else {
      console.log(`❌ Missing: ${expectedVar}`);
      allGood = false;
    }
  }

  // Test template processing with automatic variables
  console.log("\n🎨 Template Processing Test:");

  // Create test template
  process.env.TEMPLATE = "info";
  process.env.MESSAGE = "Issue {{issueNumber}} by {{author}} with {{labels}}";
  process.env.TEMPLATE_VARS = JSON.stringify({
    customVar: "Custom Value",
  });

  const templateText = notifier.processTemplate();
  console.log("Processed template:", templateText);

  if (allGood) {
    console.log(
      "\n🎉 All tests passed! Auto context variables are working correctly."
    );
  } else {
    console.log("\n❌ Some tests failed. Check the implementation.");
  }
} catch (error) {
  console.error("❌ Test failed:", error.message);
  console.error(error.stack);
} finally {
  // Clean up temp file
  if (fs.existsSync(tempEventPath)) {
    fs.unlinkSync(tempEventPath);
  }
}

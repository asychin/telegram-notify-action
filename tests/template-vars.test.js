const fs = require("fs");
const path = require("path");

// Mock environment variables for testing
const originalEnv = process.env;

describe("Template Variables in template_vars", () => {
  let mockEventPath;

  beforeEach(() => {
    // Reset environment
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // Set up basic GitHub context
    process.env.GITHUB_REPOSITORY = "test/repo";
    process.env.GITHUB_REF_NAME = "main";
    process.env.GITHUB_SHA = "abc123456789";
    process.env.GITHUB_RUN_NUMBER = "42";
    process.env.GITHUB_ACTOR = "testuser";
    process.env.GITHUB_EVENT_NAME = "pull_request";
    
    // Create mock event file
    const mockEventData = {
      pull_request: {
        number: 123,
        title: "Test PR",
        state: "open",
        user: {
          login: "testuser"
        }
      }
    };
    
    mockEventPath = path.join(__dirname, "mock-event.json");
    fs.writeFileSync(mockEventPath, JSON.stringify(mockEventData, null, 2));
    process.env.GITHUB_EVENT_PATH = mockEventPath;
  });

  afterEach(() => {
    // Clean up
    process.env = originalEnv;
    if (fs.existsSync(mockEventPath)) {
      fs.unlinkSync(mockEventPath);
    }
  });

  test("should process template variables in template_vars JSON", () => {
    // Set template_vars with template variables inside
    process.env.TEMPLATE_VARS = JSON.stringify({
      "deployStatus": "success",
      "customMessage": "Pull Request {{prNumber}} in repository {{repositoryName}}"
    });

    const TelegramNotify = require("../telegram-notify.js");
    const notifier = new TelegramNotify();

    // Check that template variables were processed correctly
    expect(notifier.templateVars).toBeDefined();
    expect(notifier.templateVars.deployStatus).toBe("success");
    expect(notifier.templateVars.customMessage).toBe("Pull Request 123 in repository repo");
  });

  test("should handle multiple template variables in template_vars", () => {
    process.env.TEMPLATE_VARS = JSON.stringify({
      "message": "Repository: {{repositoryName}}, PR: {{prNumber}}, Actor: {{actor}}",
      "url": "https://github.com/{{repository}}/pull/{{prNumber}}"
    });

    const TelegramNotify = require("../telegram-notify.js");
    const notifier = new TelegramNotify();

    expect(notifier.templateVars.message).toBe("Repository: repo, PR: 123, Actor: testuser");
    expect(notifier.templateVars.url).toBe("https://github.com/test/repo/pull/123");
  });

  test("should leave unknown template variables unchanged", () => {
    process.env.TEMPLATE_VARS = JSON.stringify({
      "message": "Known: {{prNumber}}, Unknown: {{unknownVariable}}"
    });

    const TelegramNotify = require("../telegram-notify.js");
    const notifier = new TelegramNotify();

    expect(notifier.templateVars.message).toBe("Known: 123, Unknown: {{unknownVariable}}");
  });

  test("should handle template_vars without template variables", () => {
    process.env.TEMPLATE_VARS = JSON.stringify({
      "simpleMessage": "No template variables here",
      "number": 42
    });

    const TelegramNotify = require("../telegram-notify.js");
    const notifier = new TelegramNotify();

    expect(notifier.templateVars.simpleMessage).toBe("No template variables here");
    expect(notifier.templateVars.number).toBe(42);
  });

  test("should handle invalid JSON gracefully", () => {
    process.env.TEMPLATE_VARS = "invalid json with {{prNumber}}";

    const TelegramNotify = require("../telegram-notify.js");
    const notifier = new TelegramNotify();

    expect(notifier.templateVars).toEqual({});
  });

  test("should handle empty template_vars", () => {
    process.env.TEMPLATE_VARS = "";

    const TelegramNotify = require("../telegram-notify.js");
    const notifier = new TelegramNotify();

    expect(notifier.templateVars).toEqual({});
  });
});
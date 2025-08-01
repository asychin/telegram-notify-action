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

  test("should use correct branch name for pull request events", () => {
    // Mock PR event with different head and merge refs
    const mockEventData = {
      pull_request: {
        number: 456,
        title: "Feature PR",
        state: "open",
        user: { login: "testuser" },
        head: { ref: "feature/awesome-feature" },
        base: { ref: "main" }
      }
    };

    const fs = require("fs");
    const path = require("path");
    const eventPath = path.join(__dirname, "pr-mock-event.json");
    fs.writeFileSync(eventPath, JSON.stringify(mockEventData, null, 2));
    process.env.GITHUB_EVENT_PATH = eventPath;
    process.env.GITHUB_REF_NAME = "456/merge"; // This is the merge ref

    process.env.TEMPLATE_VARS = JSON.stringify({
      "message": "Branch: {{branchName}}, RefName: {{refName}}"
    });

    const TelegramNotify = require("../telegram-notify.js");
    const notifier = new TelegramNotify();

    // branchName should use headBranch (real branch), not refName (merge ref)
    expect(notifier.templateVars.message).toBe("Branch: feature/awesome-feature, RefName: 456/merge");

    // Clean up
    fs.unlinkSync(eventPath);
  });

  test("should provide rich PR statistics in detailed templates", () => {
    // Mock detailed PR event
    const mockEventData = {
      pull_request: {
        number: 789,
        title: "Feature: Add awesome functionality",
        state: "open",
        user: { login: "developer" },
        head: { ref: "feature/awesome" },
        base: { ref: "main" },
        created_at: "2025-01-01T12:00:00Z",
        html_url: "https://github.com/test/repo/pull/789",
        commits: 5,
        additions: 150,
        deletions: 25,
        changed_files: 3,
        comments: 2,
        review_comments: 4,
        labels: [{ name: "feature" }, { name: "enhancement" }],
        assignees: [{ login: "reviewer" }]
      }
    };

    const fs = require("fs");
    const path = require("path");
    const eventPath = path.join(__dirname, "rich-pr-mock-event.json");
    fs.writeFileSync(eventPath, JSON.stringify(mockEventData, null, 2));
    process.env.GITHUB_EVENT_PATH = eventPath;
    process.env.GITHUB_REF_NAME = "789/merge";

    const TelegramNotify = require("../telegram-notify.js");
    const notifier = new TelegramNotify();
    const eventContext = notifier.getEventContext();

    // Verify rich statistics are available
    expect(eventContext.branchComparison).toBe("feature/awesome → main");
    expect(eventContext.changesStats).toBe("+150 ➕ -25 ➖");
    expect(eventContext.prChangedFiles).toBe(3);
    expect(eventContext.prCommits).toBe(5);
    expect(eventContext.prAdditions).toBe(150);
    expect(eventContext.prDeletions).toBe(25);
    expect(eventContext.prComments).toBe(2);
    expect(eventContext.prReviewComments).toBe(4);

    // Clean up
    fs.unlinkSync(eventPath);
  });
});
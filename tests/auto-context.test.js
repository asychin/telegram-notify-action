const fs = require("fs");
const path = require("path");

describe("Auto Context Variables Tests", () => {
  let originalEnv;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
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
  });
  
  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    // Clear require cache
    delete require.cache[require.resolve("../telegram-notify.js")];
  });

  test("Auto context variables are extracted correctly from GitHub events", () => {
    // Prevent script execution
    const originalMain = require.main;
    require.main = null;
    
    try {
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
            login: "john-doe",
            id: 54321,
          },
          labels: [
            { name: "bug" },
            { name: "enhancement" },
          ],
          assignees: [
            { login: "assignee1" },
            { login: "assignee2" },
          ],
        },
        sender: {
          login: "event-sender",
          id: 98765,
        },
      };

      // Create temporary event file
      const tempEventPath = path.join(__dirname, "..", "event.json");
      fs.writeFileSync(tempEventPath, JSON.stringify(mockEventData, null, 2));

      // Set the event path
      process.env.GITHUB_EVENT_PATH = tempEventPath;

      const TelegramNotify = require("../telegram-notify.js");
      const notifier = new TelegramNotify();

      // Test basic GitHub context
      const basicVars = [
        "repository",
        "refName", 
        "sha",
        "actor",
        "workflow",
        "job",
        "runId",
        "runNumber",
        "eventName",
        "jobStatus",
      ];

      for (const varName of basicVars) {
        const value = notifier.githubContext[varName];
        expect(value).toBeDefined();
      }

      // Test automatic event context extraction
      const eventContext = notifier.getEventContext();

      const expectedVars = [
        "triggerUser",
        "triggerUserId", 
        "action",
        "author",
        "issueNumber",
        "issueTitle",
        "issueState",
        "issueBody",
        "labels",
        "assignees",
        "createdAt",
        "updatedAt",
      ];

      for (const expectedVar of expectedVars) {
        expect(eventContext).toHaveProperty(expectedVar);
      }

      // Test template processing with automatic variables
      process.env.TEMPLATE = "info";
      process.env.MESSAGE = "Issue {{issueNumber}} by {{author}} with {{labels}}";
      
      // Create a new instance with updated env
      const notifierForTemplate = new TelegramNotify();
      const templateText = notifierForTemplate.processTemplate();
      
      expect(typeof templateText).toBe("string");
      expect(templateText.length).toBeGreaterThan(0);

      // Clean up temp file
      if (fs.existsSync(tempEventPath)) {
        fs.unlinkSync(tempEventPath);
      }
      
    } finally {
      require.main = originalMain;
    }
  });
});
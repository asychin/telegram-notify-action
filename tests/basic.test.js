const fs = require("fs");
const path = require("path");

describe("Telegram Notify Action - Basic Tests", () => {
  test("action.yml exists and has required fields", () => {
    const actionPath = path.join(__dirname, "..", "action.yml");
    expect(fs.existsSync(actionPath)).toBe(true);

    const actionContent = fs.readFileSync(actionPath, "utf8");
    expect(actionContent).toContain("name:");
    expect(actionContent).toContain("telegram_token");
    expect(actionContent).toContain("chat_id");
    expect(actionContent).toContain("runs:");
  });

  test("telegram-notify.js exists and is executable", () => {
    const scriptPath = path.join(__dirname, "..", "telegram-notify.js");
    expect(fs.existsSync(scriptPath)).toBe(true);

    const scriptContent = fs.readFileSync(scriptPath, "utf8");
    expect(scriptContent).toContain("class TelegramNotify");
    expect(scriptContent).toContain("module.exports");
  });

  test("package.json has correct configuration", () => {
    const packagePath = path.join(__dirname, "..", "package.json");
    expect(fs.existsSync(packagePath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    expect(packageJson.name).toBe("telegram-notify-action");
    expect(packageJson.version).toBe("3.2.1");
    expect(packageJson.main).toBe("telegram-notify.js");
  });

  test("TelegramNotify class can be imported", () => {
    // Prevent script execution by mocking require.main
    const originalMain = require.main;
    require.main = null;

    try {
      const telegramModule = require("../telegram-notify.js");
      expect(telegramModule).toBeDefined();
      expect(telegramModule.TelegramNotify).toBeDefined();
      expect(typeof telegramModule.TelegramNotify).toBe("function");
    } finally {
      require.main = originalMain;
      // Clear require cache
      delete require.cache[require.resolve("../telegram-notify.js")];
    }
  });

  test("TelegramNotify class can be instantiated with environment variables", () => {
    // Mock environment
    const originalEnv = { ...process.env };
    process.env.TELEGRAM_TOKEN = "test_token";
    process.env.CHAT_ID = "123456789";
    process.env.MESSAGE = "Test message";
    process.env.LANGUAGE = "en";

    // Prevent script execution
    const originalMain = require.main;
    require.main = null;

    try {
      const { TelegramNotify } = require("../telegram-notify.js");
      const notify = new TelegramNotify();

      expect(notify.token).toBe("test_token");
      expect(notify.chatId).toBe("123456789");
      expect(notify.message).toBe("Test message");
      expect(notify.language).toBe("en");
      expect(notify.maxRetries).toBe(5);
      expect(notify.retryDelay).toBe(1);
    } finally {
      // Restore environment
      process.env = originalEnv;
      require.main = originalMain;
      delete require.cache[require.resolve("../telegram-notify.js")];
    }
  });

  test("Input validation works correctly", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      const { TelegramNotify } = require("../telegram-notify.js");

      // Test missing token
      process.env = { CHAT_ID: "123", MESSAGE: "test" };
      let notify = new TelegramNotify();
      expect(() => notify.validateInputs()).toThrow(
        "TELEGRAM_TOKEN is required"
      );

      // Test missing chat_id
      process.env = { TELEGRAM_TOKEN: "token", MESSAGE: "test" };
      notify = new TelegramNotify();
      expect(() => notify.validateInputs()).toThrow("CHAT_ID is required");

      // Test missing message/file/template
      process.env = { TELEGRAM_TOKEN: "token", CHAT_ID: "123" };
      notify = new TelegramNotify();
      expect(() => notify.validateInputs()).toThrow(
        "Either MESSAGE, FILE_PATH, or TEMPLATE is required"
      );

      // Test valid inputs
      process.env = {
        TELEGRAM_TOKEN: "token",
        CHAT_ID: "123",
        MESSAGE: "test",
      };
      notify = new TelegramNotify();
      expect(() => notify.validateInputs()).not.toThrow();
    } finally {
      require.main = originalMain;
      delete require.cache[require.resolve("../telegram-notify.js")];
    }
  });
});

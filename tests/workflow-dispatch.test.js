const fs = require('fs');
const path = require('path');
const TelegramNotify = require('../telegram-notify.js');

describe('Telegram Notify - Workflow Dispatch Tests', () => {
  let tempEventPath;
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set up basic environment variables
    process.env.TELEGRAM_TOKEN = 'fake_token';
    process.env.CHAT_ID = 'fake_chat';
    process.env.GITHUB_REPOSITORY = 'test/repo';
    process.env.GITHUB_SERVER_URL = 'https://github.com';
    process.env.GITHUB_ACTOR = 'testuser';
    
    // Create temporary event file path
    tempEventPath = path.join(__dirname, 'temp-workflow-dispatch-event.json');
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    
    // Clean up temp file
    if (fs.existsSync(tempEventPath)) {
      fs.unlinkSync(tempEventPath);
    }
  });

  test('workflow_dispatch with version input creates proper release context', () => {
    // Create mock event data for workflow_dispatch with inputs
    const eventData = {
      inputs: {
        version: 'v3.0.0',
        prerelease: false
      }
    };
    
    fs.writeFileSync(tempEventPath, JSON.stringify(eventData));
    process.env.GITHUB_EVENT_PATH = tempEventPath;
    
    const notifier = new TelegramNotify();
    notifier.githubContext.eventName = 'workflow_dispatch';
    
    const eventContext = notifier.getEventContext();
    
    expect(eventContext.releaseTag).toBe('v3.0.0');
    expect(eventContext.releaseName).toBe('v3.0.0');
    expect(eventContext.isPrerelease).toBe(false);
    expect(eventContext.isDraft).toBe(false);
    expect(eventContext.releaseAuthor).toBe('testuser');
    expect(eventContext.releaseUrl).toBe('https://github.com/test/repo/releases/tag/v3.0.0');
    expect(eventContext.releaseBody).toBe('Release v3.0.0 triggered manually via workflow_dispatch');
    expect(eventContext.releaseNotes).toBe('Release v3.0.0 triggered manually via workflow_dispatch');
    expect(eventContext.releaseCreatedAt).toBeDefined();
  });

  test('workflow_dispatch with prerelease input sets correct flag', () => {
    // Create mock event data for workflow_dispatch with prerelease
    const eventData = {
      inputs: {
        version: 'v3.0.0-beta.1',
        prerelease: true
      }
    };
    
    fs.writeFileSync(tempEventPath, JSON.stringify(eventData));
    process.env.GITHUB_EVENT_PATH = tempEventPath;
    
    const notifier = new TelegramNotify();
    notifier.githubContext.eventName = 'workflow_dispatch';
    
    const eventContext = notifier.getEventContext();
    
    expect(eventContext.releaseTag).toBe('v3.0.0-beta.1');
    expect(eventContext.isPrerelease).toBe(true);
  });

  test('workflow_dispatch without inputs returns empty context', () => {
    // Create mock event data for workflow_dispatch without inputs
    const eventData = {};
    
    fs.writeFileSync(tempEventPath, JSON.stringify(eventData));
    process.env.GITHUB_EVENT_PATH = tempEventPath;
    
    const notifier = new TelegramNotify();
    notifier.githubContext.eventName = 'workflow_dispatch';
    
    const eventContext = notifier.getEventContext();
    
    expect(Object.keys(eventContext)).toHaveLength(0);
  });

  test('variable replacement works correctly with workflow_dispatch', () => {
    // Create mock event data for workflow_dispatch with inputs
    const eventData = {
      inputs: {
        version: 'v3.0.0',
        prerelease: false
      }
    };
    
    fs.writeFileSync(tempEventPath, JSON.stringify(eventData));
    process.env.GITHUB_EVENT_PATH = tempEventPath;
    process.env.MESSAGE = 'Release {{releaseTag}} at {{releaseUrl}}';
    
    const notifier = new TelegramNotify();
    notifier.githubContext.eventName = 'workflow_dispatch';
    
    const processedMessage = notifier.processTemplate();
    
    expect(processedMessage).toBe('Release v3.0.0 at https://github.com/test/repo/releases/tag/v3.0.0');
  });

  test('inline keyboard URL replacement works correctly', () => {
    // Create mock event data for workflow_dispatch with inputs
    const eventData = {
      inputs: {
        version: 'v3.0.0',
        prerelease: false
      }
    };
    
    fs.writeFileSync(tempEventPath, JSON.stringify(eventData));
    process.env.GITHUB_EVENT_PATH = tempEventPath;
    process.env.INLINE_KEYBOARD = JSON.stringify([{text: '📥 Download', url: '{{releaseUrl}}'}]);
    
    const notifier = new TelegramNotify();
    notifier.githubContext.eventName = 'workflow_dispatch';
    
    const keyboard = notifier.prepareInlineKeyboard();
    
    expect(keyboard).toEqual({
      inline_keyboard: [
        [
          {
            text: '📥 Download',
            url: 'https://github.com/test/repo/releases/tag/v3.0.0'
          }
        ]
      ]
    });
  });

  test('undefined variables are preserved in URLs', () => {
    // Create mock event data for workflow_dispatch without inputs
    const eventData = {};
    
    fs.writeFileSync(tempEventPath, JSON.stringify(eventData));
    process.env.GITHUB_EVENT_PATH = tempEventPath;
    process.env.INLINE_KEYBOARD = JSON.stringify([{text: '📥 Download', url: '{{releaseUrl}}'}]);
    
    const notifier = new TelegramNotify();
    notifier.githubContext.eventName = 'workflow_dispatch';
    
    const keyboard = notifier.prepareInlineKeyboard();
    
    expect(keyboard).toEqual({
      inline_keyboard: [
        [
          {
            text: '📥 Download',
            url: '{{releaseUrl}}'  // Should remain unchanged
          }
        ]
      ]
    });
  });
});
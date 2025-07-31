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

  test('pull_request event creates proper PR context', () => {
    // Create mock event data for pull_request
    const eventData = {
      pull_request: {
        number: 123,
        title: 'Test PR',
        html_url: 'https://github.com/test/repo/pull/123',
        body: 'This is a test PR',
        user: {
          login: 'pr-author'
        },
        base: {
          ref: 'main'
        },
        head: {
          ref: 'feature-branch',
          sha: 'abc123def456'
        },
        commits: 5,
        additions: 100,
        deletions: 20,
        changed_files: 3
      }
    };
    
    fs.writeFileSync(tempEventPath, JSON.stringify(eventData));
    process.env.GITHUB_EVENT_PATH = tempEventPath;
    
    const notifier = new TelegramNotify();
    notifier.githubContext.eventName = 'pull_request';
    
    const eventContext = notifier.getEventContext();
    
    expect(eventContext.prNumber).toBe(123);
    expect(eventContext.prTitle).toBe('Test PR');
    expect(eventContext.prUrl).toBe('https://github.com/test/repo/pull/123');
    expect(eventContext.prBody).toBe('This is a test PR');
    expect(eventContext.author).toBe('pr-author');
    expect(eventContext.prBaseRef).toBe('main');
    expect(eventContext.prHeadRef).toBe('feature-branch');
    expect(eventContext.prHeadSha).toBe('abc123def456');
    expect(eventContext.prCommits).toBe(5);
    expect(eventContext.prAdditions).toBe(100);
    expect(eventContext.prDeletions).toBe(20);
    expect(eventContext.prChangedFiles).toBe(3);
  });

  test('pull_request_review event includes prUrl', () => {
    // Create mock event data for pull_request_review
    const eventData = {
      pull_request: {
        number: 123,
        title: 'Test PR',
        html_url: 'https://github.com/test/repo/pull/123',
        user: {
          login: 'pr-author'
        }
      },
      review: {
        user: {
          login: 'reviewer'
        },
        state: 'approved',
        body: 'LGTM!',
        id: 456
      }
    };
    
    fs.writeFileSync(tempEventPath, JSON.stringify(eventData));
    process.env.GITHUB_EVENT_PATH = tempEventPath;
    
    const notifier = new TelegramNotify();
    notifier.githubContext.eventName = 'pull_request_review';
    
    const eventContext = notifier.getEventContext();
    
    expect(eventContext.prNumber).toBe(123);
    expect(eventContext.prTitle).toBe('Test PR');
    expect(eventContext.prUrl).toBe('https://github.com/test/repo/pull/123');
    expect(eventContext.author).toBe('pr-author');
    expect(eventContext.reviewAuthor).toBe('reviewer');
    expect(eventContext.reviewState).toBe('approved');
    expect(eventContext.reviewBody).toBe('LGTM!');
    expect(eventContext.reviewId).toBe(456);
  });
});
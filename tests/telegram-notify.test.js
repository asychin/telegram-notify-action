const fs = require('fs');
const path = require('path');

// Mock fetch globally
global.fetch = jest.fn();
global.FormData = jest.fn();

// Mock fs methods
jest.mock('fs');

describe('TelegramNotify', () => {
  let TelegramNotify;
  let originalEnv;

  beforeAll(() => {
    // Import the class after mocking
    delete require.cache[require.resolve('../telegram-notify.js')];
    const telegramModule = require('../telegram-notify.js');
    TelegramNotify = telegramModule.TelegramNotify || 
      // If exported differently, try to extract from the file
      eval(fs.readFileSync(path.join(__dirname, '../telegram-notify.js'), 'utf8').replace('const telegramNotify = new TelegramNotify();\ntelegramNotify.run();', '') + '; TelegramNotify');
  });

  beforeEach(() => {
    originalEnv = process.env;
    process.env = {
      TELEGRAM_TOKEN: 'test_token',
      CHAT_ID: '123456789',
      MESSAGE: 'Test message',
      LANGUAGE: 'en'
    };
    
    fetch.mockClear();
    fs.existsSync.mockClear();
    fs.readFileSync.mockClear();
    fs.appendFileSync.mockClear();
    
    // Mock successful API response
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ok: true,
        result: {
          message_id: 123,
          document: { file_id: 'file123' }
        }
      })
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with basic configuration', () => {
      const notify = new TelegramNotify();
      
      expect(notify.token).toBe('test_token');
      expect(notify.chatId).toBe('123456789');
      expect(notify.message).toBe('Test message');
      expect(notify.language).toBe('en');
      expect(notify.maxRetries).toBe(3);
      expect(notify.retryDelay).toBe(1);
    });

    test('should initialize with enhanced parameters', () => {
      process.env.REPLY_TO_MESSAGE_ID = '456';
      process.env.PROTECT_CONTENT = 'true';
      process.env.FILE_PATH = '/path/to/file.jpg';
      process.env.FILE_TYPE = 'photo';
      process.env.TEMPLATE = 'success';
      process.env.MAX_RETRIES = '5';

      const notify = new TelegramNotify();

      expect(notify.replyToMessageId).toBe('456');
      expect(notify.protectContent).toBe(true);
      expect(notify.filePath).toBe('/path/to/file.jpg');
      expect(notify.fileType).toBe('photo');
      expect(notify.template).toBe('success');
      expect(notify.maxRetries).toBe(5);
    });

    test('should parse JSON parameters correctly', () => {
      process.env.TEMPLATE_VARS = '{"customVar": "value"}';
      process.env.INLINE_KEYBOARD = '[{"text": "Button", "callback_data": "data"}]';

      const notify = new TelegramNotify();

      expect(notify.templateVars).toEqual({ customVar: 'value' });
      expect(notify.inlineKeyboard).toEqual([{ text: 'Button', callback_data: 'data' }]);
    });

    test('should handle invalid JSON gracefully', () => {
      process.env.TEMPLATE_VARS = 'invalid json';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const notify = new TelegramNotify();

      expect(notify.templateVars).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to parse JSON'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Input Validation', () => {
    test('should throw error when TELEGRAM_TOKEN is missing', () => {
      delete process.env.TELEGRAM_TOKEN;
      const notify = new TelegramNotify();

      expect(() => notify.validateInputs()).toThrow('TELEGRAM_TOKEN is required');
    });

    test('should throw error when CHAT_ID is missing', () => {
      delete process.env.CHAT_ID;
      const notify = new TelegramNotify();

      expect(() => notify.validateInputs()).toThrow('CHAT_ID is required');
    });

    test('should throw error when MESSAGE, FILE_PATH, and TEMPLATE are all missing', () => {
      delete process.env.MESSAGE;
      const notify = new TelegramNotify();

      expect(() => notify.validateInputs()).toThrow('Either MESSAGE, FILE_PATH, or TEMPLATE is required');
    });

    test('should pass validation with only FILE_PATH', () => {
      delete process.env.MESSAGE;
      process.env.FILE_PATH = '/path/to/file.jpg';
      const notify = new TelegramNotify();

      expect(() => notify.validateInputs()).not.toThrow();
    });

    test('should pass validation with only TEMPLATE', () => {
      delete process.env.MESSAGE;
      process.env.TEMPLATE = 'success';
      const notify = new TelegramNotify();

      expect(() => notify.validateInputs()).not.toThrow();
    });
  });

  describe('Template Processing', () => {
    test('should return original message when no template is specified', () => {
      const notify = new TelegramNotify();
      const result = notify.processTemplate();

      expect(result).toBe('Test message');
    });

    test('should process success template correctly', () => {
      process.env.TEMPLATE = 'success';
      process.env.GITHUB_REPOSITORY = 'user/repo';
      process.env.GITHUB_REF_NAME = 'main';
      process.env.GITHUB_ACTOR = 'testuser';

      const notify = new TelegramNotify();
      const result = notify.processTemplate();

      expect(result).toContain('✅');
      expect(result).toContain('Success');
      expect(result).toContain('user/repo');
      expect(result).toContain('main');
      expect(result).toContain('testuser');
      expect(result).toContain('Test message');
    });

    test('should process error template correctly', () => {
      process.env.TEMPLATE = 'error';
      process.env.GITHUB_REPOSITORY = 'user/repo';
      process.env.JOB_STATUS = 'failure';

      const notify = new TelegramNotify();
      const result = notify.processTemplate();

      expect(result).toContain('❌');
      expect(result).toContain('Error');
      expect(result).toContain('failure');
    });

    test('should substitute custom template variables', () => {
      process.env.TEMPLATE = 'deploy';
      process.env.TEMPLATE_VARS = '{"deployStatus": "successful", "customMessage": "Deployment completed"}';
      process.env.MESSAGE = '';

      const notify = new TelegramNotify();
      const result = notify.processTemplate();

      expect(result).toContain('successful');
      expect(result).toContain('Deployment completed');
    });

    test('should throw error for unknown template', () => {
      process.env.TEMPLATE = 'unknown_template';
      const notify = new TelegramNotify();

      expect(() => notify.processTemplate()).toThrow('Template not found: unknown_template');
    });

    test('should use Russian template when language is ru', () => {
      process.env.TEMPLATE = 'success';
      process.env.LANGUAGE = 'ru';
      
      const notify = new TelegramNotify();
      const result = notify.processTemplate();

      expect(result).toContain('Успех');
      expect(result).toContain('Репозиторий');
    });
  });

  describe('Conditional Sending', () => {
    test('should send notification when no conditions are set', () => {
      const notify = new TelegramNotify();
      expect(notify.shouldSendNotification()).toBe(true);
    });

    test('should skip notification when send_on_failure is true but job succeeded', () => {
      process.env.SEND_ON_FAILURE = 'true';
      process.env.JOB_STATUS = 'success';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const notify = new TelegramNotify();
      const result = notify.shouldSendNotification();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping notification'));
      
      consoleSpy.mockRestore();
    });

    test('should send notification when send_on_failure is true and job failed', () => {
      process.env.SEND_ON_FAILURE = 'true';
      process.env.JOB_STATUS = 'failure';

      const notify = new TelegramNotify();
      expect(notify.shouldSendNotification()).toBe(true);
    });

    test('should skip notification when send_on_success is true but job failed', () => {
      process.env.SEND_ON_SUCCESS = 'true';
      process.env.JOB_STATUS = 'failure';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const notify = new TelegramNotify();
      const result = notify.shouldSendNotification();

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('Message Sending', () => {
    test('should send simple message successfully', async () => {
      const notify = new TelegramNotify();
      const messageId = await notify.sendMessage();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bot/test_token/sendMessage',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"text":"Test message"')
        })
      );
      expect(messageId).toBe(123);
    });

    test('should include thread ID when specified', async () => {
      process.env.MESSAGE_THREAD_ID = '456';
      const notify = new TelegramNotify();
      
      await notify.sendMessage();

      const callArgs = fetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.message_thread_id).toBe(456);
    });

    test('should include inline keyboard when specified', async () => {
      process.env.INLINE_KEYBOARD = '[{"text": "Button", "callback_data": "data"}]';
      const notify = new TelegramNotify();
      
      await notify.sendMessage();

      const callArgs = fetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.reply_markup.inline_keyboard).toEqual([{ text: 'Button', callback_data: 'data' }]);
    });

    test('should edit existing message', async () => {
      process.env.MESSAGE_ID = '789';
      const notify = new TelegramNotify();
      
      const messageId = await notify.editMessage();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bot/test_token/editMessageText',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"message_id":789')
        })
      );
      expect(messageId).toBe('789');
    });
  });

  describe('File Sending', () => {
    beforeEach(() => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(Buffer.from('fake file content'));
      global.FormData.mockImplementation(() => ({
        append: jest.fn()
      }));
      global.Blob = jest.fn();
    });

    test('should send file successfully', async () => {
      process.env.FILE_PATH = '/path/to/file.jpg';
      process.env.FILE_TYPE = 'photo';
      process.env.CAPTION = 'Test caption';
      
      const notify = new TelegramNotify();
      const result = await notify.sendFile();

      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/file.jpg');
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/file.jpg');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bot/test_token/sendPhoto',
        expect.objectContaining({
          method: 'POST'
        })
      );
      expect(result.messageId).toBe(123);
    });

    test('should throw error when file does not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      process.env.FILE_PATH = '/nonexistent/file.jpg';
      
      const notify = new TelegramNotify();
      
      await expect(notify.sendFile()).rejects.toThrow('File not found: /nonexistent/file.jpg');
    });

    test('should throw error for invalid file type', async () => {
      process.env.FILE_PATH = '/path/to/file.jpg';
      process.env.FILE_TYPE = 'invalid_type';
      
      const notify = new TelegramNotify();
      
      await expect(notify.sendFile()).rejects.toThrow('Invalid file type: invalid_type');
    });

    test('should use correct endpoint for different file types', async () => {
      const testCases = [
        { fileType: 'document', endpoint: 'sendDocument' },
        { fileType: 'video', endpoint: 'sendVideo' },
        { fileType: 'audio', endpoint: 'sendAudio' },
        { fileType: 'animation', endpoint: 'sendAnimation' }
      ];

      for (const testCase of testCases) {
        fetch.mockClear();
        process.env.FILE_PATH = '/path/to/file';
        process.env.FILE_TYPE = testCase.fileType;
        
        const notify = new TelegramNotify();
        await notify.sendFile();

        expect(fetch).toHaveBeenCalledWith(
          `https://api.telegram.org/bot/test_token/${testCase.endpoint}`,
          expect.any(Object)
        );
      }
    });
  });

  describe('Retry Logic', () => {
    test('should retry on failure with exponential backoff', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            ok: true,
            result: { message_id: 123 }
          })
        });

      const notify = new TelegramNotify();
      const sleepSpy = jest.spyOn(notify, 'sleep').mockResolvedValue();
      const warningSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await notify.makeRequest('sendMessage', { test: 'data' });

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(sleepSpy).toHaveBeenCalledTimes(2);
      expect(sleepSpy).toHaveBeenNthCalledWith(1, 1000); // 1 second
      expect(sleepSpy).toHaveBeenNthCalledWith(2, 2000); // 2 seconds
      expect(result.result.message_id).toBe(123);

      sleepSpy.mockRestore();
      warningSpy.mockRestore();
    });

    test('should fail after maximum retries', async () => {
      fetch.mockRejectedValue(new Error('Persistent error'));
      
      const notify = new TelegramNotify();
      const sleepSpy = jest.spyOn(notify, 'sleep').mockResolvedValue();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation();

      await notify.makeRequest('sendMessage', { test: 'data' });

      expect(fetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(exitSpy).toHaveBeenCalledWith(1);

      sleepSpy.mockRestore();
      exitSpy.mockRestore();
    });

    test('should respect custom retry settings', async () => {
      process.env.MAX_RETRIES = '1';
      process.env.RETRY_DELAY = '2';
      
      fetch.mockRejectedValue(new Error('Error'));
      
      const notify = new TelegramNotify();
      const sleepSpy = jest.spyOn(notify, 'sleep').mockResolvedValue();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation();

      await notify.makeRequest('sendMessage', { test: 'data' });

      expect(fetch).toHaveBeenCalledTimes(2); // Initial + 1 retry
      expect(sleepSpy).toHaveBeenCalledWith(2000); // 2 seconds

      sleepSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('Output Setting', () => {
    test('should set GitHub Actions output correctly', () => {
      process.env.GITHUB_OUTPUT = '/tmp/github_output';
      fs.appendFileSync.mockImplementation();

      const notify = new TelegramNotify();
      notify.setOutput('test_key', 'test_value');

      expect(fs.appendFileSync).toHaveBeenCalledWith('/tmp/github_output', 'test_key=test_value\n');
    });

    test('should fallback to legacy output format', () => {
      delete process.env.GITHUB_OUTPUT;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const notify = new TelegramNotify();
      notify.setOutput('test_key', 'test_value');

      expect(consoleSpy).toHaveBeenCalledWith('::set-output name=test_key::test_value');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Full Integration', () => {
    test('should run complete workflow successfully', async () => {
      const notify = new TelegramNotify();
      const setOutputSpy = jest.spyOn(notify, 'setOutput').mockImplementation();

      await notify.run();

      expect(setOutputSpy).toHaveBeenCalledWith('message_id', 123);
      expect(setOutputSpy).toHaveBeenCalledWith('success', 'true');
      expect(setOutputSpy).toHaveBeenCalledWith('retry_count', '0');

      setOutputSpy.mockRestore();
    });

    test('should skip notification when conditions not met', async () => {
      process.env.SEND_ON_FAILURE = 'true';
      process.env.JOB_STATUS = 'success';
      
      const notify = new TelegramNotify();
      const setOutputSpy = jest.spyOn(notify, 'setOutput').mockImplementation();

      await notify.run();

      expect(fetch).not.toHaveBeenCalled();
      expect(setOutputSpy).toHaveBeenCalledWith('success', 'true');
      expect(setOutputSpy).toHaveBeenCalledWith('message_id', '');

      setOutputSpy.mockRestore();
    });

    test('should handle file sending in full workflow', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(Buffer.from('fake file'));
      process.env.FILE_PATH = '/path/to/file.jpg';
      process.env.FILE_TYPE = 'photo';
      delete process.env.MESSAGE;

      const notify = new TelegramNotify();
      const setOutputSpy = jest.spyOn(notify, 'setOutput').mockImplementation();

      await notify.run();

      expect(setOutputSpy).toHaveBeenCalledWith('message_id', 123);
      expect(setOutputSpy).toHaveBeenCalledWith('file_id', 'file123');

      setOutputSpy.mockRestore();
    });
  });

  describe('Localization', () => {
    test('should use English messages by default', () => {
      const notify = new TelegramNotify();
      expect(notify.messages.sendingMessage).toBe('Sending new Telegram message...');
    });

    test('should use Russian messages when language is ru', () => {
      process.env.LANGUAGE = 'ru';
      const notify = new TelegramNotify();
      expect(notify.messages.sendingMessage).toBe('Отправка нового сообщения в Telegram...');
    });

    test('should fallback to English for unknown language', () => {
      process.env.LANGUAGE = 'unknown';
      const notify = new TelegramNotify();
      expect(notify.messages.sendingMessage).toBe('Sending new Telegram message...');
    });
  });
});
// Test script for HTML cleaning functionality
const { TelegramNotify } = require('./telegram-notify.js');

// Mock environment to prevent execution
process.env.TELEGRAM_TOKEN = 'test';
process.env.CHAT_ID = '123';
process.env.MESSAGE = 'Test message with <picture>invalid tag</picture> and <b>valid tag</b>';

// Prevent script execution
require.main = null;

const notify = new TelegramNotify();

// Test HTML cleaning
const testMessages = [
  'Simple message without HTML',
  'Message with <b>bold</b> text',
  'Message with <picture>invalid tag</picture>',
  'Message with <div>unsupported div</div> and <i>italic</i>',
  'Complex message with <img src="test.jpg"/> and <code>code</code>',
  'Message with <span class="test">span</span> and <strong>strong</strong>'
];

console.log('Testing HTML cleaning functionality:\n');

testMessages.forEach((msg, index) => {
  const cleaned = notify.cleanHtmlContent(msg);
  console.log(`Test ${index + 1}:`);
  console.log(`Original: ${msg}`);
  console.log(`Cleaned:  ${cleaned}`);
  console.log('');
});

console.log('HTML cleaning test completed!');
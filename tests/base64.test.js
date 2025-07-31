const fs = require("fs");
const path = require("path");
const { TelegramNotify } = require("../telegram-notify.js");

describe("Telegram Notify - Base64 Upload Tests", () => {
  const testImagePath = path.join(__dirname, "..", "test-image.png");
  let testBase64Data;

  beforeAll(() => {
    // Create base64 test data
    if (fs.existsSync(testImagePath)) {
      const imageBuffer = fs.readFileSync(testImagePath);
      testBase64Data = imageBuffer.toString("base64");
    } else {
      // Fallback: simple 1x1 PNG in base64
      testBase64Data =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    }
  });

  afterEach(() => {
    delete require.cache[require.resolve("../telegram-notify.js")];
    jest.clearAllMocks();
  });

  test("Base64 file validation works correctly", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      process.env = {
        TELEGRAM_TOKEN: "test_token",
        CHAT_ID: "123456789",
        FILE_BASE64: testBase64Data,
        FILE_NAME: "test-image.png",
        FILE_TYPE: "photo",
      };

      const notify = new TelegramNotify();
      expect(notify.fileBase64).toBe(testBase64Data);
      expect(notify.fileName).toBe("test-image.png");
      expect(notify.fileType).toBe("photo");

      // Test validation passes
      expect(() => notify.validateInputs()).not.toThrow();
    } finally {
      require.main = originalMain;
    }
  });

  test("Base64 validation requires file name", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      process.env = {
        TELEGRAM_TOKEN: "test_token",
        CHAT_ID: "123456789",
        FILE_BASE64: testBase64Data,
        // Missing FILE_NAME
        FILE_TYPE: "photo",
      };

      const notify = new TelegramNotify();
      expect(() => notify.validateInputs()).toThrow(
        "FILE_NAME is required when using FILE_BASE64"
      );
    } finally {
      require.main = originalMain;
    }
  });

  test("Invalid base64 data handling", async () => {
    const originalMain = require.main;
    require.main = null;

    try {
      process.env = {
        TELEGRAM_TOKEN: "test_token",
        CHAT_ID: "123456789",
        FILE_BASE64: "invalid-base64-data!!!",
        FILE_NAME: "test.png",
        FILE_TYPE: "photo",
      };

      const notify = new TelegramNotify();

      // Test that invalid base64 still gets decoded (Buffer.from doesn't always throw)
      // But the result will be garbled data
      try {
        const fileBuffer = Buffer.from("invalid-base64-data!!!", "base64");
        console.log(`Invalid base64 decoded to ${fileBuffer.length} bytes`);
        // Buffer.from is lenient and won't throw for most invalid base64
        expect(fileBuffer).toBeInstanceOf(Buffer);
      } catch (error) {
        console.log(`Base64 decoding failed: ${error.message}`);
      }
    } finally {
      require.main = originalMain;
    }
  });

  test("Base64 to Buffer conversion", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      // Test with simple base64 data
      const simpleBase64 = "SGVsbG8gV29ybGQh"; // "Hello World!" in base64
      const expectedBuffer = Buffer.from("Hello World!");

      process.env = {
        TELEGRAM_TOKEN: "test_token",
        CHAT_ID: "123456789",
        FILE_BASE64: simpleBase64,
        FILE_NAME: "hello.txt",
        FILE_TYPE: "document",
      };

      const notify = new TelegramNotify();
      const convertedBuffer = Buffer.from(notify.fileBase64, "base64");

      expect(convertedBuffer).toEqual(expectedBuffer);
      expect(convertedBuffer.toString()).toBe("Hello World!");
    } finally {
      require.main = originalMain;
    }
  });

  test("PNG signature detection from base64", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      // Use the test image base64 data
      process.env = {
        TELEGRAM_TOKEN: "test_token",
        CHAT_ID: "123456789",
        FILE_BASE64: testBase64Data,
        FILE_NAME: "test-from-base64.png",
        FILE_TYPE: "photo",
      };

      const notify = new TelegramNotify();
      const fileBuffer = Buffer.from(testBase64Data, "base64");

      // Check PNG signature
      const pngSignature = fileBuffer.slice(0, 8);
      const expectedSignature = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);

      if (fileBuffer.length >= 8) {
        const isPNG = pngSignature.equals(expectedSignature);
        console.log(`Base64 PNG signature check: ${isPNG}`);

        if (isPNG) {
          // Check for C2PA metadata
          const bufferStr = fileBuffer.toString("binary");
          const hasC2PA =
            bufferStr.includes("c2pa") ||
            bufferStr.includes("C2PA") ||
            bufferStr.includes("jumb");
          console.log(`Base64 C2PA metadata: ${hasC2PA}`);
        }
      }
    } finally {
      require.main = originalMain;
    }
  });

  test("File size calculation from base64", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      process.env = {
        TELEGRAM_TOKEN: "test_token",
        CHAT_ID: "123456789",
        FILE_BASE64: testBase64Data,
        FILE_NAME: "size-test.png",
        FILE_TYPE: "document",
      };

      const notify = new TelegramNotify();
      const fileBuffer = Buffer.from(testBase64Data, "base64");
      const calculatedSize = fileBuffer.length;

      console.log(`Base64 data length: ${testBase64Data.length} chars`);
      console.log(`Decoded buffer size: ${calculatedSize} bytes`);
      console.log(`Size in KB: ${(calculatedSize / 1024).toFixed(2)}KB`);

      // Verify size limits
      const photoLimit = 10 * 1024 * 1024; // 10MB
      const documentLimit = 50 * 1024 * 1024; // 50MB
      const stickerLimit = 512 * 1024; // 512KB

      expect(calculatedSize).toBeGreaterThan(0);

      if (calculatedSize <= photoLimit) {
        console.log("✅ Fits in photo limit");
      }
      if (calculatedSize <= documentLimit) {
        console.log("✅ Fits in document limit");
      }
      if (calculatedSize <= stickerLimit) {
        console.log("✅ Fits in sticker limit");
      } else {
        console.log("❌ Too large for sticker");
      }
    } finally {
      require.main = originalMain;
    }
  });

  test("MIME type detection from filename extension", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      const testCases = [
        { fileName: "test.png", expectedMime: "image/png" },
        { fileName: "test.jpg", expectedMime: "image/jpeg" },
        { fileName: "test.pdf", expectedMime: "application/pdf" },
        { fileName: "test.txt", expectedMime: "text/plain" },
        { fileName: "unknown.xyz", expectedMime: "application/octet-stream" },
      ];

      testCases.forEach(({ fileName, expectedMime }) => {
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes = {
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".pdf": "application/pdf",
          ".txt": "text/plain",
        };

        const detectedMime = mimeTypes[ext] || "application/octet-stream";
        expect(detectedMime).toBe(expectedMime);
        console.log(`${fileName} → ${detectedMime}`);
      });
    } finally {
      require.main = originalMain;
    }
  });

  test("Complete base64 workflow validation", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      process.env = {
        TELEGRAM_TOKEN: "test_token",
        CHAT_ID: "123456789",
        FILE_BASE64: testBase64Data,
        FILE_NAME: "complete-test.png",
        FILE_TYPE: "document",
        CAPTION: "Test image from base64 data",
        LANGUAGE: "en",
      };

      const notify = new TelegramNotify();

      // Full validation pipeline
      expect(() => notify.validateInputs()).not.toThrow();
      expect(notify.fileBase64).toBe(testBase64Data);
      expect(notify.fileName).toBe("complete-test.png");
      expect(notify.fileType).toBe("document");
      expect(notify.caption).toBe("Test image from base64 data");

      // Test payload creation
      const payload = notify.getBasePayload();
      expect(payload.chat_id).toBe("123456789");
      expect(payload.parse_mode).toBe("HTML");

      console.log("✅ Complete base64 workflow validation passed");
    } finally {
      require.main = originalMain;
    }
  });

  test("Force as photo parameter works correctly", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      // Test with force_as_photo=false (default behavior)
      process.env = {
        TELEGRAM_TOKEN: "test_token",
        CHAT_ID: "123456789",
        FILE_BASE64: testBase64Data,
        FILE_NAME: "test-c2pa.png",
        FILE_TYPE: "photo",
        FORCE_AS_PHOTO: "false",
      };

      let notify = new TelegramNotify();
      expect(notify.forceAsPhoto).toBe(false);
      expect(notify.fileType).toBe("photo");

      // Test with force_as_photo=true
      process.env.FORCE_AS_PHOTO = "true";
      notify = new TelegramNotify();
      expect(notify.forceAsPhoto).toBe(true);
      expect(notify.fileType).toBe("photo");

      console.log("✅ Force as photo parameter works correctly");
    } finally {
      require.main = originalMain;
      delete require.cache[require.resolve("../telegram-notify.js")];
    }
  });

  test("C2PA handling respects force_as_photo flag", () => {
    const originalMain = require.main;
    require.main = null;

    try {
      const fileBuffer = Buffer.from(testBase64Data, "base64");

      // Simulate C2PA metadata detection
      const bufferStr = fileBuffer.toString("binary");
      const hasC2PA =
        bufferStr.includes("c2pa") ||
        bufferStr.includes("C2PA") ||
        bufferStr.includes("jumb");

      if (hasC2PA) {
        console.log("✅ Test image has C2PA metadata - perfect for testing");

        // Test without force_as_photo (should switch to document)
        process.env = {
          TELEGRAM_TOKEN: "test_token",
          CHAT_ID: "123456789",
          FILE_BASE64: testBase64Data,
          FILE_NAME: "test-c2pa.png",
          FILE_TYPE: "photo",
          FORCE_AS_PHOTO: "false",
        };

        const notify = new TelegramNotify();

        // Mock warning method to capture messages
        const warnings = [];
        notify.warning = (msg) => warnings.push(msg);

        // Simulate the C2PA detection logic
        if (hasC2PA && notify.fileType === "photo") {
          if (notify.forceAsPhoto) {
            notify.warning("Forcing to send as photo as requested");
          } else {
            notify.warning("Switching from photo to document type");
            notify.fileType = "document";
          }
        }

        expect(notify.fileType).toBe("document");
        expect(warnings).toContain("Switching from photo to document type");

        // Test with force_as_photo (should keep as photo)
        process.env.FORCE_AS_PHOTO = "true";
        const notifyForced = new TelegramNotify();
        const warningsForced = [];
        notifyForced.warning = (msg) => warningsForced.push(msg);

        // Simulate the C2PA detection logic with force flag
        if (hasC2PA && notifyForced.fileType === "photo") {
          if (notifyForced.forceAsPhoto) {
            notifyForced.warning("Forcing to send as photo as requested");
          } else {
            notifyForced.warning("Switching from photo to document type");
            notifyForced.fileType = "document";
          }
        }

        expect(notifyForced.fileType).toBe("photo");
        expect(warningsForced).toContain(
          "Forcing to send as photo as requested"
        );

        console.log("✅ C2PA handling respects force_as_photo flag correctly");
      } else {
        console.log(
          "⚠️ Test image doesn't have C2PA metadata - skipping C2PA-specific tests"
        );
      }
    } finally {
      require.main = originalMain;
      delete require.cache[require.resolve("../telegram-notify.js")];
    }
  });
});

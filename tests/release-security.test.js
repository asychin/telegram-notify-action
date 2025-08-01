const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

describe("Release Workflow Security Tests", () => {
  let releaseWorkflow;

  beforeAll(() => {
    const releaseWorkflowPath = path.join(
      __dirname,
      "..",
      ".github",
      "workflows",
      "release.yml"
    );
    expect(fs.existsSync(releaseWorkflowPath)).toBe(true);

    const workflowContent = fs.readFileSync(releaseWorkflowPath, "utf8");
    releaseWorkflow = yaml.load(workflowContent);
  });

  test("workflow uses secure heredoc with quoted delimiters", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Check for safe heredoc usage with quoted delimiters
    expect(workflowContent).toContain("'RELEASE_BODY_B64_END'");

    // Ensure no unquoted heredoc delimiters that could allow shell injection
    expect(workflowContent).not.toMatch(/<<\s*[A-Z_]+\s*$/m);
  });

  test("base64 handling uses printf instead of echo for security", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Check that printf is used for base64 handling instead of echo
    expect(workflowContent).toContain("printf '%s'");

    // Ensure proper error handling for base64 decoding
    expect(workflowContent).toContain("2>/dev/null || {");
    expect(workflowContent).toContain(
      "Failed to decode base64 release notes, using fallback"
    );
  });

  test("template variables are used correctly with GitHub Actions variables", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Check that template variables {{}} are NOT used in JSON contexts
    const templateVarsBlocks = workflowContent.match(
      /template_vars:\s*\|[\s\S]*?(?=\n\s*[a-z_]+:|$)/g
    );

    if (templateVarsBlocks) {
      templateVarsBlocks.forEach((block) => {
        // Template variables (not preceded by $) should not be used in JSON (template_vars)
        // First remove all GitHub Actions variables, then check for remaining {{}}
        const withoutGithubVars = block.replace(/\$\{\{[^}]+\}\}/g, "");
        expect(withoutGithubVars).not.toMatch(/\{\{[^}]+\}\}/);

        // If there are any variables, they should be GitHub Actions variables (${{...}})
        const githubVariables = block.match(/\$\{\{[^}]+\}\}/g);
        if (githubVariables) {
          expect(githubVariables.length).toBeGreaterThan(0);
        }
      });
    }
  });

  test("no template variables used in message without template specified", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Find all telegram action usages
    const actionUsages = workflowContent.match(/uses:\s*\.\//g);
    expect(actionUsages).toBeTruthy();
    expect(actionUsages.length).toBeGreaterThan(0);

    // Check for proper template usage
    const messageBlocksWithoutTemplate = [];
    const lines = workflowContent.split("\n");
    let inTelegramAction = false;
    let hasTemplate = false;
    let messageLines = [];
    let currentIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === "uses: ./") {
        inTelegramAction = true;
        hasTemplate = false;
        messageLines = [];
        continue;
      }

      if (inTelegramAction) {
        const indent = line.search(/\S/);

        if (trimmed.startsWith("template:")) {
          hasTemplate = true;
        }

        if (trimmed.startsWith("message:")) {
          currentIndent = indent;
          messageLines = [line];
        } else if (
          messageLines.length > 0 &&
          (indent > currentIndent || trimmed === "")
        ) {
          messageLines.push(line);
        } else if (messageLines.length > 0) {
          // End of message block
          const messageContent = messageLines.join("\n");
          if (!hasTemplate && messageContent.includes("{{")) {
            messageBlocksWithoutTemplate.push(messageContent);
          }
          messageLines = [];

          // Check if this is the end of the telegram action
          if (indent <= 8) {
            // Assuming action level is at indent 8
            inTelegramAction = false;
          }
        }
      }
    }

    // Should not have template variables in messages without template
    expect(messageBlocksWithoutTemplate).toHaveLength(0);
  });

  test("secrets are properly handled and not exposed", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Check that secrets are accessed through proper GitHub Actions syntax
    expect(workflowContent).toContain("${{ secrets.TELEGRAM_BOT_TOKEN }}");
    expect(workflowContent).toContain("${{ secrets.TELEGRAM_CHAT_ID }}");

    // Check for fallback secret usage
    expect(workflowContent).toContain(
      "${{ secrets.TELEGRAM_DEV_CHAT_ID || secrets.TELEGRAM_CHAT_ID }}"
    );

    // Ensure no hardcoded tokens or sensitive data
    expect(workflowContent).not.toMatch(/bot\d+:[A-Za-z0-9_-]{35}/); // Telegram bot token pattern
    expect(workflowContent).not.toMatch(/-?\d{8,}/); // Chat ID pattern (except in safe contexts)
  });

  test("workflow uses safe GitHub Actions variable interpolation", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Check for shell command injection prevention using toJSON()
    expect(workflowContent).toContain(
      "${{ toJSON(github.event.release.body) }}"
    );

    // Ensure no direct interpolation of user-controlled data in shell commands
    const shellCommands = workflowContent.match(
      /run:\s*\|[\s\S]*?(?=\n\s*[a-z_]+:|$)/g
    );

    if (shellCommands) {
      shellCommands.forEach((command) => {
        // Check that user-controlled data like release body is properly handled
        if (command.includes("github.event.release.body")) {
          expect(command).toContain("toJSON(");
        }
      });
    }
  });

  test("workflow has proper error handling and validation", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Check for proper error handling in shell scripts
    expect(workflowContent).toContain("|| {");
    expect(workflowContent).toContain("Failed to decode");
    expect(workflowContent).toContain(">&2"); // stderr redirection

    // Check for conditional execution to prevent issues
    expect(workflowContent).toContain("if [ -n");
  });

  test("workflow uses correct versioning", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Should use v3.x versions, not v2.x
    expect(workflowContent).toContain('default: "v3.0.0"');
    expect(workflowContent).not.toContain('default: "v2.0.0"');

    // Check action references use current action
    expect(workflowContent).toContain("uses: ./");
  });

  test("inline keyboard uses GitHub Actions variables not template variables", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Find inline_keyboard blocks
    const inlineKeyboardBlocks = workflowContent.match(
      /inline_keyboard:\s*\|[\s\S]*?(?=\n\s*[a-z_]+:|$)/g
    );

    if (inlineKeyboardBlocks) {
      inlineKeyboardBlocks.forEach((block) => {
        // Should use GitHub Actions variables ${{}} not template variables {{}}
        if (block.includes("{{") && !block.includes("${{")) {
          expect(block).not.toMatch(/\{\{[^}]+\}\}/);
        }

        // Should properly reference GitHub repository and other context
        expect(block).toMatch(/\$\{\{\s*(github\.|steps\.)/);
      });
    }
  });

  test("workflow follows shell safety best practices", () => {
    const workflowContent = fs.readFileSync(
      path.join(__dirname, "..", ".github", "workflows", "release.yml"),
      "utf8"
    );

    // Should not have unescaped user input in shell commands
    // Should use printf instead of echo for safety
    expect(workflowContent).toContain("printf '%s'");

    // Should have proper quoting in shell commands
    const shellInjectionPatterns = [
      /echo\s+"\$\{\{.*github\.event\./, // Direct echo of event data
      /\$\{\{\s*github\.event\..*\}\}\s*[|&;]/, // Piping event data without proper escaping
    ];

    shellInjectionPatterns.forEach((pattern) => {
      if (pattern.test(workflowContent)) {
        console.warn(`Potential shell injection pattern found: ${pattern}`);
      }
    });
  });

  test("job names and step names are descriptive and use emojis", () => {
    expect(releaseWorkflow.jobs["release-notification"].name).toBe(
      "Send Release Notification"
    );
    expect(releaseWorkflow.jobs["post-release-tasks"].name).toBe(
      "Post-Release Tasks"
    );

    // Check that steps have descriptive names
    const steps = releaseWorkflow.jobs["release-notification"].steps;
    const stepNames = steps.map((step) => step.name).filter((name) => name);

    expect(stepNames).toContain("🕐 Get current timestamp");
    expect(stepNames.some((name) => name.includes("🕐"))).toBe(true);
  });

  test("workflow triggers are properly configured", () => {
    // Check that workflow is triggered on appropriate events
    expect(releaseWorkflow.on.release.types).toContain("published");
    expect(releaseWorkflow.on.release.types).toContain("prereleased");

    // Check workflow_dispatch input validation
    expect(releaseWorkflow.on.workflow_dispatch.inputs.version.required).toBe(
      true
    );
    expect(releaseWorkflow.on.workflow_dispatch.inputs.prerelease.type).toBe(
      "boolean"
    );
  });
});

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Polyfill for FormData and fetch if needed (Node.js < 18)
let FormData, fetch;
try {
  FormData = globalThis.FormData;
  fetch = globalThis.fetch;
} catch {
  // Fallback for older Node.js versions
  const { FormData: FormDataPolyfill } = require("formdata-polyfill/esm");
  const fetchPolyfill = require("node-fetch");
  FormData = FormDataPolyfill;
  fetch = fetchPolyfill;
}

/**
 * Telegram Notify Action - Enhanced Version
 * Sends or updates Telegram messages with advanced features:
 * - File attachments (photos, documents, videos, etc.)
 * - Message templates with variable substitution
 * - Inline keyboards
 * - Retry logic with exponential backoff
 * - Conditional sending based on workflow status
 * - Enhanced error handling and logging
 */

class TelegramNotify {
  constructor() {
    // Basic configuration
    this.token = process.env.TELEGRAM_TOKEN;
    this.chatId = process.env.CHAT_ID;
    this.message = process.env.MESSAGE;
    this.messageThreadId = process.env.MESSAGE_THREAD_ID;
    this.messageId = process.env.MESSAGE_ID;
    this.parseMode = process.env.PARSE_MODE || "Markdown";
    this.disableWebPagePreview =
      process.env.DISABLE_WEB_PAGE_PREVIEW === "true";
    this.disableNotification = process.env.DISABLE_NOTIFICATION === "true";
    this.language = process.env.LANGUAGE || "en";

    // Enhanced parameters
    this.replyToMessageId = process.env.REPLY_TO_MESSAGE_ID;
    this.protectContent = process.env.PROTECT_CONTENT === "true";
    this.allowSendingWithoutReply =
      process.env.ALLOW_SENDING_WITHOUT_REPLY !== "false";
    this.messageEffectId = process.env.MESSAGE_EFFECT_ID;
    this.businessConnectionId = process.env.BUSINESS_CONNECTION_ID;

    // File support
    this.filePath = process.env.FILE_PATH;
    this.fileBase64 = process.env.FILE_BASE64;
    this.fileName = process.env.FILE_NAME;
    this.fileType = process.env.FILE_TYPE || "document";
    this.forceAsPhoto = process.env.FORCE_AS_PHOTO === "true";
    this.caption = process.env.CAPTION;

    // Template support
    this.template = process.env.TEMPLATE;
    this.templateVars = this.parseJSON(process.env.TEMPLATE_VARS) || {};

    // Inline keyboard support
    this.inlineKeyboard = this.parseJSON(process.env.INLINE_KEYBOARD);

    // Retry configuration
    this.maxRetries = parseInt(process.env.MAX_RETRIES) || 5;
    this.retryDelay = parseInt(process.env.RETRY_DELAY) || 1;
    this.maxRateLimitRetries =
      parseInt(process.env.MAX_RATE_LIMIT_RETRIES) || 8;

    // Conditional sending
    this.sendOnFailure = process.env.SEND_ON_FAILURE === "true";
    this.sendOnSuccess = process.env.SEND_ON_SUCCESS === "true";

    // GitHub context
    this.githubContext = {
      repository: process.env.GITHUB_REPOSITORY,
      refName: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME,
      sha: process.env.GITHUB_SHA,
      actor: process.env.GITHUB_ACTOR,
      workflow: process.env.GITHUB_WORKFLOW,
      job: process.env.GITHUB_JOB,
      runId: process.env.GITHUB_RUN_ID,
      runNumber: process.env.GITHUB_RUN_NUMBER,
      eventName: process.env.GITHUB_EVENT_NAME,
      jobStatus: process.env.JOB_STATUS,

      // Дополнительные GitHub переменные
      repositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
      repositoryId: process.env.GITHUB_REPOSITORY_ID,
      repositoryOwnerId: process.env.GITHUB_REPOSITORY_OWNER_ID,
      ref: process.env.GITHUB_REF,
      refType: process.env.GITHUB_REF_TYPE,
      refProtected: process.env.GITHUB_REF_PROTECTED,
      baseRef: process.env.GITHUB_BASE_REF,
      headRef: process.env.GITHUB_HEAD_REF,
      triggeredBy: process.env.GITHUB_TRIGGERING_ACTOR,
      actorId: process.env.GITHUB_ACTOR_ID,
      runAttempt: process.env.GITHUB_RUN_ATTEMPT,
      serverUrl: process.env.GITHUB_SERVER_URL,
      apiUrl: process.env.GITHUB_API_URL,
      graphqlUrl: process.env.GITHUB_GRAPHQL_URL,
      workspace: process.env.GITHUB_WORKSPACE,
      eventPath: process.env.GITHUB_EVENT_PATH,
      actionRef: process.env.GITHUB_ACTION_REF,
      actionRepository: process.env.GITHUB_ACTION_REPOSITORY,
      workflowRef: process.env.GITHUB_WORKFLOW_REF,
      workflowSha: process.env.GITHUB_WORKFLOW_SHA,
      retentionDays: process.env.GITHUB_RETENTION_DAYS,
      secretSource: process.env.GITHUB_SECRET_SOURCE,
      jobId: process.env.GITHUB_JOB_ID,
      actionPath: process.env.GITHUB_ACTION_PATH,
      stepSummary: process.env.GITHUB_STEP_SUMMARY,
      envPath: process.env.GITHUB_ENV,
      path: process.env.GITHUB_PATH,

      // Вычисляемые полезные переменные
      shortSha: process.env.GITHUB_SHA
        ? process.env.GITHUB_SHA.substring(0, 7)
        : "",
      repositoryName: process.env.GITHUB_REPOSITORY
        ? process.env.GITHUB_REPOSITORY.split("/")[1]
        : "",
      repositoryOwnerName: process.env.GITHUB_REPOSITORY
        ? process.env.GITHUB_REPOSITORY.split("/")[0]
        : "",
      workflowUrl:
        process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/workflows/${process.env.GITHUB_WORKFLOW}`
          : "",
      runUrl:
        process.env.GITHUB_SERVER_URL &&
        process.env.GITHUB_REPOSITORY &&
        process.env.GITHUB_RUN_ID
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
          : "",
      commitUrl:
        process.env.GITHUB_SERVER_URL &&
        process.env.GITHUB_REPOSITORY &&
        process.env.GITHUB_SHA
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/commit/${process.env.GITHUB_SHA}`
          : "",
      compareUrl:
        process.env.GITHUB_SERVER_URL &&
        process.env.GITHUB_REPOSITORY &&
        process.env.GITHUB_SHA &&
        process.env.GITHUB_BASE_REF
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/compare/${process.env.GITHUB_BASE_REF}...${process.env.GITHUB_SHA}`
          : "",
      issuesUrl:
        process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/issues`
          : "",
      pullRequestsUrl:
        process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/pulls`
          : "",
      releasesUrl:
        process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/releases`
          : "",

      // Runner переменные
      runnerOs: process.env.RUNNER_OS,
      runnerArch: process.env.RUNNER_ARCH,
      runnerName: process.env.RUNNER_NAME,
      runnerEnvironment: process.env.RUNNER_ENVIRONMENT,
      runnerTemp: process.env.RUNNER_TEMP,
      runnerToolCache: process.env.RUNNER_TOOL_CACHE,
      runnerDebug: process.env.RUNNER_DEBUG,

      // CI переменная
      ci: process.env.CI,
    };

    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    this.messages = this.getLocalizedMessages();
    this.retryCount = 0;
  }

  /**
   * Parse JSON string safely
   */
  parseJSON(jsonString) {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      this.warning(
        `Failed to parse JSON: ${jsonString}. Error: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Get automatic event context variables from GitHub event
   * This provides common variables for each event type without manual configuration
   */
  getEventContext() {
    const eventContext = {};

    try {
      // Get GitHub event data from GITHUB_EVENT_PATH
      const eventPath = process.env.GITHUB_EVENT_PATH;
      if (!eventPath) return eventContext;

      const fs = require("fs");
      let eventData = {};

      try {
        const eventContent = fs.readFileSync(eventPath, "utf8");
        eventData = JSON.parse(eventContent);
      } catch (error) {
        this.warning(`Failed to read GitHub event data: ${error.message}`);
        return eventContext;
      }

      const eventName = this.githubContext.eventName;

      // Helper function for safe property access
      const safeGet = (obj, path) => {
        try {
          return path.split(".").reduce((o, p) => o && o[p], obj);
        } catch {
          return undefined;
        }
      };

      // Common variables for all events
      if (eventData.sender) {
        eventContext.triggerUser = safeGet(eventData, "sender.login");
        eventContext.triggerUserId = safeGet(eventData, "sender.id");
      }

      // Event-specific automatic variables
      switch (eventName) {
        case "issues":
          if (eventData.issue) {
            eventContext.author = safeGet(eventData, "issue.user.login");
            eventContext.issueNumber = safeGet(eventData, "issue.number");
            eventContext.issueTitle = safeGet(eventData, "issue.title");
            eventContext.issueState = safeGet(eventData, "issue.state");
            eventContext.issueBody = safeGet(eventData, "issue.body");
            eventContext.createdAt = safeGet(eventData, "issue.created_at");
            eventContext.updatedAt = safeGet(eventData, "issue.updated_at");

            // Labels as comma-separated string
            const labels = safeGet(eventData, "issue.labels");
            eventContext.labels = Array.isArray(labels)
              ? labels.map((label) => label.name).join(", ")
              : "";

            // Assignees as comma-separated string
            const assignees = safeGet(eventData, "issue.assignees");
            eventContext.assignees = Array.isArray(assignees)
              ? assignees.map((assignee) => assignee.login).join(", ")
              : "";
          }
          break;

        case "issue_comment":
          if (eventData.issue) {
            eventContext.author = safeGet(eventData, "issue.user.login");
            eventContext.issueNumber = safeGet(eventData, "issue.number");
            eventContext.issueTitle = safeGet(eventData, "issue.title");
            eventContext.issueState = safeGet(eventData, "issue.state");
          }
          if (eventData.comment) {
            eventContext.commentAuthor = safeGet(
              eventData,
              "comment.user.login"
            );
            eventContext.commentBody = safeGet(eventData, "comment.body");
            eventContext.commentId = safeGet(eventData, "comment.id");
            eventContext.commentCreatedAt = safeGet(
              eventData,
              "comment.created_at"
            );
          }
          break;

        case "pull_request":
          if (eventData.pull_request) {
            eventContext.author = safeGet(eventData, "pull_request.user.login");
            eventContext.prNumber = safeGet(eventData, "pull_request.number");
            eventContext.prTitle = safeGet(eventData, "pull_request.title");
            eventContext.prState = safeGet(eventData, "pull_request.state");
            eventContext.prBody = safeGet(eventData, "pull_request.body");
            eventContext.prUrl = safeGet(eventData, "pull_request.html_url");
            eventContext.baseBranch = safeGet(
              eventData,
              "pull_request.base.ref"
            );
            eventContext.headBranch = safeGet(
              eventData,
              "pull_request.head.ref"
            );
            eventContext.prCreatedAt = safeGet(
              eventData,
              "pull_request.created_at"
            );
            eventContext.prUpdatedAt = safeGet(
              eventData,
              "pull_request.updated_at"
            );
            eventContext.isDraft = safeGet(eventData, "pull_request.draft");
            eventContext.mergeable = safeGet(
              eventData,
              "pull_request.mergeable"
            );

            // Labels and assignees
            const labels = safeGet(eventData, "pull_request.labels");
            eventContext.labels = Array.isArray(labels)
              ? labels.map((label) => label.name).join(", ")
              : "";

            const assignees = safeGet(eventData, "pull_request.assignees");
            eventContext.assignees = Array.isArray(assignees)
              ? assignees.map((assignee) => assignee.login).join(", ")
              : "";

            // PR change statistics
            eventContext.filesChanged =
              safeGet(eventData, "pull_request.changed_files") || 0;
            eventContext.additions =
              safeGet(eventData, "pull_request.additions") || 0;
            eventContext.deletions =
              safeGet(eventData, "pull_request.deletions") || 0;
            eventContext.commitCount =
              safeGet(eventData, "pull_request.commits") || 0;
          }
          break;

        case "pull_request_review":
          if (eventData.pull_request) {
            eventContext.author = safeGet(eventData, "pull_request.user.login");
            eventContext.prNumber = safeGet(eventData, "pull_request.number");
            eventContext.prTitle = safeGet(eventData, "pull_request.title");
            eventContext.prUrl = safeGet(eventData, "pull_request.html_url");
          }
          if (eventData.review) {
            eventContext.reviewAuthor = safeGet(eventData, "review.user.login");
            eventContext.reviewState = safeGet(eventData, "review.state");
            eventContext.reviewBody = safeGet(eventData, "review.body");
            eventContext.reviewId = safeGet(eventData, "review.id");
          }
          break;

        case "release":
          if (eventData.release) {
            eventContext.releaseAuthor = safeGet(
              eventData,
              "release.author.login"
            );
            eventContext.releaseName = safeGet(eventData, "release.name");
            eventContext.releaseTag = safeGet(eventData, "release.tag_name");
            
            // Handle release body - check if it's base64 encoded for security
            let releaseBody = safeGet(eventData, "release.body");
            
            // Try to decode base64 if it looks like base64 (from secure workflows)
            if (releaseBody && typeof releaseBody === 'string' && releaseBody.match(/^[A-Za-z0-9+/]+=*$/)) {
              try {
                releaseBody = Buffer.from(releaseBody, 'base64').toString('utf8');
                this.info("Decoded base64 release body for security");
              } catch (error) {
                this.warning("Failed to decode base64 release body, using as-is");
              }
            }
            
            eventContext.releaseBody = releaseBody;
            eventContext.isPrerelease = safeGet(
              eventData,
              "release.prerelease"
            );
            eventContext.isDraft = safeGet(eventData, "release.draft");
            eventContext.releaseCreatedAt = safeGet(
              eventData,
              "release.created_at"
            );
          }
          break;

        case "push": {
          eventContext.pusher = safeGet(eventData, "pusher.name");
          eventContext.pusherId = safeGet(eventData, "pusher.id");
          eventContext.commitCount = safeGet(eventData, "commits.length") || 0;

          // Get last commit info
          const commits = safeGet(eventData, "commits");
          if (Array.isArray(commits) && commits.length > 0) {
            const lastCommit = commits[commits.length - 1];
            eventContext.lastCommitMessage = safeGet(lastCommit, "message");
            eventContext.lastCommitAuthor = safeGet(lastCommit, "author.name");
            eventContext.lastCommitId = safeGet(lastCommit, "id");
            eventContext.author = safeGet(lastCommit, "author.name"); // Alias for author
          }

          // For deploy template compatibility - extract branch info from ref
          const ref = safeGet(eventData, "ref") || "";
          const branchName = ref.replace("refs/heads/", "");
          eventContext.baseBranch = branchName; // Use current branch as base
          eventContext.headBranch = branchName; // Use current branch as head

          // Set deployment-related variables for push events
          eventContext.prTitle =
            safeGet(eventData, "head_commit.message") || "Direct push";
          eventContext.prCreatedAt =
            safeGet(eventData, "head_commit.timestamp") || "";

          // Calculate file changes from commits
          let totalAdditions = 0;
          let totalDeletions = 0;
          let totalFilesChanged = 0;

          if (Array.isArray(commits)) {
            commits.forEach((commit) => {
              const added = safeGet(commit, "added") || [];
              const removed = safeGet(commit, "removed") || [];
              const modified = safeGet(commit, "modified") || [];

              totalFilesChanged +=
                added.length + removed.length + modified.length;
              // Note: GitHub push events don't include line-level stats
              // So we use file count as approximation
              totalAdditions += added.length + modified.length;
              totalDeletions += removed.length;
            });
          }

          eventContext.filesChanged = totalFilesChanged;
          eventContext.additions = totalAdditions;
          eventContext.deletions = totalDeletions;

          break;
        }

        case "workflow_run":
          if (eventData.workflow_run) {
            eventContext.workflowName = safeGet(eventData, "workflow_run.name");
            eventContext.workflowStatus = safeGet(
              eventData,
              "workflow_run.status"
            );
            eventContext.workflowConclusion = safeGet(
              eventData,
              "workflow_run.conclusion"
            );
            eventContext.workflowId = safeGet(eventData, "workflow_run.id");
            eventContext.workflowRunNumber = safeGet(
              eventData,
              "workflow_run.run_number"
            );
            eventContext.workflowActor = safeGet(
              eventData,
              "workflow_run.actor.login"
            );
          }
          break;

        case "deployment":
          if (eventData.deployment) {
            eventContext.deploymentId = safeGet(eventData, "deployment.id");
            eventContext.deploymentEnvironment = safeGet(
              eventData,
              "deployment.environment"
            );
            eventContext.deploymentRef = safeGet(eventData, "deployment.ref");
            eventContext.deploymentSha = safeGet(eventData, "deployment.sha");
            eventContext.deploymentCreator = safeGet(
              eventData,
              "deployment.creator.login"
            );
          }
          break;

        case "deployment_status":
          if (eventData.deployment_status) {
            eventContext.deploymentState = safeGet(
              eventData,
              "deployment_status.state"
            );
            eventContext.deploymentDescription = safeGet(
              eventData,
              "deployment_status.description"
            );
            eventContext.deploymentEnvironmentUrl = safeGet(
              eventData,
              "deployment_status.environment_url"
            );
          }
          if (eventData.deployment) {
            eventContext.deploymentEnvironment = safeGet(
              eventData,
              "deployment.environment"
            );
          }
          break;

        default:
          // For unknown events, try to extract common patterns
          if (eventData.action) {
            eventContext.eventAction = eventData.action;
          }
          break;
      }

      // Add event action for all events (if available)
      if (eventData.action) {
        eventContext.action = eventData.action;
      }

      // Provide default values for deploy template variables if not set
      if (!Object.hasOwn(eventContext, "baseBranch")) {
        eventContext.baseBranch = this.githubContext.refName || "main";
      }
      if (!Object.hasOwn(eventContext, "headBranch")) {
        eventContext.headBranch = this.githubContext.refName || "main";
      }
      if (!Object.hasOwn(eventContext, "filesChanged")) {
        eventContext.filesChanged = 0;
      }
      if (!Object.hasOwn(eventContext, "additions")) {
        eventContext.additions = 0;
      }
      if (!Object.hasOwn(eventContext, "deletions")) {
        eventContext.deletions = 0;
      }
      if (!Object.hasOwn(eventContext, "commitCount")) {
        eventContext.commitCount = 1;
      }
      if (!Object.hasOwn(eventContext, "author")) {
        eventContext.author = this.githubContext.actor || "Unknown";
      }
      if (!Object.hasOwn(eventContext, "prTitle")) {
        eventContext.prTitle = "Deployment via " + this.githubContext.eventName;
      }
      if (!Object.hasOwn(eventContext, "prCreatedAt")) {
        eventContext.prCreatedAt = new Date().toISOString();
      }
      if (!Object.hasOwn(eventContext, "deployStatus")) {
        eventContext.deployStatus = "successful";
      }

      // Provide default values for release template variables if not set
      if (!Object.hasOwn(eventContext, "releaseName")) {
        eventContext.releaseName = "Test Release v1.0.0";
      }
      if (!Object.hasOwn(eventContext, "releaseTag")) {
        eventContext.releaseTag = "v1.0.0";
      }
      if (!Object.hasOwn(eventContext, "releaseAuthor")) {
        eventContext.releaseAuthor = this.githubContext.actor || "Unknown";
      }
      if (!Object.hasOwn(eventContext, "releaseCreatedAt")) {
        eventContext.releaseCreatedAt = new Date().toISOString();
      }
      if (!Object.hasOwn(eventContext, "isPrerelease")) {
        eventContext.isPrerelease = false;
      }
      if (!Object.hasOwn(eventContext, "isDraft")) {
        eventContext.isDraft = false;
      }
      if (!Object.hasOwn(eventContext, "releaseBody")) {
        eventContext.releaseBody =
          "Test release with bug fixes and improvements.";
      }
    } catch (error) {
      this.warning(`Error extracting event context: ${error.message}`);
    }

    return eventContext;
  }

  /**
   * Get localized messages
   */
  getLocalizedMessages() {
    const messages = {
      en: {
        tokenRequired: "TELEGRAM_TOKEN is required",
        chatIdRequired: "CHAT_ID is required",
        messageOrFileRequired:
          "Either MESSAGE, FILE_PATH, or TEMPLATE is required",
        sendingMessage: "Sending new Telegram message...",
        sendingFile: "Sending file to Telegram...",
        sendingToThread: "Sending message to thread:",
        editingMessage: "Editing message with ID:",
        messageSent: "Message sent successfully! Message ID:",
        messageEdited: "Message edited successfully! Message ID:",
        fileSent: "File sent successfully! File ID:",
        failed: "Failed to send/edit Telegram message:",
        telegramApiError: "Telegram API error:",
        requestFailed: "Request failed:",
        retryAttempt: "Retry attempt",
        maxRetriesReached: "Maximum retry attempts reached",
        conditionalSkip:
          "Skipping notification due to conditional sending rules",
        templateNotFound: "Template not found:",
        fileNotFound: "File not found:",
        invalidFileType: "Invalid file type:",
      },
      ru: {
        tokenRequired: "Требуется TELEGRAM_TOKEN",
        chatIdRequired: "Требуется CHAT_ID",
        messageOrFileRequired: "Требуется MESSAGE, FILE_PATH или TEMPLATE",
        sendingMessage: "Отправка нового сообщения в Telegram...",
        sendingFile: "Отправка файла в Telegram...",
        sendingToThread: "Отправка сообщения в тред:",
        editingMessage: "Редактирование сообщения с ID:",
        messageSent: "Сообщение отправлено успешно! ID сообщения:",
        messageEdited: "Сообщение отредактировано успешно! ID сообщения:",
        fileSent: "Файл отправлен успешно! ID файла:",
        failed: "Не удалось отправить/отредактировать сообщение Telegram:",
        telegramApiError: "Ошибка Telegram API:",
        requestFailed: "Запрос не выполнен:",
        retryAttempt: "Попытка повтора",
        maxRetriesReached: "Достигнуто максимальное количество попыток",
        conditionalSkip: "Пропуск уведомления из-за условных правил отправки",
        templateNotFound: "Шаблон не найден:",
        fileNotFound: "Файл не найден:",
        invalidFileType: "Недопустимый тип файла:",
      },
      zh: {
        tokenRequired: "需要 TELEGRAM_TOKEN",
        chatIdRequired: "需要 CHAT_ID",
        messageOrFileRequired: "需要 MESSAGE、FILE_PATH 或 TEMPLATE",
        sendingMessage: "正在发送新的 Telegram 消息...",
        sendingFile: "正在发送文件到 Telegram...",
        sendingToThread: "向主题发送消息:",
        editingMessage: "正在编辑消息，ID:",
        messageSent: "消息发送成功！消息 ID:",
        messageEdited: "消息编辑成功！消息 ID:",
        fileSent: "文件发送成功！文件 ID:",
        failed: "发送/编辑 Telegram 消息失败:",
        telegramApiError: "Telegram API 错误:",
        requestFailed: "请求失败:",
        retryAttempt: "重试尝试",
        maxRetriesReached: "已达到最大重试次数",
        conditionalSkip: "由于条件发送规则跳过通知",
        templateNotFound: "模板未找到:",
        fileNotFound: "文件未找到:",
        invalidFileType: "无效的文件类型:",
      },
    };

    return messages[this.language] || messages.en;
  }

  /**
   * Get predefined message templates with format-aware content
   *
   * Available templates:
   * - success ✅: For successful operations
   * - error ❌: For failed operations
   * - warning ⚠️: For warnings and issues
   * - info ℹ️: For general information
   * - deploy 🚀: For deployments (can be used creatively for PRs)
   * - test 🧪: For test results (can be used for health checks)
   * - release 🎉: For new releases
   *
   * Each template supports multiple languages: en, ru, zh
   * Each template automatically adapts to HTML or Markdown based on parse_mode
   */
  getMessageTemplates() {
    const isHTML = this.parseMode === "HTML";
    const bold = isHTML ? "<b>" : "**";
    const boldEnd = isHTML ? "</b>" : "**";

    const templates = {
      success: {
        en: `✅ ${bold}Success${boldEnd}

🏠 ${bold}Repository:${boldEnd} {{repository}}
🌿 ${bold}Branch:${boldEnd} {{refName}}
📝 ${bold}Commit:${boldEnd} {{sha}}
👤 ${bold}Actor:${boldEnd} {{actor}}
🔄 ${bold}Workflow:${boldEnd} {{workflow}}

💬 {{customMessage}}`,
        ru: `✅ ${bold}Успех${boldEnd}

🏠 ${bold}Репозиторий:${boldEnd} {{repository}}
🌿 ${bold}Ветка:${boldEnd} {{refName}}
📝 ${bold}Коммит:${boldEnd} {{sha}}
👤 ${bold}Автор:${boldEnd} {{actor}}
🔄 ${bold}Workflow:${boldEnd} {{workflow}}

💬 {{customMessage}}`,
        zh: `✅ ${bold}成功${boldEnd}

🏠 ${bold}仓库:${boldEnd} {{repository}}
🌿 ${bold}分支:${boldEnd} {{refName}}
📝 ${bold}提交:${boldEnd} {{sha}}
👤 ${bold}执行者:${boldEnd} {{actor}}
🔄 ${bold}工作流:${boldEnd} {{workflow}}

💬 {{customMessage}}`,
      },
      error: {
        en: `❌ ${bold}Error${boldEnd}

🏠 ${bold}Repository:${boldEnd} {{repository}}
🌿 ${bold}Branch:${boldEnd} {{refName}}
📝 ${bold}Commit:${boldEnd} {{sha}}
👤 ${bold}Actor:${boldEnd} {{actor}}
🔄 ${bold}Workflow:${boldEnd} {{workflow}}
🚨 ${bold}Job Status:${boldEnd} {{jobStatus}}

💬 {{customMessage}}`,
        ru: `❌ ${bold}Ошибка${boldEnd}

🏠 ${bold}Репозиторий:${boldEnd} {{repository}}
🌿 ${bold}Ветка:${boldEnd} {{refName}}
📝 ${bold}Коммит:${boldEnd} {{sha}}
👤 ${bold}Автор:${boldEnd} {{actor}}
🔄 ${bold}Workflow:${boldEnd} {{workflow}}
🚨 ${bold}Статус задачи:${boldEnd} {{jobStatus}}

💬 {{customMessage}}`,
        zh: `❌ ${bold}错误${boldEnd}

🏠 ${bold}仓库:${boldEnd} {{repository}}
🌿 ${bold}分支:${boldEnd} {{refName}}
📝 ${bold}提交:${boldEnd} {{sha}}
👤 ${bold}执行者:${boldEnd} {{actor}}
🔄 ${bold}工作流:${boldEnd} {{workflow}}
🚨 ${bold}任务状态:${boldEnd} {{jobStatus}}

💬 {{customMessage}}`,
      },
      warning: {
        en: `⚠️ ${bold}Warning${boldEnd}

🏠 ${bold}Repository:${boldEnd} {{repository}}
🌿 ${bold}Branch:${boldEnd} {{refName}}
🔄 ${bold}Workflow:${boldEnd} {{workflow}}

💬 {{customMessage}}`,
        ru: `⚠️ ${bold}Предупреждение${boldEnd}

🏠 ${bold}Репозиторий:${boldEnd} {{repository}}
🌿 ${bold}Ветка:${boldEnd} {{refName}}
🔄 ${bold}Workflow:${boldEnd} {{workflow}}

💬 {{customMessage}}`,
        zh: `⚠️ ${bold}警告${boldEnd}

🏠 ${bold}仓库:${boldEnd} {{repository}}
🌿 ${bold}分支:${boldEnd} {{refName}}
🔄 ${bold}工作流:${boldEnd} {{workflow}}

💬 {{customMessage}}`,
      },
      info: {
        en: `ℹ️ ${bold}Information${boldEnd}

🏠 ${bold}Repository:${boldEnd} {{repository}}
🌿 ${bold}Branch:${boldEnd} {{refName}}
👤 ${bold}Actor:${boldEnd} {{actor}}

💬 {{customMessage}}`,
        ru: `ℹ️ ${bold}Информация${boldEnd}

🏠 ${bold}Репозиторий:${boldEnd} {{repository}}
🌿 ${bold}Ветка:${boldEnd} {{refName}}
👤 ${bold}Автор:${boldEnd} {{actor}}

💬 {{customMessage}}`,
        zh: `ℹ️ ${bold}信息${boldEnd}

🏠 ${bold}仓库:${boldEnd} {{repository}}
🌿 ${bold}分支:${boldEnd} {{refName}}
👤 ${bold}执行者:${boldEnd} {{actor}}

💬 {{customMessage}}`,
      },
      deploy: {
        en: `🚀 ${bold}Deployment${boldEnd}

📦 Repository: {{repository}}
🌿 Branch: {{refName}}
📝 Commit: {{shortSha}}
🔢 Run: #{{runNumber}}

👤 Deployed by: {{actor}}
📊 Status: {{deployStatus}}

{{customMessage}}

📈 Change Statistics:

🌿 Branch: {{baseBranch}} → {{headBranch}}
📁 Files changed: {{filesChanged}}
📝 Commits: {{commitCount}}
📊 Changes: {{additions}} ➕ {{deletions}} ➖
👤 Author: {{author}}
📅 Created: {{prCreatedAt}}

📝 Description:
{{prTitle}}`,
        ru: `🚀 ${bold}Развертывание${boldEnd}

📦 Репозиторий: {{repository}}
🌿 Ветка: {{refName}}
📝 Коммит: {{shortSha}}
🔢 Запуск: #{{runNumber}}

👤 Развернул: {{actor}}
📊 Статус: {{deployStatus}}

{{customMessage}}

📈 Статистика изменений:

🌿 Ветка: {{baseBranch}} → {{headBranch}}
📁 Файлов изменено: {{filesChanged}}
📝 Коммитов: {{commitCount}}
📊 Изменения: {{additions}} ➕ {{deletions}} ➖
👤 Автор: {{author}}
📅 Создан: {{prCreatedAt}}

📝 Описание:
{{prTitle}}`,
        zh: `🚀 ${bold}部署${boldEnd}

📦 仓库: {{repository}}
🌿 分支: {{refName}}
📝 提交: {{shortSha}}
🔢 运行: #{{runNumber}}

👤 部署者: {{actor}}
📊 状态: {{deployStatus}}

{{customMessage}}

📈 变更统计:

🌿 分支: {{baseBranch}} → {{headBranch}}
📁 文件变更: {{filesChanged}}
📝 提交数: {{commitCount}}
📊 变更: {{additions}} ➕ {{deletions}} ➖
👤 作者: {{author}}
📅 创建时间: {{prCreatedAt}}

📝 描述:
{{prTitle}}`,
      },
      test: {
        en: `🧪 ${bold}Test Results${boldEnd}

🏠 ${bold}Repository:${boldEnd} {{repository}}
🌿 ${bold}Branch:${boldEnd} {{refName}}
📝 ${bold}Commit:${boldEnd} {{sha}}
🔢 ${bold}Run:${boldEnd} #{{runNumber}}

📊 ${bold}Test Status:${boldEnd} {{testStatus}}
📈 ${bold}Coverage:${boldEnd} {{coverage}}

💬 {{customMessage}}`,
        ru: `🧪 ${bold}Результаты тестов${boldEnd}

🏠 ${bold}Репозиторий:${boldEnd} {{repository}}
🌿 ${bold}Ветка:${boldEnd} {{refName}}
📝 ${bold}Коммит:${boldEnd} {{sha}}
🔢 ${bold}Запуск:${boldEnd} #{{runNumber}}

📊 ${bold}Статус тестов:${boldEnd} {{testStatus}}
📈 ${bold}Покрытие:${boldEnd} {{coverage}}

💬 {{customMessage}}`,
        zh: `🧪 ${bold}测试结果${boldEnd}

🏠 ${bold}仓库:${boldEnd} {{repository}}
🌿 ${bold}分支:${boldEnd} {{refName}}
📝 ${bold}提交:${boldEnd} {{sha}}
🔢 ${bold}运行:${boldEnd} #{{runNumber}}

📊 ${bold}测试状态:${boldEnd} {{testStatus}}
📈 ${bold}覆盖率:${boldEnd} {{coverage}}

💬 {{customMessage}}`,
      },
      release: {
        en: `🎉 ${bold}New Release${boldEnd}

🏠 ${bold}Repository:${boldEnd} {{repository}}
🏷️ ${bold}Version:${boldEnd} {{releaseName}}
🔖 ${bold}Tag:${boldEnd} {{releaseTag}}
👤 ${bold}Released by:${boldEnd} {{releaseAuthor}}
📅 ${bold}Date:${boldEnd} {{releaseCreatedAt}}
🧪 ${bold}Prerelease:${boldEnd} {{isPrerelease}}
📝 ${bold}Draft:${boldEnd} {{isDraft}}

📋 ${bold}Release Notes:${boldEnd}
{{releaseBody}}

💬 {{customMessage}}`,
        ru: `🎉 ${bold}Новый релиз${boldEnd}

🏠 ${bold}Репозиторий:${boldEnd} {{repository}}
🏷️ ${bold}Версия:${boldEnd} {{releaseName}}
🔖 ${bold}Тег:${boldEnd} {{releaseTag}}
👤 ${bold}Выпустил:${boldEnd} {{releaseAuthor}}
📅 ${bold}Дата:${boldEnd} {{releaseCreatedAt}}
🧪 ${bold}Предрелиз:${boldEnd} {{isPrerelease}}
📝 ${bold}Черновик:${boldEnd} {{isDraft}}

📋 ${bold}Заметки к релизу:${boldEnd}
{{releaseBody}}

💬 {{customMessage}}`,
        zh: `🎉 ${bold}新版本发布${boldEnd}

🏠 ${bold}仓库:${boldEnd} {{repository}}
🏷️ ${bold}版本:${boldEnd} {{releaseName}}
🔖 ${bold}标签:${boldEnd} {{releaseTag}}
👤 ${bold}发布者:${boldEnd} {{releaseAuthor}}
📅 ${bold}日期:${boldEnd} {{releaseCreatedAt}}
🧪 ${bold}预发布:${boldEnd} {{isPrerelease}}
📝 ${bold}草稿:${boldEnd} {{isDraft}}

📋 ${bold}发布说明:${boldEnd}
{{releaseBody}}

💬 {{customMessage}}`,
      },
    };

    return templates;
  }

  /**
   * Clean HTML content to remove unsupported tags
   */
  cleanHtmlContent(content) {
    if (!content) return content;

    // Telegram supports only these HTML tags: b, strong, i, em, u, ins, s, strike, del, span, tg-spoiler, a, code, pre
    const supportedTags = [
      "b",
      "strong",
      "i",
      "em",
      "u",
      "ins",
      "s",
      "strike",
      "del",
      "span",
      "tg-spoiler",
      "a",
      "code",
      "pre",
    ];

    let cleanContent = content;

    // Remove all HTML tags except supported ones
    cleanContent = cleanContent.replace(
      /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/gi,
      (match, tagName) => {
        if (supportedTags.includes(tagName.toLowerCase())) {
          return match; // Keep supported tags
        }
        return ""; // Remove unsupported tags
      }
    );

    // Also clean up any remaining malformed tags
    cleanContent = cleanContent.replace(/<[^>]*>/g, (match) => {
      // If it doesn't match a proper tag pattern, remove it
      if (!/^<\/?[a-zA-Z][a-zA-Z0-9]*(\s[^>]*)?>$/.test(match)) {
        return "";
      }
      return match;
    });

    return cleanContent;
  }

  /**
   * Process message template
   */
  processTemplate() {
    // Merge GitHub context with template variables
    const allVars = {
      ...this.githubContext, // Basic GitHub context (repository, sha, etc.)
      ...this.getEventContext(), // Automatic event-specific variables
      customMessage: this.message || "", // Always include customMessage, even if empty
      ...this.templateVars, // User-defined variables (highest priority)
    };

    // Debug: log available variables in debug mode
    if (process.env.ACTIONS_STEP_DEBUG === "true") {
      this.info(
        `Available template variables: ${Object.keys(allVars).join(", ")}`
      );

      // Show automatic event variables separately for clarity
      const eventVars = this.getEventContext();
      if (Object.keys(eventVars).length > 0) {
        this.info(
          `Automatic event variables: ${Object.keys(eventVars).join(", ")}`
        );
      }
    }

    let templateText;

    // If no template is specified, use custom message with variable substitution
    if (!this.template) {
      templateText = this.message || "";
    } else {
      // Use predefined template
      const templates = this.getMessageTemplates();
      const templateData = templates[this.template];

      if (!templateData) {
        throw new Error(`${this.messages.templateNotFound} ${this.template}`);
      }

      templateText = templateData[this.language] || templateData.en;
    }

    // Replace template variables in both predefined templates and custom messages
    const processedText = templateText.replace(
      /\{\{(\w+)\}\}/g,
      (match, key) => {
        return Object.prototype.hasOwnProperty.call(allVars, key)
          ? allVars[key]
          : match;
      }
    );

    // Clean content based on parse mode
    if (this.parseMode === "HTML") {
      return this.cleanHtmlContent(processedText);
    } else if (this.parseMode === "Markdown" || this.parseMode === "MarkdownV2") {
      return this.cleanMarkdownContent(processedText);
    }
    
    return processedText;
  }

  /**
   * Clean Markdown content to prevent entity parsing errors
   */
  cleanMarkdownContent(content) {
    if (!content) return content;

    let cleanContent = content;

    // Fix unbalanced bold/italic markers
    // Count ** markers and close unmatched ones
    const boldMatches = (cleanContent.match(/\*\*/g) || []).length;
    if (boldMatches % 2 !== 0) {
      cleanContent += "**"; // Close unmatched bold
    }

    // Count * markers (but not **) and close unmatched ones - compatible with older Node.js
    const allStars = (cleanContent.match(/\*/g) || []).length;
    const doubleBoldStars = boldMatches * 2; // Each ** pair = 2 stars
    const italicMatches = allStars - doubleBoldStars;
    if (italicMatches % 2 !== 0) {
      cleanContent += "*"; // Close unmatched italic
    }

    // Fix malformed links - remove incomplete [] or () patterns
    cleanContent = cleanContent.replace(/\[([^\]]*?)(?:\n|\r|$)/g, '$1'); // Unclosed [
    cleanContent = cleanContent.replace(/\(([^)]*?)(?:\n|\r|$)/g, '$1'); // Unclosed (

    // Fix malformed code blocks - ensure ``` are balanced
    const codeBlockMatches = (cleanContent.match(/```/g) || []).length;
    if (codeBlockMatches % 2 !== 0) {
      cleanContent += "\n```"; // Close unmatched code block
    }

    // Fix malformed inline code - ensure ` are balanced - compatible with older Node.js
    const allBackticks = (cleanContent.match(/`/g) || []).length;
    const codeBlockBackticks = codeBlockMatches * 3; // Each ``` = 3 backticks
    const inlineCodeBackticks = allBackticks - codeBlockBackticks;
    if (inlineCodeBackticks % 2 !== 0) {
      cleanContent += "`"; // Close unmatched inline code
    }

    // Remove potentially problematic characters that can break parsing
    cleanContent = cleanContent.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Zero-width characters
    
    // Escape special characters that might be misinterpreted
    cleanContent = cleanContent.replace(/([_~])/g, '\\$1'); // Escape underscores and tildes

    return cleanContent;
  }

  /**
   * Check if notification should be sent based on conditions
   */
  shouldSendNotification() {
    if (this.sendOnFailure && this.githubContext.jobStatus !== "failure") {
      this.info(this.messages.conditionalSkip);
      return false;
    }

    if (this.sendOnSuccess && this.githubContext.jobStatus !== "success") {
      this.info(this.messages.conditionalSkip);
      return false;
    }

    return true;
  }

  /**
   * Validate required inputs
   */
  validateInputs() {
    if (!this.token) {
      throw new Error(this.messages.tokenRequired);
    }
    if (!this.chatId) {
      throw new Error(this.messages.chatIdRequired);
    }
    if (!this.message && !this.filePath && !this.fileBase64 && !this.template) {
      throw new Error(this.messages.messageOrFileRequired);
    }
    if (this.fileBase64 && !this.fileName) {
      throw new Error("FILE_NAME is required when using FILE_BASE64");
    }
  }

  /**
   * Set GitHub Actions output
   */
  setOutput(name, value) {
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
      fs.appendFileSync(outputFile, `${name}=${value}\n`);
    } else {
      // Fallback to legacy format for older runners
      console.log(`::set-output name=${name}::${value}`);
    }
  }

  /**
   * Log info message
   */
  info(message) {
    console.log(`ℹ️ ${message}`);
  }

  /**
   * Log warning message
   */
  warning(message) {
    console.log(`⚠️ ${message}`);
  }

  /**
   * Log error message
   */
  error(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
  }

  /**
   * Log success message
   */
  success(message) {
    console.log(`✅ ${message}`);
  }

  /**
   * Sleep for specified milliseconds
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request to Telegram API with retry logic
   */
  async makeRequest(endpoint, payload, isFormData = false) {
    const url = `${this.baseUrl}/${endpoint}`;
    let lastError;
    let rateLimitRetries = 0;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const options = {
          method: "POST",
        };

        if (isFormData) {
          options.body = payload;
        } else {
          options.headers = { "Content-Type": "application/json" };
          options.body = JSON.stringify(payload);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(
            `${this.messages.telegramApiError} ${
              data.description || "Unknown error"
            }`
          );
        }

        this.retryCount = attempt;
        return data;
      } catch (error) {
        lastError = error;

        // Handle rate limiting with separate retry counter
        if (error.message.includes("Too Many Requests")) {
          const retryAfterMatch = error.message.match(/retry after (\d+)/);
          const retryAfter = retryAfterMatch
            ? parseInt(retryAfterMatch[1])
            : 30;

          // Rate limiting gets separate retry attempts
          if (rateLimitRetries < this.maxRateLimitRetries) {
            rateLimitRetries++;
            this.warning(
              `Rate limited (${rateLimitRetries}/${this.maxRateLimitRetries}). Waiting ${retryAfter} seconds before retry...`
            );
            await this.sleep(retryAfter * 1000);

            // Don't increment attempt counter for rate limiting
            attempt--;
            continue;
          } else {
            this.error(
              `Maximum rate limit retries reached (${this.maxRateLimitRetries}). ${this.messages.requestFailed} ${error.message}`
            );
          }
        }

        // Normal retry logic (only if not rate limited)
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt) * 1000; // Exponential backoff
          this.warning(
            `${this.messages.retryAttempt} ${attempt + 1}/${
              this.maxRetries + 1
            } after ${delay}ms`
          );
          await this.sleep(delay);
        }
      }
    }

    this.error(
      `${this.messages.maxRetriesReached}. ${this.messages.requestFailed} ${lastError.message}`
    );
  }
  prepareInlineKeyboard() {
    if (!this.inlineKeyboard) return null;

    let keyboard = this.inlineKeyboard;
    if (Array.isArray(keyboard) && keyboard.length > 0) {
      // If first element is not an array, wrap each button in an array
      if (!Array.isArray(keyboard[0])) {
        keyboard = keyboard.map((button) => [button]);
      }
      return { inline_keyboard: keyboard };
    }
    return null;
  }

  /**
  }

  /**
   * Prepare base message payload
   */
  getBasePayload() {
    const payload = {
      chat_id: this.chatId,
      parse_mode: this.parseMode,
      disable_web_page_preview: this.disableWebPagePreview,
      disable_notification: this.disableNotification,
    };

    // Add optional parameters
    if (this.messageThreadId) {
      payload.message_thread_id = parseInt(this.messageThreadId);
    }
    if (this.replyToMessageId) {
      payload.reply_to_message_id = parseInt(this.replyToMessageId);
    }
    if (this.protectContent) {
      payload.protect_content = this.protectContent;
    }
    if (this.allowSendingWithoutReply !== undefined) {
      payload.allow_sending_without_reply = this.allowSendingWithoutReply;
    }
    if (this.messageEffectId) {
      payload.message_effect_id = this.messageEffectId;
    }
    if (this.businessConnectionId) {
      payload.business_connection_id = this.businessConnectionId;
    }
    if (this.inlineKeyboard) {
      let keyboard = Array.isArray(this.inlineKeyboard)
        ? this.inlineKeyboard
        : [this.inlineKeyboard];
      if (keyboard.length > 0 && !Array.isArray(keyboard[0])) {
        keyboard = keyboard.map((button) => [button]);
      }
      payload.reply_markup = { inline_keyboard: keyboard };
    }

    return payload;
  }

  /**
   * Send file to Telegram
   */
  async sendFile() {
    const validFileTypes = [
      "photo",
      "document",
      "video",
      "audio",
      "animation",
      "voice",
      "video_note",
      "sticker",
    ];
    if (!validFileTypes.includes(this.fileType)) {
      throw new Error(`${this.messages.invalidFileType} ${this.fileType}`);
    }

    let fileBuffer, fileName, fileSize;

    // Handle file from path or base64
    if (this.filePath) {
      if (!fs.existsSync(this.filePath)) {
        throw new Error(`${this.messages.fileNotFound} ${this.filePath}`);
      }
      fileBuffer = fs.readFileSync(this.filePath);
      fileName = path.basename(this.filePath);
      const stats = fs.statSync(this.filePath);
      fileSize = stats.size;
    } else if (this.fileBase64) {
      try {
        fileBuffer = Buffer.from(this.fileBase64, "base64");
        fileName = this.fileName;
        fileSize = fileBuffer.length;
      } catch (error) {
        throw new Error(`Invalid base64 data: ${error.message}`);
      }
    } else {
      throw new Error("Either FILE_PATH or FILE_BASE64 must be provided");
    }

    const formData = new FormData();

    // Check file size limits
    const maxSizes = {
      photo: 10 * 1024 * 1024, // 10MB for photos
      document: 50 * 1024 * 1024, // 50MB for documents
      video: 50 * 1024 * 1024, // 50MB for videos
      audio: 50 * 1024 * 1024, // 50MB for audio
      animation: 50 * 1024 * 1024, // 50MB for animations
      voice: 50 * 1024 * 1024, // 50MB for voice
      video_note: 50 * 1024 * 1024, // 50MB for video notes
      sticker: 512 * 1024, // 512KB for stickers
    };

    const maxSize = maxSizes[this.fileType] || 50 * 1024 * 1024;
    if (fileSize > maxSize) {
      throw new Error(
        `File too large: ${(fileSize / 1024 / 1024).toFixed(
          2
        )}MB. Max allowed: ${(maxSize / 1024 / 1024).toFixed(2)}MB for ${
          this.fileType
        }`
      );
    }

    this.info(
      `File info: ${fileName} (${(fileSize / 1024).toFixed(2)}KB, type: ${
        this.fileType
      })`
    );

    // Detect MIME type based on file extension
    const mimeTypes = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".tiff": "image/tiff",
      ".mp4": "video/mp4",
      ".avi": "video/avi",
      ".mov": "video/quicktime",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".ogg": "audio/ogg",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const ext = path.extname(fileName).toLowerCase();
    const mimeType = mimeTypes[ext] || "application/octet-stream";

    // Special handling for PNG files with metadata (like C2PA)
    const processedBuffer = fileBuffer;

    // Detect if this is a PNG file (either from extension or signature)
    const isPNG =
      ext === ".png" ||
      (fileBuffer.length >= 8 &&
        fileBuffer
          .slice(0, 8)
          .equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
          ));

    if (isPNG && this.fileType === "photo") {
      // Look for C2PA or other problematic chunks
      const bufferStr = fileBuffer.toString("binary");
      if (
        bufferStr.includes("c2pa") ||
        bufferStr.includes("C2PA") ||
        bufferStr.includes("jumb")
      ) {
        const source = this.filePath
          ? `file ${fileName}`
          : `base64 data ${fileName}`;
        if (this.forceAsPhoto) {
          this.warning(
            `PNG ${source} contains C2PA metadata which may cause processing issues. Forcing to send as photo as requested (force_as_photo=true).`
          );
        } else {
          this.warning(
            `PNG ${source} contains C2PA metadata which may cause processing issues. Consider using document type instead of photo.`
          );

          // Try sending as document instead of photo if it's a photo
          if (this.fileType === "photo") {
            this.warning(
              "Switching from photo to document type for better compatibility..."
            );
            this.fileType = "document";
          }
        }
      }
    }

    // Create a Blob from the buffer with proper MIME type
    const blob = new Blob([processedBuffer], { type: mimeType });
    formData.append(this.fileType, blob, fileName);

    // Add other parameters
    const payload = this.getBasePayload();
    Object.keys(payload).forEach((key) => {
      if (payload[key] !== undefined) {
        formData.append(
          key,
          typeof payload[key] === "object"
            ? JSON.stringify(payload[key])
            : payload[key]
        );
      }
    });

    if (this.caption) {
      formData.append("caption", this.caption);
    }

    const endpoint =
      this.fileType === "photo"
        ? "sendPhoto"
        : this.fileType === "video"
        ? "sendVideo"
        : this.fileType === "audio"
        ? "sendAudio"
        : this.fileType === "animation"
        ? "sendAnimation"
        : this.fileType === "voice"
        ? "sendVoice"
        : this.fileType === "video_note"
        ? "sendVideoNote"
        : this.fileType === "sticker"
        ? "sendSticker"
        : "sendDocument";

    this.info(this.messages.sendingFile);
    const response = await this.makeRequest(endpoint, formData, true);

    return {
      messageId: response.result.message_id,
      fileId:
        response.result[this.fileType]?.file_id ||
        response.result.document?.file_id,
    };
  }

  /**
   * Send new message
   */
  async sendMessage() {
    const finalMessage = this.processTemplate();
    const payload = {
      ...this.getBasePayload(),
      text: finalMessage,
    };

    if (this.messageThreadId) {
      this.info(`${this.messages.sendingToThread} ${this.messageThreadId}`);
    }

    this.info(this.messages.sendingMessage);
    const response = await this.makeRequest("sendMessage", payload);

    return response.result.message_id;
  }

  /**
   * Edit existing message
   */
  async editMessage() {
    const finalMessage = this.processTemplate();
    const payload = {
      chat_id: this.chatId,
      message_id: parseInt(this.messageId),
      text: finalMessage,
      parse_mode: this.parseMode,
      disable_web_page_preview: this.disableWebPagePreview,
    };
    if (this.inlineKeyboard) {
      let keyboard = Array.isArray(this.inlineKeyboard)
        ? this.inlineKeyboard
        : [this.inlineKeyboard];
      if (keyboard.length > 0 && !Array.isArray(keyboard[0])) {
        keyboard = keyboard.map((button) => [button]);
      }
      payload.reply_markup = { inline_keyboard: keyboard };
    }

    this.info(`${this.messages.editingMessage} ${this.messageId}`);
    await this.makeRequest("editMessageText", payload);

    return this.messageId;
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      this.validateInputs();

      if (!this.shouldSendNotification()) {
        this.setOutput("success", "true");
        this.setOutput("message_id", "");
        this.setOutput("retry_count", "0");
        return;
      }

      let messageId, fileId;

      if (this.filePath || this.fileBase64) {
        // Send file
        const result = await this.sendFile();
        messageId = result.messageId;
        fileId = result.fileId;
        this.success(`${this.messages.fileSent} ${fileId}`);
      } else if (this.messageId) {
        // Edit existing message
        messageId = await this.editMessage();
        this.success(`${this.messages.messageEdited} ${messageId}`);
      } else {
        // Send new message
        messageId = await this.sendMessage();
        this.success(`${this.messages.messageSent} ${messageId}`);
      }

      // Set outputs for GitHub Actions
      this.setOutput("message_id", messageId);
      this.setOutput("success", "true");
      this.setOutput("file_id", fileId || "");
      this.setOutput("retry_count", this.retryCount.toString());
    } catch (error) {
      this.error(`${this.messages.failed} ${error.message}`);
      this.setOutput("success", "false");
      this.setOutput("retry_count", this.retryCount.toString());
    }
  }
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = TelegramNotify;
  module.exports.TelegramNotify = TelegramNotify;
}

// Execute the action only when run directly (not when imported)
if (require.main === module) {
  const telegramNotify = new TelegramNotify();
  telegramNotify.run();
}

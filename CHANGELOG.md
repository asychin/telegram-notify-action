# 📝 Changelog

## [v3.2.4] - 2025-08-02

### 🐛 **Bug Fixes**

#### 🔧 **Quote Escaping Fix**

- **🚨 Fixed Unescaped Quote in Date Format** - Fixed `unexpected EOF while looking for matching quote` error in release workflow
- **🛠️ Shell Syntax Fix** - Properly escaped quotes in timestamp generation command 
- **✅ Complete Workflow Fix** - All shell syntax errors now resolved in release.yml
- **🔒 Final Syntax Patch** - No remaining shell parsing errors in workflow

**Technical Details:**
- Fixed `date -u +'%Y-%m-%d %H:%M:%S UTC'` to `date -u +\"%Y-%m-%d %H:%M:%S UTC\"`
- Properly escaped quotes inside double-quoted strings
- Eliminated shell parsing error causing workflow failure

## [v3.2.3] - 2025-08-02

### 🐛 **Bug Fixes**

#### 🔧 **Complete Shell Injection Fix**

- **🚨 Fixed Remaining Heredoc in Release Info** - Replaced unsafe heredoc in `release-info` step processing `github.event.release.body`
- **🛡️ Security Enhancement** - Used `printf '%s\n'` for safe multiline content handling in release notes extraction
- **✅ Complete Fix** - All heredoc usage in release workflow now secure with quoted delimiters
- **🔒 Final Security Patch** - No remaining shell command interpretation vectors in workflow

**Technical Details:**

- Fixed `release_notes<<'EOF'` heredoc in release-info step (lines 36-40)
- Replaced with safe `release_notes<<'RELEASE_BODY_END'` and `printf '%s\n'`
- Ensured all GitHub release content processing is secure
- Eliminated final shell injection vulnerability

## [v3.2.2] - 2025-08-02

### 🐛 **Bug Fixes**

#### 🔧 **Critical Shell Injection Fix**

- **🚨 Fixed Release Workflow Shell Injection** - Replaced unsafe heredoc with secure echo commands in release.yml
- **🛡️ Security Enhancement** - Prevented shell interpretation of release notes content as commands
- **✅ Safe Release Notes Generation** - Used `printf '%s\n'` for safe handling of multiline content
- **🔒 Input Sanitization** - Release notes with special characters no longer break workflow execution

**Technical Details:**

- Replaced `cat << 'EOF'` heredoc with series of `echo` commands
- Used `printf '%s\n'` for safe output of `${{ steps.release-info.outputs.release_notes }}`
- Escaped `${{ }}` in YAML examples to prevent shell interpretation
- Fixed "command not found" errors in release workflow

## [v3.2.1] - 2025-08-02

### 🐛 **Bug Fixes**

#### 🔧 **Critical JSON Parsing Fix**

- **🚨 Fixed Inline Keyboard JSON Format** - Corrected invalid JSON format in `inline_keyboard` parameter across all workflow files
- **✅ Telegram API Compliance** - Fixed format from `[{...}],[{...}]` to proper `[[{...}],[{...}]]` array structure
- **📋 Updated Examples** - Fixed JSON format in `.github/workflows/release.yml`, `test.yml`, and all example files
- **🔄 Rate Limiting Behavior** - Confirmed rate limiting retry logic works correctly (expected behavior)

**Files Fixed:**

- `.github/workflows/release.yml` (2 locations)
- `.github/workflows/test.yml` (1 location)
- `examples/github-variables.yml` (1 location)
- `examples/usage-examples.yml` (6 locations)

## [v3.2.0] - 2025-08-02

### 🐛 **Bug Fixes**

#### 🔧 **Release Workflow Fix**

- **🚨 Fixed Critical Pipeline Error** - Fixed heredoc syntax in release workflow preventing shell command interpretation
- **🛡️ Security Improvement** - Template variables from release notes no longer executed as shell commands
- **⚡ Workflow Stability** - Release workflow now handles complex CHANGELOG content safely

### ✨ **New Features**

#### 🤖 **AI Integration Rules**

- **🆕 Comprehensive AI Integration System** - Added complete `.ai-integration-rules` file (2736 lines) for automatic integration by AI assistants
- **📋 Mandatory User Questionnaire** - Implemented structured questionnaire process for optimal configuration
- **🔍 Existing Integration Audit** - Added comprehensive audit process for existing telegram-notify-action implementations
- **🌍 Multi-language Support** - AI integration supports English, Russian, Chinese and auto-detection

#### 🚀 **Enhanced User Experience**

- **👤 User Identification System** - Enhanced user profiling and preference detection
- **⏰ Scheduling Configuration** - Advanced scheduling and timing configuration options
- **🔧 Progressive Deployment Patterns** - New deployment and monitoring system patterns
- **📈 Repository Analysis** - Automatic project structure analysis for optimal integration

#### 🔐 **GitHub API Enhancements**

- **🔑 GitHub API Permissions** - Improved documentation and handling of GitHub API permissions
- **⚙️ Workflow Integration** - Enhanced integration with GitHub Actions workflows
- **📊 Event Context Processing** - Better extraction and processing of GitHub event data

### 📚 **Documentation & Integration**

- **📄 AI Integration Documentation** - Complete integration guides for AI assistants
- **🔗 Marketplace Integration** - Enhanced GitHub Actions Marketplace presence
- **🧪 Validation Rules** - Critical validation rules for preventing common integration errors
- **📋 Migration Support** - Support for auditing and upgrading existing implementations
- **🚨 Critical Workflow Fix** - Added heredoc syntax warning to prevent shell command interpretation in release workflows

### 🔧 **Technical Improvements**

- **🎯 Smart Configuration** - Intelligent configuration based on project type and structure
- **🛡️ Error Prevention** - Advanced validation to prevent "dry data" and configuration errors
- **⚡ Performance Optimization** - Improved processing and validation performance
- **🔍 Debug Enhancement** - Better debugging and testing capabilities

---

## [v3.1.0] - 2025-08-01

### 🐛 **Bug Fixes**

#### ✅ **Deploy Template Variable Substitution**

- **🔧 Fixed "Dry Data" Issue** - All template variables now properly substitute in `deploy` template
- **📊 Enhanced Push Event Support** - Added `filesChanged`, `additions`, `deletions`, `commitCount` extraction for push events
- **🎯 Universal Deploy Template** - Now works correctly for all GitHub event types (push, workflow_run, deployment, release)
- **🛡️ Default Value Fallbacks** - Provides sensible defaults when specific event data is unavailable

#### 🔧 **Event Context Improvements**

- **⚡ Push Event Variables** - Extract branch info from `refs/heads/` format
- **📈 File Change Statistics** - Calculate file changes from commit data for push events
- **👤 Author Information** - Consistent author extraction across event types
- **📅 Timestamp Handling** - Proper date formatting for all event types

#### 🧪 **Debug and Testing**

- **🐛 Enhanced Debug Script** - Updated `debug-template.js` with mock event data support
- **✨ Multi-language Testing** - Comprehensive testing for EN/RU/ZH templates
- **🔍 Template Validation** - Better testing coverage for variable substitution

### 📝 **Technical Details**

- Fixed template variables `{{baseBranch}}`, `{{headBranch}}`, `{{filesChanged}}`, `{{additions}}`, `{{deletions}}`, `{{author}}`, `{{prTitle}}`, `{{prCreatedAt}}`, `{{deployStatus}}` not substituting in non-PR events
- Enhanced `getEventContext()` function with comprehensive push event support
- Added universal fallback values for all deploy template variables
- Improved code formatting and ESLint compliance

---

## [v3.0.0] - 2025-01-31

### 🎯 **Major Features - v3.0.0 Release**

#### ✨ **Automatic Event Context Extraction (NEW!)**

- **🚀 Smart Event Detection** - Automatically extracts relevant variables based on GitHub event type
- **🔍 Issue Events** - `author`, `issueNumber`, `issueTitle`, `issueState`, `issueBody`, `labels`, `assignees`, `createdAt`, `updatedAt`
- **🔄 Pull Request Events** - `author`, `prNumber`, `prTitle`, `prState`, `prBody`, `prUrl`, `baseBranch`, `headBranch`, `isDraft`, `mergeable`, `labels`, `assignees`
- **📤 Push Events** - `pusher`, `commitCount`, `lastCommitMessage`, `lastCommitAuthor`, `lastCommitId`
- **🎉 Release Events** - `releaseAuthor`, `releaseName`, `releaseTag`, `releaseBody`, `isPrerelease`, `isDraft`, `releaseCreatedAt`
- **⚙️ Workflow Run Events** - `workflowName`, `workflowStatus`, `workflowConclusion`, `workflowId`, `workflowRunNumber`, `workflowActor`
- **🧪 No Configuration Required** - All variables available without manual setup

#### 🌐 **Ready-to-Use URL Variables (NEW!)**

- **🔗 Pre-built URLs** - `{{runUrl}}`, `{{commitUrl}}`, `{{workflowUrl}}`, `{{compareUrl}}`
- **📋 Repository URLs** - `{{issuesUrl}}`, `{{pullRequestsUrl}}`, `{{releasesUrl}}`
- **🏗️ GitHub Enterprise Support** - Works with custom GitHub servers
- **💡 Simplified Templates** - No need to construct URLs manually

#### 🔄 **Enhanced Retry Logic**

- **⚡ Improved Rate Limiting** - Separate `max_rate_limit_retries` parameter (default: 8)
- **🛡️ Smart Backoff** - Different strategies for different error types
- **📈 Better Defaults** - Increased `max_retries` from 3 to 5
- **📊 Enhanced Logging** - Detailed retry attempt tracking
- **🎯 Handles Long Delays** - Supports 'retry after X seconds' from Telegram API

#### 📤 **Enhanced File Upload**

- **🖼️ Smart Image Processing** - Automatic C2PA metadata detection
- **📱 Base64 Upload Support** - Send files directly from base64 encoded data
- **🎛️ Force Photo Mode** - Override automatic file type conversion with `force_as_photo`
- **🔍 Intelligent Processing** - Optimized file handling for better Telegram compatibility

### 🎨 **Template System Improvements**

#### 🚀 **Unified Template System**

- **📝 Markdown Support** - Full migration from HTML to Markdown formatting
- **🌍 Multi-language** - Enhanced templates for English, Russian, and Chinese
- **🔧 Template Fixes** - Fixed all `<b>text</b>` → `**text**` conversions
- **📋 Better Variables** - Improved template variable handling and validation

#### 💡 **Advanced Template Features**

- **🎯 Dynamic Template Selection** - Based on GitHub events and conditions
- **🚀 Creative Template Usage** - Deploy template for PRs, test template for health checks
- **⚠️ Context-Aware Messages** - Templates adapt to event context automatically
- **📊 Rich Variable Support** - 50+ automatic variables available

### 🛡️ **Security & Advanced Features**

#### 🔒 **Enhanced Security**

- **🏢 Business Connections** - Support for Telegram Business API
- **✨ Message Effects** - Support for message effects (stars, hearts, etc.)
- **🔐 Content Protection** - Prevent message forwarding and saving
- **📊 Extended GitHub Context** - 20+ additional GitHub variables available

#### 🏃 **System Improvements**

- **📊 Runner Information** - OS, architecture, environment details
- **🛠️ Additional Variables** - `{{jobId}}`, `{{actionPath}}`, `{{stepSummary}}`
- **🔧 Better Error Handling** - Improved validation for all parameters
- **📈 Performance Optimizations** - Faster variable processing and template rendering

### 🧪 **Testing & Quality**

#### ✅ **Comprehensive Test Suite**

- **🧪 Event Context Tests** - Full coverage for automatic variable extraction
- **📝 Template Tests** - All templates tested across multiple languages
- **🔄 Retry Logic Tests** - Rate limiting and error handling validation
- **📤 File Upload Tests** - Base64, C2PA, and force_as_photo scenarios
- **🛡️ Security Tests** - Input validation and error handling

#### 📖 **Documentation Overhaul**

- **📚 Complete Rewrite** - All documentation updated for v3
- **🌍 Multi-language Docs** - English, Russian, Chinese documentation
- **📋 More Examples** - Extensive usage examples for all features
- **🎯 Migration Guide** - Easy upgrade path from v2

### 🔧 **Workflow & Examples**

#### 📊 **Enhanced Monitoring Workflows**

- **🔍 Advanced Monitoring** - Comprehensive example with all event types
- **🎨 Rich Formatting** - Better emoji usage and visual appeal
- **📱 Improved Keyboards** - Multi-row inline keyboards with more actions
- **🌐 URL Simplification** - Using new URL variables instead of manual construction

#### 🎯 **Practical Examples**

- **📁 New Examples** - `github-variables.yml`, `advanced-monitoring.yml`
- **🔧 Updated Workflows** - All examples updated to use v3 features
- **💡 Best Practices** - Demonstrated proper usage patterns
- **📝 Code Documentation** - Better comments and explanations

### 🚀 **Migration & Compatibility**

#### 📈 **Breaking Changes**

- **⬆️ Version Bump** - Updated from v2.x to v3.0.0
- **📝 Template Format** - HTML → Markdown migration required
- **🔧 New Parameters** - Additional optional parameters available
- **📊 Enhanced Defaults** - Better default values for production use

#### 🛠️ **Backwards Compatibility**

- **✅ Existing Workflows** - Most v2 workflows work without changes
- **📋 Parameter Names** - All existing parameters maintained
- **🔄 Gradual Migration** - Can adopt new features incrementally
- **📖 Clear Documentation** - Migration guide provided

---

## [v2.x] - 2024-07-31

## [v2.x] - 2024-07-31

### ✨ Added

- **🎯 Advanced monitoring example** with comprehensive template usage
- **📝 Enhanced documentation** for template system
- **🌍 Multi-language template support** demonstration
- **💡 Creative template usage examples** (using deploy template for PRs, test template for health checks)

### 🔧 Improved

- **📖 Better code documentation** with template descriptions
- **🎨 Template system clarity** with usage examples
- **📊 Rich template variables** showcase in monitoring workflow

### 🎨 Templates Features Showcased

- ✅ **Dynamic template selection** based on GitHub events
- 🚀 **Deploy template** creatively used for Pull Request notifications
- 🧪 **Test template** creatively used for repository health checks
- ⚠️ **Warning template** for new issues and security alerts
- ℹ️ **Info template** for general notifications and statistics
- 🌍 **Russian language support** across all templates

### 📁 Files Added

- `examples/advanced-monitoring.yml` - Comprehensive monitoring example
- `CHANGELOG.md` - This changelog file

---

_For older changes, please refer to git history._

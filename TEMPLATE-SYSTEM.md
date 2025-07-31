# 🎨 Система шаблонов Telegram Notify Action

Полное руководство по системе шаблонизации для создания динамических уведомлений в Telegram.

## 📖 Оглавление

- [Обзор системы шаблонов](#-обзор-системы-шаблонов)
- [Предустановленные шаблоны](#-предустановленные-шаблоны)
- [Синтаксис переменных](#-синтаксис-переменных)
- [Доступные переменные](#-доступные-переменные)
- [Многоязычность](#-многоязычность)
- [Примеры использования](#-примеры-использования)
- [Создание кастомных сообщений](#-создание-кастомных-сообщений)
- [HTML разметка](#-html-разметка)
- [Лучшие практики](#-лучшие-практики)
- [Отладка шаблонов](#-отладка-шаблонов)

## 🚀 Обзор системы шаблонов

Система шаблонов Telegram Notify Action позволяет создавать динамические сообщения с автоматической подстановкой переменных. Каждый шаблон поддерживает:

- **Переменные GitHub контекста** - автоматически доступные данные о workflow
- **Пользовательские переменные** - данные, передаваемые через `template_vars`
- **Многоязычность** - поддержка английского и русского языков
- **HTML разметка** - поддержка форматирования, совместимого с Telegram

### Архитектура шаблонизатора

```mermaid
graph TD
    A[Входные данные] --> B[Выбор шаблона]
    B --> C[Загрузка шаблона]
    C --> D[Объединение переменных]
    D --> E[Подстановка значений]
    E --> F[Очистка HTML]
    F --> G[Финальное сообщение]

    H[GitHub Context] --> D
    I[Template Vars] --> D
    J[Custom Message] --> D
```

## 📋 Предустановленные шаблоны

### `success` - Успешное выполнение

Используется для уведомлений об успешном завершении процессов.

**Английский:**

```html
✅ <b>Success</b>

Repository: {{repository}} Branch: {{refName}} Commit: {{sha}} Actor: {{actor}}
Workflow: {{workflow}} {{customMessage}}
```

**Русский:**

```html
✅ <b>Успех</b>

Репозиторий: {{repository}} Ветка: {{refName}} Коммит: {{sha}} Автор: {{actor}}
Workflow: {{workflow}} {{customMessage}}
```

### `error` - Ошибка выполнения

Используется для уведомлений об ошибках и сбоях.

**Английский:**

```html
❌ <b>Error</b>

Repository: {{repository}} Branch: {{refName}} Commit: {{sha}} Actor: {{actor}}
Workflow: {{workflow}} Job Status: {{jobStatus}} {{customMessage}}
```

**Русский:**

```html
❌ <b>Ошибка</b>

Репозиторий: {{repository}} Ветка: {{refName}} Коммит: {{sha}} Автор: {{actor}}
Workflow: {{workflow}} Статус задачи: {{jobStatus}} {{customMessage}}
```

### `warning` - Предупреждение

Используется для некритичных предупреждений.

**Английский:**

```html
⚠️ <b>Warning</b>

Repository: {{repository}} Branch: {{refName}} Workflow: {{workflow}}
{{customMessage}}
```

**Русский:**

```html
⚠️ <b>Предупреждение</b>

Репозиторий: {{repository}} Ветка: {{refName}} Workflow: {{workflow}}
{{customMessage}}
```

### `info` - Информационное сообщение

Используется для общих уведомлений и информации.

**Английский:**

```html
ℹ️ <b>Information</b>

Repository: {{repository}} Branch: {{refName}} Actor: {{actor}}
{{customMessage}}
```

**Русский:**

```html
ℹ️ <b>Информация</b>

Репозиторий: {{repository}} Ветка: {{refName}} Автор: {{actor}}
{{customMessage}}
```

### `deploy` - Развертывание

Используется для уведомлений о развертывании приложений.

**Английский:**

```html
🚀 <b>Deployment</b>

Repository: {{repository}} Branch: {{refName}} Commit: {{sha}} Run:
#{{runNumber}} Deployed by: {{actor}} Status: {{deployStatus}} {{customMessage}}
```

**Русский:**

```html
🚀 <b>Развертывание</b>

Репозиторий: {{repository}} Ветка: {{refName}} Коммит: {{sha}} Запуск:
#{{runNumber}} Развернул: {{actor}} Статус: {{deployStatus}} {{customMessage}}
```

### `test` - Результаты тестов

Используется для отчетов о тестировании.

**Английский:**

```html
🧪 <b>Test Results</b>

Repository: {{repository}} Branch: {{refName}} Commit: {{sha}} Run:
#{{runNumber}} Test Status: {{testStatus}} Coverage: {{coverage}}
{{customMessage}}
```

**Русский:**

```html
🧪 <b>Результаты тестов</b>

Репозиторий: {{repository}} Ветка: {{refName}} Коммит: {{sha}} Запуск:
#{{runNumber}} Статус тестов: {{testStatus}} Покрытие: {{coverage}}
{{customMessage}}
```

### `release` - Новый релиз

Используется для уведомлений о новых версиях.

**Английский:**

```html
🎉 <b>New Release</b>

Repository: {{repository}} Version: {{version}} Tag: {{tag}} Released by:
{{actor}} {{releaseNotes}} {{customMessage}}
```

**Русский:**

```html
🎉 <b>Новый релиз</b>

Репозиторий: {{repository}} Версия: {{version}} Тег: {{tag}} Выпустил: {{actor}}
{{releaseNotes}} {{customMessage}}
```

## 🔧 Синтаксис переменных

Переменные в шаблонах используют синтаксис двойных фигурных скобок:

```text
{{имяПеременной}}
```

### Правила подстановки

1. **Найдена переменная** - значение подставляется
2. **Переменная не найдена** - остается как есть (`{{unknownVar}}`)
3. **Пустое значение** - подставляется пустая строка

### Пример обработки

**Шаблон:**

```html
Repository: {{repository}} Unknown: {{unknownVariable}} Empty: {{emptyValue}}
```

**Переменные:**

```json
{
  "repository": "user/repo",
  "emptyValue": ""
}
```

**Результат:**

```html
Repository: user/repo Unknown: {{unknownVariable}} Empty:
```

## 📊 Доступные переменные

### GitHub Context (автоматически доступны)

| Переменная   | Описание            | Пример                 |
| ------------ | ------------------- | ---------------------- |
| `repository` | Имя репозитория     | `user/awesome-project` |
| `refName`    | Имя ветки или тега  | `main`, `feature/auth` |
| `sha`        | SHA коммита         | `a1b2c3d4e5f6...`      |
| `actor`      | Пользователь        | `john-doe`             |
| `workflow`   | Имя workflow        | `CI/CD Pipeline`       |
| `job`        | Имя задачи          | `build-and-test`       |
| `runId`      | ID запуска workflow | `123456789`            |
| `runNumber`  | Номер запуска       | `42`                   |
| `eventName`  | Событие-триггер     | `push`, `pull_request` |
| `jobStatus`  | Статус задачи       | `success`, `failure`   |

### Специальные переменные

| Переменная      | Описание                       | Использование        |
| --------------- | ------------------------------ | -------------------- |
| `customMessage` | Содержимое параметра `message` | Дополнительный текст |

### Автоматические переменные (✨ Новое в v3.0)

**Telegram Notify Action теперь автоматически извлекает переменные из GitHub событий!**

Больше не нужно вручную прописывать:

```yaml
# ❌ Старый способ (v2.x)
template_vars: |
  {
    "author": "${{ github.event.issue.user.login }}",
    "issueNumber": "${{ github.event.issue.number }}",
    "issueTitle": "${{ github.event.issue.title }}"
  }
```

Теперь эти переменные доступны автоматически:

```yaml
# ✅ Новый способ (v3.0)
message: |
  **Автор:** {{author}}
  **Issue:** #{{issueNumber}} - {{issueTitle}}

# Переменные доступны сразу!
```

**Доступные автоматические переменные по событиям:**

| Событие        | Автоматические переменные                                                               |
| -------------- | --------------------------------------------------------------------------------------- |
| `issues`       | `author`, `issueNumber`, `issueTitle`, `issueState`, `labels`, `assignees`, `createdAt` |
| `pull_request` | `author`, `prNumber`, `prTitle`, `baseBranch`, `headBranch`, `isDraft`, `labels`        |
| `push`         | `pusher`, `commitCount`, `lastCommitMessage`, `lastCommitAuthor`                        |
| `release`      | `releaseAuthor`, `releaseName`, `releaseTag`, `isPrerelease`                            |

Подробная документация: [AUTO-CONTEXT-VARIABLES.md](docs/AUTO-CONTEXT-VARIABLES.md)

### Пользовательские переменные

Передаются через параметр `template_vars` в формате JSON для кастомных значений:

```yaml
template_vars: |
  {
    "version": "v2.1.0",
    "environment": "production",
    "deployStatus": "successful",
    "customAuthor": "Вася Пупкин"  # Переопределяет автоматическое значение
  }
```

## 🌍 Многоязычность

### Выбор языка

Язык шаблона определяется параметром `language`:

```yaml
language: en  # English (по умолчанию)
language: ru  # Русский
```

### Поддерживаемые языки

- **English (`en`)** - полная поддержка всех шаблонов
- **Русский (`ru`)** - полная поддержка всех шаблонов

### Fallback механизм

Если шаблон не найден для указанного языка, используется английская версия.

## 💡 Примеры использования

### Базовое использование шаблона

```yaml
- name: Success Notification
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    message: "Deployment completed successfully!"
    language: ru
```

### Шаблон с пользовательскими переменными

```yaml
- name: Test Results
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: test
    message: "All tests passed! 🎉"
    template_vars: |
      {
        "testStatus": "✅ All Passed",
        "coverage": "95.8%",
        "duration": "2m 34s",
        "failedTests": "0",
        "totalTests": "127"
      }
```

### Шаблон развертывания с деталями

```yaml
- name: Deployment Notification
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: deploy
    message: |
      🎯 **Deployment Details:**

      - Environment: Production
      - Database migrated: ✅
      - CDN cache cleared: ✅
      - Health check: ✅
    template_vars: |
      {
        "deployStatus": "✅ Successful",
        "version": "${{ github.ref_name }}",
        "environment": "production",
        "deployTime": "3m 45s"
      }
```

### Условное использование шаблонов

```yaml
- name: Conditional Template
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: ${{ job.status == 'success' && 'success' || 'error' }}
    message: ${{ job.status == 'success' && 'Everything is working!' || 'Something went wrong!' }}
    template_vars: |
      {
        "status": "${{ job.status }}",
        "conclusion": "${{ job.conclusion }}"
      }
```

## 🎨 Создание кастомных сообщений

### Без шаблона

```yaml
- name: Custom Message
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: |
      🔧 <b>Custom Notification</b>

      Repository: ${{ github.repository }}
      Branch: ${{ github.ref_name }}
      Triggered by: ${{ github.actor }}

      Custom details here...
```

### Комбинирование шаблона и кастомного сообщения

```yaml
- name: Enhanced Template
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    message: |
      <b>Deployment Summary:</b>
      - Services updated: 5
      - Downtime: 0 seconds
      - Performance: +15% faster

      <a href="https://app.example.com">🌐 Open Application</a>
    template_vars: |
      {
        "deployStatus": "Zero-downtime success"
      }
```

## 📝 HTML разметка

### Поддерживаемые теги

Telegram поддерживает ограниченный набор HTML тегов:

| Тег                        | Описание           | Пример                                    |
| -------------------------- | ------------------ | ----------------------------------------- |
| `<b>`, `<strong>`          | Жирный текст       | `<b>Important</b>`                        |
| `<i>`, `<em>`              | Курсивный текст    | `<i>Emphasis</i>`                         |
| `<u>`, `<ins>`             | Подчеркнутый текст | `<u>Underlined</u>`                       |
| `<s>`, `<strike>`, `<del>` | Зачеркнутый текст  | `<s>Deleted</s>`                          |
| `<span>`                   | Контейнер          | `<span class="tg-spoiler">Spoiler</span>` |
| `<tg-spoiler>`             | Спойлер            | `<tg-spoiler>Hidden text</tg-spoiler>`    |
| `<a>`                      | Ссылка             | `<a href="https://example.com">Link</a>`  |
| `<code>`                   | Встроенный код     | `<code>console.log()</code>`              |
| `<pre>`                    | Блок кода          | `<pre>function() { ... }</pre>`           |

### Автоматическая очистка

Система автоматически удаляет неподдерживаемые теги:

**Входной текст:**

```html
<div class="container">
  <h1>Title</h1>
  <b>Bold text</b>
  <script>
    alert("hack");
  </script>
</div>
```

**Результат:**

```html
Title <b>Bold text</b>
```

### Примеры форматирования

```html
🎯 <b>Deployment Status</b>

<i>Environment:</i> <code>production</code> <i>Version:</i>
<code>{{version}}</code> <i>Status:</i> <b>{{deployStatus}}</b>

<a href="https://app.example.com">🌐 Open Application</a>

<pre>
Build Time: {{buildTime}}
Deploy Time: {{deployTime}}
Total Time: {{totalTime}}
</pre>

<tg-spoiler>Secret deployment key: {{secretKey}}</tg-spoiler>
```

## 🏆 Лучшие практики

### 1. Именование переменных

```yaml
# ✅ Хорошо - описательные имена
template_vars: |
  {
    "deploymentStatus": "successful",
    "buildDuration": "3m 45s",
    "testCoverage": "95.8%"
  }

# ❌ Плохо - неясные имена
template_vars: |
  {
    "status": "ok",
    "time": "3:45",
    "percent": "95.8"
  }
```

### 2. Структурирование сообщений

```yaml
# ✅ Хорошо - четкая структура
message: |
  <b>📊 Build Summary</b>

  <i>Status:</i> {{buildStatus}}
  <i>Duration:</i> {{buildDuration}}
  <i>Tests:</i> {{testResults}}

  <b>🚀 Next Steps:</b>
  {{nextSteps}}

# ❌ Плохо - неструктурированно
message: "Build {{buildStatus}} in {{buildDuration}} tests {{testResults}} next {{nextSteps}}"
```

### 3. Обработка ошибок

```yaml
# ✅ Хорошо - проверка условий
template_vars: |
  {
    "testStatus": "${{ steps.test.outcome == 'success' && '✅ Passed' || '❌ Failed' }}",
    "coverage": "${{ steps.coverage.outputs.percentage || 'N/A' }}"
  }
```

### 4. Использование эмодзи

```yaml
# ✅ Хорошо - умеренное использование
message: "🎉 Deployment successful! Version {{version}} is now live."

# ❌ Плохо - избыток эмодзи
message: "🎉🚀✨🎯 Deployment 🎊🎈 successful! 🌟⭐ Version {{version}} 🎁🎀 is now live! 🔥💯"
```

## 🔍 Отладка шаблонов

### Включение отладки

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

### Проверка переменных

```yaml
- name: Debug Template Variables
  run: |
    echo "Repository: ${{ github.repository }}"
    echo "Ref: ${{ github.ref_name }}"
    echo "Actor: ${{ github.actor }}"
    echo "Job Status: ${{ job.status }}"
```

### Тестирование шаблонов

```yaml
- name: Test Template
  uses: asychin/telegram-notify-action@v2
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: test
    message: "Testing template system"
    template_vars: |
      {
        "testMode": true,
        "debugInfo": "Template variables test",
        "timestamp": "${{ github.run_number }}"
      }
```

### Проверка JSON синтаксиса

```bash
# Локальная проверка JSON
echo '{"key": "value", "number": 42}' | jq .

# В GitHub Actions
- name: Validate JSON
  run: |
    cat << 'EOF' | jq .
    {
      "version": "v1.0.0",
      "status": "success"
    }
    EOF
```

## 🚨 Частые ошибки

### 1. Неправильный JSON в template_vars

```yaml
# ❌ Ошибка - неэкранированные кавычки
template_vars: |
  {
    "message": "Hello "world""
  }

# ✅ Исправлено
template_vars: |
  {
    "message": "Hello \"world\""
  }
```

### 2. Несуществующие переменные

```yaml
# ⚠️ Переменная не будет заменена
template: success
message: "Build {{buildNumber}} completed"
# buildNumber не определена в template_vars
```

### 3. Неподдерживаемые HTML теги

```yaml
# ❌ Теги будут удалены
message: |
  <div class="alert">
    <h2>Warning</h2>
    <p>This is important</p>
  </div>

# ✅ Поддерживаемые теги
message: |
  <b>Warning</b>

  This is important
```

## 📚 Дополнительные ресурсы

- [Основная документация](README.md)
- [Примеры использования](examples/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [GitHub Actions Context](https://docs.github.com/en/actions/learn-github-actions/contexts)

---

**🔧 Система шаблонов разработана для максимальной гибкости и удобства использования в GitHub Actions workflows.**

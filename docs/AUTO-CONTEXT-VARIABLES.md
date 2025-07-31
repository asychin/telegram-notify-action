# 🔄 Автоматические Контекстные Переменные

Telegram Notify Action автоматически извлекает и предоставляет переменные из GitHub событий без необходимости ручной настройки.

## 🎯 Основная идея

**Упрощенная настройка:**

```yaml
- name: Issue Notification
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: warning
    message: |
      🐛 **Новый Issue**

      **Автор:** {{author}}
      **Заголовок:** {{issueTitle}}
      **Номер:** #{{issueNumber}}
      **Метки:** {{labels}}
    # author, issueTitle, issueNumber, labels доступны автоматически!
```

Вместо ручного прописывания:

```yaml
template_vars: |
  {
    "author": "${{ github.event.issue.user.login }}",
    "issueNumber": "${{ github.event.issue.number }}",
    "issueTitle": "${{ github.event.issue.title }}",
    "labels": "${{ join(github.event.issue.labels.*.name, ', ') }}"
  }
```

## 📋 Доступные автоматические переменные

### Основные GitHub переменные

| Переменная | Описание | Пример |
|------------|----------|--------|
| `repository` | Полное имя репозитория | `"owner/repo-name"` |
| `refName` | Короткое имя ветки/тега | `"main"`, `"feature-branch"` |
| `sha` | SHA коммита | `"abc123..."` |
| `actor` | Пользователь, запустивший workflow | `"username"` |
| `workflow` | Имя workflow | `"CI/CD Pipeline"` |
| `job` | Имя текущей задачи | `"build"` |
| `runId` | ID запуска workflow | `"123456789"` |
| `runNumber` | Номер запуска | `"42"` |
| `eventName` | Имя события | `"push"`, `"pull_request"` |
| `jobStatus` | Статус задачи | `"success"`, `"failure"` |

### Общие переменные (для всех событий)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `triggerUser` | Пользователь, инициировавший событие | `"john-doe"` |
| `triggerUserId` | ID пользователя | `12345` |
| `action` | Действие события | `"opened"`, `"closed"` |

### События Issues (`issues`)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `author` | Автор issue | `"jane-smith"` |
| `issueNumber` | Номер issue | `123` |
| `issueTitle` | Заголовок issue | `"Bug in login form"` |
| `issueState` | Состояние issue | `"open"`, `"closed"` |
| `issueBody` | Тело issue | `"Steps to reproduce..."` |
| `labels` | Метки (через запятую) | `"bug, urgent, frontend"` |
| `assignees` | Назначенные (через запятую) | `"dev1, dev2"` |
| `createdAt` | Дата создания | `"2024-01-15T10:30:00Z"` |
| `updatedAt` | Дата обновления | `"2024-01-15T10:35:00Z"` |

### События Pull Request (`pull_request`)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `author` | Автор PR | `"developer"` |
| `prNumber` | Номер PR | `42` |
| `prTitle` | Заголовок PR | `"Add new feature"` |
| `prState` | Состояние PR | `"open"`, `"closed"` |
| `prBody` | Описание PR | `"This PR adds..."` |
| `prUrl` | URL Pull Request | `"https://github.com/owner/repo/pull/42"` |
| `baseBranch` | Базовая ветка | `"main"` |
| `headBranch` | Исходная ветка | `"feature-auth"` |
| `isDraft` | Черновик? | `true`, `false` |
| `mergeable` | Можно мержить? | `true`, `false` |
| `labels` | Метки | `"enhancement, review-needed"` |
| `assignees` | Назначенные | `"reviewer1, reviewer2"` |
| `prCreatedAt` | Дата создания PR | `"2024-01-15T10:30:00Z"` |
| `prUpdatedAt` | Дата обновления PR | `"2024-01-15T10:35:00Z"` |

### События Push (`push`)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `pusher` | Кто сделал push | `"developer"` |
| `pusherId` | ID пользователя | `54321` |
| `commitCount` | Количество коммитов | `3` |
| `lastCommitMessage` | Сообщение последнего коммита | `"Fix bug in auth"` |
| `lastCommitAuthor` | Автор последнего коммита | `"John Doe"` |
| `lastCommitId` | ID последнего коммита | `"abc123..."` |

### События Release (`release`)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `releaseAuthor` | Автор релиза | `"maintainer"` |
| `releaseName` | Название релиза | `"v2.1.0"` |
| `releaseTag` | Тег релиза | `"v2.1.0"` |
| `releaseBody` | Описание релиза | `"## What's Changed..."` |
| `isPrerelease` | Пре-релиз? | `true`, `false` |
| `isDraft` | Черновик? | `true`, `false` |
| `releaseCreatedAt` | Дата создания релиза | `"2024-01-15T10:30:00Z"` |

### События Deployment (`deployment`, `deployment_status`)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `deploymentId` | ID развертывания | `123456` |
| `deploymentEnvironment` | Окружение | `"production"` |
| `deploymentState` | Статус развертывания | `"success"`, `"failure"` |
| `deploymentDescription` | Описание | `"Deploy v2.1.0"` |
| `deploymentRef` | Ссылка развертывания | `"refs/heads/main"` |
| `deploymentSha` | SHA развертывания | `"abc123..."` |
| `deploymentCreator` | Создатель развертывания | `"deployer"` |
| `deploymentEnvironmentUrl` | URL окружения | `"https://app.example.com"` |

### События Workflow Run (`workflow_run`)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `workflowName` | Имя workflow | `"CI Pipeline"` |
| `workflowStatus` | Статус workflow | `"completed"` |
| `workflowConclusion` | Результат workflow | `"success"`, `"failure"` |
| `workflowId` | ID workflow | `123456` |
| `workflowRunNumber` | Номер запуска | `42` |
| `workflowActor` | Актор workflow | `"username"` |

### События Review (`pull_request_review`)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `reviewAuthor` | Автор ревью | `"reviewer"` |
| `reviewState` | Состояние ревью | `"approved"`, `"changes_requested"` |
| `reviewBody` | Текст ревью | `"Looks good!"` |
| `reviewId` | ID ревью | `123456` |

### События Comment (`issue_comment`)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `commentAuthor` | Автор комментария | `"commenter"` |
| `commentBody` | Текст комментария | `"Thanks for the fix!"` |
| `commentId` | ID комментария | `123456` |
| `commentCreatedAt` | Дата создания | `"2024-01-15T10:30:00Z"` |

## 💡 Примеры использования

### Базовый пример - Issues

```yaml
- name: Issue Notification
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: warning
    message: |
      🐛 **Новый Issue**

      **Автор:** {{author}}
      **Заголовок:** {{issueTitle}}
      **Номер:** #{{issueNumber}}
      **Метки:** {{labels}}
      **Репозиторий:** {{repository}}
      **Ветка:** {{refName}}
```

### Pull Request уведомления

```yaml
- name: PR Notification
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: info
    message: |
      🔀 **Pull Request**

      **Автор:** {{author}}
      **Заголовок:** {{prTitle}}
      **URL:** {{prUrl}}
      **Ветки:** {{headBranch}} → {{baseBranch}}
      **Статус:** {{prState}}
      **Черновик:** {{isDraft}}
    inline_keyboard: |
      [
        {"text": "👀 Посмотреть PR", "url": "{{prUrl}}"},
        {"text": "📝 Сделать ревью", "url": "{{prUrl}}/files"}
      ]
```

### Переопределение автоматических переменных

```yaml
template_vars: |
  {
    "author": "Кастомное имя",  # Переопределяет автоматическое значение
    "customNote": "Срочно!",   # Пользовательская переменная
    "repository": "{{repository}}" # Можно использовать автоматические в кастомных
  }
```

## 🔧 Отладка

Включите debug режим для просмотра доступных переменных:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

В логах вы увидите:

```
Available template variables: repository, refName, sha, author, issueNumber, issueTitle, labels, customVar
Automatic event variables: author, issueNumber, issueTitle, labels, createdAt, updatedAt
```

## 🚀 Преимущества

1. **Упрощение конфигурации** - меньше boilerplate кода
2. **Автоматическое извлечение** - не нужно помнить структуру GitHub events
3. **Безопасный доступ** - обработка missing properties
4. **Обратная совместимость** - старые workflow продолжают работать
5. **Возможность переопределения** - пользовательские значения имеют приоритет
6. **Поддержка inline keyboards** - переменные работают в URL кнопок

## 📝 Совместимость

- ✅ **Обратная совместимость** - старые workflow работают без изменений
- ✅ **Приоритет переменных**: Пользовательские → Автоматические → GitHub Context
- ✅ **Поддержка всех основных событий**: issues, pull_request, push, release, deployment, workflow_run
- ✅ **Безопасная обработка** - отсутствующие свойства не вызывают ошибок
- ✅ **Inline keyboards** - переменные корректно заменяются в URL кнопок

---

**🎯 Эта функция значительно упрощает использование Telegram Notify Action и делает конфигурацию более интуитивной!**
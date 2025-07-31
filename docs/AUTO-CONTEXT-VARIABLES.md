# 🔄 Автоматические Контекстные Переменные

**Новая функция v3.0** - Telegram Notify Action теперь автоматически извлекает и предоставляет переменные из GitHub событий без необходимости ручной настройки.

## 🎯 Основная идея

**До (v2.x):**

```yaml
template_vars: |
  {
    "author": "${{ github.event.issue.user.login }}",
    "issueNumber": "${{ github.event.issue.number }}",
    "issueTitle": "${{ github.event.issue.title }}",
    "labels": "${{ join(github.event.issue.labels.*.name, ', ') }}",
    "customField": "my custom value"
  }
```

**После (v3.0):**

```yaml
template_vars: |
  {
    "customField": "my custom value"
    # author, issueNumber, issueTitle, labels уже доступны автоматически!
  }
```

## 📋 Доступные автоматические переменные

### Общие переменные (для всех событий)

| Переменная      | Описание                             | Пример                 |
| --------------- | ------------------------------------ | ---------------------- |
| `triggerUser`   | Пользователь, инициировавший событие | `"john-doe"`           |
| `triggerUserId` | ID пользователя                      | `12345`                |
| `action`        | Действие события                     | `"opened"`, `"closed"` |

### События Issues (`issues`)

| Переменная    | Описание                    | Пример                    |
| ------------- | --------------------------- | ------------------------- |
| `author`      | Автор issue                 | `"jane-smith"`            |
| `issueNumber` | Номер issue                 | `123`                     |
| `issueTitle`  | Заголовок issue             | `"Bug in login form"`     |
| `issueState`  | Состояние issue             | `"open"`, `"closed"`      |
| `issueBody`   | Тело issue                  | `"Steps to reproduce..."` |
| `labels`      | Метки (через запятую)       | `"bug, urgent, frontend"` |
| `assignees`   | Назначенные (через запятую) | `"dev1, dev2"`            |
| `createdAt`   | Дата создания               | `"2024-01-15T10:30:00Z"`  |
| `updatedAt`   | Дата обновления             | `"2024-01-15T10:35:00Z"`  |

### События Pull Request (`pull_request`)

| Переменная   | Описание       | Пример                         |
| ------------ | -------------- | ------------------------------ |
| `author`     | Автор PR       | `"developer"`                  |
| `prNumber`   | Номер PR       | `42`                           |
| `prTitle`    | Заголовок PR   | `"Add new feature"`            |
| `prState`    | Состояние PR   | `"open"`, `"closed"`           |
| `prBody`     | Описание PR    | `"This PR adds..."`            |
| `baseBranch` | Базовая ветка  | `"main"`                       |
| `headBranch` | Исходная ветка | `"feature-auth"`               |
| `isDraft`    | Черновик?      | `true`, `false`                |
| `mergeable`  | Можно мержить? | `true`, `false`                |
| `labels`     | Метки          | `"enhancement, review-needed"` |
| `assignees`  | Назначенные    | `"reviewer1, reviewer2"`       |

### События Push (`push`)

| Переменная          | Описание                     | Пример              |
| ------------------- | ---------------------------- | ------------------- |
| `pusher`            | Кто сделал push              | `"developer"`       |
| `pusherId`          | ID пользователя              | `54321`             |
| `commitCount`       | Количество коммитов          | `3`                 |
| `lastCommitMessage` | Сообщение последнего коммита | `"Fix bug in auth"` |
| `lastCommitAuthor`  | Автор последнего коммита     | `"John Doe"`        |
| `lastCommitId`      | ID последнего коммита        | `"abc123..."`       |

### События Release (`release`)

| Переменная      | Описание        | Пример                   |
| --------------- | --------------- | ------------------------ |
| `releaseAuthor` | Автор релиза    | `"maintainer"`           |
| `releaseName`   | Название релиза | `"v2.1.0"`               |
| `releaseTag`    | Тег релиза      | `"v2.1.0"`               |
| `releaseBody`   | Описание релиза | `"## What's Changed..."` |
| `isPrerelease`  | Пре-релиз?      | `true`, `false`          |
| `isDraft`       | Черновик?       | `true`, `false`          |

### События Deployment (`deployment`, `deployment_status`)

| Переменная              | Описание             | Пример                   |
| ----------------------- | -------------------- | ------------------------ |
| `deploymentId`          | ID развертывания     | `123456`                 |
| `deploymentEnvironment` | Окружение            | `"production"`           |
| `deploymentState`       | Статус развертывания | `"success"`, `"failure"` |
| `deploymentDescription` | Описание             | `"Deploy v2.1.0"`        |

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
    # Больше не нужно прописывать author, issueTitle, etc. в template_vars!
```

### Переопределение автоматических переменных

```yaml
template_vars: |
  {
    "author": "Вася Пупкин",  # Переопределяет автоматическое значение
    "customNote": "Срочно!"
  }
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
      **Ветки:** {{headBranch}} → {{baseBranch}}
      **Статус:** {{prState}}
      **Черновик:** {{isDraft}}
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

## 📝 Совместимость

- ✅ **Обратная совместимость** - старые workflow работают без изменений
- ✅ **Приоритет переменных**: Пользовательские → Автоматические → GitHub Context
- ✅ **Поддержка всех основных событий**: issues, pull_request, push, release, deployment
- ✅ **Безопасная обработка** - отсутствующие свойства не вызывают ошибок

---

**🎯 Эта функция значительно упрощает использование Telegram Notify Action и делает конфигурацию более интуитивной!**

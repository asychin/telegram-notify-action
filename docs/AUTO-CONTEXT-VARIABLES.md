# 📋 Автоматические контекстные переменные

Telegram Notify Action автоматически предоставляет доступ к контекстным переменным GitHub Actions без необходимости их ручного определения в `template_vars`.

**Все переменные доступны в формате переменной в ваших сообщениях.**

## 🏢 Основные переменные репозитория

| Переменная | Описание | Пример |
|------------|----------|---------|
| `{{repository}}` | Полное имя репозитория | `owner/repo-name` |
| `{{repositoryOwner}}` | Владелец репозитория | `owner` |
| `{{repositoryId}}` | ID репозитория | `123456789` |
| `{{repositoryOwnerId}}` | ID владельца репозитория | `987654321` |

## 🌿 Git контекст

| Переменная | Описание | Пример |
|------------|----------|---------|
| `{{ref}}` | Полная ссылка на ветку/тег | `refs/heads/main` |
| `{{refName}}` | Имя ветки или тега | `main` |
| `{{refType}}` | Тип ссылки | `branch` |
| `{{refProtected}}` | Защищена ли ветка | `true` |
| `{{baseRef}}` | Базовая ветка для PR | `main` |
| `{{headRef}}` | Исходная ветка для PR | `feature-branch` |
| `{{sha}}` | SHA коммита | `abc123def456...` |

## 🔄 Workflow контекст

| Переменная | Описание | Пример |
|------------|----------|---------|
| `{{workflow}}` | Название workflow | `CI/CD Pipeline` |
| `{{workflowRef}}` | Ссылка на workflow | `refs/heads/main` |
| `{{workflowSha}}` | SHA коммита workflow | `abc123def456...` |
| `{{job}}` | Название текущей задачи | `build` |
| `{{jobStatus}}` | Статус задачи | `success` |

## 🏃 Информация о запуске

| Переменная | Описание | Пример |
|------------|----------|---------|
| `{{runId}}` | ID запуска workflow | `1234567890` |
| `{{runNumber}}` | Номер запуска | `42` |
| `{{runAttempt}}` | Номер попытки | `1` |
| `{{eventName}}` | Тип события | `push` |
| `{{eventPath}}` | Путь к файлу события | `/github/workflow/event.json` |

## 👤 Информация об участниках

| Переменная | Описание | Пример |
|------------|----------|---------|
| `{{actor}}` | Пользователь, запустивший workflow | `username` |
| `{{actorId}}` | ID пользователя | `12345` |
| `{{triggeredBy}}` | Пользователь, инициировавший событие | `username` |

## 🖥️ Runner информация

| Переменная | Описание | Пример |
|------------|----------|---------|
| `{{runnerName}}` | Имя runner | `GitHub Actions 2` |
| `{{runnerOs}}` | Операционная система | `Linux` |
| `{{runnerArch}}` | Архитектура | `X64` |
| `{{runnerEnvironment}}` | Тип окружения | `github-hosted` |
| `{{runnerToolCache}}` | Путь к кешу инструментов | `/opt/hostedtoolcache` |
| `{{runnerTemp}}` | Временная директория | `/tmp` |
| `{{runnerDebug}}` | Режим отладки | `1` |

## 🌐 GitHub URLs и API

| Переменная | Описание | Пример |
|------------|----------|---------|
| `{{serverUrl}}` | URL сервера GitHub | `https://github.com` |
| `{{apiUrl}}` | URL GitHub API | `https://api.github.com` |
| `{{graphqlUrl}}` | URL GraphQL API | `https://api.github.com/graphql` |

## 🔧 Дополнительные переменные

| Переменная | Описание | Пример |
|------------|----------|---------|
| `{{workspace}}` | Рабочая директория | `/github/workspace` |
| `{{ci}}` | Индикатор CI окружения | `true` |
| `{{retentionDays}}` | Дни хранения артефактов | `90` |
| `{{secretSource}}` | Источник секретов | `Actions` |
| `{{actionRef}}` | Ссылка на action | `v1` |
| `{{actionRepository}}` | Репозиторий action | `owner/action-repo` |

## 📝 Примеры использования

### Базовое использование
```yaml
- name: Send notification
  uses: ./
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: |
      🚀 **Deployment Complete**
      
      **Repository:** {{repository}}
      **Branch:** {{refName}}
      **Commit:** {{sha}}
      **Actor:** {{actor}}
      **Runner:** {{runnerName}} on {{runnerOs}}
```

### Расширенный пример
```yaml
- name: Comprehensive notification
  uses: ./
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: |
      📊 **Workflow Status Report**
      
      🏢 **Repository Info:**
      - Name: {{repository}}
      - Owner: {{repositoryOwner}}
      - ID: {{repositoryId}}
      
      🌿 **Git Context:**
      - Branch: {{refName}} ({{refType}})
      - Commit: {{sha}}
      - Protected: {{refProtected}}
      
      🔄 **Workflow:**
      - Name: {{workflow}}
      - Job: {{job}}
      - Run: #{{runNumber}} ({{runId}})
      - Status: {{jobStatus}}
      
      🖥️ **Runner:**
      - Name: {{runnerName}}
      - OS: {{runnerOs}}
      - Arch: {{runnerArch}}
      
      🌐 **Links:**
      - Server: {{serverUrl}}
      - API: {{apiUrl}}
    inline_keyboard: |
      [
        [
          {"text": "🏠 Repository", "url": "{{serverUrl}}/{{repository}}"},
          {"text": "🔄 This Run", "url": "{{serverUrl}}/{{repository}}/actions/runs/{{runId}}"}
        ]
      ]
```

## 🔍 Отладка

Для отладки доступных переменных используйте:

```yaml
message: |
  🔍 **Debug Info**
  
  Repository: {{repository}}
  Workflow: {{workflow}}
  Runner: {{runnerName}} ({{runnerOs}})
  Event: {{eventName}}
  Actor: {{actor}}
  SHA: {{sha}}
```

Все переменные автоматически извлекаются из контекста GitHub Actions и доступны без дополнительной настройки.

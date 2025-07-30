# 📊 Динамические переменные для Telegram Notify Action

## 🔄 Принцип работы

Action использует динамические переменные через `vars[format()]` и `secrets[format()]` для поддержки разных окружений (dev, prod, staging).

### 🔧 Формат переменных

```yaml
# Секреты (чувствительные данные)
telegram_token: ${{ secrets[format('TELEGRAM_BOT_TOKEN_{0}', github.ref_name)] }}

# Переменные (публичные данные)  
chat_id: ${{ vars[format('TELEGRAM_CHAT_ID_{0}', github.ref_name)] }}
message_thread_id: ${{ vars[format('TELEGRAM_DEPLOYMENT_TOPIC_ID_{0}', github.ref_name)] }}
```

## 📋 Настройка переменных в GitHub

### 🔐 Secrets (Settings → Secrets and variables → Actions → Secrets)

| Имя переменной | Описание | Пример значения |
|----------------|----------|-----------------|
| `TELEGRAM_BOT_TOKEN_DEV` | Токен бота для dev окружения | `1234567890:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQx` |
| `TELEGRAM_BOT_TOKEN_PROD` | Токен бота для prod окружения | `0987654321:ZZYYXXWWVVUUTTSSRRQQPPOONNMMLLKKJJy` |
| `TELEGRAM_BOT_TOKEN_STAGING` | Токен бота для staging окружения | `5555555555:MIDDLEtokenVALUEforSTAGINGenvironmentz` |

### 📊 Variables (Settings → Secrets and variables → Actions → Variables)

#### Telegram переменные (с суффиксом ветки):

| Имя переменной | Описание | Пример значения |
|----------------|----------|-----------------|
| `TELEGRAM_CHAT_ID_DEV` | Chat ID для dev уведомлений | `-1004929055822` |
| `TELEGRAM_CHAT_ID_PROD` | Chat ID для prod уведомлений | `-1005555555555` |
| `TELEGRAM_DEPLOYMENT_TOPIC_ID_DEV` | Topic ID для dev деплоев | `2` |
| `TELEGRAM_DEPLOYMENT_TOPIC_ID_PROD` | Topic ID для prod деплоев | `5` |

#### Общие переменные (без суффикса ветки):

| Имя переменной | Описание | Пример значения |
|----------------|----------|-----------------|
| `OS_VERSION` | Версия ОС для runner | `ubuntu-latest` |
| `REGISTRY_URL` | URL Docker registry | `nexus-trillions-api.wsdemo.online` |
| `SONAR_HOST_URL_DEV` | URL SonarQube для dev | `https://sq.crypton.studio` |
| `USE_VPN_DEV` | Использовать VPN для dev | `true` |

## 🎯 Автоматическое определение окружения

Action автоматически определяет окружение по имени ветки:

- **Ветка `dev`** → использует переменные с суффиксом `_DEV`
- **Ветка `prod`** → использует переменные с суффиксом `_PROD`  
- **Ветка `staging`** → использует переменные с суффиксом `_STAGING`

## 📝 Примеры конфигурации

### Для ветки `dev`:
```yaml
telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN_DEV }}  # TELEGRAM_BOT_TOKEN_DEV
chat_id: ${{ vars.TELEGRAM_CHAT_ID_DEV }}             # TELEGRAM_CHAT_ID_DEV
```

### Для ветки `prod`:
```yaml
telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN_PROD }} # TELEGRAM_BOT_TOKEN_PROD
chat_id: ${{ vars.TELEGRAM_CHAT_ID_PROD }}            # TELEGRAM_CHAT_ID_PROD
```

### Универсальный (динамический) способ:
```yaml
telegram_token: ${{ secrets[format('TELEGRAM_BOT_TOKEN_{0}', github.ref_name)] }}
chat_id: ${{ vars[format('TELEGRAM_CHAT_ID_{0}', github.ref_name)] }}
```

## ✅ Преимущества динамических переменных

1. **🔄 Универсальность** - один workflow для всех окружений
2. **🔒 Безопасность** - разные токены для разных окружений
3. **📊 Изоляция** - уведомления попадают в правильные чаты
4. **🎯 Гибкость** - легко добавить новое окружение
5. **🛠️ Maintainability** - один код, разные конфигурации

## 🚨 Важные моменты

### Обязательные переменные:
- ✅ `TELEGRAM_BOT_TOKEN_{BRANCH}` - всегда в Secrets
- ✅ `TELEGRAM_CHAT_ID_{BRANCH}` - можно в Variables

### Опциональные переменные:
- 🔧 `TELEGRAM_DEPLOYMENT_TOPIC_ID_{BRANCH}` - для топиков
- 🔧 Другие переменные зависят от ваших потребностей

### Fallback стратегия:
Если переменная для конкретной ветки не найдена, workflow упадет с ошибкой. Всегда создавайте переменные для всех используемых веток.

---

**💡 Совет:** Используйте описательные имена веток (dev, prod, staging) для автоматического определения окружения.
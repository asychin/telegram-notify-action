# 🔧 Troubleshooting Telegram Notify Action

## ❌ Распространенные ошибки и их решения

### 1. "Bad Request: chat not found"

**Ошибка:**
```
❌ Failed to send/edit Telegram message: Request failed: Telegram API error: Bad Request: chat not found
```

**Причины и решения:**

#### 🤖 Бот не добавлен в чат
1. Откройте чат/канал в Telegram
2. Добавьте вашего бота в чат:
   - Для **групп**: `@your_bot_name` → Add to Group
   - Для **каналов**: Settings → Administrators → Add Administrator

#### 🔑 Неправильный Chat ID
1. **Проверьте Chat ID** одним из способов:

**Способ 1: Через @userinfobot**
```
1. Добавьте @userinfobot в ваш чат
2. Отправьте любое сообщение в чат
3. @userinfobot покажет Chat ID
```

**Способ 2: Через Telegram API**
```bash
# Замените YOUR_BOT_TOKEN на ваш токен
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates"

# Найдите "chat":{"id": -1234567890} в ответе
```

**Способ 3: Через @getmyid_bot**
```
1. Добавьте @getmyid_bot в ваш чат  
2. Отправьте команду /start
3. Бот покажет Chat ID
```

#### ⚠️ Правильный формат Chat ID

- **Личные чаты**: положительное число (`123456789`)
- **Группы**: отрицательное число (`-987654321`)  
- **Супергруппы/каналы**: отрицательное число с префиксом (`-100123456789`)

### 2. "Forbidden: bot was blocked by the user"

**Решение:**
- Убедитесь, что бот не заблокирован пользователем
- Для личных чатов: пользователь должен первым написать боту

### 3. "Bad Request: message is not modified"

**Причина:** Попытка отредактировать сообщение тем же текстом

**Решение:** Изменяйте содержимое сообщения при редактировании

### 4. "Bad Request: BUTTON_URL_INVALID"

**Причина:** Неправильный формат ссылки в HTML

**Решение:**
```yaml
# ❌ Неправильно
message: '<a href="invalid-url">text</a>'

# ✅ Правильно  
message: '<a href="https://example.com">text</a>'
```

## 🧪 Диагностика проблем

### Тест 1: Проверка токена бота

```bash
# Замените YOUR_BOT_TOKEN на ваш токен
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getMe"

# Успешный ответ:
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "Your Bot Name",
    "username": "your_bot_username"
  }
}
```

### Тест 2: Проверка доступности чата

```bash
# Замените YOUR_BOT_TOKEN и CHAT_ID
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "CHAT_ID",
    "text": "Test message"
  }'
```

### Тест 3: Отладочный workflow

Создайте тестовый workflow для диагностики:

```yaml
name: 🔍 Debug Telegram Bot

on:
  workflow_dispatch:

jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - name: Test bot token
        run: |
          curl -s "https://api.telegram.org/bot${{ secrets[format('TELEGRAM_BOT_TOKEN_{0}', github.ref_name)] }}/getMe" | jq .
          
      - name: Test chat accessibility
        run: |
          curl -s -X POST "https://api.telegram.org/bot${{ secrets[format('TELEGRAM_BOT_TOKEN_{0}', github.ref_name)] }}/sendMessage" \
            -H "Content-Type: application/json" \
            -d '{
              "chat_id": "${{ vars[format('TELEGRAM_CHAT_ID_{0}', github.ref_name)] }}",
              "text": "🧪 Debug test from GitHub Actions"
            }' | jq .
```

## 🛠️ Исправление проблемы "chat not found"

### Пошаговое решение для вашего случая:

1. **Проверьте, что бот добавлен в чат `-1004929055822`**
2. **Дайте боту права администратора** (для каналов/супергрупп)
3. **Проверьте Chat ID** через одного из ботов выше

### Обновленный тестовый workflow:

```yaml
- name: 🔍 Debug chat info
  run: |
    echo "Using chat ID: ${{ vars[format('TELEGRAM_CHAT_ID_{0}', github.ref_name)] }}"
    echo "Bot token (masked): ${{ secrets[format('TELEGRAM_BOT_TOKEN_{0}', github.ref_name)] != '' && 'SET' || 'NOT SET' }}"
    
- name: 📢 Send test message with error handling
  uses: ./.github/actions/telegram-notify
  continue-on-error: true
  id: telegram_test
  with:
    telegram_token: ${{ secrets[format('TELEGRAM_BOT_TOKEN_{0}', github.ref_name)] }}
    chat_id: ${{ vars[format('TELEGRAM_CHAT_ID_{0}', github.ref_name)] }}
    message: |
      🧪 <b>Debug Test</b>
      
      Chat ID: ${{ vars[format('TELEGRAM_CHAT_ID_{0}', github.ref_name)] }}
      Branch: ${{ github.ref_name }}
      
- name: 📊 Show test results
  run: |
    echo "Success: ${{ steps.telegram_test.outputs.success }}"
    echo "Message ID: ${{ steps.telegram_test.outputs.message_id }}"
```

## 📋 Чеклист для устранения проблем

### ✅ Обязательные проверки:

- [ ] Бот создан через @BotFather
- [ ] Токен бота добавлен в GitHub Secrets
- [ ] Бот добавлен в целевой чат/канал
- [ ] Chat ID определен правильно
- [ ] Chat ID добавлен в GitHub Variables
- [ ] У бота есть права для отправки сообщений

### ✅ Права бота в чате:

**Для супергрупп/каналов бот должен быть администратором с правами:**
- [ ] Send messages
- [ ] Edit messages (для редактирования)

**Для обычных групп:**
- [ ] Бот просто добавлен в группу

## 🆘 Если ничего не помогает

1. **Создайте новый тестовый чат**
2. **Добавьте бота как администратора**
3. **Получите новый Chat ID** 
4. **Обновите переменную в GitHub**
5. **Запустите тест еще раз**

---

**💡 В 90% случаев проблема решается добавлением бота в чат и предоставлением ему прав администратора.**
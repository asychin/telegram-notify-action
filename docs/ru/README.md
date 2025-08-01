# 📱 Telegram Notify Action - Расширенная версия

[![Версия](https://img.shields.io/badge/version-2.0.0-blue.svg)](#)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green.svg)](#)
[![Лицензия](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Тесты](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#)

<!-- Навигация по языкам -->
<div align="center">

### 🌐 Язык / Language / 语言

| [🇺🇸 English](../en/README.md) | [🇨🇳 中文](../zh/README.md) | [🇷🇺 **Русский**](README.md) |
| :---------------------------: | :------------------------: | :-------------------------: |
|  **Complete Documentation**   |        **完整文档**        |   **Полная документация**   |

</div>

---

Мощное и многофункциональное GitHub Action для отправки уведомлений в Telegram с расширенными возможностями, включая загрузку файлов, **поддержку base64**, **умную обработку изображений**, шаблоны сообщений, встроенные клавиатуры, логику повторов и многое другое.

## 🚀 Возможности

### Основные функции

- ✅ **Отправка и редактирование сообщений** - Отправляйте новые сообщения или редактируйте существующие
- 📁 **Загрузка файлов** - Отправляйте документы, изображения, видео и другие типы файлов
- 🎨 **Шаблоны сообщений** - Готовые шаблоны для различных сценариев
- ⌨️ **Встроенные клавиатуры** - Интерактивные кнопки с URL и обратными вызовами
- 🔄 **Логика повторов** - Автоматические повторы с экспоненциальной задержкой
- 🌍 **Многоязычность** - Поддержка русского, английского и китайского языков
- 🧵 **Поддержка тем** - Отправка сообщений в определенные темы/потоки форума

### Расширенные функции

- 🎯 **Условная отправка** - Отправка уведомлений на основе статуса workflow
- 🔒 **Защита контента** - Предотвращение пересылки и сохранения сообщений
- 📊 **Контекст GitHub** - Автоматическая подстановка переменных GitHub
- 🎛️ **Гибкая конфигурация** - Обширные возможности настройки
- 📈 **Комплексное тестирование** - Полный набор тестов с высоким покрытием
- 🛡️ **Обработка ошибок** - Изящная обработка ошибок и подробное логирование

### 🆕 Расширенные возможности загрузки файлов

- 📤 **Загрузка Base64** - Отправка файлов напрямую из данных, закодированных в base64
- 🖼️ **Умная обработка изображений** - Автоматическое обнаружение и обработка метаданных C2PA
- 🎛️ **Принудительный режим фото** - Переопределение автоматического преобразования типа файла
- 🔍 **Интеллектуальная обработка файлов** - Автоматическая оптимизация типов файлов для Telegram

## 📦 Быстрый старт

### Базовое использование

```yaml
- name: Отправка уведомления в Telegram
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "Привет из GitHub Actions! 🚀"
```

### Использование шаблонов

```yaml
- name: Уведомление об успехе
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    language: ru
    message: "Развертывание завершено успешно!"
    template_vars: |
      {
        "deployStatus": "успешно",
        "version": "v1.2.3"
      }
```

### Загрузка файлов

```yaml
- name: Отправка отчета
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./reports/test-results.json
    file_type: document
    caption: "📊 Отчет о результатах тестов"
```

### Интерактивное сообщение

```yaml
- name: Интерактивное уведомление
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "🎉 Новый релиз готов!"
    inline_keyboard: |
      [
        {"text": "📥 Скачать", "url": "https://github.com/user/repo/releases/latest"},
        {"text": "📖 Изменения", "url": "https://github.com/user/repo/blob/main/CHANGELOG.md"}
      ]
```

### 🆕 Загрузка файлов Base64

```yaml
- name: Отправка сгенерированного изображения
  run: |
    # Генерируем или конвертируем изображение в base64
    base64_data=$(base64 -i screenshot.png)
    echo "image_data=$base64_data" >> $GITHUB_OUTPUT
  id: convert

- name: Отправка изображения Base64
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_base64: ${{ steps.convert.outputs.image_data }}
    file_name: "screenshot.png"
    file_type: "photo"
    caption: "📸 Сгенерированный скриншот"
```

### 🖼️ Умная обработка изображений

```yaml
- name: Отправка изображения с обработкой C2PA
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./image-with-metadata.png
    file_type: "photo"
    # Автоматически преобразуется в документ при обнаружении метаданных C2PA
    caption: "🖼️ Изображение с умной обработкой"

- name: Принудительная отправка как фото
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./image-with-metadata.png
    file_type: "photo"
    force_as_photo: "true" # Принудительно как фото даже с метаданными C2PA
    caption: "🖼️ Принудительно как фото (могут быть проблемы с обработкой)"
```

## 📖 Входные параметры

### Обязательные параметры

| Параметр         | Описание            | Пример                              |
| ---------------- | ------------------- | ----------------------------------- |
| `telegram_token` | Токен Telegram бота | `${{ secrets.TELEGRAM_BOT_TOKEN }}` |
| `chat_id`        | ID чата Telegram    | `${{ secrets.TELEGRAM_CHAT_ID }}`   |

### Параметры сообщения

| Параметр                   | Описание                | По умолчанию | Пример                           |
| -------------------------- | ----------------------- | ------------ | -------------------------------- |
| `message`                  | Текст сообщения         | -            | `"Привет, мир!"`                 |
| `parse_mode`               | Режим разбора сообщения | `HTML`       | `HTML`, `Markdown`, `MarkdownV2` |
| `disable_web_page_preview` | Отключить превью ссылок | `true`       | `true`, `false`                  |
| `disable_notification`     | Отправить беззвучно     | `false`      | `true`, `false`                  |
| `language`                 | Язык интерфейса         | `en`         | `en`, `ru`, `zh`                 |

### Расширенные параметры сообщения

| Параметр                      | Описание                               | По умолчанию | Пример          |
| ----------------------------- | -------------------------------------- | ------------ | --------------- |
| `message_thread_id`           | ID темы форума                         | -            | `123`           |
| `message_id`                  | ID сообщения для редактирования        | -            | `456`           |
| `reply_to_message_id`         | ID сообщения для ответа                | -            | `789`           |
| `protect_content`             | Защитить от пересылки                  | `false`      | `true`, `false` |
| `allow_sending_without_reply` | Отправить, если цель ответа не найдена | `true`       | `true`, `false` |
| `message_effect_id`           | ID эффекта сообщения                   | -            | `effect_id`     |
| `business_connection_id`      | ID бизнес-соединения                   | -            | `business_id`   |

### Параметры загрузки файлов

| Параметр         | Описание                                  | По умолчанию | Пример                                |
| ---------------- | ----------------------------------------- | ------------ | ------------------------------------- |
| `file_path`      | Путь к файлу                              | -            | `./report.pdf`                        |
| `file_base64`    | Содержимое файла в кодировке base64       | -            | `iVBORw0KGgoAAAANSUhEUgAAAA...`       |
| `file_name`      | Имя файла (обязательно для base64)        | -            | `"screenshot.png"`                    |
| `file_type`      | Тип файла                                 | `document`   | `photo`, `document`, `video`, `audio` |
| `force_as_photo` | Принудительно как фото даже с метаданными | `false`      | `true`, `false`                       |
| `caption`        | Подпись к файлу                           | -            | `"📊 Отчет"`                          |

> **Примечание**: Используйте либо `file_path` ИЛИ `file_base64` (не оба). При использовании `file_base64` параметр `file_name` обязателен.

### Параметры шаблонов

| Параметр        | Описание                  | По умолчанию | Пример                                                             |
| --------------- | ------------------------- | ------------ | ------------------------------------------------------------------ |
| `template`      | Имя шаблона               | -            | `success`, `error`, `warning`, `info`, `deploy`, `test`, `release` |
| `template_vars` | Переменные шаблона (JSON) | `{}`         | `{"version": "v1.0.0"}`                                            |

### Интерактивные функции

| Параметр          | Описание                     | По умолчанию | Пример                                               |
| ----------------- | ---------------------------- | ------------ | ---------------------------------------------------- |
| `inline_keyboard` | Встроенная клавиатура (JSON) | -            | `[{"text": "Кнопка", "url": "https://example.com"}]` |

### Конфигурация повторов

| Параметр      | Описание                                | По умолчанию | Пример |
| ------------- | --------------------------------------- | ------------ | ------ |
| `max_retries` | Максимальное количество попыток повтора | `3`          | `5`    |
| `retry_delay` | Начальная задержка повтора (секунды)    | `1`          | `2`    |

### Условная отправка

| Параметр          | Описание                     | По умолчанию | Пример          |
| ----------------- | ---------------------------- | ------------ | --------------- |
| `send_on_failure` | Отправлять только при ошибке | `false`      | `true`, `false` |
| `send_on_success` | Отправлять только при успехе | `false`      | `true`, `false` |

## 📤 Выходные параметры

| Параметр      | Описание                                      | Пример                           |
| ------------- | --------------------------------------------- | -------------------------------- |
| `message_id`  | ID отправленного/отредактированного сообщения | `123456`                         |
| `success`     | Статус успеха операции                        | `true`, `false`                  |
| `file_id`     | ID загруженного файла                         | `BAADBAADrwADBREAAYag2eLJxJVvAg` |
| `retry_count` | Количество попыток повтора                    | `2`                              |

## 🖼️ Умная обработка изображений

Это action включает возможности интеллектуальной обработки изображений для лучшей совместимости с Telegram:

### Обнаружение метаданных C2PA

Action автоматически обнаруживает метаданные C2PA (Coalition for Content Provenance and Authenticity) в PNG изображениях, которые могут вызвать проблемы при отправке как фото в Telegram.

#### Поведение по умолчанию (Рекомендуется)

```yaml
- name: Умная загрузка изображения
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: "image-with-metadata.png"
    file_type: "photo"
    # Автоматически преобразуется в "document" при обнаружении метаданных C2PA
```

#### Принудительно как фото (Используйте с осторожностью)

```yaml
- name: Принудительная загрузка фото
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: "image-with-metadata.png"
    file_type: "photo"
    force_as_photo: "true" # ⚠️ Может вызвать проблемы с обработкой
```

### Когда использовать `force_as_photo`

- ✅ **Используйте когда**: Вам нужно, чтобы изображения отображались как фото в чате Telegram
- ❌ **Избегайте когда**: Изображение содержит метаданные C2PA (обработка по умолчанию безопаснее)
- ⚠️ **Предупреждение**: Принудительные фото с метаданными могут не обрабатываться на стороне Telegram

### Обработка Base64

Загрузки Base64 поддерживают ту же умную обработку:

```yaml
- name: Base64 с умной обработкой
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_base64: ${{ steps.convert.outputs.image_data }}
    file_name: "generated-image.png"
    file_type: "photo"
    # Обнаружение C2PA применяется также к данным base64
```

## 🎨 Шаблоны сообщений

📚 **[Полная документация по системе шаблонов →](TEMPLATE-SYSTEM.md)**

Action включает готовые шаблоны для обычных сценариев:

### Доступные шаблоны

| Шаблон    | Описание                         | Сценарий использования                   |
| --------- | -------------------------------- | ---------------------------------------- |
| `success` | Уведомление об успехе            | Успешные развертывания, сборки           |
| `error`   | Уведомление об ошибке            | Неудачные workflow, критические проблемы |
| `warning` | Предупреждающее уведомление      | Некритические проблемы, устаревания      |
| `info`    | Информационное уведомление       | Общие обновления, объявления             |
| `deploy`  | Уведомление о развертывании      | Развертывания приложений                 |
| `test`    | Уведомление о результатах тестов | Результаты наборов тестов                |
| `release` | Уведомление о релизе             | Новые релизы, обновления версий          |

### Переменные шаблонов

Шаблоны поддерживают подстановку переменных с использованием синтаксиса `{{переменная}}`:

```yaml
template_vars: |
  {
    "version": "v2.0.0",
    "deployStatus": "успешно",
    "testStatus": "пройдены",
    "coverage": "95%",
    "customMessage": "Дополнительная информация"
  }
```

### Переменные контекста GitHub

Следующие переменные контекста GitHub доступны автоматически:

- `repository` - Имя репозитория
- `refName` - Имя ветки/тега
- `sha` - SHA коммита
- `actor` - Пользователь, запустивший workflow
- `workflow` - Имя workflow
- `job` - Имя задачи
- `runId` - ID запуска workflow
- `runNumber` - Номер запуска workflow
- `eventName` - Событие, запустившее workflow

## 📁 Поддержка загрузки файлов

### Поддерживаемые типы файлов

| Тип          | Описание                      | Макс размер |
| ------------ | ----------------------------- | ----------- |
| `photo`      | Изображения (JPEG, PNG, WebP) | 10 МБ       |
| `document`   | Любой тип файла               | 50 МБ       |
| `video`      | Видеофайлы                    | 50 МБ       |
| `audio`      | Аудиофайлы                    | 50 МБ       |
| `animation`  | GIF анимации                  | 50 МБ       |
| `voice`      | Голосовые сообщения           | 50 МБ       |
| `video_note` | Видеозаметки                  | 50 МБ       |
| `sticker`    | Файлы стикеров                | 50 МБ       |

### Пример загрузки файла

```yaml
- name: Загрузка результатов тестов
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./test-results.html
    file_type: document
    caption: |
      📊 **Результаты тестов**

      Создано: $(date)
      Покрытие: 95%
      Статус: ✅ Пройдены
```

## ⌨️ Встроенные клавиатуры

Создавайте интерактивные сообщения с кликабельными кнопками:

### Типы кнопок

- **URL кнопки** - Открывают внешние ссылки
- **Callback кнопки** - Запускают обратные вызовы бота (требуется обработка ботом)

### Формат клавиатуры

```json
[
  [
    { "text": "Кнопка 1", "url": "https://example1.com" },
    { "text": "Кнопка 2", "url": "https://example2.com" }
  ],
  [{ "text": "Кнопка во всю ширину", "url": "https://example3.com" }]
]
```

### Пример использования

```yaml
inline_keyboard: |
  [
    [
      {"text": "📊 Посмотреть Workflow", "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"},
      {"text": "📝 Посмотреть коммит", "url": "${{ github.server_url }}/${{ github.repository }}/commit/${{ github.sha }}"}
    ],
    [
      {"text": "🐛 Сообщить о проблеме", "url": "${{ github.server_url }}/${{ github.repository }}/issues/new"}
    ]
  ]
```

## 🔄 Логика повторов

Action включает функцию автоматических повторов с экспоненциальной задержкой:

### Конфигурация

```yaml
max_retries: 5 # Максимальное количество попыток повтора
retry_delay: 2 # Начальная задержка в секундах (удваивается с каждым повтором)
```

### Поведение повторов

1. **Начальная попытка** - Попытка отправки немедленно
2. **Первый повтор** - Ожидание `retry_delay` секунд
3. **Второй повтор** - Ожидание `retry_delay * 2` секунд
4. **Третий повтор** - Ожидание `retry_delay * 4` секунд
5. **Продолжение** - До достижения `max_retries`

## 🎯 Условная отправка

Отправляйте уведомления только при соблюдении определенных условий:

### Отправка только при ошибке

```yaml
- name: Уведомление об ошибке
  if: failure()
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: error
    language: ru
    message: "Workflow завершился с ошибкой! Проверьте логи."
    send_on_failure: true
```

### Отправка только при успехе

```yaml
- name: Уведомление об успехе
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    template: success
    language: ru
    message: "Развертывание завершено успешно!"
    send_on_success: true
```

## 🌍 Поддержка нескольких языков

Action поддерживает несколько языков для системных сообщений:

### Поддерживаемые языки

- `en` - Английский (по умолчанию)
- `ru` - Русский
- `zh` - Китайский

### Использование

```yaml
language: ru # Использовать русский интерфейс
```

## 🛠️ Инструкции по настройке

### 1. Создание Telegram бота

1. Отправьте сообщение [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Сохраните токен бота

### 2. Получение ID чата

**Для личного чата:**

1. Отправьте сообщение вашему боту
2. Перейдите по ссылке `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Найдите ваш ID чата в ответе

**Для группового чата:**

1. Добавьте бота в группу
2. Отправьте сообщение, упоминающее бота
3. Перейдите по ссылке getUpdates
4. Найдите ID группового чата (отрицательное число)

### 3. Настройка секретов GitHub

Добавьте эти секреты в ваш репозиторий:

- `TELEGRAM_BOT_TOKEN` - Ваш токен бота
- `TELEGRAM_CHAT_ID` - Ваш ID чата

## 📝 Примеры

### Полный CI/CD Workflow

```yaml
name: CI/CD с уведомлениями Telegram

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Запуск тестов
        run: npm test
        id: tests

      - name: Результаты тестов
        if: always()
        uses: asychin/telegram-notify-action@v3
        with:
          telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          template: ${{ steps.tests.outcome == 'success' && 'test' || 'error' }}
          language: ru
          message: |
            🧪 **Результаты тестов**

            Статус: ${{ steps.tests.outcome }}
            Ветка: ${{ github.ref_name }}
            Коммит: ${{ github.sha }}
          template_vars: |
            {
              "testStatus": "${{ steps.tests.outcome }}",
              "coverage": "95%"
            }
          inline_keyboard: |
            [
              {"text": "📊 Посмотреть детали", "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}
            ]

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Развертывание
        run: echo "Развертывание..."
        id: deploy

      - name: Уведомление о развертывании
        uses: asychin/telegram-notify-action@v3
        with:
          telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          template: deploy
          language: ru
          message: "🚀 Развертывание в продакшн завершено!"
          template_vars: |
            {
              "deployStatus": "успешно",
              "version": "v1.0.0"
            }
```

### Загрузка файла с отчетом

```yaml
- name: Генерация отчета
  run: |
    echo "Генерируем отчет о тестах..."
    npm run test:report

- name: Отправка отчета
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    file_path: ./reports/test-report.html
    file_type: document
    caption: |
      📊 **Отчет о тестах**

      Создано: $(date)
      Тесты: 150 пройдено, 0 провалено
      Покрытие: 95.2%
    inline_keyboard: |
      [
        {"text": "📈 Посмотреть онлайн", "url": "https://your-site.com/reports"}
      ]
```

### Редактирование сообщений

```yaml
- name: Начало процесса
  id: start
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message: "⏳ Начинаем процесс развертывания..."

- name: Развертывание приложения
  run: |
    echo "Развертывание..."
    sleep 30
    echo "Развертывание завершено!"

- name: Обновление статуса
  uses: asychin/telegram-notify-action@v3
  with:
    telegram_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    message_id: ${{ steps.start.outputs.message_id }}
    message: |
      ✅ **Развертывание завершено!**

      Длительность: 30 секунд
      Статус: Успех
      Версия: v1.2.3
    inline_keyboard: |
      [
        {"text": "🌐 Посмотреть сайт", "url": "https://your-site.com"}
      ]
```

## 🧪 Тестирование

Action включает комплексное тестирование:

```bash
# Установка зависимостей
npm install

# Запуск тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage

# Запуск линтинга
npm run lint
```

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте ваши изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под лицензией MIT - см. файл [LICENSE](../../LICENSE) для получения подробной информации.

## 🐛 Устранение неполадок

### Общие проблемы

**Бот не отвечает:**

- Проверьте правильность токена бота
- Убедитесь, что бот не заблокирован
- Проверьте, есть ли у бота необходимые разрешения

**Загрузка файла не удается:**

- Проверьте ограничения размера файла
- Проверьте правильность пути к файлу
- Убедитесь, что тип файла поддерживается

**Шаблон не работает:**

- Проверьте правильность имени шаблона
- Проверьте формат JSON template_vars
- Убедитесь, что все необходимые переменные предоставлены

**Логика повторов не работает:**

- Проверьте подключение к сети
- Проверьте конфигурацию повторов
- Просмотрите логи ошибок для получения подробностей

### Режим отладки

Включите отладочное логирование, установив секрет `ACTIONS_STEP_DEBUG` в `true` в вашем репозитории.

## 🆕 Что нового в v2.0.0

### Расширенная загрузка файлов

- 📤 **Поддержка загрузки Base64** - Отправка файлов напрямую из данных, закодированных в base64
- 🖼️ **Умная обработка изображений** - Автоматическое обнаружение метаданных C2PA
- 🎛️ **Принудительный режим фото** - Переопределение автоматического преобразования типа файла с помощью `force_as_photo`
- 🔍 **Интеллектуальная обработка** - Оптимизированная обработка файлов для лучшей совместимости с Telegram

### Технические улучшения

- ✅ **16 комплексных тестов**, покрывающих всю новую функциональность
- 🧪 **Полное покрытие тестами** для функций base64 и force_as_photo
- 🛡️ **Надежная обработка ошибок** для недействительных данных base64
- 📊 **Улучшенная валидация** для параметров файлов

### Опыт разработчика

- 📖 **Обновленная документация** с обширными примерами
- 🎯 **Четкие руководства по использованию** для обработки метаданных C2PA
- ⚠️ **Полезные предупреждения** о потенциальных проблемах обработки
- 🔧 **Лучшая отладочная** информация

## 📞 Поддержка

- 📖 [Документация](README.md)
- 🎨 [Руководство по системе шаблонов](TEMPLATE-SYSTEM.md)
- 🐛 [Сообщить о проблемах](https://github.com/asychin/telegram-notify-action/issues)
- 💬 [Обсуждения](https://github.com/asychin/telegram-notify-action/discussions)
- 📧 [Контакт](mailto:moloko@skofey.com)

## 🙏 Благодарности

- Спасибо всем участникам
- Вдохновлено сообществом GitHub Actions
- Создано с ❤️ для разработчиков

---

**Создано с ❤️ от [Sychin Andrey](https://github.com/asychin)**

# 📸 Telegram Bot API: sendPhoto vs sendDocument - Полное руководство

## 🎯 Основные различия

### `sendPhoto` - Отправка как фото
- **Назначение**: Изображения для просмотра в галерее
- **Обработка**: Telegram сжимает и оптимизирует изображения
- **Форматы**: JPG, PNG, WebP, GIF (статические)
- **Размер**: До 10 МБ
- **Отображение**: В виде превью в чате, открывается в галерее
- **Качество**: Может быть сжато для оптимизации

### `sendDocument` - Отправка как файл
- **Назначение**: Файлы любого типа, включая изображения
- **Обработка**: Без сжатия, файл остается в оригинальном виде
- **Форматы**: Любые (PNG, JPG, PDF, ZIP, и т.д.)
- **Размер**: До 50 МБ
- **Отображение**: Как файл для скачивания
- **Качество**: Оригинальное качество сохраняется

## 🚨 Проблема IMAGE_PROCESS_FAILED

### Когда возникает:
1. **AI-сгенерированные изображения** с метаданными C2PA/Adobe
2. **PNG файлы** с цифровыми подписями (ChatGPT, DALL-E, Midjourney)
3. **Поврежденные** или нестандартные файлы
4. **Слишком большие** файлы для типа `photo`
5. **Неподдерживаемые** форматы для `sendPhoto`

### Ваш случай:
Ваше изображение от ChatGPT содержит **C2PA метаданные** - цифровые подписи, которые Telegram API не может обработать при использовании `sendPhoto`.

## ✅ Решения

### 1. Используйте `sendDocument` для AI-изображений
```yaml
- name: Send AI-generated image
  uses: ./
  with:
    telegram_token: ${{ secrets.TELEGRAM_TOKEN }}
    chat_id: ${{ secrets.CHAT_ID }}
    file_path: "ai-generated-image.png"
    file_type: "document"  # ← Ключевое изменение
    caption: |
      🤖 AI-сгенерированное изображение
      
      Отправлено как документ для сохранения оригинального качества
```

### 2. Автоматическое определение в Action
Наш enhanced action **автоматически определяет** проблемные PNG файлы:

```javascript
// Автоматическая проверка метаданных
if (ext === '.png' && this.fileType === 'photo') {
  const bufferStr = fileBuffer.toString('binary');
  if (bufferStr.includes('c2pa') || bufferStr.includes('C2PA') || bufferStr.includes('jumb')) {
    this.warning('PNG contains C2PA metadata. Consider using document type.');
    // Автоматически переключается на document
    this.fileType = 'document';
  }
}
```

## 📋 Рекомендации по типам файлов

| Тип изображения | Рекомендуемый метод | Причина |
|-----------------|-------------------|---------|
| **AI-сгенерированные** (ChatGPT, DALL-E) | `sendDocument` | Содержат C2PA метаданные |
| **Скриншоты** | `sendPhoto` | Простые изображения без метаданных |
| **Фотографии с камеры** | `sendPhoto` | Стандартные JPEG файлы |
| **PNG с прозрачностью** | `sendDocument` | Сохранение альфа-канала |
| **Большие изображения** (>10MB) | `sendDocument` | Превышение лимита для photo |
| **GIF анимации** | `sendAnimation` | Специальный тип для анимаций |
| **WebP файлы** | `sendDocument` | Лучшая совместимость |

## 🔧 Практические примеры

### Отправка обычной фотографии
```yaml
- uses: ./
  with:
    telegram_token: ${{ secrets.TELEGRAM_TOKEN }}
    chat_id: ${{ secrets.CHAT_ID }}
    file_path: "screenshot.jpg"
    file_type: "photo"
    caption: "Скриншот приложения"
```

### Отправка AI-изображения
```yaml
- uses: ./
  with:
    telegram_token: ${{ secrets.TELEGRAM_TOKEN }}
    chat_id: ${{ secrets.CHAT_ID }}
    file_path: "chatgpt-image.png"
    file_type: "document"  # Избегаем IMAGE_PROCESS_FAILED
    caption: "Изображение от ChatGPT"
```

### Отправка с автоопределением
```yaml
- uses: ./
  with:
    telegram_token: ${{ secrets.TELEGRAM_TOKEN }}
    chat_id: ${{ secrets.CHAT_ID }}
    file_path: "unknown-image.png"
    file_type: "photo"  # Action автоматически переключится на document если нужно
    caption: "Изображение с автоопределением типа"
```

## 🎨 Качество изображений

### sendPhoto (сжатие):
- ✅ Быстрая загрузка
- ✅ Экономия трафика
- ❌ Возможна потеря качества
- ❌ Не работает с C2PA метаданными

### sendDocument (без сжатия):
- ✅ Оригинальное качество
- ✅ Работает с любыми файлами
- ✅ Поддержка метаданных
- ❌ Больше трафика
- ❌ Отображается как файл, не как изображение

## 📊 Получение изображений в высоком качестве

При получении фотографий от пользователей используйте **последний элемент** массива `photo`:

```javascript
// Получение фото в максимальном качестве
const highestQuality = message.photo[message.photo.length - 1];
const fileId = highestQuality.file_id;

// Скачивание файла
const file = await bot.getFile(fileId);
const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
```

## 🛠️ Наши улучшения в Action

1. **✅ Автоматическое определение** C2PA метаданных
2. **✅ Проверка размера файлов** перед отправкой
3. **✅ Правильные MIME-типы** для всех форматов
4. **✅ Предупреждения** о проблемных файлах
5. **✅ Автоматическое переключение** типов при необходимости

## 🎯 Итоговые рекомендации

### Для вашего случая (AI-изображения):
```yaml
file_type: "document"  # ← Используйте это для ChatGPT изображений
```

### Общие правила:
- **Простые фото** → `sendPhoto`
- **AI-изображения** → `sendDocument`
- **Файлы >10MB** → `sendDocument`
- **PNG с метаданными** → `sendDocument`
- **Нужно оригинальное качество** → `sendDocument`

## 🚀 Готово к использованию!

Теперь ваш enhanced Telegram Notify Action:
- ✅ **Автоматически обрабатывает** проблемные PNG файлы
- ✅ **Предупреждает** о потенциальных проблемах
- ✅ **Поддерживает** все типы файлов
- ✅ **Корректно работает** с AI-сгенерированными изображениями

**Больше никаких ошибок IMAGE_PROCESS_FAILED!** 🎉
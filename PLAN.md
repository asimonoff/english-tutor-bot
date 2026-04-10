# English Tutor Telegram Mini App — План имплементации

## Описание задачи
Создать Telegram Mini App (один файл `index.html`) — репетитора английского языка «Карен».
Приложение работает полностью на стороне клиента: без бэкенда, ключи API вводятся пользователем через UI.

---

## Стек технологий
- **Фронтенд:** Vanilla HTML + CSS + JS (один файл `index.html`)
- **LLM API:** OpenAI `gpt-4o-mini` (REST fetch из браузера)
- **TTS API:** Google Cloud Text-to-Speech Standard Voices (REST fetch из браузера)
- **STT:** Web Speech API (`SpeechRecognition`) — браузерный, бесплатный
- **Хранилище:** `localStorage` (история 5 сообщений + ключи API + настройки голоса)
- **Интеграция:** Telegram Web App JS SDK (`telegram-web-app.js`)

---

## Архитектура файла `index.html`

### Структура секций:
1. `<head>` — мета-теги, Telegram SDK, встроенные CSS-стили
2. `<body>` — два экрана (views), переключаемые через JS:
   - **Экран чата** (`#chat-view`) — основной
   - **Экран настроек** (`#settings-view`) — API-ключи и голос
3. `<script>` — весь JavaScript в одном блоке

---

## Экран чата — компоненты

| Компонент | Описание |
|-----------|----------|
| Шапка | Имя бота "Karen 🎓", кнопка настроек ⚙️ |
| Область сообщений | Скроллируемый список сообщений (user / bot) |
| Блок коррекции | Выделенный блок с коррекцией ошибки (если есть) |
| Индикатор волны | SVG/Canvas анимация à la Siri (5 вертикальных полос) при записи |
| Индикатор громкости | Реагирует на `AudioContext.getByteFrequencyData` |
| Кнопка "Say" 🎤 | Push-to-talk: удержание = запись, отпустить = отправить |
| Текстовое поле | Альтернативный ввод + кнопка отправки |
| Кнопка воспроизведения 🔊 | На каждом сообщении бота — воспроизвести через TTS |

---

## Экран настроек — поля

| Поле | Хранение |
|------|----------|
| OpenAI API Key | `localStorage['openai_key']` |
| Google TTS API Key | `localStorage['google_tts_key']` |
| Голос бота (select) | `localStorage['voice']` |

Голоса для выбора: `en-US-Standard-C`, `en-US-Standard-E`, `uk-UA-Standard-B`, `ru-RU-Standard-C`, `ru-RU-Standard-A`

---

## Системный промпт (Karen)

```
Ты - профессиональный ИИ-репетитор английского языка. Твое имя Карен.
Твоя цель: помочь пользователю достичь уровня Fluent через живое общение.
Правила: дружелюбный стиль, коррекция ошибок в формате "Correction: [текст] — [пояснение на русском]",
ответ не более 3 предложений + один открытый вопрос в конце.
```

---

## JS-модули (внутри `<script>`)

1. **Storage** — `getHistory()`, `saveMessage()`, `getSettings()`, `saveSettings()`
2. **VoiceRecorder** — Web Speech API + `AudioContext` analyser для волны
3. **WaveAnimation** — Canvas 5-полосная анимация Siri
4. **OpenAIClient** — `sendMessage(text)` → gpt-4o-mini, max_tokens:300
5. **GoogleTTS** — `speak(text, voice)` → base64 → AudioContext
6. **ChatUI** — рендер bubbles, парсинг Correction-блока, автоскролл
7. **SettingsScreen** — форма ввода ключей, select голоса
8. **App** — Telegram SDK init, роутинг, проверка ключей при старте

---

## Список задач

- [x] html-skeleton — HTML структура
- [x] css-styles — Telegram-тема, mobile design
- [x] wave-animation — Siri-волна на Canvas
- [x] storage-module — localStorage
- [x] openai-module — gpt-4o-mini клиент
- [x] google-tts-module — Google Cloud TTS
- [x] voice-recorder — Web Speech API
- [x] chat-ui — рендер сообщений
- [x] settings-screen — экран настроек
- [x] app-init — инициализация, роутинг

---

## Деплой
Разместить `index.html` на любом статик-хостинге:
- GitHub Pages
- Cloudflare Pages
- Netlify Drop

Затем зарегистрировать Mini App в @BotFather → Bot Settings → Menu Button → URL.

## Примечания
- Браузерный `SpeechRecognition` работает в Chrome и Safari
- Ключи в `localStorage` — приемлемо для личного использования
- CORS для Google TTS и OpenAI работает напрямую из браузера

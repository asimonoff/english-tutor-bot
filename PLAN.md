# English Tutor Telegram Mini App — План имплементации

## Описание задачи
Telegram Mini App (один файл `index.html`) — репетитор английского языка «Карен».
Работает полностью на стороне клиента: без бэкенда, единственный API-ключ OpenAI вводится пользователем в UI.

---

## Файлы проекта

| Файл | Описание |
|------|----------|
| `index.html` | Всё приложение: HTML + CSS + JS |
| `proxy-worker.js` | Cloudflare Worker CORS-прокси (нужен для мобильного Telegram) |
| `PLAN.md` | Этот файл |

---

## Стек технологий

| Слой | Технология |
|------|-----------|
| Фронтенд | Vanilla HTML + CSS + JS (один файл) |
| LLM | OpenAI `gpt-4o-mini`, max_tokens: 300 |
| TTS (озвучка) | OpenAI `tts-1` — тот же API-ключ |
| STT (голосовой ввод) | Web Speech API `SpeechRecognition` — бесплатно, браузерный |
| Хранилище | `localStorage` — история 5 диалогов + настройки |
| Интеграция | Telegram Web App JS SDK |
| CORS-прокси | Cloudflare Worker (бесплатно) — нужен для мобильного WebView |

---

## Экран чата — компоненты

| Компонент | Описание |
|-----------|----------|
| Шапка | "Karen 👩‍🏫", кнопка настроек ⚙️ |
| Область сообщений | Скроллируемый список сообщений (user / bot) |
| Блок коррекции | Выделенный жёлтый блок `✏️ Correction` |
| Волна-анимация | 7 полос Canvas + AudioContext analyser (Siri-стиль) |
| Кнопка "Say" 🎤 | Push-to-talk: удержание = запись, отпустить = отправить |
| Текстовое поле | Альтернативный ввод + кнопка отправки |
| Кнопка 🔊 | На каждом сообщении бота — воспроизвести через TTS |

---

## Экран настроек — поля

| Поле | localStorage ключ | Описание |
|------|-------------------|----------|
| OpenAI API Key | `karen_openai_key` | Используется для чата и TTS |
| Proxy URL | `karen_proxy_url` | URL Cloudflare Worker (для мобильного) |
| Голос (select) | `karen_voice` | 6 голосов OpenAI TTS-1 + «Disabled» |

### Голоса OpenAI TTS-1
`nova` · `alloy` · `shimmer` · `echo` · `fable` · `onyx` · `disabled`

---

## Системный промпт (Karen)

```
Ты - профессиональный ИИ-репетитор английского языка. Твое имя Карен.
Твоя цель: помочь пользователю достичь уровня Fluent через живое общение.
Правила: дружелюбный стиль, коррекция ошибок в формате
"Correction: [текст] — [пояснение на русском]",
ответ не более 3 предложений + один открытый вопрос в конце.
```

---

## JS-модули (внутри `<script>`)

1. **Storage** — `getHistory()`, `saveMessage()`, `clearHistory()`, `getSetting()`, `setSetting()`
2. **WaveAnimation** — 7-полосная Canvas анимация, управляется AudioContext analyser
3. **OpenAIClient** — `sendMessage(text)` → `gpt-4o-mini`; поддерживает proxy URL
4. **OpenAITTS** — `speak(text, voice)` → `tts-1`; поддерживает proxy URL
5. **VoiceRecorder** — Web Speech API push-to-talk; `pendingCb` решает race condition с `onend`
6. **ChatUI** — рендер bubbles, парсинг `Correction:`-блока, typing indicator, автоскролл
7. **App** — Telegram SDK init, роутинг, сохранение настроек, проверка ключа при старте

---

## Исправленные баги

| Баг | Причина | Решение |
|-----|---------|---------|
| Голосовой ввод не отправлялся | Race condition: `recognition.onend` проверял `isRecording`, который уже был `false` | Сохраняем колбэк в `pendingCb`, вызываем в `onend` |
| Транскрипт не попадал в поле ввода | Колбэк вызывал `handleSend()` напрямую, минуя `textInput` | Теперь сначала пишем в `textInput.value`, потом отправляем |
| `Failed to fetch` на мобильном Telegram | iOS/Android WebView блокирует CORS preflight с `Authorization` | Cloudflare Worker CORS-прокси (`proxy-worker.js`) |

---

## Деплой

### 1. Статика (index.html)
```
GitHub Pages / Cloudflare Pages / Netlify Drop
```
Затем: @BotFather → Bot Settings → Menu Button → URL страницы.

### 2. CORS-прокси для мобильного (proxy-worker.js)
1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create
2. Вставить содержимое `proxy-worker.js` → Deploy
3. Скопировать URL воркера
4. В приложении: Settings ⚙️ → Proxy URL → вставить → Save

---

## Примечания
- `SpeechRecognition` работает в Chrome и Safari (десктоп и мобильный)
- API-ключ хранится только в `localStorage` браузера пользователя
- На десктопном Telegram прокси не нужен — CORS работает напрямую
- Прокси пересылает запросы только на `api.openai.com` — произвольные URL недоступны

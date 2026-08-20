# Verhöfisch Gesagt 🎩

Transform your everyday German into courtly, baroque, or poetic formal speech!

## 🌟 Features

- **3 Transformation Styles:**
  - 🎭 **Höfisches Barock** - Courtly baroque speech with elaborate formality
  - 📜 **Kaiserlicher Kanzleistil** - Imperial chancellery style (official documents)
  - 🌹 **Romantisch-Poetisch** - Romantic and poetic language

- **Multiple Interfaces:**
  - 🌐 Web Interface (`verhöfischgesagt.html`) - [Try it live!](https://htmlpreview.github.io/?https://github.com/z3uss3l/Verh-fischgesagt/blob/verhöfischgesagt.html)
  - 🔌 REST API with Express.js

- **Easy to Use:**
  - Simple URL parameters: `?text=Hallo&style=barock`
  - JSON POST requests for longer texts
  - CORS-enabled for cross-origin requests

## 📁 Project Structure

```
Verh-fischgesagt/
├── verhöfischgesagt.html      # Web interface
├── api/
│   └── server.js              # Express API server
├── package.json               # Dependencies
├── API_DOCUMENTATION.md       # Full API docs
└── README.md                  # This file
```

## 🚀 Quick Start

### Web Interface
Simply open `verhöfischgesagt.html` in your browser or [visit it live!](https://htmlpreview.github.io/?https://github.com/z3uss3l/Verh-fischgesagt/blob/main/verh%C3%B6fischgesagt.html)

### API Server

#### Installation
```bash
npm install
```

#### Start Server
```bash
npm start
```

The API runs on `http://localhost:3000`

#### Quick API Examples

**GET Request:**
```bash
curl "http://localhost:3000/transmute?text=Hallo%20wie%20geht%20es%20dir&style=barock"
```

**POST Request:**
```bash
curl -X POST http://localhost:3000/transmute \
  -H "Content-Type: application/json" \
  -d '{"text":"Danke dir","style":"barock"}'
```

**Get Available Styles:**
```bash
curl http://localhost:3000/styles
```

**Health Check:**
```bash
curl http://localhost:3000/health
```

## 📚 API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint documentation, examples, and error handling.

### Main Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | API documentation |
| `/transmute` | GET/POST | Transform text |
| `/styles` | GET | List available styles |
| `/health` | GET | Health check |

## 🎯 Usage Examples

### Example 1: Barock Style
**Input:** "Hallo, wie geht es dir?"

**Output:**
```
Seid gegrüßt, edler Herr / werte Dame!

Es gereicht Uns zur außerordentlichen Ergötzlichkeit, Euch kundzutun:

Seyed gegrüßet, wie stehet es um Euer wohlgeschätztes Befinden?

In tiefster Ergebenheit verbleibend,
```

### Example 2: Kanzlei Style
**Input:** "Ich habe eine Frage"

**Output:**
```
Kund und zu wissen sei hiermit jedermann:

In Sachen der nachfolgenden Angelegenheit wird ordnungsgemäß vermerkt:

Ich habe eine eingereichter Petition

Signatum und siegelbewährt unter kaiserlicher Verordnung.
```

### Example 3: Poetisch Style
**Input:** "Danke"

**Output:**
```
Wie ein Hauch von Gold verströmt diese Kunde:

Mein Herz neigt sich in Dankbarkeit

So verweht der Ruf durch den Garten der Zeit.
```

## 🔧 Development

### Run with Auto-Reload
```bash
npm run dev
```

This requires `nodemon` (included in devDependencies).

### Customize Styles

Edit the `dictionary` object in `api/server.js` to add or modify transformation rules:

```javascript
const dictionary = {
    mystyle: {
        prefix: "Your prefix here\n",
        suffix: "\n\nYour suffix here",
        replacements: [
            [/pattern/gi, "replacement"],
            // Add more replacements...
        ]
    }
};
```

## 📝 How It Works

1. **Text Input** - User provides ordinary German text
2. **Style Selection** - Choose one of 3 transformation styles
3. **Replacements** - Dictionary-based replacements are applied
4. **Formalization** - Informal "du" forms converted to formal "Ihr"
5. **Formatting** - Style-specific prefix and suffix added
6. **Output** - Formal, courtly text returned

## 🌐 Browser Compatibility

- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Mobile browsers ✅

## 🔌 API Features

- ✅ URL parameter support (`?text=...&style=...`)
- ✅ JSON POST body support
- ✅ CORS enabled
- ✅ Error handling with descriptive messages
- ✅ Health check endpoint
- ✅ Auto-documentation endpoint

## 📦 Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **nodemon** (dev) - Auto-reload during development

## 📄 License

MIT

## 👤 Author

z3uss3l

---

**Verhöfisch Gesagt** - *Making formal German accessible!* 🎩✨

# Verhoefisch API Documentation

Transform ordinary German text into formal, courtly speech styles via HTTP API.

## Setup

### Installation
```bash
npm install
```

### Running the Server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The API will be available at `http://localhost:3000`

---

## Endpoints

### 1. Root Documentation
**GET** `/`

Returns full API documentation and available endpoints.

**Example:**
```bash
curl http://localhost:3000/
```

**Response:**
```json
{
  "name": "Verhoefisch API",
  "description": "Transform text into formal German speech styles",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

---

### 2. Transform Text (GET)
**GET** `/transmute?text=<text>&style=<style>`

Transform text via URL parameters.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | ✓ | - | Text to transmute (URL encoded) |
| `style` | string | ✗ | `barock` | Transformation style: `barock`, `kanzlei`, or `poetisch` |

**Available Styles:**
- `barock` - Höfisches Barock (Courtly Baroque)
- `kanzlei` - Kaiserlicher Kanzleistil (Imperial Chancellery Style)
- `poetisch` - Romantisch-Poetisch (Romantic-Poetic)

**Examples:**

Barock style:
```bash
curl "http://localhost:3000/transmute?text=Hallo%20wie%20geht%20es%20dir&style=barock"
```

Kanzlei style:
```bash
curl "http://localhost:3000/transmute?text=Ich%20habe%20eine%20Frage&style=kanzlei"
```

Poetisch style:
```bash
curl "http://localhost:3000/transmute?text=Danke%20dir&style=poetisch"
```

**Response (Success):**
```json
{
  "success": true,
  "original": "Hallo wie geht es dir",
  "transmuted": "Seid gegrüßt, edler Herr / werte Dame!\n\nEs gereicht Uns zur außerordentlichen Ergötzlichkeit, Euch kundzutun:\n\nSeyed gegrüßet wie stehet es um Euer wohlgeschätztes Befinden\n\nIn tiefster Ergebenheit verbleibend,",
  "style": "barock"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Input text cannot be empty"
}
```

---

### 3. Transform Text (POST)
**POST** `/transmute`

Transform text via JSON body (recommended for longer texts).

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Your text here",
  "style": "barock"
}
```

**Examples:**

Using curl:
```bash
curl -X POST http://localhost:3000/transmute \
  -H "Content-Type: application/json" \
  -d '{"text":"Hallo wie geht es dir","style":"barock"}'
```

Using JavaScript fetch:
```javascript
fetch('http://localhost:3000/transmute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hallo wie geht es dir',
    style: 'barock'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

Using Python requests:
```python
import requests

response = requests.post('http://localhost:3000/transmute', json={
    'text': 'Hallo wie geht es dir',
    'style': 'barock'
})
print(response.json())
```

---

### 4. Get Available Styles
**GET** `/styles`

Returns metadata for all available transformation styles.

**Example:**
```bash
curl http://localhost:3000/styles
```

**Response:**
```json
{
  "success": true,
  "styles": [
    {
      "id": "barock",
      "name": "Höfisches Barock",
      "prefix": "Seid gegrüßt, edler Herr / werte Dame!..."
    },
    {
      "id": "kanzlei",
      "name": "Kaiserlicher Kanzleistil",
      "prefix": "Kund und zu wissen sei hiermit jedermann:..."
    },
    {
      "id": "poetisch",
      "name": "Romantisch-Poetisch",
      "prefix": "Wie ein Hauch von Gold verströmt diese Kunde:..."
    }
  ]
}
```

---

### 5. Health Check
**GET** `/health`

Check if the API is running.

**Example:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "success": true,
  "message": "Verhoefisch API is running",
  "version": "1.0.0"
}
```

---

## Usage Examples

### Example 1: Simple GET Request
```bash
curl "http://localhost:3000/transmute?text=Danke%20dir&style=barock"
```

### Example 2: POST with Complex Text
```bash
curl -X POST http://localhost:3000/transmute \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Ich habe eine Frage zu einem Problem. Kannst du mir schnell helfen? Danke!",
    "style": "kanzlei"
  }'
```

### Example 3: Frontend Integration (HTML/JavaScript)
```html
<form id="transmute-form">
  <input type="text" id="text-input" placeholder="Enter text" />
  <select id="style-select">
    <option value="barock">Barock</option>
    <option value="kanzlei">Kanzlei</option>
    <option value="poetisch">Poetisch</option>
  </select>
  <button type="submit">Transmute</button>
</form>

<div id="result"></div>

<script>
document.getElementById('transmute-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = document.getElementById('text-input').value;
  const style = document.getElementById('style-select').value;
  
  const response = await fetch('http://localhost:3000/transmute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, style })
  });
  
  const data = await response.json();
  document.getElementById('result').innerText = data.transmuted;
});
</script>
```

---

## Error Handling

### Missing Required Parameter
```json
{
  "success": false,
  "error": "Missing required parameter: text",
  "example": "/transmute?text=Hallo%20wie%20geht%20es%20dir&style=barock"
}
```

### Invalid Style
```json
{
  "success": false,
  "error": "Invalid style. Available styles: barock, kanzlei, poetisch"
}
```

### Empty Input
```json
{
  "success": false,
  "error": "Input text cannot be empty"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Endpoint not found",
  "availableEndpoints": ["/", "/health", "/styles", "/transmute"]
}
```

---

## CORS Support

The API has CORS enabled by default, allowing requests from any origin. To restrict this, modify the server.js:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

---

## Environment Variables

```bash
# Port (default: 3000)
PORT=3000
```

Run with custom port:
```bash
PORT=8080 npm start
```

---

## Transformation Rules

### Text Replacements Applied
The API applies predefined replacements based on the selected style:

**Barock:**
- "hallo/hi/guten tag" → "Seyed gegrüßet"
- "wie geht es dir/wie gehts" → "wie stehet es um Euer wohlgeschätztes Befinden"
- "danke" → "Wir erweisen Euch Unseren verbindlichsten Dank"
- And more...

**Kanzlei:**
- "hallo/guten tag" → "Zu wissen sei"
- "frage" → "eingereichter Petition"
- "problem" → "unvorhergesehene Hemmnis"
- And more...

**Poetisch:**
- "hallo" → "Sei uns willkommen wie der Lenz"
- "danke" → "Mein Herz neigt sich in Dankbarkeit"
- "nacht" → "samtene Schattenstunde"
- And more...

### Address Form Conversion
All instances of informal "du" forms are converted to formal "Ihr" forms:
- "du" → "Ihr"
- "dir" → "Euch"
- "dein" → "Euer"
- "deine" → "Eure"
- "deinen" → "Euren"

---

## License

MIT

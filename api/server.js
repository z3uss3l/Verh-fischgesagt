const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dictionary for transformations
const dictionary = {
    barock: {
        prefix: "Seid gegrüßt, edler Herr / werte Dame!\n\nEs gereicht Uns zur außerordentlichen Ergötzlichkeit, Euch kundzutun:\n",
        suffix: "\n\nIn tiefster Ergebenheit verbleibend,",
        replacements: [
            [/hallo|hi|guten tag/gi, "Seyed gegrüßet"],
            [/wie geht es dir|wie gehts/gi, "wie stehet es um Euer wohlgeschätztes Befinden"],
            [/ich habe eine frage/gi, "ein dringlich Begehren drängt an Unser Ohr"],
            [/danke/gi, "Wir erweisen Euch Unseren verbindlichsten Dank"],
            [/ja/gi, "Wohlan, so sei es"],
            [/nein/gi, "Behüte uns Gott vor solchem Tuen"],
            [/tschüss|ciao|auf wiedersehen/gi, "Gott befehle Euch in seine gnädige Obhut"],
            [/geld/gi, "Güter und Dukaten"],
            [/arbeiten|arbeite/gi, "dem schaffenden Tagewerk nachgehen"],
            [/heute/gi, "am heutigen Tage des Herrn"],
            [/schnell/gi, "ohne Verzug und mit größter Eile"],
            [/problem/gi, "Mißhelligkeit"]
        ]
    },
    kanzlei: {
        prefix: "Kund und zu wissen sei hiermit jedermann:\n\nIn Sachen der nachfolgenden Angelegenheit wird ordnungsgemäß vermerkt:\n",
        suffix: "\n\nSignatum und siegelbewährt unter kaiserlicher Verordnung.",
        replacements: [
            [/hallo|guten tag/gi, "Zu wissen sei"],
            [/frage/gi, "eingereichter Petition"],
            [/danke/gi, "in getreuer Anerkenntnis"],
            [/geld/gi, "Münzbestand"],
            [/schnell/gi, "unverzüglich"],
            [/problem/gi, "unvorhergesehene Hemmnis"]
        ]
    },
    poetisch: {
        prefix: "Wie ein Hauch von Gold verströmt diese Kunde:\n\n",
        suffix: "\n\nSo verweht der Ruf durch den Garten der Zeit.",
        replacements: [
            [/hallo/gi, "Sei uns willkommen wie der Lenz"],
            [/danke/gi, "Mein Herz neigt sich in Dankbarkeit"],
            [/nacht/gi, "samtene Schattenstunde"],
            [/sonne/gi, "das goldene Tagesgestirn"]
        ]
    }
};

// Function to process text
function transmuteText(input, style = 'barock') {
    // Validate style
    if (!dictionary[style]) {
        return {
            success: false,
            error: `Invalid style. Available styles: ${Object.keys(dictionary).join(', ')}`
        };
    }

    // Validate input
    if (!input || !input.trim()) {
        return {
            success: false,
            error: "Input text cannot be empty"
        };
    }

    const config = dictionary[style];
    let result = input;

    // Apply replacements
    config.replacements.forEach(([pattern, replacement]) => {
        result = result.replace(pattern, replacement);
    });

    // Adjust "du/dir/dein" to formal "Ihr/Euch/Euer"
    result = result.replace(/\bdu\b/gi, "Ihr");
    result = result.replace(/\bdir\b/gi, "Euch");
    result = result.replace(/\bdein\b/gi, "Euer");
    result = result.replace(/\bdeine\b/gi, "Eure");
    result = result.replace(/\bdeinen\b/gi, "Euren");

    return {
        success: true,
        original: input,
        transmuted: config.prefix + result + config.suffix,
        style: style
    };
}

// Routes

/**
 * GET /transmute
 * Query parameters:
 *   - text (required): The text to transmute
 *   - style (optional): barock, kanzlei, or poetisch (default: barock)
 * 
 * Example: /transmute?text=Hallo%20wie%20geht%20es%20dir&style=barock
 */
app.get('/transmute', (req, res) => {
    const { text, style = 'barock' } = req.query;

    if (!text) {
        return res.status(400).json({
            success: false,
            error: "Missing required parameter: text",
            example: "/transmute?text=Hallo%20wie%20geht%20es%20dir&style=barock"
        });
    }

    const result = transmuteText(decodeURIComponent(text), style);
    return res.json(result);
});

/**
 * POST /transmute
 * JSON body:
 *   - text (required): The text to transmute
 *   - style (optional): barock, kanzlei, or poetisch (default: barock)
 * 
 * Example: {"text": "Hallo wie geht es dir", "style": "barock"}
 */
app.post('/transmute', (req, res) => {
    const { text, style = 'barock' } = req.body;

    if (!text) {
        return res.status(400).json({
            success: false,
            error: "Missing required field: text"
        });
    }

    const result = transmuteText(text, style);
    return res.json(result);
});

/**
 * GET /styles
 * Returns available transformation styles
 */
app.get('/styles', (req, res) => {
    const styles = Object.keys(dictionary).map(key => ({
        id: key,
        name: {
            barock: "Höfisches Barock",
            kanzlei: "Kaiserlicher Kanzleistil",
            poetisch: "Romantisch-Poetisch"
        }[key],
        prefix: dictionary[key].prefix.substring(0, 100) + "..."
    }));

    res.json({
        success: true,
        styles: styles
    });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: "Verhoefisch API is running",
        version: "1.0.0"
    });
});

/**
 * GET /
 * API documentation
 */
app.get('/', (req, res) => {
    res.json({
        name: "Verhoefisch API",
        description: "Transform text into formal German speech styles",
        version: "1.0.0",
        endpoints: {
            transmute_get: {
                method: "GET",
                path: "/transmute",
                description: "Transform text via URL parameters",
                parameters: {
                    text: {
                        type: "string",
                        required: true,
                        description: "The text to transmute (URL encoded)"
                    },
                    style: {
                        type: "string",
                        required: false,
                        default: "barock",
                        description: "Style: barock, kanzlei, or poetisch"
                    }
                },
                example: "/transmute?text=Hallo%20wie%20geht%20es%20dir&style=barock"
            },
            transmute_post: {
                method: "POST",
                path: "/transmute",
                description: "Transform text via JSON body",
                body: {
                    text: {
                        type: "string",
                        required: true
                    },
                    style: {
                        type: "string",
                        required: false,
                        default: "barock"
                    }
                },
                example: {
                    text: "Hallo wie geht es dir",
                    style: "barock"
                }
            },
            styles: {
                method: "GET",
                path: "/styles",
                description: "Get all available transformation styles"
            },
            health: {
                method: "GET",
                path: "/health",
                description: "Health check endpoint"
            }
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: "Internal server error",
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found",
        availableEndpoints: ["/", "/health", "/styles", "/transmute"]
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Verhoefisch API running on port ${PORT}`);
    console.log(`Documentation available at http://localhost:${PORT}/`);
});

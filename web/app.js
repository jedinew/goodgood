const LANGUAGES = {
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ru': 'Русский',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어',
    'ar': 'العربية',
    'hi': 'हिन्दी',
    'bn': 'বাংলা',
    'vi': 'Tiếng Việt',
    'th': 'ไทย',
    'tr': 'Türkçe',
    'nl': 'Nederlands',
    'sv': 'Svenska',
    'id': 'Bahasa Indonesia',
    'pl': 'Polski'
};

const state = {
    date: null,
    data: null,
    lang: 'en'
};

function init() {
    // 1. Determine language
    const storedLang = localStorage.getItem('goodgood_lang');
    if (storedLang && LANGUAGES[storedLang]) {
        state.lang = storedLang;
    } else {
        // Try browser languages
        const browserLangs = navigator.languages || [navigator.language];
        for (const lang of browserLangs) {
            const code = lang.split('-')[0]; // en-US -> en
            if (LANGUAGES[code]) {
                state.lang = code;
                break;
            }
        }
    }

    // 2. Setup UI
    setupLanguageSelector();
    
    // 3. Load Data
    loadLatest();
}

function setupLanguageSelector() {
    const select = document.getElementById('lang-select');
    Object.entries(LANGUAGES).forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        if (code === state.lang) option.selected = true;
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        state.lang = e.target.value;
        localStorage.setItem('goodgood_lang', state.lang);
        render();
    });
}

async function loadLatest() {
    try {
        const res = await fetch('/data/latest.json');
        if (!res.ok) throw new Error('Failed to load latest');
        const latest = await res.json();
        loadDate(latest.date);
    } catch (err) {
        console.error(err);
        document.getElementById('message').textContent = 'Something went wrong loading today\'s good vibes.';
    }
}

async function loadDate(date) {
    try {
        const res = await fetch(`/data/daily/${date}.json`);
        if (!res.ok) throw new Error('Failed to load daily data');
        const data = await res.json();
        state.data = data;
        state.date = date;
        render();
    } catch (err) {
        console.error(err);
        document.getElementById('message').textContent = 'Could not load message for this date.';
    }
}

function render() {
    if (!state.data) return;

    const { translations, theme, date } = state.data;
    
    // Message
    const message = translations[state.lang] || translations['en'];
    document.getElementById('message').textContent = message;

    // Date
    document.getElementById('date-display').textContent = date;

    // Theme
    const root = document.documentElement;
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--fg-color', theme.fg);
    root.style.setProperty('--accent-color', theme.accent);
    
    // Update select color to match theme
    document.getElementById('lang-select').style.borderColor = theme.accent;
    document.getElementById('lang-select').style.color = theme.fg;
}

document.addEventListener('DOMContentLoaded', init);

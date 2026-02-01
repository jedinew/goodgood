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
    lang: 'en',
    dates: [] // List of available dates
};

async function init() {
    // 1. Determine language
    const storedLang = localStorage.getItem('goodgood_lang');
    if (storedLang && LANGUAGES[storedLang]) {
        state.lang = storedLang;
    } else {
        const browserLangs = navigator.languages || [navigator.language];
        for (const lang of browserLangs) {
            const code = lang.split('-')[0];
            if (LANGUAGES[code]) {
                state.lang = code;
                break;
            }
        }
    }

    // 2. Setup UI
    setupLanguageSelector();
    setupNavigation();
    
    // 3. Load Data Index
    await loadIndex();

    // 4. Load Content
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');

    if (dateParam && state.dates.includes(dateParam)) {
        loadDate(dateParam);
    } else {
        loadLatest();
    }
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

function setupNavigation() {
    document.getElementById('btn-prev').addEventListener('click', () => navigate(-1));
    document.getElementById('btn-next').addEventListener('click', () => navigate(1));
    document.getElementById('btn-today').addEventListener('click', () => {
        window.history.pushState({}, '', '/');
        loadLatest();
    });
}

async function loadIndex() {
    try {
        const res = await fetch('/data/index.json');
        if (res.ok) {
            const index = await res.json();
            state.dates = index.dates || [];
        }
    } catch (err) {
        console.error('Failed to load index', err);
    }
}

async function loadLatest() {
    try {
        const res = await fetch('/data/latest.json');
        if (!res.ok) throw new Error('Failed to load latest');
        const latest = await res.json();
        loadDate(latest.date);
    } catch (err) {
        console.error(err);
        document.getElementById('message').textContent = 'No good vibes yet. Check back later!';
        updateControls();
    }
}

async function loadDate(date) {
    try {
        const res = await fetch(`/data/daily/${date}.json`);
        if (!res.ok) throw new Error('Failed to load daily data');
        const data = await res.json();
        state.data = data;
        state.date = date;
        
        // Update URL if not already there
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('date') !== date) {
            const newUrl = date === state.dates[state.dates.length - 1] ? '/' : `/?date=${date}`;
            // If it's the absolute latest, maybe keep clean URL? But logic above says latest.json check.
            // Let's just set query param if we are not at root or if we explicitly navigated.
             window.history.pushState({}, '', `/?date=${date}`);
        }

        render();
        updateControls();
    } catch (err) {
        console.error(err);
        document.getElementById('message').textContent = 'Could not load message for this date.';
    }
}

function navigate(offset) {
    if (!state.date || state.dates.length === 0) return;
    
    const currentIndex = state.dates.indexOf(state.date);
    if (currentIndex === -1) return;

    const newIndex = currentIndex + offset;
    if (newIndex >= 0 && newIndex < state.dates.length) {
        loadDate(state.dates[newIndex]);
    }
}

function updateControls() {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    
    if (!state.date || state.dates.length === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    const currentIndex = state.dates.indexOf(state.date);
    
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex === -1 || currentIndex >= state.dates.length - 1;
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
    const select = document.getElementById('lang-select');
    select.style.borderColor = theme.accent;
    select.style.color = theme.fg;
    
    const btns = document.querySelectorAll('button');
    btns.forEach(btn => {
        btn.style.borderColor = theme.accent;
        btn.style.color = theme.fg;
    });
}

document.addEventListener('DOMContentLoaded', init);

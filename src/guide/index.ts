import { applyI18n, openExtensionSettings } from '../shared/utils/i18n';
import { loadSettings, saveSettings } from '../shared/utils/storage';
import { Appearance, normalizeSettings } from '../shared/types/settings';

// The guide uses the extension's Appearance setting, so one choice covers
// the code viewer, the popup and this page. A copy is kept in localStorage
// only to paint the right colors before the stored setting has loaded.
const CACHE_KEY = 'codeFormatterGuideTheme';

function cachedAppearance(): Appearance {
    try {
        const saved = localStorage.getItem(CACHE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
    } catch {
        // storage unavailable: fall back to auto
    }
    return 'auto';
}

function applyTheme(choice: Appearance): void {
    const root = document.documentElement;
    // auto: no attribute, the CSS follows prefers-color-scheme
    if (choice === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);

    document.querySelectorAll<HTMLElement>('[data-theme-choice]').forEach((btn) => {
        btn.setAttribute('aria-checked', String(btn.dataset.themeChoice === choice));
    });
    try { localStorage.setItem(CACHE_KEY, choice); } catch { /* ignore */ }
}

// Runs from <head>: set the theme before the first paint (no light/dark flash)
applyTheme(cachedAppearance());

async function setupThemeSwitch(): Promise<void> {
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-theme-choice]'));
    buttons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const choice = btn.dataset.themeChoice as Appearance;
            applyTheme(choice);
            saveSettings({ appearance: choice });
        });
        // Arrow keys move between options, like a native radio group
        btn.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            const next = buttons[(index + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
            next.focus();
            next.click();
        });
    });

    applyTheme(cachedAppearance());
    applyTheme((await loadSettings()).appearance);

    // Changed from the popup or a code tab while this page is open
    try {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== 'sync' || !changes.codeFormatterSettings) return;
            applyTheme(normalizeSettings(changes.codeFormatterSettings.newValue).appearance);
        });
    } catch {
        // extension context gone: the page keeps its current colors
    }
}

function playDemo(): void {
    const demo = document.getElementById('demo');
    if (!demo) return;
    demo.classList.remove('is-formatted');
    // Force a reflow so the animation restarts
    void demo.offsetWidth;
    setTimeout(() => demo.classList.add('is-formatted'), 700);
}

async function renderFileAccess(): Promise<void> {
    const section = document.getElementById('file-access');
    if (!section) return;

    const allowed = await chrome.extension.isAllowedFileSchemeAccess();
    section.classList.remove('files--unknown', 'files--on', 'files--off');
    section.classList.add(allowed ? 'files--on' : 'files--off');
}

document.addEventListener('DOMContentLoaded', () => {
    applyI18n();
    document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
        const message = chrome.i18n?.getMessage(el.dataset.i18nAria || '');
        if (!message) return;
        el.setAttribute('aria-label', message);
        el.title = message;
    });

    setupThemeSwitch();

    document.getElementById('file-access-button')?.addEventListener('click', openExtensionSettings);
    renderFileAccess();
    // The user may flip the switch in another tab and come back
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') renderFileAccess();
    });

    document.getElementById('demo-replay')?.addEventListener('click', playDemo);
    playDemo();
});

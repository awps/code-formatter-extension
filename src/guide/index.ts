import { applyI18n, openExtensionSettings } from '../shared/utils/i18n';

type ThemeChoice = 'auto' | 'light' | 'dark';
const THEME_KEY = 'codeFormatterGuideTheme';

function readTheme(): ThemeChoice {
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
    } catch {
        // storage unavailable: fall back to auto
    }
    return 'auto';
}

function applyTheme(choice: ThemeChoice): void {
    const root = document.documentElement;
    if (choice === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);

    document.querySelectorAll<HTMLElement>('[data-theme-choice]').forEach((btn) => {
        btn.setAttribute('aria-checked', String(btn.dataset.themeChoice === choice));
    });
}

// Runs from <head>: set the theme before the first paint (no light/dark flash)
applyTheme(readTheme());

function setupThemeSwitch(): void {
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-theme-choice]'));
    buttons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const choice = btn.dataset.themeChoice as ThemeChoice;
            try { localStorage.setItem(THEME_KEY, choice); } catch { /* ignore */ }
            applyTheme(choice);
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
    applyTheme(readTheme());
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
        if (message) el.setAttribute('aria-label', message);
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

import { loadSettings, saveSettings } from '../shared/utils/storage';
import { themeLabels, themeKeys } from '../shared/utils/themes';
import { Appearance, Settings, ThemeKey, themeTone, normalizeSettings } from '../shared/types/settings';
import { currentTone, watchDeviceTone } from '../shared/utils/appearance';
import { applyI18n, openExtensionSettings } from '../shared/utils/i18n';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

let settings: Settings;

function fillThemeSelect(select: HTMLSelectElement | null, tone: 'light' | 'dark'): void {
    if (!select) return;
    themeKeys.filter(key => themeTone(key) === tone).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = themeLabels[key];
        select.appendChild(option);
    });
}

function setToggle(toggle: HTMLElement | null, on: boolean): void {
    if (!toggle) return;
    toggle.classList.toggle('popup__toggle--on', on);
    toggle.setAttribute('aria-checked', String(on));
}

/** The popup follows the same light/dark choice as the viewer. */
function applyTone(): void {
    document.documentElement.dataset.theme = currentTone(settings);
}

function render(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-appearance]').forEach(btn => {
        btn.setAttribute('aria-checked', String(btn.dataset.appearance === settings.appearance));
    });
    const light = $<HTMLSelectElement>('light-theme');
    const dark = $<HTMLSelectElement>('dark-theme');
    if (light) light.value = settings.lightTheme;
    if (dark) dark.value = settings.darkTheme;
    setToggle($('line-numbers-toggle'), settings.lineNumbers);
    setToggle($('word-wrap-toggle'), settings.wordWrap);
    applyTone();
}

async function update(changes: Partial<Settings>): Promise<void> {
    settings = normalizeSettings({ ...settings, ...changes });
    render();
    await saveSettings(changes);
}

function bindToggle(id: string, key: 'lineNumbers' | 'wordWrap'): void {
    const toggle = $(id);
    if (!toggle) return;
    const flip = () => update({ [key]: !settings[key] });
    toggle.addEventListener('click', flip);
    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            flip();
        }
    });
}

async function showFileAccessNotice(): Promise<void> {
    const notice = $('file-access-notice');
    if (!notice) return;
    notice.hidden = await chrome.extension.isAllowedFileSchemeAccess();
    $('file-access-button')?.addEventListener('click', openExtensionSettings);
}

document.addEventListener('DOMContentLoaded', async () => {
    fillThemeSelect($('light-theme'), 'light');
    fillThemeSelect($('dark-theme'), 'dark');
    applyI18n();

    const version = $('version');
    if (version) version.textContent = chrome.runtime.getManifest().version;

    settings = await loadSettings();
    render();
    showFileAccessNotice();

    document.querySelectorAll<HTMLButtonElement>('[data-appearance]').forEach(btn => {
        btn.addEventListener('click', () => update({ appearance: btn.dataset.appearance as Appearance }));
    });
    $<HTMLSelectElement>('light-theme')?.addEventListener('change', e => update({ lightTheme: (e.target as HTMLSelectElement).value as ThemeKey }));
    $<HTMLSelectElement>('dark-theme')?.addEventListener('change', e => update({ darkTheme: (e.target as HTMLSelectElement).value as ThemeKey }));
    bindToggle('line-numbers-toggle', 'lineNumbers');
    bindToggle('word-wrap-toggle', 'wordWrap');

    watchDeviceTone(applyTone);
});

import { Settings, defaultSettings } from '../types/settings';

const STORAGE_KEY = 'codeFormatterSettings';

export async function loadSettings(): Promise<Settings> {
    // Check if chrome.storage is available
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        return defaultSettings;
    }

    return new Promise((resolve) => {
        chrome.storage.sync.get(STORAGE_KEY, (result) => {
            if (chrome.runtime.lastError) {
                console.warn('[Code Formatter] Storage error:', chrome.runtime.lastError);
                resolve(defaultSettings);
                return;
            }
            if (result[STORAGE_KEY]) {
                resolve({ ...defaultSettings, ...result[STORAGE_KEY] });
            } else {
                resolve(defaultSettings);
            }
        });
    });
}

export async function saveSettings(settings: Partial<Settings>): Promise<Settings> {
    const current = await loadSettings();
    const updated = { ...current, ...settings };

    // Check if chrome.storage is available
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        return updated;
    }

    return new Promise((resolve) => {
        chrome.storage.sync.set({ [STORAGE_KEY]: updated }, () => {
            if (chrome.runtime.lastError) {
                console.warn('[Code Formatter] Storage save error:', chrome.runtime.lastError);
            }
            resolve(updated);
        });
    });
}
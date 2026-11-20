import { Settings, defaultSettings } from '../types/settings';

const STORAGE_KEY = 'codeFormatterSettings';

export async function loadSettings(): Promise<Settings> {
    // Check if chrome.storage is available
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        return defaultSettings;
    }

    return new Promise((resolve) => {
        // After the extension is reloaded or updated, tabs formatted by the old
        // version lose access to chrome.* and calls throw "Extension context
        // invalidated". Fall back to defaults instead of an uncaught error.
        try {
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
        } catch {
            resolve(defaultSettings);
        }
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
        try {
            chrome.storage.sync.set({ [STORAGE_KEY]: updated }, () => {
                if (chrome.runtime.lastError) {
                    console.warn('[Code Formatter] Storage save error:', chrome.runtime.lastError);
                }
                resolve(updated);
            });
        } catch {
            // Extension context invalidated (see loadSettings): keep the change for this tab only
            resolve(updated);
        }
    });
}
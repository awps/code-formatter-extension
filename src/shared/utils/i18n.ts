/**
 * Replaces the text of every [data-i18n] element with its translation.
 * The English text in the HTML stays as fallback when a key is missing.
 */
export function applyI18n(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        const message = key && chrome.i18n ? chrome.i18n.getMessage(key) : '';
        if (message) el.textContent = message;
    });
}

/**
 * Opens this extension's page in chrome://extensions, where
 * "Allow access to file URLs" can be switched on.
 */
export function openExtensionSettings(): void {
    chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
}

import { Settings, ThemeKey } from '../../shared/types/settings';
import { themeLabels, themeKeys } from '../../shared/utils/themes';

export interface ToolbarConfig {
    logo: string;
    i18n: {
        extShortName: string;
        copy: string;
        download: string;
        showOriginal: string;
        showFormatted: string;
        theme: string;
        view: string;
        lineNumbers: string;
        wordWrap: string;
    };
    settings: Settings;
}

/**
 * Generates HTML for theme dropdown items.
 */
export function generateThemeItemsHtml(currentTheme: ThemeKey): string {
    return themeKeys.map(key => {
        const isSelected = key === currentTheme;
        const selectedClass = isSelected ? ' code-formatter-toolbar__dropdown-item--selected' : '';
        const checkMark = isSelected ? '●' : '○';
        return `<div class="code-formatter-toolbar__dropdown-item${selectedClass}" data-theme="${key}">
            <span class="code-formatter-toolbar__dropdown-check">${checkMark}</span> ${themeLabels[key]}
        </div>`;
    }).join('');
}

/**
 * Generates HTML for view dropdown items.
 */
export function generateViewItemsHtml(settings: Settings, i18n: { lineNumbers: string; wordWrap: string }): string {
    const lineNumbersChecked = settings.lineNumbers;
    const wordWrapChecked = settings.wordWrap;

    return `
        <div class="code-formatter-toolbar__dropdown-item${lineNumbersChecked ? ' code-formatter-toolbar__dropdown-item--checked' : ''}" data-setting="lineNumbers">
            <span class="code-formatter-toolbar__dropdown-check">${lineNumbersChecked ? '☑' : '☐'}</span> ${i18n.lineNumbers}
        </div>
        <div class="code-formatter-toolbar__dropdown-item${wordWrapChecked ? ' code-formatter-toolbar__dropdown-item--checked' : ''}" data-setting="wordWrap">
            <span class="code-formatter-toolbar__dropdown-check">${wordWrapChecked ? '☑' : '☐'}</span> ${i18n.wordWrap}
        </div>
    `;
}

/**
 * Generates the complete toolbar HTML.
 */
export function generateToolbarHtml(config: ToolbarConfig): string {
    const { logo, i18n, settings } = config;
    const themeItemsHtml = generateThemeItemsHtml(settings.theme);
    const viewItemsHtml = generateViewItemsHtml(settings, i18n);

    return `<div class="code-formatter-toolbar">
        <div class="code-formatter-toolbar__logo">
            ${logo}
        </div>
        <div class="code-formatter-toolbar__logo-text"><a href="https://zerowp.com/code-formatter/" target="_blank">${i18n.extShortName}</a></div>

        <!-- Theme Dropdown -->
        <div class="code-formatter-toolbar__dropdown">
            <button class="code-formatter-toolbar__dropdown-trigger" id="theme-dropdown-trigger">
                ${i18n.theme} ▼
            </button>
            <div class="code-formatter-toolbar__dropdown-menu" id="theme-dropdown-menu">
                ${themeItemsHtml}
            </div>
        </div>

        <!-- View Dropdown -->
        <div class="code-formatter-toolbar__dropdown">
            <button class="code-formatter-toolbar__dropdown-trigger" id="view-dropdown-trigger">
                ${i18n.view} ▼
            </button>
            <div class="code-formatter-toolbar__dropdown-menu" id="view-dropdown-menu">
                ${viewItemsHtml}
            </div>
        </div>

        <div class="code-formatter-toolbar__spacer"></div>
        <div><button class="code-formatter-toolbar__button code-formatter-toolbar__button__switch" id="code-formatter-switcher-button">${i18n.showOriginal}</button></div>
        <div><button class="code-formatter-toolbar__button code-formatter-toolbar__button__copy" id="code-formatter-toolbar-button-copy">${i18n.copy}</button></div>
        <div><button class="code-formatter-toolbar__button code-formatter-toolbar__button__download" id="code-formatter-toolbar-button-download">${i18n.download}</button></div>
    </div>`;
}

/**
 * Inserts the toolbar into the document body.
 */
export function insertToolbar(config: ToolbarConfig): void {
    const html = generateToolbarHtml(config);
    document.body.insertAdjacentHTML('beforeend', html);
}

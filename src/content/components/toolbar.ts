import { Settings, ThemeKey } from '../../shared/types/settings';
import { themeLabels, themeKeys } from '../../shared/utils/themes';

export interface ToolbarConfig {
    logo: string;
    /** Display name of the detected language, e.g. "JSON" */
    languageLabel?: string;
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
        viewFormatted?: string;
        viewOriginal?: string;
        settings?: string;
        settingsHint?: string;
    };
    settings: Settings;
}

const ICONS = {
    copy: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    download: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M4.5 6.8 8 10.3l3.5-3.5M2.5 13.5h11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    settings: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4.5h7M12.5 4.5H14M2 11.5h2.5M8 11.5h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="10.75" cy="4.5" r="1.75" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="6.25" cy="11.5" r="1.75" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
};

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
        <div class="code-formatter-toolbar__dropdown-item code-formatter-toolbar__dropdown-item--toggle${lineNumbersChecked ? ' code-formatter-toolbar__dropdown-item--checked' : ''}" data-setting="lineNumbers">
            <span class="code-formatter-toolbar__dropdown-label">${i18n.lineNumbers}</span>
            <span class="code-formatter-toolbar__toggle${lineNumbersChecked ? ' code-formatter-toolbar__toggle--on' : ''}">
                <span class="code-formatter-toolbar__toggle-track"></span>
                <span class="code-formatter-toolbar__toggle-thumb"></span>
            </span>
        </div>
        <div class="code-formatter-toolbar__dropdown-item code-formatter-toolbar__dropdown-item--toggle${wordWrapChecked ? ' code-formatter-toolbar__dropdown-item--checked' : ''}" data-setting="wordWrap">
            <span class="code-formatter-toolbar__dropdown-label">${i18n.wordWrap}</span>
            <span class="code-formatter-toolbar__toggle${wordWrapChecked ? ' code-formatter-toolbar__toggle--on' : ''}">
                <span class="code-formatter-toolbar__toggle-track"></span>
                <span class="code-formatter-toolbar__toggle-thumb"></span>
            </span>
        </div>
    `;
}

/**
 * Generates the complete toolbar HTML.
 *
 * Layout: brand + language | view switch | copy, download, settings menu.
 * Code-level actions (collapse/expand, JSON path) live in the bottom status bar.
 */
export function generateToolbarHtml(config: ToolbarConfig): string {
    const { logo, i18n, settings, languageLabel } = config;
    const themeItemsHtml = generateThemeItemsHtml(settings.theme);
    const viewItemsHtml = generateViewItemsHtml(settings, i18n);
    const formattedLabel = i18n.viewFormatted ?? 'Formatted';
    const originalLabel = i18n.viewOriginal ?? 'Original';
    const settingsLabel = i18n.settings ?? 'Settings';

    return `<div class="code-formatter-toolbar">
        <div class="code-formatter-toolbar__brand">
            <div class="code-formatter-toolbar__logo">${logo}</div>
            <div class="code-formatter-toolbar__logo-text"><a href="https://zerowp.com/code-formatter/" target="_blank">${i18n.extShortName}</a></div>
            ${languageLabel ? `<span class="code-formatter-toolbar__lang">${languageLabel}</span>` : ''}
        </div>

        <div class="code-formatter-toolbar__spacer"></div>

        <div class="code-formatter-toolbar__segmented" role="radiogroup" aria-label="${i18n.view}">
            <button type="button" role="radio" aria-checked="true" class="code-formatter-toolbar__segment code-formatter-toolbar__segment--active" data-view="formatted">${formattedLabel}</button>
            <button type="button" role="radio" aria-checked="false" class="code-formatter-toolbar__segment" data-view="original">${originalLabel}</button>
        </div>

        <div class="code-formatter-toolbar__actions">
            <button type="button" class="code-formatter-toolbar__button" id="code-formatter-toolbar-button-copy" title="${i18n.copy}">${ICONS.copy}<span class="code-formatter-toolbar__label">${i18n.copy}</span></button>
            <button type="button" class="code-formatter-toolbar__button" id="code-formatter-toolbar-button-download" title="${i18n.download}">${ICONS.download}<span class="code-formatter-toolbar__label">${i18n.download}</span></button>

            <div class="code-formatter-toolbar__dropdown">
                <button type="button" class="code-formatter-toolbar__dropdown-trigger code-formatter-toolbar__dropdown-trigger--icon" id="settings-dropdown-trigger" aria-label="${settingsLabel}">${ICONS.settings}<span class="cf-tip cf-tip--below" aria-hidden="true"><strong>${settingsLabel}</strong><span>${i18n.settingsHint ?? `${i18n.theme}, ${i18n.lineNumbers}, ${i18n.wordWrap}`}</span></span></button>
                <div class="code-formatter-toolbar__dropdown-menu code-formatter-toolbar__dropdown-menu--settings" id="settings-dropdown-menu">
                    <div class="code-formatter-toolbar__menu-heading">${i18n.view}</div>
                    <div id="view-dropdown-menu">${viewItemsHtml}</div>
                    <div class="code-formatter-toolbar__menu-heading">${i18n.theme}</div>
                    <div class="code-formatter-toolbar__menu-themes" id="theme-dropdown-menu">${themeItemsHtml}</div>
                </div>
            </div>
        </div>
    </div>`;
}

/**
 * Inserts the toolbar into the document body.
 */
export function insertToolbar(config: ToolbarConfig): void {
    const html = generateToolbarHtml(config);
    document.body.insertAdjacentHTML('beforeend', html);
}

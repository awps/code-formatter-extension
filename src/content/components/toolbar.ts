import { Appearance, Settings, ThemeKey, themeTone } from '../../shared/types/settings';
import { themeLabels, themeKeys } from '../../shared/utils/themes';

export interface ToolbarConfig {
    logo: string;
    /** Display name of the detected language, e.g. "JSON" */
    languageLabel?: string;
    /** Extension version, shown in the About popover */
    version?: string;
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
        appearance?: string;
        appearanceAuto?: string;
        appearanceLight?: string;
        appearanceDark?: string;
        lightTheme?: string;
        darkTheme?: string;
        about?: string;
        aboutText?: string;
        overview?: string;
        documentation?: string;
        keyboardShortcuts?: string;
        reportProblem?: string;
    };
    settings: Settings;
}

const SITE = 'https://zerowp.com/code-formatter/';
const ISSUES = 'https://github.com/awps/code-formatter-extension/issues';

const ICONS = {
    copy: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    download: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M4.5 6.8 8 10.3l3.5-3.5M2.5 13.5h11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    settings: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4.5h7M12.5 4.5H14M2 11.5h2.5M8 11.5h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="10.75" cy="4.5" r="1.75" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="6.25" cy="11.5" r="1.75" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
};

/**
 * Generates HTML for theme dropdown items.
 */
export function generateThemeItemsHtml(currentTheme: ThemeKey, keys: readonly ThemeKey[] = themeKeys): string {
    return keys.map(key => {
        const isSelected = key === currentTheme;
        const selectedClass = isSelected ? ' code-formatter-toolbar__dropdown-item--selected' : '';
        const checkMark = isSelected ? '●' : '○';
        return `<div class="code-formatter-toolbar__dropdown-item${selectedClass}" data-theme="${key}" data-tone="${themeTone(key)}">
            <span class="code-formatter-toolbar__dropdown-check">${checkMark}</span> ${themeLabels[key]}
        </div>`;
    }).join('');
}

/**
 * Auto / Light / Dark switch.
 */
export function generateAppearanceHtml(settings: Settings, i18n: ToolbarConfig['i18n']): string {
    const options: Array<[Appearance, string]> = [
        ['auto', i18n.appearanceAuto ?? 'Auto'],
        ['light', i18n.appearanceLight ?? 'Light'],
        ['dark', i18n.appearanceDark ?? 'Dark'],
    ];
    return `<div class="code-formatter-toolbar__appearance" role="radiogroup" aria-label="${i18n.appearance ?? 'Appearance'}">
        ${options.map(([value, label]) => {
            const on = settings.appearance === value;
            return `<button type="button" role="radio" aria-checked="${on}" class="code-formatter-toolbar__appearance-option${on ? ' code-formatter-toolbar__appearance-option--active' : ''}" data-appearance="${value}">${label}</button>`;
        }).join('')}
    </div>`;
}

/**
 * Two theme lists, one per tone. Only the list for the tone in use is shown
 * (CSS, via body[data-cf-tone]), so the menu stays short.
 */
export function generateThemeListsHtml(settings: Settings, i18n: ToolbarConfig['i18n']): string {
    const light = themeKeys.filter(k => themeTone(k) === 'light');
    const dark = themeKeys.filter(k => themeTone(k) === 'dark');
    return `<div class="code-formatter-toolbar__tone-list" data-tone-list="light">
            <div class="code-formatter-toolbar__menu-heading">${i18n.lightTheme ?? 'Light theme'}</div>
            <div class="code-formatter-toolbar__menu-themes" id="theme-dropdown-menu-light">${generateThemeItemsHtml(settings.lightTheme, light)}</div>
        </div>
        <div class="code-formatter-toolbar__tone-list" data-tone-list="dark">
            <div class="code-formatter-toolbar__menu-heading">${i18n.darkTheme ?? 'Dark theme'}</div>
            <div class="code-formatter-toolbar__menu-themes" id="theme-dropdown-menu-dark">${generateThemeItemsHtml(settings.darkTheme, dark)}</div>
        </div>`;
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
/**
 * "?" button with a popover: what the extension is, version, and links
 * to the website, docs and issue tracker.
 */
export function generateAboutHtml(config: ToolbarConfig): string {
    const { i18n, version } = config;
    const about = i18n.about ?? 'About';
    const links = [
        [SITE, i18n.overview ?? 'Overview'],
        [`${SITE}docs/`, i18n.documentation ?? 'Documentation'],
        [`${SITE}docs/#shortcuts`, i18n.keyboardShortcuts ?? 'Keyboard shortcuts'],
        [ISSUES, i18n.reportProblem ?? 'Report a problem'],
    ];
    return `<div class="code-formatter-toolbar__dropdown code-formatter-toolbar__about">
        <button type="button" class="code-formatter-toolbar__dropdown-trigger code-formatter-toolbar__help" id="about-dropdown-trigger" aria-label="${about} ${i18n.extShortName}">?</button>
        <div class="code-formatter-toolbar__dropdown-menu code-formatter-toolbar__dropdown-menu--about" id="about-dropdown-menu">
            <div class="code-formatter-toolbar__about-head">
                <strong>${i18n.extShortName}</strong>
                ${version ? `<span>${version}</span>` : ''}
            </div>
            <p class="code-formatter-toolbar__about-text">${i18n.aboutText ?? 'Formats code files you open in a tab. Read-only, runs fully in your browser.'}</p>
            <div class="code-formatter-toolbar__about-links">
                ${links.map(([href, label]) => `<a href="${href}" target="_blank" rel="noopener">${label}</a>`).join('')}
            </div>
        </div>
    </div>`;
}

export function generateToolbarHtml(config: ToolbarConfig): string {
    const { logo, i18n, settings, languageLabel } = config;
    const viewItemsHtml = generateViewItemsHtml(settings, i18n);
    const formattedLabel = i18n.viewFormatted ?? 'Formatted';
    const originalLabel = i18n.viewOriginal ?? 'Original';
    const settingsLabel = i18n.settings ?? 'Settings';

    return `<div class="code-formatter-toolbar">
        <div class="code-formatter-toolbar__brand">
            <div class="code-formatter-toolbar__logo">${logo}</div>
            ${languageLabel ? `<span class="code-formatter-toolbar__lang">${languageLabel}</span>` : ''}
            ${generateAboutHtml(config)}
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
                    <div class="code-formatter-toolbar__menu-heading">${i18n.appearance ?? 'Appearance'}</div>
                    ${generateAppearanceHtml(settings, i18n)}
                    ${generateThemeListsHtml(settings, i18n)}
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

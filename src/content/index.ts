import logo from '../logo';
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { detectLanguage } from './utils/languageDetection';
import { beautifyCode } from './utils/beautify';
import { isBase64, decodeBase64, parseLanguageWithBase64 } from './utils/base64';
import { getLanguageExtension, getLanguageLabel } from './utils/languagePlugin';
import { getCodeElement, extractCode, isValidCodeLength, createRendererElement, hidePreElement, removeJsonFormatterContainer } from './utils/codeDetection';
import { createEditorView, destroyEditor } from './components/editor';
import { insertToolbar, ToolbarConfig } from './components/toolbar';
import { statusBarExtension, linkExtension, CodeToolsI18n } from './components/codeTools';
import { SPONSOR_MARK, CRUSTAT_URL } from './components/sponsor';
import { createClickHandler, ClickHandlerContext } from './handlers/clickHandler';
import { updateThemeSelection, updateViewCheckbox } from './components/dropdown';
import { Settings, defaultSettings } from '../shared/types/settings';
import { loadSettings } from '../shared/utils/storage';

const msg = (key: string, fallback: string) => chrome.i18n.getMessage(key) || fallback;

const i18n = {
    extShortName: msg('extShortName', 'Code Formatter'),
    copy: msg('copy', 'Copy'),
    download: msg('download', 'Download'),
    showOriginal: msg('showOriginal', 'Show original'),
    showFormatted: msg('showFormatted', 'Show formatted'),
    theme: msg('theme', 'Theme'),
    view: msg('view', 'View'),
    lineNumbers: msg('lineNumbers', 'Line Numbers'),
    wordWrap: msg('wordWrap', 'Word Wrap'),
    viewFormatted: msg('viewFormatted', 'Formatted'),
    viewOriginal: msg('viewOriginal', 'Original'),
    settings: msg('settings', 'Settings'),
};

const toolsI18n: CodeToolsI18n = {
    jsonPath: msg('jsonPath', 'JSON path'),
    copyPath: msg('copyPath', 'Copy path'),
    copied: msg('copied', 'Copied!'),
    openLinkHint: msg('openLinkHint', 'Ctrl/⌘ + click to open link'),
    collapseAll: msg('collapseAll', 'Collapse all'),
    expandAll: msg('expandAll', 'Expand all'),
    collapseSelected: msg('collapseSelected', 'Collapse selected'),
    expandSelected: msg('expandSelected', 'Expand selected'),
    lines: msg('lines', 'lines'),
};

type FormatterWindow = Window & {
    __codeFormatterLanguage?: string;
    __codeFormatterStarted?: boolean;
};

// Formatter state
let currentView: 'original' | 'formatted' = 'original';
let currentSettings: Settings = defaultSettings;
let editorView: EditorView | null = null;
let originalCode = '';
let beautifiedCode = '';

async function initFormatter(): Promise<void> {
    const win = window as FormatterWindow;
    // The background may inject again (e.g. hash change re-fires "complete")
    if (win.__codeFormatterStarted) return;
    win.__codeFormatterStarted = true;

    const preElement = getCodeElement();
    if (!preElement) return;

    originalCode = extractCode(preElement);
    if (!originalCode || !isValidCodeLength(originalCode.length)) return;

    const result = processLanguage(win.__codeFormatterLanguage || 'auto-detect', originalCode, preElement);
    if (!result) return;

    const { language, code, pluginMode } = result;
    originalCode = code;
    beautifiedCode = beautifyCode(originalCode, language);

    const renderer = createRendererElement(preElement);
    if (!renderer) return;

    currentSettings = await loadSettings();

    const languageLabel = getLanguageLabel(language);
    const extras: Extension[] = [
        linkExtension(toolsI18n),
        statusBarExtension(toolsI18n, {
            jsonPath: language === 'json',
            languageLabel,
            sponsor: {
                label: msg('sponsored', 'Sponsored'),
                name: 'Crustat',
                text: 'See who visits your website. Try it free.',
                url: CRUSTAT_URL,
                mark: SPONSOR_MARK,
            },
        }),
    ];

    const buildEditor = () => {
        destroyEditor(editorView);
        editorView = createEditorView({
            container: renderer,
            code: beautifiedCode,
            languageExtension: pluginMode,
            settings: currentSettings,
            extraExtensions: extras,
        });
    };

    hidePreElement(preElement);
    document.body.classList.add('code-formatter-is-loaded');
    buildEditor();
    currentView = 'formatted';

    setupUI(preElement, renderer, buildEditor, languageLabel);
}

function processLanguage(langHint: string, code: string, preElement: HTMLPreElement): { language: string; code: string; pluginMode: () => Extension } | null {
    const { language: parsedLang, isBase64: hasBase64Flag } = parseLanguageWithBase64(langHint);
    let language = parsedLang;
    let processedCode = code;

    // Handle base64 decoding
    if (hasBase64Flag && window.location.href.startsWith('data:') && isBase64(code)) {
        const decoded = decodeBase64(code);
        if (decoded) {
            processedCode = decoded;
            preElement.textContent = decoded;
        }
    }

    // Unknown hint (no hint, or an extension we can't highlight like .txt): look at the content
    if (!language || language === 'auto-detect' || !getLanguageExtension(language)) {
        language = detectLanguage(processedCode);
    }

    // A .js file that is actually JSON
    if (language === 'js' && detectLanguage(processedCode) === 'json') {
        language = 'json';
    }

    const pluginMode = getLanguageExtension(language);
    if (!pluginMode) return null;

    return { language, code: processedCode, pluginMode };
}

function setupUI(preElement: HTMLPreElement, renderer: HTMLElement, buildEditor: () => void, languageLabel: string): void {
    const toolbarConfig: ToolbarConfig = { logo, i18n, settings: currentSettings, languageLabel };
    insertToolbar(toolbarConfig);

    preElement.style.overflow = 'auto';
    preElement.style.margin = '0';
    removeJsonFormatterContainer();

    const clickCtx: ClickHandlerContext = {
        getState: () => ({ settings: currentSettings, currentView, originalCode, beautifiedCode }),
        setState: (updates) => {
            if (updates.settings) currentSettings = updates.settings;
            if (updates.currentView) currentView = updates.currentView;
        },
        getElements: () => ({ preElement, renderer }),
        getEditorView: () => editorView,
        rebuildEditor: buildEditor,
        i18n: { copied: toolsI18n.copied, copy: i18n.copy }
    };

    document.addEventListener('click', createClickHandler(clickCtx));

    // Listen for settings changes from popup
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync' || !changes.codeFormatterSettings) return;

        const newSettings = changes.codeFormatterSettings.newValue as Settings;
        if (!newSettings) return;

        currentSettings = { ...defaultSettings, ...newSettings };

        updateThemeSelection('theme-dropdown-menu', currentSettings.theme);
        updateViewCheckbox('view-dropdown-menu', 'lineNumbers', currentSettings.lineNumbers);
        updateViewCheckbox('view-dropdown-menu', 'wordWrap', currentSettings.wordWrap);

        buildEditor();
    });
}

initFormatter();

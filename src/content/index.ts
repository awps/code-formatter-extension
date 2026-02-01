import logo from '../logo';
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { detectLanguage } from './utils/languageDetection';
import { beautifyCode } from './utils/beautify';
import { isBase64, decodeBase64, parseLanguageWithBase64 } from './utils/base64';
import { getLanguageExtension } from './utils/languagePlugin';
import { getCodeElement, extractCode, isValidCodeLength, createRendererElement, hidePreElement, removeJsonFormatterContainer } from './utils/codeDetection';
import { createEditorView } from './components/editor';
import { insertToolbar, ToolbarConfig } from './components/toolbar';
import { createClickHandler, ClickHandlerContext } from './handlers/clickHandler';
import { updateThemeSelection, updateViewCheckbox } from './components/dropdown';
import { destroyEditor } from './components/editor';
import { Settings, defaultSettings } from '../shared/types/settings';
import { loadSettings } from '../shared/utils/storage';

const i18n = {
    extShortName: chrome.i18n.getMessage('extShortName'),
    copy: chrome.i18n.getMessage('copy'),
    download: chrome.i18n.getMessage('download'),
    showOriginal: chrome.i18n.getMessage('showOriginal'),
    showFormatted: chrome.i18n.getMessage('showFormatted'),
    theme: chrome.i18n.getMessage('theme'),
    view: chrome.i18n.getMessage('view'),
    lineNumbers: chrome.i18n.getMessage('lineNumbers'),
    wordWrap: chrome.i18n.getMessage('wordWrap'),
};

// Formatter state
let currentView: 'original' | 'formatted' = 'original';
let currentSettings: Settings = defaultSettings;
let editorView: EditorView | null = null;
let originalCode = '';
let beautifiedCode = '';

function init(): void {
    setTimeout(initFormatter, 50);
}

function initFormatter(): void {
    const preElement = getCodeElement();
    if (!preElement) return;

    originalCode = extractCode(preElement);
    if (!originalCode || !isValidCodeLength(originalCode.length)) return;

    let isFormatted = false;

    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        if (isFormatted) {
            sendResponse({ status: 'already_formatted' });
            return false;
        }

        const result = processLanguage(request.programmingLanguage, originalCode, preElement);
        if (!result) {
            sendResponse({ status: 'no_language' });
            return false;
        }

        const { language, code, pluginMode } = result;
        if (!pluginMode) {
            sendResponse({ status: 'no_plugin' });
            return false;
        }

        originalCode = code;
        beautifiedCode = beautifyCode(originalCode, language);

        const renderer = createRendererElement(preElement);
        if (!renderer) {
            sendResponse({ status: 'no_renderer' });
            return false;
        }

        hidePreElement(preElement);
        document.body.classList.add('code-formatter-is-loaded');

        loadSettings().then((settings) => {
            currentSettings = settings;
            editorView = createEditorView({
                container: renderer,
                code: beautifiedCode,
                languageExtension: pluginMode,
                settings: currentSettings
            });

            currentView = 'formatted';
            isFormatted = true;
            sendResponse({ status: 'success', language });
            document.body.classList.remove('code-formatter-is-loading');

            setupUI(preElement, renderer, pluginMode);
        });

        // Return true to indicate we will send response asynchronously
        return true;
    });
}

function processLanguage(langHint: string, code: string, preElement: HTMLPreElement): { language: string; code: string; pluginMode: (() => Extension) | null } | null {
    const { language: parsedLang, isBase64: hasBase64Flag } = parseLanguageWithBase64(langHint || '');
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

    // Detect language if needed
    if (!language || language === 'auto-detect') {
        language = detectLanguage(processedCode);
    }

    // Check if JS file is actually JSON
    if (language === 'js' && detectLanguage(processedCode) === 'json') {
        language = 'json';
    }

    if (!language || language === 'unknown') return null;

    return { language, code: processedCode, pluginMode: getLanguageExtension(language) };
}

function setupUI(preElement: HTMLPreElement, renderer: HTMLElement, pluginMode: () => Extension): void {
    const toolbarConfig: ToolbarConfig = { logo, i18n, settings: currentSettings };
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
        setEditorView: (view) => { editorView = view; },
        pluginMode,
        i18n: { showOriginal: i18n.showOriginal, showFormatted: i18n.showFormatted }
    };

    document.addEventListener('click', createClickHandler(clickCtx));

    // Listen for settings changes from popup
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync' || !changes.codeFormatterSettings) return;

        const newSettings = changes.codeFormatterSettings.newValue as Settings;
        if (!newSettings) return;

        // Update local state
        currentSettings = { ...defaultSettings, ...newSettings };

        // Update toolbar UI
        updateThemeSelection('theme-dropdown-menu', currentSettings.theme);
        updateViewCheckbox('view-dropdown-menu', 'lineNumbers', currentSettings.lineNumbers);
        updateViewCheckbox('view-dropdown-menu', 'wordWrap', currentSettings.wordWrap);

        // Recreate editor with new settings
        destroyEditor(editorView);
        editorView = createEditorView({
            container: renderer,
            code: beautifiedCode,
            languageExtension: pluginMode,
            settings: currentSettings
        });
    });
}

init();

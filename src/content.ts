import logo from './logo';
import beautifyJS from 'js-beautify';
import {basicSetup} from "codemirror";
import {EditorView} from "@codemirror/view";
import {EditorState, Extension} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import {css} from "@codemirror/lang-css";
import {json} from "@codemirror/lang-json";
import {php} from "@codemirror/lang-php";
import {markdown} from "@codemirror/lang-markdown";
import {xml} from "@codemirror/lang-xml";
import {less} from "@codemirror/lang-less";
import {sass} from "@codemirror/lang-sass";
import {python} from "@codemirror/lang-python";
import {sql} from "@codemirror/lang-sql";
import {yaml} from "@codemirror/lang-yaml";
import {go} from "@codemirror/lang-go";
import {rust} from "@codemirror/lang-rust";
import {java} from "@codemirror/lang-java";
import {cpp} from "@codemirror/lang-cpp";
import {csharp} from "@replit/codemirror-lang-csharp";
import { alternativeDetectLanguage } from './utils/alternativeDetectLanguage';
import { Settings, ThemeKey, defaultSettings } from './types/settings';
import { loadSettings, saveSettings } from './utils/storage';
import { getTheme, themeLabels } from './utils/themes';

const jsBeautify = beautifyJS.js;
const cssBeautify = beautifyJS.css;

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

function beautify(code: string, language: string): string {
    // if language is not in array, return code
    if (!['js', 'css', 'json'].includes(language)) {
        return code;
    }

    if (language === 'css') {
        return cssBeautify(code);
    }

    return jsBeautify(code);
}

let currentView = 'original';
let currentSettings: Settings = defaultSettings;
let editorView: EditorView | null = null;

function init() {
    // Small delay to ensure content is fully loaded
    setTimeout(() => {
        initFormatter();
    }, 50);
}

function initFormatter() {
    // ONLY format if <pre> is the FIRST child of body
    const firstChild = document.body.firstElementChild;
    
    if (!firstChild || firstChild.tagName !== 'PRE') {
        // Special case: body has no elements but contains plain text code
        if (document.body.children.length === 0) {
            const bodyText = document.body.innerText.trim();
            if (bodyText) {
                // Check if it's JSON or other code content
                if (bodyText.startsWith('{') || bodyText.startsWith('[') || 
                    bodyText.includes('function') || bodyText.includes('var') ||
                    bodyText.includes('const') || bodyText.includes('let')) {
                    // Create a pre tag to hold the content
                    const firstPre = document.createElement('pre') as HTMLPreElement;
                    firstPre.textContent = bodyText;
                    document.body.appendChild(firstPre);
                    // console.log('[Code Formatter] Created pre tag for plain text code content');
                    // Continue with this new pre element
                } else {
                    // console.log("[Code Formatter] Body contains text but doesn't look like code");
                    return;
                }
            } else {
                // console.log("[Code Formatter] No <pre> as first child of body");
                return;
            }
        } else {
            // console.log("[Code Formatter] First child of body is not <pre>, it's:", firstChild?.tagName);
            return;
        }
    }
    
    // Now we know the first child is a pre tag
    const firstPre = document.body.firstElementChild as HTMLPreElement;

    let originalCode = firstPre.innerText;

    if (!originalCode) {
        return;
    }

    const length = originalCode.length;
    
    // Debug info (uncomment to enable)
    // console.log('[Code Formatter] Page detected with code length:', length);
    // console.log('[Code Formatter] First 100 chars:', originalCode.substring(0, 100));

    // Max 100mb
    if (length > 100e6) {
        // console.warn(`Code length (${length}) exceeds the 100 million character limit. Aborting formatting.`);
        return;
    }

    let IS_FORMATTED = false;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (IS_FORMATTED) {
            sendResponse({status: 'already_formatted'});
            return;
        }

        let programmingLanguage = request.programmingLanguage;
        // console.log('[Code Formatter] Language received from background:', programmingLanguage);

        // Check if we need to decode base64
        let decodedCode = originalCode;
        if (programmingLanguage && programmingLanguage.includes(':base64')) {
            // Extract language and decode base64
            programmingLanguage = programmingLanguage.replace(':base64', '');
            
            // For data URLs, the content might already be decoded by the browser
            // But if we're looking at the raw base64, decode it
            if (window.location.href.startsWith('data:')) {
                try {
                    // Try to decode if it looks like base64
                    if (/^[A-Za-z0-9+/]+=*$/.test(originalCode.replace(/\s/g, ''))) {
                        decodedCode = atob(originalCode);
                        // console.log('[Code Formatter] Decoded base64 content');
                    }
                } catch (e) {
                    // console.log('[Code Formatter] Failed to decode base64:', e);
                }
            }
        }

        // If no language provided or auto-detect, use content-based detection
        if (!programmingLanguage || programmingLanguage === 'auto-detect') {
            programmingLanguage = alternativeDetectLanguage(decodedCode);
            // console.log('[Code Formatter] Language detected from content:', programmingLanguage);
        }
        
        // Special check: JS files might actually be JSON
        if (programmingLanguage === 'js') {
            const detectedLang = alternativeDetectLanguage(decodedCode);
            if (detectedLang === 'json') {
                programmingLanguage = 'json';
                // console.log('[Code Formatter] JS file re-detected as JSON based on content');
            }
        }
        
        // Update originalCode to use decoded content
        if (decodedCode !== originalCode) {
            originalCode = decodedCode;
            // Update the pre tag with decoded content
            firstPre!.textContent = decodedCode;
        }

        if (!programmingLanguage || programmingLanguage === 'unknown') {
            // console.log('[Code Formatter] No valid language detected, aborting');
            sendResponse({status: 'no_language'});
            return;
        }
        
        // console.log('[Code Formatter] Final language:', programmingLanguage);


        let pluginMode: (() => Extension) | undefined = undefined;

        if (programmingLanguage === 'json') {
            pluginMode = json;
        } else if (programmingLanguage === 'css') {
            pluginMode = css;
        } else if (/js|ts|jsx|tsx/.test(programmingLanguage)) {
            pluginMode = javascript;
        } else if (programmingLanguage === 'php') {
            pluginMode = php;
        } else if (programmingLanguage === 'md') {
            pluginMode = markdown;
        } else if (programmingLanguage === 'xml') {
            pluginMode = xml;
        }
        else if (/ya?ml/.test(programmingLanguage)) {
            pluginMode = yaml;
        } else if (programmingLanguage === 'less') {
            pluginMode = less;
        } else if (programmingLanguage === 'sass') {
            pluginMode = sass;
        } else if (programmingLanguage === 'py') {
            pluginMode = python;
        } else if (programmingLanguage === 'sql') {
            pluginMode = sql;
        } else if (programmingLanguage === 'go') {
            pluginMode = go;
        } else if (/cpp|cxx|cc/.test(programmingLanguage)) {
            pluginMode = cpp;
        } else if (programmingLanguage === 'rs') {
            pluginMode = rust;
        } else if (programmingLanguage === 'java') {
            pluginMode = java;
        } else if (programmingLanguage === 'cs') {
            pluginMode = csharp;
        }


        if (!pluginMode) {
            sendResponse({status: 'no_plugin'});
            return;
        }

        const beautified = beautify(originalCode, programmingLanguage);

        firstPre!.insertAdjacentHTML('afterend', `<div id="code-formatter-renderer" class="code-formatter-renderer"></div>`);

        const renderer = document.getElementById('code-formatter-renderer');

        if (!renderer) {
            //console.error("Could not find code-formatter-renderer element.");
            return;
        }

        firstPre!.hidden = true;
        firstPre!.style.display = 'none';

        document.body.classList.add('code-formatter-is-loaded');

        // Load settings and create editor
        loadSettings().then((settings) => {
            currentSettings = settings;

            function createEditor() {
                // Destroy existing editor if any
                if (editorView) {
                    editorView.destroy();
                }

                const extensions: Extension[] = [
                    basicSetup,
                    getTheme(currentSettings.theme),
                    pluginMode!(),
                    EditorState.readOnly.of(true),
                ];

                // Add word wrap if enabled
                if (currentSettings.wordWrap) {
                    extensions.push(EditorView.lineWrapping);
                }

                // Hide line numbers if disabled
                if (!currentSettings.lineNumbers) {
                    extensions.push(EditorView.theme({
                        '.cm-gutters': { display: 'none' }
                    }));
                }

                const state = EditorState.create({
                    doc: beautified,
                    extensions
                });

                editorView = new EditorView({
                    parent: renderer!,
                    state,
                });
            }

            createEditor();

            currentView = 'formatted';
            IS_FORMATTED = true;

            // Send success response
            sendResponse({status: 'success', language: programmingLanguage});

            document.body.classList.remove(`code-formatter-is-loading`);

            // Generate theme dropdown items HTML
            const themeKeys: ThemeKey[] = ['dracula', 'amy', 'ayuLight', 'barf', 'bespin', 'birdsOfParadise', 'boysAndGirls', 'clouds', 'cobalt', 'coolGlow', 'espresso', 'noctisLilac', 'rosePineDawn', 'smoothy', 'solarizedLight', 'tomorrow'];
            const themeItemsHtml = themeKeys.map(key => {
                const isSelected = key === currentSettings.theme;
                const selectedClass = isSelected ? ' code-formatter-toolbar__dropdown-item--selected' : '';
                const checkMark = isSelected ? '●' : '○';
                return `<div class="code-formatter-toolbar__dropdown-item${selectedClass}" data-theme="${key}">
                    <span class="code-formatter-toolbar__dropdown-check">${checkMark}</span> ${themeLabels[key]}
                </div>`;
            }).join('');

            // Generate view dropdown items HTML
            const lineNumbersChecked = currentSettings.lineNumbers;
            const wordWrapChecked = currentSettings.wordWrap;

            document.body.insertAdjacentHTML('beforeend', `<div class="code-formatter-toolbar">
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
                        <div class="code-formatter-toolbar__dropdown-item${lineNumbersChecked ? ' code-formatter-toolbar__dropdown-item--checked' : ''}" data-setting="lineNumbers">
                            <span class="code-formatter-toolbar__dropdown-check">${lineNumbersChecked ? '☑' : '☐'}</span> ${i18n.lineNumbers}
                        </div>
                        <div class="code-formatter-toolbar__dropdown-item${wordWrapChecked ? ' code-formatter-toolbar__dropdown-item--checked' : ''}" data-setting="wordWrap">
                            <span class="code-formatter-toolbar__dropdown-check">${wordWrapChecked ? '☑' : '☐'}</span> ${i18n.wordWrap}
                        </div>
                    </div>
                </div>

                <div class="code-formatter-toolbar__spacer"></div>
                <div><button class="code-formatter-toolbar__button code-formatter-toolbar__button__switch" id="code-formatter-switcher-button">${i18n.showOriginal}</button></div>
                <div><button class="code-formatter-toolbar__button code-formatter-toolbar__button__copy" id="code-formatter-toolbar-button-copy">${i18n.copy}</button></div>
                <div><button class="code-formatter-toolbar__button code-formatter-toolbar__button__download" id="code-formatter-toolbar-button-download">${i18n.download}</button></div>
            </div>`);

            firstPre!.style.overflow = 'auto';
            firstPre!.style.margin = '0';

            const jsonFormatterContainer = document.querySelector('.json-formatter-container');

            if (jsonFormatterContainer) {
                jsonFormatterContainer.remove();
            }

            // Helper to update theme dropdown UI
            function updateThemeDropdownUI(selectedTheme: ThemeKey) {
                const themeMenu = document.getElementById('theme-dropdown-menu');
                if (!themeMenu) return;

                themeMenu.querySelectorAll('.code-formatter-toolbar__dropdown-item').forEach(item => {
                    const itemTheme = (item as HTMLElement).dataset.theme as ThemeKey;
                    const isSelected = itemTheme === selectedTheme;
                    const checkSpan = item.querySelector('.code-formatter-toolbar__dropdown-check');

                    item.classList.toggle('code-formatter-toolbar__dropdown-item--selected', isSelected);
                    if (checkSpan) {
                        checkSpan.textContent = isSelected ? '●' : '○';
                    }
                });
            }

            // Helper to update view dropdown UI
            function updateViewDropdownUI(setting: 'lineNumbers' | 'wordWrap', checked: boolean) {
                const viewMenu = document.getElementById('view-dropdown-menu');
                if (!viewMenu) return;

                const item = viewMenu.querySelector(`[data-setting="${setting}"]`);
                if (!item) return;

                const checkSpan = item.querySelector('.code-formatter-toolbar__dropdown-check');
                item.classList.toggle('code-formatter-toolbar__dropdown-item--checked', checked);
                if (checkSpan) {
                    checkSpan.textContent = checked ? '☑' : '☐';
                }
            }

            document.addEventListener('click', (e: MouseEvent) => {
                if (!e.target || !(e.target instanceof HTMLElement)) {
                    return;
                }

                const targetElement = e.target;

                // Handle dropdown toggle
                const trigger = targetElement.closest('.code-formatter-toolbar__dropdown-trigger');
                if (trigger) {
                    e.stopPropagation();
                    const dropdown = trigger.parentElement;
                    const menu = dropdown?.querySelector('.code-formatter-toolbar__dropdown-menu');

                    // Close other dropdowns first
                    document.querySelectorAll('.code-formatter-toolbar__dropdown-menu--open')
                        .forEach(openMenu => {
                            if (openMenu !== menu) {
                                openMenu.classList.remove('code-formatter-toolbar__dropdown-menu--open');
                            }
                        });

                    menu?.classList.toggle('code-formatter-toolbar__dropdown-menu--open');
                    return;
                }

                // Handle theme dropdown item click
                const themeItem = targetElement.closest('[data-theme]');
                if (themeItem) {
                    const newTheme = (themeItem as HTMLElement).dataset.theme as ThemeKey;
                    if (newTheme && newTheme !== currentSettings.theme) {
                        currentSettings.theme = newTheme;
                        saveSettings({ theme: newTheme });
                        updateThemeDropdownUI(newTheme);
                        createEditor();
                    }
                    // Close dropdown
                    document.querySelectorAll('.code-formatter-toolbar__dropdown-menu--open')
                        .forEach(menu => menu.classList.remove('code-formatter-toolbar__dropdown-menu--open'));
                    return;
                }

                // Handle view dropdown item click
                const viewItem = targetElement.closest('[data-setting]');
                if (viewItem) {
                    const setting = (viewItem as HTMLElement).dataset.setting as 'lineNumbers' | 'wordWrap';
                    if (setting) {
                        const newValue = !currentSettings[setting];
                        currentSettings[setting] = newValue;
                        saveSettings({ [setting]: newValue });
                        updateViewDropdownUI(setting, newValue);
                        createEditor();
                    }
                    // Close dropdown
                    document.querySelectorAll('.code-formatter-toolbar__dropdown-menu--open')
                        .forEach(menu => menu.classList.remove('code-formatter-toolbar__dropdown-menu--open'));
                    return;
                }

                // Close all dropdowns when clicking outside
                if (!targetElement.closest('.code-formatter-toolbar__dropdown-menu')) {
                    document.querySelectorAll('.code-formatter-toolbar__dropdown-menu--open')
                        .forEach(menu => menu.classList.remove('code-formatter-toolbar__dropdown-menu--open'));
                }

                if (targetElement.id === 'code-formatter-switcher-button') {
                    if (firstPre!.hidden) {
                        firstPre!.hidden = false;
                        firstPre!.style.display = 'block';
                        renderer!.hidden = true;
                        renderer!.style.display = 'none';
                        targetElement.innerText = i18n.showFormatted;
                        currentView = 'original';
                    } else {
                        firstPre!.hidden = true;
                        firstPre!.style.display = 'none';
                        renderer!.hidden = false;
                        renderer!.style.display = 'block';
                        targetElement.innerText = i18n.showOriginal;
                        currentView = 'formatted';
                    }

                } else if (targetElement.id === 'code-formatter-toolbar-button-copy') {
                    navigator && navigator.clipboard && navigator.clipboard.writeText(currentView === 'original' ? originalCode : beautified);
                } else if (targetElement.id === 'code-formatter-toolbar-button-download') {
                    const a = document.createElement('a');
                    a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(currentView === 'original' ? originalCode : beautified)}`;

                    const basename = window.location.pathname.split('/').pop();
                    a.download = basename ? basename : 'code-formatter.txt';
                    a.click();
                }
            });
        }); // closes loadSettings().then()

    });

}

init();

import logo from './logo';
import beautifyJS from 'js-beautify';
import {basicSetup} from "codemirror";
import {javascript} from "@codemirror/lang-javascript";
import {css} from "@codemirror/lang-css";
import {json} from "@codemirror/lang-json";
import {EditorView} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {dracula} from 'thememirror';

const jsBeautify = beautifyJS.js;
const cssBeautify = beautifyJS.css;

const i18n = {
    extShortName: chrome.i18n.getMessage('extShortName'),
    copy: chrome.i18n.getMessage('copy'),
    download: chrome.i18n.getMessage('download'),
    showOriginal: chrome.i18n.getMessage('showOriginal'),
    showFormatted: chrome.i18n.getMessage('showFormatted'),
};

function detectLanguage(code) {
    // JavaScript check
    if (/function\s+\w*\s*\(/.test(code) || /var\s+\w*\s*=/.test(code) || /console\./.test(code)) {
        return 'js';
    }

    // JSON check
    if (/\{\s*"\w+"\s*:\s*("[^"]*"\s*|\d+\s*|\{\s*\}\s*|\[\s*\]\s*)\s*(,\s*"\w+"\s*:\s*("[^"]*"\s*|\d+\s*|\{\s*\}\s*|\[\s*\]\s*)\s*)*\}/.test(code)) {
        return 'json';
    }

    // CSS check
    if (/\{\s*\}/.test(code) || /[\w\s\[\]\(\)-]+\s*\{[\w\s\[\]\(\)-:;#.'",=\/*]+\}/.test(code)) {
        return 'css';
    }

    return 'unknown';
}

function beautify(code, language) {
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

function init() {
    const firstPre = document.body.firstChild;

    if (!firstPre || !firstPre.tagName || firstPre.tagName !== 'PRE') {
        return;
    }

    const originalCode = firstPre.innerText;

    if (!originalCode) {
        return;
    }

    const length = originalCode.length;

    if (length > 3e6) {
        return;
    }

    document.body.classList.add('code-formatter-is-loading');

    firstPre.hidden = true;
    firstPre.style.display = 'none';

    const lang = detectLanguage(originalCode);

    // console.log(lang);

    document.body.classList.add('code-formatter-is-loaded');

    const beautified = beautify(originalCode, lang);

    firstPre.insertAdjacentHTML('afterend', `<div id="code-formatter-renderer" class="code-formatter-renderer"></div>`);

    const renderer = document.getElementById('code-formatter-renderer');

    let pluginMode = javascript;

    if (lang === 'json') {
        pluginMode = json;
    }
    if (lang === 'css') {
        pluginMode = css;
    }

    const state = EditorState.create({
        doc: beautified,
        extensions: [basicSetup, dracula, pluginMode(), EditorState.readOnly.of(true)]
    });

    new EditorView({
        parent: renderer,
        state,
    });

    currentView = 'formatted';

    document.body.classList.remove(`code-formatter-is-loading`);

    document.body.insertAdjacentHTML('beforeend', `<div class="code-formatter-toolbar">
        <div class="code-formatter-toolbar__logo">
            ${logo}
        </div>
        <div class="code-formatter-toolbar__logo-text"><a href="https://zerowp.com/code-formatter/" target="_blank">${i18n.extShortName}</a></div>
        <div></div>
        <div><button class="code-formatter-toolbar__button" id="code-formatter-switcher-button">${i18n.showOriginal}</button></div>
        <div><button class="code-formatter-toolbar__button" id="code-formatter-toolbar-button-copy">${i18n.copy}</button></div>
        <div><button class="code-formatter-toolbar__button" id="code-formatter-toolbar-button-download">${i18n.download}</button></div>
    </div>`);

    const switcherButton = document.getElementById('code-formatter-switcher-button');

    switcherButton.addEventListener('click', () => {
        if (firstPre.hidden) {
            firstPre.hidden = false;
            firstPre.style.display = 'block';
            renderer.hidden = true;
            renderer.style.display = 'none';
            switcherButton.innerText = i18n.showFormatted;
            currentView = 'original';
        } else {
            firstPre.hidden = true;
            firstPre.style.display = 'none';
            renderer.hidden = false;
            renderer.style.display = 'block';
            switcherButton.innerText = i18n.showOriginal;
            currentView = 'formatted';
        }
    });

    firstPre.style.overflow = 'auto';
    firstPre.style.height = 'calc(100vh - 40px)';
    firstPre.style.margin = '0';

    // copy
    const copyButton = document.getElementById('code-formatter-toolbar-button-copy');

    copyButton.addEventListener('click', () => {
        navigator && navigator.clipboard && navigator.clipboard.writeText(currentView === 'original' ? originalCode : beautified);
    });

    // download
    const downloadButton = document.getElementById('code-formatter-toolbar-button-download');

    downloadButton.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(currentView === 'original' ? originalCode : beautified)}`;

        const basename = window.location.pathname.split('/').pop();
        a.download = basename ? basename : 'code-formatter.txt';
        a.click();
    });
}

init();

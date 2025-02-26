import logo from './logo';
import beautifyJS from 'js-beautify';
import {basicSetup} from "codemirror";
import {EditorView} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {dracula} from 'thememirror';
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

const jsBeautify = beautifyJS.js;
const cssBeautify = beautifyJS.css;

const i18n = {
    extShortName: chrome.i18n.getMessage('extShortName'),
    copy: chrome.i18n.getMessage('copy'),
    download: chrome.i18n.getMessage('download'),
    showOriginal: chrome.i18n.getMessage('showOriginal'),
    showFormatted: chrome.i18n.getMessage('showFormatted'),
};

function alternativeDetectLanguage(code) {
    // PHP check
    if (/^<\?php/.test(code) || /function\s+\w*\s*\(/.test(code)) {
        return 'php';
    }

    // JSON check
    if (/\{\s*"\w+"\s*:\s*("[^"]*"\s*|\d+\s*|\{\s*\}\s*|\[\s*\]\s*)\s*(,\s*"\w+"\s*:\s*("[^"]*"\s*|\d+\s*|\{\s*\}\s*|\[\s*\]\s*)\s*)*\}/.test(code)) {
        return 'json';
    }

    // Improved JavaScript check
    if (/function\s+\w*\s*\(/.test(code) || /var\s+\w*\s*=/.test(code) || /console\./.test(code) ||
        /\w+\s*=>\s*\{/.test(code) || /let\s+\w*\s*=/.test(code) || /const\s+\w*\s*=/.test(code) ||
        /\.\s*(map|filter|reduce|forEach)\s*\(/.test(code)) {
        return 'js';
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

    let IS_FORMATTED = false;

    chrome.runtime.onMessage.addListener((request) => {
        if (IS_FORMATTED) {
            return;
        }

        let programmingLanguage = request.programmingLanguage;
        console.log(programmingLanguage + ' received');

        if (!programmingLanguage) {
            programmingLanguage = alternativeDetectLanguage(originalCode);
            console.log(programmingLanguage + ' detected');
        } else if (!programmingLanguage || programmingLanguage === 'js') {
            if (alternativeDetectLanguage(originalCode) === 'json') {
                programmingLanguage = 'json';
            }
        }

        if (!programmingLanguage || programmingLanguage === 'unknown') {
            return;
        }


        let pluginMode = undefined;

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
            return;
        }

        const beautified = beautify(originalCode, programmingLanguage);

        firstPre.insertAdjacentHTML('afterend', `<div id="code-formatter-renderer" class="code-formatter-renderer"></div>`);

        const renderer = document.getElementById('code-formatter-renderer');

        const extensions = [basicSetup, dracula];

        firstPre.hidden = true;
        firstPre.style.display = 'none';

        // if (programmingLanguage === 'json') {
        //     document.querySelector('.json-formatter-container').remove();
        // }

        document.body.classList.add('code-formatter-is-loaded');

        extensions.push(pluginMode());

        extensions.push(EditorState.readOnly.of(true));

        const state = EditorState.create({
            doc: beautified,
            extensions
        });

        new EditorView({
            parent: renderer,
            state,
        });

        currentView = 'formatted';
        IS_FORMATTED = true;

        document.body.classList.remove(`code-formatter-is-loading`);

        document.body.insertAdjacentHTML('beforeend', `<div class="code-formatter-toolbar">
        <div class="code-formatter-toolbar__logo">
                ${logo}
            </div>
            <div class="code-formatter-toolbar__logo-text"><a href="https://zerowp.com/code-formatter/" target="_blank">${i18n.extShortName}</a></div>
            <div></div>
            <div><button class="code-formatter-toolbar__button code-formatter-toolbar__button__switch" id="code-formatter-switcher-button">${i18n.showOriginal}</button></div>
            <div><button class="code-formatter-toolbar__button code-formatter-toolbar__button__copy" id="code-formatter-toolbar-button-copy">${i18n.copy}</button></div>
            <div><button class="code-formatter-toolbar__button code-formatter-toolbar__button__download" id="code-formatter-toolbar-button-download">${i18n.download}</button></div>
        </div>`);

        firstPre.style.overflow = 'auto';
        // firstPre.style.height = 'calc(100vh - 40px)';
        firstPre.style.margin = '0';

        const jsonFormatterContainer = document.querySelector('.json-formatter-container');

        if (jsonFormatterContainer) {
            jsonFormatterContainer.remove();
        }

        document.addEventListener('click', (e) => {
            if (e.target.id === 'code-formatter-switcher-button') {
                if (firstPre.hidden) {
                    firstPre.hidden = false;
                    firstPre.style.display = 'block';
                    renderer.hidden = true;
                    renderer.style.display = 'none';
                    e.target.innerText = i18n.showFormatted;
                    currentView = 'original';
                } else {
                    firstPre.hidden = true;
                    firstPre.style.display = 'none';
                    renderer.hidden = false;
                    renderer.style.display = 'block';
                    e.target.innerText = i18n.showOriginal;
                    currentView = 'formatted';
                }

            } else if (e.target.id === 'code-formatter-toolbar-button-copy') {
                navigator && navigator.clipboard && navigator.clipboard.writeText(currentView === 'original' ? originalCode : beautified);
            } else if (e.target.id === 'code-formatter-toolbar-button-download') {
                const a = document.createElement('a');
                a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(currentView === 'original' ? originalCode : beautified)}`;

                const basename = window.location.pathname.split('/').pop();
                a.download = basename ? basename : 'code-formatter.txt';
                a.click();
            }
        });

    });

}

init();

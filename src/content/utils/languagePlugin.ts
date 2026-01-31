import { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { php } from "@codemirror/lang-php";
import { markdown } from "@codemirror/lang-markdown";
import { xml } from "@codemirror/lang-xml";
import { less } from "@codemirror/lang-less";
import { sass } from "@codemirror/lang-sass";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { yaml } from "@codemirror/lang-yaml";
import { go } from "@codemirror/lang-go";
import { rust } from "@codemirror/lang-rust";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { csharp } from "@replit/codemirror-lang-csharp";

/**
 * Maps a language string to a CodeMirror language extension function.
 * Returns null if the language is not supported.
 */
export function getLanguageExtension(lang: string): (() => Extension) | null {
    if (lang === 'json') {
        return json;
    }
    if (lang === 'css') {
        return css;
    }
    if (/^(js|ts|jsx|tsx)$/.test(lang)) {
        return javascript;
    }
    if (lang === 'php') {
        return php;
    }
    if (lang === 'md') {
        return markdown;
    }
    if (lang === 'xml') {
        return xml;
    }
    if (/^ya?ml$/.test(lang)) {
        return yaml;
    }
    if (lang === 'less') {
        return less;
    }
    if (lang === 'sass') {
        return sass;
    }
    if (lang === 'py') {
        return python;
    }
    if (lang === 'sql') {
        return sql;
    }
    if (lang === 'go') {
        return go;
    }
    if (/^(cpp|cxx|cc)$/.test(lang)) {
        return cpp;
    }
    if (lang === 'rs') {
        return rust;
    }
    if (lang === 'java') {
        return java;
    }
    if (lang === 'cs') {
        return csharp;
    }

    return null;
}

/**
 * List of supported language identifiers.
 */
export const supportedLanguages = [
    'json', 'css', 'js', 'ts', 'jsx', 'tsx', 'php', 'md', 'xml',
    'yaml', 'yml', 'less', 'sass', 'py', 'sql', 'go', 'cpp', 'cxx', 'cc',
    'rs', 'java', 'cs'
];
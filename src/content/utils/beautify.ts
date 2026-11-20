import beautifyJS from 'js-beautify';
import { formatJson } from './formatJson';

const jsBeautify = beautifyJS.js;
const cssBeautify = beautifyJS.css;

/**
 * Beautifies code based on the detected language.
 * Only JS, CSS, and JSON are beautified; other languages return unchanged.
 */
export function beautifyCode(code: string, language: string): string {
    if (language === 'json') {
        // Real JSON formatter: one bracket per line so every object/array
        // can be collapsed. Falls back to the JS beautifier for JSON-like
        // input that isn't strictly valid (JSONP, trailing commas, ...).
        return formatJson(code) ?? jsBeautify(code);
    }

    if (language === 'css') {
        return cssBeautify(code);
    }

    if (language === 'js') {
        return jsBeautify(code);
    }

    return code;
}

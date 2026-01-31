import beautifyJS from 'js-beautify';

const jsBeautify = beautifyJS.js;
const cssBeautify = beautifyJS.css;

/**
 * Beautifies code based on the detected language.
 * Only JS, CSS, and JSON are beautified; other languages return unchanged.
 */
export function beautifyCode(code: string, language: string): string {
    // Only beautify supported languages
    if (!['js', 'css', 'json'].includes(language)) {
        return code;
    }

    if (language === 'css') {
        return cssBeautify(code);
    }

    // JS and JSON both use jsBeautify
    return jsBeautify(code);
}
/**
 * Pretty-prints JSON text without parsing it into JS values.
 *
 * Working on the raw tokens keeps the source exact: big integers
 * (e.g. 12345678901234567890), number formats like 1.0 or 1e5, and
 * duplicate keys are preserved — JSON.parse/stringify would change them.
 *
 * Every opening bracket ends its line and every closing bracket starts
 * its own line, so each object/array gets its own fold marker.
 *
 * Returns null when the input is not valid JSON.
 */
export function formatJson(input: string, indentUnit = '  '): string | null {
    const text = input.replace(/^﻿/, '');

    try {
        JSON.parse(text);
    } catch {
        return null;
    }

    const out: string[] = [];
    let depth = 0;
    let i = 0;
    const len = text.length;

    const newline = () => {
        out.push('\n');
        for (let d = 0; d < depth; d++) out.push(indentUnit);
    };

    while (i < len) {
        const ch = text[i];

        if (ch === '"') {
            // Copy the string token, honouring escapes. The optional "\/"
            // escape (PHP/WordPress output) becomes a plain "/" — same JSON
            // value, but URLs become readable and clickable.
            let j = i + 1;
            let start = i;
            while (j < len) {
                const c = text[j];
                if (c === '\\') {
                    if (text[j + 1] === '/') {
                        out.push(text.slice(start, j));
                        start = j + 1; // drop the backslash, keep the slash
                    }
                    j += 2;
                    continue;
                }
                if (c === '"') break;
                j++;
            }
            out.push(text.slice(start, j + 1));
            i = j + 1;
            continue;
        }

        if (ch === '{' || ch === '[') {
            const close = ch === '{' ? '}' : ']';
            // Keep empty containers compact: {} and []
            let k = i + 1;
            while (k < len && isWhitespace(text[k])) k++;
            if (text[k] === close) {
                out.push(ch + close);
                i = k + 1;
                continue;
            }
            out.push(ch);
            depth++;
            newline();
            i++;
            continue;
        }

        if (ch === '}' || ch === ']') {
            depth--;
            newline();
            out.push(ch);
            i++;
            continue;
        }

        if (ch === ',') {
            out.push(',');
            newline();
            i++;
            continue;
        }

        if (ch === ':') {
            out.push(': ');
            i++;
            continue;
        }

        if (isWhitespace(ch)) {
            i++;
            continue;
        }

        // Literal: number, true, false, null
        let j = i;
        while (j < len && !isDelimiter(text[j])) j++;
        out.push(text.slice(i, j));
        i = j;
    }

    return out.join('');
}

function isWhitespace(ch: string): boolean {
    return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
}

function isDelimiter(ch: string): boolean {
    return isWhitespace(ch) || ch === ',' || ch === ':' || ch === '{' || ch === '}' || ch === '[' || ch === ']' || ch === '"';
}

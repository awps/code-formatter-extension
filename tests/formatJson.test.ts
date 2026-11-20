import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { ensureSyntaxTree, foldable } from '@codemirror/language';
import { formatJson } from '../src/content/utils/formatJson';
import { beautifyCode } from '../src/content/utils/beautify';

function foldableLines(text: string): number[] {
    const state = EditorState.create({ doc: text, extensions: [json()] });
    ensureSyntaxTree(state, state.doc.length, 5000);
    const lines: number[] = [];
    for (let n = 1; n <= state.doc.lines; n++) {
        const line = state.doc.line(n);
        if (foldable(state, line.from, line.to)) lines.push(n);
    }
    return lines;
}

describe('formatJson', () => {
    test('puts every bracket on its own line', () => {
        expect(formatJson('[{"a":1},{"b":2}]')).toBe('[\n  {\n    "a": 1\n  },\n  {\n    "b": 2\n  }\n]');
    });

    test('every object in an array of objects can be collapsed on its own (review bug)', () => {
        const items = Array.from({ length: 6 }, (_, i) => ({ id: i, tags: ['x'], meta: { n: i } }));
        const out = formatJson(JSON.stringify(items))!;
        const state = EditorState.create({ doc: out, extensions: [json()] });
        ensureSyntaxTree(state, state.doc.length, 5000);

        // Each object's fold must start on a line that contains only "{"
        const objectLines = out.split('\n')
            .map((text, i) => ({ text: text.trim(), n: i + 1 }))
            .filter(l => l.text === '{');
        expect(objectLines).toHaveLength(6);
        const folds = foldableLines(out);
        for (const l of objectLines) expect(folds).toContain(l.n);
    });

    test('keeps number text exactly (big ints, exponents, decimals)', () => {
        const src = '{"big":12345678901234567890,"exp":1E+5,"dec":1.50,"neg":-0.0}';
        const out = formatJson(src)!;
        expect(out).toContain('"big": 12345678901234567890');
        expect(out).toContain('"exp": 1E+5');
        expect(out).toContain('"dec": 1.50');
        expect(out).toContain('"neg": -0.0');
    });

    test('keeps strings with escapes, brackets and commas untouched', () => {
        const src = '{"s":"a \\"q\\" [1,2] {x:y} \\\\","u":"\\u00e9"}';
        const out = formatJson(src)!;
        expect(out).toContain('"s": "a \\"q\\" [1,2] {x:y} \\\\"');
        expect(out).toContain('"u": "\\u00e9"');
        expect(JSON.parse(out)).toEqual(JSON.parse(src));
    });

    test('unescapes \\/ (WordPress/PHP style) so URLs are readable', () => {
        const src = '{"\\/oembed\\/1.0":{"href":"https:\\/\\/www.example.com\\/wp-json\\/batch\\/v1"}}';
        const out = formatJson(src)!;
        expect(out).toContain('"/oembed/1.0": {');
        expect(out).toContain('"href": "https://www.example.com/wp-json/batch/v1"');
        expect(JSON.parse(out)).toEqual(JSON.parse(src));
    });

    test('keeps an escaped backslash before a slash intact', () => {
        // "a\\/b" in JSON = a, backslash, slash, b
        const src = '{"p":"a\\\\/b"}';
        const out = formatJson(src)!;
        expect(JSON.parse(out)).toEqual(JSON.parse(src));
        expect(out).toContain('"a\\\\/b"');
    });

    test('keeps empty containers compact', () => {
        expect(formatJson('{"a":{},"b":[ ]}')).toBe('{\n  "a": {},\n  "b": []\n}');
    });

    test('handles primitives and BOM', () => {
        expect(formatJson('42')).toBe('42');
        expect(formatJson('"x"')).toBe('"x"');
        expect(formatJson('﻿{"a":true}')).toBe('{\n  "a": true\n}');
    });

    test('result parses to the same value', () => {
        const value = { a: [1, { b: [null, false, 'x'] }], c: { d: { e: [] } } };
        expect(JSON.parse(formatJson(JSON.stringify(value))!)).toEqual(value);
    });

    test('returns null for invalid JSON', () => {
        expect(formatJson('callback({"a":1})')).toBeNull();
        expect(formatJson('{"a":1,}')).toBeNull();
    });
});

describe('beautifyCode json', () => {
    test('uses the JSON formatter for valid JSON', () => {
        expect(beautifyCode('[{"a":1},{"b":2}]', 'json')).not.toContain('}, {');
    });

    test('falls back to the JS beautifier for JSON-like input', () => {
        const out = beautifyCode('callback({"a":1})', 'json');
        expect(out).toContain('callback');
    });
});

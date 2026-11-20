/**
 * @jest-environment jsdom
 */
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { foldedRanges, codeFolding } from '@codemirror/language';
import { getJsonPath, collapseAll, expandAll, collapseSelected, expandSelected } from '../src/content/components/codeTools';
import { formatJson } from '../src/content/utils/formatJson';

function pathAt(doc: string, needle: string, offset = 1): string | null {
    const state = EditorState.create({ doc, extensions: [json()] });
    const pos = doc.indexOf(needle);
    if (pos < 0) throw new Error(`needle not found: ${needle}`);
    return getJsonPath(state, pos + offset);
}

describe('getJsonPath', () => {
    const doc = formatJson(JSON.stringify({
        users: [
            { name: 'Ann', email: 'ann@x.io' },
            { name: 'Bob', tags: ['admin', 'dev'] },
        ],
        'weird key': { 'a.b': 1 },
        empty: null,
    }))!;

    test('root', () => {
        expect(pathAt(doc, '{', 0)).toBe('$');
    });

    test('property key and its value give the same path', () => {
        expect(pathAt(doc, '"users"')).toBe('$.users');
        expect(pathAt(doc, '"Ann"')).toBe('$.users[0].name');
        expect(pathAt(doc, '"name": "Ann"')).toBe('$.users[0].name');
    });

    test('array indexes count values only', () => {
        expect(pathAt(doc, '"Bob"')).toBe('$.users[1].name');
        expect(pathAt(doc, '"dev"')).toBe('$.users[1].tags[1]');
    });

    test('non-identifier keys use bracket notation', () => {
        expect(pathAt(doc, '1\n')).toBe('$["weird key"]["a.b"]');
    });

    test('null value', () => {
        expect(pathAt(doc, 'null')).toBe('$.empty');
    });

    test('cursor in the indentation resolves the line\'s first token', () => {
        // second user object: its "{" line, cursor at column 0
        const lines = doc.split('\n');
        const n = lines.findIndex((l, i) => i > 3 && l.trim() === '{');
        const state = EditorState.create({ doc, extensions: [json()] });
        expect(getJsonPath(state, state.doc.line(n + 1).from)).toBe('$.users[1]');
    });

        test('cursor right after a value still resolves it', () => {
        expect(pathAt(doc, '"Ann"', 5)).toBe('$.users[0].name');
    });
});

describe('collapseAll / expandAll', () => {
    test('folds every block except the root, then unfolds', () => {
        const doc = formatJson(JSON.stringify({ a: { x: 1 }, b: [1, 2], c: [{ d: 1 }] }))!;
        const view = new EditorView({
            state: EditorState.create({ doc, extensions: [json(), codeFolding()] }),
            parent: document.body,
        });

        collapseAll(view);
        const folded: Array<[number, number]> = [];
        foldedRanges(view.state).between(0, doc.length, (from, to) => { folded.push([from, to]); });

        // a{}, b[], c[], c[0]{} -> 4 folds, root stays open
        expect(folded).toHaveLength(4);
        expect(folded.some(([from]) => from === 1)).toBe(false);

        expandAll(view);
        let count = 0;
        foldedRanges(view.state).between(0, doc.length, () => { count++; });
        expect(count).toBe(0);
        view.destroy();
    });
});

describe('cleanUrl', () => {
    const { cleanUrl } = require('../src/content/components/codeTools');
    test('unescapes JSON slashes and trims punctuation', () => {
        expect(cleanUrl('https:\\/\\/www.example.com\\/wp-json\\/batch\\/v1')).toBe('https://www.example.com/wp-json/batch/v1');
        expect(cleanUrl('https://example.com/a).')).toBe('https://example.com/a');
    });
});

describe('collapseSelected / expandSelected', () => {
    // users[0] has a nested "address" object; users[1] is a sibling
    const doc = formatJson(JSON.stringify({
        users: [
            { name: 'Ann', address: { city: 'X', geo: { lat: 1 } } },
            { name: 'Bob', tags: ['a'] },
        ],
    }))!;

    function makeView(): EditorView {
        return new EditorView({
            state: EditorState.create({ doc, extensions: [json(), codeFolding()] }),
            parent: document.body,
        });
    }
    const folds = (view: EditorView) => {
        const out: Array<[number, number]> = [];
        foldedRanges(view.state).between(0, view.state.doc.length, (f, t) => { out.push([f, t]); });
        return out;
    };
    const cursorAt = (view: EditorView, needle: string) =>
        view.dispatch({ selection: { anchor: view.state.doc.toString().indexOf(needle) + 1 } });

    test('collapse selected folds the block under the cursor and its children only', () => {
        const view = makeView();
        cursorAt(view, '"city"'); // inside address
        collapseSelected(view);
        const f = folds(view);
        // address{} + geo{} folded, nothing else
        expect(f).toHaveLength(2);
        const text = view.state.doc.toString();
        const addressFrom = text.indexOf('"address": {') + '"address": {'.length;
        expect(f.some(([from]) => from === addressFrom)).toBe(true);
        view.destroy();
    });

    test('expand selected opens the block and everything nested, leaving siblings folded', () => {
        const view = makeView();
        collapseAll(view);
        const before = folds(view).length;
        expect(before).toBeGreaterThan(3);

        // cursor on the folded users[0] line
        const text = view.state.doc.toString();
        const firstObjLine = view.state.doc.lineAt(text.indexOf('{', text.indexOf('"users"')));
        view.dispatch({ selection: { anchor: firstObjLine.from + 2 } });
        expandSelected(view);

        const after = folds(view);
        // users[0] and its nested address/geo are open; users[1] (+ tags) still folded
        const user1From = text.indexOf('{', text.indexOf('"Bob"') - 20);
        expect(after.some(([from]) => from > user1From)).toBe(true);
        expect(after.every(([from]) => from > text.indexOf('"Bob"') - 20)).toBe(true);
        view.destroy();
    });

    test('expand selected with nothing folded is a no-op', () => {
        const view = makeView();
        cursorAt(view, '"Bob"');
        expandSelected(view);
        expect(folds(view)).toHaveLength(0);
        view.destroy();
    });
});

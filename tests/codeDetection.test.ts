/**
 * @jest-environment jsdom
 */

import {
    MAX_CODE_LENGTH,
    isValidCodeLength,
    looksLikeCode,
    extractCode,
    getCodeElement,
    createRendererElement,
    hidePreElement,
    showPreElement,
} from '../src/content/utils/codeDetection';

describe('codeDetection utilities', () => {
    describe('MAX_CODE_LENGTH', () => {
        test('should be 100MB', () => {
            expect(MAX_CODE_LENGTH).toBe(100e6);
        });
    });

    describe('isValidCodeLength', () => {
        test('should return true for valid lengths', () => {
            expect(isValidCodeLength(1)).toBe(true);
            expect(isValidCodeLength(1000)).toBe(true);
            expect(isValidCodeLength(MAX_CODE_LENGTH)).toBe(true);
        });

        test('should return false for zero or negative', () => {
            expect(isValidCodeLength(0)).toBe(false);
            expect(isValidCodeLength(-1)).toBe(false);
        });

        test('should return false for length exceeding limit', () => {
            expect(isValidCodeLength(MAX_CODE_LENGTH + 1)).toBe(false);
        });
    });

    describe('looksLikeCode', () => {
        test('should detect JSON-like content', () => {
            expect(looksLikeCode('{"key": "value"}')).toBe(true);
            expect(looksLikeCode('[1, 2, 3]')).toBe(true);
        });

        test('should detect JavaScript keywords', () => {
            expect(looksLikeCode('function test() {}')).toBe(true);
            expect(looksLikeCode('var x = 1;')).toBe(true);
            expect(looksLikeCode('const y = 2;')).toBe(true);
            expect(looksLikeCode('let z = 3;')).toBe(true);
        });

        test('should return false for plain text', () => {
            expect(looksLikeCode('Hello World')).toBe(false);
            expect(looksLikeCode('Some random text here')).toBe(false);
        });
    });

    describe('extractCode', () => {
        test('should extract innerText from pre element', () => {
            const pre = document.createElement('pre');
            pre.textContent = 'const x = 1;';
            expect(extractCode(pre)).toBe('const x = 1;');
        });

        test('should return empty string for empty pre', () => {
            const pre = document.createElement('pre');
            expect(extractCode(pre)).toBe('');
        });
    });

    describe('getCodeElement', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('should return pre element when it is first child', () => {
            const pre = document.createElement('pre');
            pre.textContent = 'code';
            document.body.appendChild(pre);

            const result = getCodeElement();
            expect(result).toBe(pre);
        });

        test('should return null when first child is not pre', () => {
            const div = document.createElement('div');
            document.body.appendChild(div);

            const result = getCodeElement();
            expect(result).toBeNull();
        });

        test('should create pre for plain text code content', () => {
            document.body.innerHTML = '';
            document.body.innerText = '{"key": "value"}';

            const result = getCodeElement();
            expect(result).not.toBeNull();
            expect(result?.tagName).toBe('PRE');
        });
    });

    describe('createRendererElement', () => {
        test('should create renderer div after pre element', () => {
            document.body.innerHTML = '';
            const pre = document.createElement('pre');
            document.body.appendChild(pre);

            const renderer = createRendererElement(pre);
            expect(renderer).not.toBeNull();
            expect(renderer?.id).toBe('code-formatter-renderer');
            expect(renderer?.className).toBe('code-formatter-renderer');
        });
    });

    describe('hidePreElement / showPreElement', () => {
        test('should hide pre element', () => {
            const pre = document.createElement('pre');
            hidePreElement(pre);
            expect(pre.hidden).toBe(true);
            expect(pre.style.display).toBe('none');
        });

        test('should show pre element', () => {
            const pre = document.createElement('pre');
            pre.hidden = true;
            pre.style.display = 'none';

            showPreElement(pre);
            expect(pre.hidden).toBe(false);
            expect(pre.style.display).toBe('block');
        });
    });
});

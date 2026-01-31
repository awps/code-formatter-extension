import { isBase64, decodeBase64, parseLanguageWithBase64 } from '../src/content/utils/base64';

describe('base64 utilities', () => {
    describe('isBase64', () => {
        test('should return true for valid base64 strings', () => {
            expect(isBase64('SGVsbG8gV29ybGQ=')).toBe(true);
            expect(isBase64('dGVzdA==')).toBe(true);
            expect(isBase64('YWJj')).toBe(true);
        });

        test('should return true for base64 with whitespace', () => {
            expect(isBase64('SGVs bG8g V29y bGQ=')).toBe(true);
            expect(isBase64('SGVsbG8g\nV29ybGQ=')).toBe(true);
        });

        test('should return false for non-base64 strings', () => {
            expect(isBase64('Hello World!')).toBe(false);
            expect(isBase64('{"key": "value"}')).toBe(false);
            expect(isBase64('<html></html>')).toBe(false);
        });

        test('should return false for strings with invalid characters', () => {
            expect(isBase64('SGVsbG8@V29ybGQ=')).toBe(false);
            expect(isBase64('test#value')).toBe(false);
        });
    });

    describe('decodeBase64', () => {
        test('should decode valid base64 strings', () => {
            expect(decodeBase64('SGVsbG8gV29ybGQ=')).toBe('Hello World');
            expect(decodeBase64('dGVzdA==')).toBe('test');
            expect(decodeBase64('YWJj')).toBe('abc');
        });

        test('should return null for invalid base64', () => {
            expect(decodeBase64('not-valid-base64!!!')).toBe(null);
        });

        test('should handle empty string', () => {
            expect(decodeBase64('')).toBe('');
        });
    });

    describe('parseLanguageWithBase64', () => {
        test('should extract language and isBase64 flag', () => {
            expect(parseLanguageWithBase64('json:base64')).toEqual({
                language: 'json',
                isBase64: true
            });
            expect(parseLanguageWithBase64('js:base64')).toEqual({
                language: 'js',
                isBase64: true
            });
        });

        test('should handle languages without base64 flag', () => {
            expect(parseLanguageWithBase64('json')).toEqual({
                language: 'json',
                isBase64: false
            });
            expect(parseLanguageWithBase64('py')).toEqual({
                language: 'py',
                isBase64: false
            });
        });

        test('should handle empty string', () => {
            expect(parseLanguageWithBase64('')).toEqual({
                language: '',
                isBase64: false
            });
        });
    });
});

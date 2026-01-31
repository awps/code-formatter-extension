import { beautifyCode } from '../src/content/utils/beautify';

describe('beautifyCode', () => {
    describe('JavaScript beautification', () => {
        test('should beautify minified JavaScript', () => {
            const minified = 'function test(){var x=1;return x+2;}';
            const result = beautifyCode(minified, 'js');
            expect(result).toContain('\n');
            expect(result).toContain('function test()');
        });

        test('should handle already formatted JavaScript', () => {
            const formatted = 'function test() {\n    var x = 1;\n    return x + 2;\n}';
            const result = beautifyCode(formatted, 'js');
            expect(result).toContain('function test()');
        });
    });

    describe('CSS beautification', () => {
        test('should beautify minified CSS', () => {
            const minified = '.class{color:red;margin:0}';
            const result = beautifyCode(minified, 'css');
            expect(result).toContain('\n');
            expect(result).toContain('.class');
        });

        test('should handle multiple selectors', () => {
            const minified = '.a{color:red}.b{color:blue}';
            const result = beautifyCode(minified, 'css');
            expect(result).toContain('.a');
            expect(result).toContain('.b');
        });
    });

    describe('JSON beautification', () => {
        test('should beautify minified JSON', () => {
            const minified = '{"key":"value","number":123}';
            const result = beautifyCode(minified, 'json');
            expect(result).toContain('\n');
            expect(result).toContain('"key"');
        });

        test('should handle arrays', () => {
            const minified = '[1,2,3,{"nested":"value"}]';
            const result = beautifyCode(minified, 'json');
            expect(result).toContain('\n');
        });
    });

    describe('unsupported languages', () => {
        test('should return Python code unchanged', () => {
            const code = 'def test():\n    return 42';
            const result = beautifyCode(code, 'py');
            expect(result).toBe(code);
        });

        test('should return TypeScript code unchanged', () => {
            const code = 'const x: number = 5;';
            const result = beautifyCode(code, 'ts');
            expect(result).toBe(code);
        });

        test('should return Go code unchanged', () => {
            const code = 'package main\nfunc main() {}';
            const result = beautifyCode(code, 'go');
            expect(result).toBe(code);
        });

        test('should return unknown language code unchanged', () => {
            const code = 'some random text';
            const result = beautifyCode(code, 'unknown');
            expect(result).toBe(code);
        });
    });
});

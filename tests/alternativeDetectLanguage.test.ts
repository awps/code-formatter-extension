import { alternativeDetectLanguage } from '../src/content/utils/languageDetection';

describe('alternativeDetectLanguage', () => {
    test('should detect PHP', () => {
        const code = '<?php echo "Hello"; function test() {}';
        expect(alternativeDetectLanguage(code)).toBe('php');
    });

    test('should detect JSON', () => {
        const code = '{"key": "value", "number": 123}';
        expect(alternativeDetectLanguage(code)).toBe('json');
    });

    test('should detect JavaScript (function keyword)', () => {
        const code = 'function calculate() { let x = 5; }';
        expect(alternativeDetectLanguage(code)).toBe('js');
    });

    test('should detect JavaScript (arrow function)', () => {
        const code = 'const add = (a, b) => { return a + b; };';
        expect(alternativeDetectLanguage(code)).toBe('js');
    });

    test('should detect JavaScript (console.log)', () => {
        const code = 'console.log("Debugging");';
        expect(alternativeDetectLanguage(code)).toBe('js');
    });

    test('should detect CSS', () => {
        const code = 'body { color: red; } .class { margin: 0; }';
        expect(alternativeDetectLanguage(code)).toBe('css');
    });

    test('should return unknown for plain text', () => {
        const code = 'This is just some plain text.';
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    test('should return unknown for HTML', () => {
        const code = '<div><h1>Title</h1><p>Paragraph</p></div>';
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    // --- Tests for languages currently expected to be 'unknown' ---

    test('should return unknown for Markdown', () => {
        const code = '# Heading\n* List item';
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    test('should return unknown for XML', () => {
        const code = '<note><to>Tove</to></note>';
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    test('should return unknown for LESS', () => {
        const code = '@width: 10px; .class { width: @width; }';
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    test('should return unknown for SASS/SCSS', () => {
        const code = '$font-stack: Helvetica; body { font: 100% $font-stack; }'; // SCSS syntax
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    test('should detect Python', () => {
        const code = 'def greet(name):\n  print(f"Hello, {name}!")';
        expect(alternativeDetectLanguage(code)).toBe('python');
    });

    test('should return unknown for SQL', () => {
        const code = 'SELECT * FROM users WHERE id = 1;';
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    test('should return unknown for YAML', () => {
        const code = 'key:\n  subkey: value';
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    test('should detect Go', () => {
        const code = 'package main\nimport "fmt"\nfunc main() { fmt.Println("hello") }';
        expect(alternativeDetectLanguage(code)).toBe('go');
    });

    test('should return unknown for Rust', () => {
        const code = 'fn main() { println!("Hello, world!"); }';
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    test('should detect Java', () => {
        const code = 'public class HelloWorld { public static void main(String[] args) { System.out.println("Hello"); } }';
        expect(alternativeDetectLanguage(code)).toBe('java');
    });

    test('should return unknown for C++', () => {
        const code = '#include <iostream>\nint main() { std::cout << "Hello"; return 0; }';
        expect(alternativeDetectLanguage(code)).toBe('unknown');
    });

    test('should detect C#', () => {
        const code = 'using System; class P { static void Main() { Console.WriteLine("Hello"); } }';
        expect(alternativeDetectLanguage(code)).toBe('csharp');
    });

    // Add more specific test cases as needed
}); 
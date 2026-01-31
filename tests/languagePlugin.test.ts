import { getLanguageExtension, supportedLanguages } from '../src/content/utils/languagePlugin';

// Mock the CodeMirror language packages
jest.mock('@codemirror/lang-javascript', () => ({ javascript: jest.fn(() => 'javascript-ext') }));
jest.mock('@codemirror/lang-css', () => ({ css: jest.fn(() => 'css-ext') }));
jest.mock('@codemirror/lang-json', () => ({ json: jest.fn(() => 'json-ext') }));
jest.mock('@codemirror/lang-php', () => ({ php: jest.fn(() => 'php-ext') }));
jest.mock('@codemirror/lang-markdown', () => ({ markdown: jest.fn(() => 'markdown-ext') }));
jest.mock('@codemirror/lang-xml', () => ({ xml: jest.fn(() => 'xml-ext') }));
jest.mock('@codemirror/lang-less', () => ({ less: jest.fn(() => 'less-ext') }));
jest.mock('@codemirror/lang-sass', () => ({ sass: jest.fn(() => 'sass-ext') }));
jest.mock('@codemirror/lang-python', () => ({ python: jest.fn(() => 'python-ext') }));
jest.mock('@codemirror/lang-sql', () => ({ sql: jest.fn(() => 'sql-ext') }));
jest.mock('@codemirror/lang-yaml', () => ({ yaml: jest.fn(() => 'yaml-ext') }));
jest.mock('@codemirror/lang-go', () => ({ go: jest.fn(() => 'go-ext') }));
jest.mock('@codemirror/lang-rust', () => ({ rust: jest.fn(() => 'rust-ext') }));
jest.mock('@codemirror/lang-java', () => ({ java: jest.fn(() => 'java-ext') }));
jest.mock('@codemirror/lang-cpp', () => ({ cpp: jest.fn(() => 'cpp-ext') }));
jest.mock('@replit/codemirror-lang-csharp', () => ({ csharp: jest.fn(() => 'csharp-ext') }));

describe('languagePlugin', () => {
    describe('getLanguageExtension', () => {
        test('should return json extension for json', () => {
            const ext = getLanguageExtension('json');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('json-ext');
        });

        test('should return css extension for css', () => {
            const ext = getLanguageExtension('css');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('css-ext');
        });

        test('should return javascript extension for js variants', () => {
            expect(getLanguageExtension('js')).not.toBeNull();
            expect(getLanguageExtension('ts')).not.toBeNull();
            expect(getLanguageExtension('jsx')).not.toBeNull();
            expect(getLanguageExtension('tsx')).not.toBeNull();
        });

        test('should return php extension for php', () => {
            const ext = getLanguageExtension('php');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('php-ext');
        });

        test('should return markdown extension for md', () => {
            const ext = getLanguageExtension('md');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('markdown-ext');
        });

        test('should return xml extension for xml', () => {
            const ext = getLanguageExtension('xml');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('xml-ext');
        });

        test('should return yaml extension for yaml and yml', () => {
            expect(getLanguageExtension('yaml')).not.toBeNull();
            expect(getLanguageExtension('yml')).not.toBeNull();
        });

        test('should return python extension for py', () => {
            const ext = getLanguageExtension('py');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('python-ext');
        });

        test('should return go extension for go', () => {
            const ext = getLanguageExtension('go');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('go-ext');
        });

        test('should return cpp extension for cpp variants', () => {
            expect(getLanguageExtension('cpp')).not.toBeNull();
            expect(getLanguageExtension('cxx')).not.toBeNull();
            expect(getLanguageExtension('cc')).not.toBeNull();
        });

        test('should return rust extension for rs', () => {
            const ext = getLanguageExtension('rs');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('rust-ext');
        });

        test('should return java extension for java', () => {
            const ext = getLanguageExtension('java');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('java-ext');
        });

        test('should return csharp extension for cs', () => {
            const ext = getLanguageExtension('cs');
            expect(ext).not.toBeNull();
            expect(ext!()).toBe('csharp-ext');
        });

        test('should return null for unsupported languages', () => {
            expect(getLanguageExtension('unknown')).toBeNull();
            expect(getLanguageExtension('ruby')).toBeNull();
            expect(getLanguageExtension('')).toBeNull();
        });
    });

    describe('supportedLanguages', () => {
        test('should include all expected languages', () => {
            expect(supportedLanguages).toContain('json');
            expect(supportedLanguages).toContain('css');
            expect(supportedLanguages).toContain('js');
            expect(supportedLanguages).toContain('ts');
            expect(supportedLanguages).toContain('py');
            expect(supportedLanguages).toContain('go');
            expect(supportedLanguages).toContain('rs');
            expect(supportedLanguages).toContain('java');
            expect(supportedLanguages).toContain('cs');
        });

        test('should have correct number of languages', () => {
            expect(supportedLanguages.length).toBeGreaterThanOrEqual(20);
        });
    });
});

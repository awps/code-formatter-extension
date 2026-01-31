import {
    generateThemeItemsHtml,
    generateViewItemsHtml,
    generateToolbarHtml,
    ToolbarConfig
} from '../src/content/components/toolbar';
import { Settings } from '../src/shared/types/settings';

// Mock thememirror
jest.mock('thememirror', () => ({
    dracula: { name: 'dracula' },
    amy: { name: 'amy' },
    ayuLight: { name: 'ayuLight' },
    barf: { name: 'barf' },
    bespin: { name: 'bespin' },
    birdsOfParadise: { name: 'birdsOfParadise' },
    boysAndGirls: { name: 'boysAndGirls' },
    clouds: { name: 'clouds' },
    cobalt: { name: 'cobalt' },
    coolGlow: { name: 'coolGlow' },
    espresso: { name: 'espresso' },
    noctisLilac: { name: 'noctisLilac' },
    rosePineDawn: { name: 'rosePineDawn' },
    smoothy: { name: 'smoothy' },
    solarizedLight: { name: 'solarizedLight' },
    tomorrow: { name: 'tomorrow' },
}));

describe('toolbar component', () => {
    describe('generateThemeItemsHtml', () => {
        test('should generate HTML for all themes', () => {
            const html = generateThemeItemsHtml('dracula');
            expect(html).toContain('data-theme="dracula"');
            expect(html).toContain('data-theme="amy"');
            expect(html).toContain('data-theme="cobalt"');
        });

        test('should mark current theme as selected', () => {
            const html = generateThemeItemsHtml('amy');
            expect(html).toContain('data-theme="amy"');
            // Check that amy has the selected class (class comes before data-theme)
            expect(html).toMatch(/--selected"[^>]*data-theme="amy"/);
        });

        test('should use filled circle for selected theme', () => {
            const html = generateThemeItemsHtml('dracula');
            // The selected theme should have ● marker
            expect(html).toContain('●');
            // Non-selected themes should have ○ marker
            expect(html).toContain('○');
        });
    });

    describe('generateViewItemsHtml', () => {
        const i18n = {
            lineNumbers: 'Line Numbers',
            wordWrap: 'Word Wrap'
        };

        test('should generate HTML for view settings', () => {
            const settings: Settings = { theme: 'dracula', lineNumbers: true, wordWrap: false };
            const html = generateViewItemsHtml(settings, i18n);

            expect(html).toContain('data-setting="lineNumbers"');
            expect(html).toContain('data-setting="wordWrap"');
            expect(html).toContain('Line Numbers');
            expect(html).toContain('Word Wrap');
        });

        test('should show checked state for enabled settings', () => {
            const settings: Settings = { theme: 'dracula', lineNumbers: true, wordWrap: false };
            const html = generateViewItemsHtml(settings, i18n);

            // lineNumbers is checked
            expect(html).toContain('☑');
            // wordWrap is unchecked
            expect(html).toContain('☐');
        });

        test('should reflect settings state correctly', () => {
            const settings: Settings = { theme: 'dracula', lineNumbers: false, wordWrap: true };
            const html = generateViewItemsHtml(settings, i18n);

            // Should have checked class for wordWrap (class comes before data-setting)
            expect(html).toMatch(/--checked"[^>]*data-setting="wordWrap"/);
        });
    });

    describe('generateToolbarHtml', () => {
        const mockConfig: ToolbarConfig = {
            logo: '<svg>Logo</svg>',
            i18n: {
                extShortName: 'Code Formatter',
                copy: 'Copy',
                download: 'Download',
                showOriginal: 'Show Original',
                showFormatted: 'Show Formatted',
                theme: 'Theme',
                view: 'View',
                lineNumbers: 'Line Numbers',
                wordWrap: 'Word Wrap'
            },
            settings: {
                theme: 'dracula',
                lineNumbers: true,
                wordWrap: false
            }
        };

        test('should generate complete toolbar HTML', () => {
            const html = generateToolbarHtml(mockConfig);

            expect(html).toContain('code-formatter-toolbar');
            expect(html).toContain('<svg>Logo</svg>');
            expect(html).toContain('Code Formatter');
        });

        test('should include all buttons', () => {
            const html = generateToolbarHtml(mockConfig);

            expect(html).toContain('id="code-formatter-switcher-button"');
            expect(html).toContain('id="code-formatter-toolbar-button-copy"');
            expect(html).toContain('id="code-formatter-toolbar-button-download"');
        });

        test('should include dropdowns', () => {
            const html = generateToolbarHtml(mockConfig);

            expect(html).toContain('id="theme-dropdown-menu"');
            expect(html).toContain('id="view-dropdown-menu"');
            expect(html).toContain('id="theme-dropdown-trigger"');
            expect(html).toContain('id="view-dropdown-trigger"');
        });

        test('should include i18n text', () => {
            const html = generateToolbarHtml(mockConfig);

            expect(html).toContain('Copy');
            expect(html).toContain('Download');
            expect(html).toContain('Show Original');
            expect(html).toContain('Theme');
            expect(html).toContain('View');
        });
    });
});

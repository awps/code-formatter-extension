import {
    generateThemeItemsHtml,
    generateViewItemsHtml,
    generateToolbarHtml,
    ToolbarConfig
} from '../src/content/components/toolbar';
import { Settings } from '../src/shared/types/settings';

// Mock @fsegurai theme packages
jest.mock('@fsegurai/codemirror-theme-github-light', () => ({ githubLight: { name: 'githubLight' } }));
jest.mock('@fsegurai/codemirror-theme-github-dark', () => ({ githubDark: { name: 'githubDark' } }));
jest.mock('@fsegurai/codemirror-theme-vscode-light', () => ({ vsCodeLight: { name: 'vsCodeLight' } }));
jest.mock('@fsegurai/codemirror-theme-vscode-dark', () => ({ vsCodeDark: { name: 'vsCodeDark' } }));
jest.mock('@fsegurai/codemirror-theme-nord', () => ({ nord: { name: 'nord' } }));
jest.mock('@fsegurai/codemirror-theme-monokai', () => ({ monokai: { name: 'monokai' } }));
jest.mock('@fsegurai/codemirror-theme-material-light', () => ({ materialLight: { name: 'materialLight' } }));
jest.mock('@fsegurai/codemirror-theme-material-dark', () => ({ materialDark: { name: 'materialDark' } }));
jest.mock('@fsegurai/codemirror-theme-solarized-light', () => ({ solarizedLight: { name: 'solarizedLight' } }));
jest.mock('@fsegurai/codemirror-theme-solarized-dark', () => ({ solarizedDark: { name: 'solarizedDark' } }));
jest.mock('@fsegurai/codemirror-theme-gruvbox-light', () => ({ gruvboxLight: { name: 'gruvboxLight' } }));
jest.mock('@fsegurai/codemirror-theme-gruvbox-dark', () => ({ gruvboxDark: { name: 'gruvboxDark' } }));
jest.mock('@fsegurai/codemirror-theme-tokyo-night-day', () => ({ tokyoNightDay: { name: 'tokyoNightDay' } }));
jest.mock('@fsegurai/codemirror-theme-tokyo-night-storm', () => ({ tokyoNightStorm: { name: 'tokyoNightStorm' } }));
jest.mock('@fsegurai/codemirror-theme-palenight', () => ({ palenight: { name: 'palenight' } }));
jest.mock('@fsegurai/codemirror-theme-andromeda', () => ({ andromeda: { name: 'andromeda' } }));
jest.mock('@fsegurai/codemirror-theme-abyss', () => ({ abyss: { name: 'abyss' } }));
jest.mock('@fsegurai/codemirror-theme-cobalt2', () => ({ cobalt2: { name: 'cobalt2' } }));
jest.mock('@fsegurai/codemirror-theme-forest', () => ({ forest: { name: 'forest' } }));
jest.mock('@fsegurai/codemirror-theme-volcano', () => ({ volcano: { name: 'volcano' } }));
jest.mock('@fsegurai/codemirror-theme-android-studio', () => ({ androidStudio: { name: 'androidStudio' } }));
jest.mock('@fsegurai/codemirror-theme-abcdef', () => ({ abcdef: { name: 'abcdef' } }));
jest.mock('@fsegurai/codemirror-theme-basic-dark', () => ({ basicDark: { name: 'basicDark' } }));

describe('toolbar component', () => {
    describe('generateThemeItemsHtml', () => {
        test('should generate HTML for all themes', () => {
            const html = generateThemeItemsHtml('githubDark');
            expect(html).toContain('data-theme="githubDark"');
            expect(html).toContain('data-theme="nord"');
            expect(html).toContain('data-theme="monokai"');
        });

        test('should mark current theme as selected', () => {
            const html = generateThemeItemsHtml('nord');
            expect(html).toContain('data-theme="nord"');
            // Check that nord has the selected class (class comes before data-theme)
            expect(html).toMatch(/--selected"[^>]*data-theme="nord"/);
        });

        test('should use filled circle for selected theme', () => {
            const html = generateThemeItemsHtml('githubDark');
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
            const settings: Settings = { theme: 'githubDark', lineNumbers: true, wordWrap: false };
            const html = generateViewItemsHtml(settings, i18n);

            expect(html).toContain('data-setting="lineNumbers"');
            expect(html).toContain('data-setting="wordWrap"');
            expect(html).toContain('Line Numbers');
            expect(html).toContain('Word Wrap');
        });

        test('should show checked state for enabled settings', () => {
            const settings: Settings = { theme: 'githubDark', lineNumbers: true, wordWrap: false };
            const html = generateViewItemsHtml(settings, i18n);

            // lineNumbers toggle is on
            expect(html).toContain('code-formatter-toolbar__toggle--on');
            // Verify toggle structure exists
            expect(html).toContain('code-formatter-toolbar__toggle-track');
            expect(html).toContain('code-formatter-toolbar__toggle-thumb');
        });

        test('should reflect settings state correctly', () => {
            const settings: Settings = { theme: 'githubDark', lineNumbers: false, wordWrap: true };
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
                theme: 'githubDark',
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

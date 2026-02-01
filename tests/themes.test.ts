import { ThemeKey } from '../src/shared/types/settings';

// Mock @fsegurai theme packages since Jest can't handle ES modules
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

// Import after mock
import { getTheme, themeMap, themeLabels } from '../src/shared/utils/themes';

describe('themes utilities', () => {
    describe('themeMap', () => {
        test('should have 23 themes', () => {
            expect(Object.keys(themeMap)).toHaveLength(23);
        });

        test('should include githubDark theme', () => {
            expect(themeMap.githubDark).toBeDefined();
        });

        test('should include all expected themes', () => {
            const expectedThemes: ThemeKey[] = [
                'githubLight', 'githubDark', 'vsCodeLight', 'vsCodeDark', 'nord', 'monokai',
                'materialLight', 'materialDark', 'solarizedLight', 'solarizedDark',
                'gruvboxLight', 'gruvboxDark', 'tokyoNightDay', 'tokyoNightStorm',
                'palenight', 'andromeda', 'abyss', 'cobalt2', 'forest', 'volcano',
                'androidStudio', 'abcdef', 'basicDark'
            ];

            expectedThemes.forEach(theme => {
                expect(themeMap[theme]).toBeDefined();
            });
        });
    });

    describe('themeLabels', () => {
        test('should have labels for all themes', () => {
            expect(Object.keys(themeLabels)).toHaveLength(23);
        });

        test('should have human-readable labels', () => {
            expect(themeLabels.githubDark).toBe('GitHub Dark');
            expect(themeLabels.vsCodeLight).toBe('VS Code Light');
            expect(themeLabels.tokyoNightStorm).toBe('Tokyo Night Storm');
            expect(themeLabels.androidStudio).toBe('Android Studio');
        });
    });

    describe('getTheme', () => {
        test('should return the correct theme for valid keys', () => {
            expect(getTheme('githubDark')).toBe(themeMap.githubDark);
            expect(getTheme('nord')).toBe(themeMap.nord);
            expect(getTheme('monokai')).toBe(themeMap.monokai);
        });

        test('should return githubDark as fallback for invalid keys', () => {
            expect(getTheme('nonexistent' as ThemeKey)).toBe(themeMap.githubDark);
        });
    });
});

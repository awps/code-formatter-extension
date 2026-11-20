import { defaultSettings, ThemeKey, normalizeSettings, activeTheme, resolveTone, themeTone, LIGHT_THEMES } from '../src/shared/types/settings';

describe('settings types', () => {
    describe('defaultSettings', () => {
        test('should follow the device with GitHub themes by default', () => {
            expect(defaultSettings.appearance).toBe('auto');
            expect(defaultSettings.lightTheme).toBe('githubLight');
            expect(defaultSettings.darkTheme).toBe('githubDark');
        });

        test('should have line numbers enabled by default', () => {
            expect(defaultSettings.lineNumbers).toBe(true);
        });

        test('should have word wrap disabled by default', () => {
            expect(defaultSettings.wordWrap).toBe(false);
        });
    });

    describe('ThemeKey type', () => {
        test('should accept valid theme keys', () => {
            const validThemes: ThemeKey[] = [
                'githubLight', 'githubDark', 'vsCodeLight', 'vsCodeDark', 'nord', 'monokai',
                'materialLight', 'materialDark', 'solarizedLight', 'solarizedDark',
                'gruvboxLight', 'gruvboxDark', 'tokyoNightDay', 'tokyoNightStorm',
                'palenight', 'andromeda', 'abyss', 'cobalt2', 'forest', 'volcano',
                'androidStudio', 'abcdef', 'basicDark'
            ];

            // This test primarily validates at compile time
            expect(validThemes).toHaveLength(23);
        });
    });
});

describe('appearance', () => {
    test('auto follows the device', () => {
        const s = normalizeSettings({ appearance: 'auto', lightTheme: 'solarizedLight', darkTheme: 'nord' });
        expect(resolveTone(s, false)).toBe('light');
        expect(resolveTone(s, true)).toBe('dark');
        expect(activeTheme(s, false)).toBe('solarizedLight');
        expect(activeTheme(s, true)).toBe('nord');
    });

    test('light and dark ignore the device', () => {
        const light = normalizeSettings({ appearance: 'light' });
        const dark = normalizeSettings({ appearance: 'dark' });
        expect(activeTheme(light, true)).toBe('githubLight');
        expect(activeTheme(dark, false)).toBe('githubDark');
    });

    test('every theme has a tone and six are light', () => {
        expect(LIGHT_THEMES).toHaveLength(6);
        expect(themeTone('tokyoNightDay')).toBe('light');
        expect(themeTone('abcdef')).toBe('dark');
    });

    test('legacy single theme keeps its look', () => {
        expect(normalizeSettings({ theme: 'gruvboxLight' })).toMatchObject({ appearance: 'light', lightTheme: 'gruvboxLight' });
        expect(normalizeSettings({ theme: 'cobalt2' })).toMatchObject({ appearance: 'dark', darkTheme: 'cobalt2' });
    });

    test('a theme in the wrong slot or junk falls back to defaults', () => {
        const s = normalizeSettings({ appearance: 'auto', lightTheme: 'monokai', darkTheme: 'githubLight' });
        expect(s.lightTheme).toBe('githubLight');
        expect(s.darkTheme).toBe('githubDark');
        expect(normalizeSettings(null)).toEqual(defaultSettings);
        expect(normalizeSettings({ appearance: 'purple' }).appearance).toBe('auto');
    });
});

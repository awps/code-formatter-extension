import { defaultSettings, ThemeKey } from '../src/shared/types/settings';

describe('settings types', () => {
    describe('defaultSettings', () => {
        test('should have githubDark as default theme', () => {
            expect(defaultSettings.theme).toBe('githubDark');
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

import { defaultSettings, ThemeKey } from '../src/types/settings';

describe('settings types', () => {
    describe('defaultSettings', () => {
        test('should have dracula as default theme', () => {
            expect(defaultSettings.theme).toBe('dracula');
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
                'dracula', 'amy', 'ayuLight', 'barf', 'bespin',
                'birdsOfParadise', 'boysAndGirls', 'clouds', 'cobalt',
                'coolGlow', 'espresso', 'noctisLilac', 'rosePineDawn',
                'smoothy', 'solarizedLight', 'tomorrow'
            ];

            // This test primarily validates at compile time
            expect(validThemes).toHaveLength(16);
        });
    });
});
import { ThemeKey } from '../src/shared/types/settings';

// Mock thememirror since Jest can't handle ES modules
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

// Import after mock
import { getTheme, themeMap, themeLabels } from '../src/shared/utils/themes';

describe('themes utilities', () => {
    describe('themeMap', () => {
        test('should have 16 themes', () => {
            expect(Object.keys(themeMap)).toHaveLength(16);
        });

        test('should include dracula theme', () => {
            expect(themeMap.dracula).toBeDefined();
        });

        test('should include all expected themes', () => {
            const expectedThemes: ThemeKey[] = [
                'dracula', 'amy', 'ayuLight', 'barf', 'bespin',
                'birdsOfParadise', 'boysAndGirls', 'clouds', 'cobalt',
                'coolGlow', 'espresso', 'noctisLilac', 'rosePineDawn',
                'smoothy', 'solarizedLight', 'tomorrow'
            ];

            expectedThemes.forEach(theme => {
                expect(themeMap[theme]).toBeDefined();
            });
        });
    });

    describe('themeLabels', () => {
        test('should have labels for all themes', () => {
            expect(Object.keys(themeLabels)).toHaveLength(16);
        });

        test('should have human-readable labels', () => {
            expect(themeLabels.dracula).toBe('Dracula');
            expect(themeLabels.ayuLight).toBe('Ayu Light');
            expect(themeLabels.birdsOfParadise).toBe('Birds of Paradise');
            expect(themeLabels.rosePineDawn).toBe('Rose Pine Dawn');
        });
    });

    describe('getTheme', () => {
        test('should return the correct theme for valid keys', () => {
            expect(getTheme('dracula')).toBe(themeMap.dracula);
            expect(getTheme('amy')).toBe(themeMap.amy);
            expect(getTheme('cobalt')).toBe(themeMap.cobalt);
        });

        test('should return dracula as fallback for invalid keys', () => {
            expect(getTheme('nonexistent' as ThemeKey)).toBe(themeMap.dracula);
        });
    });
});
import { loadSettings, saveSettings } from '../src/shared/utils/storage';
import { defaultSettings } from '../src/shared/types/settings';

// Mock chrome.storage.sync
const mockStorage: Record<string, unknown> = {};

const mockChrome = {
    storage: {
        sync: {
            get: jest.fn((key: string, callback: (result: Record<string, unknown>) => void) => {
                callback({ [key]: mockStorage[key] });
            }),
            set: jest.fn((data: Record<string, unknown>, callback: () => void) => {
                Object.assign(mockStorage, data);
                callback();
            }),
        },
    },
    runtime: {
        lastError: null as Error | null,
    },
};

// @ts-expect-error - mocking global chrome
global.chrome = mockChrome;

describe('storage utilities', () => {
    beforeEach(() => {
        // Clear mock storage before each test
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
        jest.clearAllMocks();
        mockChrome.runtime.lastError = null;
    });

    describe('loadSettings', () => {
        test('should return default settings when storage is empty', async () => {
            const settings = await loadSettings();
            expect(settings).toEqual(defaultSettings);
        });

        test('should return stored settings when available', async () => {
            mockStorage['codeFormatterSettings'] = {
                appearance: 'dark',
                lightTheme: 'githubLight',
                darkTheme: 'nord',
                lineNumbers: false,
                wordWrap: true,
            };

            const settings = await loadSettings();
            expect(settings.appearance).toBe('dark');
            expect(settings.darkTheme).toBe('nord');
            expect(settings.lineNumbers).toBe(false);
            expect(settings.wordWrap).toBe(true);
        });

        test('should migrate a saved single theme and keep its look', async () => {
            mockStorage['codeFormatterSettings'] = {
                theme: 'monokai',
            };

            const settings = await loadSettings();
            expect(settings.appearance).toBe('dark');
            expect(settings.darkTheme).toBe('monokai');
            expect(settings.lightTheme).toBe(defaultSettings.lightTheme);
            expect(settings.lineNumbers).toBe(defaultSettings.lineNumbers);
            expect(settings.wordWrap).toBe(defaultSettings.wordWrap);
        });
    });

    describe('saveSettings', () => {
        test('should save partial settings', async () => {
            const result = await saveSettings({ darkTheme: 'palenight' });

            expect(result.darkTheme).toBe('palenight');
            expect(result.appearance).toBe(defaultSettings.appearance);
            expect(result.lineNumbers).toBe(defaultSettings.lineNumbers);
            expect(result.wordWrap).toBe(defaultSettings.wordWrap);
        });

        test('should merge with existing settings', async () => {
            mockStorage['codeFormatterSettings'] = {
                appearance: 'light',
                lightTheme: 'solarizedLight',
                darkTheme: 'githubDark',
                lineNumbers: true,
                wordWrap: false,
            };

            const result = await saveSettings({ wordWrap: true });

            expect(result.appearance).toBe('light');
            expect(result.lightTheme).toBe('solarizedLight');
            expect(result.lineNumbers).toBe(true);
            expect(result.wordWrap).toBe(true);
        });

        test('should call chrome.storage.sync.set', async () => {
            await saveSettings({ darkTheme: 'solarizedDark' });

            expect(mockChrome.storage.sync.set).toHaveBeenCalled();
        });
    });
});

describe('storage after the extension context is invalidated', () => {
    test('load and save resolve instead of throwing', async () => {
        const original = (global as any).chrome;
        const boom = () => { throw new Error('Extension context invalidated.'); };
        (global as any).chrome = { storage: { sync: { get: boom, set: boom } }, runtime: {} };
        const { loadSettings, saveSettings } = require('../src/shared/utils/storage');
        const { defaultSettings } = require('../src/shared/types/settings');
        await expect(loadSettings()).resolves.toEqual(defaultSettings);
        await expect(saveSettings({ wordWrap: true })).resolves.toMatchObject({ wordWrap: true });
        (global as any).chrome = original;
    });
});

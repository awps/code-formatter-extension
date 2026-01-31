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
                theme: 'amy',
                lineNumbers: false,
                wordWrap: true,
            };

            const settings = await loadSettings();
            expect(settings.theme).toBe('amy');
            expect(settings.lineNumbers).toBe(false);
            expect(settings.wordWrap).toBe(true);
        });

        test('should merge stored settings with defaults', async () => {
            mockStorage['codeFormatterSettings'] = {
                theme: 'cobalt',
            };

            const settings = await loadSettings();
            expect(settings.theme).toBe('cobalt');
            expect(settings.lineNumbers).toBe(defaultSettings.lineNumbers);
            expect(settings.wordWrap).toBe(defaultSettings.wordWrap);
        });
    });

    describe('saveSettings', () => {
        test('should save partial settings', async () => {
            const result = await saveSettings({ theme: 'barf' });

            expect(result.theme).toBe('barf');
            expect(result.lineNumbers).toBe(defaultSettings.lineNumbers);
            expect(result.wordWrap).toBe(defaultSettings.wordWrap);
        });

        test('should merge with existing settings', async () => {
            mockStorage['codeFormatterSettings'] = {
                theme: 'dracula',
                lineNumbers: true,
                wordWrap: false,
            };

            const result = await saveSettings({ wordWrap: true });

            expect(result.theme).toBe('dracula');
            expect(result.lineNumbers).toBe(true);
            expect(result.wordWrap).toBe(true);
        });

        test('should call chrome.storage.sync.set', async () => {
            await saveSettings({ theme: 'espresso' });

            expect(mockChrome.storage.sync.set).toHaveBeenCalled();
        });
    });
});
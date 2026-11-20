export type ThemeKey =
    | 'githubLight'
    | 'githubDark'
    | 'vsCodeLight'
    | 'vsCodeDark'
    | 'nord'
    | 'monokai'
    | 'materialLight'
    | 'materialDark'
    | 'solarizedLight'
    | 'solarizedDark'
    | 'gruvboxLight'
    | 'gruvboxDark'
    | 'tokyoNightDay'
    | 'tokyoNightStorm'
    | 'palenight'
    | 'andromeda'
    | 'abyss'
    | 'cobalt2'
    | 'forest'
    | 'volcano'
    | 'androidStudio'
    | 'abcdef'
    | 'basicDark';

/** auto = follow the device's light/dark setting */
export type Appearance = 'auto' | 'light' | 'dark';
export type Tone = 'light' | 'dark';

export interface Settings {
    appearance: Appearance;
    /** Code theme used when the appearance is light */
    lightTheme: ThemeKey;
    /** Code theme used when the appearance is dark */
    darkTheme: ThemeKey;
    lineNumbers: boolean;
    wordWrap: boolean;
}

export const defaultSettings: Settings = {
    appearance: 'auto',
    lightTheme: 'githubLight',
    darkTheme: 'githubDark',
    lineNumbers: true,
    wordWrap: false,
};

/** Themes with a light background. Every other theme is dark. */
export const LIGHT_THEMES: readonly ThemeKey[] = [
    'githubLight',
    'vsCodeLight',
    'materialLight',
    'solarizedLight',
    'gruvboxLight',
    'tokyoNightDay',
];

export function themeTone(theme: ThemeKey): Tone {
    return LIGHT_THEMES.includes(theme) ? 'light' : 'dark';
}

/** The tone in use: the device's for auto, otherwise the chosen one. */
export function resolveTone(settings: Settings, deviceIsDark: boolean): Tone {
    if (settings.appearance === 'auto') return deviceIsDark ? 'dark' : 'light';
    return settings.appearance;
}

/** The code theme in use right now. */
export function activeTheme(settings: Settings, deviceIsDark: boolean): ThemeKey {
    return resolveTone(settings, deviceIsDark) === 'light' ? settings.lightTheme : settings.darkTheme;
}

const APPEARANCES: readonly Appearance[] = ['auto', 'light', 'dark'];

/**
 * Turns whatever is stored into valid settings. Settings saved before
 * appearance existed had a single `theme`: keep that look by using its
 * tone as the appearance and the theme as that tone's choice.
 */
export function normalizeSettings(raw: unknown): Settings {
    const stored = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const result: Settings = { ...defaultSettings };

    if (typeof stored.lineNumbers === 'boolean') result.lineNumbers = stored.lineNumbers;
    if (typeof stored.wordWrap === 'boolean') result.wordWrap = stored.wordWrap;

    const isTheme = (value: unknown): value is ThemeKey => typeof value === 'string' && value.length > 0;

    if (APPEARANCES.includes(stored.appearance as Appearance)) {
        result.appearance = stored.appearance as Appearance;
        if (isTheme(stored.lightTheme) && themeTone(stored.lightTheme) === 'light') result.lightTheme = stored.lightTheme;
        if (isTheme(stored.darkTheme) && themeTone(stored.darkTheme) === 'dark') result.darkTheme = stored.darkTheme;
    } else if (isTheme(stored.theme)) {
        // Legacy single theme
        const tone = themeTone(stored.theme);
        result.appearance = tone;
        if (tone === 'light') result.lightTheme = stored.theme;
        else result.darkTheme = stored.theme;
    }

    return result;
}

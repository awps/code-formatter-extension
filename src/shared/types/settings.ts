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

export interface Settings {
    theme: ThemeKey;
    lineNumbers: boolean;
    wordWrap: boolean;
}

export const defaultSettings: Settings = {
    theme: 'githubDark',
    lineNumbers: true,
    wordWrap: false,
};

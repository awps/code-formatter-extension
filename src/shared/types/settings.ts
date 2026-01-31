export type ThemeKey =
    | 'dracula'
    | 'amy'
    | 'ayuLight'
    | 'barf'
    | 'bespin'
    | 'birdsOfParadise'
    | 'boysAndGirls'
    | 'clouds'
    | 'cobalt'
    | 'coolGlow'
    | 'espresso'
    | 'noctisLilac'
    | 'rosePineDawn'
    | 'smoothy'
    | 'solarizedLight'
    | 'tomorrow';

export interface Settings {
    theme: ThemeKey;
    lineNumbers: boolean;
    wordWrap: boolean;
}

export const defaultSettings: Settings = {
    theme: 'dracula',
    lineNumbers: true,
    wordWrap: false,
};
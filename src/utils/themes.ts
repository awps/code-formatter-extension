import { Extension } from '@codemirror/state';
import { ThemeKey } from '../types/settings';
import {
    dracula,
    amy,
    ayuLight,
    barf,
    bespin,
    birdsOfParadise,
    boysAndGirls,
    clouds,
    cobalt,
    coolGlow,
    espresso,
    noctisLilac,
    rosePineDawn,
    smoothy,
    solarizedLight,
    tomorrow,
} from 'thememirror';

export const themeMap: Record<ThemeKey, Extension> = {
    dracula,
    amy,
    ayuLight,
    barf,
    bespin,
    birdsOfParadise,
    boysAndGirls,
    clouds,
    cobalt,
    coolGlow,
    espresso,
    noctisLilac,
    rosePineDawn,
    smoothy,
    solarizedLight,
    tomorrow,
};

export const themeLabels: Record<ThemeKey, string> = {
    dracula: 'Dracula',
    amy: 'Amy',
    ayuLight: 'Ayu Light',
    barf: 'Barf',
    bespin: 'Bespin',
    birdsOfParadise: 'Birds of Paradise',
    boysAndGirls: 'Boys and Girls',
    clouds: 'Clouds',
    cobalt: 'Cobalt',
    coolGlow: 'Cool Glow',
    espresso: 'Espresso',
    noctisLilac: 'Noctis Lilac',
    rosePineDawn: 'Rose Pine Dawn',
    smoothy: 'Smoothy',
    solarizedLight: 'Solarized Light',
    tomorrow: 'Tomorrow',
};

export function getTheme(key: ThemeKey): Extension {
    return themeMap[key] || dracula;
}
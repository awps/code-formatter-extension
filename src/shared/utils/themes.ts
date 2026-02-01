import { Extension } from '@codemirror/state';
import { ThemeKey } from '../types/settings';
import { githubLight } from '@fsegurai/codemirror-theme-github-light';
import { githubDark } from '@fsegurai/codemirror-theme-github-dark';
import { vsCodeLight } from '@fsegurai/codemirror-theme-vscode-light';
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark';
import { nord } from '@fsegurai/codemirror-theme-nord';
import { monokai } from '@fsegurai/codemirror-theme-monokai';
import { materialLight } from '@fsegurai/codemirror-theme-material-light';
import { materialDark } from '@fsegurai/codemirror-theme-material-dark';
import { solarizedLight } from '@fsegurai/codemirror-theme-solarized-light';
import { solarizedDark } from '@fsegurai/codemirror-theme-solarized-dark';
import { gruvboxLight } from '@fsegurai/codemirror-theme-gruvbox-light';
import { gruvboxDark } from '@fsegurai/codemirror-theme-gruvbox-dark';
import { tokyoNightDay } from '@fsegurai/codemirror-theme-tokyo-night-day';
import { tokyoNightStorm } from '@fsegurai/codemirror-theme-tokyo-night-storm';
import { palenight } from '@fsegurai/codemirror-theme-palenight';
import { andromeda } from '@fsegurai/codemirror-theme-andromeda';
import { abyss } from '@fsegurai/codemirror-theme-abyss';
import { cobalt2 } from '@fsegurai/codemirror-theme-cobalt2';
import { forest } from '@fsegurai/codemirror-theme-forest';
import { volcano } from '@fsegurai/codemirror-theme-volcano';
import { androidStudio } from '@fsegurai/codemirror-theme-android-studio';
import { abcdef } from '@fsegurai/codemirror-theme-abcdef';
import { basicDark } from '@fsegurai/codemirror-theme-basic-dark';

export const themeMap: Record<ThemeKey, Extension> = {
    githubLight,
    githubDark,
    vsCodeLight,
    vsCodeDark,
    nord,
    monokai,
    materialLight,
    materialDark,
    solarizedLight,
    solarizedDark,
    gruvboxLight,
    gruvboxDark,
    tokyoNightDay,
    tokyoNightStorm,
    palenight,
    andromeda,
    abyss,
    cobalt2,
    forest,
    volcano,
    androidStudio,
    abcdef,
    basicDark,
};

export const themeLabels: Record<ThemeKey, string> = {
    githubLight: 'GitHub Light',
    githubDark: 'GitHub Dark',
    vsCodeLight: 'VS Code Light',
    vsCodeDark: 'VS Code Dark',
    nord: 'Nord',
    monokai: 'Monokai',
    materialLight: 'Material Light',
    materialDark: 'Material Dark',
    solarizedLight: 'Solarized Light',
    solarizedDark: 'Solarized Dark',
    gruvboxLight: 'Gruvbox Light',
    gruvboxDark: 'Gruvbox Dark',
    tokyoNightDay: 'Tokyo Night Day',
    tokyoNightStorm: 'Tokyo Night Storm',
    palenight: 'Palenight',
    andromeda: 'Andromeda',
    abyss: 'Abyss',
    cobalt2: 'Cobalt2',
    forest: 'Forest',
    volcano: 'Volcano',
    androidStudio: 'Android Studio',
    abcdef: 'Abcdef',
    basicDark: 'Basic Dark',
};

export const themeKeys: ThemeKey[] = [
    'githubLight', 'githubDark', 'vsCodeLight', 'vsCodeDark', 'nord', 'monokai',
    'materialLight', 'materialDark', 'solarizedLight', 'solarizedDark',
    'gruvboxLight', 'gruvboxDark', 'tokyoNightDay', 'tokyoNightStorm',
    'palenight', 'andromeda', 'abyss', 'cobalt2', 'forest', 'volcano',
    'androidStudio', 'abcdef', 'basicDark'
];

export function getTheme(key: ThemeKey): Extension {
    return themeMap[key] || githubDark;
}

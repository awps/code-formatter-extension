import { Settings, Tone, resolveTone } from '../types/settings';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Whether the device (OS / browser) is in dark mode right now. */
export function deviceIsDark(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(DARK_QUERY).matches;
}

/** The tone to use for these settings on this device right now. */
export function currentTone(settings: Settings): Tone {
    return resolveTone(settings, deviceIsDark());
}

/** Calls `onChange` whenever the device switches between light and dark. */
export function watchDeviceTone(onChange: () => void): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    window.matchMedia(DARK_QUERY).addEventListener('change', onChange);
}

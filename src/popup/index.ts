import { loadSettings, saveSettings } from '../shared/utils/storage';
import { themeLabels, themeKeys } from '../shared/utils/themes';
import { ThemeKey } from '../shared/types/settings';

class PopupController {
    private themeSelect: HTMLSelectElement | null = null;
    private lineNumbersToggle: HTMLElement | null = null;
    private wordWrapToggle: HTMLElement | null = null;

    async init(): Promise<void> {
        this.themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
        this.lineNumbersToggle = document.getElementById('line-numbers-toggle');
        this.wordWrapToggle = document.getElementById('word-wrap-toggle');

        this.populateThemeDropdown();
        this.applyI18n();
        await this.loadAndApplySettings();
        this.bindEvents();
    }

    private populateThemeDropdown(): void {
        if (!this.themeSelect) return;

        themeKeys.forEach((key) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = themeLabels[key];
            this.themeSelect!.appendChild(option);
        });
    }

    private applyI18n(): void {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (key && chrome.i18n) {
                const message = chrome.i18n.getMessage(key);
                if (message) {
                    el.textContent = message;
                }
            }
        });
    }

    private async loadAndApplySettings(): Promise<void> {
        const settings = await loadSettings();

        if (this.themeSelect) {
            this.themeSelect.value = settings.theme;
        }

        this.setToggleState(this.lineNumbersToggle, settings.lineNumbers);
        this.setToggleState(this.wordWrapToggle, settings.wordWrap);
    }

    private setToggleState(toggle: HTMLElement | null, isOn: boolean): void {
        if (!toggle) return;
        toggle.classList.toggle('popup__toggle--on', isOn);
        toggle.setAttribute('aria-checked', String(isOn));
    }

    private getToggleState(toggle: HTMLElement | null): boolean {
        if (!toggle) return false;
        return toggle.classList.contains('popup__toggle--on');
    }

    private bindEvents(): void {
        // Theme change
        this.themeSelect?.addEventListener('change', async () => {
            const theme = this.themeSelect!.value as ThemeKey;
            await saveSettings({ theme });
        });

        // Line numbers toggle
        this.lineNumbersToggle?.addEventListener('click', () => this.handleToggleClick(this.lineNumbersToggle!, 'lineNumbers'));
        this.lineNumbersToggle?.addEventListener('keydown', (e) => this.handleToggleKeydown(e as KeyboardEvent, this.lineNumbersToggle!, 'lineNumbers'));

        // Word wrap toggle
        this.wordWrapToggle?.addEventListener('click', () => this.handleToggleClick(this.wordWrapToggle!, 'wordWrap'));
        this.wordWrapToggle?.addEventListener('keydown', (e) => this.handleToggleKeydown(e as KeyboardEvent, this.wordWrapToggle!, 'wordWrap'));
    }

    private async handleToggleClick(toggle: HTMLElement, settingKey: 'lineNumbers' | 'wordWrap'): Promise<void> {
        const newState = !this.getToggleState(toggle);
        this.setToggleState(toggle, newState);
        await saveSettings({ [settingKey]: newState });
    }

    private handleToggleKeydown(e: KeyboardEvent, toggle: HTMLElement, settingKey: 'lineNumbers' | 'wordWrap'): void {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleToggleClick(toggle, settingKey);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const controller = new PopupController();
    controller.init();
});

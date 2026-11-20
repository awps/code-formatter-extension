import { EditorView } from "@codemirror/view";
import { Appearance, Settings, ThemeKey } from '../../shared/types/settings';
import { saveSettings } from '../../shared/utils/storage';
import {
    closeAllDropdowns,
    closeOtherDropdowns,
    toggleDropdown,
    updateThemeSelection,
    updateAppearanceSelection,
    updateViewCheckbox,
    isInsideDropdownMenu,
    getDropdownMenuFromTrigger
} from '../components/dropdown';
import {
    hidePreElement,
    showPreElement,
    hideRendererElement,
    showRendererElement
} from '../utils/codeDetection';

export interface ClickHandlerContext {
    getState: () => {
        settings: Settings;
        currentView: 'original' | 'formatted';
        originalCode: string;
        beautifiedCode: string;
    };
    setState: (updates: Partial<{
        settings: Settings;
        currentView: 'original' | 'formatted';
    }>) => void;
    getElements: () => {
        preElement: HTMLPreElement;
        renderer: HTMLElement;
    };
    getEditorView: () => EditorView | null;
    rebuildEditor: () => void;
    /** Re-resolves light/dark (toolbars + code theme) */
    applyAppearance: () => void;
    i18n: {
        copy: string;
        copied: string;
    };
}

/**
 * Creates the main click event handler for the toolbar.
 */
export function createClickHandler(ctx: ClickHandlerContext): (e: MouseEvent) => void {
    return (e: MouseEvent) => {
        // Element, not HTMLElement: clicks on icons land on <svg>/<path>
        if (!e.target || !(e.target instanceof Element)) {
            return;
        }

        const targetElement = e.target;

        // Handle dropdown toggle
        const trigger = targetElement.closest('.code-formatter-toolbar__dropdown-trigger');
        if (trigger) {
            e.stopPropagation();
            const menu = getDropdownMenuFromTrigger(trigger);
            if (menu) {
                closeOtherDropdowns(menu);
                toggleDropdown(menu);
            }
            return;
        }

        // Auto / Light / Dark
        const appearanceItem = targetElement.closest<HTMLElement>('[data-appearance]');
        if (appearanceItem) {
            const appearance = appearanceItem.dataset.appearance as Appearance;
            const state = ctx.getState();
            if (appearance && appearance !== state.settings.appearance) {
                const newSettings = { ...state.settings, appearance };
                ctx.setState({ settings: newSettings });
                saveSettings({ appearance });
                updateAppearanceSelection(appearance);
                ctx.applyAppearance();
            }
            return;
        }

        // Theme for the tone in use (light or dark list)
        const themeItem = targetElement.closest<HTMLElement>('[data-theme]');
        if (themeItem) {
            const newTheme = themeItem.dataset.theme as ThemeKey;
            const key = themeItem.dataset.tone === 'light' ? 'lightTheme' : 'darkTheme';
            const state = ctx.getState();
            if (newTheme && newTheme !== state.settings[key]) {
                const newSettings = { ...state.settings, [key]: newTheme };
                ctx.setState({ settings: newSettings });
                saveSettings({ [key]: newTheme });
                updateThemeSelection(`theme-dropdown-menu-${themeItem.dataset.tone}`, newTheme);
                ctx.rebuildEditor();
            }
            // Menu stays open so themes can be tried one after another
            return;
        }

        // Handle view dropdown item click
        const viewItem = targetElement.closest('[data-setting]');
        if (viewItem) {
            const setting = (viewItem as HTMLElement).dataset.setting as 'lineNumbers' | 'wordWrap';
            if (setting) {
                const state = ctx.getState();
                const newValue = !state.settings[setting];
                const newSettings = { ...state.settings, [setting]: newValue };
                ctx.setState({ settings: newSettings });
                saveSettings({ [setting]: newValue });
                updateViewCheckbox('view-dropdown-menu', setting, newValue);
                ctx.rebuildEditor();
            }
            return;
        }

        // Close all dropdowns when clicking outside
        if (!isInsideDropdownMenu(targetElement)) {
            closeAllDropdowns();
        }

        // Formatted | Original switch
        const segment = targetElement.closest<HTMLElement>('.code-formatter-toolbar__segment');
        if (segment) {
            handleSwitchView(ctx, segment.dataset.view === 'original' ? 'original' : 'formatted');
            return;
        }

        // Handle copy button click
        const copyButton = targetElement.closest<HTMLElement>('#code-formatter-toolbar-button-copy');
        if (copyButton) {
            handleCopy(ctx, copyButton);
            return;
        }

        // Handle download button click
        if (targetElement.closest('#code-formatter-toolbar-button-download')) {
            handleDownload(ctx);
            return;
        }
    };
}

/**
 * Shows the formatted editor or the original text.
 */
function handleSwitchView(ctx: ClickHandlerContext, target: 'original' | 'formatted'): void {
    const state = ctx.getState();
    if (state.currentView === target) return;
    const { preElement, renderer } = ctx.getElements();

    if (target === 'original') {
        showPreElement(preElement);
        hideRendererElement(renderer);
    } else {
        hidePreElement(preElement);
        showRendererElement(renderer);
    }
    ctx.setState({ currentView: target });

    document.querySelectorAll<HTMLElement>('.code-formatter-toolbar__segment').forEach((btn) => {
        const active = btn.dataset.view === target;
        btn.classList.toggle('code-formatter-toolbar__segment--active', active);
        btn.setAttribute('aria-checked', String(active));
    });
}

/**
 * Handles copying code to clipboard.
 */
function handleCopy(ctx: ClickHandlerContext, button: HTMLElement): void {
    const state = ctx.getState();
    const codeToCopy = state.currentView === 'original' ? state.originalCode : state.beautifiedCode;

    if (navigator?.clipboard) {
        navigator.clipboard.writeText(codeToCopy).then(() => {
            const label = button.querySelector('.code-formatter-toolbar__label');
            button.classList.add('code-formatter-toolbar__button--done');
            if (label) label.textContent = ctx.i18n.copied;
            setTimeout(() => {
                button.classList.remove('code-formatter-toolbar__button--done');
                if (label) label.textContent = ctx.i18n.copy;
            }, 1200);
        });
    }
}

/**
 * Handles downloading code as a file.
 */
function handleDownload(ctx: ClickHandlerContext): void {
    const state = ctx.getState();
    const codeToDownload = state.currentView === 'original' ? state.originalCode : state.beautifiedCode;

    const a = document.createElement('a');
    const blob = new Blob([codeToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    a.href = url;

    const basename = window.location.pathname.split('/').pop();
    a.download = basename || 'code-formatter.txt';
    a.click();
    URL.revokeObjectURL(url);
}

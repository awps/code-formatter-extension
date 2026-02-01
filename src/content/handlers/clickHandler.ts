import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { Settings, ThemeKey } from '../../shared/types/settings';
import { saveSettings } from '../../shared/utils/storage';
import {
    closeAllDropdowns,
    closeOtherDropdowns,
    toggleDropdown,
    updateThemeSelection,
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
import { createEditorView, destroyEditor } from '../components/editor';

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
    setEditorView: (view: EditorView | null) => void;
    pluginMode: () => Extension;
    i18n: {
        showOriginal: string;
        showFormatted: string;
    };
}

/**
 * Creates the main click event handler for the toolbar.
 */
export function createClickHandler(ctx: ClickHandlerContext): (e: MouseEvent) => void {
    return (e: MouseEvent) => {
        if (!e.target || !(e.target instanceof HTMLElement)) {
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

        // Handle theme dropdown item click
        const themeItem = targetElement.closest('[data-theme]');
        if (themeItem) {
            const newTheme = (themeItem as HTMLElement).dataset.theme as ThemeKey;
            const state = ctx.getState();
            if (newTheme && newTheme !== state.settings.theme) {
                const newSettings = { ...state.settings, theme: newTheme };
                ctx.setState({ settings: newSettings });
                saveSettings({ theme: newTheme });
                updateThemeSelection('theme-dropdown-menu', newTheme);
                recreateEditor(ctx);
            }
            closeAllDropdowns();
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
                recreateEditor(ctx);
            }
            closeAllDropdowns();
            return;
        }

        // Close all dropdowns when clicking outside
        if (!isInsideDropdownMenu(targetElement)) {
            closeAllDropdowns();
        }

        // Handle switch button click
        if (targetElement.id === 'code-formatter-switcher-button') {
            handleSwitchView(ctx, targetElement);
            return;
        }

        // Handle copy button click
        if (targetElement.id === 'code-formatter-toolbar-button-copy') {
            handleCopy(ctx);
            return;
        }

        // Handle download button click
        if (targetElement.id === 'code-formatter-toolbar-button-download') {
            handleDownload(ctx);
            return;
        }
    };
}

/**
 * Handles switching between original and formatted view.
 */
function handleSwitchView(ctx: ClickHandlerContext, button: HTMLElement): void {
    const state = ctx.getState();
    const { preElement, renderer } = ctx.getElements();

    if (state.currentView === 'formatted') {
        showPreElement(preElement);
        hideRendererElement(renderer);
        button.innerText = ctx.i18n.showFormatted;
        ctx.setState({ currentView: 'original' });
    } else {
        hidePreElement(preElement);
        showRendererElement(renderer);
        button.innerText = ctx.i18n.showOriginal;
        ctx.setState({ currentView: 'formatted' });
    }
}

/**
 * Handles copying code to clipboard.
 */
function handleCopy(ctx: ClickHandlerContext): void {
    const state = ctx.getState();
    const codeToCopy = state.currentView === 'original' ? state.originalCode : state.beautifiedCode;

    if (navigator?.clipboard) {
        navigator.clipboard.writeText(codeToCopy);
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

/**
 * Recreates the editor with current settings.
 */
function recreateEditor(ctx: ClickHandlerContext): void {
    const state = ctx.getState();
    const { renderer } = ctx.getElements();

    destroyEditor(ctx.getEditorView());

    const newView = createEditorView({
        container: renderer,
        code: state.beautifiedCode,
        languageExtension: ctx.pluginMode,
        settings: state.settings
    });

    ctx.setEditorView(newView);
}

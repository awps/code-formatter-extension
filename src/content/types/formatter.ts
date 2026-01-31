import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Settings } from '../../shared/types/settings';

/**
 * State of the code formatter.
 */
export interface FormatterState {
    originalCode: string;
    beautifiedCode: string;
    language: string;
    currentView: 'original' | 'formatted';
    isFormatted: boolean;
    settings: Settings;
}

/**
 * DOM elements used by the formatter.
 */
export interface FormatterElements {
    preElement: HTMLPreElement;
    renderer: HTMLElement;
}

/**
 * Context for the formatter including state, elements, and editor.
 */
export interface FormatterContext {
    state: FormatterState;
    elements: FormatterElements;
    editorView: EditorView | null;
    pluginMode: () => Extension;
}

/**
 * Internationalization strings used by the formatter.
 */
export interface FormatterI18n {
    extShortName: string;
    copy: string;
    download: string;
    showOriginal: string;
    showFormatted: string;
    theme: string;
    view: string;
    lineNumbers: string;
    wordWrap: string;
}

import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { Settings } from '../../shared/types/settings';
import { getTheme } from '../../shared/utils/themes';

export interface EditorConfig {
    container: HTMLElement;
    code: string;
    languageExtension: () => Extension;
    settings: Settings;
}

/**
 * Creates a CodeMirror EditorView with the specified configuration.
 */
export function createEditorView(config: EditorConfig): EditorView {
    const { container, code, languageExtension, settings } = config;

    const extensions: Extension[] = [
        basicSetup,
        getTheme(settings.theme),
        languageExtension(),
        EditorState.readOnly.of(true),
    ];

    // Add word wrap if enabled
    if (settings.wordWrap) {
        extensions.push(EditorView.lineWrapping);
    }

    // Hide line numbers if disabled
    if (!settings.lineNumbers) {
        extensions.push(EditorView.theme({
            '.cm-gutters': { display: 'none' }
        }));
    }

    const state = EditorState.create({
        doc: code,
        extensions
    });

    return new EditorView({
        parent: container,
        state,
    });
}

/**
 * Destroys an existing editor view if it exists.
 */
export function destroyEditor(view: EditorView | null): void {
    if (view) {
        view.destroy();
    }
}

/**
 * Recreates the editor with new settings.
 * Returns the new editor view.
 */
export function recreateEditor(
    existingView: EditorView | null,
    config: EditorConfig
): EditorView {
    destroyEditor(existingView);
    return createEditorView(config);
}

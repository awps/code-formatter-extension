import { EditorView, Decoration, DecorationSet, MatchDecorator, ViewPlugin, ViewUpdate, showPanel, Panel } from "@codemirror/view";
import { EditorState, Extension, StateEffect } from "@codemirror/state";
import { ensureSyntaxTree, foldable, foldEffect, unfoldEffect, unfoldAll, foldedRanges, syntaxTree } from "@codemirror/language";
import type { SyntaxNode } from "@lezer/common";
import type { SponsorLink } from "./sponsor";

export interface CodeToolsI18n {
    jsonPath: string;
    copyPath: string;
    copied: string;
    openLinkHint: string;
    collapseAll: string;
    expandAll: string;
    collapseSelected: string;
    expandSelected: string;
    lines: string;
}

export interface StatusBarOptions {
    /** Show the JSON path of the cursor (JSON files) */
    jsonPath: boolean;
    /** Display name of the language, e.g. "CSS" */
    languageLabel: string;
    /** Small sponsor icon at the end of the bar */
    sponsor?: SponsorLink;
}

/* ------------------------------------------------------------------ */
/* JSON path                                                           */
/* ------------------------------------------------------------------ */

const CONTAINERS = new Set(['JsonText', 'Object', 'Array']);
// ',' is a node in newer @lezer/json versions; it must not count as an array item
const PUNCTUATION = new Set(['{', '}', '[', ']', ',', '⚠']);

function isValueNode(node: SyntaxNode): boolean {
    return !PUNCTUATION.has(node.name);
}

function formatKey(key: string): string {
    return /^[A-Za-z_$][\w$]*$/.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
}

function readKey(state: EditorState, nameNode: SyntaxNode): string {
    const raw = state.sliceDoc(nameNode.from, nameNode.to);
    try {
        return JSON.parse(raw);
    } catch {
        return raw.replace(/^"|"$/g, '');
    }
}

/**
 * Returns the JSONPath (e.g. `$.users[2].name`) of the value or key at `pos`,
 * or `$` for the document root. Returns null if there is no JSON tree.
 */
export function getJsonPath(state: EditorState, pos: number): string | null {
    // Cursor in the indentation: treat it as being on the line's first token
    const line = state.doc.lineAt(pos);
    const indent = line.text.length - line.text.trimStart().length;
    if (pos - line.from < indent) pos = line.from + indent;

    const tree = ensureSyntaxTree(state, Math.min(state.doc.length, pos + 1), 200) ?? syntaxTree(state);
    if (!tree.length) return null;

    // Prefer the token starting at pos; if that only gives a container,
    // try the token ending at pos (cursor placed right after a value).
    let node = tree.resolveInner(pos, 1);
    if (CONTAINERS.has(node.name) && pos > 0) {
        const before = tree.resolveInner(pos, -1);
        if (before.to - before.from < node.to - node.from) node = before;
    }

    const segments: string[] = [];
    let current: SyntaxNode | null = node;

    while (current && current.parent) {
        const parent: SyntaxNode = current.parent;

        if (parent.name === 'Property') {
            const nameNode = parent.getChild('PropertyName');
            if (nameNode) segments.push(formatKey(readKey(state, nameNode)));
        } else if (parent.name === 'Array' && isValueNode(current)) {
            let index = 0;
            for (let c = parent.firstChild; c && c.from < current.from; c = c.nextSibling) {
                if (isValueNode(c)) index++;
            }
            segments.push(`[${index}]`);
        }

        current = parent;
    }

    return '$' + segments.reverse().join('');
}

const FOLD_ICONS = {
    collapse: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.5 8 6l3.5-3.5M4.5 13.5 8 10l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    expand: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 6 8 2.5 11.5 6M4.5 10 8 13.5l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    // Bracket around the arrows = "this block"
    expandSelected: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 6.5 8 4l2.5 2.5M5.5 9.5 8 12l2.5-2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 2.5H2v11h1M13 2.5h1v11h-1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    collapseSelected: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5 8 6l2.5-2.5M5.5 12.5 8 10l2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 2.5H2v11h1M13 2.5h1v11h-1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Shortcut labels, shown the way each OS writes them */
export const FOLD_SHORTCUTS = {
    collapse: IS_MAC ? '⌃⌥[' : 'Ctrl+Alt+[',
    expand: IS_MAC ? '⌃⌥]' : 'Ctrl+Alt+]',
    collapseSelected: IS_MAC ? '⌃⌥−' : 'Ctrl+Alt+−',
    expandSelected: IS_MAC ? '⌃⌥=' : 'Ctrl+Alt+=',
};

type FoldAction = 'collapse' | 'expand' | 'collapseSelected' | 'expandSelected';

/**
 * Compact icon button with an IDE-style tooltip: action name + shortcut.
 */
function iconButton(label: string, icon: string, shortcut: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cm-cf-status__icon';
    button.setAttribute('aria-label', `${label} (${shortcut})`);
    button.innerHTML = icon;

    const tip = document.createElement('span');
    tip.className = 'cf-tip cf-tip--above';
    tip.setAttribute('aria-hidden', 'true');
    const name = document.createElement('strong');
    name.textContent = label;
    const keys = document.createElement('kbd');
    keys.textContent = shortcut;
    tip.append(name, keys);

    button.append(tip);
    button.addEventListener('click', onClick);
    return button;
}

function sponsorLink(sponsor: SponsorLink): HTMLAnchorElement {
    const link = document.createElement('a');
    link.className = 'cm-cf-status__sponsor';
    link.href = sponsor.url;
    link.target = '_blank';
    link.rel = 'noopener sponsored';
    link.setAttribute('aria-label', `${sponsor.label}: ${sponsor.name}. ${sponsor.text}`);
    link.innerHTML = sponsor.mark;

    const name0 = document.createElement('span');
    name0.className = 'cm-cf-status__sponsor-name';
    name0.textContent = sponsor.name;
    const tag = document.createElement('span');
    tag.className = 'cm-cf-status__sponsor-tag';
    tag.textContent = sponsor.label;
    link.append(name0, tag);

    const tip = document.createElement('span');
    tip.className = 'cf-tip cf-tip--above';
    tip.setAttribute('aria-hidden', 'true');
    const name = document.createElement('strong');
    name.textContent = sponsor.name;
    const text = document.createElement('span');
    text.textContent = sponsor.text;
    tip.append(name, text);
    link.append(tip);
    return link;
}

/** Ctrl+Alt+[ ] - = — matched by physical key so it works on every layout */
function foldShortcut(event: KeyboardEvent): FoldAction | null {
    if (!event.ctrlKey || !event.altKey || event.metaKey || event.shiftKey) return null;
    switch (event.code) {
        case 'BracketLeft': return 'collapse';
        case 'BracketRight': return 'expand';
        case 'Minus': case 'NumpadSubtract': return 'collapseSelected';
        case 'Equal': case 'NumpadAdd': return 'expandSelected';
        default: return null;
    }
}

function runFoldAction(view: EditorView, action: FoldAction): void {
    if (action === 'collapse') collapseAll(view);
    else if (action === 'expand') expandAll(view);
    else if (action === 'collapseSelected') collapseSelected(view);
    else expandSelected(view);
}

function statusPanel(i18n: CodeToolsI18n, options: StatusBarOptions) {
    return (view: EditorView): Panel => {
        const dom = document.createElement('div');
        dom.className = 'cm-cf-status';

        const info = document.createElement('div');
        info.className = 'cm-cf-status__info';

        let render: (state: EditorState) => void;

        if (options.jsonPath) {
            const label = document.createElement('span');
            label.className = 'cm-cf-status__key';
            label.textContent = i18n.jsonPath;

            const value = document.createElement('code');
            value.className = 'cm-cf-status__path';

            const copy = document.createElement('button');
            copy.type = 'button';
            copy.className = 'cm-cf-status__button cm-cf-status__button--outline';
            copy.textContent = i18n.copyPath;
            copy.addEventListener('click', () => {
                navigator.clipboard?.writeText(value.textContent || '').then(() => {
                    copy.textContent = i18n.copied;
                    setTimeout(() => { copy.textContent = i18n.copyPath; }, 1200);
                });
            });

            info.append(label, value, copy);
            render = (state) => {
                value.textContent = getJsonPath(state, state.selection.main.head) ?? '$';
            };
        } else {
            const language = document.createElement('span');
            language.className = 'cm-cf-status__key';
            language.textContent = options.languageLabel;

            const lines = document.createElement('span');
            lines.className = 'cm-cf-status__meta';

            info.append(language, lines);
            render = (state) => {
                lines.textContent = `${state.doc.lines.toLocaleString()} ${i18n.lines}`;
            };
        }

        const folds = document.createElement('div');
        folds.className = 'cm-cf-status__actions';
        const divider = document.createElement('span');
        divider.className = 'cm-cf-status__divider';
        folds.append(
            iconButton(i18n.expandSelected, FOLD_ICONS.expandSelected, FOLD_SHORTCUTS.expandSelected, () => expandSelected(view)),
            iconButton(i18n.collapseSelected, FOLD_ICONS.collapseSelected, FOLD_SHORTCUTS.collapseSelected, () => collapseSelected(view)),
            divider,
            iconButton(i18n.expandAll, FOLD_ICONS.expand, FOLD_SHORTCUTS.expand, () => expandAll(view)),
            iconButton(i18n.collapseAll, FOLD_ICONS.collapse, FOLD_SHORTCUTS.collapse, () => collapseAll(view)),
        );

        // Shortcuts work whether or not the editor has focus. Capture phase,
        // so CodeMirror's own Ctrl+Alt+[ (which also folds the root) never runs.
        const onKey = (event: KeyboardEvent) => {
            const action = foldShortcut(event);
            if (!action || !view.dom.isConnected || view.dom.offsetParent === null) return;
            event.preventDefault();
            event.stopPropagation();
            runFoldAction(view, action);
        };
        window.addEventListener('keydown', onKey, true);

        dom.append(info);
        // Sponsor sits just before the fold buttons
        if (options.sponsor) dom.append(sponsorLink(options.sponsor));
        dom.append(folds);
        render(view.state);

        return {
            dom,
            top: false,
            update(update: ViewUpdate) {
                if (update.selectionSet || update.docChanged) render(update.state);
            },
            destroy() {
                window.removeEventListener('keydown', onKey, true);
            },
        };
    };
}

/**
 * Bottom status bar: JSON path (JSON) or language + line count, and
 * collapse / expand all buttons.
 */
export function statusBarExtension(i18n: CodeToolsI18n, options: StatusBarOptions): Extension {
    return showPanel.of(statusPanel(i18n, options));
}

/* ------------------------------------------------------------------ */
/* Collapse / expand all                                               */
/* ------------------------------------------------------------------ */

/**
 * Collapses every foldable block except the outermost one, so the top-level
 * keys stay visible and each block can be opened one level at a time.
 */
export function collapseAll(view: EditorView): void {
    const { state } = view;
    ensureSyntaxTree(state, state.doc.length, 5000);

    const effects: StateEffect<unknown>[] = [];
    let rootEnd = -1;

    for (let n = 1; n <= state.doc.lines; n++) {
        const line = state.doc.line(n);
        const range = foldable(state, line.from, line.to);
        if (!range) continue;
        // Keep the outermost block that wraps everything open (JSON root).
        // Code files (many top-level blocks) get every block folded.
        if (rootEnd < 0) {
            rootEnd = range.to;
            if (state.doc.sliceString(range.to).trim().length <= 1) continue;
        }
        effects.push(foldEffect.of(range));
    }

    if (effects.length) view.dispatch({ effects });
}

export function expandAll(view: EditorView): void {
    unfoldAll(view);
}

/**
 * The block the cursor is in: a collapsed block on the cursor's line first,
 * then the innermost foldable block that contains the cursor.
 */
export function getSelectedBlock(state: EditorState): { from: number; to: number } | null {
    const pos = state.selection.main.head;
    const line = state.doc.lineAt(pos);

    let folded: { from: number; to: number } | null = null;
    foldedRanges(state).between(line.from, line.to, (from, to) => {
        if (!folded && from >= line.from && from <= line.to) folded = { from, to };
    });
    if (folded) return folded;

    const onLine = foldable(state, line.from, line.to);
    if (onLine) return onLine;

    const tree = ensureSyntaxTree(state, pos, 200) ?? syntaxTree(state);
    for (let node: SyntaxNode | null = tree.resolveInner(pos, 0); node; node = node.parent) {
        const start = state.doc.lineAt(node.from);
        const range = foldable(state, start.from, start.to);
        if (range && range.from <= pos && range.to >= pos) return range;
    }
    return null;
}

/** Foldable blocks strictly inside `block` */
function nestedBlocks(state: EditorState, block: { from: number; to: number }): Array<{ from: number; to: number }> {
    const ranges: Array<{ from: number; to: number }> = [];
    const first = state.doc.lineAt(block.from).number + 1;
    const last = state.doc.lineAt(block.to).number;
    for (let n = first; n <= last; n++) {
        const line = state.doc.line(n);
        const range = foldable(state, line.from, line.to);
        if (range && range.from >= block.from && range.to <= block.to) ranges.push(range);
    }
    return ranges;
}

/**
 * Expands the selected block and everything nested inside it.
 */
export function expandSelected(view: EditorView): void {
    const block = getSelectedBlock(view.state);
    if (!block) return;

    const effects: StateEffect<unknown>[] = [];
    foldedRanges(view.state).between(block.from, block.to, (from, to) => {
        if (from >= block.from && to <= block.to) effects.push(unfoldEffect.of({ from, to }));
    });
    if (effects.length) view.dispatch({ effects });
}

/**
 * Collapses the selected block and everything nested inside it, so opening
 * it later reveals one level at a time.
 */
export function collapseSelected(view: EditorView): void {
    const { state } = view;
    ensureSyntaxTree(state, state.doc.length, 5000);
    const block = getSelectedBlock(state);
    if (!block) return;

    const effects: StateEffect<unknown>[] = nestedBlocks(state, block).map(r => foldEffect.of(r));
    effects.push(foldEffect.of(block));
    // Keep the cursor visible: move it to the start of the folded block's line
    view.dispatch({ effects, selection: { anchor: state.doc.lineAt(block.from).from } });
}

/* ------------------------------------------------------------------ */
/* Clickable URLs                                                      */
/* ------------------------------------------------------------------ */

// Also matches JSON-escaped slashes: https:\/\/example.com\/path
const URL_RE = /https?:(?:\\?\/){2}(?:[^\s"'<>`\\]|\\\/)+/g;

function trimUrl(url: string): string {
    // Drop trailing punctuation that is almost never part of the URL
    return url.replace(/[.,;:!?)\]}]+$/, '');
}

/** Turns a matched URL into one the browser can open. */
export function cleanUrl(url: string): string {
    return trimUrl(url).replace(/\\\//g, '/');
}

function findUrlAt(view: EditorView, pos: number): string | null {
    const line = view.state.doc.lineAt(pos);
    const offset = pos - line.from;
    URL_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = URL_RE.exec(line.text))) {
        const url = trimUrl(m[0]);
        if (offset >= m.index && offset <= m.index + url.length) return cleanUrl(url);
    }
    return null;
}

/**
 * Underlines URLs and opens them on Ctrl/⌘ + click (or middle click).
 */
export function linkExtension(i18n: CodeToolsI18n): Extension {
    const decorator = new MatchDecorator({
        regexp: URL_RE,
        decorate: (add, from, _to, match) => {
            const url = trimUrl(match[0]);
            if (!url) return;
            add(from, from + url.length, Decoration.mark({
                class: 'cm-cf-link',
                attributes: { title: i18n.openLinkHint },
            }));
        },
    });

    const plugin = ViewPlugin.fromClass(class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
            this.decorations = decorator.createDeco(view);
        }
        update(update: ViewUpdate) {
            this.decorations = decorator.updateDeco(update, this.decorations);
        }
    }, { decorations: v => v.decorations });

    // Track Ctrl/⌘ so hovered links show a pointer only when a click would open them
    const modifierTracker = ViewPlugin.fromClass(class {
        private readonly onKey: (e: KeyboardEvent) => void;
        private readonly onBlur: () => void;
        constructor(private readonly view: EditorView) {
            this.onKey = (e: KeyboardEvent) => this.set(e.metaKey || e.ctrlKey);
            this.onBlur = () => this.set(false);
            window.addEventListener('keydown', this.onKey);
            window.addEventListener('keyup', this.onKey);
            window.addEventListener('blur', this.onBlur);
        }
        set(on: boolean) {
            this.view.dom.classList.toggle('cm-cf-mod', on);
        }
        destroy() {
            window.removeEventListener('keydown', this.onKey);
            window.removeEventListener('keyup', this.onKey);
            window.removeEventListener('blur', this.onBlur);
        }
    });

    const clicks = EditorView.domEventHandlers({
        mousemove(event, view) {
            view.dom.classList.toggle('cm-cf-mod', event.metaKey || event.ctrlKey);
            return false;
        },
        mousedown(event, view) {
            const wantsOpen = event.button === 1 || (event.button === 0 && (event.metaKey || event.ctrlKey));
            if (!wantsOpen) return false;
            if (!(event.target instanceof HTMLElement) || !event.target.closest('.cm-cf-link')) return false;

            const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
            if (pos == null) return false;
            const url = findUrlAt(view, pos);
            if (!url) return false;

            event.preventDefault();
            window.open(url, '_blank', 'noopener,noreferrer');
            return true;
        },
    });

    return [plugin, modifierTracker, clicks];
}

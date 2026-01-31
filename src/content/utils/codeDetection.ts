/**
 * Maximum code length in characters (100MB)
 */
export const MAX_CODE_LENGTH = 100e6;

/**
 * Checks if the page has a valid code element to format.
 * Returns the pre element if found as first child of body, or creates one for plain text code.
 * Returns null if no formattable content is found.
 */
export function getCodeElement(): HTMLPreElement | null {
    const firstChild = document.body.firstElementChild;

    // Check if first child is a <pre> element
    if (firstChild && firstChild.tagName === 'PRE') {
        return firstChild as HTMLPreElement;
    }

    // Special case: body has no elements but contains plain text code
    if (document.body.children.length === 0) {
        const bodyText = document.body.innerText.trim();
        if (bodyText && looksLikeCode(bodyText)) {
            // Create a pre tag to hold the content
            const preElement = document.createElement('pre') as HTMLPreElement;
            preElement.textContent = bodyText;
            document.body.appendChild(preElement);
            return preElement;
        }
    }

    return null;
}

/**
 * Extracts code text from a pre element.
 * Uses innerText if available (real browser), falls back to textContent (JSDOM).
 */
export function extractCode(element: HTMLPreElement): string {
    return element.innerText || element.textContent || '';
}

/**
 * Checks if the code length is within the allowed limit.
 */
export function isValidCodeLength(length: number): boolean {
    return length > 0 && length <= MAX_CODE_LENGTH;
}

/**
 * Simple heuristic to check if text looks like code.
 */
export function looksLikeCode(text: string): boolean {
    return (
        text.startsWith('{') ||
        text.startsWith('[') ||
        text.includes('function') ||
        text.includes('var') ||
        text.includes('const') ||
        text.includes('let')
    );
}

/**
 * Creates the renderer container element after the pre element.
 */
export function createRendererElement(preElement: HTMLPreElement): HTMLElement | null {
    preElement.insertAdjacentHTML(
        'afterend',
        `<div id="code-formatter-renderer" class="code-formatter-renderer"></div>`
    );
    return document.getElementById('code-formatter-renderer');
}

/**
 * Hides the original pre element.
 */
export function hidePreElement(preElement: HTMLPreElement): void {
    preElement.hidden = true;
    preElement.style.display = 'none';
}

/**
 * Shows the original pre element.
 */
export function showPreElement(preElement: HTMLPreElement): void {
    preElement.hidden = false;
    preElement.style.display = 'block';
}

/**
 * Hides the renderer element.
 */
export function hideRendererElement(renderer: HTMLElement): void {
    renderer.hidden = true;
    renderer.style.display = 'none';
}

/**
 * Shows the renderer element.
 */
export function showRendererElement(renderer: HTMLElement): void {
    renderer.hidden = false;
    renderer.style.display = 'block';
}

/**
 * Removes any existing JSON formatter container (from other extensions).
 */
export function removeJsonFormatterContainer(): void {
    const container = document.querySelector('.json-formatter-container');
    if (container) {
        container.remove();
    }
}

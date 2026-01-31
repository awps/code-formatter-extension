/**
 * Checks if a string looks like base64 encoded content.
 * Strips whitespace before checking.
 */
export function isBase64(str: string): boolean {
    const cleaned = str.replace(/\s/g, '');
    return /^[A-Za-z0-9+/]+=*$/.test(cleaned);
}

/**
 * Attempts to decode a base64 string.
 * Returns the decoded string on success, or null on failure.
 */
export function decodeBase64(str: string): string | null {
    try {
        return atob(str);
    } catch (e) {
        return null;
    }
}

/**
 * Extracts language and base64 flag from a language string.
 * E.g., "json:base64" -> { language: "json", isBase64: true }
 */
export function parseLanguageWithBase64(langString: string): { language: string; isBase64: boolean } {
    if (langString && langString.includes(':base64')) {
        return {
            language: langString.replace(':base64', ''),
            isBase64: true
        };
    }
    return {
        language: langString,
        isBase64: false
    };
}
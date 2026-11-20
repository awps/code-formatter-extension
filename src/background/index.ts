import { detectLanguageWithMimeTypeKnowledge, detectLanguageFromMimeType, mightBeJsonFromUrl } from './utils/mimeTypeDetection';

const CODE_FILE_EXTENSIONS = new Set([
    'json', 'css', 'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx', 'php', 'md', 'xml',
    'yaml', 'yml', 'less', 'sass', 'scss', 'py', 'sql', 'go', 'cpp', 'cxx', 'cc',
    'rs', 'java', 'cs',
]);

interface PageProbe {
    contentType: string;
}

/**
 * Runs inside the page (must be self-contained). Decides cheaply whether the
 * tab shows a raw file (JSON, CSS, JS, ...) rather than a normal website, so
 * the formatter is never injected into regular pages.
 */
function probePage(): PageProbe | null {
    const doc = document;
    const body = doc.body;
    if (!body || doc.getElementById('code-formatter-renderer')) return null;

    const contentType = doc.contentType || '';
    const elements = Array.prototype.slice.call(body.children) as Element[];
    // Ignore the container Chrome's built-in JSON viewer adds next to the <pre>
    const meaningful = elements.filter(el => !el.classList.contains('json-formatter-container'));

    const isSinglePre = meaningful.length === 1 && meaningful[0].tagName === 'PRE';
    const isBareText = meaningful.length === 0 && (body.textContent || '').trim().length > 0;

    if (!isSinglePre && !isBareText) return null;

    return { contentType };
}

function languageFromUrl(rawUrl: string, contentType: string): string {
    if (rawUrl.startsWith('data:')) {
        // data:[<mediatype>][;base64],<data>
        const match = rawUrl.match(/^data:([^;,]+)(;base64)?,/);
        if (!match) return 'auto-detect';
        const fromMime = detectLanguageFromMimeType(match[1]);
        const language = fromMime && fromMime !== 'html' ? fromMime : 'auto-detect';
        return language + (match[2] ? ':base64' : '');
    }

    const url = new URL(rawUrl);
    const pathname = url.pathname;
    const lastSegment = pathname.split('/').pop() || '';

    if (lastSegment.includes('.')) {
        const fromExtension = detectLanguageWithMimeTypeKnowledge(lastSegment.split('.').pop() || '');
        if (fromExtension && fromExtension !== 'auto-detect') return fromExtension;
    }

    // No useful extension: trust what the server says it sent
    const fromMime = detectLanguageFromMimeType(contentType.split(';')[0].trim());
    if (fromMime && fromMime !== 'html' && fromMime !== 'text') return fromMime;

    if (mightBeJsonFromUrl(rawUrl)) return 'json';

    return 'auto-detect';
}

async function showFileAccessHint(tabId: number, url: string): Promise<void> {
    if (!url.startsWith('file:')) return;
    const allowed = await chrome.extension.isAllowedFileSchemeAccess();
    if (allowed) return;

    // Only nag on files that look like code
    const ext = (new URL(url).pathname.split('.').pop() || '').toLowerCase();
    if (!CODE_FILE_EXTENSIONS.has(ext)) return;

    chrome.action.setBadgeText({ tabId, text: '!' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#F59E0B' });
    chrome.action.setTitle({ tabId, title: chrome.i18n.getMessage('fileAccessBadgeTitle') || 'Click to enable local file formatting' });
}

async function handleTab(tabId: number, url: string): Promise<void> {
    let probe: PageProbe | null = null;

    try {
        const [result] = await chrome.scripting.executeScript({
            target: { tabId, frameIds: [0] },
            func: probePage,
        });
        probe = (result?.result as PageProbe | null) ?? null;
    } catch {
        // No access (chrome:// pages, Web Store, file:// without permission, ...)
        await showFileAccessHint(tabId, url);
        return;
    }

    if (!probe) return;

    const programmingLanguage = languageFromUrl(url, probe.contentType);

    try {
        await chrome.scripting.insertCSS({
            target: { tabId, frameIds: [0] },
            files: ['./css/content.min.css'],
        });
        // Hand the language hint to the content script before it runs
        await chrome.scripting.executeScript({
            target: { tabId, frameIds: [0] },
            func: (language: string) => {
                (window as unknown as { __codeFormatterLanguage?: string }).__codeFormatterLanguage = language;
            },
            args: [programmingLanguage],
        });
        await chrome.scripting.executeScript({
            target: { tabId, frameIds: [0] },
            files: ['./content.min.js'],
        });
    } catch {
        // Tab navigated away or was closed mid-injection
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete' || !tab.url) return;
    if (!/^(https?|file|data):/.test(tab.url)) return;
    handleTab(tabId, tab.url);
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.tabs.create({ url: chrome.runtime.getURL('guide/index.html') });
    }
});

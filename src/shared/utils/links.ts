const SITE = 'https://zerowp.com/code-formatter/';

/**
 * A link to the extension's website, tagged so the site's analytics can
 * tell which part of the extension the visit came from.
 */
export function siteUrl(path = '', placement = 'viewer', hash = ''): string {
    const query = new URLSearchParams({
        utm_source: 'code-formatter-extension',
        utm_medium: 'extension',
        utm_campaign: 'code-formatter',
        utm_content: placement,
    });
    return `${SITE}${path}?${query}${hash ? `#${hash}` : ''}`;
}

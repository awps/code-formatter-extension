# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code Formatter Extension is a Chrome extension (Manifest v3) that formats and beautifies code with syntax highlighting when viewing source files in the browser. Supports 16+ languages including JSON, CSS, JavaScript, TypeScript, PHP, Python, Go, Rust, Java, C++, C#, XML, YAML, LESS, SASS, SQL, and Markdown.

## Commands

```bash
# Development
npm run watch           # Watch mode for development
npm run development     # Single development build

# Production
npm run production      # Production build (minified)
./build.sh              # Production build + zip for Chrome Web Store

# Testing
npm run test            # Run Jest tests
```

## Architecture

### Extension Flow

```
Tab loads → background/index.ts runs a tiny probe in the page (probePage)
         → stops unless the page is a raw file (single <pre> / bare text, non-HTML contentType)
         → detects language from URL extension, then document.contentType
         → injects content.min.css, sets window.__codeFormatterLanguage, injects content.min.js
         → file:// without permission → "!" badge on the action icon

content/index.ts → reads the language hint (guards against double injection)
                 → extracts code from <pre> or plain text
                 → detects/overrides language if needed
                 → beautifies (JSON via formatJson, JS/CSS via js-beautify)
                 → renders with CodeMirror 6 (+ JSON path bar, links, collapse/expand all)
```

### Key Files

- `src/background/index.ts` - Service worker: page probe, language hint, injection, file-access badge, opens guide on install
- `src/background/utils/mimeTypeDetection.ts` - MIME type to language mapping, URL pattern detection
- `src/content/index.ts` - Content script entry: code extraction, formatting, editor setup
- `src/content/utils/formatJson.ts` - Token-based JSON pretty printer (keeps numbers exact, one bracket per line)
- `src/content/components/codeTools.ts` - JSON path bar, collapse/expand all, clickable URLs
- `src/content/utils/languageDetection.ts` - Content-based language detection via regex patterns
- `src/popup/` - Settings popup (+ file-access notice); `src/guide/` - How-to page
- `src/css/content.css` - Extension UI styling (PostCSS nesting)
- `webpack.config.js` - Webpack build configuration

### Language Detection (Two-Tier)

1. **Primary (background)**: File extension from URL, then the page's real `document.contentType`
2. **Secondary (content)**: Regex-based content analysis when the hint is missing or unsupported

### Technology Stack

- TypeScript (ES2016 target)
- Webpack 5 (ts-loader, PostCSS)
- CodeMirror 6 with language-specific packages
- js-beautify for JS/CSS formatting
- Jest for testing

## Testing Chrome Extension Locally

1. Run `npm run watch` or `npm run production`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `src/` directory

## Constraints

- 100MB file size limit (prevents browser crashes)
- Editor is read-only (display only)
- Works offline (no external API calls)
- Supports HTTP, HTTPS, file://, and data: URLs only

## Internationalization

12 locales in `src/_locales/`. English (`en`) is the source; every key must exist in all locales. Use `$$` for a literal `$` in messages. Popup and guide pages translate `[data-i18n]` elements via `src/shared/utils/i18n.ts`.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code Formatter Extension is a Chrome extension (Manifest v3) that formats and beautifies code with syntax highlighting when viewing source files in the browser. Supports 16+ languages including JSON, CSS, JavaScript, TypeScript, PHP, Python, Go, Rust, Java, C++, C#, XML, YAML, LESS, SASS, SQL, and Markdown.

## Commands

```bash
# Development
npm run watch           # Watch mode for development
npm run hot             # Hot reload during development
npm run development     # Single development build

# Production
npm run production      # Production build (minified)
./build.sh              # Production build + zip for Chrome Web Store

# Testing
npm run test            # Run Jest tests

# Linting
npm run eslint          # ESLint on TSX files
```

## Architecture

### Extension Flow

```
Tab loads → background.ts detects language from URL/extension
         → injects content.min.js + content.min.css
         → sends language hint message (100ms delay)

content.ts → receives language hint
           → extracts code from <pre> or plain text
           → detects/overrides language if needed
           → beautifies (JS/CSS only via js-beautify)
           → renders with CodeMirror 6 + Dracula theme
```

### Key Files

- `src/background.ts` - Service worker: URL-based language detection, script injection
- `src/content.ts` - Content script: code extraction, formatting, CodeMirror rendering
- `src/utils/mimeTypeDetection.ts` - MIME type to language mapping, URL pattern detection
- `src/utils/alternativeDetectLanguage.ts` - Content-based language detection via regex patterns
- `src/css/content.scss` - Extension UI styling
- `webpack.mix.js` - Laravel Mix build configuration

### Language Detection (Two-Tier)

1. **Primary (background.ts)**: File extension and MIME type from URL
2. **Secondary (content.ts)**: Regex-based content analysis when URL detection fails

### Technology Stack

- TypeScript (ES2016 target)
- Laravel Mix 6 (webpack wrapper)
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

12 locales in `src/_locales/`. Strings: `extName`, `extDescription`, `extShortName`, `copy`, `download`, `showOriginal`, `showFormatted`.
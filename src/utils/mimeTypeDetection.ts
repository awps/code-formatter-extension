// Universal MIME type to language mapping
// Handles various MIME type variations for the same content type

interface MimeMapping {
    patterns: RegExp[];
    language: string;
}

const mimeTypeMappings: MimeMapping[] = [
    // JavaScript and variants
    {
        patterns: [
            /^(application|text)\/(x-)?javascript$/i,
            /^application\/(x-)?ecmascript$/i,
            /^text\/ecmascript$/i,
            /^text\/jscript$/i
        ],
        language: 'js'
    },
    // JSON
    {
        patterns: [
            /^application\/json$/i,
            /^text\/json$/i,
            /^application\/([\w.-]+\+)?json$/i // Handles variations like application/ld+json
        ],
        language: 'json'
    },
    // CSS
    {
        patterns: [
            /^text\/css$/i
        ],
        language: 'css'
    },
    // XML and variants
    {
        patterns: [
            /^(application|text)\/xml$/i,
            /^application\/([\w.-]+\+)?xml$/i, // Handles variations like application/rss+xml
            /^text\/xml-external-parsed-entity$/i
        ],
        language: 'xml'
    },
    // HTML (to exclude from formatting)
    {
        patterns: [
            /^text\/html$/i,
            /^application\/xhtml\+xml$/i
        ],
        language: 'html'
    },
    // PHP
    {
        patterns: [
            /^(application|text)\/x-php$/i,
            /^application\/x-httpd-php$/i,
            /^text\/php$/i
        ],
        language: 'php'
    },
    // Python
    {
        patterns: [
            /^(text|application)\/x-python$/i,
            /^text\/plain$/i // When combined with .py extension
        ],
        language: 'py'
    },
    // YAML
    {
        patterns: [
            /^(text|application)\/x-yaml$/i,
            /^text\/yaml$/i,
            /^application\/yaml$/i
        ],
        language: 'yaml'
    },
    // Markdown
    {
        patterns: [
            /^text\/markdown$/i,
            /^text\/x-markdown$/i
        ],
        language: 'md'
    },
    // SQL
    {
        patterns: [
            /^(application|text)\/x-sql$/i,
            /^text\/sql$/i
        ],
        language: 'sql'
    },
    // TypeScript
    {
        patterns: [
            /^(text|application)\/typescript$/i,
            /^text\/x-typescript$/i
        ],
        language: 'ts'
    },
    // Plain text (as fallback)
    {
        patterns: [
            /^text\/plain$/i
        ],
        language: 'text'
    }
];

// Extension to common MIME types mapping
// This simulates what servers typically send for these extensions
const extensionToMimeTypes: { [key: string]: string[] } = {
    // JavaScript variations
    'js': ['application/javascript', 'application/x-javascript', 'text/javascript'],
    'mjs': ['application/javascript', 'text/javascript'],
    'jsx': ['text/jsx', 'application/javascript'],
    
    // TypeScript
    'ts': ['application/typescript', 'text/typescript'],
    'tsx': ['text/tsx', 'application/typescript'],
    
    // JSON
    'json': ['application/json', 'text/json'],
    'jsonld': ['application/ld+json'],
    'geojson': ['application/geo+json'],
    
    // CSS
    'css': ['text/css'],
    'less': ['text/less', 'text/css'],
    'sass': ['text/sass', 'text/css'],
    'scss': ['text/scss', 'text/css'],
    
    // XML variations
    'xml': ['application/xml', 'text/xml'],
    'xsl': ['application/xml', 'text/xml'],
    'xslt': ['application/xslt+xml'],
    'svg': ['image/svg+xml'],
    'rss': ['application/rss+xml'],
    
    // HTML
    'html': ['text/html'],
    'htm': ['text/html'],
    'xhtml': ['application/xhtml+xml'],
    
    // PHP
    'php': ['application/x-httpd-php', 'text/x-php'],
    'phtml': ['application/x-httpd-php'],
    
    // Python
    'py': ['text/x-python', 'application/x-python'],
    'pyw': ['text/x-python'],
    
    // Ruby
    'rb': ['text/x-ruby', 'application/x-ruby'],
    
    // Go
    'go': ['text/x-go', 'application/x-go'],
    
    // Rust
    'rs': ['text/x-rust', 'application/x-rust'],
    
    // Java
    'java': ['text/x-java', 'application/x-java'],
    
    // C/C++
    'c': ['text/x-c', 'text/plain'],
    'cpp': ['text/x-c++', 'text/plain'],
    'cc': ['text/x-c++', 'text/plain'],
    'cxx': ['text/x-c++', 'text/plain'],
    'h': ['text/x-c', 'text/plain'],
    'hpp': ['text/x-c++', 'text/plain'],
    
    // C#
    'cs': ['text/x-csharp', 'application/x-csharp'],
    
    // Shell scripts
    'sh': ['application/x-sh', 'text/x-shellscript'],
    'bash': ['application/x-sh', 'text/x-shellscript'],
    
    // YAML
    'yaml': ['text/yaml', 'application/x-yaml'],
    'yml': ['text/yaml', 'application/x-yaml'],
    
    // Markdown
    'md': ['text/markdown', 'text/x-markdown'],
    'markdown': ['text/markdown', 'text/x-markdown'],
    
    // SQL
    'sql': ['application/sql', 'text/x-sql'],
    
    // Configuration files
    'ini': ['text/plain'],
    'conf': ['text/plain'],
    'config': ['text/plain'],
    
    // Other
    'txt': ['text/plain'],
    'log': ['text/plain']
};

/**
 * Get the most likely MIME types for a file extension
 */
export function getMimeTypesForExtension(extension: string): string[] {
    const ext = extension.toLowerCase();
    return extensionToMimeTypes[ext] || ['text/plain'];
}

/**
 * Detect language from MIME type string
 */
export function detectLanguageFromMimeType(mimeType: string): string | null {
    for (const mapping of mimeTypeMappings) {
        for (const pattern of mapping.patterns) {
            if (pattern.test(mimeType)) {
                return mapping.language;
            }
        }
    }
    return null;
}

/**
 * Enhanced language detection combining extension and MIME type knowledge
 */
export function detectLanguageWithMimeTypeKnowledge(extension: string): string {
    // First, get possible MIME types for this extension
    const possibleMimeTypes = getMimeTypesForExtension(extension);
    
    // Try to detect language from each possible MIME type
    for (const mimeType of possibleMimeTypes) {
        const detectedLang = detectLanguageFromMimeType(mimeType);
        if (detectedLang && detectedLang !== 'text' && detectedLang !== 'html') {
            return detectedLang;
        }
    }
    
    // If no language detected from MIME types, return the extension itself
    // This maintains backward compatibility
    return extension;
}

/**
 * Check if content might be JSON based on common API URL patterns
 */
export function mightBeJsonFromUrl(url: string): boolean {
    const jsonUrlPatterns = [
        /\/api\//i,
        /\/v\d+\//i,
        /\.json($|\?)/i,
        /\/json\//i,
        /format=json/i,
        /content-type=json/i,
        /\/rest\//i,
        /\/graphql/i,
        /\/wp-json\//i,           // WordPress REST API
        /\/wp\/v\d+\//i,          // WordPress REST API versioned
        /\/(data|config|settings|manifest)($|\/|\?)/i,
        /\.api($|\/|\?)/i,        // API endpoints
        /\/ajax\//i,              // AJAX endpoints
        /\/endpoint\//i,          // Generic endpoint
        /\/service\//i,           // Service endpoints
        /\/rpc\//i,               // RPC endpoints
        /accept=.*json/i,         // Accept header in URL
        /response.*json/i,        // Response format in URL
        /output=json/i,           // Output format parameter
        /type=json/i              // Type parameter
    ];
    
    return jsonUrlPatterns.some(pattern => pattern.test(url));
}
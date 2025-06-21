type LanguageCheck = {
    language: string;
    pattern: RegExp;
    priority?: number; // Higher priority checks run first
};

const languageChecks: LanguageCheck[] = [
    // HTML check (to exclude early)
    {
        language: 'html',
        pattern: /^\s*<!DOCTYPE\s+html|^\s*<html|^\s*<\?xml.*\?>\s*<html/i,
        priority: 10
    },
    // JSON - Enhanced detection
    {
        language: 'json',
        pattern: /^\s*[\[\{][\s\S]*[\]\}]\s*$/,
        priority: 9
    },
    {
        language: 'json',
        pattern: /^\s*\{[\s\S]*"[^"]+"\s*:\s*[\s\S]*\}\s*$/,
        priority: 9
    },
    {
        language: 'json',
        pattern: /^\s*\[[\s\S]*\]\s*$/,
        priority: 9
    },
    // PHP
    {
        language: 'php',
        pattern: /^<\?php|^<\?=/,
        priority: 8
    },
    // XML
    {
        language: 'xml',
        pattern: /^\s*<\?xml|^\s*<[\w-]+[^>]*>[\s\S]*<\/[\w-]+>\s*$/,
        priority: 7
    },
    // JavaScript - More specific patterns (higher priority than C#)
    {
        language: 'js',
        pattern: /\b(function|const|let|var|class|import|export|require)\s+[\w\(]|=>\s*[\{\(]|module\.exports|export\s+(default\s+)?[\{\w]|!function\s*\(/m,
        priority: 7
    },
    // TypeScript
    {
        language: 'ts',
        pattern: /\b(interface|type|enum|namespace|declare)\s+\w+|:\s*(string|number|boolean|any|void|never)[\s\[\]\|&;,\)]/,
        priority: 7
    },
    // Python
    {
        language: 'python',
        pattern: /^(#!.*python|from\s+__future__|import\s+\w+|def\s+\w+|class\s+\w+|if\s+__name__\s*==)/m,
        priority: 5
    },
    // Go
    {
        language: 'go',
        pattern: /^package\s+\w+|func\s+(\w+\s+)?\w+\([^)]*\)\s*(\([^)]*\)\s*)?\{/m,
        priority: 5
    },
    // Rust
    {
        language: 'rust',
        pattern: /\b(fn|let\s+mut|use\s+std|impl|trait|struct|enum|mod)\s+/,
        priority: 5
    },
    // C# - More specific to avoid conflicts with JavaScript
    {
        language: 'csharp',
        pattern: /^\s*using\s+System|^\s*namespace\s+[\w.]+\s*\{|^\s*(public|private|protected)\s+class\s+\w+|Console\.WriteLine|string\[\]\s+args/m,
        priority: 4
    },
    // Java
    {
        language: 'java',
        pattern: /^package\s+[\w.]+;|^import\s+[\w.*]+;|public\s+class\s+\w+|@\w+\s*(\([^)]*\))?/m,
        priority: 5
    },
    // CSS
    {
        language: 'css',
        pattern: /^[\s\w\-\.#\[\],:>+~*]+\s*\{[^}]*\}/m,
        priority: 4
    },
    // SQL
    {
        language: 'sql',
        pattern: /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/i,
        priority: 4
    },
    // YAML
    {
        language: 'yaml',
        pattern: /^---\s*$|^\w+:\s*[\w\s"|'-]/m,
        priority: 4
    },
    // Markdown
    {
        language: 'md',
        pattern: /^#{1,6}\s+\w+|^\*\s+\w+|^\d+\.\s+\w+|^\[[\w\s]+\]\([^)]+\)/m,
        priority: 3
    }
];

export function alternativeDetectLanguage(code: string): string {
    // Sort by priority (higher first)
    const sortedChecks = [...languageChecks].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Try to detect JSON more accurately first
    if (isValidJson(code)) {
        return 'json';
    }
    
    for (const check of sortedChecks) {
        if (check.pattern.test(code)) {
            return check.language;
        }
    }
    
    return 'unknown';
}

// Helper function to validate JSON
function isValidJson(code: string): boolean {
    try {
        // Remove potential BOM
        const cleanCode = code.replace(/^\uFEFF/, '').trim();
        
        // Quick check for JSON-like structure
        if (!cleanCode) return false;
        const firstChar = cleanCode[0];
        const lastChar = cleanCode[cleanCode.length - 1];
        
        if ((firstChar === '{' && lastChar === '}') || 
            (firstChar === '[' && lastChar === ']')) {
            JSON.parse(cleanCode);
            return true;
        }
    } catch (e) {
        // Not valid JSON
    }
    return false;
} 
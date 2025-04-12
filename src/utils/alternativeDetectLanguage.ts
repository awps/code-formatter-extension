type LanguageCheck = {
    language: string;
    pattern: RegExp;
};

const languageChecks: LanguageCheck[] = [
    {
        language: 'php',
        pattern: /^<\?php/ // Stricter PHP check: only look for opening tag
    },
    {
        language: 'json',
        pattern: /\{\s*"\w+"\s*:\s*("[^"]*"\s*|\d+\s*|\{\s*\}\s*|\[\s*\]\s*)\s*(,\s*"\w+"\s*:\s*("[^"]*"\s*|\d+\s*|\{\s*\}\s*|\[\s*\]\s*)\s*)*\}/
    },
    {
        language: 'js',
        pattern: /function\s+\w*\s*\(|var\s+\w*\s*=|console\.|\w+\s*=>\s*\{|let\s+\w*\s*=|const\s+\w*\s*=|\.\s*(map|filter|reduce|forEach)\s*\(/ // Combined JS check
    },
    {
        language: 'python',
        pattern: /^\s*'''|^\s*"""|\b(def|class)\s+\w+\s*\(?[^)]*\)?:|\bimport\s+\w+|\bfrom\s+\w+\s+import\s+/ // Removed hash comment check
    },
    {
        language: 'go',
        pattern: /^package\s+\w+|\bfunc\s+\w+\([^)]*\)\s*\{/ // More robust Go check
    },
    {
        language: 'csharp',
        pattern: /^\s*using\s+[\w.]+;|^\s*namespace\s+\w+\s*\{|\bConsole\.Write(Line)?/ // Fixed Console.Write(Line)? check
    },
    {
        language: 'java',
        pattern: /\b(public|private|protected)?\s*(class|interface|enum)\s+\w+|\bimport\s+[\w.*]+;|\bSystem\.out\.print/ // More robust Java check
    },
    {
        language: 'css',
        pattern: /\{\s*\}|[\w\s\[\]\(\)-]+\s*\{[\w\s\[\]\(\)-:;#.'",=\/*]+\}/ // Combined CSS check
    }
];

export function alternativeDetectLanguage(code: string): string {
    for (const check of languageChecks) {
        if (check.pattern.test(code)) {
            return check.language;
        }
    }
    return 'unknown';
} 
import { detectLanguageWithMimeTypeKnowledge, mightBeJsonFromUrl } from './utils/mimeTypeDetection';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if tab.url exists before testing it
    if (changeInfo.status === 'complete' && tab.url && /^(http|file|data)/.test(tab.url)) {
        // Check if tab.id exists before using it
        if (typeof tab.id === 'undefined') {
            //console.error("Tab ID is undefined.");
            return;
        }

        // Check tab.url again for the URL constructor (although already checked by regex)
        if (!tab.url) {
            //console.error("Tab URL is undefined after regex check?"); // Should not happen
            return;
        }

        // Enhanced language detection
        let programmingLanguage = '';
        
        // Check if it's a data URL
        if (tab.url.startsWith('data:')) {
            // Parse data URL: data:[<mediatype>][;base64],<data>
            const dataUrlMatch = tab.url.match(/^data:([^;,]+)(;base64)?,(.*)$/);
            if (dataUrlMatch) {
                const mimeType = dataUrlMatch[1];
                const isBase64 = !!dataUrlMatch[2];
                
                // Map common MIME types to languages
                if (mimeType.includes('javascript') || mimeType.includes('ecmascript')) {
                    programmingLanguage = 'js';
                } else if (mimeType.includes('json')) {
                    programmingLanguage = 'json';
                } else if (mimeType.includes('css')) {
                    programmingLanguage = 'css';
                } else if (mimeType.includes('xml')) {
                    programmingLanguage = 'xml';
                } else if (mimeType.includes('html')) {
                    programmingLanguage = 'html';
                } else {
                    programmingLanguage = 'auto-detect';
                }
                
                // Store base64 flag in the message
                programmingLanguage = programmingLanguage + (isBase64 ? ':base64' : '');
            }
        } else {
            // Regular URL handling
            const url = new URL(tab.url);
            const pathname = url.pathname;
            const possibleExtension = pathname.split('.').pop() || '';
            
            // Check if we have a file extension
            if (possibleExtension && pathname.includes('.')) {
                programmingLanguage = detectLanguageWithMimeTypeKnowledge(possibleExtension);
            } else if (mightBeJsonFromUrl(tab.url)) {
                // No extension but URL pattern suggests JSON
                programmingLanguage = 'json';
            } else {
                // For URLs without extensions, let content script decide based on content
                // This handles cases where we can't determine from URL alone
                programmingLanguage = 'auto-detect';
            }
        }
        
        // Always proceed - let content script make final decision
        // console.log('[Code Formatter BG] Programming language hint:', programmingLanguage, 'for URL:', tab.url);

        chrome.scripting.executeScript({
            target: {tabId: tab.id, frameIds: [0]}, files: ["./content.min.js",]
        }, function (injectionResults) {
            // Check if script was successfully injected
            if (chrome.runtime.lastError) {
                // console.log('Script injection failed:', chrome.runtime.lastError.message);
                return;
            }
            
            // Ensure tab.id is defined and injection was successful
            if (typeof tab.id !== 'undefined' && injectionResults && injectionResults.length > 0) {
                // Add a small delay to ensure content script is ready
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id!, {
                        programmingLanguage: programmingLanguage
                    }, function(response) {
                        // Handle any errors in message sending
                        if (chrome.runtime.lastError) {
                            // This is normal if the content script decides not to format the page
                            // console.log('Message sending failed:', chrome.runtime.lastError.message);
                        }
                    });
                }, 100);
            }
        });

        chrome.scripting.insertCSS({
            target: {tabId: tab.id, frameIds: [0]}, files: ["./css/content.min.css"]
        })
            .then(() => {
                // console.log("CSS injected successfully");
            })
            .catch(err => {
                // console.log("CSS injection failed:", err);
            });
    }
});

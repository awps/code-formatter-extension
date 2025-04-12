chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if tab.url exists before testing it
    if (changeInfo.status === 'complete' && tab.url && /^(http|file)/.test(tab.url)) {
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

        const url = new URL(tab.url);
        const possibleExtension = url.pathname.split('.').pop();

        // Use possibleExtension directly as the programming language
        const programmingLanguage = possibleExtension;

        chrome.scripting.executeScript({
            target: {tabId: tab.id, frameIds: [0]}, files: ["./content.min.js",]
        }, function () {
            // Ensure tab.id is defined (already checked, but good practice for callback)
            if (typeof tab.id !== 'undefined') {
                chrome.tabs.sendMessage(tab.id, {
                    programmingLanguage: programmingLanguage
                });
            }
        });

        chrome.scripting.insertCSS({
            target: {tabId: tab.id, frameIds: [0]}, files: ["./css/content.min.css"]
        })
            .then(() => {
                // console.log("INJECTED THE FOREGROUND STYLE.");
            })
            .catch(err => console.log(err));
    }
});

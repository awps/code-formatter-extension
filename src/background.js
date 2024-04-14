chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {

        const url = new URL(tab.url);
        const possibleExtension = url.pathname.split('.').pop();

        fetch(tab.url)
            .then(response => {
                // Check if the response status is OK (200-299)
                if (!response.ok) {
                    throw new Error(chrome.i18n.getMessage('networkResponseError'));
                }

                // Get the Content-Type header from the response
                const contentType = response.headers.get('Content-Type');

                let programmingLanguage = '';

                if (!contentType) {
                    return;
                }

                if (contentType.includes('xml')) {
                    programmingLanguage = 'xml';
                } else if (contentType.includes('json')) {
                    programmingLanguage = 'json';
                } else if (contentType.includes('javascript')) {
                    programmingLanguage = 'js';
                } else if (contentType.includes('css')) {
                    programmingLanguage = 'css';
                }

                if (!programmingLanguage) {
                    programmingLanguage = possibleExtension;
                }

                chrome.scripting.executeScript({
                    target: {tabId: tabId}, files: ["./content.min.js",]
                }, function () {
                    chrome.tabs.sendMessage(tab.id, {
                        programmingLanguage: programmingLanguage
                    });
                });

                chrome.scripting.insertCSS({
                    target: {tabId: tabId}, files: ["./css/content.min.css"]
                })
                    .then(() => {
                        // console.log("INJECTED THE FOREGROUND STYLE.");
                    })
                    .catch(err => console.log(err));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});

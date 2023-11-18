chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {

        fetch(tab.url)
            .then(response => {
                // Check if the response status is OK (200-299)
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Get the Content-Type header from the response
                const contentType = response.headers.get('Content-Type');

                // console.log(contentType);

                // Check if the Content-Type header has the value 'application/json'
                if (!contentType || !(contentType.includes('application/json') || contentType.includes('application/javascript') || contentType.includes('text/css'))) {
                    return;
                }

                chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    files: [
                        "./content.min.js",
                    ]
                })
                    .then(() => {
                        // console.log("INJECTED THE FOREGROUND SCRIPT.");
                    })
                    .catch(err => console.log(err));

                chrome.scripting.insertCSS({
                    target: {tabId: tabId},
                    files: ["./css/content.min.css"]
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

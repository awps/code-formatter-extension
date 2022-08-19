chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: [
                "./content.min.js"
            ]
        })
            .then(() => {
                console.log("INJECTED THE FOREGROUND SCRIPT.");
            })
            .catch(err => console.log(err));

        chrome.scripting.insertCSS({
            target: {tabId: tabId},
            files: ["./css/content.min.css"]
        })
            .then(() => {
                console.log("INJECTED THE FOREGROUND STYLE.");
            })
            .catch(err => console.log(err));
    }
});

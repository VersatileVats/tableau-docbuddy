// setting up the context menus
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        "id": "saveSpecificText",
        "title": "Bookmark specific text",
        "contexts": ["selection"]
    });

    chrome.contextMenus.create({
        "id": "saveImage",
        "title": "Save image",
        "contexts": ["image"]
    });

    chrome.contextMenus.create({
        "id": "savePage",
        "title": "Bookmark entire page",
        "contexts": ["page"]
    });
});

// handling the intercation with the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
    let message = ""
    
    if (info.menuItemId === "saveSpecificText") message = "text"

    // for image selection
    else if(info.menuItemId === "saveImage") message = "image"

    // saving the entire page
    else if(info.menuItemId === "savePage") message = "page"

    if(message != "") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                "message": message,
                "data": info
            })
        });
    }

});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.message == "developer_site") {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: './resources/logo128.png',
            title: 'Tableau Devloper Resource Page!',
            message: "🥳 you are on one of the Tableau Developer Site, you can now bookmark pages/images"
        });
    }
    else if(request.message == "contextDuplicacy") {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: './resources/logo128.png',
            title: 'Duplicate Entity!',
            message: "🚫 You have added this particular thing already, can't duplicate"
        });
    }
    else if(request.message == "saved") {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: './resources/logo128.png',
            title: 'Saved!',
            message: "🎉 The entity has been saved successfully"
        });
    }
   
    return "success";
})

chrome.webNavigation.onHistoryStateUpdated.addListener(async function(details) {
    let pageLocation = location.href

    if(
        (pageLocation.includes("tableau.com/developer/tools") && pageLocation.split("tableau.com/developer/tools")[1].length > 5)    ||
        (pageLocation.includes("tableau.com/developer/learning") && pageLocation.split("tableau.com/developer/learning")[1].length > 5) ||
        (pageLocation.includes("help.tableau.com/current/") && pageLocation.split("help.tableau.com/current/")[1].length > 5)   ||
        (pageLocation.includes("tableau.github.io") && pageLocation.split("tableau.github.io")[1].length > 5)
    ) {
      chrome.scripting.executeScript({
        target: {tabId: details.tabId},
        files: ['./content.js']
      });  
    }
  });
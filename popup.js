// setting up the storage variables:
const values = await chrome.storage.local.get()
if(values.entirePage == undefined && values.specificText == undefined && values.image == undefined) {
    await chrome.storage.local.set({
        "entirePage": {
            "embeddingApi": [],
            "restApi": [],
            "dashboardExtensionsApi": [],
            "metadataApi": [],
            "hyperApi": [],
            "connectorSdk": [],
            "analyticsExtensionsApi": [],
            "webDataConnector": [],
            "webhookApi": []
        },
        "specificText": {
            "embeddingApi": [],
            "restApi": [],
            "dashboardExtensionsApi": [],
            "metadataApi": [],
            "hyperApi": [],
            "connectorSdk": [],
            "analyticsExtensionsApi": [],
            "webDataConnector": [],
            "webhookApi": []
        },
        "image": {
            "embeddingApi": [],
            "restApi": [],
            "dashboardExtensionsApi": [],
            "metadataApi": [],
            "hyperApi": [],
            "connectorSdk": [],
            "analyticsExtensionsApi": [],
            "webDataConnector": [],
            "webhookApi": []
        }
    })
}

chrome.tabs.create({ url: "https://versatilevats.com/tableau/demo.html" });
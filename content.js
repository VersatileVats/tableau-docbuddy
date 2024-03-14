const findPageDetails = () => {
    let saveFilter = ""
    let pageTitle = document.title

    // finding out the category in which I will be saving the stuff
    if(pageLocation.includes("embedding-api") || pageLocation.includes("embedding_api")) 
        saveFilter = "embeddingApi"
    
    else if(pageLocation.includes("rest-api") || pageLocation.includes("rest_api")) 
        saveFilter = "restApi"

    else if(pageLocation.includes("/extensions-api") || pageLocation.includes("/dashboard-extensions-api")) 
        saveFilter = "dashboardExtensionsApi"
    
    else if(pageLocation.includes("metadata_api") || pageLocation.includes("metadata-api"))
        saveFilter = "metadataApi"

    else if(pageLocation.includes("hyper-")) 
        saveFilter = "hyperApi"

    else if(pageLocation.includes("connector-")) 
        saveFilter = "connectorSdk"

    else if(pageLocation.includes("analytics-extensions-api")) 
        saveFilter = "analyticsExtensionsApi"

    else if(pageLocation.includes("web-data-connector") || pageLocation.includes("webdataconnector")) 
        saveFilter = "webDataConnector"

    else if(pageLocation.includes("webhook")) 
        saveFilter = "webhookApi"

    return [saveFilter, pageTitle]
}

const glitchCall = async(data, endpoint) => {
    const raw = JSON.stringify(data);
    
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
        method: "POST",
        body: raw,
        headers: myHeaders,
        redirect: "follow"
    };

    if(endpoint.includes("https://versatilevats.com/tableau/server.php")) {
        return await fetch(endpoint, requestOptions)
            .then((response) => response.json())
            .then((response) => response)
            .catch((error) => error);
    } else {
        return await fetch(`https://versatile-tableau.glitch.me/${endpoint}`, requestOptions)
            .then((response) => response.json())
            .then((response) => response)
            .catch((error) => error);
    }

}

const checkStorageValues = async() => {
    let values = await chrome.storage.local.get(["entirePage", "specificText", "image"]).then(data => data)
    
    // the values are not present in the storage
    if(values.entirePage == undefined && values.specificText == undefined && values.image == undefined) {
        chrome.storage.local.set({
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
}

checkStorageValues()

let pageLocation = location.href
if(
    (pageLocation.includes("tableau.com/developer/tools") && pageLocation.split("tableau.com/developer/tools")[1].length > 5)    ||
    (pageLocation.includes("tableau.com/developer/learning") && pageLocation.split("tableau.com/developer/learning")[1].length > 5) ||
    (pageLocation.includes("help.tableau.com/current/") && pageLocation.split("help.tableau.com/current/")[1].length > 5)   ||
    (pageLocation.includes("tableau.github.io") && pageLocation.split("tableau.github.io")[1].length > 5)
) {
    // notifying the user about the developer site
    chrome.runtime.sendMessage({message: "developer_site"});

    // enabling the save functionality
    window.addEventListener("keydown", async(e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
            e.preventDefault()
            alert("Ctrl + S pressed!")
        }
    })
}

// message listener for context menu
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    let [saveFilter, pageTitle] =  findPageDetails()
    console.log(request)
    console.log(saveFilter)

    const storageValues = await chrome.storage.local.get()
    let newValues = storageValues

    let pageLocation = location.href
    // restricting the clicks from another page:
    if(
        !((pageLocation.includes("tableau.com/developer/tools") && pageLocation.split("tableau.com/developer/tools")[1].length > 5)    ||
        (pageLocation.includes("tableau.com/developer/learning") && pageLocation.split("tableau.com/developer/learning")[1].length > 5) ||
        (pageLocation.includes("help.tableau.com/current/") && pageLocation.split("help.tableau.com/current/")[1].length > 5)   ||
        (pageLocation.includes("tableau.github.io") && pageLocation.split("tableau.github.io")[1].length > 5))
    ) {
        return "success"
    }

    let data = {
        "pageTitle": pageTitle,
        "pageUrl": request.data.pageUrl,
        "saveFilter": saveFilter
    }

    let index = "entirePage"

    // selected text and requested to save that
    if(request.message === "text") {
        data["text"] = encodeURIComponent(request.data.selectionText)
        index = "specificText"
    }
    else if(request.message === "image") {
        data["imageUrl"] = request.data.srcUrl 
        index = "image"
    }
    
    // checking if the current text is already saved
    if(index === "specificText") {
        for(let keys in newValues[index][saveFilter]) {
            if((newValues[index][saveFilter][keys].pageUrl === request.data.pageUrl) && (newValues[index][saveFilter][keys].text === encodeURIComponent(request.data.selectionText))) {
                chrome.runtime.sendMessage({message: "contextDuplicacy"})
                return "Already saved!"
            }
        }
    }
    else if(index === "image") {
        for(let keys in newValues[index][saveFilter]) {
            if((newValues[index][saveFilter][keys].pageUrl === request.data.pageUrl) && (newValues[index][saveFilter][keys].imageUrl === request.data.srcUrl)) {
                chrome.runtime.sendMessage({message: "contextDuplicacy"})
                return "Already saved!"
            }
        }
    }
    else {
        for(let keys in newValues[index][saveFilter]) {
            if(newValues[index][saveFilter][keys].pageUrl === request.data.pageUrl) {
                chrome.runtime.sendMessage({message: "contextDuplicacy"})
                return "Already saved!"
            }
        }
    }

    newValues[index][saveFilter][(newValues[index][saveFilter]).length] = data
    await chrome.storage.local.set({
        "entirePage": newValues.entirePage,
        "specificText": newValues.specificText,
        "image": newValues.image
    })

    chrome.runtime.sendMessage({message: "saved"})

    return "success"
})

if(pageLocation.includes("https://versatilevats.com/tableau/demo.html")) {

    const docView = document.body.getAttribute("view")

    const entirePageBookmarksList = document.querySelector("#entirePageBookmarksList")
    const entirePageBookmarksCount = document.querySelector("#entirePageBookmarksCount")
    
    const textBookmarksList = document.querySelector("#textBookmarksList")
    const textBookmarksCount = document.querySelector("#textBookmarksCount")

    entirePageBookmarksList.innerHTML = ""
    textBookmarksList.innerHTML = ""

    const populateImageCarousel = async () => {
        let images = await chrome.storage.local.get()
        const imageCarousel = document.getElementById("imageCarousel");

        const viewId = new URLSearchParams(window.location.search);
        let view = viewId.get('view');

        if(view != null) {
            document.body.setAttribute("view", "share")
            images = await glitchCall({}, `https://versatilevats.com/tableau/server.php?code=${view}`)
            console.log("FETCHED THE VALUES FROM THE SERVER")
            if(images.error != undefined) {
                alert("The view link is not valid!")
                return 
            }
        }

        var modal = document.getElementById("myModal");
        var modalImg = document.getElementById("img01");

        imageCarousel.innerHTML = ""

       for(let keys in images["image"]) {
            for(let keys2 in images["image"][keys]) {
                let img = document.createElement("img")
                img.classList.add("col-md-6", "mb-3", "image-carousel")
                img.style.border = "2px dashed #0D6EFD"
                img.style.borderRadius = "4px"
                img.style.cursor = "pointer"
                img.src = images["image"][keys][keys2]["imageUrl"]
                img.alt = ""
                imageCarousel.appendChild(img)
            }

            document.querySelectorAll(".image-carousel").forEach((item) => {
                item.onclick = function () {
                    modal.style.display = "block";
                    modalImg.src = this.src;
                };
            });
       }
    };

    const imageGallery = () => {
        const imageGallery = document.getElementById("imageGallery");
        const nonImageGallery = document.getElementById("nonImageGallery");

        if (imageGallery.style.display === "block") {
          imageGallery.style.display = "none";
          nonImageGallery.style.display = "block";
          return;
        }

        // populate the image carousel
        populateImageCarousel() 

        imageGallery.style.display = "block";
        nonImageGallery.style.display = "none";
    };

    document.querySelector("#imageGalleryDiv").addEventListener("click", imageGallery);
    document.querySelector("#imageParaBack").addEventListener("click", imageGallery);

    var span = document.getElementsByClassName("close")[0];

    span.onclick = function () {
        document.getElementById("myModal").style.display = "none";
    };

    const paintUI = async() => {
        let storageValues = await chrome.storage.local.get()
        console.log(storageValues)

        const viewId = new URLSearchParams(window.location.search);
        let view = viewId.get('view');
        
        if(view != null) {
            document.body.setAttribute("view", "share")
            storageValues = await glitchCall({}, `https://versatilevats.com/tableau/server.php?code=${view}`)
            console.log("FETCHED THE VALUES FROM THE SERVER")
            if(storageValues.error != undefined) {
                alert("The view link is not valid!")
                return 
            }
        }

        const shareDiv = document.getElementById("share");

        const share = async () => {
            const storageValues = await chrome.storage.local.get()
            const response = await glitchCall(storageValues, "https://versatilevats.com/tableau/server.php")
            await navigator.clipboard.writeText(`https://versatilevats.com/tableau/demo.html?view=${response.code}`);
            alert("Woohoo! 🥳 View Link has been created/updated and is now copied to your clipboard")
        }

        const setShareType = () => {
            // mobile is not there
            if(storageValues["mobile"] === undefined) shareDiv.setAttribute("step", "mobile")
            else if(storageValues["verify"] === undefined) shareDiv.setAttribute("step", "verify")
            else shareDiv.setAttribute("step", "share") 
        }

        const sendCode = async (mobile, element) => {
           if(mobile.length > 10) {
                const code = await glitchCall({"mobile": mobile}, "sendOTP")
                console.log(code)
                if(code.error == undefined) {
                    let values = storageValues
                    await chrome.storage.local.set({
                        "entirePage": values.entirePage,
                        "specificText": values.specificText,
                        "image": values.image,
                        "mobile": mobile,
                        "code": code["code"]
                    })

                    shareDiv.setAttribute("step", "verify")
                    location.reload()
                }
           }     
        }

        const verifyCode = async (code, element) => {
            let storageValues = await chrome.storage.local.get()
            let values = storageValues
            if(values.code == code) {
                await chrome.storage.local.set({
                    "entirePage": values.entirePage,
                    "specificText": values.specificText,
                    "image": values.image,
                    "mobile": values.mobile,
                    "code": values.code,
                    "verify": true
                })

                shareDiv.setAttribute("step", "share")
                location.reload()
            }
        }

        const populateShareDiv = () => {
            const shareStep = shareDiv.getAttribute("step")

            if(shareStep === "mobile") {
                let div = document.createElement("div")
                div.style.marginRight = "1rem"
                div.textContent = "Enter you mobile number, before sharing this view"

                let input = document.createElement("input")
                input.classList.add("form")
                input.style.borderRadius = "6px"
                input.style.textAlign = "center"
                input.type = "password"
                input.id = "mobileNumber"
                input.addEventListener("keyup", (e) => {
                    if(e.key === "Enter") sendCode(e.target.value, e.target)
                })

                shareDiv.appendChild(div)
                shareDiv.appendChild(input)
            }

            if(shareStep === "verify") {
                let div = document.createElement("div")
                div.style.marginRight = "1rem"
                div.textContent = `6-digit code sent to your mobile ${storageValues.mobile}, please enter`

                let input = document.createElement("input")
                input.classList.add("form")
                input.style.borderRadius = "6px"
                input.style.textAlign = "center"
                input.type = "password"
                input.id = "verifyNumber"
                input.addEventListener("keyup", (e) => {
                    if(e.key === "Enter") 
                        verifyCode(e.target.value, e.target)
                })

                shareDiv.appendChild(div)
                shareDiv.appendChild(input)
            }

            if(shareStep === "share") {
                let img = document.createElement("img")
                img.width = "30"
                img.height = "30"
                img.src = "https://img.icons8.com/fluency/30/share--v2.png"
                img.alt = "share--v2"
                img.style.marginRight = "1rem"

                let div = document.createElement("div")
                div.style.textAlign = "justify"
                div.textContent = "As you have linked your whatsapp number, share the current bookmarks with anyone"

                shareDiv.appendChild(img)
                shareDiv.appendChild(div)

                shareDiv.style.cursor = "pointer"
                shareDiv.addEventListener("click", share);
            }    
        }

        await setShareType()
        await populateShareDiv()

        // owner is seeing the page
        if(document.body.getAttribute("view") === "own") {
            shareDiv.style.display = "flex";
        } else {
            shareDiv.style.pointerEvents = "none";
            shareDiv.textContent = "You can't access the link in Share View "
        }
        
        let entirePageCount = 0
        let textPageCount = 0

        // setting the UI for "entirePage" section
        for(let keys in  storageValues["entirePage"]) {
            if(storageValues["entirePage"][keys].length > 0) {
                for(let key2 in storageValues["entirePage"][keys]) {
                    console.log(storageValues["entirePage"])
                    entirePageCount++
        
                    let div = document.createElement("div")
                    div.classList.add("d-flex")
                    div.style.margin = "5px"
                    div.setAttribute("type", "entirePage")
                    div.setAttribute("filter", storageValues["entirePage"][keys][key2]["saveFilter"])
                    div.setAttribute("pageUrl", storageValues["entirePage"][keys][key2]["pageUrl"])
                    div.setAttribute("pageTitle", storageValues["entirePage"][keys][key2]["pageTitle"])
        
                    
                    if(document.body.getAttribute("view") == "own") {
                        let img = document.createElement("img")
                        img.width = "20"
                        img.height = "20"
                        img.src = "https://img.icons8.com/plasticine/20/filled-trash.png"
                        img.style.marginRight = "5px"
                        img.style.cursor = "pointer"

                        img.addEventListener("click", async (e) => {
                            let storageValues = await chrome.storage.local.get()
                            storageValues[e.target.parentElement.getAttribute("type")][e.target.parentElement.getAttribute("filter")] = storageValues[e.target.parentElement.getAttribute("type")][e.target.parentElement.getAttribute("filter")].filter(
                                item => {
                                    return (
                                        (item["pageUrl"] == e.target.parentElement.getAttribute("pageUrl")) && (item["pageTitle"] != e.target.parentElement.getAttribute("pageTitle")) && (item["text"] != e.target.parentElement.getAttribute("text"))
                                    )
                                }
                            )

                            await chrome.storage.local.set({
                                "entirePage": storageValues["entirePage"],
                                "specificText": storageValues["specificText"],
                                "image": storageValues["image"]
                            })

                            location.reload()
                        })

                        div.appendChild(img)
                    }

                    let a = document.createElement("a")
                    a.textContent = `${entirePageCount}. ${storageValues["entirePage"][keys][key2]["pageTitle"]}`
                    a.setAttribute("href", storageValues["entirePage"][keys][key2]["pageUrl"])
                    a.style.textDecoration = "none"
                    a.setAttribute("target", "_blank")
                    div.appendChild(a)
        
                    entirePageBookmarksList.appendChild(div)
                }
            }
        }

        entirePageBookmarksCount.textContent = entirePageCount

        if(entirePageCount == 0) {
            let div = document.createElement("div")
            div.classList.add("d-flex")
            div.style.justifyContent = "center"
            div.style.alignItems = "center"
            div.style.height = "100%"

            let img = document.createElement("img")
            img.width = "80"
            img.height = "80"
            img.src = "https://img.icons8.com/dotty/80/cancel-2.png"

            div.appendChild(img)
            entirePageBookmarksList.style.alignItems = "center"
            entirePageBookmarksList.appendChild(div)
        } else {
            entirePageBookmarksList.style.alignItems = "flex-start"
        }


        console.log(storageValues["specificText"])
        //  setting the UI for "specificText" section
        for(let keys in  storageValues["specificText"]) {
            if(storageValues["specificText"][keys].length > 0) {
                for(let key2 in storageValues["specificText"][keys]) {
                    console.log(storageValues["specificText"][keys][key2])
                    textPageCount++
        
                    let div = document.createElement("div")
                    div.classList.add("d-flex")
                    div.style.margin = "5px"
                    div.setAttribute("type", "specificText")
                    div.setAttribute("text", storageValues["specificText"][keys][key2]["text"])
                    div.setAttribute("pageUrl", storageValues["specificText"][keys][key2]["pageUrl"])
                    div.setAttribute("filter", storageValues["specificText"][keys][key2]["saveFilter"])
                    div.setAttribute("pageTitle", storageValues["specificText"][keys][key2]["pageTitle"])
        
                    
                    if(document.body.getAttribute("view") == "own") {
                        let img = document.createElement("img")
                        img.width = "20"
                        img.height = "20"
                        img.src = "https://img.icons8.com/plasticine/20/filled-trash.png"
                        img.style.marginRight = "5px"
                        img.style.cursor = "pointer"
                        
                        img.addEventListener("click", async (e) => {
                            let storageValues = await chrome.storage.local.get()
                            storageValues[e.target.parentElement.getAttribute("type")][e.target.parentElement.getAttribute("filter")] = storageValues[e.target.parentElement.getAttribute("type")][e.target.parentElement.getAttribute("filter")].filter(
                                item => {
                                    return (
                                        (item["pageUrl"] == e.target.parentElement.getAttribute("pageUrl")) && (item["pageTitle"] != e.target.parentElement.getAttribute("pageTitle")) && (item["text"] != e.target.parentElement.getAttribute("text"))
                                    )
                                }
                            )

                            await chrome.storage.local.set({
                                "entirePage": storageValues["entirePage"],
                                "specificText": storageValues["specificText"],
                                "image": storageValues["image"]
                            })

                            location.reload()
                        })

                        div.appendChild(img)
                    }
        
                    let a = document.createElement("a")
                    a.innerHTML = `<span style="color: black">${textPageCount}. ${storageValues["specificText"][keys][key2]["pageTitle"]}</span> (${decodeURIComponent(storageValues["specificText"][keys][key2]["text"]).substring(0, 20)}..)`
                    a.setAttribute("href", `${storageValues["specificText"][keys][key2]["pageUrl"]}#:~:text=${storageValues["specificText"][keys][key2]["text"]}`)
                    a.style.textDecoration = "none"
                    a.setAttribute("target", "_blank")
                    div.appendChild(a)
        
                    textBookmarksList.appendChild(div)
                }
            }
        }

        textBookmarksCount.textContent = textPageCount

        if(textPageCount == 0) {
            let div = document.createElement("div")
            div.classList.add("d-flex")
            div.style.justifyContent = "center"
            div.style.alignItems = "center"
            div.style.height = "100%"

            let img = document.createElement("img")
            img.width = "80"
            img.height = "80"
            img.src = "https://img.icons8.com/dotty/80/cancel-2.png"

            div.appendChild(img)
            textBookmarksList.style.alignItems = "center"
            textBookmarksList.appendChild(div)
        } else {
            textBookmarksList.style.alignItems = "flex-start"
        }

    }

    paintUI()

}
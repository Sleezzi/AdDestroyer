let isBlocking = false;
let response;
(async () => {
    response = await chrome.runtime.sendMessage("getActive");
    if (response !== true) return console.warn("AdDestroyer is disable :/", response);
    response = await chrome.runtime.sendMessage(`getHiddenElement$url=${window.location.host}`);
    let blockedElement;
    const hidder = document.createElement("style");
    if (response.length > 0) response.forEach(element => {
        console.log(element);
        blockedElement = `${(blockedElement === undefined || blockedElement === null ? "" : `${blockedElement}, `)}${element.replaceAll("%20", " ")}`;
    });
    document.head.appendChild(hidder);
    response = await chrome.runtime.sendMessage(`getHideType`);
    hidder.innerHTML = `${blockedElement} { display: none !important; opacity: 0 !important; }`;
    hidder.id = "AdDestroyer - Remove ALL ads in this page";
    console.log("AdDestroyer was here :)");
})();


function getSelector(element) {
    const selectors = [];
    let currentElement = element;

    while (currentElement && currentElement.tagName !== "BODY") {
        let selector = currentElement.tagName.toLowerCase();
        if (currentElement.id) {
            selector += "#" + currentElement.id;
            selectors.unshift(selector);
            break; // Arrêtez la recherche lorsque vous trouvez un élément avec un ID unique
        } else {
            const siblings = currentElement.parentNode.children;
            if (siblings.length > 1) {
                let index = Array.from(siblings).indexOf(currentElement) + 1;
                selector += `:nth-child(${index})`;
            }
            selectors.unshift(selector);
            currentElement = currentElement.parentElement;
        }
    }

    return selectors.join(" > ");
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    let selectedElement = "unset";
    if (`${message}` === "blockAnElement") {
        if (isBlocking) {
			isBlocking = false;
            document.removeEventListener("mouseup", function() {});
            document.removeEventListener("mouseover", function() {});
            document.removeEventListener("mouseout", function() {});
		} else {
			isBlocking = true;
            if (!document.getElementById("AdDestroyer - Remove ALL ads in this page")) {
                hidder.id = "AdDestroyer - Remove ALL ads in this page";
            }
            if (!`${document.getElementById("AdDestroyer - Remove ALL ads in this page").innerHTML}`.endsWith(" .AdDestroyerSelection { background: rgba(255, 0, 0, 0.5) !important; color: black !important;")) {
                document.getElementById("AdDestroyer - Remove ALL ads in this page").innerHTML = `${document.getElementById("AdDestroyer - Remove ALL ads in this page").innerHTML} .AdDestroyerSelection { background: rgba(255, 0, 0, 0.5) !important; color: black !important; border: 1px solid rgba(255, 0, 0, 0.5) !important;`;
            }
            document.addEventListener('mouseover', function(event) {
                if (selectedElement !== "unset" || !isBlocking) return;
                event.target.classList.add('AdDestroyerSelection');
            });
            document.addEventListener('mouseup', function(event) {
                if (!isBlocking || event.target.tagName === "HTML" || event.target.tagName === "BODY") return;
                event.target.classList.remove('AdDestroyerSelection');
                sendResponse(`mask:${window.location.host}|${event.target.outerHTML}`);
                event.preventDefault();
                event.stopPropagation();
                (async () => {
                    response = await chrome.runtime.sendMessage(`addHiddenElement$url=${window.location.host}$element=${`${getSelector(event.target)}`.replaceAll("  ", "").replaceAll("\n", "").replaceAll(" ", "%20")}`);
                    console.log(response);
                })();
                selectedElement = event.target;
                event.target.style.display = "none";
                isBlocking = false;
            });
            document.addEventListener('mouseout', function(event) {
                if (selectedElement !== "unset") return;
                event.target.classList.remove('AdDestroyerSelection');
            });
            document.addEventListener('click', function(event) {
                event.preventDefault();
            });
        }
    }
    if (`${message}` === "reload") {
        window.location.reload();
    }
    if (`${message}` === "getHost") {
        sendResponse(window.location.host);
    }
});
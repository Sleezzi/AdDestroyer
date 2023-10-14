console.log("AdsDestroyer was here :)");

let isBlocking = false;

document.addEventListener("DOMContentLoaded", async function() {
    let response = await chrome.runtime.sendMessage("getActive");
    console.warn("AdsDestroyer is disable :/", response);
    if (response !== true) return console.warn("AdsDestroyer is disable :/");
});

if (localStorage.getItem("maskedElement") === undefined || localStorage.getItem("maskedElement") === null) {
    localStorage.setItem('maskedElement', "[]");
} else {
    let blockedElement;
    const hidder = document.createElement("style");
    JSON.parse(localStorage.getItem("maskedElement")).forEach(element => {
        blockedElement = `${(blockedElement === undefined ? "" : `${blockedElement}, `)}${element}`;
    });
    document.head.appendChild(hidder);
    hidder.innerHTML = `${blockedElement} { display: none !important; opacity: 0 !important; }`;
    hidder.id = "AdsDestroyer - Remove ALL ads in this page";
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
            if (!document.getElementById("AdsDestroyer - Remove ALL ads in this page").innerHTML.endsWith(" .AdsDestroyerSelection { background: rgba(255, 0, 0, 0.5);")) {
                document.getElementById("AdsDestroyer - Remove ALL ads in this page").innerHTML = `${document.getElementById("AdsDestroyer - Remove ALL ads in this page").innerHTML} .AdsDestroyerSelection { background: rgba(255, 0, 0, 0.5);`;
            }
            document.addEventListener('mouseover', function(event) {
                if (selectedElement !== "unset" || !isBlocking) return;
                event.target.classList.add('AdsDestroyerSelection');
            });
            document.addEventListener('mouseup', function(event) {
                if (!isBlocking) return;
                event.target.classList.remove('AdsDestroyerSelection');
                sendResponse(`mask:${window.location.host}|${event.target.outerHTML}`);
                event.preventDefault();
                event.stopPropagation();
                let maskedElement = JSON.parse(localStorage.getItem('maskedElement')) || [];

                if (event.target.parentNode.children.length > 1) {
                    maskedElement.push(`${event.target.parentNode.tagName.toLowerCase()}
                    ${(event.target.parentNode.id ? `#${event.target.parentNode.id}` : "")}
                     > ${event.target.tagName.toLowerCase()}
                    ${(event.target.id ? `#${event.target.id}` : "")}
                    :nth-child(${Array.from(event.target.parentNode.children).indexOf(event.target)+1})`.replaceAll("\n", "").replaceAll("  ", ""));
                    // if (event.target.previousElementSibling.id) {
                    //     maskedElement.push(`${event.target.previousElementSibling.tagName.toLowerCase()}${(event.target.id ? `#${event.target.id}` : "")} > ${event.target.tagName.toLowerCase()}`);
                    // } else {
                    //     maskedElement.push(`${event.target.previousElementSibling.tagName.toLowerCase()}${(event.target.id ? `#${event.target.id}` : "")} > ${event.target.tagName.toLowerCase()}#${event.target.id}`);
                    // }
                } else {
                    maskedElement.push(
                        `${event.target.tagName.toLowerCase()}
                        ${(event.target.id ? `#${event.target.id}` : "")}`
                    );
                }
                // maskedElement.push((event.target.id > 0 ? `${event.target.tagName.toLowerCase()}#${event.target.id}` :
                // (event.target.classList.length > 0 ? `${event.target.tagName.toLowerCase()}.${`${event.target.classList}`.replace(" ", ".")}` :
                // `${(event.target.previousElementSibling.id ? `${event.target.previousElementSibling.tagName.toLowerCase()}#${event.target.previousElementSibling.id}` :
                // (event.target.previousElementSibling.classList.length > 0 ? 
                // `${event.target.previousElementSibling.tagName.toLowerCase()}.${`${event.target.previousElementSibling.classList}`.replace(" ", ".")}` :
                // event.target.previousElementSibling.tagName.toLowerCase()))} > ${event.target.tagName.toLowerCase()}`)));
                localStorage.setItem('maskedElement', JSON.stringify(maskedElement));
                selectedElement = event.target;
                event.target.style.display = "none";
                isBlocking = false;
            });
            document.addEventListener('mouseout', function(event) {
                if (selectedElement !== "unset") return;
                event.target.classList.remove('AdsDestroyerSelection');
            });
        }
    }
    if (`${message}` === "reload") {
        window.location.reload();
    }
});
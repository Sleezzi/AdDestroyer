document.addEventListener("DOMContentLoaded", async function() {
    const active = document.getElementById("active");
    const mask = document.getElementById("mask");
    if (window.location.href.endsWith("?options")) {
        document.getElementById("popup").style.display = "none";
        document.getElementById("options").style.display = "flex";
    }
    let response = await chrome.runtime.sendMessage("getActive");
    if (response === true) {
        active.innerText = "On";
        active.style.background = "green";
    } else {
        active.innerHTML = "Off";
        active.style.background = "red";
    }
    active.onmouseup = async function() {
        this.innerText = "Please wait...";
        active.style.background = "gray";
        response = await chrome.runtime.sendMessage("setActive");
        if (response === true) {
            active.innerText = "On";
            active.style.background = "green";
        } else {
            active.innerHTML = "Off";
            active.style.background = "red";
        }
    };
    mask.onmouseup = async function() {
        // response = await chrome.tabs.sendMessage("mask");
        // if (!response.startWith("mask:")) return;
        mask.innerText = "...";
        // document.getElementById("maskedElement").innerHTML = `"${response.replace("mask:")}"`;
        // chrome.storage.local.({ `maskedElement:${chrome.tabs.getCurrent()}`:  response.replace("mask:") })
    }
});
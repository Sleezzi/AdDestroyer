document.addEventListener("DOMContentLoaded", async function() {
    const active = document.getElementById("active");
    let response;
    if (window.location.href.endsWith("?options")) {
        document.getElementById("maskElement").style.display = "none";
    }
    if (window.location.href.endsWith("?maskElement")) {
        document.getElementById("maskElementPopup").style.display = "flex";
        document.getElementById("popup").style.display = "none";
    }
    response = await chrome.runtime.sendMessage("getActive");
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
    document.getElementById("maskElement").onmouseup = async function() {
        document.getElementById("maskElement").style.background = "black";
        chrome.runtime.sendMessage("blockAnElement");
    }
});
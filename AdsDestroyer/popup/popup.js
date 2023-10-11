document.addEventListener("DOMContentLoaded", async function() {
    const active = document.getElementById("active");
    const Day = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ];
    let response;
    if (window.location.href.endsWith("?options")) {
        document.body.classList.add("settings");
        response = await chrome.runtime.sendMessage("getBlockedURL");
        for (url in response) {
            if (url !== "total") {
                if (url == "null") {
                    response.total = (response.total - response[url].total);
                } else {
                    const element = document.createElement("tr");
                    element.innerHTML = `<th>${url}</th><th>${response[url].total} fois</th>`;
                    document.querySelector("div#adBlockedContainer > div > table").appendChild(element);
                }
            }
        }
        const element = document.createElement("tr");
        element.innerHTML = `<th>Total</th><th>${(response.total ? response.total : 0)}</th>`;
        document.querySelector("div#adBlockedContainer > div > table").appendChild(element);
    }
    // if (window.location.href.includes("?options&website=")) {
    //     document.body.classList.add("settings");
    //     response = { "youtube.com": { total: 1, at: { 0: 10, 2: 30, 3: 10, 4: 150, 5: 340, 6: 270 }} }; // await chrome.runtime.sendMessage("getBlockedURL");
    //     const canvas = document.createElement("canvas");
    //     const chart = new Chart(canvas, {
    //         type: "bar",
    //         labels: Day,
    //         datasets: [{
    //             data: [
    //                 response[window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, "")].at[0],
    //                 response[window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, "")].at[1],
    //                 response[window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, "")].at[2],
    //                 response[window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, "")].at[3],
    //                 response[window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, "")].at[4],
    //                 response[window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, "")].at[5],
    //                 response[window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, "")].at[6]
    //             ]
    //         }]
    //     });
    //     document.body.appendChild(canvas);
    // }
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
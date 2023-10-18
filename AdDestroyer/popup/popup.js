document.addEventListener("DOMContentLoaded", async function() {
    const active = document.getElementById("active");
    let response;
    // Show the list of blocked request
    if (window.location.href.endsWith("?options")) {
        document.body.classList.add("settings");
        response = await chrome.runtime.sendMessage("getBlockedURL");
        let stats = {
            type: "line",
            data: {
                labels: [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ],
                datasets: []
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
        for (url in response) {
            if (url !== "total") {
                if (`${url}` === "null" || `${url}` === "undefined" || `${url}`.startsWith(`chrome-extension://${chrome.runtime.id}`)) {
                    response.total = response.total - response[url].total;
                } else {
                    stats.data.datasets.push({
                        label: url,
                        data: response[url].at,
                        borderWidth: 1
                    });
                }
            }
        }
        document.querySelector("canvas").setAttribute("height", "35%");
        const chart = new Chart(document.querySelector("canvas").getContext('2d'), stats);
    }
    // Show additional information about a single website
    if (window.location.href.includes("?options&website=")) {
        document.body.classList.add("chart");
        response = await chrome.runtime.sendMessage(`getBlockedURL$website=${window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, "")}`); 
        document.querySelector("canvas").setAttribute("height", "45%");
        const chart = new Chart(document.querySelector("canvas").getContext('2d'), {
            type: "bar",
            data: {
                labels: [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ],
                datasets: [{
                    label: window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, ""),
                    data: response.at,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    // Set On if the extension is active
    response = await chrome.runtime.sendMessage("getActive");
    if (response === true) {
        active.innerText = "On";
        active.style.background = "green";
    } else {
        active.innerHTML = "Off";
        active.style.background = "red";
    }
    // response = await chrome.runtime.sendMessage("getHost");
    // document.getElementById("#options").setAttribute("href", `?options&website=${response}`);
    // Set ON/OFF
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
    // Mask an element
    document.getElementById("maskElement").onmouseup = async function() {
        document.getElementById("maskElement").style.background = "black";
        chrome.runtime.sendMessage("blockAnElement");
    }
});
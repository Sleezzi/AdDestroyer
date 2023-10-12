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
                    element.innerHTML = `<th><a style="text-decoration:underline;color:unset;" href="chrome-extension://${window.location.host}/popup/popup.html?options&website=${url}">${url}</a></th><th>${response[url].total} fois</th>`;
                    document.querySelector("div#adBlockedContainer > div > table").appendChild(element);
                }
            }
        }
        const element = document.createElement("tr");
        element.innerHTML = `<th>Total</th><th>${(response.total ? response.total : 0)}</th>`;
        document.querySelector("div#adBlockedContainer > div > table").appendChild(element);
    }
    if (window.location.href.includes("?options&website=")) {
        document.body.classList.add("chart");
        response = await chrome.runtime.sendMessage(`getBlockedURL$website=${window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, "")}`); 
        console.log(response);
        const canvas = document.querySelector("canvas").getContext('2d');
        const chart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ],
                datasets: [{
                    label: window.location.href.replace(`chrome-extension://${window.location.host}/popup/popup.html?options&website=`, ""),
                    data: response.at,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
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
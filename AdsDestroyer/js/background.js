let lastBlockedURL;
let active = true;
let settings = { blacklist: [] };

chrome.storage.local.get("active", value => active = value.active);

function updateURL() {
	if (!navigator.onLine) {
		chrome.action.setPopup({ popup: "/popup/internet.html" });
		chrome.action.setTitle({title: `AdsDestroyer - Unenabled`});
		return;
	} else chrome.action.setPopup({ popup: "/popup/popup.html" });
	fetch("https://sleezzi.github.io/AdsDestroyer/URL.json", { method: "GET", "cache": "no-store" })
	.then(response => response.json())
	.then(async (BlockedURL) => {
		if (lastBlockedURL === BlockedURL) return;
		lastBlockedURL = BlockedURL;
		let id = 1;
		await chrome.declarativeNetRequest.getDynamicRules().then(response => {
			response.forEach(r => {
				chrome.declarativeNetRequest.updateDynamicRules({
					removeRuleIds: [r.id]
				});
			});
		});
		if (!active) return console.log("Active AdsDestroy to use it.", active);;
		BlockedURL.forEach(url => {
			chrome.declarativeNetRequest.updateDynamicRules({
				addRules: [{
					'id': id,
					'priority': 1,
					'action': {
						'type': 'block'
					},
					'condition': {
						'urlFilter': url,
						// "initiatorDomains" : [`${new URL(url).origin}`],
						'resourceTypes': [
							'csp_report', 'font', 'image', 'main_frame', 'media', 'object', 'other', 'ping', 'script',
							'stylesheet', 'sub_frame', 'webbundle', 'websocket', 'webtransport', 'xmlhttprequest'
						]
					}
				}],
				removeRuleIds: [id++]
			});
			id++;
		});
		chrome.action.setBadgeText({ text: `${BlockedURL.length}` });
		chrome.action.setBadgeBackgroundColor({color: '#FF0000'});
		chrome.action.setTitle({title: `AdsDestroyer - Enable`});
	}).catch(err => {
		chrome.action.setPopup({ popup: "/popup/internet.html" });
		chrome.action.setTitle({title: `AdsDestroyer - Unenabled`});
		return;
	});
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (`${message}` === "setActive") {
		if (active) {
			active = false;
			chrome.action.setBadgeText({ text: `` });
			chrome.action.setTitle({ title: `AdsDestroyer - Unenable` });
			sendResponse(active);
		} else {
			active = true;
			sendResponse(active);
		}
		chrome.storage.local.set({"active": active});
		updateURL();
	}
	if (`${message}` === "getActive") {
		sendResponse(active);
	}
	if (`${message}` === "getSettings") {
		sendResponse(settings);
	}
});

updateURL();
setInterval(updateURL, 15_000);
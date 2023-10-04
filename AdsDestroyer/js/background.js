let lastBlockedURL;
let active = true;
let settings = { blacklist: [] };
let blockedURL = 0;

chrome.storage.local.get("active", value => active = value.active ?? true);
chrome.storage.local.get("blockedURL", value => {if (value.blockedURL) blockedURL = value.blockedURL; chrome.action.setBadgeText({ text: blockedURL.toString() });});

chrome.webRequest.onBeforeRedirect.addListener(details => {
    if (details.url.startsWith("https://sleezzi.github.io/AdsDestroyer/editedURL/") && active) {
		blockedURL++;
		chrome.storage.local.set({"blockedURL": blockedURL});
      	chrome.action.setBadgeText({ text: blockedURL.toString() });
    }
  },
  { urls: ["<all_urls>"] }
);

function removeURL() {
	chrome.declarativeNetRequest.getDynamicRules().then(response => {
		response.forEach(r => {
			chrome.declarativeNetRequest.updateDynamicRules({
				removeRuleIds: [r.id]
			});
		});
	});
}

function updateURL() {
	if (!navigator.onLine) {
		chrome.action.setPopup({ popup: "/popup/internet.html" });
		chrome.action.setTitle({title: `AdsDestroyer - Unenabled`});
		chrome.action.setIcon({path: { 128: "/img/icon/DisabledLogo.png" } });
		chrome.action.setBadgeText({ text: `` });
		return;
	} else chrome.action.setPopup({ popup: "/popup/popup.html" });
	fetch("https://sleezzi.github.io/AdsDestroyer/URL.json", { method: "GET", "cache": "no-cache", mode: "no-cors" })
	.then(response => response.json())
	.then((BlockedURL) => {
		if (lastBlockedURL !== BlockedURL) {
			lastBlockedURL = BlockedURL;
			let id = 1;
			removeURL();
			chrome.action.setIcon({path: { 128: "/img/icon/DisabledLogo.png" } });
			
			if (!active) return console.log("Active AdsDestroy to use it.", active);
			for (url in BlockedURL) {
				chrome.declarativeNetRequest.updateDynamicRules({
					addRules: [{
						'id': id,
						'priority': BlockedURL[url].priority,
						"action": BlockedURL[url].action,
						'condition': {
							'urlFilter': url,
							'resourceTypes': [
								'csp_report', 'font', 'image', 'main_frame', 'media', 'object', 'other', 'ping', 'script',
								'stylesheet', 'sub_frame', 'webbundle', 'websocket', 'webtransport', 'xmlhttprequest'
							]
						}
					}],
					removeRuleIds: [id++]
				});
				id++;
			}
			chrome.action.setTitle({title: `AdsDestroyer - Enable`});
			chrome.action.setIcon({path: { 128: "/img/icon/Logo128.png" }});
			chrome.action.setBadgeText({ text: blockedURL.toString() });
		}
	}).catch(err => {
		chrome.action.setTitle({title: `AdsDestroyer - Unenabled`});
		chrome.action.setIcon({path: { 128: "/img/icon/DisabledLogo.png" } });
		console.error(err);
		return;
	});
}

async function sendMessageToCurrentTab(message) {
	const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  	const response = await chrome.tabs.sendMessage(tab.id, message);
	return response;
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (`${message}` === "setActive") {
		if (active) {
			active = false;
			removeURL();
			chrome.action.setBadgeText({ text: `` });
			chrome.action.setTitle({ title: `AdsDestroyer - Unenable` });
			chrome.action.setIcon({path: { 128: "/img/icon/DisabledLogo.png" }});
			sendResponse(active);
		} else {
			active = true;
			sendResponse(active);
		}
		chrome.storage.local.set({"active": active});
		updateURL();
		sendMessageToCurrentTab("reload");
	}
	if (`${message}` === "getActive") {
		sendResponse(active);
	}
	if (`${message}` === "getSettings") {
		sendResponse(settings);
	}
	if (`${message}` === "blockAnElement") {
		sendMessageToCurrentTab("blockAnElement");
		sendResponse(true);
	}
});

chrome.action.setBadgeBackgroundColor({color: '#FF0000'});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === 'install') {
		chrome.tabs.create({url: 'installed.html'});
	} else if (reason === "update") {
		chrome.tabs.create({url: 'updated.html'});
	}
});

updateURL();
setInterval(updateURL, 5_000);
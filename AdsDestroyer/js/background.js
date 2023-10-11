let blockedURL = { blockedURL: {}, blocked: { total: 0 }, whitelist: [ "undefined", "chrome://", "chrome-extension://", "chrome-extension://dfegmgnckimhngnbckkikgndcbmmcaem", "file://" ] };
let active = true;

chrome.storage.local.get("active", value => active = value.active ?? true);
chrome.storage.local.get("blockedURL", value => {
	if (value.blockedURL) blockedURL.blocked = value.blockedURL;
	if (active) {
		chrome.action.setBadgeText({ text: blockedURL.blocked.total.toString()});
		chrome.action.setTitle({title: `AdsDestroyer - Enable`});
		chrome.action.setIcon({path: { 128: "/img/icon/Logo128.png" }});

	} else {
		chrome.action.setTitle({ title: `AdsDestroyer - Unenable` });
		chrome.action.setIcon({path: { 128: "/img/icon/DisabledLogo.png" }});
	}
});



chrome.webRequest.onBeforeRequest.addListener(details => {
	if (`${details.initiator}`.includes("https://")) details.initiator = details.initiator.replace("https://", "");
	if (`${details.initiator}`.includes("http://")) details.initiator = details.initiator.replace("http://", "");
	if (`${details.initiator}`.includes("www.")) details.initiator = details.initiator.replace("www.", "");
	if (!active || blockedURL.whitelist.find(url => url === details.initiator) !== undefined) return console.log("Request not blocked", details);;
	for (url in blockedURL.blockedURL) {
		if (details.url.indexOf(url) && blockedURL.blockedURL[url].action.type !== "allow" &&
		(!blockedURL.blockedURL[url].ressourceTypes || blockedURL.blockedURL[url].ressourceTypes.includes(details.type))) {
			if (blockedURL.blocked[details.initiator] !== "undefined" || blockedURL.blocked[details.initiator] !== "null") {
				if (blockedURL.blocked[details.initiator]) {
					blockedURL.blocked[details.initiator].total++;
				} else blockedURL.blocked[details.initiator] = { total: 1, at: { 0: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }};
				blockedURL.blocked[details.initiator].at[(new Date().getDate())-1]++;
			}

			blockedURL.blocked.total++;
			console.log(`Request "${`${details.url}`.replace("https://", "").replace("www.", "").replace("http://", "")}" blocked from "${details.initiator}" (method: '${details.method}', type: "${details.type}")`, );
			chrome.storage.local.set({"blockedURL": blockedURL.blocked});
			chrome.action.setBadgeText({ text: blockedURL.blocked.total.toString() });
			return;
		}
	}
},
{ urls: ["<all_urls>"] });

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
	if (!navigator.onLine) return;
	fetch("https://sleezzi.github.io/AdsDestroyer/URL.json", { method: "GET", "cache": "no-cache", mode: "no-cors" })
	.then(response => response.json())
	.then(BlockedURL => {
		if (blockedURL.blockedURL !== BlockedURL) {
			blockedURL.blockedURL = BlockedURL;
			let id = 1;
			removeURL();
			chrome.action.setIcon({path: { 128: "/img/icon/DisabledLogo.png" } });
			
			if (!active) return console.log("Active AdsDestroy to use it.", active);
			for (url in BlockedURL) {
				chrome.declarativeNetRequest.updateDynamicRules({
					addRules: [{
						'id': id,
						'priority': BlockedURL[url].priority,
						"action": (BlockedURL[url].action.type === "redirect" ? (BlockedURL[url].action.redirect ? BlockedURL[url].action : { "type": "redirect", "redirect": { "url": "https://sleezzi.github.io/AdsDestroyer/editedURL/index.html" } }) : BlockedURL[url].action),
						'condition': {
							'urlFilter': url,
							'resourceTypes': (BlockedURL[url].ressourceTypes ? BlockedURL[url].ressourceTypes : [
								'csp_report', 'font', 'image', 'main_frame', 'media', 'object', 'other', 'ping', 'script',
								'stylesheet', 'sub_frame', 'webbundle', 'websocket', 'webtransport', 'xmlhttprequest'
							])
						}
					}],
					removeRuleIds: [id++]
				});
				id++;
			}
			chrome.action.setTitle({title: `AdsDestroyer - Enable`});
			chrome.action.setIcon({path: { 128: "/img/icon/Logo128.png" }});
		}
	}).catch(err => {
		console.error(err);
		return;
	});
}

async function sendMessageToCurrentTab(message) {
	const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  	const response = await chrome.tabs.sendMessage(tab.id, message);
	return response;
}

chrome.action.setBadgeBackgroundColor({color: '#FF0000'});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === 'install') {
		chrome.tabs.create({url: 'installed.html'});
	} else if (reason === "update") {
		chrome.tabs.create({url: 'updated.html'});
	}
});

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
	if (`${message}` === "getBlockedURL") {
		sendResponse(blockedURL.blocked);
	}
	if (`${message}` === "getSettings") {
		sendResponse(blockedURL);
	}
	if (`${message}` === "blockAnElement") {
		sendMessageToCurrentTab("blockAnElement");
		sendResponse(true);
	}
});

updateURL();
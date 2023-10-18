let settings = {
	blockedURL: {},
	blocked: { total: 0 },
	hidden: {
		type: "remove"
	},
	whitelist: [
		"undefined",
		"chrome://",
		"chrome-extension://",
		`chrome-extension://${chrome.runtime.id}`,
		"file://"
	]
};
let active = true;

chrome.storage.local.get("active", value => active = value.active ?? true);
chrome.storage.local.get("settings", value => {
	if (value.settings) settings = value.settings;
	if (active) {
		chrome.action.setBadgeText({ text: settings.blocked.total.toString() });
		chrome.action.setTitle({title: `AdDestroyer - Enable`});
		chrome.action.setIcon({path: { 128: "/img/icon/Logo128.png" }});

	} else {
		chrome.action.setTitle({ title: `AdDestroyer - Unenable` });
		chrome.action.setIcon({path: { 128: "/img/icon/DisabledLogo.png" }});
	}
});

function clearURL(url) {
	if (`${url}`.includes("https://")) url = url.replace("https://", "");
	if (`${url}`.includes("http://")) url = url.replace("http://", "");
	if (`${url}`.includes("ww1.")) url = url.replace("ww1.", "");
	if (`${url}`.includes("www.")) url = url.replace("www.", "");
	if (`${url}`.includes("www.")) url = url.replace("www.", "");
	return url;
}

function createNotification(id, title, message, iconUrl, silent) {
	chrome.notifications.create(id, {
    	type: 'basic',
		title: title,
		message: message,
		iconUrl: iconUrl,
		silent: silent,
		priority: 2
	});
}

chrome.webRequest.onBeforeRequest.addListener(details => {
	details.initiator = clearURL(details.initiator);
	
	if (!active || settings.whitelist.find(url => url === details.initiator) !== undefined) return console.log("Request not blocked", details);;
	let finded = false;
	for (url in settings.blockedURL) {
		if (!finded) {
			if (details.url.indexOf(url) && settings.blockedURL[url].action.type !== "allow" &&
			(!settings.blockedURL[url].ressourceTypes || settings.blockedURL[url].ressourceTypes.includes(details.type))) {
				if ((`${settings.blocked[details.initiator]}` !== "undefined" &&
				`${settings.blocked[details.initiator]}` !== "null")) {
					settings.blocked[details.initiator].total++;
				} else settings.blocked[details.initiator] = { total: 1, at: [ 0, 0, 0, 0, 0, 0 ]};
				settings.blocked[details.initiator].at[(new Date().getDay())]++;
				settings.blocked.total++;
				console.log(`Request "${clearURL(details.url)}" blocked from "${details.initiator}" (method: '${details.method}', type: "${details.type}")`, settings.blocked);
				chrome.storage.local.set({"settings": settings});
				chrome.action.setIcon({path: { 128: "/img/icon/Logo128.png" }});
				chrome.action.setBadgeText({ text: settings.blocked.total.toString() });
				finded = true;
			}
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
	chrome.action.setBadgeBackgroundColor({color: '#FF0000'});
	if (!navigator.onLine) return;
	fetch("https://sleezzi.github.io/AdDestroyer/URL.json", { method: "GET", "cache": "no-cache", mode: "no-cors" })
	.then(response => response.json())
	.then(BlockedURL => {
		if (settings.blockedURL !== BlockedURL) {
			settings.blockedURL = BlockedURL;
			let id = 1;
			removeURL();
			chrome.action.setIcon({path: { 128: "/img/icon/DisabledLogo.png" } });
			
			if (!active) return console.log("Active AdsDestroy to use it.", active);
			for (url in BlockedURL) {
				chrome.declarativeNetRequest.updateDynamicRules({
					addRules: [{
						'id': id,
						'priority': BlockedURL[url].priority,
						"action": (BlockedURL[url].action.type === "redirect" ? (BlockedURL[url].action.redirect ? BlockedURL[url].action : { "type": "redirect", "redirect": { "url": "https://sleezzi.github.io/AdDestroyer/editedURL/index.html" } }) : BlockedURL[url].action),
						'condition': {
							'urlFilter': clearURL(url),
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
			chrome.action.setTitle({title: `AdDestroyer - Enable`});
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

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {	
	if (`${message}` === "setActive") {
		if (active) {
			active = false;
			removeURL();
			chrome.action.setBadgeText({ text: `` });
			chrome.action.setTitle({ title: `AdDestroyer - Unenable` });
			chrome.action.setIcon({path: { 128: "/img/icon/DisabledLogo.png" }});
			sendResponse(active);
		} else {
			active = true;
			sendResponse(active);
		}
		chrome.storage.local.set({"active": active});
		updateURL();
		sendMessageToCurrentTab("reload");
		return;
	}
	if (`${message}` === "getActive") {
		sendResponse(active);
		return;
	}
	if (`${message}`.startsWith("getBlockedURL")) {
		if (`${message}`.startsWith("getBlockedURL$website=")) {
			sendResponse(settings.blocked[`${message}`.replace("getBlockedURL$website=", "")]);
		} else sendResponse(settings.blocked);
		return;
	}
	if (`${message}` === "blockAnElement") {
		sendMessageToCurrentTab("blockAnElement");
		sendResponse(true);
		return;
	}
	// if (`${message}` === "getHost") {
	// 	console.log((async () => {const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }); return tab})());
	// 	return;
	// }
	if (`${message}`.startsWith("getBlockedURL$website=")) {
		sendResponse(settings.blocked[`${message}`.replace("getBlockedURL$website=", "")]);
		return;
	}
	if (`${message}`.startsWith("getHiddenElement$url=")) {
		sendResponse((settings.hidden[`${message}`.split("$")[1].replace("url=", "")] === null || settings.hidden[`${message}`.split("$")[1].replace("url=", "")] === undefined ? [] : settings.hidden[`${message}`.split("$")[1].replace("url=", "")]));
		return;
	}
	if (`${message}`.startsWith("addHiddenElement$url=") && `${message}`.includes("$element=")) {
		if (settings.hidden[`${message}`.split("$")[1].replace("url=", "")]) {
			settings.hidden[`${message}`.split("$")[1].replace("url=", "")].push(`${message}`.split("$")[2].replace("element=", ""));
		} else settings.hidden[`${message}`.split("$")[1].replace("url=", "")] = [ `${message}`.split("$")[2].replace("element=", "") ]
		chrome.storage.local.get("settings", value => console.log(value.settings));
		sendResponse(`Element saved (${`${message}`.split("$")[2].replace("element=", "")})`);
		return;
	}
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === 'install') {
		chrome.tabs.create({url: 'installed.html'});
		createNotification("install", "AdDestroyer", "Tanks for download our extension", "/img/icon/Logo.png", true);
	} else if (reason === "update") {
		chrome.tabs.create({url: 'updated.html'});
		createNotification("update", "AdDestroyer", "We made a update", "/img/icon/Logo.png", true);
	}
});

updateURL();
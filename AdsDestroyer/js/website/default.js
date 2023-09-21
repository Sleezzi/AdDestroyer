console.log("AdsDestroyer was here :)");

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message);
	if (`${message}` === "blockAnElement") {
        let selectedElement;
        document.addEventListener('mouseover', function(event) {
            if (selectedElement) return;
            event.target.style.backgroundColor = 'aqua';
            event.target.onmouseup = function() {
                sendResponse(`mask:${window.location.host}|${event.target.outerHTML}`);
                event.preventDefault();
                event.stopPropagation();
            }
        });
        document.addEventListener('mouseout', function(event) {
            if (selectedElement) return;
            event.target.style.backgroundColor = '';
        });
	}
});
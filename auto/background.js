chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'runAction') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'runAction' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Back Error "+JSON.stringify(chrome.runtime.lastError));
                    } else {
                        console.log(response.status);
                        sendResponse(response);
                    }
                });
            }
        });
        return true; // Indica que sendResponse será llamado de forma asíncrona
    }else if(request.action === 'openPopup'){
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'openPopup' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("back "+JSON.stringify(chrome.runtime.lastError));
                    } else {
                        console.log(response.status);
                        sendResponse(response);
                    }
                });
            }
        });
       return true; // Indica que sendResponse será llamado de forma asíncrona
    }else if (request.action === 'captureTab') {
        var id = null;
        chrome.storage.local.get(['idtab'], function (result) {
            id = result.tabid || null;
            console.log('Window id:', id);
        });
        chrome.tabs.captureVisibleTab(id, {format: 'png'}, function (image) {
            if (chrome.runtime.lastError) {
                console.error('Error capturing tab:', chrome.runtime.lastError);
                sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
            } else {
                sendResponse({ status: 'success', image: image });
            }
        });
        return true; // Indica que sendResponse será llamado de forma asíncrona
    }
});

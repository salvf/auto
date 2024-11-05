function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('Notificación', { body: message });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Notification', { body: message });
            }
        });
    }
}
function focusOnComponent(selector) {
    var element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'instant' });
        element.focus();
    } else {
        console.error('Element not found:', selector);
    }
}
function waitMs(ms, callback) {
    setTimeout(callback, ms);
}


// Cargar items guardados
chrome.storage.local.get(['items'], function (result) {
    const items = result.items || [];
    items.forEach(item => console.log(item.text, item.checked, item.option));
});



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'runAction') {
        focusOnComponent('section.cta.section');
        showNotification('Acción ejecutada desde el popup');

        console.log("Esperando 6 segundos...");
        waitMs(6000, function () {
            chrome.runtime.sendMessage({ action: 'captureTab' }, (response) => {
                if (response.status === 'success') {
                    console.log('Captured image:', response.image);
                    const link = document.createElement('a');
                    link.href = response.image;
                    link.download = 'captured_image.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    console.error('Error capturing tab:', response.message);
                }
            });
            console.log("¡Listo después de la espera!");
        });

        
        // Aquí puedes agregar el código que deseas ejecutar
        sendResponse({ status: 'success' });
    }
    if (request.action === 'openPopup') {
        //location.reload();
        sendResponse({ status: 'reloaded' });
    }
});

console.log('Hello from content.js');





///html2canvas example

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'takeScreenshot') {
      html2canvas(document.documentElement, {
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
      }).then(canvas => {
        const imageData = canvas.toDataURL('image/png');
        
        // Crear un enlace temporal para descargar la imagen
        const link = document.createElement('a');
        link.download = `screenshot_${Date.now()}.png`;
        link.href = imageData;
        link.click();
      }).catch(error => {
        console.error('Error al crear la captura:', error);
      });
    }
  });
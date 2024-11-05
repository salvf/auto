document.addEventListener('DOMContentLoaded', function () {
    const listContainer = document.getElementById('listContainer');
    const addButton = document.getElementById('addItem');
    const autoButton = document.getElementById('auto');
    const settingsIcon = document.getElementById('settings');

    const captureButton = document.getElementById('captureButton');
    const windowid = document.getElementById('windowIdInput');
    const tabSelect = document.getElementById('tabSelect');
    const goToTabButton = document.getElementById('goToTabButton');


    // Cargar items guardados
    chrome.storage.local.get(['items'], function (result) {
        const items = result.items || [];
        console.log('Items:', result);
        items.forEach(item => createListItem(item.text, item.checked, item.option, item.worker, item.status));
        updateGroupBrackets();
    });


    /*chrome.tabs.query({}, (tabs) => {
        const tabInfo = tabs.map(tab => ({
            id: tab.id,
            title: tab.title,
            url: tab.url
        }));
        console.log({ status: 'success', tabs: tabInfo });
    });



//captura de pantalla por script html2canvas
document.getElementById('captureBtn').addEventListener('click', async () => {
  const tabId = parseInt(document.getElementById('tabId').value);
  
  if (!tabId) {
    alert('Por favor ingresa un ID de tab válido');
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['html2canvas.min.js', 'content.js']
    });

    chrome.tabs.sendMessage(tabId, { action: 'takeScreenshot' });
  } catch (error) {
    alert('Error al tomar la captura: ' + error.message);
  }

});



 */



    addButton.addEventListener('click', function () {
        createListItem();
    });

    autoButton.addEventListener('click', function () {
        if (confirm('¿Deseas ejecutar AUTO?')) {
            document.querySelectorAll('.item-container').forEach(container => {
                var text = container.querySelector('input[type="text"]').value;
                if (!text) {
                    container.getElementsByClassName("delete-btn")[0].click();
                }
            });
        }
    });

    settingsIcon.addEventListener('click', function () {
        chrome.runtime.openOptionsPage();
    });

    goToTabButton.addEventListener('click', function () {
        const tabId = parseInt(tabSelect.value, 10);
        chrome.tabs.update(tabId, { active: true });
    });

    captureButton.addEventListener('click', function () {
        const windowId = parseInt(document.getElementById('windowIdInput').value, 10);
        /*chrome.runtime.sendMessage({ action: 'captureTab2', windowId: windowId }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Popup Error:', JSON.stringify(chrome.runtime.lastError));
            } else {
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
            }
        });*/
    });

    // Enviar mensaje al content script para recargar la página
    /* chrome.runtime.sendMessage({ action: 'openPopup' }, (response) => {
 
         if (chrome.runtime.lastError) {
             console.error('Pupup Error:', JSON.stringify(chrome.runtime.lastError));
         } else {
             console.log(response.status);
         }
     });*/

    initTabSelect();

    function initTabSelect() {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                //if (!tab.url.includes('localhost')) return
                const option = document.createElement('option');
                option.value = tab.id;
                option.textContent = tab.id + ' - ' + tab.title.substring(0, 30) + '...';
                tabSelect.appendChild(option);
            });
        });

        chrome.storage.local.get(['idtab'], function (result) {
            const id = result.idtab || null;
            tabSelect.value = id;
            windowid.value = id;
        });

        tabSelect.addEventListener('change', function () {
            saveGlobalsOpc();
            windowid.value = tabSelect.value;
        }
        );
    }


    function createElementRunButton() {
        const button = document.createElement('button');
        button.className = 'run-btn';
        button.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
        return button;
    }

    function createRunButton() {
        const button = createElementRunButton();
        button.addEventListener('click', function (e) {
            const text = e.target.closest('.item-container').querySelector('input[type="text"]').value;
            if (text) {
                button.className = 'spinner';
                chrome.runtime.sendMessage({ action: 'runAction' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Popup " + JSON.stringify(chrome.runtime.lastError));
                    } else {
                        console.log(response.status);
                    }
                    console.log('runAction :');
                });
            }
        });
        return button;
    }

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

    function createListItem(text = '', isChecked = false, option = 'Start', worker = null, status = -1) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container';

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;
        checkbox.addEventListener('change', function () {
            saveItems();
            updateGroupBrackets();
        });

        const input = document.createElement('input');
        input.type = 'text';
        input.value = text;
        //input.id = Math.floor(10000 + Math.random() * 90000);
        input.addEventListener('input', saveItems);

        // Crear el combobox de opciones
        const comboBox = document.createElement('select');
        const options = ['Start', 'Force Start', 'On Ice', 'Off Ice', 'Kill'];

        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            comboBox.appendChild(option);
        });

        comboBox.value = option;

        comboBox.addEventListener('change', saveItems); // Guarda el cambio de selección

        const runBtn = createRunButton();

        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', function () {
            itemContainer.remove();
            saveItems();
            updateGroupBrackets();
        });

        itemContainer.setAttribute('worker', worker || document.getElementById('tabSelect').value);
        itemContainer.setAttribute('status', status);

        checkboxWrapper.appendChild(checkbox);
        itemContainer.appendChild(checkboxWrapper);
        itemContainer.appendChild(input);
        itemContainer.appendChild(comboBox);
        itemContainer.appendChild(runBtn);
        itemContainer.appendChild(deleteBtn);
        listContainer.appendChild(itemContainer);
    }

    function updateGroupBrackets() {
        // Eliminar todos los corchetes existentes
        document.querySelectorAll('.group-bracket').forEach(bracket => bracket.remove());

        const items = Array.from(document.querySelectorAll('.item-container'));
        let startIndex = null;
        let endIndex = null;

        // Encontrar grupos consecutivos
        for (let i = 0; i < items.length; i++) {
            const checkbox = items[i].querySelector('input[type="checkbox"]');

            if (checkbox.checked) {
                if (startIndex === null) {
                    startIndex = i;
                }
                endIndex = i;
            } else {
                if (startIndex !== null && endIndex !== null && endIndex > startIndex) {
                    createGroupBracketForRange(items, startIndex, endIndex);
                }
                startIndex = null;
                endIndex = null;
            }
        }

        // Verificar el último grupo
        if (startIndex !== null && endIndex !== null && endIndex > startIndex) {
            createGroupBracketForRange(items, startIndex, endIndex);
        }
    }

    function createGroupBracketForRange(items, startIndex, endIndex) {
        const startItem = items[startIndex];
        // const endItem = items[endIndex];
        const totalHeight = (endIndex - startIndex) * 36 + 28;

        // Crear un solo corchete para todo el grupo
        const bracket = document.createElement('div');
        bracket.className = 'group-bracket';
        bracket.style.height = `${totalHeight}px`;
        bracket.style.top = '0';

        // Agregar los bordes superior e inferior
        bracket.classList.add('start', 'end');

        // Crear el botón de "Play Group"
        const playGroupButton = createRunGroupButton(items, startIndex, endIndex);
        playGroupButton.style.position = 'absolute';
        playGroupButton.style.left = '-22px'; // Ajusta según el espacio necesario
        bracket.appendChild(playGroupButton);

        // Insertar el corchete en el primer elemento del grupo
        startItem.insertBefore(bracket, startItem.firstChild);
    }

    function createRunGroupButton(items, startIndex, endIndex) {
        const rungbutton = createElementRunButton();
        rungbutton.addEventListener('click', function () {
            const svg = rungbutton.querySelector('svg path');
            for (let i = startIndex; i <= endIndex; i++) {
                const text = items[i].querySelector('input[type="text"]').value;
                if (text) {
                    // Cambiar el color de relleno del SVG al hacer clic
                    if (svg) {
                        svg.style.fill = '#FF0000'; // Cambia el color a rojo
                    }
                    showNotification(text);
                }
            }
            svg.style.fill = '#4CAF50';
        });
        return rungbutton;
    }

    function saveItems() {
        const items = [];
        document.querySelectorAll('.item-container').forEach(container => {
            items.push({
                text: container.querySelector('input[type="text"]').value,
                checked: container.querySelector('input[type="checkbox"]').checked,
                option: container.querySelector('select').value,
                worker: document.getElementById('tabSelect').value,
                status: container.getAttribute('status')
            });
        });
        chrome.storage.local.set({ items: items });
    }


    function saveGlobalsOpc() {
        const id = document.getElementById('tabSelect').value;
        chrome.storage.local.set({ idtab: id });
    }
});
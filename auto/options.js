document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('exampleInput');
    const saveButton = document.getElementById('saveButton');

    // Cargar el valor guardado
    chrome.storage.sync.get(['exampleInput'], function (result) {
        if (result.exampleInput) {
            input.value = result.exampleInput;
        }
    });

    // Guardar el valor cuando se haga clic en el botón
    saveButton.addEventListener('click', function () {
        const value = input.value;
        chrome.storage.sync.set({ exampleInput: value }, function () {
            alert('Opciones guardadas');
        });
    });
});
window.addEventListener('DOMContentLoaded', () => {
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    const openImageBtn = document.getElementById('open-image-btn');
    const contentDiv = document.getElementById('content');

    minimizeBtn.addEventListener('click', () => {
        window.electronAPI.minimize();
    });

    maximizeBtn.addEventListener('click', () => {
        window.electronAPI.maximizeRestore();
    });

    closeBtn.addEventListener('click', () => {
        window.electronAPI.close();
    });

    openImageBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.openImage();

        if (result) {
            contentDiv.innerHTML = '';

            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';

            const imgElement = document.createElement('img');
            imgElement.src = result.path;
            imgElement.style.maxWidth = '100%';
            imgElement.style.maxHeight = '500px';

            const detailsElement = document.createElement('div');
            detailsElement.innerHTML = `
            <h2>Detalhes da imagem</h2>
            <p><strong>Nome:</strong> ${result.name}</p>
            <p><strong>Caminho:</strong> ${result.path}</p>
            <p><strong>Tamanho:</strong> ${result.size} bytes</p>
            <p><strong>Dimensões:</strong> ${result.width} x ${result.height}</p>
            `;
            imageContainer.appendChild(imgElement);
            imageContainer.appendChild(detailsElement);
            contentDiv.appendChild(imageContainer);
        }
    });
});
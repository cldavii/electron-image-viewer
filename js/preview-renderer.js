window.addEventListener('DOMContentLoaded', () => {
    const imgElement = document.getElementById('preview-image');

    window.electronAPI.onImageData((image) => {
        if (image) {
            imgElement.src = image.path;
        }
    });
});
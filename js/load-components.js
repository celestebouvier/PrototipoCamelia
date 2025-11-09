/**
 * Función para cargar un archivo HTML en un elemento específico del DOM.
 * @param {string} componentId - El ID del elemento donde se insertará el componente (ej: 'header-placeholder').
 * @param {string} filePath - La ruta del archivo HTML del componente (ej: 'components/header.html').
 */
async function loadComponent(componentId, filePath) {
    const placeholder = document.getElementById(componentId);
    
    if (placeholder) {
        try {
            // 1. Usar 'fetch' para obtener el contenido del archivo.
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 2. Obtener el texto del contenido.
            const htmlContent = await response.text();
            
            // 3. Insertar el HTML en el placeholder.
            placeholder.innerHTML = htmlContent;

            const scripts = placeholder.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');

                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });

                if (!oldScript.src) {
                    newScript.textContent = oldScript.textContent;
                }

                document.head.appendChild(newScript);

                oldScript.parentNode && oldScript.parentNode.removeChild(oldScript);
            });
            // ------------------------------------------------------------------------------

            const userInfoEl = placeholder.querySelector('#user-info');
            if (userInfoEl) {
                userInfoEl.remove();
            }

        } catch (error) {
            console.error(`Error loading component ${filePath}:`, error);
            // Mostrar un mensaje de error o fallback en el placeholder si falla la carga.
            placeholder.innerHTML = `<p>Error al cargar ${componentId}.</p>`;
        }
    } else {
        console.warn(`Placeholder con ID '${componentId}' no encontrado en el DOM.`);
    }
}

// Cargar los componentes al inicio
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header-placeholder', 'components/header.html');
    loadComponent('footer-placeholder', 'components/footer.html');
});
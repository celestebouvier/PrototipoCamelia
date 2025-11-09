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

            // --------- NEW: Execute any <script> tags found inside the fetched content ----------
            // Browsers do not execute scripts added via innerHTML. Find script tags and re-create them
            // so they actually run (this ensures auth.js and any header scripts initialize).
            const scripts = placeholder.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');

                // Copy attributes (e.g., src, type). If script has src, set it so browser loads it.
                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });

                // If the script is inline, copy its content
                if (!oldScript.src) {
                    newScript.textContent = oldScript.textContent;
                }

                // Append to head so it executes
                document.head.appendChild(newScript);

                // Remove the original inert script tag from the placeholder
                oldScript.parentNode && oldScript.parentNode.removeChild(oldScript);
            });
            // ------------------------------------------------------------------------------

            // Remove the greeting element if present (you asked to delete "Hola, <user>")
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
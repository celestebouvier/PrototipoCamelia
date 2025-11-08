document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    
    // Función para obtener el nombre corto de la página (e.g., /catalog.html -> catalog)
    const getPageName = (path) => {
        const parts = path.split('/');
        let page = parts.pop().split('?')[0]; // Toma el último segmento y quita query params
        if (page === '' || page === 'index.html') {
            return 'index';
        }
        return page.replace('.html', '');
    };
    
    // Si la página es catalog.html con filtro de ofertas, la consideramos "ofertas"
    const currentPageName = (currentPath.includes('filter=offer')) ? 'ofertas' : getPageName(currentPath);

    navLinks.forEach(link => {
        // Remueve la clase 'active' de todos los enlaces primero
        link.classList.remove('active'); 
        
        // Compara el data-page del enlace con el nombre de la página actual
        if (link.dataset.page === currentPageName) {
            link.classList.add('active');
        }
    });
});
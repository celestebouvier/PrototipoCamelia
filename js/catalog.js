let allProducts = [];
const itemsPerPage = 36;
let currentPage = 1;

// Función para leer parámetros de la URL
function getInitialFilter() {
    const params = new URLSearchParams(window.location.search);
    return {
        offer: params.get('filter') === 'offer', // Mantiene el filtro de oferta
        search: params.get('search') ? params.get('search').toLowerCase() : null, // Captura y convierte a minúsculas
        type: params.get('filter-type') || null, 
        character: params.get('filter-character') || null,
    };
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPriceDetails(priceFinal) {
    const priceNeto = priceFinal / 1.21;
    return {
        priceFinal: priceFinal.toFixed(2),
        priceNeto: priceNeto.toFixed(2)
    };
}

function renderProducts(products, page = 1) {
  const list = document.getElementById("catalog-list");
  if (!list) return;

  list.innerHTML = "";

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = products.slice(start, end);

  if (paginated.length === 0) {
            list.innerHTML = `
            <div class="no-products-message">
                <p>No encontramos productos con esos filtros.</p>
            </div>
        `;
    return;
  }

  paginated.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    // link wrapper
    const link = document.createElement("a");
    link.className = "product-link";
    link.href = `product.html?id=${p.id}`;

    const infoContainer = document.createElement('div');
    infoContainer.className = 'product-info';

    const img = document.createElement("img");
    img.src = `img/${p.img}`;
    img.alt = p.name;
    img.className = "product-img";

    const title = document.createElement("h4");
    title.textContent = p.name;

    link.appendChild(img);
    infoContainer.appendChild(title);

    const { priceFinal, priceNeto } = getPriceDetails(p.price);

    const price = document.createElement("p");
    // MODIFICACIÓN 1: Usar clases específicas para el precio
    price.className = "price";
    price.innerHTML = `
        <p class="price-with-iva"><strong>$${priceFinal}</strong></p>
        <p class="price-without-iva">Sin IVA: $${priceNeto}</p>
    `;

    const stock = document.createElement("p");
    stock.className = p.stock ? "product-stock in-stock" : "product-stock out-stock";
    stock.textContent = p.stock ? "En Stock" : "Agotado";

    const age = document.createElement("span");
    age.className = "product-age-badge";
    age.textContent = escapeHtml(p.age);

    infoContainer.appendChild(price);

    if (p.isOffer) {
            const badge = document.createElement("span");
            // MODIFICACIÓN 2: Usar la clase de oferta resaltada
            badge.className = "sale-badge"; 
            badge.textContent = "Oferta";
            card.appendChild(badge);
        }

    const buyBtn = document.createElement("button");

    // MODIFICACIÓN 3: Usar clases específicas para los botones
    buyBtn.className = p.stock ? "add-to-cart" : "sold-out"; 
    buyBtn.textContent = p.stock ? "AGREGAR 🛒" : "AGOTADO";
    buyBtn.disabled = !p.stock;

    if (p.stock) {
        buyBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        if (typeof cart !== 'undefined') {
            cart.add(p);
        } else {
            alert("Error: No se pudo acceder a la lógica del carrito.");}
        });
    }

    card.appendChild(link);
    card.appendChild(infoContainer);
    card.appendChild(buyBtn);
    list.appendChild(card);
  });

  renderPagination(products, page);
}

function applySorting(products) {
    const sortEl = document.getElementById("sort-order");
    if (!sortEl) return products;

    const sortType = sortEl.value;

    let sortedProducts = [...products];

    switch (sortType) {
        case 'name-asc':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-asc':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        // Por defecto, se asume 'name-asc' si no hay coincidencia
        default:
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    return sortedProducts;
}

function renderPagination(products, page) {
  const paginationEl = document.getElementById("pagination");
  if (!paginationEl) return;

  paginationEl.innerHTML = "";

  const totalPages = Math.ceil(products.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === page) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderProducts(products, currentPage);
    });
    paginationEl.appendChild(btn);
  }
}

function applyFilters() {
    const age = document.getElementById("filter-age")?.value;
    const type = document.getElementById("filter-type")?.value;
    const character = document.getElementById("filter-character")?.value;
    
    // Obtiene ambos filtros iniciales (search y offer)
    const initialFilters = getInitialFilter();
    const isOfferFilterActive = initialFilters.offer;
    const searchTerm = initialFilters.search; // Término de búsqueda en minúsculas

    const filtered = allProducts.filter(p => {
        // Criterios de filtrado existentes (edad, tipo, personaje)
        const passesCategoryFilters = 
            (!age || p.age === age) &&
            (!type || p.category === type) &&
            (!character || p.character === character);
            
        // Criterio de filtrado de Oferta (si aplica)
        const passesOfferFilter = 
            (!isOfferFilterActive || (isOfferFilterActive && p.isOffer === true));

        // Criterio de Búsqueda
        // Si no hay término de búsqueda, pasa automáticamente.
        // Si hay, verifica si el término está en el nombre, descripción, personaje o categoría.
        const passesSearchFilter = !searchTerm || (
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.character?.toLowerCase().includes(searchTerm) || // Usamos ?. por si es nulo
            p.category.toLowerCase().includes(searchTerm)
        );

        // Retorna verdadero solo si pasa todos los filtros
        return passesCategoryFilters && passesOfferFilter && passesSearchFilter;
    });

    // Actualizar el título del catálogo si hay una búsqueda o filtro de oferta activo
    const catalogTitleEl = document.querySelector('.catalog-header h2');
    if (catalogTitleEl) {
        if (isOfferFilterActive) {
            catalogTitleEl.textContent = 'Catálogo: Ofertas especiales';
        } else if (searchTerm) {
            catalogTitleEl.textContent = `Resultados de búsqueda para "${searchTerm}"`;
        } else {
            catalogTitleEl.textContent = 'Catálogo de Productos';
        }
    }


    let sortedAndFiltered = applySorting(filtered);

    currentPage = 1;
    renderProducts(sortedAndFiltered, currentPage);
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("data/products.json")
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      // Llamar a applyFilters() para procesar el filtro de la URL
      applyFilters(); 
    })
    .catch(err => {
      console.error("Error cargando productos:", err);
    });

  const ageEl = document.getElementById("filter-age");
  const typeEl = document.getElementById("filter-type");
  const characterEl = document.getElementById("filter-character");
  const resetBtn = document.getElementById("reset-filters");
  const sortEl = document.getElementById("sort-order");

  if (ageEl) ageEl.addEventListener("change", applyFilters);
  if (typeEl) typeEl.addEventListener("change", applyFilters);
  if (characterEl) characterEl.addEventListener("change", applyFilters);
  if (sortEl) sortEl.addEventListener("change", applyFilters);
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (ageEl) ageEl.value = "";
      if (typeEl) typeEl.value = "";
      if (characterEl) characterEl.value = "";
      if (sortEl) sortEl.value = "name-asc"; 
      currentPage = 1;
      const initialSort = applySorting(allProducts);
      renderProducts(initialSort, currentPage); 
    });
  }
});
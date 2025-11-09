// js/product.js 
document.addEventListener("DOMContentLoaded", () => {
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));

if (!productId) {
document.getElementById("product-info").innerHTML = "<p>Producto no especificado.</p>";
return;}

  fetch("data/products.json")
    .then(res => res.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
if (!product) {
document.getElementById("product-info").innerHTML = "<p>Producto no encontrado.</p>";
return;
}

const mainImg = document.getElementById("main-img");
const thumbsEl = document.getElementById("thumbs");
      thumbsEl.innerHTML = "";
      
      // Unir imagen principal y extraImages en una sola lista para generar miniaturas
      const allImages = [product.img, ...(product.extraImages || [])];

      // Configurar imagen principal inicial
      mainImg.src = "img/" + allImages[0];
      mainImg.alt = product.name;
      document.title = `${product.name} - Camelia`; // Actualiza el título de la página

      // Crear y renderizar todas las miniaturas
allImages.forEach((img, index) => {
const thumb = document.createElement("img");
thumb.src = "img/" + img;
thumb.alt = product.name + " miniatura " + (index + 1);
thumb.className = "product-thumbnail-item"; // Usar clase de CSS
  
// Función para cambiar la imagen principal
const changeMainImage = (imageSrc) => {
mainImg.src = imageSrc;
thumbsEl.querySelectorAll('.product-thumbnail-item').forEach(t => t.classList.remove('active-thumb'));
thumb.classList.add('active-thumb');
};

        thumb.addEventListener("click", () => changeMainImage(thumb.src));
        
        // Marcar la primera como activa al cargar
        if (index === 0) {
            thumb.classList.add('active-thumb');
        }

        thumbsEl.appendChild(thumb);
      });


      // ------------------------------------------
      // 2. Renderizar Información y Botones
      // ------------------------------------------
      const infoEl = document.getElementById("product-info");

      // Actualizar contenido estático con datos reales
      const formatPrice = (price) => `$${price.toLocaleString('es-AR')}`;

      // Elementos estáticos que se actualizan
      (infoEl.querySelector('h1') || {}).textContent = product.name;
      (infoEl.querySelector('#product-description') || {}).textContent = product.description;
      (infoEl.querySelector('#product-price') || {}).textContent = `Precio: ${formatPrice(product.price)}`;
      
      const stockEl = infoEl.querySelector('#product-stock');
      if (stockEl) {
        stockEl.textContent = product.stock ? "Stock: Disponible" : "Stock: Agotado";
        stockEl.style.color = product.stock ? "green" : "red";
      }

      (infoEl.querySelector('#product-age-rec') || {}).innerHTML = `<strong>Edad recomendada:</strong> ${product.age}`;
      (infoEl.querySelector('#product-category') || {}).innerHTML = `<strong>Categoría:</strong> ${product.category}`;
      (infoEl.querySelector('#product-character') || {}).innerHTML = `<strong>Personaje:</strong> ${product.character}`;
      (infoEl.querySelector('#product-dimensions') || {}).innerHTML = `<strong>Dimensiones:</strong> ${product.height}cm x ${product.width}cm`;
      (infoEl.querySelector('#product-weight') || {}).innerHTML = `<strong>Peso:</strong> ${product.weight} g`;

      // Remueve cualquier sección anterior de cantidad/botones para evitar duplicados
      const existingBuyActions = infoEl.querySelector('.buy-actions');
      if (existingBuyActions) existingBuyActions.remove();
      const existingQtyWrap = infoEl.querySelector('.product-qty-section');
      if (existingQtyWrap) existingQtyWrap.remove();

      if (product.stock) {
          const qtyWrap = document.createElement("div");
          qtyWrap.className = "product-qty-section"; 
          qtyWrap.innerHTML = `
            <label for="qty">Cantidad:</label>
            <input type="number" id="qty" name="qty" min="1" max="10" value="1" style="width:80px; margin-left:8px; padding:6px; border-radius:6px; border: 1px solid #ddd;"/>
`;

// Botones de acción
const buyActions = document.createElement("div");
buyActions.className = "buy-actions";

const addBtn = document.createElement("button");
addBtn.className = "buy-btn primary-btn";
addBtn.textContent = "Agregar al carrito";

buyActions.appendChild(addBtn); 

const detailsExtra = infoEl.querySelector('.product-details-extra');
if (detailsExtra) {
infoEl.insertBefore(qtyWrap, detailsExtra);
infoEl.insertBefore(buyActions, detailsExtra);
} else {
infoEl.appendChild(qtyWrap); 
infoEl.appendChild(buyActions);
}



          addBtn.addEventListener("click", () => {
            const qtyInput = document.getElementById("qty"); // ID 'qty' usado en la generación dinámica
            const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
            if (typeof cart !== 'undefined' && cart.add) {
                cart.add(product, qty);
            } else {
                console.log(`[Carrito] ${qty} de ${product.name} añadido (cart.js no cargado).`);
            }
          });
          
          
      } else {
        // Si no hay stock, agregar un mensaje de agotado visiblemente si aún no está.
        const soldOutMessage = document.createElement("p");
        soldOutMessage.style.cssText = "color: red; font-size: 1.2em; font-weight: bold; margin-top: 15px;";
        soldOutMessage.textContent = "¡Producto Agotado Temporalmente!";

        const detailsExtra = infoEl.querySelector('.product-details-extra');
        if (detailsExtra) {
            infoEl.insertBefore(soldOutMessage, detailsExtra);
        } else {
            infoEl.appendChild(soldOutMessage);
        }
      }

      // ------------------------------------------
      // 3. Renderizar Detalles Adicionales
      // ------------------------------------------
      const extraDetailsEl = document.getElementById("product-extra-details");
      if (extraDetailsEl) {
        extraDetailsEl.innerHTML = ""; 
        if (product.isPrize) {
          const li = document.createElement('li');
          li.textContent = `Disponible para canje por ${product.points_required} puntos.`;
extraDetailsEl.appendChild(li);
        }
        if (product.character) {
            const li = document.createElement('li');
 li.textContent = `Personaje Principal: ${product.character}`;
extraDetailsEl.appendChild(li);
}
 
        if (extraDetailsEl.children.length === 0) {
            const parentSection = infoEl.querySelector('.product-details-extra');
            if(parentSection) parentSection.style.display = 'none';
        } else {
            const parentSection = infoEl.querySelector('.product-details-extra');
            if(parentSection) parentSection.style.display = ''; // Asegurar que se muestre si hay contenido
        }
      }

    })
    .catch(err => {
      console.error("Error cargando productos:", err);
      document.getElementById("product-info").innerHTML = "<p>Ocurrió un error al cargar el producto.</p>";
    });
});

// js/points.js (Contenido completo - nuevo archivo)

const REDEMPTION_GRID = document.getElementById("redemption-grid");
const CURRENT_POINTS_EL = document.getElementById("current-points");

// Helper function (assuming data fetch)
async function fetchPrizes() {
    // En un entorno de desarrollo, leemos de products.json
    const response = await fetch("data/products.json");
    const products = await response.json();
    // Filtramos solo los productos marcados como premio
    return products.filter(p => p.isPrize && p.points_required > 0);
}

function loadPointsAndPrizes() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Debes iniciar sesión para ver tus puntos.");
        window.location.href = "login.html";
        return;
    }
    
    // Asumiendo que el usuario tiene un campo 'points' en localStorage.currentUser
    const userPoints = currentUser.points || 0;
    CURRENT_POINTS_EL.textContent = userPoints.toLocaleString('es-AR');
    document.getElementById("loading-prizes").style.display = 'none';

    fetchPrizes().then(prizes => {
        REDEMPTION_GRID.innerHTML = "";
        if (prizes.length === 0) {
            document.getElementById("no-prizes").style.display = "block";
            return;
        }

        prizes.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card redemption-card";
            
            const canRedeem = userPoints >= p.points_required;
            const buttonText = canRedeem ? 'Canjear ahora' : 'Puntos Insuficientes';
            
            card.innerHTML = `
                <img src="img/${p.img}" alt="${p.name}">
                <h4>${p.name}</h4>
                <p class="points-cost"><i class="fas fa-star"></i> ${p.points_required.toLocaleString('es-AR')} Puntos</p>
                <p class="product-description">${p.description}</p>
                
                <button 
                    class="cta-btn ${canRedeem ? 'primary-btn' : 'disabled-btn'}" 
                    data-id="${p.id}" 
                    data-points="${p.points_required}"
                    ${!canRedeem ? 'disabled' : ''}
                >
                    ${buttonText}
                </button>
                
                ${!canRedeem ? '<p class="insufficient-points-msg">Puntos insuficientes para este producto</p>' : ''}
            `;
            
            REDEMPTION_GRID.appendChild(card);

            if (canRedeem) {
                card.querySelector('button').addEventListener('click', (e) => {
                    handleRedeem(p, currentUser, parseInt(e.target.dataset.points));
                });
            }
        });
    });
}

function handleRedeem(prizeProduct, currentUser, pointsRequired) {
    if (currentUser.points < pointsRequired) {
        alert("Error: Puntos insuficientes. Esto no debería ocurrir.");
        return;
    }

    // 1. Deducir Puntos (simulación)
    currentUser.points -= pointsRequired;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    
    // 2. Agregar a carrito como item de costo $0 (simulación de canje)
    if (typeof cart !== 'undefined') {
         // Se agrega al carrito con un precio de 0, forzando la lógica de canje en checkout
         const prizeItem = {
             id: prizeProduct.id, 
             name: prizeProduct.name, 
             price: 0, // Precio $0 para el checkout
             img: prizeProduct.img, 
             qty: 1,
             isPrize: true, // Flag para identificar en carrito si es necesario
             pointsRequired: pointsRequired // Puntos que costó
         };
         
         // Se asume la existencia de la función addPrizeToCart o se usa el método add
         cart.add(prizeItem);
    }
    
    alert(`¡Has canjeado "${prizeProduct.name}" por ${pointsRequired} puntos! Redirigiendo a checkout para el envío.`);
    window.location.href = 'checkout.html?redemption=true';
}

document.addEventListener("DOMContentLoaded", () => {
    // Aseguramos que el usuario logueado tenga un campo 'points' para esta prueba
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && typeof currentUser.points === 'undefined') {
        currentUser.points = 1000; // Valor de prueba para simular puntos
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
    loadPointsAndPrizes();
});
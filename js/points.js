// js/points.js - edited to use in-page messages and to redirect to redemption-only checkout

const REDEMPTION_GRID = document.getElementById("redemption-grid");
const CURRENT_POINTS_EL = document.getElementById("current-points");

async function fetchPrizes() {
    const response = await fetch("data/products.json");
    const products = await response.json();
    return products.filter(p => p.isPrize && p.points_required > 0);
}

function loadPointsAndPrizes() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        // Use in-page message and redirect to login
        if (typeof showMessage === 'function') {
            showMessage("Debes iniciar sesión para ver tus puntos.", "info", 3000);
        } else {
            alert("Debes iniciar sesión para ver tus puntos.");
        }
        setTimeout(() => window.location.href = "login.html", 900);
        return;
    }

    const userPoints = currentUser.points || 0;
    if (CURRENT_POINTS_EL) CURRENT_POINTS_EL.textContent = userPoints.toLocaleString('es-AR');
    const loadingEl = document.getElementById("loading-prizes");
    if (loadingEl) loadingEl.style.display = 'none';

    fetchPrizes().then(prizes => {
        if (!REDEMPTION_GRID) return;
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
                const btn = card.querySelector('button');
                btn.addEventListener('click', (e) => {
                    // Redirect to the redemption checkout passing prizeId and pointsRequired
                    const prizeId = e.currentTarget.dataset.id;
                    const pointsRequired = e.currentTarget.dataset.points;
                    const url = `checkout.html?redemption=true&prizeId=${encodeURIComponent(prizeId)}&points=${encodeURIComponent(pointsRequired)}`;
                    if (typeof showMessage === 'function') {
                        showMessage(`Preparando canje de "${p.name}"...`, 'info', 1200);
                    }
                    setTimeout(() => window.location.href = url, 600);
                });
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // ensure debug default points if not present (optional)
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && typeof currentUser.points === 'undefined') {
        currentUser.points = 1000;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
    loadPointsAndPrizes();
});
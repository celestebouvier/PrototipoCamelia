(function () {
    function qs(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    if (qs('redemption') !== 'true') return;

    const container = document.getElementById('redemption-container');
    if (!container) return;

    const prizeId = qs('prizeId');
    const pointsRequired = parseInt(qs('points'), 10) || 0;

    fetch('data/products.json')
        .then(r => r.json())
        .then(products => {
            const prize = products.find(p => String(p.id) === String(prizeId));
            if (!prize) {
                container.innerHTML = `<div class="card"><p>Premio no encontrado.</p></div>`;
                return;
            }

            container.innerHTML = `
                <div class="card" style="padding:20px;">
                    <h2>Confirmar Canje</h2>
                    <div style="display:flex;gap:20px;align-items:center;margin-top:12px;">
                        <img src="img/${prize.img}" alt="${prize.name}" style="width:120px;height:auto;border-radius:8px;">
                        <div>
                            <h3 style="margin:0;">${prize.name}</h3>
                            <p style="margin:6px 0;color:#666">${prize.description}</p>
                            <p><strong>Costo en puntos:</strong> ${pointsRequired.toLocaleString('es-AR')} Puntos</p>
                        </div>
                    </div>

                    <form id="redemption-form" style="margin-top:18px;">
                        <div style="margin:12px 0;">
                            <label><input type="checkbox" id="eco-pack" /> Empaque ecológico (opcional)</label>
                        </div>

                        <div style="margin:12px 0;">
                            <label><input type="radio" name="shipping" value="retiro" checked /> Retiro (Retiras en tienda) — Costo $0</label><br>
                            <label><input type="radio" name="shipping" value="correo" /> Envío por Correo — Costo $1500</label>
                        </div>

                        <div style="margin-top:18px;">
                            <p><strong>Total a pagar:</strong> <span id="redemption-total">$0</span></p>
                        </div>

                        <div style="margin-top:8px;">
                            <button type="submit" class="cta-btn primary-btn">Confirmar Canje</button>
                            <button type="button" id="redemption-cancel" class="cta-btn secondary-btn" style="margin-left:10px;">Cancelar</button>
                        </div>
                    </form>

                    <div id="redemption-result" style="margin-top:18px;"></div>
                </div>
            `;

            const form = document.getElementById('redemption-form');
            const totalEl = document.getElementById('redemption-total');
            const updateTotal = () => {
                const shipping = form.querySelector('input[name="shipping"]:checked').value;
                const total = shipping === 'correo' ? 1500 : 0;
                totalEl.textContent = `$${total.toLocaleString('en-US')}`;
            };

            form.addEventListener('change', updateTotal);
            updateTotal();

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                if (typeof showMessage === 'function') showMessage('Debes iniciar sesión para completar el canje', 'info');
                setTimeout(() => window.location.href = 'login.html', 800);
                return;
            }

            form.addEventListener('submit', (ev) => {
                ev.preventDefault();
                const shipping = form.querySelector('input[name="shipping"]:checked').value;
                const total = shipping === 'correo' ? 1500 : 0;
                const eco = document.getElementById('eco-pack').checked;

                if (currentUser.points < pointsRequired) {
                    if (typeof showMessage === 'function') showMessage('No tienes suficientes puntos para completar el canje.', 'error');
                    return;
                }

                currentUser.points -= pointsRequired;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                const now = new Date();
                const receipt = {
                    productName: prize.name,
                    productId: prize.id,
                    pointsUsed: pointsRequired,
                    shippingMethod: shipping,
                    ecoPackaging: eco,
                    totalPaid: total,
                    user: {
                        name: currentUser.name,
                        email: currentUser.email
                    },
                    date: now.toLocaleString()
                };

                try {
                    sessionStorage.setItem('lastRedemptionReceipt', JSON.stringify(receipt));
                } catch (e) {
                    console.warn('Could not save receipt to sessionStorage', e);
                }

                if (typeof showMessage === 'function') showMessage('Canje confirmado. Preparando comprobante...', 'success', 1500);
                setTimeout(() => {
                    window.location.href = 'comprobante.html';
                }, 600);
            });

            document.getElementById('redemption-cancel').addEventListener('click', () => {
                window.location.href = 'points.html';
            });
        });
})();
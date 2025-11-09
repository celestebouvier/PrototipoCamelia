// js/checkout-redemption.js
// Handles the redemption-only checkout flow when ?redemption=true&prizeId=ID

(function () {
    // Utility
    function qs(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    // Only run if redemption param is present
    if (qs('redemption') !== 'true') return;

    // Elements: ensure checkout.html contains #redemption-container
    const container = document.getElementById('redemption-container');
    if (!container) return;

    const prizeId = qs('prizeId');
    const pointsRequired = parseInt(qs('points'), 10) || 0;

    // Fetch prize details
    fetch('data/products.json')
        .then(r => r.json())
        .then(products => {
            const prize = products.find(p => String(p.id) === String(prizeId));
            if (!prize) {
                container.innerHTML = `<div class="card"><p>Premio no encontrado.</p></div>`;
                return;
            }

            // Build redemption UI
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
                // Recompute total
                const shipping = form.querySelector('input[name="shipping"]:checked').value;
                const total = shipping === 'correo' ? 1500 : 0;
                const eco = document.getElementById('eco-pack').checked;

                // Check points again
                if (currentUser.points < pointsRequired) {
                    if (typeof showMessage === 'function') showMessage('No tienes suficientes puntos para completar el canje.', 'error');
                    return;
                }

                // Deduct points
                currentUser.points -= pointsRequired;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                // Build comprobante (receipt)
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

                // Render receipt area with print button
                const resultEl = document.getElementById('redemption-result');
                resultEl.innerHTML = `
                    <div style="padding:12px;border-radius:8px;background:#f7f7fb;">
                        <h3>Comprobante de Canje</h3>
                        <p><strong>Producto:</strong> ${receipt.productName}</p>
                        <p><strong>Fecha:</strong> ${receipt.date}</p>
                        <p><strong>Usuario:</strong> ${receipt.user.name} — ${receipt.user.email}</p>
                        <p><strong>Puntos descontados:</strong> ${receipt.pointsUsed.toLocaleString('es-AR')}</p>
                        <p><strong>Método de envío:</strong> ${receipt.shippingMethod}</p>
                        <p><strong>Total a pagar:</strong> $${receipt.totalPaid}</p>
                        <div style="margin-top:12px;">
                            <button id="print-receipt" class="cta-btn primary-btn">Imprimir Comprobante</button>
                            <a href="points.html" class="cta-btn secondary-btn" style="margin-left:10px;">Volver a Mis Puntos</a>
                        </div>
                    </div>
                `;

                // Show toast
                if (typeof showMessage === 'function') showMessage('Canje confirmado. Se han descontado tus puntos.', 'success', 3500);

                document.getElementById('print-receipt').addEventListener('click', () => {
                    // Create a printable new window with receipt HTML
                    const printWindow = window.open('', '_blank', 'width=800,height=600');
                    printWindow.document.write(`<html><head><title>Comprobante de Canje</title>`);
                    printWindow.document.write(`<style>
                        body{font-family: Arial, sans-serif;padding:20px}
                        h2{color:#333}
                        .receipt{border:1px solid #ddd;padding:20px;border-radius:8px}
                        </style>`);
                    printWindow.document.write(`</head><body>`);
                    printWindow.document.write(resultEl.innerHTML);
                    printWindow.document.write(`<script>window.onload=function(){window.print();}</script>`);
                    printWindow.document.write(`</body></html>`);
                    printWindow.document.close();
                });
            });

            // Cancel button
            document.getElementById('redemption-cancel').addEventListener('click', () => {
                window.location.href = 'points.html';
            });
        });
})();
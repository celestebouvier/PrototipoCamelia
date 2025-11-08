const IVA_RATE = 0.21;
function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) return '$0';
    return `$${Math.round(price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function getPriceDetails(finalPrice) {
    if (typeof finalPrice !== 'number' || isNaN(finalPrice)) {
        return { final: formatPrice(0), neto: formatPrice(0), netoValue: 0 };
    }
    const netoValue = finalPrice / (1 + IVA_RATE);
    return {
        final: formatPrice(finalPrice),
        neto: formatPrice(netoValue),
        netoValue: netoValue
    };
}

function printCurrentOrderToPDF() {
    // Usa la función nativa del navegador para imprimir/guardar como PDF
    window.print();
}

function renderOrderDetail(order) {
    const contentEl = document.getElementById("order-detail-content");
    const titleEl = document.getElementById("page-title");
    const params = new URLSearchParams(window.location.search);
    const isFinalReceipt = params.get('final') === 'true';
    const isPrintMode = params.get('print') === 'true';

    // Manejo de Comprobante Final
    if (isFinalReceipt) {
        titleEl.textContent = "Comprobante Final de Compra";
        document.querySelector('.back-link').style.display = 'none';
        
        // Limpia datos de recibo final después de mostrarlos
        localStorage.removeItem('last_receipt_data');
        localStorage.removeItem('last_receipt_type');
        localStorage.removeItem('last_coupon_code');
    }

    let statusHtml = '';
    let physicalCodeHtml = '';

    // Manejo especial para Pago Fácil/RapiPago
    if (order.paymentMethod === 'pagofacil' && isFinalReceipt) {
        const couponCode = order.orderId;
        statusHtml = `<h2 style="color: #ff5722;">¡Orden de Pago Generada!</h2>`;
        physicalCodeHtml = `
            <div style="text-align: center; border: 2px dashed #ff5722; padding: 20px; margin: 20px 0;">
                <p style="font-size: 1.1em; color: #ff5722;">Pagar ${formatPrice(order.total)} en Pago Fácil o RapiPago.</p>
                <p style="font-size: 2em; color: #ff5722; font-weight: bold; margin: 20px 0;">Código de Pago: ${couponCode}</p>
                <p>Presenta este código para finalizar la compra.</p>
            </div>
        `;
    } else if (isFinalReceipt) {
        statusHtml = `<h2 style="color: green;">¡Compra Exitosa!</h2>`;
    }


    contentEl.innerHTML = `
        ${statusHtml}
        ${physicalCodeHtml}
        <div class="order-summary-box">
            <h3>Información General</h3>
            <p><strong>Orden:</strong> #${order.orderId}</p>
            <p><strong>Fecha:</strong> ${order.date}</p>
            <p><strong>Comprador:</strong> ${order.userEmail}</p>
            <p><strong>Método de Envío:</strong> ${order.shippingMethod}</p>
            <p><strong>Método de Pago:</strong> ${order.paymentMethodName}</p>
        </div>
        
        <h3>Productos</h3>
        <ul class="order-items-detail">
            ${order.items.map(item => {
                const prices = getPriceDetails(item.price);
                const itemTotalPrices = getPriceDetails(item.price * item.qty);
                return `
                <li>
                    <div>
                        <h4>${item.name}</h4>
                        <p>${item.qty} unidad(es) × ${prices.final} c/u</p>
                        <p class="price-neto">Neto: ${prices.neto} + IVA (21%)</p>
                    </div>
                    <span class="price-total">${itemTotalPrices.final}</span>
                </li>
                `;
            }).join('')}
        </ul>

        <div class="final-totals-detail">
            <p>Subtotal de Productos: <span>${formatPrice(order.subtotal)}</span></p>
            <p>Empaque Ecológico: <span>${formatPrice(order.packagingCost)}</span></p>
            <p>Costo de Envío: <span>${formatPrice(order.shippingCost)}</span></p>
            <hr>
            <p class="final-total"><strong>TOTAL FINAL:</strong> <span>${formatPrice(order.total)}</span></p>
        </div>
    `;

    // Muestra el botón de PDF y añade listener
    const printBtn = document.getElementById("print-order-btn");
    if (printBtn) {
        printBtn.style.display = 'block';
        printBtn.addEventListener('click', printCurrentOrderToPDF);
    }
    
    // Si viene del history.html con la orden de imprimir, ejecuta la impresión
    if (isPrintMode) {
         window.onload = () => {
             setTimeout(printCurrentOrderToPDF, 300);
         }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const isFinalReceipt = params.get("final") === 'true';
    
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Debes iniciar sesión para ver los detalles de tu compra.");
        window.location.href = "login.html";
        return;
    }

    let orderToRender = null;
    
    if (isFinalReceipt) {
        // Si es el recibo final, usa los datos temporales (guardados en checkout.js)
        const receiptData = localStorage.getItem('last_receipt_data');
        if (receiptData) {
            orderToRender = JSON.parse(receiptData);
        }
    } 
    
    // Si no se encontró el recibo temporal, busca en el historial
    if (!orderToRender) {
        const history = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
        orderToRender = history.find(h => 
            h.userEmail === currentUser.email && 
            h.orderId === parseInt(orderId)
        );
    }
    
    if (orderToRender) {
        renderOrderDetail(orderToRender);
    } else {
        document.getElementById("order-detail-content").innerHTML = "<p>Detalle de orden no encontrado o no autorizado. Vuelve a tu <a href='history.html'>Historial de Compras</a>.</p>";
    }
});
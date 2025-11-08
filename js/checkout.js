// js/checkout.js

const IVA_RATE = 0.21;
const COST_ENVIO_CORREO = 3000;  // costo de envío para Correo Argentino
let shippingCost = COST_ENVIO_CORREO;
let packagingCost = 0;
let subtotal = 0;

// Función de formateo de precios
function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) return '$0';
    // Mostrar con 2 decimales opcionalmente
    return `$${price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Obtener precios con y sin IVA
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

// Guarda el pedido en historial local
function saveToPurchaseHistory(orderData) {
    let history = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
    history.push(orderData);
    localStorage.setItem("purchaseHistory", JSON.stringify(history));
}

// Actualiza el resumen visible
function updateSummary() {
    const total = subtotal + shippingCost + packagingCost;
    const isRedemption = new URLSearchParams(window.location.search).get('redemption') === 'true';

    // Mostrar subtotal
    document.getElementById('checkout-subtotal').textContent = formatPrice(subtotal);
    // Empaque (incluso si es 0)
    document.getElementById('checkout-packaging-cost').textContent = formatPrice(packagingCost);
    // Envío
    document.getElementById('checkout-shipping-cost').textContent = formatPrice(shippingCost);

    // Total final (si es canje, subtotal “monetario” es 0, pero envío sigue)
    const displayTotal = isRedemption ? shippingCost + packagingCost : total;
    document.getElementById('checkout-total').textContent = formatPrice(displayTotal);

    const finalizeBtn = document.getElementById('finalize-purchase-btn');
    if (finalizeBtn) {
        const btnText = isRedemption
            ? "FINALIZAR CANJE"
            : `PAGAR Y FINALIZAR COMPRA (${formatPrice(displayTotal)})`;
        finalizeBtn.textContent = btnText;

        // Habilita solo si hay algo a pagar (o es canje)
        finalizeBtn.disabled = (!isRedemption && subtotal <= 0);
    }

    // Mostrar u ocultar la línea de envío si es cero
    const shippingLineEl = document.querySelector('.summary-shipping');
    if (shippingLineEl) {
        // Si shippingCost es 0, ocultar; si no, mostrar
        shippingLineEl.style.display = (shippingCost > 0) ? 'block' : 'none';
    }
}

// Handler de cambio de envío
function handleShippingChange(e) {
    // Leer el data-cost del radio
    shippingCost = parseInt(e.target.dataset.cost) || 0;
    updateSummary();
}

// Handler para cambio de empaque ecológico
function handlePackagingChange(e) {
    // Si quisieras cobrar algo por el empaque podrías hacerlo aquí
    // En tu diseño actual, packagingCost es 0 ya sea que lo marques o no,
    // pero podemos usar e.target.checked para efecto visual
    packagingCost = 0;
    // Si quisieras costo, podrías: packagingCost = e.target.checked ? 200 : 0;
    updateSummary();
}

// Cuando se hace click en “PAGAR Y FINALIZAR COMPRA”
function handleFinalizePurchase() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Debes iniciar sesión para finalizar la compra.");
        window.location.href = "login.html";
        return;
    }

    const cart = new Cart();  // usa tu clase Cart ya definida

    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    const paymentRadio = document.querySelector('input[name="payment"]:checked');

    if (!shippingRadio || !paymentRadio) {
        alert("Por favor, selecciona envío y método de pago.");
        return;
    }

    const isRedemption = new URLSearchParams(window.location.search).get('redemption') === 'true';
    const finalSubtotal = isRedemption ? 0 : subtotal;
    const totalFinal = finalSubtotal + shippingCost + packagingCost;

    const orderData = {
        orderId: Math.floor(100000 + Math.random() * 900000),
        userEmail: currentUser.email,
        date: new Date().toLocaleString('es-AR'),
        items: [...cart.items],
        subtotal: subtotal,
        shippingMethod: shippingRadio.parentNode.querySelector('.shipping-label')?.textContent || '',
        shippingCost: shippingCost,
        packagingCost: packagingCost,
        paymentMethod: paymentRadio.value,
        paymentMethodName: paymentRadio.parentNode.querySelector('.payment-label')?.textContent || '',
        total: totalFinal,
        isRedemption: isRedemption
    };

    // Según método de pago, redirigir o simular:
    if (orderData.paymentMethod === 'tarjeta-credito-debito') {
        localStorage.setItem('orderData', JSON.stringify(orderData));
        window.location.href = 'payment.html';
        return;
    }

    if (orderData.paymentMethod === 'pagofacil') {
        const couponCode = `CAMELIA-${Math.floor(1000 + Math.random() * 90000)}`;
        saveToPurchaseHistory(orderData);
        cart.clear();
        localStorage.setItem('last_receipt_data', JSON.stringify(orderData));
        localStorage.setItem('last_receipt_type', 'physical');
        localStorage.setItem('last_coupon_code', couponCode);

        alert(`Orden generada. Código: ${couponCode}`);
        window.location.href = `order-detail.html?orderId=${orderData.orderId}&final=true`;
        return;
    }

    if (orderData.paymentMethod === 'pagofacil') {
        // Genera un código numérico (ej: 5 dígitos)
        const paymentCode = Math.floor(10000 + Math.random() * 90000); 
        
        // La orden se registra con el estado pendiente de pago
        saveToPurchaseHistory(orderData); 
        cart.clear(); // Vacía el carrito local
        
        // Almacenar datos para el recibo/detalle final
        localStorage.setItem('last_receipt_data', JSON.stringify(orderData));
        localStorage.setItem('last_receipt_type', 'physical');
        localStorage.setItem('last_coupon_code', paymentCode); // Almacena el código numérico

        // Muestra alerta con el código numérico generado
        alert(`🛍️ Orden generada. Realiza tu pago en Pago Fácil o Rapipago.\nCódigo de pago: ${paymentCode}`);
        
        // Redirige al detalle de orden
        window.location.href = `order-detail.html?orderId=${orderData.orderId}&final=true`;
        return;
    }

    // 3. Mercado Pago (Simula redirección a la API de MP, luego confirma y suma puntos)
    if (orderData.paymentMethod === 'mercadopago' || isRedemption) {
        
        // **********************************************
        // SIMULACIÓN DE REDIRECCIÓN A MERCADO PAGO API
        // **********************************************
        const mpUrl = 'https://api.mercadopago.com/checkout/redirect-simulado';
        const feature = 'width=600,height=600,scrollbars=yes';
        
        // Abre una nueva ventana para simular la pasarela
        const mpWindow = window.open(mpUrl, 'MercadoPago', feature);

        // Simula la confirmación de la compra después de unos segundos
        // En una implementación real, este paso lo haría el "webhook" de MP.
        setTimeout(() => {
            if (mpWindow) mpWindow.close(); // Cierra la ventana simulada
            
            // Lógica de confirmación y suma de puntos (similar a payment.js)
            const total = orderData.total;
            const earnedPoints = Math.floor(total / 100) * 10; // 10 puntos cada $100

            // Registrar la compra (se usa `saveToPurchaseHistory` que lo hace)
            saveToPurchaseHistory(orderData);
            cart.clear(); // Vacía el carrito local
            
            // Sumar puntos al usuario (Esta lógica debe replicarse aquí o refactorizarse)
            let currentUser = JSON.parse(localStorage.getItem("currentUser"));
            if (currentUser) {
                currentUser.points = (currentUser.points || 0) + earnedPoints;
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
            }
            
            localStorage.setItem('last_receipt_data', JSON.stringify(orderData));
            localStorage.setItem('last_receipt_type', 'digital');

            alert(`✅ Compra con Mercado Pago exitosa #${orderData.orderId}.\n+${earnedPoints} puntos sumados.`);
            window.location.href = `order-detail.html?orderId=${orderData.orderId}&final=true`;

        }, 3000); // 3 segundos para la simulación

        return; // Detiene el flujo hasta la simulación del timeout
    }
}

// Inicialización al cargar la página
function initCheckout() {
    const cart = new Cart();
    subtotal = cart.getTotal();

    // Listeners para opciones de envío
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');
    shippingRadios.forEach(r => r.addEventListener('change', handleShippingChange));

    // Listener para empaque ecológico
    const ecoEl = document.getElementById('eco-packaging');
    if (ecoEl) {
        ecoEl.addEventListener('change', handlePackagingChange);
    }

    // Listener para botón finalizar
    const finalizeBtn = document.getElementById('finalize-purchase-btn');
    if (finalizeBtn) {
        finalizeBtn.addEventListener('click', handleFinalizePurchase);
    }

    // Inicializar valores
    shippingCost = document.querySelector('input[name="shipping"]:checked')?.dataset.cost
                    ? parseInt(document.querySelector('input[name="shipping"]:checked').dataset.cost)
                    : COST_ENVIO_CORREO;

    updateSummary();
}

// Esperar carga DOM
document.addEventListener("DOMContentLoaded", initCheckout);

// js/payment.js
// ------------------------------------------------------
// Validación simulada de tarjeta y registro de compra
// ------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("payment-form");
  const messageEl = document.getElementById("form-message");
  const cardNumberInput = document.getElementById("cardNumber"); // NUEVO: obtener el input

  // NUEVO: Lógica para el formato de tarjeta (XXXX XXXX XXXX XXXX)
  cardNumberInput.addEventListener('input', function(e) {
    let input = e.target.value.replace(/\s/g, '').replace(/\D/g, ''); // Limpiar espacios y no dígitos
    let formattedInput = '';

    // Aplicar formato de 4 dígitos y espacio
    for (let i = 0; i < input.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedInput += ' ';
        }
        formattedInput += input[i];
    }
    
    e.target.value = formattedInput.substring(0, 19); // Limitar a 19 caracteres (16 dígitos + 3 espacios)
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const checkoutData = JSON.parse(localStorage.getItem("orderData")); // Datos previos del checkout
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];

  if (!currentUser || !checkoutData || cart.length === 0) {
    alert("No se encontró información de compra. Redirigiendo al catálogo...");
    window.location.href = "catalog.html";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const cardName = document.getElementById("cardName").value.trim();
    const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
    const cardExp = document.getElementById("cardExp").value.trim();
    const cardCvv = document.getElementById("cardCvv").value.trim();
    const cardId = document.getElementById("cardId").value.trim();

    // Validaciones básicas
    // MODIFICACIÓN: El regex permite letras, espacios, tildes y caracteres latinos (áéíóúÁÉÍÓÚñÑ)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cardName)) {
      return showMessage("El nombre solo debe contener letras y acentos.", "error");
    }
    if (!/^\d{16}$/.test(cardNumber)) {
      return showMessage("El número de tarjeta debe tener 16 dígitos.", "error");
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExp)) {
      return showMessage("Formato de vencimiento inválido. Usa MM/AA.", "error");
    }
    if (!/^\d{3}$/.test(cardCvv)) {
      return showMessage("El CVV debe tener 3 dígitos.", "error");
    }
    if (!/^\d{7,8}$/.test(cardId)) {
      return showMessage("El DNI debe tener entre 7 y 8 números.", "error");
    }

    // Simulación de procesamiento
    showMessage("Procesando pago...", "info");
    setTimeout(() => {
      showMessage("Pago aprobado ✅", "success");
      finalizePurchase();
    }, 1500);
  });

  function showMessage(msg, type) {
    messageEl.textContent = msg;
    messageEl.className = `form-message ${type}`;
  }

  function finalizePurchase() {
    const purchaseHistory = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
    const userEmail = currentUser.email;
    const orderId = Date.now();

    const total = checkoutData.total;
    const earnedPoints = Math.floor(total / 100) * 10; // 10 puntos cada $100

    // Registrar la compra
    const newOrder = {
      orderId,
      userEmail,
      date: new Date().toLocaleDateString("es-AR"),
      items: cart,
      total,
      paymentMethod: "Tarjeta Bancaria",
    };

    purchaseHistory.push(newOrder);
    localStorage.setItem("purchaseHistory", JSON.stringify(purchaseHistory));

    // Sumar puntos
    currentUser.points = (currentUser.points || 0) + earnedPoints;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // Vaciar carrito
    localStorage.removeItem("cartItems");

        // Eliminar los datos temporales del pedido
    localStorage.removeItem("orderData");

    // Confirmación
    setTimeout(() => {
      alert(`✅ Compra finalizada correctamente.\n+${earnedPoints} puntos sumados.`);
      window.location.href = "history.html";
    }, 800);
  }
});
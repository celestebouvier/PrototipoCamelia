// js/profile.js

// Función auxiliar para actualizar la lista global de usuarios y la sesión actual
function updateGlobalUsers(updatedUser) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.email === updatedUser.email);
    
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(updatedUser)); // Actualizar sesión
        return true;
    }
    return false;
}

// Inicialización de Puntos (debe correr en todas las cargas para asegurar consistencia)
window.initializeUserPoints = function() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let updated = false;
    users.forEach(user => {
        if (user.points === undefined) {
            user.points = 50; // 50 puntos de bienvenida por defecto
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem("users", JSON.stringify(users));
    }
    
    // Actualizar la sesión actual si es necesario
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.points === undefined) {
        const updatedCurrentUser = users.find(u => u.email === currentUser.email);
        if (updatedCurrentUser) {
            localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initializeUserPoints(); // Ejecutar al inicio

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    // Redirigir si no hay sesión
    if (!currentUser && window.location.pathname.includes('profile.html')) {
        alert("Debes iniciar sesión para ver tu perfil.");
        window.location.href = "login.html";
        return;
    }

    // Lógica del formulario de perfil
    const profileForm = document.getElementById("profile-form");
    const userGreeting = document.getElementById("user-greeting");
    const profileNameInput = document.getElementById("profile-name");
    const profileEmailInput = document.getElementById("profile-email");
    const logoutProfileBtn = document.getElementById("logout-profile-btn");
    const messageEl = document.getElementById("profile-message");

    function showProfileMessage(msg, isError = false) {  }

    if (currentUser) {
        userGreeting.textContent = `Hola, ${currentUser.name}`;
        if (profileNameInput) profileNameInput.value = currentUser.name;
        if (profileEmailInput) profileEmailInput.value = currentUser.email;

        if (logoutProfileBtn) {
            logoutProfileBtn.addEventListener("click", () => {
                localStorage.removeItem("currentUser");
                window.location.href = "index.html";
            });
        }
    }

    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const name = profileNameInput.value.trim();
            const currentPassword = document.getElementById("current-password").value;
            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            let updatedUser = { ...currentUser };
            let changesMade = false;

            // 1. Actualizar Nombre (Validaciones)
            // ... (Lógica de validación de nombre) ...
            if (name !== currentUser.name) {
                updatedUser.name = name;
                changesMade = true;
            }

            // 2. Actualizar Contraseña (Validaciones)
            // ... (Lógica de validación de contraseña) ...
            if (currentPassword && newPassword && confirmPassword) {
                if (currentPassword !== currentUser.password) {
                    return showProfileMessage("La contraseña actual es incorrecta.", true);
                }
                if (newPassword !== confirmPassword) {
                    return showProfileMessage("La nueva contraseña y su confirmación no coinciden.", true);
                }
                updatedUser.password = newPassword;
                changesMade = true;
            }

            if (changesMade) {
                if (updateGlobalUsers(updatedUser)) {
                    // ... (Muestra mensaje de éxito) ...
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    // ... (Muestra mensaje de error) ...
                }
            } else {
                // ... (Muestra mensaje de no hay cambios) ...
            }
        });
    }
});
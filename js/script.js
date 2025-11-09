/* Toast */
window.showMessage = function (msg, type = 'info', timeout = 3500) {
    const id = 'global-toast-container';
    let container = document.getElementById(id);
    if (!container) {
        container = document.createElement('div');
        container.id = id;
        container.style.cssText = `
            position: fixed;
            top: 18px;
            right: 18px;
            z-index: 20000;
            display:flex;
            flex-direction:column;
            gap:10px;
            align-items: flex-end;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'global-toast ' + type;
    toast.style.cssText = `
        min-width: 220px;
        max-width: 380px;
        background: ${type === 'error' ? '#ff4757' : type === 'success' ? 'linear-gradient(135deg,#7be495,#2ecc71)' : 'linear-gradient(135deg,#87ceeb,#c3e7ff)'};
        color: white;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        font-weight: 600;
        font-size: 14px;
        opacity: 0;
        transform: translateY(-6px);
        transition: all 240ms ease;
        pointer-events: auto;
    `;
    toast.textContent = msg;
    container.appendChild(toast);

    // show
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-6px)';
        setTimeout(() => toast.remove(), 260);
    }, timeout);
};

// Busqueda
function initSearchUI() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');

    if (!searchForm) return;

    if (searchForm.dataset.searchInit === 'true') return;
    searchForm.dataset.searchInit = 'true';

    searchForm.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const query = (searchInput && searchInput.value || '').trim();
        if (!query) {
            showMessage('Ingresa un término de búsqueda', 'info');
            return;
        }
        const encoded = encodeURIComponent(query);
        window.location.href = `catalog.html?search=${encoded}`;
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchUI);
} else {
    initSearchUI();
}

// ---------------- Carrusel ----------------
class Carousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.carousel-slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        this.startAutoPlay();
        
        const carouselContainer = document.querySelector('.hero-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
            carouselContainer.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }
    
    showSlide(index) {
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));
        
        if (this.slides[index]) this.slides[index].classList.add('active');
        if (this.dots[index]) this.dots[index].classList.add('active');
        
        this.currentSlide = index;
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }
    
    goToSlide(index) {
        this.showSlide(index);
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); 
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// ---------------- Newsletter ----------------
class Newsletter {
    constructor() {
        this.newsletterForm = document.querySelector('.newsletter-form');
        this.newsletterInput = document.querySelector('.newsletter-input');
        this.newsletterBtn = document.querySelector('.newsletter-btn');
        
        this.init();
    }
    
    init() {
        if (this.newsletterBtn) {
            this.newsletterBtn.addEventListener('click', () => this.subscribe());
        }
        
        if (this.newsletterInput) {
            this.newsletterInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.subscribe();
                }
            });
        }
    }
    
    subscribe() {
        const email = this.newsletterInput ? this.newsletterInput.value.trim() : '';
        
        if (this.validateEmail(email)) {
            // Guardar email en localStorage
            localStorage.setItem("newsletterEmail", email);
            this.animateSubscribe();
            this.showSuccessMessage();
            if (this.newsletterInput) this.newsletterInput.value = '';
        } else {
            this.showErrorMessage();
        }
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    animateSubscribe() {
        if (this.newsletterBtn) {
            this.newsletterBtn.style.transform = 'scale(0.95)';
            this.newsletterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suscribiendo...';
            
            setTimeout(() => {
                this.newsletterBtn.style.transform = 'scale(1)';
                this.newsletterBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Suscribirse';
            }, 1500);
        }
    }
    
    showSuccessMessage() {
        // Use the global toast instead of alert or custom DOM alerts
        if (typeof showMessage === 'function') {
            showMessage("¡Gracias por suscribirte! 🌸", 'success', 3000);
        } else {
            alert("¡Gracias por suscribirte!");
        }
    }
    
    showErrorMessage() {
        if (typeof showMessage === 'function') {
            showMessage("Por favor, ingresa un email válido.", 'error', 3000);
        } else {
            alert("Por favor, ingresa un email válido.");
        }
        if (this.newsletterInput) {
            this.newsletterInput.style.borderColor = '#ff4757';
            this.newsletterInput.placeholder = 'Por favor, ingresa un email válido';
            
            setTimeout(() => {
                this.newsletterInput.style.borderColor = '';
                this.newsletterInput.placeholder = 'Tu correo electrónico';
            }, 3000);
        }
    }
}

// ---------------- Categories ----------------
class Categories {
    constructor() {
        this.categoryCards = document.querySelectorAll('.category-card');
        this.init();
    }
    
    init() {
        this.categoryCards.forEach(card => {
            card.addEventListener('click', () => this.selectCategory(card));
            card.addEventListener('mouseenter', () => this.hoverCategory(card));
            card.addEventListener('mouseleave', () => this.unhoverCategory(card));
        });
    }
    
    selectCategory(card) {
        const categoryName = card.querySelector('h3').textContent;
        console.log(`Selected category: ${categoryName}`);
        
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
        
    }
    
    hoverCategory(card) {
        const icon = card.querySelector('.category-icon');
        if (icon) {
            icon.style.animation = 'bounce 0.6s ease-in-out';
        }
    }
    
    unhoverCategory(card) {
        const icon = card.querySelector('.category-icon');
        if (icon) {
            icon.style.animation = '';
        }
    }
}

// ---------------- CharacterCarousel ----------------
class CharacterCarousel {
    constructor() {
        this.track = document.querySelector('.character-track');
        this.prevBtn = document.getElementById('characterPrevBtn');
        this.nextBtn = document.getElementById('characterNextBtn');
        this.cards = document.querySelectorAll('.character-card');
        this.currentIndex = 0;
        this.cardsToShow = 4;
        this.cardWidth = 200; 
        
        this.init();
    }
    
    init() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.cards.forEach(card => {
            card.addEventListener('click', () => this.selectCharacter(card));
        });
        
        this.adjustCardsToShow();
        window.addEventListener('resize', () => this.adjustCardsToShow());
    }
    
    adjustCardsToShow() {
        const container = document.querySelector('.character-carousel');
        if (!container) return;
        const containerWidth = container.offsetWidth;
        this.cardsToShow = Math.floor(containerWidth / 200);
        if (this.cardsToShow < 1) this.cardsToShow = 1;
        if (this.cardsToShow > this.cards.length) this.cardsToShow = this.cards.length;
    }
    
    updateCarousel() {
        if (this.track) {
            const translateX = -this.currentIndex * this.cardWidth;
            this.track.style.transform = `translateX(${translateX}px)`;
        }
    }
    
    nextSlide() {
        const maxIndex = this.cards.length - this.cardsToShow;
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }
    
    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }
    
    selectCharacter(card) {
        const characterName = card.querySelector('h3').textContent;
        console.log(`Selected character: ${characterName}`);
        
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }
}

// ---------------- Authentication ----------------
class Authentication {
    constructor() {
        this.authBtn = document.querySelector('.auth-btn');
        this.profileBtn = document.querySelector('.profile-btn');
        this.isLoggedIn = false;
        
        this.init();
    }
    
    init() {
        if (this.authBtn) {
            this.authBtn.addEventListener('click', () => this.handleAuth());
        }
        
        if (this.profileBtn) {
            this.profileBtn.addEventListener('click', () => this.handleProfile());
        }
    }
    
    handleAuth() {
        if (!this.isLoggedIn) {
            // Simulate login
            this.showLoginForm();
        } else {
            // Logout
            this.logout();
        }
    }
    
    showLoginForm() {
        console.log('Showing login form');
        
        setTimeout(() => {
            this.login();
        }, 2000);
    }
    
    login() {
        this.isLoggedIn = true;
        if (this.authBtn) {
            this.authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
        }
        
        this.showSuccessMessage('¡Bienvenido a Camelia!');
    }
    
    logout() {
        this.isLoggedIn = false;
        if (this.authBtn) {
            this.authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        }
        
        this.showSuccessMessage('Sesión cerrada correctamente');
    }
    
    handleProfile() {
        if (this.isLoggedIn) {
            console.log('Opening user profile');
            this.showSuccessMessage('Abriendo perfil de usuario');
        } else {
            this.showErrorMessage('Debes iniciar sesión primero');
        }
    }
    
    showSuccessMessage(message) {
        if (typeof showMessage === 'function') showMessage(message, 'success');
        else {
            const messageEl = document.createElement('div');
            messageEl.className = 'auth-message success';
            messageEl.innerHTML = message;
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ff69b4, #87ceeb);
                color: white;
                padding: 15px 25px;
                border-radius: 25px;
                font-weight: 600;
                z-index: 10000;
                animation: slideInRight 0.5s ease-out;
            `;
            document.body.appendChild(messageEl);
            setTimeout(() => { messageEl.remove(); }, 3000);
        }
    }
    
    showErrorMessage(message) {
        if (typeof showMessage === 'function') showMessage(message, 'error');
        else {
            const messageEl = document.createElement('div');
            messageEl.className = 'auth-message error';
            messageEl.innerHTML = message;
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4757;
                color: white;
                padding: 15px 25px;
                border-radius: 25px;
                font-weight: 600;
                z-index: 10000;
                animation: slideInRight 0.5s ease-out;
            `;
            document.body.appendChild(messageEl);
            setTimeout(() => { messageEl.remove(); }, 3000);
        }
    }
}

// ---------------- EnvironmentalCommitment ----------------
class EnvironmentalCommitment {
    constructor() {
        this.ecoBtn = document.querySelector('.eco-btn');
        this.commitmentCards = document.querySelectorAll('.commitment-card');
        this.init();
    }
    
    init() {
        if (this.ecoBtn) {
            this.ecoBtn.addEventListener('click', () => this.showMoreInfo());
        }
        
        this.commitmentCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.animateCard(card));
        });
    }

    
    animateCard(card) {
        const icon = card.querySelector('.commitment-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
            
            setTimeout(() => {
                icon.style.transform = '';
            }, 300);
        }
    }
}

class SmoothScroll {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }
    
    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.scrollToSection(href);
                }
            });
        });
    }
    
    scrollToSection(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// ---------------- ScrollAnimations ----------------
class ScrollAnimations {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.1 }
        );
        
        this.init();
    }
    
    init() {
        const animatedElements = document.querySelectorAll('.category-card, .newsletter, .commitment-card, .character-card, .product-card');
        animatedElements.forEach(element => {
            this.observer.observe(element);
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }
}

// ---------------- DOM Ready init ----------------
document.addEventListener('DOMContentLoaded', () => {
    new Carousel();
    new Newsletter();
    new Categories();
    new CharacterCarousel();
    new Authentication();
    new EnvironmentalCommitment();
    new SmoothScroll();
    new ScrollAnimations();
    
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
    
    addInteractiveEffects();
});

function addInteractiveEffects() {
    document.addEventListener('click', (e) => {
        createSparkle(e.clientX, e.clientY);
    });


}

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: 20px;
        pointer-events: none;
        z-index: 10000;
        animation: sparkleAnimation 1s ease-out forwards;
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleAnimation {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    /* small toast default styles, in case CSS doesn't include them */
    .global-toast.success { }
    .global-toast.error { }
`;
document.head.appendChild(sparkleStyle);
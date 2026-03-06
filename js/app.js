/**
 * ========================================
 * Proyecto Manglar Dos - Colegio El Manglar
 * Mobile-Only JavaScript
 * ========================================
 */

// ========================================
// Esperar a que el DOM esté cargado
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 Colegio El Manglar - App cargada correctamente');
    
    // Inicializar funcionalidades
    initBottomNav();
    initNotificationBtn();
    initParticipateButtons();
    initScrollAnimations();
    initBalanceActions();
});

// ========================================
// Bottom Navigation
// ========================================
function initBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Agregar active al actual
            this.classList.add('active');
            
            // Feedback háptico (si está disponible en mobile)
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
            
            // Navegación
            const section = this.querySelector('span').textContent.toLowerCase();
            console.log('📍 Navegando a:', section);
            
            // Ejemplo: scroll a diferentes secciones
            if (section === 'inicio') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// ========================================
// Botón de Notificaciones
// ========================================
function initNotificationBtn() {
    const notificationBtn = document.querySelector('.notification-btn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            console.log('🔔 Notificaciones abiertas');
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate([10, 30, 10]);
            }
            
            // Mostrar notificaciones
            showAlert('🔔 No tienes notificaciones nuevas', 'info');
        });
    }
}

// ========================================
// Botones de Participar
// ========================================
function initParticipateButtons() {
    const participateBtns = document.querySelectorAll('.btn-participate');
    
    participateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const activityCard = this.closest('.activity-card');
            const activityTitle = activityCard.querySelector('.activity-title')?.textContent;
            
            console.log('📝 Participando en:', activityTitle);
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate(20);
            }
            
            // Simular inscripción
            this.textContent = 'Inscrito ✓';
            this.disabled = true;
            this.style.backgroundColor = '#388E3C';
            
            // Actualizar barra de progreso
            const progressBar = activityCard.querySelector('.progress-fill');
            if (progressBar) {
                const currentWidth = parseFloat(progressBar.style.width) || 0;
                const newWidth = Math.min(currentWidth + 10, 100);
                progressBar.style.width = newWidth + '%';
            }
            
            // Actualizar cupo
            const slotsValue = activityCard.querySelector('.slots-value');
            if (slotsValue) {
                const match = slotsValue.textContent.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) {
                    const current = parseInt(match[1]) + 1;
                    const total = match[2];
                    slotsValue.textContent = `${current} / ${total} personas`;
                }
            }
            
            // Mostrar confirmación
            showAlert(`✅ Te has inscrito en: ${activityTitle}`, 'success');
        });
    });
}

// ========================================
// Botones de Saldo (Historial/Canjear)
// ========================================
function initBalanceActions() {
    const balanceBtns = document.querySelectorAll('.balance-actions .btn');
    
    balanceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            console.log('💰 Acción:', action);
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate(15);
            }
            
            if (action === 'Historial') {
                showAlert('📜 Mostrando historial de Mangle Coins', 'info');
            } else if (action === 'Canjear') {
                showAlert('🎁 Abriendo tienda de recompensas', 'info');
            }
        });
    });
}

// ========================================
// Animaciones de Scroll
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar activity cards
    const cards = document.querySelectorAll('.activity-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// ========================================
// Utilidades
// ========================================

// Mostrar alertas toast
function showAlert(message, type = 'info') {
    // Remover alertas existentes
    const existingAlert = document.querySelector('.toast-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Crear elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `toast-alert toast-${type}`;
    alertDiv.textContent = message;
    
    // Colores según tipo
    const bgColor = type === 'success' ? '#4CAF50' : 
                    type === 'error' ? '#E53E3E' : 
                    '#4CAF50';
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${bgColor};
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    
    // Agregar al DOM
    document.body.appendChild(alertDiv);
    
    // Remover después de 2.5 segundos
    setTimeout(() => {
        alertDiv.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 2500);
}

// Agregar animaciones CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// Funciones adicionales para el futuro
// ========================================

// Actualizar saldo
function updateBalance(newBalance) {
    const amountNumber = document.querySelector('.amount-number');
    if (amountNumber) {
        // Animación de actualización
        amountNumber.style.transform = 'scale(1.1)';
        amountNumber.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            amountNumber.textContent = newBalance.toLocaleString('es-ES');
            amountNumber.style.transform = 'scale(1)';
        }, 200);
    }
}

// Agregar nueva actividad
function addActivity(data) {
    const section = document.querySelector('.section');
    const activitiesContainer = section.querySelector('.link-view-all').parentElement;
    
    if (section) {
        const newCard = document.createElement('div');
        newCard.className = 'activity-card';
        newCard.innerHTML = `
            <div class="activity-image ${data.imageClass || 'cleanup'}">
                <div class="reward-badge">+${data.reward} MC</div>
                <div class="activity-illustration">
                    ${data.illustrationSVG || '<svg width="80" height="80" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.3)"/></svg>'}
                </div>
            </div>
            <div class="activity-content">
                <h3 class="activity-title">${data.title}</h3>
                <p class="activity-description">${data.description}</p>
                <div class="activity-slots">
                    <span class="slots-label">CUPO</span>
                    <span class="slots-value">${data.currentSlots} / ${data.totalSlots} personas</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(data.currentSlots / data.totalSlots) * 100}%;"></div>
                </div>
                <button class="btn btn-participate">Participar</button>
            </div>
        `;
        
        // Insertar antes del bottom-spacer
        const spacer = section.querySelector('.bottom-spacer');
        section.insertBefore(newCard, spacer);
        
        // Re-inicializar botones
        initParticipateButtons();
        
        // Scroll automático para mostrar la nueva card
        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Actualizar cupo de una actividad
function updateSlots(activityIndex, newCurrent, newTotal) {
    const cards = document.querySelectorAll('.activity-card');
    if (cards[activityIndex]) {
        const slotsValue = cards[activityIndex].querySelector('.slots-value');
        const progressBar = cards[activityIndex].querySelector('.progress-fill');
        
        if (slotsValue) {
            slotsValue.textContent = `${newCurrent} / ${newTotal} personas`;
        }
        
        if (progressBar) {
            const percentage = (newCurrent / newTotal) * 100;
            progressBar.style.width = percentage + '%';
        }
    }
}

// Marcar actividad como completada
function completeActivity(activityIndex) {
    const cards = document.querySelectorAll('.activity-card');
    if (cards[activityIndex]) {
        const btn = cards[activityIndex].querySelector('.btn-participate');
        const progressBar = cards[activityIndex].querySelector('.progress-fill');
        
        if (btn) {
            btn.textContent = 'Completado ✓';
            btn.disabled = true;
            btn.style.backgroundColor = '#CCCCCC';
        }
        
        if (progressBar) {
            progressBar.style.width = '100%';
        }
    }
}

// ========================================
// Service Worker Register (para PWA)
// ========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // navigator.serviceWorker.register('/sw.js').then(function(registration) {
        //     console.log('ServiceWorker registration successful:', registration.scope);
        // }, function(err) {
        //     console.log('ServiceWorker registration failed:', err);
        // });
    });
}

// ========================================
// Online/Offline Detection
// ========================================
window.addEventListener('online', function() {
    console.log('🌐 Online');
    showAlert('🌐 Conexión restablecida', 'success');
});

window.addEventListener('offline', function() {
    console.log('❌ Offline');
    showAlert('❌ Sin conexión', 'error');
});

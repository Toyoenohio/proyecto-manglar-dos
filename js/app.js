/**
 * ========================================
 * Proyecto Manglar Dos - App de Recompensas
 * Mobile-Only JavaScript
 * ========================================
 */

// ========================================
// Esperar a que el DOM esté cargado
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🌿 App de Recompensas - Cargada correctamente');
    
    // Inicializar sistema de rutas (si existe)
    if (typeof Routes !== 'undefined') {
        Routes.init();
    }
    
    // Verificar autenticación
    if (Auth.isLoggedIn()) {
        const user = Auth.getCurrentUser();
        console.log('✅ Usuario logueado:', user.nombre);
        
        // Actualizar UI con datos del usuario
        await loadUserData(user);
    }
    
    // Inicializar funcionalidades
    initBottomNav();
    initNotificationBtn();
    initActivityCards();
    initBalanceActions();
});

// ========================================
// Carga de Datos Dinámicos
// ========================================

/**
 * Cargar datos del usuario en la UI
 */
async function loadUserData(user) {
    try {
        // Actualizar saludo
        updateGreeting(user.nombre);
        
        // Cargar saldo del usuario
        const saldo = await Database.calcularSaldoUsuario(user.id);
        
        // Cargar actividades disponibles
        const actividades = await Database.getActividadesDisponibles();
        
        // Renderizar secciones
        updateBalance(saldo);
        renderActividades(actividades);
        
        console.log('✅ Datos cargados:', {
            saldo: saldo,
            actividades: actividades.length
        });
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        showError('Error cargando datos. Verifica tu conexión.');
    }
}

/**
 * Actualizar saludo con nombre del usuario
 */
function updateGreeting(nombre) {
    const greetingElement = document.querySelector('.greeting-large');
    if (greetingElement) {
        greetingElement.textContent = `¡Hola, ${nombre}!`;
    }
}

/**
 * Actualizar saldo en la card
 */
function updateBalance(saldo) {
    const balanceElement = document.querySelector('.amount-number');
    if (balanceElement) {
        balanceElement.textContent = saldo.toLocaleString('es-ES');
    }
}

/**
 * Renderizar actividades disponibles
 */
function renderActividades(actividades) {
    const container = document.querySelector('.activities-list');
    if (!container) return;
    
    // Limpiar contenido estático
    container.innerHTML = '';
    
    if (actividades.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🎉 ¡No hay actividades disponibles por el momento!</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cards
    actividades.forEach(actividad => {
        const card = createActivityCard(actividad);
        container.appendChild(card);
    });
}

/**
 * Crear card de actividad
 */
function createActivityCard(actividad) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    card.dataset.activityId = actividad.id;
    
    // Determinar clase CSS según tipo de actividad
    const activityClass = getActivityClass(actividad.tipo);
    const iconSVG = getActivityIcon(actividad.tipo);
    
    // Calcular progreso de cupo
    const cupoMax = parseInt(actividad.cupo_maximo) || 0;
    const cupoActual = parseInt(actividad.cupo_actual) || 0;
    const progreso = cupoMax > 0 ? Math.round((cupoActual / cupoMax) * 100) : 0;
    const cupoText = cupoMax > 0 ? `${cupoActual}/${cupoMax}` : 'Ilimitado';
    
    card.innerHTML = `
        <div class="activity-image ${activityClass}">
            <div class="reward-badge">+${actividad.recompensa_mc} MC</div>
            <div class="activity-illustration">
                ${iconSVG}
            </div>
        </div>
        <div class="activity-content">
            <h3 class="activity-title">${actividad.nombre}</h3>
            <p class="activity-description">${actividad.descripcion}</p>
            <div class="activity-slots">
                <div class="slots-info">
                    <span class="slots-label">CUPO DISPONIBLE</span>
                    <span class="slots-value">${cupoText}</span>
                </div>
                ${cupoMax > 0 ? `
                <div class="slots-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progreso}%"></div>
                    </div>
                </div>
                ` : ''}
            </div>
            <button class="btn btn-primary btn-block" data-activity="${actividad.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                Participar
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Obtener clase CSS para tipo de actividad
 */
function getActivityClass(tipo) {
    const tipos = {
        'limpieza': 'cleanup',
        'tutoria': 'tutoring',
        'reciclaje': 'recycling',
        'deporte': 'sports',
        'arte': 'art',
        'musica': 'music'
    };
    
    return tipos[tipo] || 'cleanup';
}

/**
 * Obtener icono SVG para tipo de actividad
 */
function getActivityIcon(tipo) {
    const icons = {
        'limpieza': '<svg width="80" height="80" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.3)"/><rect x="35" y="45" width="30" height="35" rx="4" fill="white" opacity="0.9"/><circle cx="50" cy="35" r="12" fill="white" opacity="0.9"/><path d="M45 55L50 60L55 50" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'tutoria': '<svg width="80" height="80" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.3)"/><circle cx="50" cy="40" r="15" fill="white" opacity="0.9"/><rect x="35" y="60" width="30" height="20" rx="4" fill="white" opacity="0.9"/><path d="M40 65L45 70L55 60" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'reciclaje': '<svg width="80" height="80" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.3)"/><rect x="35" y="40" width="30" height="30" rx="4" fill="white" opacity="0.9"/><path d="M40 45L45 50L55 40" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="65" r="8" fill="white" opacity="0.9"/></svg>'
    };
    
    return icons[tipo] || icons.limpieza;
}

// ========================================
// Funcionalidades de UI
// ========================================

/**
 * Inicializar navegación inferior
 */
function initBottomNav() {
    console.log('🔧 Inicializando bottom navigation...');
    
    // Obtener la página actual
    const currentPath = window.location.pathname;
    
    // Remover clase active de todos los items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        
        // Verificar si este item corresponde a la página actual
        const href = item.getAttribute('href');
        const cleanHref = href === '/' ? '/' : href.replace(/\.html$/, '');
        const cleanCurrent = currentPath.replace(/\.html$/, '');
        
        if (cleanHref === cleanCurrent || (cleanHref === '/' && cleanCurrent === '')) {
            item.classList.add('active');
        }
    });
    
    // Agregar event listeners para navegación
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Solo manejar si no es el item activo
            if (!this.classList.contains('active')) {
                const href = this.getAttribute('href');
                console.log('📍 Navegando a:', href);
                
                // Usar sistema de rutas si está disponible
                if (typeof Routes !== 'undefined' && Routes.config.useSPA) {
                    e.preventDefault();
                    Routes.navigate(href);
                }
                
                // Feedback háptico
                if (navigator.vibrate) {
                    navigator.vibrate([10]);
                }
            }
        });
    });
}

/**
 * Inicializar botón de notificaciones
 */
function initNotificationBtn() {
    const notificationBtn = document.querySelector('.notification-btn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            console.log('🔔 Notificaciones abiertas');
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate([10, 30, 10]);
            }
            
            showAlert('🔔 Sin notificaciones nuevas', 'info');
        });
    }
}

/**
 * Inicializar cards de actividades
 */
function initActivityCards() {
    // Delegación de eventos para botones "Participar"
    document.addEventListener('click', function(e) {
        const participateBtn = e.target.closest('[data-activity]');
        if (!participateBtn) return;
        
        const activityId = participateBtn.dataset.activity;
        console.log('🎯 Participar en actividad:', activityId);
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([20]);
        }
        
        // Mostrar confirmación
        if (confirm('¿Querés participar en esta actividad?')) {
            showAlert('✅ ¡Inscripción enviada! Revisá tu perfil para más detalles.', 'success');
            
            // Deshabilitar botón temporalmente
            participateBtn.disabled = true;
            participateBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Inscrito
            `;
            
            // Aquí iría la lógica para registrar la participación
            // await Database.registrarParticipacion(userId, activityId);
        }
    });
}

/**
 * Inicializar acciones de saldo
 */
function initBalanceActions() {
    // Botón Historial
    const historyBtn = document.querySelector('.btn-outline:nth-child(1)');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            console.log('📊 Historial de transacciones');
            showAlert('📊 Historial disponible próximamente', 'info');
        });
    }
    
    // Botón Canjear
    const redeemBtn = document.querySelector('.btn-outline:nth-child(2)');
    if (redeemBtn) {
        redeemBtn.addEventListener('click', function() {
            console.log('🛒 Redirigiendo a tienda...');
            window.location.href = '/tienda';
        });
    }
}

// ========================================
// Utilidades
// ========================================

/**
 * Mostrar alerta toast
 */
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
    
    // Estilos
    const bgColor = type === 'success' ? '#4CAF50' : 
                    type === 'error' ? '#E53E3E' : 
                    '#2196F3';
    
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

/**
 * Mostrar error
 */
function showError(message) {
    showAlert(message, 'error');
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
    
    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #666;
        font-size: 14px;
        grid-column: 1 / -1;
    }
    
    .toast-alert {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #4CAF50;
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
    }
    
    .toast-success {
        background-color: #4CAF50;
    }
    
    .toast-error {
        background-color: #E53E3E;
    }
    
    .toast-info {
        background-color: #2196F3;
    }
`;
document.head.appendChild(style);
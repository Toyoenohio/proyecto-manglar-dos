/**
 * ========================================
 * Index - JavaScript
 * Proyecto Manglar Dos - App de Recompensas
 * ======================================== */

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏠 Página principal cargada');
    
    // Verificar autenticación
    if (!Auth.isLoggedIn()) {
        console.log('🔒 Usuario no autenticado, mostrando página principal pública');
        // Podemos mostrar datos públicos o redirigir a login
        await loadPublicData();
    } else {
        console.log('✅ Usuario autenticado, cargando datos personales');
        await loadUserData();
    }
    
    // Cargar actividades dinámicas
    await loadActivities();
    
    // Inicializar funcionalidades
    initParticipateButtons();
    initBalanceActions();
    initNotificationBtn();
    initBottomNav();
});

/**
 * Cargar datos públicos (sin autenticación)
 */
async function loadPublicData() {
    try {
        // Mostrar saldo genérico
        const balanceElement = document.querySelector('.amount-number');
        if (balanceElement) {
            balanceElement.textContent = '1,250';
        }
        
        // Mostrar nombre genérico
        const greetingElement = document.querySelector('.greeting-large');
        if (greetingElement) {
            greetingElement.textContent = '¡Hola, Estudiante!';
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos públicos:', error);
    }
}

/**
 * Cargar datos del usuario autenticado
 */
async function loadUserData() {
    try {
        const user = Auth.getCurrentUser();
        if (!user) return;
        
        console.log('✅ Cargando datos de:', user.nombre);
        
        // Actualizar saludo
        const greetingElement = document.querySelector('.greeting-large');
        if (greetingElement) {
            greetingElement.textContent = `¡Hola, ${user.nombre.split(' ')[0]}!`;
        }
        
        // Cargar saldo actual
        const saldo = await Database.calcularSaldoUsuario(user.id);
        const balanceElement = document.querySelector('.amount-number');
        if (balanceElement) {
            balanceElement.textContent = saldo.toLocaleString('es-ES');
        }
        
        // Actualizar avatar con inicial
        const avatarElement = document.querySelector('.avatar img');
        if (avatarElement && user.nombre) {
            // Podríamos cambiar a un avatar con inicial
            const firstLetter = user.nombre.charAt(0).toUpperCase();
            const svgAvatar = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23E3F2FD'/%3E%3Ctext x='50' y='55' font-size='40' text-anchor='middle' fill='%234CAF50' font-family='Inter' font-weight='bold'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
            avatarElement.src = svgAvatar;
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos de usuario:', error);
        // Fallback a datos públicos
        await loadPublicData();
    }
}

/**
 * Cargar actividades dinámicas
 */
async function loadActivities() {
    try {
        console.log('📋 Cargando actividades...');
        
        // Obtener actividades disponibles
        const actividades = await Database.getActividadesDisponibles();
        
        // Limitar a 3 actividades para la página principal
        const actividadesLimitadas = actividades.slice(0, 3);
        
        // Renderizar actividades
        renderActivities(actividadesLimitadas);
        
        console.log(`✅ ${actividadesLimitadas.length} actividades cargadas`);
        
    } catch (error) {
        console.error('❌ Error cargando actividades:', error);
        // Mantener actividades estáticas como fallback
        showError('No se pudieron cargar las actividades');
    }
}

/**
 * Renderizar actividades
 */
function renderActivities(actividades) {
    const container = document.querySelector('.activities-grid');
    if (!container) return;
    
    if (actividades.length === 0) {
        showNoActivities();
        return;
    }
    
    // Limpiar solo las actividades dinámicas (mantener el título de sección)
    const activityCards = container.querySelectorAll('.activity-card');
    activityCards.forEach(card => card.remove());
    
    // Renderizar cada actividad
    actividades.forEach(actividad => {
        const activityElement = createActivityElement(actividad);
        container.appendChild(activityElement);
    });
}

/**
 * Crear elemento de actividad
 */
function createActivityElement(actividad) {
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-card';
    activityDiv.dataset.activityId = actividad.id;
    
    // Calcular porcentaje de cupo
    const cupoInscritos = parseInt(actividad.cupo_inscritos) || 0;
    const cupoTotal = parseInt(actividad.cupo_total) || 1;
    const porcentajeCupo = Math.min(100, Math.round((cupoInscritos / cupoTotal) * 100));
    
    // Determinar color de fondo según el tipo (simplificado)
    let activityClass = 'cleanup';
    if (actividad.titulo.includes('Tutoría')) activityClass = 'tutoring';
    if (actividad.titulo.includes('PET') || actividad.titulo.includes('Reciclaje')) activityClass = 'recycling';
    
    activityDiv.innerHTML = `
        <div class="activity-image ${activityClass}">
            <div class="reward-badge">+${actividad.recompensa_mc || 0} MC</div>
            <div class="activity-illustration">
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.3)"/>
                    <!-- Icono genérico -->
                    <circle cx="50" cy="45" r="12" fill="#4CAF50"/>
                    <path d="M40 65L50 55L60 65" stroke="#4CAF50" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
            </div>
        </div>
        <div class="activity-content">
            <h3 class="activity-title">${actividad.titulo || 'Actividad'}</h3>
            <p class="activity-description">${actividad.descripcion_corta || 'Participa en esta actividad'}</p>
            <div class="activity-slots">
                <span class="slots-label">CUPO</span>
                <span class="slots-value">${cupoInscritos} / ${cupoTotal} personas</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${porcentajeCupo}%;"></div>
            </div>
            <button class="btn btn-participate" data-activity="${actividad.id}">
                Participar
            </button>
        </div>
    `;
    
    return activityDiv;
}

/**
 * Mostrar mensaje cuando no hay actividades
 */
function showNoActivities() {
    const container = document.querySelector('.activities-grid');
    if (!container) return;
    
    const noActivitiesDiv = document.createElement('div');
    noActivitiesDiv.className = 'no-activities';
    noActivitiesDiv.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-calendar-check"></i>
            <p>No hay actividades disponibles</p>
            <p class="small">¡Vuelve más tarde para nuevas oportunidades!</p>
        </div>
    `;
    
    // Agregar después del título de sección
    const sectionTitle = container.querySelector('.section-title');
    if (sectionTitle) {
        sectionTitle.parentNode.insertBefore(noActivitiesDiv, sectionTitle.nextSibling);
    }
}

/**
 * Inicializar botones de participar
 */
function initParticipateButtons() {
    // Delegación de eventos para botones dinámicos
    document.addEventListener('click', async function(e) {
        const participateBtn = e.target.closest('.btn-participate');
        if (!participateBtn) return;
        
        const activityId = participateBtn.dataset.activity;
        console.log(`🎯 Participar en actividad ${activityId}`);
        
        // Verificar autenticación
        if (!Auth.isLoggedIn()) {
            showToast('🔒 Inicia sesión para participar', 'error');
            // Podríamos redirigir a login
            return;
        }
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([20]);
        }
        
        // Deshabilitar botón temporalmente
        participateBtn.disabled = true;
        const originalText = participateBtn.innerHTML;
        participateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        try {
            // Aquí iría la lógica para registrar participación
            // await Database.registrarParticipacion(activityId, Auth.getCurrentUser().id);
            
            // Simular éxito
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mostrar éxito
            showToast('✅ ¡Inscripción exitosa!', 'success');
            
            // Actualizar UI
            participateBtn.innerHTML = '<i class="fas fa-check"></i> Inscrito';
            participateBtn.disabled = true;
            participateBtn.classList.add('btn-disabled');
            
            // Actualizar cupo visualmente
            const slotsValue = participateBtn.closest('.activity-card').querySelector('.slots-value');
            if (slotsValue) {
                const currentText = slotsValue.textContent;
                const match = currentText.match(/(\d+) \/ (\d+)/);
                if (match) {
                    const current = parseInt(match[1]) + 1;
                    const total = parseInt(match[2]);
                    slotsValue.textContent = `${current} / ${total} personas`;
                    
                    // Actualizar barra de progreso
                    const progressFill = participateBtn.closest('.activity-card').querySelector('.progress-fill');
                    if (progressFill) {
                        const newPercentage = Math.min(100, Math.round((current / total) * 100));
                        progressFill.style.width = `${newPercentage}%`;
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Error en participación:', error);
            showToast('❌ Error al inscribirse', 'error');
            
            // Rehabilitar botón
            participateBtn.disabled = false;
            participateBtn.innerHTML = originalText;
        }
    });
}

/**
 * Inicializar acciones de saldo
 */
function initBalanceActions() {
    const historyBtn = document.querySelector('.btn-history');
    const redeemBtn = document.querySelector('.btn-redeem');
    
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            console.log('📜 Historial clickeado');
            
            if (navigator.vibrate) {
                navigator.vibrate([10]);
            }
            
            showToast('📜 Redirigiendo al historial...', 'info');
            // En una implementación real, navegaríamos a la página de historial
        });
    }
    
    if (redeemBtn) {
        redeemBtn.addEventListener('click', function() {
            console.log('🛒 Canjear clickeado');
            
            if (navigator.vibrate) {
                navigator.vibrate([10]);
            }
            
            // Navegar a tienda
            window.location.href = 'tienda.html';
        });
    }
}

/**
 * Inicializar botón de notificaciones
 */
function initNotificationBtn() {
    const notificationBtn = document.querySelector('.notification-btn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            console.log('🔔 Notificaciones abiertas');
            
            if (navigator.vibrate) {
                navigator.vibrate([10, 30, 10]);
            }
            
            showToast('🔔 Sin notificaciones nuevas', 'info');
        });
    }
}

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
 * Mostrar toast
 */
function showToast(message, type = 'info') {
    // Crear contenedor si no existe
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    // Crear toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Estilos
    const bgColor = type === 'success' ? '#4CAF50' : 
                    type === 'error' ? '#E53E3E' : 
                    '#2196F3';
    
    toast.style.cssText = `
        background-color: ${bgColor};
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease;
        max-width: 90vw;
        text-align: center;
    `;
    
    // Agregar animaciones si no existen
    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideDown {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(-20px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Agregar al contenedor
    container.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

/**
 * Mostrar error
 */
function showError(message) {
    showToast(message, 'error');
}
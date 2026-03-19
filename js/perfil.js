/**
 * ========================================
 * Perfil - JavaScript
 * Proyecto Manglar Dos - App de Recompensas
 * ======================================== */

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', async function() {
    console.log('👤 Página de perfil cargada');
    
    // Verificar autenticación
    if (!Auth.isLoggedIn()) {
        console.warn('🔒 Usuario no autenticado, redirigiendo...');
        Auth.requireAuth();
        return;
    }
    
    // Cargar datos del perfil
    await loadProfileData();
    
    // Cargar actividad reciente
    await loadRecentActivity();
    
    // Inicializar funcionalidades
    initLogoutButton();
    initSettingsItems();
    initBottomNav();
    initNotificationBtn();
});

/**
 * Cargar datos del perfil
 */
async function loadProfileData() {
    try {
        const user = Auth.getCurrentUser();
        if (!user) return;
        
        console.log('✅ Cargando perfil de:', user.nombre);
        
        // Mostrar loading states
        showLoadingStates();
        
        // Actualizar información del perfil
        updateProfileInfo(user);
        
        // Cargar estadísticas del usuario
        const stats = await loadUserStats(user.id);
        updateProfileStats(stats);
        
        // Ocultar loading states
        hideLoadingStates();
        
    } catch (error) {
        console.error('❌ Error cargando datos del perfil:', error);
        showError('Error cargando los datos del perfil');
    }
}

/**
 * Mostrar estados de carga
 */
function showLoadingStates() {
    const elements = [
        'profileName',
        'profileEmail',
        'totalCoins',
        'completedTasks',
        'currentLevel',
        'daysActive'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('loading');
        }
    });
}

/**
 * Ocultar estados de carga
 */
function hideLoadingStates() {
    const elements = [
        'profileName',
        'profileEmail',
        'totalCoins',
        'completedTasks',
        'currentLevel',
        'daysActive'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('loading');
        }
    });
}

/**
 * Actualizar información del perfil
 */
function updateProfileInfo(user) {
    // Nombre
    const nameElement = document.getElementById('profileName');
    if (nameElement) {
        nameElement.textContent = user.nombre;
    }
    
    // Email
    const emailElement = document.getElementById('profileEmail');
    if (emailElement) {
        emailElement.textContent = user.correo || 'correo@ejemplo.com';
    }
    
    // Avatar (podría personalizarse según el usuario)
    const avatarElement = document.querySelector('.avatar-circle i');
    if (avatarElement && user.nombre) {
        // Mostrar primera letra del nombre
        const firstLetter = user.nombre.charAt(0).toUpperCase();
        avatarElement.textContent = firstLetter;
    }
}

/**
 * Cargar estadísticas del usuario
 */
async function loadUserStats(userId) {
    try {
        // Aquí iría la lógica para obtener estadísticas de la base de datos
        // Por ahora, usaremos datos de ejemplo
        
        // Obtener saldo
        const saldo = await Database.calcularSaldoUsuario(userId);
        
        // Obtener actividades completadas (esto sería de la base de datos)
        const actividadesCompletadas = 12; // Ejemplo
        
        // Calcular nivel basado en actividades completadas
        const nivel = Math.floor(actividadesCompletadas / 5) + 1;
        const progresoNivel = (actividadesCompletadas % 5) * 20;
        
        // Días activos (ejemplo)
        const diasActivos = 45;
        
        return {
            saldo: saldo,
            actividadesCompletadas: actividadesCompletadas,
            nivel: nivel,
            progresoNivel: progresoNivel,
            diasActivos: diasActivos
        };
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        return {
            saldo: 0,
            actividadesCompletadas: 0,
            nivel: 1,
            progresoNivel: 0,
            diasActivos: 0
        };
    }
}

/**
 * Actualizar estadísticas del perfil
 */
function updateProfileStats(stats) {
    // Total de Mangle Coins
    const coinsElement = document.getElementById('totalCoins');
    if (coinsElement) {
        coinsElement.textContent = stats.saldo.toLocaleString('es-ES');
    }
    
    // Tareas completadas
    const tasksElement = document.getElementById('completedTasks');
    if (tasksElement) {
        tasksElement.textContent = stats.actividadesCompletadas;
    }
    
    // Nivel actual
    const levelElement = document.getElementById('currentLevel');
    if (levelElement) {
        levelElement.textContent = `Nivel ${stats.nivel}`;
    }
    
    // Días activos
    const daysElement = document.getElementById('daysActive');
    if (daysElement) {
        daysElement.textContent = stats.diasActivos;
    }
    
    // Barra de progreso del nivel
    const progressFill = document.querySelector('.rank-progress .progress-fill');
    const progressText = document.querySelector('.rank-progress .progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${stats.progresoNivel}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${stats.progresoNivel}%`;
    }
}

/**
 * Cargar actividad reciente
 */
async function loadRecentActivity() {
    try {
        const user = Auth.getCurrentUser();
        if (!user) return;
        
        // Obtener transacciones del usuario
        const transacciones = await Database.getTransaccionesUsuario(user.id);
        
        // Ordenar por fecha (más reciente primero)
        transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // Tomar las 5 más recientes
        const recent = transacciones.slice(0, 5);
        
        // Renderizar actividad
        renderRecentActivity(recent);
        
        console.log(`✅ ${recent.length} actividades recientes cargadas`);
    } catch (error) {
        console.error('❌ Error cargando actividad reciente:', error);
        showEmptyActivity();
    }
}

/**
 * Renderizar actividad reciente
 */
function renderRecentActivity(activities) {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    if (activities.length === 0) {
        showEmptyActivity();
        return;
    }
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Renderizar cada actividad
    activities.forEach(activity => {
        const activityElement = createActivityElement(activity);
        container.appendChild(activityElement);
    });
}

/**
 * Crear elemento de actividad
 */
function createActivityElement(activity) {
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-item';
    
    // Determinar icono y clase según tipo
    let iconClass = 'earned';
    let icon = '<i class="fas fa-coins"></i>';
    let amountClass = 'positive';
    let amountPrefix = '+';
    
    if (activity.tipo === 'gasto') {
        iconClass = 'spent';
        icon = '<i class="fas fa-shopping-cart"></i>';
        amountClass = 'negative';
        amountPrefix = '-';
    } else if (activity.tipo === 'tarea') {
        iconClass = 'task';
        icon = '<i class="fas fa-tasks"></i>';
    }
    
    // Formatear fecha
    const activityDate = new Date(activity.fecha);
    const formattedDate = activityDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
    
    activityDiv.innerHTML = `
        <div class="activity-icon ${iconClass}">
            ${icon}
        </div>
        <div class="activity-details">
            <h4 class="activity-title">${activity.descripcion || 'Actividad'}</h4>
            <p class="activity-description">${getActivityDescription(activity)}</p>
            <div class="activity-meta">
                <span class="activity-date">${formattedDate}</span>
                <span class="activity-amount ${amountClass}">
                    ${amountPrefix}${activity.monto} MC
                </span>
            </div>
        </div>
    `;
    
    return activityDiv;
}

/**
 * Obtener descripción de actividad
 */
function getActivityDescription(activity) {
    if (activity.tipo === 'ganancia') {
        return 'Ganaste Mangle Coins';
    } else if (activity.tipo === 'gasto') {
        return 'Canjeaste Mangle Coins';
    } else if (activity.tipo === 'tarea') {
        return 'Completaste una tarea';
    }
    return 'Actividad en el sistema';
}

/**
 * Mostrar actividad vacía
 */
function showEmptyActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-history"></i>
            <p>No hay actividad reciente</p>
            <p class="small">¡Participá en actividades para ver tu historial aquí!</p>
        </div>
    `;
}

/**
 * Inicializar botón de logout
 */
function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', function() {
        console.log('👋 Intentando cerrar sesión');
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([20]);
        }
        
        // Mostrar confirmación
        if (confirm('¿Estás seguro de que querés cerrar sesión?')) {
            // Deshabilitar botón temporalmente
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cerrando sesión...';
            
            // Cerrar sesión
            setTimeout(() => {
                Auth.logout();
            }, 500);
        }
    });
}

/**
 * Inicializar items de configuración
 */
function initSettingsItems() {
    const settingItems = document.querySelectorAll('.setting-item');
    
    settingItems.forEach(item => {
        item.addEventListener('click', function() {
            const settingId = this.dataset.setting;
            console.log(`⚙️ Configuración clickeada: ${settingId}`);
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate([10]);
            }
            
            // Manejar diferentes configuraciones
            switch (settingId) {
                case 'notifications':
                    showToast('🔔 Configuración de notificaciones', 'info');
                    break;
                case 'privacy':
                    showToast('🔒 Configuración de privacidad', 'info');
                    break;
                case 'help':
                    showToast('❓ Centro de ayuda', 'info');
                    break;
                case 'about':
                    showToast('ℹ️ Acerca de la app', 'info');
                    break;
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
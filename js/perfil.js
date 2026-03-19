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
    
    // Inicializar funcionalidades
    initLogoutButton();
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
        'profileBalance',
        'earnedTotal',
        'spentTotal',
        'availableBalance'
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
        'profileBalance',
        'earnedTotal',
        'spentTotal',
        'availableBalance'
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
        // Obtener saldo actual
        const saldo = await Database.calcularSaldoUsuario(userId);
        
        // Obtener transacciones del usuario
        let ganadosTotal = 0;
        let gastadosTotal = 0;
        
        try {
            const transacciones = await Database.getTransaccionesUsuario(userId);
            
            // Calcular ganados y gastados
            transacciones.forEach(transaccion => {
                const monto = parseFloat(transaccion.monto) || 0;
                if (transaccion.tipo === 'ganancia') {
                    ganadosTotal += monto;
                } else if (transaccion.tipo === 'gasto') {
                    gastadosTotal += monto;
                }
            });
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar transacciones, usando valores por defecto');
            // Valores por defecto basados en el saldo
            ganadosTotal = saldo + 500; // Asumimos que gastó 500
            gastadosTotal = 500;
        }
        
        // Obtener actividades completadas
        let actividadesCompletadas = 0;
        try {
            // Aquí iría la lógica para obtener actividades completadas
            // Por ahora, estimamos basado en ganadosTotal
            actividadesCompletadas = Math.floor(ganadosTotal / 50);
        } catch (error) {
            actividadesCompletadas = 12; // Valor por defecto
        }
        
        // Calcular nivel basado en actividades completadas
        const nivel = Math.floor(actividadesCompletadas / 5) + 1;
        const progresoNivel = (actividadesCompletadas % 5) * 20;
        
        // Días activos (estimado)
        const diasActivos = Math.min(actividadesCompletadas * 3, 90);
        
        return {
            saldo: saldo,
            ganadosTotal: ganadosTotal,
            gastadosTotal: gastadosTotal,
            actividadesCompletadas: actividadesCompletadas,
            nivel: nivel,
            progresoNivel: progresoNivel,
            diasActivos: diasActivos
        };
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        return {
            saldo: 0,
            ganadosTotal: 0,
            gastadosTotal: 0,
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
    // Saldo total (profileBalance)
    const balanceElement = document.getElementById('profileBalance');
    if (balanceElement) {
        balanceElement.textContent = stats.saldo.toLocaleString('es-ES');
    }
    
    // Ganados totales (earnedTotal)
    const earnedElement = document.getElementById('earnedTotal');
    if (earnedElement) {
        earnedElement.textContent = `${stats.ganadosTotal.toLocaleString('es-ES')} MC`;
    }
    
    // Gastados totales (spentTotal)
    const spentElement = document.getElementById('spentTotal');
    if (spentElement) {
        spentElement.textContent = `${stats.gastadosTotal.toLocaleString('es-ES')} MC`;
    }
    
    // Disponibles (availableBalance)
    const availableElement = document.getElementById('availableBalance');
    if (availableElement) {
        availableElement.textContent = `${stats.saldo.toLocaleString('es-ES')} MC`;
    }
    
    // Tareas completadas (si existe)
    const tasksElement = document.getElementById('completedTasks');
    if (tasksElement) {
        tasksElement.textContent = stats.actividadesCompletadas || 0;
    }
    
    // Nivel actual (si existe)
    const levelElement = document.getElementById('currentLevel');
    if (levelElement) {
        levelElement.textContent = `Nivel ${stats.nivel || 1}`;
    }
    
    // Días activos (si existe)
    const daysElement = document.getElementById('daysActive');
    if (daysElement) {
        daysElement.textContent = stats.diasActivos || 0;
    }
    
    // Barra de progreso del nivel (si existe)
    const progressFill = document.querySelector('.rank-progress .progress-fill');
    const progressText = document.querySelector('.rank-progress .progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${stats.progresoNivel || 0}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${stats.progresoNivel || 0}%`;
    }
}

/**
 * Cargar actividad reciente
 */

/**
 * Renderizar actividad reciente
 */

/**
 * Crear elemento de actividad
 */

/**
 * Obtener descripción de actividad
 */

/**
 * Mostrar actividad vacía
 */

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
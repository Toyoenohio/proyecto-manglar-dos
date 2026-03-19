/**
 * ========================================
 * Detalle Actividad - JavaScript
 * Proyecto Manglar Dos - App de Recompensas
 * ======================================== */

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📱 Página de detalle de actividad cargada');
    
    // Verificar autenticación
    if (!Auth.isLoggedIn()) {
        console.warn('🔒 Usuario no autenticado, redirigiendo...');
        Auth.requireAuth();
        return;
    }
    
    // Obtener ID de actividad de la URL
    const activityId = getActivityIdFromURL();
    
    if (!activityId) {
        showError('No se encontró la actividad solicitada');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }
    
    // Cargar datos de la actividad
    await loadActivityDetails(activityId);
    
    // Inicializar funcionalidades
    initParticipateButton(activityId);
    initNotificationBtn();
    initBottomNav();
});

/**
 * Obtener ID de actividad de la URL
 */
function getActivityIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Cargar detalles de la actividad
 */
async function loadActivityDetails(activityId) {
    try {
        console.log(`📊 Cargando actividad ID: ${activityId}`);
        
        // Mostrar estados de carga
        showLoadingStates();
        
        // Obtener actividad de la base de datos
        const actividad = await Database.getActividadById(activityId);
        
        if (!actividad) {
            throw new Error('Actividad no encontrada');
        }
        
        // Renderizar datos de la actividad
        renderActivityDetails(actividad);
        
        // Ocultar estados de carga
        hideLoadingStates();
        
        console.log('✅ Actividad cargada:', actividad.nombre);
    } catch (error) {
        console.error('❌ Error cargando actividad:', error);
        showError('Error cargando los detalles de la actividad');
        
        // Redirigir después de 3 segundos
        setTimeout(() => window.location.href = '/', 3000);
    }
}

/**
 * Mostrar estados de carga
 */
function showLoadingStates() {
    const elements = [
        'activityTitle',
        'activityDescription',
        'activityDate',
        'activityLocation',
        'activitySlots',
        'organizerName',
        'organizerRole'
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
        'activityTitle',
        'activityDescription',
        'activityDate',
        'activityLocation',
        'activitySlots',
        'organizerName',
        'organizerRole'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('loading');
        }
    });
}

/**
 * Renderizar detalles de la actividad
 */
function renderActivityDetails(actividad) {
    // Actualizar hero section
    updateHeroSection(actividad);
    
    // Actualizar descripción
    updateDescription(actividad);
    
    // Actualizar requisitos
    updateRequirements(actividad);
    
    // Actualizar horario
    updateSchedule(actividad);
    
    // Actualizar progreso
    updateProgress(actividad);
    
    // Actualizar organizador
    updateOrganizer(actividad);
    
    // Actualizar botón de participación
    updateParticipateButton(actividad);
}

/**
 * Actualizar hero section
 */
function updateHeroSection(actividad) {
    const hero = document.getElementById('activityHero');
    const badge = document.getElementById('activityBadge');
    const title = document.getElementById('activityTitle');
    const reward = document.getElementById('activityReward');
    
    // Establecer color según tipo
    const typeClass = getActivityTypeClass(actividad.tipo);
    hero.className = `activity-hero ${typeClass}`;
    
    // Actualizar icono
    const icon = getActivityIcon(actividad.tipo);
    badge.innerHTML = icon;
    
    // Actualizar título
    title.textContent = actividad.nombre;
    
    // Actualizar recompensa
    const rewardAmount = document.querySelector('.reward-amount');
    const rewardLabel = document.querySelector('.reward-label');
    
    if (rewardAmount) {
        rewardAmount.textContent = `+${actividad.recompensa_mc} MC`;
    }
    
    if (rewardLabel) {
        rewardLabel.textContent = 'Recompensa';
    }
}

/**
 * Actualizar descripción
 */
function updateDescription(actividad) {
    const descElement = document.getElementById('activityDescription');
    if (descElement) {
        descElement.textContent = actividad.descripcion || 'Sin descripción disponible';
    }
}

/**
 * Actualizar requisitos
 */
function updateRequirements(actividad) {
    const requirementsList = document.getElementById('requirementsList');
    if (!requirementsList) return;
    
    // Parsear requisitos (pueden venir como string separado por comas)
    let requisitos = [];
    
    if (actividad.requisitos) {
        if (typeof actividad.requisitos === 'string') {
            requisitos = actividad.requisitos.split(',').map(r => r.trim());
        } else if (Array.isArray(actividad.requisitos)) {
            requisitos = actividad.requisitos;
        }
    }
    
    // Si no hay requisitos, mostrar mensaje
    if (requisitos.length === 0) {
        requisitos = ['No hay requisitos especiales'];
    }
    
    // Renderizar lista
    requirementsList.innerHTML = '';
    requisitos.forEach(req => {
        const li = document.createElement('li');
        li.textContent = req;
        requirementsList.appendChild(li);
    });
}

/**
 * Actualizar horario
 */
function updateSchedule(actividad) {
    // Fecha
    const dateElement = document.getElementById('activityDate');
    if (dateElement && actividad.fecha) {
        const fecha = new Date(actividad.fecha);
        dateElement.textContent = formatDate(fecha);
    }
    
    // Lugar
    const locationElement = document.getElementById('activityLocation');
    if (locationElement) {
        locationElement.textContent = actividad.lugar || 'Por confirmar';
    }
    
    // Cupo
    const slotsElement = document.getElementById('activitySlots');
    if (slotsElement) {
        const cupoMax = parseInt(actividad.cupo_maximo) || 0;
        const cupoActual = parseInt(actividad.cupo_actual) || 0;
        
        if (cupoMax > 0) {
            slotsElement.textContent = `${cupoActual}/${cupoMax} personas`;
        } else {
            slotsElement.textContent = 'Ilimitado';
        }
    }
}

/**
 * Actualizar progreso
 */
function updateProgress(actividad) {
    // Progreso de participantes
    const cupoMax = parseInt(actividad.cupo_maximo) || 0;
    const cupoActual = parseInt(actividad.cupo_actual) || 0;
    
    const progressFill = document.getElementById('participantsProgress');
    const progressText = document.getElementById('participantsText');
    
    if (progressFill && progressText) {
        if (cupoMax > 0) {
            const progress = Math.round((cupoActual / cupoMax) * 100);
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${cupoActual}/${cupoMax}`;
        } else {
            progressFill.style.width = '100%';
            progressText.textContent = 'Ilimitado';
        }
    }
    
    // Countdown timer (si hay fecha límite)
    if (actividad.fecha_limite) {
        updateCountdownTimer(actividad.fecha_limite);
    }
}

/**
 * Actualizar countdown timer
 */
function updateCountdownTimer(fechaLimite) {
    const timerElement = document.getElementById('countdownTimer');
    if (!timerElement) return;
    
    const targetDate = new Date(fechaLimite);
    const now = new Date();
    
    // Si la fecha ya pasó
    if (targetDate <= now) {
        timerElement.innerHTML = '<span class="countdown-expired">Finalizado</span>';
        return;
    }
    
    // Calcular diferencia
    const diff = targetDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    // Actualizar elementos
    const daysElement = timerElement.querySelector('.countdown-days');
    const hoursElement = timerElement.querySelector('.countdown-hours');
    const minutesElement = timerElement.querySelector('.countdown-minutes');
    
    if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
    if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
    if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
    
    // Actualizar cada minuto
    setTimeout(() => updateCountdownTimer(fechaLimite), 60000);
}

/**
 * Actualizar organizador
 */
function updateOrganizer(actividad) {
    const nameElement = document.getElementById('organizerName');
    const roleElement = document.getElementById('organizerRole');
    
    if (nameElement) {
        nameElement.textContent = actividad.organizador || 'Colegio El Manglar';
    }
    
    if (roleElement) {
        roleElement.textContent = actividad.rol_organizador || 'Organizador';
    }
}

/**
 * Actualizar botón de participación
 */
function updateParticipateButton(actividad) {
    const button = document.getElementById('participateBtn');
    if (!button) return;
    
    // Verificar si ya está participando (esto sería de la base de datos)
    const isParticipating = false; // TODO: Verificar en DB
    
    if (isParticipating) {
        button.innerHTML = '<i class="fas fa-check-circle"></i> Ya estás participando';
        button.disabled = true;
        button.classList.add('btn-success');
    }
    
    // Verificar si hay cupo disponible
    const cupoMax = parseInt(actividad.cupo_maximo) || 0;
    const cupoActual = parseInt(actividad.cupo_actual) || 0;
    
    if (cupoMax > 0 && cupoActual >= cupoMax) {
        button.innerHTML = '<i class="fas fa-times-circle"></i> Cupo completo';
        button.disabled = true;
        button.classList.add('btn-disabled');
    }
}

/**
 * Inicializar botón de participación
 */
function initParticipateButton(activityId) {
    const button = document.getElementById('participateBtn');
    if (!button) return;
    
    button.addEventListener('click', async function() {
        console.log('🎯 Intentando participar en actividad:', activityId);
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([20]);
        }
        
        // Mostrar confirmación
        const confirmMsg = '¿Estás seguro de que querés participar en esta actividad?';
        if (!confirm(confirmMsg)) {
            return;
        }
        
        // Deshabilitar botón temporalmente
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        try {
            // Aquí iría la lógica para registrar la participación
            // const user = Auth.getCurrentUser();
            // await Database.registrarParticipacion(user.id, activityId);
            
            // Simular éxito
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mostrar éxito
            showToast('✅ ¡Inscripción exitosa! Revisá tus tareas para más detalles.', 'success');
            
            // Actualizar botón
            button.innerHTML = '<i class="fas fa-check-circle"></i> ¡Ya estás participando!';
            button.classList.add('btn-success');
            
            // Actualizar progreso (simulado)
            const progressFill = document.getElementById('participantsProgress');
            const progressText = document.getElementById('participantsText');
            
            if (progressFill && progressText) {
                const currentWidth = parseInt(progressFill.style.width) || 0;
                const newWidth = Math.min(currentWidth + 10, 100);
                progressFill.style.width = `${newWidth}%`;
                
                // Actualizar texto
                const match = progressText.textContent.match(/(\d+)\/(\d+)/);
                if (match) {
                    const current = parseInt(match[1]) + 1;
                    const max = parseInt(match[2]);
                    progressText.textContent = `${current}/${max}`;
                }
            }
            
        } catch (error) {
            console.error('❌ Error al participar:', error);
            showToast('❌ Error al procesar tu inscripción', 'error');
            
            // Rehabilitar botón
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-check-circle"></i> Participar en esta actividad';
        }
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
        if (href === currentPath || (href === '/' && currentPath === '/index.html')) {
            item.classList.add('active');
        }
    });
    
    // Agregar event listeners para navegación
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Solo manejar si no es el item activo
            if (!this.classList.contains('active')) {
                console.log('📍 Navegando a:', this.getAttribute('href'));
                
                // Feedback háptico
                if (navigator.vibrate) {
                    navigator.vibrate([10]);
                }
            }
        });
    });
}

/**
 * Obtener clase CSS para tipo de actividad
 */
function getActivityTypeClass(tipo) {
    const tipos = {
        'limpieza': 'limpieza',
        'tutoria': 'tutoria',
        'reciclaje': 'reciclaje',
        'deporte': 'deporte',
        'arte': 'arte',
        'musica': 'musica'
    };
    
    return tipos[tipo] || 'limpieza';
}

/**
 * Obtener icono para tipo de actividad
 */
function getActivityIcon(tipo) {
    const icons = {
        'limpieza': '<i class="fas fa-leaf"></i>',
        'tutoria': '<i class="fas fa-chalkboard-teacher"></i>',
        'reciclaje': '<i class="fas fa-recycle"></i>',
        'deporte': '<i class="fas fa-running"></i>',
        'arte': '<i class="fas fa-palette"></i>',
        'musica': '<i class="fas fa-music"></i>'
    };
    
    return icons[tipo] || '<i class="fas fa-tasks"></i>';
}

/**
 * Formatear fecha
 */
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('es-ES', options);
}

/**
 * Mostrar toast
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    // Crear toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Agregar al contenedor
    container.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Mostrar error
 */
function showError(message) {
    showToast(message, 'error');
}

/**
 * Mostrar éxito
 */
function showSuccess(message) {
    showToast(message, 'success');
}
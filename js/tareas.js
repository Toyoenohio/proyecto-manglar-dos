/**
 * ========================================
 * Tareas - JavaScript
 * Proyecto Manglar Dos - App de Recompensas
 * ======================================== */

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📋 Página de tareas cargada');
    
    // Verificar autenticación
    if (!Auth.isLoggedIn()) {
        console.warn('🔒 Usuario no autenticado, redirigiendo...');
        Auth.requireAuth();
        return;
    }
    
    // Cargar datos del usuario
    await loadUserData();
    
    // Cargar tareas
    await loadTasks();
    
    // Inicializar funcionalidades
    initFilterButtons();
    initTaskActions();
    initBottomNav();
    initNotificationBtn();
});

/**
 * Cargar datos del usuario
 */
async function loadUserData() {
    try {
        const user = Auth.getCurrentUser();
        if (!user) return;
        
        // Aquí podrías cargar estadísticas específicas del usuario
        console.log('✅ Usuario cargado:', user.nombre);
        
    } catch (error) {
        console.error('❌ Error cargando datos de usuario:', error);
        showError('Error cargando datos del usuario');
    }
}

/**
 * Cargar tareas
 */
async function loadTasks(filter = 'all') {
    try {
        console.log(`📋 Cargando tareas (filtro: ${filter})`);
        
        // Mostrar loading state
        showLoadingState();
        
        // Obtener actividades del usuario (esto sería de la base de datos)
        // Por ahora, usaremos datos de ejemplo
        const tasks = getSampleTasks();
        
        // Filtrar tareas si no es "all"
        let filteredTasks = tasks;
        if (filter !== 'all') {
            filteredTasks = tasks.filter(task => task.status === filter);
        }
        
        // Actualizar estadísticas
        updateStats(filteredTasks);
        
        // Renderizar tareas
        renderTasks(filteredTasks);
        
        console.log(`✅ ${filteredTasks.length} tareas cargadas`);
    } catch (error) {
        console.error('❌ Error cargando tareas:', error);
        showError('Error cargando las tareas');
        
        // Mostrar estado vacío
        showEmptyState();
    }
}

/**
 * Obtener tareas de ejemplo
 */
function getSampleTasks() {
    return [
        {
            id: 1,
            title: 'Limpieza de Áreas Verdes',
            description: 'Ayuda a mantener limpias las áreas verdes del colegio',
            reward: 50,
            date: '2026-03-20',
            status: 'pending',
            progress: 40,
            type: 'limpieza'
        },
        {
            id: 2,
            title: 'Tutoría entre Pares',
            description: 'Ayuda a otros estudiantes con matemáticas',
            reward: 30,
            date: '2026-03-22',
            status: 'in-progress',
            progress: 70,
            type: 'tutoria'
        },
        {
            id: 3,
            title: 'Recogida de PET',
            description: 'Recolecta botellas de plástico para reciclaje',
            reward: 75,
            date: '2026-03-25',
            status: 'completed',
            progress: 100,
            type: 'reciclaje'
        },
        {
            id: 4,
            title: 'Organización Biblioteca',
            description: 'Ayuda a organizar los libros de la biblioteca',
            reward: 40,
            date: '2026-03-28',
            status: 'pending',
            progress: 0,
            type: 'organizacion'
        }
    ];
}

/**
 * Actualizar estadísticas
 */
function updateStats(tasks) {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    
    // Actualizar elementos de estadísticas
    const completedElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
    const pendingElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
    const inProgressElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
    
    if (completedElement) completedElement.textContent = completed;
    if (pendingElement) pendingElement.textContent = pending;
    if (inProgressElement) inProgressElement.textContent = inProgress;
}

/**
 * Mostrar estado de carga
 */
function showLoadingState() {
    const container = document.getElementById('tasksContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Cargando tareas...</p>
        </div>
    `;
}

/**
 * Mostrar estado vacío
 */
function showEmptyState() {
    const container = document.getElementById('tasksContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <p>No hay tareas disponibles</p>
            <p class="small">¡Participá en actividades para ver tus tareas aquí!</p>
        </div>
    `;
}

/**
 * Renderizar tareas
 */
function renderTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    if (!container) return;
    
    if (tasks.length === 0) {
        showEmptyState();
        return;
    }
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Renderizar cada tarea
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        container.appendChild(taskElement);
    });
}

/**
 * Crear elemento de tarea
 */
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    taskDiv.dataset.taskId = task.id;
    
    // Formatear fecha
    const taskDate = new Date(task.date);
    const formattedDate = taskDate.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
    
    // Determinar texto del botón según estado
    let buttonText = 'Ver Detalles';
    let buttonClass = 'btn-view';
    let buttonIcon = '<i class="fas fa-eye"></i>';
    
    if (task.status === 'pending') {
        buttonText = 'Comenzar';
        buttonClass = 'btn-start';
        buttonIcon = '<i class="fas fa-play"></i>';
    } else if (task.status === 'in-progress') {
        buttonText = 'Completar';
        buttonClass = 'btn-complete';
        buttonIcon = '<i class="fas fa-check"></i>';
    }
    
    taskDiv.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${task.title}</h3>
            <span class="task-reward">+${task.reward} MC</span>
        </div>
        <p class="task-description">${task.description}</p>
        <div class="task-meta">
            <div class="task-date">
                <i class="fas fa-calendar"></i>
                ${formattedDate}
            </div>
            <span class="task-status ${task.status}">
                ${getStatusText(task.status)}
            </span>
        </div>
        <div class="task-progress">
            <div class="progress-label">
                <span>Progreso</span>
                <span>${task.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${task.progress}%"></div>
            </div>
        </div>
        <div class="task-actions">
            <button class="btn-task ${buttonClass}" data-task="${task.id}">
                ${buttonIcon}
                ${buttonText}
            </button>
            <button class="btn-task btn-view" data-task="${task.id}">
                <i class="fas fa-external-link-alt"></i>
                Ver Actividad
            </button>
        </div>
    `;
    
    return taskDiv;
}

/**
 * Obtener texto del estado
 */
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'in-progress': 'En Progreso',
        'completed': 'Completada'
    };
    return statusMap[status] || status;
}

/**
 * Inicializar botones de filtro
 */
function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Obtener filtro
            const filter = this.dataset.filter;
            
            // Cargar tareas con el filtro seleccionado
            loadTasks(filter);
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate([10]);
            }
        });
    });
}

/**
 * Inicializar acciones de tareas
 */
function initTaskActions() {
    // Delegación de eventos para botones de tareas
    document.addEventListener('click', async function(e) {
        const taskBtn = e.target.closest('.btn-task');
        if (!taskBtn) return;
        
        const taskId = taskBtn.dataset.task;
        const action = taskBtn.classList.contains('btn-start') ? 'start' :
                      taskBtn.classList.contains('btn-complete') ? 'complete' :
                      'view';
        
        console.log(`📋 Acción en tarea ${taskId}: ${action}`);
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([20]);
        }
        
        if (action === 'view') {
            // Navegar a detalle de actividad
            window.location.href = `detalle-actividad.html?id=${taskId}`;
            return;
        }
        
        // Mostrar confirmación
        const confirmMsg = action === 'start' 
            ? '¿Querés comenzar esta tarea?' 
            : '¿Marcar esta tarea como completada?';
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        // Deshabilitar botón temporalmente
        taskBtn.disabled = true;
        const originalText = taskBtn.innerHTML;
        taskBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        try {
            // Aquí iría la lógica para actualizar el estado de la tarea
            // await Database.actualizarEstadoTarea(taskId, action);
            
            // Simular éxito
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mostrar éxito
            showToast(action === 'start' 
                ? '✅ ¡Tarea comenzada!' 
                : '🎉 ¡Tarea completada!', 'success');
            
            // Recargar tareas
            const activeFilter = document.querySelector('.filter-btn.active');
            const filter = activeFilter ? activeFilter.dataset.filter : 'all';
            await loadTasks(filter);
            
        } catch (error) {
            console.error('❌ Error en acción de tarea:', error);
            showToast('❌ Error procesando la acción', 'error');
            
            // Rehabilitar botón
            taskBtn.disabled = false;
            taskBtn.innerHTML = originalText;
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
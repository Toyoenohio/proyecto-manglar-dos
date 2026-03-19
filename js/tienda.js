/**
 * ========================================
 * Tienda - JavaScript
 * Proyecto Manglar Dos - App de Recompensas
 * ======================================== */

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🛒 Página de tienda cargada');
    
    // Verificar autenticación
    if (!Auth.isLoggedIn()) {
        console.warn('🔒 Usuario no autenticado, redirigiendo...');
        Auth.requireAuth();
        return;
    }
    
    // Cargar datos del usuario
    await loadUserData();
    
    // Cargar productos
    await loadProducts();
    
    // Inicializar funcionalidades
    initCategories();
    initSortDropdown();
    initBottomNav();
    initNotificationBtn();
    initBalanceActions();
});

/**
 * Cargar datos del usuario
 */
async function loadUserData() {
    try {
        const user = Auth.getCurrentUser();
        if (!user) return;
        
        // Cargar saldo del usuario
        const saldo = await Database.calcularSaldoUsuario(user.id);
        
        // Actualizar saldo en la UI
        updateBalance(saldo);
        
        console.log('✅ Datos de usuario cargados, saldo:', saldo);
    } catch (error) {
        console.error('❌ Error cargando datos de usuario:', error);
        showError('Error cargando datos del usuario');
    }
}

/**
 * Actualizar saldo en la UI
 */
function updateBalance(saldo) {
    const balanceElement = document.querySelector('.amount-number');
    if (balanceElement) {
        balanceElement.textContent = saldo.toLocaleString('es-ES');
    }
}

/**
 * Cargar productos
 */
async function loadProducts(category = 'all', sortBy = 'price-low') {
    try {
        console.log(`🛒 Cargando productos (categoría: ${category}, orden: ${sortBy})`);
        
        // Mostrar loading state
        showLoadingState();
        
        // Obtener productos de la base de datos
        let productos = await Database.getRecompensasDisponibles();
        
        // Filtrar por categoría si no es "all"
        if (category !== 'all') {
            productos = productos.filter(p => p.categoria === category);
        }
        
        // Ordenar productos
        productos = sortProducts(productos, sortBy);
        
        // Renderizar productos
        renderProducts(productos);
        
        console.log(`✅ ${productos.length} productos cargados`);
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        showError('Error cargando los productos');
        
        // Mostrar estado vacío
        showEmptyState();
    }
}

/**
 * Ordenar productos
 */
function sortProducts(productos, sortBy) {
    return [...productos].sort((a, b) => {
        const precioA = parseFloat(a.precio_mc) || 0;
        const precioB = parseFloat(b.precio_mc) || 0;
        
        switch (sortBy) {
            case 'price-low':
                return precioA - precioB;
            case 'price-high':
                return precioB - precioA;
            case 'popular':
                // Usar etiqueta_destacada como indicador de popularidad
                const destacadoA = a.etiqueta_destacada === 'NUEVO' ? 1 : 0;
                const destacadoB = b.etiqueta_destacada === 'NUEVO' ? 1 : 0;
                return destacadoB - destacadoA;
            case 'new':
                // Ordenar por ID (asumiendo que IDs más altos son más nuevos)
                return parseInt(b.id) - parseInt(a.id);
            default:
                return 0;
        }
    });
}

/**
 * Mostrar estado de carga
 */
function showLoadingState() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Cargando productos...</p>
        </div>
    `;
}

/**
 * Mostrar estado vacío
 */
function showEmptyState() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <p>No hay productos disponibles en esta categoría</p>
        </div>
    `;
}

/**
 * Renderizar productos
 */
function renderProducts(productos) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    if (productos.length === 0) {
        showEmptyState();
        return;
    }
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Renderizar cada producto
    productos.forEach(producto => {
        const productCard = createProductCard(producto);
        container.appendChild(productCard);
    });
}

/**
 * Obtener descripción del producto
 */
function getProductDescription(producto) {
    if (producto.descripcion) return producto.descripcion;
    
    // Descripciones por categoría
    const descriptions = {
        'Académico': 'Beneficio académico especial',
        'Cafetería': 'Producto de la cafetería escolar',
        'Eventos': 'Acceso a eventos escolares',
        'Merchandising': 'Artículo del colegio'
    };
    
    return descriptions[producto.categoria] || 'Recompensa disponible';
}

/**
 * Crear card de producto
 */
function createProductCard(producto) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = producto.id;
    
    // Determinar icono según categoría
    const icon = getProductIcon(producto.categoria);
    const badge = producto.stock_maximo ? 
        `<div class="product-badge">${producto.stock_actual}/${producto.stock_maximo}</div>` : '';
    
    card.innerHTML = `
        <div class="product-image" style="background: ${getProductColor(producto.categoria)}">
            ${badge}
            <div class="product-icon">
                ${icon}
            </div>
        </div>
        <div class="product-content">
            <h3 class="product-title">${producto.titulo || 'Producto'}</h3>
            <p class="product-description">${getProductDescription(producto)}</p>
            <div class="product-footer">
                <div class="product-price">
                    ${producto.precio_mc || 0}<span>MC</span>
                </div>
                <button class="buy-btn" data-product="${producto.id}">
                    Canjear
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Obtener icono según categoría
 */
function getProductIcon(categoria) {
    const icons = {
        'digital': '<i class="fas fa-gamepad"></i>',
        'food': '<i class="fas fa-utensils"></i>',
        'merch': '<i class="fas fa-tshirt"></i>',
        'experiences': '<i class="fas fa-ticket-alt"></i>',
        'default': '<i class="fas fa-gift"></i>'
    };
    
    return icons[categoria] || icons.default;
}

/**
 * Obtener color según categoría
 */
function getProductColor(categoria) {
    const colors = {
        'digital': 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
        'food': 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
        'merch': 'linear-gradient(135deg, #F3E5F5, #E1BEE7)',
        'experiences': 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
        'default': 'linear-gradient(135deg, #E8F5E9, #C8E6C9)'
    };
    
    return colors[categoria] || colors.default;
}

/**
 * Inicializar categorías
 */
function initCategories() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Obtener categoría
            const category = this.dataset.category;
            
            // Obtener orden actual
            const sortSelect = document.getElementById('sortProducts');
            const sortBy = sortSelect ? sortSelect.value : 'price-low';
            
            // Cargar productos de la categoría seleccionada
            loadProducts(category, sortBy);
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate([10]);
            }
        });
    });
}

/**
 * Inicializar dropdown de ordenamiento
 */
function initSortDropdown() {
    const sortSelect = document.getElementById('sortProducts');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', function() {
        // Obtener categoría activa
        const activeCategory = document.querySelector('.category-btn.active');
        const category = activeCategory ? activeCategory.dataset.category : 'all';
        
        // Obtener orden seleccionado
        const sortBy = this.value;
        
        // Cargar productos con el nuevo orden
        loadProducts(category, sortBy);
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([10]);
        }
    });
}

/**
 * Inicializar acciones de saldo
 */
function initBalanceActions() {
    // Botón Historial
    const historyBtn = document.querySelector('.balance-actions .btn-outline:nth-child(1)');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            console.log('📊 Historial de transacciones');
            showToast('📊 Historial disponible próximamente', 'info');
        });
    }
    
    // Botón Canjear (en balance card)
    const redeemBtn = document.querySelector('.balance-actions .btn-outline:nth-child(2)');
    if (redeemBtn) {
        redeemBtn.addEventListener('click', function() {
            console.log('🛒 Ya estás en la tienda');
            showToast('🛒 Explorá los productos disponibles', 'info');
        });
    }
    
    // Delegación de eventos para botones "Canjear" en productos
    document.addEventListener('click', async function(e) {
        const buyBtn = e.target.closest('.buy-btn');
        if (!buyBtn) return;
        
        const productId = buyBtn.dataset.product;
        console.log('🛒 Intentando canjear producto:', productId);
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([20]);
        }
        
        // Mostrar confirmación
        const confirmMsg = '¿Estás seguro de que querés canjear este producto?';
        if (!confirm(confirmMsg)) {
            return;
        }
        
        // Deshabilitar botón temporalmente
        buyBtn.disabled = true;
        buyBtn.textContent = 'Procesando...';
        
        try {
            // Aquí iría la lógica para canjear el producto
            // const user = Auth.getCurrentUser();
            // await Database.canjearProducto(user.id, productId);
            
            // Simular éxito
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mostrar éxito
            showToast('✅ ¡Producto canjeado exitosamente!', 'success');
            
            // Actualizar botón
            buyBtn.textContent = 'Canjeado';
            buyBtn.classList.add('btn-success');
            buyBtn.disabled = true;
            
            // Actualizar saldo (simulado)
            const balanceElement = document.querySelector('.amount-number');
            if (balanceElement) {
                const currentBalance = parseInt(balanceElement.textContent.replace(/,/g, '')) || 0;
                // Supongamos que el producto cuesta 100 MC
                const newBalance = Math.max(0, currentBalance - 100);
                balanceElement.textContent = newBalance.toLocaleString('es-ES');
            }
            
        } catch (error) {
            console.error('❌ Error al canjear producto:', error);
            showToast('❌ Error al procesar el canje', 'error');
            
            // Rehabilitar botón
            buyBtn.disabled = false;
            buyBtn.textContent = 'Canjear';
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

/**
 * Mostrar éxito
 */
function showSuccess(message) {
    showToast(message, 'success');
}
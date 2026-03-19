/**
 * ========================================
 * Routes Configuration
 * Proyecto Manglar Dos - App de Recompensas
 * ========================================
 * 
 * Este archivo maneja la navegación SPA (Single Page Application)
 * para evitar recargas completas de página.
 */

const Routes = {
    // Configuración de rutas
    config: {
        basePath: '/',
        useSPA: true,
        defaultRoute: '/'
    },
    
    // Definición de rutas
    routes: {
        '/': {
            title: 'Inicio - Mangle Coins',
            file: 'index.html',
            auth: true
        },
        '/login': {
            title: 'Login - Colegio El Manglar',
            file: 'login.html',
            auth: false
        },
        '/tienda': {
            title: 'Tienda - Mangle Coins',
            file: 'tienda.html',
            auth: true
        },
        '/tareas': {
            title: 'Tareas - Mangle Coins',
            file: 'tareas.html',
            auth: true
        },
        '/perfil': {
            title: 'Perfil - Mangle Coins',
            file: 'perfil.html',
            auth: true
        },
        '/detalle-actividad': {
            title: 'Detalle Actividad - Mangle Coins',
            file: 'detalle-actividad.html',
            auth: true
        }
    },
    
    /**
     * Inicializar sistema de rutas
     */
    init() {
        console.log('📍 Inicializando sistema de rutas...');
        
        // Interceptar clicks en enlaces
        this.interceptLinks();
        
        // Manejar navegación del navegador (back/forward)
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        // Cargar ruta inicial
        this.loadRoute(window.location.pathname);
    },
    
    /**
     * Interceptar clicks en enlaces
     */
    interceptLinks() {
        document.addEventListener('click', (e) => {
            // Solo manejar clicks en enlaces
            const link = e.target.closest('a');
            if (!link) return;
            
            // Obtener href
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Ignorar enlaces externos, mailto, tel, etc.
            if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('#') || href.startsWith('javascript:')) {
                return;
            }
            
            // Prevenir navegación por defecto
            e.preventDefault();
            
            // Navegar a la ruta
            this.navigate(href);
        });
    },
    
    /**
     * Navegar a una ruta
     */
    navigate(path, replace = false) {
        console.log(`📍 Navegando a: ${path}`);
        
        // Limpiar path
        const cleanPath = this.cleanPath(path);
        
        // Verificar autenticación si es necesario
        if (!this.checkAuth(cleanPath)) {
            return;
        }
        
        // Actualizar URL en el navegador
        const fullPath = this.config.basePath + cleanPath.replace(/^\//, '');
        if (replace) {
            window.history.replaceState({ path: cleanPath }, '', fullPath);
        } else {
            window.history.pushState({ path: cleanPath }, '', fullPath);
        }
        
        // Cargar la ruta
        this.loadRoute(cleanPath);
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([10]);
        }
    },
    
    /**
     * Cargar una ruta
     */
    async loadRoute(path) {
        console.log(`📂 Cargando ruta: ${path}`);
        
        // Limpiar path
        const cleanPath = this.cleanPath(path);
        
        // Obtener configuración de la ruta
        const route = this.getRoute(cleanPath);
        if (!route) {
            console.error(`❌ Ruta no encontrada: ${cleanPath}`);
            this.navigate('/');
            return;
        }
        
        try {
            // Mostrar loader
            this.showLoader();
            
            // Cargar contenido
            const content = await this.fetchContent(route.file);
            
            // Actualizar título
            document.title = route.title;
            
            // Reemplazar contenido
            this.replaceContent(content);
            
            // Inicializar scripts
            this.initScripts();
            
            console.log(`✅ Ruta cargada: ${cleanPath}`);
        } catch (error) {
            console.error(`❌ Error cargando ruta ${cleanPath}:`, error);
            this.showError('Error cargando la página');
        } finally {
            // Ocultar loader
            this.hideLoader();
        }
    },
    
    /**
     * Obtener configuración de ruta
     */
    getRoute(path) {
        // Buscar ruta exacta
        if (this.routes[path]) {
            return this.routes[path];
        }
        
        // Buscar ruta por patrón (para rutas con parámetros)
        for (const routePath in this.routes) {
            if (routePath.includes(':')) {
                const pattern = routePath.replace(/:\w+/g, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                if (regex.test(path)) {
                    return this.routes[routePath];
                }
            }
        }
        
        return null;
    },
    
    /**
     * Limpiar path
     */
    cleanPath(path) {
        // Remover basePath si está presente
        let clean = path.replace(new RegExp(`^${this.config.basePath}`), '/');
        
        // Asegurar que empiece con /
        if (!clean.startsWith('/')) {
            clean = '/' + clean;
        }
        
        // Remover .html extension
        clean = clean.replace(/\.html$/, '');
        
        // Ruta por defecto si está vacía
        if (clean === '') {
            clean = '/';
        }
        
        return clean;
    },
    
    /**
     * Verificar autenticación
     */
    checkAuth(path) {
        const route = this.getRoute(path);
        if (!route) return true;
        
        // Si la ruta requiere autenticación
        if (route.auth && typeof Auth !== 'undefined') {
            if (!Auth.isLoggedIn()) {
                console.log('🔒 Redirigiendo a login desde:', path);
                
                // Guardar ruta destino
                const redirectPath = path === '/' ? '' : path;
                localStorage.setItem('redirectAfterLogin', redirectPath);
                
                // Navegar a login
                this.navigate('/login', true);
                return false;
            }
        }
        
        // Si ya está autenticado y va a login, redirigir a inicio
        if (path === '/login' && typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
            const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
            localStorage.removeItem('redirectAfterLogin');
            
            console.log('✅ Ya autenticado, redirigiendo a:', redirectPath);
            this.navigate(redirectPath, true);
            return false;
        }
        
        return true;
    },
    
    /**
     * Fetch contenido de archivo
     */
    async fetchContent(file) {
        const response = await fetch(file);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.text();
    },
    
    /**
     * Reemplazar contenido
     */
    replaceContent(content) {
        // Parsear HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Obtener elementos principales
        const newHead = doc.head;
        const newBody = doc.body;
        
        // Reemplazar head (excepto title que ya manejamos)
        const oldHead = document.head;
        const headChildren = Array.from(oldHead.children);
        
        // Remover elementos del head que no sean meta viewport o title
        headChildren.forEach(child => {
            if (!child.matches('meta[name="viewport"], title')) {
                child.remove();
            }
        });
        
        // Agregar nuevos elementos del head
        Array.from(newHead.children).forEach(child => {
            if (!child.matches('title')) { // Title ya lo manejamos
                oldHead.appendChild(child.cloneNode(true));
            }
        });
        
        // Reemplazar body
        document.body.innerHTML = newBody.innerHTML;
        
        // Copiar clases del body
        document.body.className = newBody.className;
        
        // Copiar atributos del body
        Array.from(newBody.attributes).forEach(attr => {
            document.body.setAttribute(attr.name, attr.value);
        });
    },
    
    /**
     * Inicializar scripts
     */
    initScripts() {
        // Ejecutar scripts inline
        const scripts = document.querySelectorAll('script:not([src])');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });
        
        // Cargar scripts externos
        const externalScripts = document.querySelectorAll('script[src]');
        externalScripts.forEach(script => {
            const src = script.getAttribute('src');
            if (!document.querySelector(`script[src="${src}"]`)) {
                const newScript = document.createElement('script');
                newScript.src = src;
                if (script.hasAttribute('defer')) newScript.defer = true;
                if (script.hasAttribute('async')) newScript.async = true;
                document.body.appendChild(newScript);
            }
        });
        
        // Disparar evento DOMContentLoaded
        window.dispatchEvent(new Event('DOMContentLoaded'));
    },
    
    /**
     * Manejar popstate (back/forward)
     */
    handlePopState(event) {
        if (event.state && event.state.path) {
            this.loadRoute(event.state.path);
        } else {
            this.loadRoute(window.location.pathname);
        }
    },
    
    /**
     * Mostrar loader
     */
    showLoader() {
        // Crear loader si no existe
        let loader = document.getElementById('route-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'route-loader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <p class="loader-text">Cargando...</p>
                </div>
            `;
            
            document.body.appendChild(loader);
            
            // Agregar estilos
            const style = document.createElement('style');
            style.textContent = `
                .loader-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #f0f0f0;
                    border-top-color: #4CAF50;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                .loader-text {
                    margin-top: 16px;
                    color: #666;
                    font-size: 14px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Mostrar loader
        setTimeout(() => {
            loader.style.opacity = '1';
        }, 10);
    },
    
    /**
     * Ocultar loader
     */
    hideLoader() {
        const loader = document.getElementById('route-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 300);
        }
    },
    
    /**
     * Mostrar error
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #E53E3E;
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            z-index: 9999;
            max-width: 80%;
        `;
        
        errorDiv.innerHTML = `
            <p style="margin: 0 0 12px 0; font-weight: 500;">${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #E53E3E;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
            ">Reintentar</button>
        `;
        
        document.body.appendChild(errorDiv);
    }
};

// Exportar para uso global
window.Routes = Routes;
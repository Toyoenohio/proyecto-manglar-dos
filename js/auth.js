/**
 * ========================================
 * Authentication Module
 * Proyecto Manglar Dos - App de Recompensas
 * ========================================
 */

const Auth = {
    // Claves para localStorage
    keys: {
        user: 'manglar2_user',
        session: 'manglar2_session',
        timestamp: 'manglar2_timestamp'
    },
    
    // Duración de sesión (7 días)
    sessionDuration: 7 * 24 * 60 * 60 * 1000,
    
    /**
     * Iniciar sesión
     */
    async login(email, pin) {
        try {
            // Validar credenciales contra la DB
            const user = await Database.validateUser(email, pin);
            
            if (!user) {
                console.warn('❌ [AUTH] Credenciales inválidas');
                return null;
            }
            
            // Guardar sesión
            this.saveSession(user);
            
            console.log(`✅ [AUTH] Login exitoso: ${user.nombre}`);
            return user;
        } catch (error) {
            console.error('❌ [AUTH] Error en login:', error);
            throw error;
        }
    },
    
    /**
     * Guardar sesión en localStorage
     */
    saveSession(user) {
        try {
            localStorage.setItem(this.keys.user, JSON.stringify(user));
            localStorage.setItem(this.keys.session, 'active');
            localStorage.setItem(this.keys.timestamp, Date.now().toString());
            
            console.log('💾 [SESSION] Sesión guardada');
        } catch (error) {
            console.error('❌ [SESSION] Error guardando sesión:', error);
        }
    },
    
    /**
     * Cerrar sesión
     */
    logout() {
        try {
            localStorage.removeItem(this.keys.user);
            localStorage.removeItem(this.keys.session);
            localStorage.removeItem(this.keys.timestamp);
            
            console.log('👋 [AUTH] Sesión cerrada');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('❌ [AUTH] Error cerrando sesión:', error);
        }
    },
    
    /**
     * Verificar si hay sesión activa
     */
    isLoggedIn() {
        try {
            const session = localStorage.getItem(this.keys.session);
            const timestamp = localStorage.getItem(this.keys.timestamp);
            
            if (!session || session !== 'active') {
                return false;
            }
            
            // Verificar si la sesión expiró
            if (timestamp) {
                const age = Date.now() - parseInt(timestamp);
                if (age > this.sessionDuration) {
                    console.log('⏰ [SESSION] Sesión expirada');
                    this.logout();
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ [AUTH] Error verificando sesión:', error);
            return false;
        }
    },
    
    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem(this.keys.user);
            
            if (!userStr) {
                return null;
            }
            
            return JSON.parse(userStr);
        } catch (error) {
            console.error('❌ [AUTH] Error obteniendo usuario:', error);
            return null;
        }
    },
    
    /**
     * Obtener nombre del usuario
     */
    getUserName() {
        const user = this.getCurrentUser();
        return user ? user.nombre : 'Estudiante';
    },
    
    /**
     * Obtener ID del usuario
     */
    getUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    },
    
    /**
     * Requerir autenticación (para páginas protegidas)
     */
    requireAuth() {
        // Verificar si ya estamos en login para evitar loops
        const isLoginPage = window.location.pathname.includes('login.html');
        if (isLoginPage) {
            return true; // No redirigir desde login a login
        }
        
        if (!this.isLoggedIn()) {
            console.log('🔒 [AUTH] Redirigiendo a login');
            
            // Limpiar cualquier sesión corrupta
            this.clearCorruptedSession();
            
            // Redirigir a login con un parámetro para evitar loops
            const currentUrl = window.location.pathname;
            window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
            return false;
        }
        return true;
    },
    
    /**
     * Limpiar sesión corrupta
     */
    clearCorruptedSession() {
        try {
            // Verificar si hay datos inconsistentes
            const userStr = localStorage.getItem(this.keys.user);
            const session = localStorage.getItem(this.keys.session);
            
            // Si hay user pero no session, o viceversa, limpiar todo
            if ((userStr && !session) || (!userStr && session)) {
                console.warn('🧹 [AUTH] Limpiando sesión corrupta');
                localStorage.removeItem(this.keys.user);
                localStorage.removeItem(this.keys.session);
                localStorage.removeItem(this.keys.timestamp);
            }
        } catch (error) {
            console.error('❌ [AUTH] Error limpiando sesión:', error);
        }
    },
    
    /**
     * Actualizar timestamp de sesión
     */
    refreshSession() {
        if (this.isLoggedIn()) {
            localStorage.setItem(this.keys.timestamp, Date.now().toString());
        }
    }
};

// Exportar para uso global
window.Auth = Auth;

// Auto-require auth si estamos en una página protegida
// (se puede deshabilitar agregando data-public="true" al body)
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const isPublic = body.getAttribute('data-public') === 'true';
    
    // Páginas públicas: login.html
    const isLoginPage = window.location.pathname.includes('login.html');
    
    // Solo ejecutar requireAuth si NO estamos en una página pública
    // y NO estamos en la página de login
    if (!isPublic && !isLoginPage) {
        // Pequeño delay para asegurar que todo esté cargado
        setTimeout(() => {
            Auth.requireAuth();
        }, 100);
    }
});
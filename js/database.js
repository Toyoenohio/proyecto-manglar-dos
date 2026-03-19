/**
 * ========================================
 * Database Module - Google Sheets
 * Proyecto Manglar Dos - App de Recompensas
 * ========================================
 */

const Database = {
    // URLs de las hojas de cálculo publicadas (actualizar con tus URLs reales)
    urls: {
        usuarios: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQP3HRn9UADHnnQkckKluEg7jObX46PBAe7ucPUJh8hicSqChAUHouWbJXjo3S0MAorIxOy01dVwSs/pub?gid=1857824058&single=true&output=csv',
        actividades: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQP3HRn9UADHnnQkckKluEg7jObX46PBAe7ucPUJh8hicSqChAUHouWbJXjo3S0MAorIxOy01dVwSs/pub?gid=0&single=true&output=csv',
        recompensas: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQP3HRn9UADHnnQkckKluEg7jObX46PBAe7ucPUJh8hicSqChAUHouWbJXjo3S0MAorIxOy01dVwSs/pub?output=csv',
        transacciones: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQP3HRn9UADHnnQkckKluEg7jObX46PBAe7ucPUJh8hicSqChAUHouWbJXjo3S0MAorIxOy01dVwSs/pub?output=csv'
    },
    
    // Cache de datos
    cache: {
        usuarios: null,
        actividades: null,
        recompensas: null,
        transacciones: null,
        lastFetch: 0
    },
    
    // Tiempo de cache (5 minutos)
    cacheTime: 5 * 60 * 1000,
    
    /**
     * Parsear CSV a array de objetos
     */
    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = this.parseCSVLine(line);
            const obj = {};
            
            headers.forEach((header, index) => {
                let value = values[index] || '';
                
                // Convertir tipos
                if (value === 'TRUE') value = true;
                else if (value === 'FALSE') value = false;
                else if (!isNaN(value) && value !== '') value = Number(value);
                
                obj[header] = value;
            });
            
            return obj;
        });
    },
    
    /**
     * Parsear una línea de CSV (maneja comas dentro de comillas)
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    },
    
    /**
     * Obtener datos de una hoja
     */
    async fetch(sheet) {
        // Verificar cache
        const now = Date.now();
        if (this.cache[sheet] && (now - this.cache.lastFetch) < this.cacheTime) {
            console.log(`📊 [CACHE] ${sheet}`);
            return this.cache[sheet];
        }
        
        try {
            console.log(`📊 [FETCH] ${sheet}...`);
            const response = await fetch(this.urls[sheet]);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const text = await response.text();
            const data = this.parseCSV(text);
            
            // Actualizar cache
            this.cache[sheet] = data;
            this.cache.lastFetch = now;
            
            console.log(`✅ [OK] ${sheet}: ${data.length} registros`);
            return data;
        } catch (error) {
            console.error(`❌ [ERROR] ${sheet}:`, error);
            
            // Si hay cache, usarlo aunque esté viejo
            if (this.cache[sheet]) {
                console.log(`⚠️ [FALLBACK] Usando cache viejo para ${sheet}`);
                return this.cache[sheet];
            }
            
            throw error;
        }
    },
    
    /**
     * Obtener todos los usuarios
     */
    async getUsuarios() {
        return await this.fetch('usuarios');
    },
    
    /**
     * Obtener usuario por email
     */
    async getUsuarioByEmail(email) {
        const usuarios = await this.getUsuarios();
        return usuarios.find(u => u.correo === email.toLowerCase());
    },
    
    /**
     * Validar credenciales de usuario
     */
    async validateUser(email, pin) {
        const usuario = await this.getUsuarioByEmail(email);
        
        if (!usuario) {
            return null;
        }
        
        // Convertir pin a número para comparación
        const pinNum = typeof pin === 'string' ? parseInt(pin) : pin;
        const usuarioPin = typeof usuario.pin === 'string' ? parseInt(usuario.pin) : usuario.pin;
        
        if (usuarioPin !== pinNum) {
            return null;
        }
        
        // Retornar usuario sin el pin
        const { pin: _, ...userSafe } = usuario;
        return userSafe;
    },
    
    /**
     * Obtener todas las actividades
     */
    async getActividades() {
        return await this.fetch('actividades');
    },
    
    /**
     * Obtener actividades disponibles (con cupo)
     */
    async getActividadesDisponibles() {
        const actividades = await this.getActividades();
        return actividades.filter(a => 
            a.estado === 'Disponible' && 
            (a.cupo_actual < a.cupo_maximo || !a.cupo_maximo)
        );
    },
    
    /**
     * Obtener actividad por ID
     */
    async getActividadById(id) {
        const actividades = await this.getActividades();
        return actividades.find(a => a.id == id);
    },
    
    /**
     * Obtener todas las recompensas
     */
    async getRecompensas() {
        return await this.fetch('recompensas');
    },
    
    /**
     * Obtener recompensas disponibles
     */
    async getRecompensasDisponibles() {
        const recompensas = await this.getRecompensas();
        return recompensas.filter(r => 
            r.estado === 'Disponible' && 
            (r.stock_actual > 0 || !r.stock_maximo)
        );
    },
    
    /**
     * Obtener transacciones de un usuario
     */
    async getTransaccionesUsuario(usuarioId) {
        const transacciones = await this.fetch('transacciones');
        return transacciones.filter(t => t.usuario_id == usuarioId);
    },
    
    /**
     * Calcular saldo de un usuario
     */
    async calcularSaldoUsuario(usuarioId) {
        const transacciones = await this.getTransaccionesUsuario(usuarioId);
        
        if (transacciones.length === 0) {
            return 0;
        }
        
        return transacciones.reduce((saldo, t) => {
            const monto = parseFloat(t.monto) || 0;
            return t.tipo === 'ganancia' ? saldo + monto : saldo - monto;
        }, 0);
    },
    
    /**
     * Limpiar cache
     */
    clearCache() {
        this.cache = {
            usuarios: null,
            actividades: null,
            recompensas: null,
            transacciones: null,
            lastFetch: 0
        };
        console.log('🧹 [CACHE] Cache limpiado');
    }
};

// Exportar para uso global
window.Database = Database;
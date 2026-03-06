# 🎓 Colegio El Manglar - App de Recompensas

Aplicación móvil para el sistema de recompensas "Mangle Coins" del Colegio El Manglar. Construida con **HTML, CSS y JavaScript puro** (sin frameworks).

---

## 📱 **Mobile-Only Design**

Esta webapp está diseñada **exclusivamente para móviles**. El contenedor principal está limitado a 428px (iPhone 14 Pro Max) para garantizar la mejor experiencia en dispositivos móviles.

---

## 🎨 **Descripción**

App de gamificación escolar donde los estudiantes ganan **Mangle Coins (MC)** participando en actividades del colegio y pueden canjearlas por recompensas.

### **Features:**

| Elemento | Descripción |
|----------|-------------|
| **Saldo Actual** | Card destacada con saldo de Mangle Coins (1,250 MC) |
| **Historial** | Ver transacciones de MC ganadas/gastadas |
| **Canjear** | Acceder a la tienda de recompensas |
| **Actividades** | Lista de actividades disponibles con cupo y progreso |
| **Recompensas** | Cada actividad muestra MC a ganar (+50 MC, +30 MC, etc.) |
| **Bottom Nav** | 4 íconos (Inicio, Tienda, Tareas, Perfil) |

---

## 🎨 **Paleta de Colores**

```css
--color-white: #FFFFFF;              /* Blanco */
--color-dark: #1A1A1A;               /* Texto principal */
--color-gray-500: #666666;           /* Texto secundario */
--color-gray-600: #999999;           /* Texto terciario */

--color-primary: #4CAF50;            /* Verde primario */
--color-primary-light: #C8E6C9;      /* Verde claro */
--color-primary-dark: #388E3C;       /* Verde oscuro */

--color-yellow: #FFF9C4;             /* Fondo saldo */
--color-yellow-badge: #FFD700;       /* Badge recompensa */

--color-green-1: #4DB6AC;            /* Actividad 1 (Limpieza) */
--color-green-2: #DCEDC8;            /* Actividad 2 (Tutoría) */
--color-green-3: #A5D6A7;            /* Actividad 3 (Reciclaje) */
```

---

## 📋 **Estructura del Proyecto**

```
proyecto-manglar-dos/
├── index.html              # Página principal (mobile layout)
├── css/
│   └── styles.css          # Estilos mobile-first
├── js/
│   └── app.js              # Funcionalidades JavaScript
├── README.md               # Documentación
└── .gitignore              # Archivos a ignorar
```

---

## 🛠️ **Instalación y Uso**

### **1. Clonar el repositorio**

```bash
git clone https://github.com/Toyoenohio/proyecto-manglar-dos.git
cd proyecto-manglar-dos
```

### **2. Abrir en el navegador**

**Opción A: Directo (recomendado para mobile)**
```bash
# Abrir en Chrome DevTools mobile
# F12 → Toggle device toolbar (Ctrl+Shift+M) → Seleccionar iPhone 14 Pro
```

**Opción B: Servidor local**
```bash
npx http-server -p 3000
# Luego abrir: http://localhost:3000
```

**Opción C: Live Server (VS Code)**
```
# Instalar extensión "Live Server"
# Click derecho en index.html → "Open with Live Server"
```

---

## 📱 **Dispositivos Soportados**

| Dispositivo | Resolución | Estado |
|-------------|------------|--------|
| iPhone 14 Pro Max | 428×926 | ✅ Optimizado |
| iPhone 14 Pro | 393×852 | ✅ Optimizado |
| iPhone SE | 375×667 | ✅ Optimizado |
| Samsung Galaxy S23 | 360×780 | ✅ Optimizado |
| Google Pixel 7 | 412×915 | ✅ Optimizado |

---

## 🎯 **Componentes UI**

### **1. Header**
- Avatar circular del estudiante
- Saludo: "¡Hola, Estudiante!"
- Subtítulo: "Colegio El Manglar"
- Botón de notificaciones

### **2. Saldo Actual (Hero Card)**
- Fondo amarillo suave (#FFF9C4)
- Saldo grande: "1,250 MANGLE COINS"
- Dos botones: "Historial" y "Canjear"
- Iconos: reloj (historial), flecha arriba (canjear)

### **3. Actividades Disponibles**
- Título de sección + link "Ver todas"
- Cards de actividades con:
  - Imagen ilustrativa con fondo de color pastel
  - Badge de recompensa (+X MC)
  - Título de actividad
  - Descripción
  - Cupo disponible (4 / 10 personas)
  - Barra de progreso
  - Botón "Participar"

### **4. Bottom Navigation**
- 4 íconos fijos abajo
- Estado activo en verde (#4CAF50)
- Labels: INICIO, TIENDA, TAREAS, PERFIL

---

## 🔧 **Funcionalidades JavaScript**

### **Incluidas:**

```javascript
// Navegación bottom nav
initBottomNav()

// Botón de notificaciones
initNotificationBtn()

// Botones de participar
initParticipateButtons()

// Animaciones de scroll
initScrollAnimations()

// Acciones de saldo
initBalanceActions()

// Utilidades
showAlert()
updateBalance()
addActivity()
updateSlots()
completeActivity()
```

### **Características:**

| Feature | Descripción |
|---------|-------------|
| **Feedback háptico** | Vibración en mobile (si soportado) |
| **Animaciones** | Fade in y slide up al hacer scroll |
| **Toast alerts** | Notificaciones tipo toast |
| **Active states** | Cambios visuales al tocar |
| **Progreso dinámico** | Barra de progreso se actualiza al participar |
| **Cupo en tiempo real** | Actualización de cupo disponible |

---

## 🎮 **Actividades de Ejemplo**

| Actividad | Recompensa | Cupo | Progreso |
|-----------|------------|------|----------|
| **Limpieza de Áreas Verdes** | +50 MC | 4/10 | 40% |
| **Tutoría entre Pares** | +30 MC | 7/15 | 47% |
| **Recogida de PET** | +75 MC | 2/8 | 25% |

---

## 🌐 **Deploy**

### **Opciones gratuitas:**

| Plataforma | URL |
|------------|-----|
| **GitHub Pages** | `https://toyoenohio.github.io/proyecto-manglar-dos/` |
| **Netlify Drop** | Arrastra la carpeta |
| **Vercel** | Conecta el repo |
| **Cloudflare Pages** | Conecta el repo |

### **Deploy en GitHub Pages:**

```bash
# Settings → Pages → Source: main branch → Save

# URL resultante:
https://toyoenohio.github.io/proyecto-manglar-dos/
```

---

## 📝 **Personalización**

### **Cambiar colores:**

Edita `css/styles.css`:

```css
:root {
    --color-primary: #TU_COLOR;  /* Cambia el verde */
}
```

### **Cambiar datos del estudiante:**

Edita `index.html`:

```html
<span class="greeting-large">¡Hola, TU_NOMBRE!</span>
<span class="amount-number">TU_SALDO</span>
```

### **Agregar más actividades:**

Copia y pega un bloque `.activity-card`:

```html
<div class="activity-card">
    <div class="activity-image cleanup">
        <div class="reward-badge">+XX MC</div>
        <!-- Ilustración SVG -->
    </div>
    <div class="activity-content">
        <h3 class="activity-title">Nombre Actividad</h3>
        <p class="activity-description">Descripción...</p>
        <div class="activity-slots">
            <span class="slots-label">CUPO</span>
            <span class="slots-value">X / Y personas</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: XX%;"></div>
        </div>
        <button class="btn btn-participate">Participar</button>
    </div>
</div>
```

---

## 📊 **Performance**

| Métrica | Valor |
|---------|-------|
| **Tamaño HTML** | ~11 KB |
| **Tamaño CSS** | ~13 KB |
| **Tamaño JS** | ~13 KB |
| **Total** | ~37 KB |
| **Fonts** | Google Fonts Inter |
| **Imágenes** | SVG inline (sin requests extra) |

---

## 🤝 **Contribuir**

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Agregar nueva feature'`)
4. Push a la branch (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

---

## 📄 **Licencia**

Código abierto. Sentite libre de usar y modificar.

---

## 👨‍💻 **Autor**

- **GitHub:** [@Toyoenohio](https://github.com/Toyoenohio)

---

## 🙏 **Agradecimientos**

Diseño replicado fielmente desde captura de pantalla proporcionada.

**Hecho con ❤️ para Colegio El Manglar**

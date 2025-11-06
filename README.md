# FasText

Editor de texto minimalista y de alto rendimiento construido con Tauri y Rust. Diseñado para ser más rápido y eficiente que el Notepad de Windows, con una interfaz limpia y elegante.

## ✨ Características

- **Alto rendimiento**: Optimizado para manejar archivos grandes con eficiencia
- **Interfaz minimalista**: Diseño limpio sin distracciones
- **Multiplataforma**: Windows, macOS y Linux
- **Múltiples pestañas**: Gestiona varios archivos simultáneamente
- **Temas personalizables**: Varios temas oscuros incluidos
- **Fuentes configurables**: Soporte para fuentes monoespaciadas populares
- **Atajos de teclado personalizables**: Configura tus propios atajos
- **Autoguardado opcional**: Guarda automáticamente tus cambios
- **100% offline**: No requiere conexión a internet

## 🚀 Instalación

### Requisitos

- Rust (última versión estable)
- Node.js 16+ y npm

### Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/fastext.git
cd fastext

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Compilar

```bash
# Compilar para producción
npm run build
```

Los ejecutables se generarán en `src-tauri/target/release/`.

## 📦 Estructura del Proyecto

```
fastext/
├── src/                 # Frontend (JavaScript)
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js
│       ├── editor.js
│       ├── file-manager.js
│       ├── tab-manager.js
│       ├── settings-manager.js
│       ├── config-manager.js
│       ├── theme-manager.js
│       ├── status-bar.js
│       ├── window-manager.js
│       ├── dialog-helper.js
│       └── tauri-loader.js
├── src-tauri/           # Backend (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/
│   │   │   └── file_commands.rs
│   │   ├── dialog/
│   │   │   └── mod.rs
│   │   ├── file_ops/
│   │   │   └── mod.rs
│   │   └── constants.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── LICENSE
└── README.md
```

## 🛠️ Tecnologías

- **Backend**: Rust + Tauri 1.5
- **Frontend**: JavaScript ES6 Modules (Vanilla JS)
- **Build**: Cargo + npm

## ⌨️ Atajos de Teclado

- `Ctrl+N` / `Cmd+N` - Nuevo archivo
- `Ctrl+O` / `Cmd+O` - Abrir archivo
- `Ctrl+S` / `Cmd+S` - Guardar
- `Ctrl+Shift+S` / `Cmd+Shift+S` - Guardar como
- `Ctrl+P` / `Cmd+P` - Buscar pestaña
- `Ctrl+Tab` - Cambiar entre pestañas
- `F2` - Renombrar archivo
- `Esc` - Cerrar diálogos

Los atajos son personalizables desde el menú de configuración.

## 🎨 Temas

FasText incluye varios temas oscuros:

- Default (negro)
- Base2Tone Lavender
- Base2Tone Mall
- Ayu Dark
- Gruvbox Dark

## 📝 Formatos Soportados

FasText puede abrir cualquier archivo de texto, incluyendo:

`.txt`, `.md`, `.json`, `.xml`, `.html`, `.css`, `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.rs`, `.java`, `.cpp`, `.c`, `.h`, `.hpp`, `.cs`, `.php`, `.rb`, `.go`, `.sh`, `.bat`, `.ps1`, `.yml`, `.yaml`, `.toml`, `.ini`, `.cfg`, `.conf`, `.log`, y más.

## 🔧 Configuración

Puedes personalizar:

- Tema de color
- Familia de fuente (Consolas, Fira Code, Source Code Pro, JetBrains Mono, MesloLGS NF)
- Tamaño de fuente (8-48px)
- Atajos de teclado
- Autoguardado

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👤 Autor

**Gabriel Romero**

## 🙏 Agradecimientos

- [Tauri](https://tauri.app/) - Framework para aplicaciones de escritorio
- [Rust](https://www.rust-lang.org/) - Lenguaje de programación
- Todas las fuentes incluidas (Fira Code, Source Code Pro, JetBrains Mono, MesloLGS NF)

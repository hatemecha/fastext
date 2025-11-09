# FasText

Editor de texto minimalista para escritorio. Construido con Tauri y Rust.

## Características

- Editor de texto de alto rendimiento
- Interfaz minimalista
- Gestión de múltiples pestañas
- Temas personalizables
- Fuentes monoespaciadas configurables
- Atajos de teclado personalizables
- Autoguardado opcional
- Soporte para Markdown con vista previa
- Funciona completamente offline

## Instalación

### Requisitos

- Rust (versión estable)
- Node.js 16+ y npm

### Desarrollo

```bash
git clone https://github.com/hatemecha/fastext.git
cd fastext
npm install
npm run dev
```

### Compilación

```bash
npm run build
```

Los ejecutables se generan en `src-tauri/target/release/`.

## Tecnologías

- Backend: Rust + Tauri 1.5
- Frontend: JavaScript ES6 Modules
- Build: Cargo + npm

## Atajos de Teclado

- `Ctrl+N` / `Cmd+N` - Nuevo archivo
- `Ctrl+O` / `Cmd+O` - Abrir archivo
- `Ctrl+S` / `Cmd+S` - Guardar
- `Ctrl+Shift+S` / `Cmd+Shift+S` - Guardar como
- `Ctrl+P` / `Cmd+P` - Buscar pestaña
- `Ctrl+Tab` - Cambiar entre pestañas
- `F2` - Renombrar archivo

Los atajos son personalizables desde la configuración.

## Temas

Temas oscuros incluidos: Default, Base2Tone Lavender, Base2Tone Mall, Ayu Dark, Gruvbox Dark.

## Formatos Soportados

Cualquier archivo de texto. Detección automática de formato por extensión.

## Configuración

Personalizable: tema, fuente, tamaño de fuente, atajos de teclado, autoguardado.

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

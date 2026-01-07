# Configuración de Cloudflare Pages

## Problema Actual

El deployment está fallando con:
```
Executing user command: bash build.sh
bash: build.sh: No such file or directory
```

## ✅ Solución

Este error ocurre porque Cloudflare Pages está configurado con un **build command incorrecto** en el dashboard.

### Paso 1: Ir al Dashboard de Cloudflare Pages

1. Ir a https://dash.cloudflare.com/
2. Seleccionar tu cuenta
3. Ir a **Workers & Pages** → **Pages**
4. Seleccionar el proyecto **bstabs**

### Paso 2: Corregir la Configuración de Build

1. Ir a **Settings** → **Builds & deployments**
2. En la sección **Build configuration**, editar:

**Para el branch `main` (producción - bstabs.com):**
```
Framework preset: Angular
Build command: npm run build
Build output directory: /dist/black-sheep-app/browser
Root directory: frontend/black-sheep-app
Node version: 20
```

**Para el branch `admin` (admin - bstabs.pages.dev):**
```
Framework preset: Angular
Build command: npm run build
Build output directory: /dist/black-sheep-app/browser
Root directory: frontend/black-sheep-app
Node version: 20
```

### Paso 3: Variables de Entorno (Opcional)

Si necesitas variables de entorno en Pages:
1. Ir a **Settings** → **Environment variables**
2. Agregar variables solo si son necesarias (actualmente no hay ninguna requerida)

## ⚠️ Notas Importantes

1. **NO** necesitas un archivo `build.sh` en la raíz
2. **NO** necesitas un `wrangler.toml` en la raíz (solo en `backend-workers/`)
3. El **Root directory** debe ser `frontend/black-sheep-app` (no la raíz del proyecto)
4. El **Build output directory** es relativo al Root directory

## 🔍 Verificar Deployment

Después de corregir la configuración:

1. Ve a **Deployments**
2. Click en **Retry deployment** en el deployment fallido
3. O haz un nuevo commit y push para triggear un nuevo deployment

## 📦 Estructura del Proyecto

```
blackSheep/
├── frontend/
│   └── black-sheep-app/     ← Root directory en Pages
│       ├── package.json
│       ├── angular.json
│       └── dist/
│           └── black-sheep-app/
│               └── browser/  ← Build output
├── backend-workers/
│   └── wrangler.toml        ← Solo Workers usa esto
└── docs/
```

## 🚀 Deployment Manual (Alternativo)

Si prefieres deployar manualmente (sin GitHub integration):

```bash
# Desde frontend/black-sheep-app
cd frontend/black-sheep-app

# Build
npm run build

# Deploy a Pages manualmente
npm run deploy       # → bstabs.com (main branch)
npm run deploy:admin # → bstabs.pages.dev (admin branch)
```

## 📞 Soporte

Si el problema persiste:
1. Revisa los logs completos del deployment en Pages Dashboard
2. Verifica que el branch correcto esté configurado
3. Asegúrate de que no haya archivos `wrangler.toml` en la raíz

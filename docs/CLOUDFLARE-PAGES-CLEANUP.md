# Cloudflare Pages - Limpieza de Deployments

## Problema

Cloudflare Pages crea deployments automáticos por cada branch, generando URLs temporales:
- `agitated-goldwasser.bstabs.pages.dev`
- `busy-shamir.bstabs.pages.dev`
- `musing-hypatia.bstabs.pages.dev`
- etc.

## Solución: URLs Permanentes

### Configuración Actual

| Branch | URL Permanente | Propósito |
|--------|----------------|-----------|
| `main` | https://www.bstabs.com/ | Producción pública (sin admin) |
| `admin` | https://bstabs.pages.dev/ | Versión con panel admin |

### Pasos para Limpiar Deployments Viejos

#### 1. Acceder a Cloudflare Dashboard

```
https://dash.cloudflare.com/
→ Pages
→ bstabs (tu proyecto)
```

#### 2. Configurar Deployment Branches

En la pestaña **Settings** > **Builds & deployments**:

**Production branch:**
- ✅ Establecer: `main`
- ✅ Custom domain: `bstabs.com`

**Preview branches:**
- ✅ Agregar solo: `admin`
- ❌ Deshabilitar "Automatic deployments for all branches"

#### 3. Eliminar Branches Temporales

**Desde GitHub:**
```bash
# Ver todas las branches
git branch -a

# Eliminar branches locales obsoletas
git branch -D agitated-goldwasser
git branch -D busy-shamir
git branch -D musing-hypatia
git branch -D recursing-swirles
git branch -D suspicious-mcnulty

# Eliminar branches remotas
git push origin --delete agitated-goldwasser
git push origin --delete busy-shamir
git push origin --delete musing-hypatia
git push origin --delete recursing-swirles
git push origin --delete suspicious-mcnulty

# Mantener solo estas branches
git branch -a
# * main
# * admin
```

**Desde Cloudflare Dashboard:**
1. Ve a **Deployments** tab
2. Para cada deployment temporal, click en "..." → **Delete deployment**
3. Mantén solo los deployments de `main` y `admin`

#### 4. Prevenir Nuevos Deployments Automáticos

En **Settings** > **Builds & deployments** > **Branch deployments:**

```
Production branch: main
Preview branches: Only: admin
```

Deshabilitar:
- ❌ "All branches"
- ❌ "Include preview branches in production"

### Deployment Workflow Final

```bash
# Producción (sin admin)
git checkout main
git add . && git commit -m "feat: ..."
git push origin main
cd frontend/black-sheep-app
npm run deploy              # → bstabs.com

# Admin (con panel)
git checkout admin
git merge main              # Sync con producción
git push origin admin
cd frontend/black-sheep-app
npm run deploy:admin        # → bstabs.pages.dev
```

### Verificación

Después de la limpieza, deberías tener:

**GitHub branches:**
- `main` (default)
- `admin`

**Cloudflare Deployments activos:**
- `main` → bstabs.com
- `admin` → bstabs.pages.dev

**URLs inactivas (eliminar):**
- ~~agitated-goldwasser.bstabs.pages.dev~~
- ~~busy-shamir.bstabs.pages.dev~~
- ~~musing-hypatia.bstabs.pages.dev~~
- ~~recursing-swirles.bstabs.pages.dev~~
- ~~suspicious-mcnulty.bstabs.pages.dev~~

## Comandos de Limpieza Rápida

```bash
# Eliminar todas las branches temporales de una vez
git branch | grep -E "agitated|busy|musing|recursing|suspicious" | xargs git branch -D

# Eliminar del remoto
git push origin --delete agitated-goldwasser busy-shamir musing-hypatia recursing-swirles suspicious-mcnulty
```

## Referencias

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Branch Deployments](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
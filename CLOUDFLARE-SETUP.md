# Conectar bstabs.com (Cloudflare) a Vercel

## 📋 PASOS EXACTOS

### PASO 1: Agregar dominio en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Encuentra tu proyecto `bstabs` o `black-sheep`
3. Click en **Settings** → **Domains**
4. Click **Add Domain**
5. Escribe: `bstabs.com`
6. Click **Add**
7. Repite para `www.bstabs.com`

Vercel te mostrará algo como:

```
⚠️ Invalid Configuration
Add the following record to your DNS provider:

Type: A
Name: @
Value: 76.76.21.21
```

---

### PASO 2: Configurar DNS en Cloudflare

#### Opción A: Apuntar a Vercel (Recomendado)

1. Ve a Cloudflare Dashboard: https://dash.cloudflare.com
2. Selecciona tu dominio: `bstabs.com`
3. Ve a **DNS** → **Records**
4. **Elimina** cualquier registro A o CNAME existente para `@` y `www`
5. **Agrega estos registros:**

```
┌──────┬────────┬─────────────────────────┬────────┐
│ Type │ Name   │ Content                 │ Proxy  │
├──────┼────────┼─────────────────────────┼────────┤
│ A    │ @      │ 76.76.21.21            │ ❌ DNS │
│ CNAME│ www    │ cname.vercel-dns.com   │ ❌ DNS │
└──────┴────────┴─────────────────────────┴────────┘
```

**MUY IMPORTANTE:** Desactiva el proxy de Cloudflare (nube gris, no naranja)

6. Click **Save**

#### ¿Por qué desactivar el proxy?

```
CON PROXY (❌):
Usuario → Cloudflare → Vercel
        └─ Rompe el SSL de Vercel

SIN PROXY (✅):
Usuario → Vercel
        └─ SSL funciona perfecto
```

---

### PASO 3: Verificar en Vercel

1. Vuelve a Vercel → Settings → Domains
2. Espera 1-5 minutos
3. Debería mostrar:

```
✅ bstabs.com - Valid Configuration
✅ www.bstabs.com - Valid Configuration
```

4. Vercel generará SSL automáticamente (HTTPS)

---

### PASO 4: Esperar propagación DNS

- **Mínimo:** 5-15 minutos
- **Máximo:** 48 horas (raro)
- **Típico:** 1-2 horas

#### Verificar propagación:

**Windows:**
```cmd
nslookup bstabs.com
```

Deberías ver:
```
Name:    bstabs.com
Address: 76.76.21.21
```

**Online:**
- https://www.whatsmydns.net/#A/bstabs.com
- https://dnschecker.org/#A/bstabs.com

---

### PASO 5: Configurar redirecciones en Vercel

1. Vercel → Settings → Domains
2. Configura `www.bstabs.com` para redirigir a `bstabs.com`
3. O viceversa (como prefieras)

Ejemplo: `www.bstabs.com` → `bstabs.com`

---

## 🔧 CONFIGURACIÓN AVANZADA (OPCIONAL)

### Usar Cloudflare con proxy activado

Si quieres aprovechar Cloudflare CDN + protección DDoS:

1. En Cloudflare DNS:
```
Type: CNAME
Name: @
Content: cname.vercel-dns.com
Proxy: ✅ Proxied (nube naranja)
```

2. En Cloudflare → SSL/TLS:
   - Modo: **Full (strict)**

3. En Cloudflare → Page Rules:
   - `http://*bstabs.com/*` → Always Use HTTPS

---

## ✅ CHECKLIST FINAL

- [ ] Dominio agregado en Vercel
- [ ] Registros DNS configurados en Cloudflare
- [ ] Proxy desactivado (nube gris)
- [ ] Esperado 15-30 minutos
- [ ] Verificado con nslookup
- [ ] SSL activo (candado verde en navegador)
- [ ] `https://bstabs.com` funciona
- [ ] `https://www.bstabs.com` funciona

---

## 🚨 PROBLEMAS COMUNES

### Error 1: "Domain is not configured"

**Causa:** DNS aún no propagó

**Solución:**
```bash
# Espera 30 minutos más
# Verifica:
nslookup bstabs.com

# Debe mostrar: 76.76.21.21
```

### Error 2: "SSL Certificate error"

**Causa:** Cloudflare proxy activado

**Solución:**
1. Ve a Cloudflare DNS
2. Click en el registro A de `@`
3. Desactiva proxy (nube gris)
4. Save

### Error 3: "Too many redirects"

**Causa:** Configuración SSL incorrecta

**Solución:**
1. Cloudflare → SSL/TLS
2. Cambiar a **Full** o **Full (strict)**

### Error 4: "Invalid configuration detected"

**Causa:** Registros DNS duplicados

**Solución:**
1. Cloudflare → DNS
2. Elimina TODOS los registros A y CNAME para `@` y `www`
3. Agrega solo los de Vercel

---

## 📊 DESPUÉS DE CONECTAR EL DOMINIO

### URLs finales:

```
https://bstabs.com           ← Principal
https://www.bstabs.com       ← Redirige a principal
https://bstabs.vercel.app    ← También funciona (alias)
```

### Variables de entorno:

Actualiza en Vercel → Settings → Environment Variables:

```
VITE_API_URL=https://bstabs-api.railway.app/api
PRODUCTION_URL=https://bstabs.com
```

Redeploy para aplicar:
```bash
vercel --prod
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Dominio conectado
2. ⏳ Deploy backend en Railway
3. ⏳ Conectar frontend con backend API
4. ⏳ Google Search Console
5. ⏳ Google Analytics

---

**¡Tu sitio estará en https://bstabs.com! 🚀**

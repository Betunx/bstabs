# Opciones de Hosting GRATUITO para Backend

## 🆓 OPCIONES 100% GRATIS

### 1. **Render.com** ⭐ RECOMENDADO
```
✅ Gratis indefinidamente
✅ PostgreSQL incluido (90 días, luego expira pero puedes renovar)
✅ 750 horas/mes (suficiente)
✅ Deploy automático desde GitHub
✅ SSL gratis

⚠️ Desventajas:
- Se "duerme" después de 15 min de inactividad
- Tarda 30-50 segundos en "despertar"
- 512MB RAM (suficiente para tu caso)
```

**¿Es viable para bstabs?**
✅ SÍ, porque:
- Los usuarios esperarán 30s la primera vez
- Luego funciona normal
- Para un sitio nuevo, es perfecto

**Setup:** 10 minutos

---

### 2. **Fly.io**
```
✅ Gratis con límites generosos
✅ 3 VMs pequeñas gratis
✅ 3GB storage persistente gratis
✅ PostgreSQL gratis (pequeño)

⚠️ Desventajas:
- Requiere tarjeta (pero no cobra si no excedes free tier)
- Más complejo de configurar
- CLI requerido
```

**¿Es viable?**
✅ SÍ, si no te importa dar tarjeta (verificación)

---

### 3. **Supabase (Solo Base de Datos)**
```
✅ PostgreSQL gratis
✅ 500MB storage
✅ 2GB transferencia
✅ API REST automática
✅ Backups automáticos

⚠️ Desventajas:
- Solo base de datos, no backend completo
- Necesitas otro servicio para el backend
```

**Combinación:** Supabase (DB) + Render (Backend) = 100% GRATIS

---

### 4. **Railway Trial**
```
✅ $5 USD créditos gratis
✅ Sin tarjeta de crédito
✅ Dura ~1 mes con uso bajo

❌ Desventajas:
- Se acaba el crédito
- Después necesitas pagar
```

**¿Es viable?**
⚠️ Solo temporal (1 mes), luego necesitas pagar

---

### 5. **Vercel Serverless Functions**
```
✅ Gratis
✅ 100GB bandwidth
✅ Funciones ilimitadas

❌ Desventajas:
- NO soporta NestJS completo
- Solo funciones serverless
- No soporta WebSockets
- No tiene PostgreSQL persistente
```

**¿Es viable?**
❌ NO para tu backend NestJS

---

## 🏆 MEJOR OPCIÓN GRATIS: RENDER + SUPABASE

### Stack Recomendado 100% Gratis:

```
┌─────────────────────────────────────┐
│ Frontend: Vercel          (GRATIS)  │
├─────────────────────────────────────┤
│ Backend: Render.com       (GRATIS)  │
├─────────────────────────────────────┤
│ Database: Supabase        (GRATIS)  │
└─────────────────────────────────────┘

Total: $0/mes forever
```

### Pros:
✅ Completamente gratis
✅ Sin tarjeta de crédito
✅ PostgreSQL con 500MB (suficiente para empezar)
✅ Backups automáticos
✅ Deploy automático

### Contras:
⚠️ Backend se duerme (30s para despertar)
⚠️ No es ideal para producción high-traffic

**Veredicto:** Perfecto para lanzar y validar la idea sin gastar nada.

---

## 🔧 SETUP: RENDER (Backend) + SUPABASE (Database)

### PASO 1: Supabase (Database) - 5 min

1. **Crear cuenta:** https://supabase.com
2. **New Project:**
   - Name: bstabs
   - Database Password: (guárdalo)
   - Region: West US
3. **Obtener Connection String:**
   ```
   Project Settings → Database → Connection String

   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. **Copiar y guardar** esta URL

### PASO 2: Render (Backend) - 10 min

1. **Crear cuenta:** https://render.com
2. **New Web Service:**
   - Connect GitHub: Betunx/bstabs
   - Root Directory: `backend/black-sheep-api`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
3. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   DB_SSL=true
   FRONTEND_URL=https://bstabs.com
   ```
4. **Deploy!**

### PASO 3: Conectar Frontend

En Vercel:
```
VITE_API_URL=https://bstabs-api.onrender.com/api
```

**¡Listo! Todo gratis.**

---

## ⚡ PROBLEMA DEL "SLEEP" Y SOLUCIÓN

### ¿Qué es el "sleep"?

Render duerme tu app después de 15 min sin tráfico:

```
Usuario 1 (8:00 AM):
- Entra a bstabs.com
- Click en una canción
- Espera 30 segundos ⏳ (despertando backend)
- ✅ Carga la tablatura
- Navega normal el resto de la sesión

Usuario 2 (8:05 AM) - dentro de 15 min:
- Entra a bstabs.com
- Click en una canción
- ✅ Carga instantáneo (backend despierto)

Usuario 3 (10:00 AM) - 2 horas después:
- Entra a bstabs.com
- Click en una canción
- Espera 30 segundos ⏳ (backend dormido, despertando)
- ✅ Carga la tablatura
```

### Solución: Ping Automático (Keep Alive)

**Cron Job gratis que hace ping cada 14 min:**

Servicios que puedes usar:
- **Cron-job.org** (gratis, sin registro)
- **UptimeRobot** (gratis, monitoreo + ping)

Setup:
```
1. Ve a: https://cron-job.org
2. Create cronjob:
   - URL: https://bstabs-api.onrender.com/api/songs
   - Interval: Every 14 minutes
3. Save
```

Ahora tu backend **NUNCA se duerme** (dentro de horario de oficina).

### Alternativa: Mensaje al usuario

En el frontend, si detectas que tarda:

```typescript
// Mostrar mensaje amigable
"⏳ Cargando datos... (esto puede tardar 30s la primera vez)"
```

---

## 💰 PÁGINA DE DONACIONES - ESTRATEGIA

### Mensaje Honesto y Transparente:

```markdown
## 💝 Apoya Black Sheep Tabs

### ¿Por qué donaciones?

Black Sheep Tabs es **100% gratuito** para todos los músicos.

**Tu donación ayuda a:**
- 💻 **50%** Mantenimiento del servidor y base de datos
- 🎸 **30%** Crear y verificar nuevas tablaturas confiables
- 🚀 **20%** Mejorar la plataforma (nuevas funciones)

### Costos Mensuales:
- Hosting backend: $5/mes (actualmente gratis pero limitado)
- Base de datos: $0 (límite 500MB)
- Dominio: $12/año
- **Meta:** Migrar a servidor más rápido ($5/mes)

### ¿Qué obtienes al donar?
- ❤️ Nuestro eterno agradecimiento
- 🎵 Acceso prioritario a nuevas tablaturas
- 🏆 Tu nombre en la página de "Supporters" (opcional)
- 🎸 Solicitud de canción prioritaria

**Cualquier monto ayuda, desde $1 USD.**

[Donar $1] [Donar $3] [Donar $5] [Otro monto]
```

---

## 📊 COMPARACIÓN FINAL

```
┌─────────────┬──────────┬─────────┬──────────┬─────────┐
│ Opción      │ Costo    │ Rápido  │ Setup    │ Límites │
├─────────────┼──────────┼─────────┼──────────┼─────────┤
│ Render Free │ $0       │ ⚠️ Lento│ Fácil    │ Sleep   │
│ Supabase    │ $0       │ ✅ Rápido│ Fácil   │ 500MB   │
│ Fly.io      │ $0*      │ ✅ Rápido│ Medio   │ Tarjeta │
│ Railway     │ $5/mes   │ ✅ Rápido│ Fácil   │ Ninguno │
│ Heroku      │ $7/mes   │ ✅ Rápido│ Fácil   │ Ninguno │
└─────────────┴──────────┴─────────┴──────────┴─────────┘

* Requiere tarjeta de crédito para verificación
```

---

## 🎯 RECOMENDACIÓN PARA TI

### Plan Inicial (0-3 meses): GRATIS
```
Frontend:  Vercel         ($0)
Backend:   Render Free    ($0)
Database:  Supabase       ($0)
Total: $0/mes

+ Página de donaciones activa
+ Cron job para keep-alive
```

### Cuando tengas donaciones (3+ meses): UPGRADE
```
Frontend:  Vercel         ($0)
Backend:   Railway        ($5/mes) ← Upgrade aquí
Database:  Supabase       ($0 o migrar a Railway)
Total: $5/mes

Beneficios:
✅ Sin sleep
✅ Más rápido
✅ Mejor experiencia
```

---

## 🚀 SIGUIENTE PASO

¿Quieres que te ayude a:

**A)** Setup de Render + Supabase (gratis) paso a paso
**B)** Actualizar la página de donaciones con mensaje transparente
**C)** Cambiar el título de "Black Sheep App" → "BS | Tabs"

¿O los 3? 😊

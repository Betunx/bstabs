# Arquitectura Completa - Black Sheep

## 🎯 Funcionalidades Implementadas

### 1. Editor de Tablaturas (Admin Only)

**Componente:** `TabEditor`
**Ruta:** `/admin/tab-editor`

**Características:**
- Click en letra → agrega acorde en esa posición exacta
- Preview en tiempo real
- Guarda posición de caracteres automáticamente
- Solo accesible para usuarios con rol `admin`

**Flujo:**
```
1. Admin escribe letra: "Pero esa luna es mi condena"
2. Click en posición 0 → prompt "Acorde: E"
3. Click en posición 14 → prompt "Acorde: D"
4. Sistema guarda: { chord: "E", position: 0 }, { chord: "D", position: 14 }
5. Preview muestra acordes perfectamente alineados
```

### 2. Sistema de Autenticación

**Modelos:**
- `User` (id, username, email, role: user|admin)
- `AuthResponse` (user, token JWT)

**Endpoints Backend (TODO):**
```typescript
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me (requiere token)
```

**Guards:**
- `AuthGuard` - Verifica token válido
- `AdminGuard` - Verifica rol admin

### 3. Solicitudes de Canciones

**Solo usuarios autenticados**

**Modelo:** `SongRequest`
```typescript
{
  userId: string;
  songTitle: string;
  artist: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed'
}
```

**Moderación de Contenido:**
```typescript
ContentModerationService.moderateContent(text)
→ Verifica palabras ofensivas
→ Detecta discurso de odio
→ Bloquea spam
→ Retorna: { isValid, reason, flaggedWords }
```

**Palabras bloqueadas:**
- Ofensivas (español/inglés)
- Discurso de odio
- Spam (caracteres/palabras repetidas)

### 4. Sistema de Donaciones

**Modelo:** `Donation`
```typescript
{
  userId?: string;
  username?: string;  // Solo si isPublic = true
  amount: number;
  currency: string;
  isPublic: boolean;      // Usuario decide si aparecer
  showAmount: boolean;    // Usuario decide si mostrar cantidad
  message?: string;
  createdAt: Date;
}
```

**Página /donate:**
- Lista pública de donadores (solo si aceptaron)
- Opciones de privacidad:
  - ☑ Aparecer en lista pública
  - ☑ Mostrar cantidad donada
- Integración PayPal
- Mensaje de agradecimiento opcional

**Ejemplo de visualización:**
```
Donadores Recientes:

✨ JuanGuitarrista - $10 USD
   "Gracias por Emma! 🎸"

✨ AnaMúsica - [Cantidad oculta]
   "Excelente proyecto"

✨ [Anónimo] - $5 USD
```

## 🔐 Roles y Permisos

### Usuario Regular (user)
- ✅ Ver tablaturas
- ✅ Crear cuenta
- ✅ Solicitar canciones (con moderación)
- ✅ Donar
- ❌ Crear/editar tablaturas

### Administrador (admin)
- ✅ Todo lo de usuario regular
- ✅ Crear/editar tablaturas con editor visual
- ✅ Aprobar/rechazar solicitudes
- ✅ Moderar contenido
- ✅ Ver todas las donaciones

## 📊 Base de Datos (PostgreSQL)

### Tablas

```sql
users:
- id (UUID)
- username (unique)
- email (unique)
- password_hash
- role (user|admin)
- is_active
- created_at

songs:
- id (UUID)
- title
- artist
- key, tempo, time_signature, tuning, difficulty
- story
- sections (JSONB)
- created_by (FK users.id)
- created_at, updated_at

song_requests:
- id (UUID)
- user_id (FK users.id)
- song_title
- artist
- message
- status (pending|approved|rejected|completed)
- rejection_reason
- created_at, updated_at

donations:
- id (UUID)
- user_id (FK users.id, nullable para anónimos)
- amount
- currency
- message
- is_public
- show_amount
- paypal_order_id
- created_at
```

## 🛣️ Rutas

### Públicas
```
/ → Home
/songs → Lista de canciones
/songs/:id → Ver tablatura
/artists → Lista de artistas
/tutorials → Tutoriales recientes
/contact → Contacto
/donate → Donaciones
```

### Requieren Autenticación
```
/request-song → Solicitar canción
/profile → Perfil de usuario
```

### Solo Admin
```
/admin/tab-editor → Editor de tablaturas
/admin/requests → Gestionar solicitudes
/admin/donations → Ver todas las donaciones
```

## 🔧 Servicios Clave

### ContentModerationService
```typescript
moderateContent(text: string): ModerationResult
- Valida palabras ofensivas
- Detecta hate speech
- Previene spam
- Retorna razón del rechazo
```

### ThemeService
```typescript
- 4 temas (light, dark, night, oled)
- Persistencia en localStorage
- CSS variables
```

### AuthService (TODO - Backend)
```typescript
register(data: RegisterRequest)
login(data: LoginRequest)
logout()
getCurrentUser()
```

## 🎨 Flujo de Usuario Completo

### Nuevo Usuario
```
1. Entra a bstabs.com
2. Ve tablaturas sin registrarse
3. Click en "Pedir Canción" → Redirect a registro
4. Crea cuenta (username, email, password)
5. Ahora puede solicitar canciones
6. Mensaje moderado antes de enviar
7. Si pasa moderación → Solicitud enviada
8. Admin la aprueba/rechaza
9. Usuario recibe notificación
```

### Usuario Dona
```
1. Click en botón dorado "D"
2. Página /donate
3. Checkbox: ☑ Aparecer públicamente
4. Checkbox: ☑ Mostrar cantidad
5. Mensaje opcional (moderado)
6. PayPal integration
7. Confirmación → Aparece en lista (si aceptó)
```

### Admin Crea Tab
```
1. Login como admin
2. /admin/tab-editor
3. Llena metadata (título, artista, etc.)
4. Agrega sección "Intro"
5. Escribe letra: "Pero esa luna..."
6. Click en letra posición 0 → Acorde "E"
7. Click posición 14 → Acorde "D"
8. Preview → Acordes perfectamente alineados
9. Guarda → POST /api/songs
10. Tab visible para todos
```

## 📱 Próximos Pasos

1. Backend NestJS (mañana)
2. JWT authentication
3. PostgreSQL entities
4. API endpoints
5. PayPal integration
6. Deploy

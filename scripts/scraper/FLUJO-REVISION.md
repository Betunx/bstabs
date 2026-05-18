# 📋 Flujo de Revisión de Canciones

> Sistema completo para importar, revisar y publicar canciones extraídas de Espíritu Guitarrista

## 🎯 Flujo Recomendado

```
1. OCR Procesado ✅ (COMPLETADO)
   ↓
2. Importar como DRAFT
   ↓
3. Revisar en Admin (bstabs.pages.dev/admin)
   ↓
4. Editar/Corregir según sea necesario
   ↓
5. Publicar individualmente o en batch
```

---

## 📥 Paso 1: Importar como DRAFT

### Comando

```bash
cd scripts/scraper

# Preview (no importa nada)
node tools/3-import/ocr-importer.js --dry-run

# Importar real
set ADMIN_API_KEY=tu_clave_aqui
node tools/3-import/ocr-importer.js
```

### ¿Qué hace?

- ✅ Lee los 102 archivos JSON de OCR
- ✅ Convierte a formato `Song`
- ✅ Asigna **status: 'draft'** automáticamente
- ✅ Intenta adivinar el género basado en el artista
- ✅ Agrega nota indicando que requiere revisión
- ✅ Importa a la base de datos vía API

### Resultado

- 102 canciones en la BD con `status='draft'`
- **NO visibles** en bstabs.com (solo en admin)
- Listas para revisión

---

## 🔍 Paso 2: Revisar en Admin

### URL

**https://bstabs.pages.dev/admin**

### Funcionalidades Actuales

#### Ver Borradores

```typescript
// Endpoint
GET /admin/tabs?status=draft

// Respuesta
{
  "songs": [...],
  "total": 102,
  "limit": 100,
  "offset": 0
}
```

#### Ver Canción Individual

```typescript
// Como admin puedes ver drafts
GET /admin/tabs/:id
```

#### Editar Canción

```typescript
PUT /songs/:id
{
  "title": "Título Corregido",
  "artist": "Artista",
  "genre": "Rock",
  "sections": [...]
}
```

---

## ✏️ Paso 3: Editar/Corregir

### Correcciones Comunes

1. **Texto mal reconocido por OCR**
   - Revisar acordes: `E`, `Am`, `C`, `G`, etc.
   - Verificar letras
   - Corregir símbolos especiales

2. **Información faltante**
   - Agregar género correcto
   - Agregar tonalidad (key)
   - Agregar tempo si está disponible
   - Links a Spotify/YouTube

3. **Estructura de secciones**
   - Separar intro/verso/coro
   - Agregar nombres descriptivos
   - Eliminar secciones vacías

### Ejemplo de Corrección

**Antes (OCR crudo):**
```
E — O.
Sa
E
```

**Después (corregido):**
```
E  A  D  A
Salvaje corazón
E  A  D  A
Sin miedo a nada
```

---

## 🚀 Paso 4: Publicar

### Opción A: Publicar Individual

```bash
# Endpoint
POST /songs/:id/publish

# Resultado
{
  "id": "...",
  "status": "published",
  ...
}
```

### Opción B: Publicar en Batch

```bash
# Endpoint
POST /admin/tabs/publish-batch

# Body
{
  "ids": [
    "cancion-id-1",
    "cancion-id-2",
    "cancion-id-3"
  ]
}

# Resultado
{
  "message": "3 songs published",
  "songs": [...]
}
```

### Opción C: Script de Publicación Masiva

```bash
# Publicar todas las revisadas
node tools/3-import/publish-reviewed.js
```

---

## 📊 Estados de Canciones

| Estado | Descripción | Visible en producción |
|--------|-------------|----------------------|
| `draft` | Borrador recién importado, requiere revisión | ❌ No |
| `pending` | Pendiente de aprobación | ❌ No |
| `published` | Publicada y lista | ✅ Sí |
| `archived` | Archivada (oculta pero no eliminada) | ❌ No |

---

## 🛠️ Herramientas Disponibles

### 1. Importador OCR → DRAFT

**Archivo:** `tools/3-import/ocr-importer.js`

**Uso:**
```bash
node ocr-importer.js [--dry-run]
```

**Features:**
- Importa 102 canciones como DRAFT
- Asigna género automáticamente
- Detecta secciones (requinto, lyrics, chords)
- Agrega metadata de origen

### 2. API Endpoints

**Ver Borradores:**
```bash
curl -H "x-api-key: TU_KEY" \
  "https://blacksheep-api.bstabs.workers.dev/admin/tabs?status=draft"
```

**Publicar Individual:**
```bash
curl -X POST \
  -H "x-api-key: TU_KEY" \
  "https://blacksheep-api.bstabs.workers.dev/songs/ID/publish"
```

**Publicar Batch:**
```bash
curl -X POST \
  -H "x-api-key: TU_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ids":["id1","id2","id3"]}' \
  "https://blacksheep-api.bstabs.workers.dev/admin/tabs/publish-batch"
```

### 3. Panel Admin (Próximamente)

Funcionalidades planeadas:
- 📋 Lista de borradores con filtros
- ✏️ Editor inline para correcciones rápidas
- 🔍 Vista previa antes de publicar
- ✅ Checkbox para selección múltiple
- 🚀 Botón "Publicar seleccionados"

---

## 📝 Checklist de Revisión

Antes de publicar una canción, verifica:

- [ ] **Título** correctamente capitalizado
- [ ] **Artista** sin errores de OCR
- [ ] **Género** asignado correctamente
- [ ] **Secciones** bien separadas y nombradas
- [ ] **Acordes** correctos (E, Am, C, G, etc.)
- [ ] **Letra** sin errores de OCR
- [ ] **Tablatura** legible (si tiene requinto)
- [ ] **Story/Nota** con información útil
- [ ] **Links** opcionales (Spotify/YouTube)

---

## 🎓 Ejemplo Completo

### 1. Importar

```bash
set ADMIN_API_KEY=BsT@bs_4dm1n_k3y_2025
cd scripts/scraper
node tools/3-import/ocr-importer.js
```

**Output:**
```
📥 OCR Importer - Espíritu Guitarrista
✅ Encontrados 102 archivos JSON
📤 Estado de importación: DRAFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/102] black-sabbath - paranoid.json
   ✓ Importada como DRAFT (2 secciones, género: Rock)

[2/102] bon-jovi - como-yo-nadie-te-ha-amado.json
   ✓ Importada como DRAFT (2 secciones, género: Rock)

...

✅ IMPORTACIÓN COMPLETADA
   Total: 102
   Importadas: 102
   Fallidas: 0
```

### 2. Revisar en Admin

1. Ir a https://bstabs.pages.dev/admin
2. Filtrar por `status: draft`
3. Ver lista de 102 canciones
4. Hacer clic en una para editar

### 3. Editar

Correcciones en el editor:
- Título: "Paranoid" ✅
- Artista: "Black Sabbath" ✅
- Género: Rock ✅
- Sección 1: Requinto (tablatura)
- Sección 2: Letra con acordes

### 4. Publicar

- Botón "Publicar" individual
- O seleccionar múltiples y "Publicar seleccionados"

### 5. Verificar

- Ir a https://www.bstabs.com/
- Buscar "Paranoid"
- ✅ Aparece en resultados públicos

---

## 🔐 Seguridad

- ✅ Todos los endpoints admin requieren `x-api-key`
- ✅ Borradores NO son públicos (solo con API key)
- ✅ Solo la rama `admin` tiene acceso al panel
- ✅ Producción (`main`) NO muestra borradores

---

## 💡 Tips

1. **Revisa por lotes** - Agrupa por artista o género
2. **Usa el editor admin** - Más rápido que editar JSON
3. **Publica en batch** - Selecciona las revisadas y publica todas juntas
4. **Mantén logs** - Guarda registro de qué canciones necesitan más trabajo

---

## 📞 Próximos Pasos

1. ✅ Importar las 102 canciones como DRAFT
2. ⏳ Crear interfaz de revisión en admin
3. ⏳ Revisar y corregir canciones
4. ⏳ Publicar las que estén listas
5. ⏳ Mantener un proceso continuo de mejora

---

**¿Listo para empezar?**

```bash
# Paso 1: Importar
node tools/3-import/ocr-importer.js --dry-run  # Preview
node tools/3-import/ocr-importer.js             # Real

# Paso 2: Deploy backend con nuevos endpoints
cd ../../backend-workers
npx wrangler deploy

# Paso 3: Revisar en admin
# https://bstabs.pages.dev/admin
```

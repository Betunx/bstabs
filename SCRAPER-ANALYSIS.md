# Análisis de Problemas en Scraping - BS Tabs

## 📊 Resumen Ejecutivo

**Total de canciones:** 518
**Canciones con errores identificadas:** 4
**Grupos duplicados:** 28 (afectan a ~60 canciones)
**Fuente principal:** cifraclub.com.br (516/518 = 99.6%)

---

## 🔴 Problemas Identificados

### 1. **HTML de Navegación Capturado** (Crítico)

**Canciones afectadas:**
- `d1861472-d352-4895-b590-01e791df2566` - Nothing Else Matters (Metallica)
- `185fec3d-9afb-44eb-a2e1-673ae08104ab` - "5" (Desconocido)

**Problema:**
```html
<!-- En vez de contenido de la canción, se captura: -->
<span data-type="n">Notificações</span>
<span data-type="f"><a href="#">Solicitações pendentes</a></span>
```

**Causa raíz:**
```javascript
// tab-scraper-v2.js:172
const pattern = /<pre class="[^"]*cifra[^"]*"[^>]*>(.*?)<\/pre>/gs;
```
Este patrón es **demasiado amplio** y captura:
- Headers del sitio que usan `<pre>`
- Elementos de navegación dentro de `<pre>`
- Popups y notificaciones

**Impacto:** Display completamente roto, contenido inútil

---

### 2. **HTML Entities No Decodificadas** (Alto)

**Canciones afectadas:**
- `f1ac67ae-242c-41f1-a182-8d2db5da5c83` - Don't Stop Me Now (Queen)

**Problema:**
```
Título guardado: "Don&#39;t Stop Me Now"
Título esperado: "Don't Stop Me Now"
```

**Causa raíz:**
No hay decodificación de HTML entities en el proceso de scraping. El código actual solo limpia HTML tags pero no decodifica entities como:
- `&#39;` → `'`
- `&quot;` → `"`
- `&amp;` → `&`

**Impacto:** Títulos feos en el UI

---

### 3. **Canciones Duplicadas** (Medio-Alto)

**Estadísticas:**
- 28 grupos de canciones duplicadas
- Algunos con hasta 4 copias (ej: Wonderwall tiene 4 versiones)
- Todas de la misma fuente (cifraclub.com.br)

**Ejemplos:**
```
Wonderwall (Oasis) - 4 copias
Stairway to Heaven (Led Zeppelin) - 3 copias
Nothing Else Matters (Metallica) - 2 copias (una está rota)
```

**Causa raíz:**
- No hay validación de duplicados en `tab-scraper-v2.js`
- No hay chequeo en la base de datos antes de insertar
- El script probablemente scrapeó la misma canción múltiples veces

**Impacto:**
- Base de datos inflada
- Confusión para usuarios (múltiples versiones)
- Desperdicio de storage

---

### 4. **Metadata Incompleta**

**Problema:** La canción `185fec3d-9afb-44eb-a2e1-673ae08104ab` tiene:
```json
{
  "title": "5",
  "artist": "Desconocido"
}
```

Esto indica que el scraper no pudo extraer el título/artista correctamente.

---

## ✅ Soluciones Propuestas

### **Fix 1: Mejorar Selectores CSS** (Prioridad ALTA)

**Problema actual:**
```javascript
// Demasiado genérico
/<pre class="[^"]*cifra[^"]*"[^>]*>(.*?)<\/pre>/gs
```

**Solución:**
```javascript
// Selectores más específicos para CifraClub
const cifraClubPatterns = [
  // Selector principal (más específico)
  /<pre[^>]*class="[^"]*cifra_cnt[^"]*"[^>]*>(.*?)<\/pre>/gs,

  // Backup: buscar pre dentro de div específico
  /<div[^>]*class="[^"]*tablatura[^"]*"[^>]*>.*?<pre[^>]*>(.*?)<\/pre>/gs,

  // Último recurso: excluir elementos de navegación
  /<pre(?![^>]*class="[^"]*nav|menu|header|notification)[^>]*>(.*?)<\/pre>/gs
];
```

**Validación adicional:**
```javascript
function isValidContent(content) {
  // Rechazar si contiene HTML de navegación
  const navKeywords = [
    'notificações', 'pendentes', 'menu',
    'login', 'cadastro', 'perfil'
  ];

  const lowerContent = content.toLowerCase();
  return !navKeywords.some(kw => lowerContent.includes(kw));
}
```

---

### **Fix 2: Decodificar HTML Entities** (Prioridad ALTA)

**Agregar función de decodificación:**
```javascript
function decodeHTMLEntities(text) {
  const entities = {
    '&#39;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&apos;': "'"
  };

  let decoded = text;

  // Reemplazar entidades nombradas
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  // Reemplazar entidades numéricas (&#NNNN;)
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });

  // Reemplazar entidades hex (&#xHHHH;)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return decoded;
}
```

**Aplicar en extracción de metadata:**
```javascript
extractMetadata(html, url, type) {
  // ... código existente ...

  return {
    title: decodeHTMLEntities(title),
    artist: decodeHTMLEntities(artist),
    // ... resto de metadata ...
  };
}
```

---

### **Fix 3: Prevenir Duplicados** (Prioridad MEDIA)

**Opción A: Validar antes de scraping**
```javascript
async scrapeURL(url) {
  // 1. Extraer metadata primero
  const metadata = await this.extractMetadataOnly(url);

  // 2. Checkear en base de datos
  const exists = await this.checkIfExists(metadata.title, metadata.artist);

  if (exists) {
    console.log(`⚠️  Ya existe: ${metadata.title} - ${metadata.artist}`);
    return { skipped: true, reason: 'duplicate' };
  }

  // 3. Proceder con scraping completo
  return await this.extractFull(url);
}
```

**Opción B: Deduplicar en batch import**
```javascript
async function batchImport(songs) {
  // Agrupar por title + artist
  const seen = new Set();
  const unique = [];

  for (const song of songs) {
    const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(song);
    } else {
      console.log(`⚠️  Duplicado omitido: ${song.title}`);
    }
  }

  console.log(`Original: ${songs.length}, Únicos: ${unique.length}`);
  return unique;
}
```

---

### **Fix 4: Mejorar Extracción de Metadata**

**Problema:** Algunos sitios tienen estructura diferente

**Solución:** Múltiples estrategias de fallback
```javascript
extractMetadata(html, url, type) {
  let title = '';
  let artist = '';

  // Estrategia 1: Meta tags
  const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
  if (titleMatch) {
    // Parse "Canción - Artista" format
    const parts = titleMatch[1].split('-').map(s => s.trim());
    title = parts[0];
    artist = parts[1] || '';
  }

  // Estrategia 2: <h1> tags
  if (!title) {
    const h1Match = html.match(/<h1[^>]*>([^<]+)</i);
    if (h1Match) title = h1Match[1].trim();
  }

  // Estrategia 3: URL parsing
  if (!title || !artist) {
    // Ejemplo: /metallica/nothing-else-matters/
    const urlParts = url.split('/').filter(Boolean);
    if (urlParts.length >= 2) {
      artist = artist || urlParts[urlParts.length - 2];
      title = title || urlParts[urlParts.length - 1].replace(/-/g, ' ');
    }
  }

  // Validar que no sean valores dummy
  if (title.toLowerCase().match(/^\d+$/) || title === '') {
    console.warn('⚠️  Título inválido detectado');
  }

  return {
    title: decodeHTMLEntities(title),
    artist: decodeHTMLEntities(artist || 'Desconocido')
  };
}
```

---

## 🎯 Plan de Acción Recomendado

### **Fase 1: Fixes Críticos (AHORA)**

1. ✅ Agregar decodificación HTML entities
2. ✅ Mejorar selectores CSS para cifraclub
3. ✅ Agregar validación de contenido (rechazar nav/headers)

### **Fase 2: Limpieza de DB (Próximo Deploy)**

1. Identificar y eliminar duplicados
2. Corregir canciones con títulos rotos
3. Re-scrapear las 4 canciones problemáticas

### **Fase 3: Prevención (Antes del Siguiente Scraping)**

1. Implementar check de duplicados
2. Mejorar extracción de metadata con fallbacks
3. Agregar tests unitarios para validar contenido

---

## 📝 Checklist Pre-Deploy

Antes del próximo scraping/import, verificar:

- [ ] Selector CSS específico para cada sitio
- [ ] Decodificación de HTML entities funcionando
- [ ] Validación de contenido (rechazar nav/headers)
- [ ] Check de duplicados activo
- [ ] Metadata extraction con fallbacks
- [ ] Test con 5-10 URLs antes de batch
- [ ] Logging detallado para debug

---

## 🔧 Scripts de Utilidad

### Limpiar duplicados de la DB:
```sql
-- Encontrar duplicados
WITH duplicates AS (
  SELECT
    id,
    title,
    artist,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(title), LOWER(artist)
      ORDER BY created_at ASC
    ) as rn
  FROM songs
)
-- Mantener solo el primero
DELETE FROM songs
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
```

### Corregir HTML entities en títulos:
```sql
UPDATE songs
SET title = REPLACE(
  REPLACE(
    REPLACE(title, '&#39;', ''''),
    '&quot;', '"'),
  '&amp;', '&'
)
WHERE title LIKE '%&#%' OR title LIKE '%&%;%';
```

---

## 📚 Referencias

**URLs de canciones problemáticas:**
- https://www.bstabs.com/tab/d1861472-d352-4895-b590-01e791df2566
- https://www.bstabs.com/tab/185fec3d-9afb-44eb-a2e1-673ae08104ab
- https://www.bstabs.com/tab/d80005e8-5cbe-42cc-a528-bfb08b9b9829
- https://www.bstabs.com/tab/f1ac67ae-242c-41f1-a182-8d2db5da5c83

**Archivos relevantes:**
- `scripts/scraper/tab-scraper-v2.js` - Scraper principal
- `scripts/analyze-songs.js` - Script de análisis
- `backend-workers/src/index.ts` - API endpoints

---

**Generado:** 2025-12-29
**Versión:** 1.0

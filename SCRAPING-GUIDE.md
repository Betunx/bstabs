# Guía Completa de Scraping de Tablaturas

## 🎯 Objetivo
Extraer tablaturas de sitios web y tenerlas en tu base de datos para revisarlas y publicarlas.

---

## 📚 CÓMO FUNCIONA EL SCRAPER

### 1. Anatomía de una Tablatura Web

Cuando ves una tab en una página web, el HTML se ve así:

```html
<!-- MUCHA BASURA -->
<div class="ads">Anuncios...</div>
<script>tracking...</script>

<!-- ESTO ES LO QUE QUEREMOS -->
<pre class="cifra">
    C              G
Cuando despierto por las mañanas
       Am           F
Y veo tu rostro al despertar
</pre>

<!-- MÁS BASURA -->
<div class="ads">Más anuncios...</div>
```

**El scraper extrae SOLO el `<pre>` con los acordes y letra.**

### 2. ¿Qué hace el scraper?

```javascript
// 1. Va a la URL
const html = await fetch('https://cifraclub.com/song');

// 2. Busca el contenido musical
const content = html.match(/<pre class="cifra">(.*?)<\/pre>/);

// 3. Limpia basura
content = content.replace(/<script>.*<\/script>/, '');
content = content.replace(/style=".*?"/, '');

// 4. Detecta acordes
const chords = content.match(/\b[A-G][#b]?m?\b/g);
// Resultado: ["C", "G", "Am", "F"]

// 5. Guarda JSON
{
  "title": "Canción",
  "artist": "Artista",
  "content": "C    G\nLetra...",
  "chords": ["C", "G", "Am", "F"],
  "status": "pending"
}
```

---

## 🚀 USAR EL SCRAPER - PASO A PASO

### PASO 1: Encuentra las URLs de las tabs que quieres

Ve a sitios como:
- https://www.cifraclub.com.br
- https://www.ultimate-guitar.com
- https://www.e-chords.com

Copia las URLs. Ejemplo:
```
https://www.cifraclub.com.br/the-beatles/let-it-be/
https://www.cifraclub.com.br/the-beatles/hey-jude/
```

### PASO 2: Agrégalas al archivo urls.txt

Abre: `C:\Users\Humbe\Documents\Chamba\blackSheep\scripts\scraper\urls.txt`

```txt
# Tabs para extraer
https://www.cifraclub.com.br/the-beatles/let-it-be/
https://www.cifraclub.com.br/the-beatles/hey-jude/
https://www.cifraclub.com.br/nirvana/smells-like-teen-spirit/
```

### PASO 3: Ejecuta el scraper

```bash
cd C:\Users\Humbe\Documents\Chamba\blackSheep\scripts\scraper

# Extraer UNA sola tab (para probar)
node tab-scraper.js "https://www.cifraclub.com.br/the-beatles/let-it-be/" cifraclub

# Extraer TODAS las del archivo urls.txt
node tab-scraper.js --batch urls.txt
```

### PASO 4: Revisa los archivos extraídos

Se guardan en: `scripts/scraper/extracted-tabs/`

```
extracted-tabs/
├── tab-1703012345678.json
├── tab-1703012345679.json
├── tab-1703012345680.json
└── batch-summary.json
```

Abre uno para verificar:
```json
{
  "title": "Let It Be",
  "artist": "The Beatles",
  "sourceUrl": "https://...",
  "extractedAt": "2025-12-22T...",
  "content": "<pre>C G Am F\nWhen I find myself...</pre>",
  "chords": ["C", "G", "Am", "F"],
  "status": "pending"
}
```

### PASO 5: Importa a la base de datos

**OPCIÓN A: Backend local**
```bash
# Primero corre tu backend
cd backend/black-sheep-api
npm run start:dev
# Espera a que diga: "🚀 Application is running on: http://localhost:3000"

# En otra terminal:
cd scripts/scraper
node import-to-db.js http://localhost:3000
```

**OPCIÓN B: Backend en producción**
```bash
cd scripts/scraper
node import-to-db.js https://tu-backend.railway.app
```

### PASO 6: Verifica en la base de datos

Las tabs se guardaron con `status: "pending"`.

Puedes verlas con:
```bash
# API
curl http://localhost:3000/api/songs?status=pending

# O desde tu panel admin (cuando esté listo)
```

---

## 🎸 WORKFLOW COMPLETO (TU DÍA A DÍA)

### 1. RECOLECCIÓN (1 vez por semana)
```bash
# Buscas tabs en internet
# Copias URLs a urls.txt
# Ejecutas scraper
node tab-scraper.js --batch urls.txt
```

### 2. IMPORTACIÓN (automática)
```bash
# Subes a DB
node import-to-db.js https://tu-backend.railway.app
```

### 3. REVISIÓN (cuando tengas tiempo)
```
- Entras al panel admin
- Ves lista de tabs "pending"
- Abres una
- Verificas con tu bajo
- Ajustas letra/acordes si es necesario
- Click "Publicar"
```

### 4. PUBLICACIÓN (instantánea)
```
- La tab cambia de "pending" → "published"
- Aparece en tu sitio público
- Los usuarios la pueden ver
```

---

## 🔍 SITIOS COMPATIBLES

### ✅ Probados:
- **Cifra Club** (Brasil) - `siteName: 'cifraclub'`
- **Ultimate Guitar** - `siteName: 'ultimateGuitar'`
- **Genérico** - Cualquier sitio con `<pre>` tags

### 🛠️ Agregar nuevo sitio:

Si quieres scrapear otro sitio, edita `tab-scraper.js`:

```javascript
const patterns = {
  cifraclub: /<pre class="[^"]*cifra[^"]*"[^>]*>(.*?)<\/pre>/gs,
  ultimateGuitar: /<pre[^>]*class="[^"]*js-tab-content[^"]*"[^>]*>(.*?)<\/pre>/gs,

  // AGREGAR NUEVO SITIO:
  tuSitio: /<div class="tab-content">(.*?)<\/div>/gs,

  generic: /<pre[^>]*>(.*?)<\/pre>/gs
};
```

### Cómo encontrar el patrón:
1. Ve a la página de la tab
2. F12 (inspeccionar elemento)
3. Busca el contenido de acordes/letra
4. Anota el tag y clase
5. Agrégalo al patrón

---

## ⚠️ LIMITACIONES Y CONSIDERACIONES

### Legal:
- ✅ Uso personal: OK
- ✅ Educativo: OK
- ❌ Revender tabs: NO
- ⚠️ Publicar masivamente: Zona gris

**Recomendación:** Usa para aprender y practicar. Si publicas, da crédito.

### Técnicas:
- **Rate limiting:** El scraper espera 2 segundos entre requests para no sobrecargar
- **Detección:** Algunos sitios bloquean bots. Solución: usar proxies o headers
- **Cambios en HTML:** Si el sitio cambia su estructura, debes actualizar el patrón

### Errores comunes:

**Error 1: "No se encontró contenido"**
```bash
# Solución: El sitio usa estructura diferente
# Inspecciona y ajusta el patrón
node tab-scraper.js "URL" generic
```

**Error 2: "Connection refused"**
```bash
# Solución: Verifica que el backend esté corriendo
cd backend/black-sheep-api
npm run start:dev
```

**Error 3: "Invalid JSON"**
```bash
# Solución: El HTML tiene caracteres especiales
# El scraper debería manejar esto, reporta el bug
```

---

## 🎓 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Extraer una sola tab para probar

```bash
cd scripts/scraper

# Prueba con Let It Be
node tab-scraper.js "https://www.cifraclub.com.br/the-beatles/let-it-be/" cifraclub

# Verifica el JSON generado
cat extracted-tabs/tab-*.json
```

### Ejemplo 2: Extraer tus 10 canciones favoritas

```bash
# 1. Edita urls.txt
nano urls.txt

# Agrega:
https://www.cifraclub.com.br/song1
https://www.cifraclub.com.br/song2
...
https://www.cifraclub.com.br/song10

# 2. Extrae todo
node tab-scraper.js --batch urls.txt

# 3. Revisa el resumen
cat extracted-tabs/batch-summary.json
```

### Ejemplo 3: Workflow completo de producción

```bash
# DOMINGO - Recolectas URLs
# Agregas 50 URLs a urls.txt

# LUNES - Extraes tabs
node tab-scraper.js --batch urls.txt
# Resultado: 50 JSONs en extracted-tabs/

# LUNES - Importas a DB
node import-to-db.js https://bstabs-api.railway.app
# Resultado: 50 tabs con status "pending"

# MARTES-VIERNES - Revisas 10 tabs por día
# Entras al panel admin
# Verificas con bajo
# Publicas las que están bien

# SÁBADO - Tienes 50 tabs nuevas publicadas
```

---

## 🔮 MEJORAS FUTURAS

Ideas para expandir el scraper:

### 1. Scraper automático programado
```javascript
// Cron job que corre cada domingo
cron.schedule('0 0 * * 0', () => {
  scraper.scrapeBatch('urls.txt');
  importer.importBatch();
});
```

### 2. YouTube video detector
```javascript
// Detecta si la tab tiene video de YouTube
const youtubeUrl = html.match(/youtube\.com\/watch\?v=([^"]+)/);
song.videoUrl = youtubeUrl;
```

### 3. Dificultad automática
```javascript
// Detecta complejidad de acordes
const difficulty = calculateDifficulty(chords);
// Fácil: C, G, Am, F
// Difícil: Gmaj7/B, F#m7b5
```

### 4. Transposición automática
```javascript
// Detecta tonalidad y ofrece transponer
const key = detectKey(chords);
const transposed = transpose(song, +2); // Subir 2 semitonos
```

---

## 📞 AYUDA Y DEBUGGING

### Logs del scraper:
```
🎵 Extrayendo: https://...
✅ Guardado en: extracted-tabs/tab-123.json
📊 Acordes detectados: C, G, Am, F

📦 Resumen:
   Total archivos: 10
   Importados: 8
   Fallidos: 2
```

### Si algo falla:
1. Lee el error
2. Verifica que el backend esté corriendo
3. Revisa que las URLs sean válidas
4. Inspecciona el HTML de la página
5. Ajusta el patrón si es necesario

---

**¡Listo para empezar a scrapear! 🎸**

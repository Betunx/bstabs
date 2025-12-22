# 🎸 Guía Completa de Scraping - Black Sheep Tabs

## 🆕 NUEVO: Soporte para PDFs

El scraper ahora puede extraer tablaturas desde:
- ✅ **HTML** (CifraClub, AcordesWeb, Ultimate Guitar, etc.)
- ✅ **PDF** (URLs de PDFs o archivos locales)
- ✅ **Batch** (procesar múltiples URLs de una vez)

---

## 🚀 Inicio Rápido

### Instalación

```bash
cd scripts/scraper
npm install
```

Dependencias instaladas:
- `pdf-parse`: Para extraer texto de PDFs

### Uso Básico

```bash
# Una URL de PDF
node tab-scraper-v2.js "https://acordesweb.com/descarga-pdf/artista/cancion/0/0/0.pdf"

# Una URL de HTML
node tab-scraper-v2.js "https://cifraclub.com.br/artista/cancion/"

# Un archivo PDF local
node tab-scraper-v2.js "./mi-tablatura.pdf"

# Batch (múltiples URLs)
node tab-scraper-v2.js --batch urls-ejemplo.txt
```

---

## 📋 Preparar URLs para Scraping

### 1. Crear archivo de URLs

Crea un archivo de texto (ej: `mis-canciones.txt`):

```txt
# Canciones de Natanael Cano
https://acordesweb.com/descarga-pdf/natanael-cano/viejo-lobo-ft-luis-r-conriquez/0/0/0.pdf
https://acordesweb.com/descarga-pdf/natanael-cano/amor-tumbado/0/0/0.pdf

# Canciones de Peso Pluma
https://acordesweb.com/descarga-pdf/peso-pluma/ella-baila-sola/0/0/0.pdf

# Archivos locales
./descargas/mi-cancion.pdf
```

**Notas importantes**:
- Líneas con `#` son comentarios (ignoradas)
- Soporta URLs HTTP/HTTPS y rutas de archivos locales
- Una URL o archivo por línea

### 2. Ejecutar batch

```bash
node tab-scraper-v2.js --batch mis-canciones.txt
```

### 3. Resultados

Los archivos extraídos se guardan en:
```
scripts/scraper/extracted-tabs/
├── viejo-lobo-ft-luis-r-conriquez-1234567890.json
├── amor-tumbado-1234567891.json
├── ella-baila-sola-1234567892.json
└── batch-summary.json
```

---

## 📄 Formato de Salida (JSON)

### Ejemplo extraído de PDF:

```json
{
  "title": "Viejo Lobo",
  "artist": "Natanael Cano ft Luis R Conriquez",
  "sourceUrl": "https://acordesweb.com/descarga-pdf/...",
  "sourceType": "pdf",
  "extractedAt": "2025-12-22T...",
  "status": "pending",
  "chords": ["Am", "G", "F", "C", "Dm", "E7"],
  "sections": [
    {
      "name": "Intro",
      "lines": [
        "Am        G",
        "En la sierra nací..."
      ]
    },
    {
      "name": "Verso 1",
      "lines": [
        "Am             G",
        "Viejo lobo me dicen por ahí",
        "        F              C",
        "Porque nunca me dejo agarrar"
      ]
    }
  ],
  "rawText": "Intro\nAm G\nEn la sierra nací..."
}
```

### Campos explicados:

- **title**: Título de la canción (extraído de URL o contenido)
- **artist**: Artista (extraído de URL o metadata)
- **sourceUrl**: URL de donde se extrajo
- **sourceType**: `"pdf"` o `"html"`
- **extractedAt**: Timestamp de extracción
- **status**: Siempre `"pending"` (pendiente de revisión)
- **chords**: Array de acordes únicos detectados
- **sections**: Secciones estructuradas (Intro, Verso, Coro, etc.)
- **rawText**: Texto completo sin procesar

---

## 🔧 Cómo Funciona

### Detección Automática de Formato

El scraper detecta automáticamente si la URL es:

1. **PDF**: Revisa los primeros 4 bytes (`%PDF`)
2. **HTML**: Todo lo demás

### Extracción de PDFs

```
URL → Descarga Buffer → pdf-parse → Texto plano →
→ Detecta acordes → Organiza secciones → JSON
```

**Ventajas**:
- Extrae TODO el texto del PDF
- No depende de HTML/CSS
- Funciona con PDFs escaneados (si tienen texto)

**Limitaciones**:
- PDFs solo con imágenes NO funcionan (requiere OCR)
- La estructura puede variar según el PDF

### Extracción de HTML

```
URL → Descarga HTML → Busca <pre> tags → Limpia basura →
→ Detecta acordes → JSON
```

**Sitios soportados**:
- AcordesWeb (HTML)
- CifraClub
- Ultimate Guitar
- Genérico (cualquier sitio con `<pre>` tags)

---

## 📊 Detección de Secciones

El scraper identifica secciones automáticamente buscando keywords:

| Keyword | Detecta como |
|---------|--------------|
| intro, introduction | Intro |
| verse, verso | Verso |
| chorus, coro, estribillo | Coro |
| bridge, puente | Puente |
| outro, final | Final |
| solo | Solo |
| pre-chorus, pre-coro | Pre-Coro |

**Ejemplo**:
```
Intro
Am G F C

Verso 1
Am              G
En la sierra nací
```

Se convierte en:
```json
{
  "sections": [
    {
      "name": "Intro",
      "lines": ["Am G F C"]
    },
    {
      "name": "Verso 1",
      "lines": ["Am              G", "En la sierra nací"]
    }
  ]
}
```

---

## 🎯 Flujo Completo de Trabajo

### 1. Recolectar URLs

Busca canciones en AcordesWeb, CifraClub, etc. y copia las URLs:

**Para PDFs de AcordesWeb**:
- Ve a la canción
- Busca el botón "Descargar PDF"
- Copia el link del botón (clic derecho → Copiar dirección del enlace)

**Para HTML**:
- Solo copia la URL de la página

### 2. Crear lista de URLs

```bash
cd scripts/scraper
nano mis-urls.txt
# Pega las URLs, una por línea
```

### 3. Ejecutar scraper

```bash
node tab-scraper-v2.js --batch mis-urls.txt
```

**Output esperado**:
```
📋 Procesando 10 URLs...

🎵 Procesando: https://acordesweb.com/.../viejo-lobo.pdf
   Tipo detectado: PDF
📄 PDF parseado correctamente
   Páginas: 2
   Caracteres: 1523
✅ Guardado: extracted-tabs/viejo-lobo-1703234567.json
📊 Acordes: Am, G, F, C, Dm, E7, G7, Cmaj7...
📑 Secciones: Intro, Verso 1, Coro, Verso 2, Puente

... (continúa con las demás URLs)

📦 Resumen: extracted-tabs/batch-summary.json
✅ Éxitosos: 9/10
```

### 4. Revisar resultados

```bash
cd extracted-tabs
ls -lh
cat viejo-lobo-*.json | head -50
```

### 5. Importar a la base de datos

```bash
# Método 1: Import individual
node import-to-db.js http://localhost:3000

# Método 2: Import batch (más rápido)
node import-to-db.js http://localhost:3000 batch
```

**Nota**: Requiere que el backend esté corriendo y configurado con API key.

### 6. Revisar en Admin Dashboard

1. Abre `http://localhost:4200/admin`
2. Ve a "Pending Tabs"
3. Revisa cada canción
4. Edita si es necesario
5. Publica cuando esté lista

---

## 🛠️ Troubleshooting

### Error: "Cannot find module 'pdf-parse'"

```bash
cd scripts/scraper
npm install
```

### Error: "No se pudo extraer contenido"

**Posibles causas**:
1. PDF es solo imagen (requiere OCR, no soportado)
2. HTML usa estructura no estándar
3. Sitio bloqueó el request (usar header User-Agent)

**Solución temporal**:
- Descarga el PDF manualmente
- Ejecuta: `node tab-scraper-v2.js ./descargado.pdf`

### Acordes mal detectados

El regex de detección es:
```regex
/\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g
```

Detecta: `Am`, `G7`, `Cmaj7`, `F#m`, `D/F#`, etc.

Si falta algún formato, edita el JSON manualmente después.

### Secciones mal organizadas

Edita el JSON antes de importar:

```json
{
  "sections": [
    {
      "name": "Verso 1",  // ← Cambia esto
      "lines": [...]
    }
  ]
}
```

---

## 📝 Tips y Mejores Prácticas

### 1. Usa PDFs cuando sea posible
- Más limpio que HTML
- No tiene ads ni scripts
- Extracción más consistente

### 2. Procesa en batches pequeños
- 10-20 URLs a la vez
- Revisa los resultados antes de continuar
- Evita sobrecargar los servidores (delay de 3 segundos entre requests)

### 3. Respeta las fuentes
- Incluye siempre `sourceUrl` en el JSON
- Muestra créditos en tu app
- No republiques sin permiso

### 4. Revisa antes de publicar
- Los PDFs pueden tener errores de formato
- Verifica acordes y letra
- Corrige typos

### 5. Organiza tus URLs
- Agrupa por artista
- Usa comentarios en el archivo
- Mantén un log de lo ya scraped

---

## 🔐 Configuración sin Login/Autenticación

Como NO vas a usar login por ahora:

### Opción 1: API Key en `.env`

```env
# backend/.env
ADMIN_API_KEY=tu-clave-secreta-aqui-12345
```

Al importar, incluye el header:

```bash
# Modifica import-to-db.js para incluir:
headers: {
  'x-api-key': 'tu-clave-secreta-aqui-12345'
}
```

### Opción 2: Importación directa a BD (sin API)

Crea un script que inserte directamente en PostgreSQL:

```javascript
// direct-import.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  database: 'blacksheep',
  user: 'postgres',
  password: 'tu-password'
});

const json = JSON.parse(fs.readFileSync('./extracted-tabs/tab.json'));

await pool.query(
  'INSERT INTO songs (title, artist, content, chords, status) VALUES ($1, $2, $3, $4, $5)',
  [json.title, json.artist, json.rawText, json.chords, 'pending']
);
```

---

## 🎯 Siguiente Paso

Una vez que tengas tabs extraídos:

1. **Revisión**: Abre el admin dashboard
2. **Edición**: Corrige errores si hay
3. **Publicación**: Cambia status a `published`
4. **Verificación**: Prueba en el front end

Ver [PLAN_ESTRATEGICO.md](../PLAN_ESTRATEGICO.md) para el flujo completo.

---

## 📚 Recursos

- [AcordesWeb](https://acordesweb.com) - PDFs limpios
- [CifraClub](https://cifraclub.com.br) - HTML estructurado
- [Ultimate Guitar](https://tabs.ultimate-guitar.com) - Requiere login

---

**Happy Scraping! 🎸**

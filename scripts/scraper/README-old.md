# Tab Scraper - Extractor de Tablaturas

## Uso Rápido

### 1. Extraer una sola tablatura:
```bash
cd scripts/scraper
node tab-scraper.js "https://www.cifraclub.com.br/artist/song/" cifraclub
```

### 2. Extraer múltiples (batch):
```bash
# Edita urls.txt y agrega las URLs
node tab-scraper.js --batch urls.txt
```

### 3. Los archivos se guardan en:
```
scripts/scraper/extracted-tabs/
├── tab-1234567890.json
├── tab-1234567891.json
└── batch-summary.json
```

## Formato de salida (JSON):

```json
{
  "title": "Let It Be",
  "artist": "The Beatles",
  "sourceUrl": "https://...",
  "extractedAt": "2025-12-22T...",
  "content": "<pre>...</pre>",
  "chords": ["C", "G", "Am", "F"],
  "status": "pending"
}
```

## Sitios soportados:
- `cifraclub` - Cifra Club
- `ultimateGuitar` - Ultimate Guitar
- `generic` - Cualquier sitio con `<pre>` tags

## Próximos pasos:
1. Ejecutar scraper
2. Revisar JSONs extraídos
3. Importar a base de datos con status "pending"
4. Aprobar/editar desde panel admin

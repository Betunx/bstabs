# Black Sheep Scraper

Herramientas para extraer tablaturas de sitios web y PDFs.

## Scrapers Disponibles

| Archivo | Descripcion |
|---------|-------------|
| `tab-scraper-v2.js` | Scraper principal (HTML + PDF) |
| `lyrics-scraper.js` | Extractor de letras |
| `catalog-scraper.js` | Catalogo de artistas |

## Uso Rapido

### Scrapear una URL

```bash
node tab-scraper-v2.js "https://acordesweb.com/descarga-pdf/artista/cancion/0/0/0.pdf"
```

### Scrapear multiples URLs

```bash
# Crear archivo con URLs
echo "https://url1.pdf
https://url2.pdf" > mis-urls.txt

# Ejecutar batch
node tab-scraper-v2.js --batch mis-urls.txt
```

### Output

Los JSONs se guardan en `extracted-tabs/`:

```json
{
  "title": "Nombre Cancion",
  "artist": "Artista",
  "chords": ["Am", "G", "F"],
  "sections": [
    {
      "name": "Verso",
      "lines": [
        { "chords": "Am  G  F", "lyrics": "Letra aqui..." }
      ]
    }
  ]
}
```

## Importar a Supabase

Los JSONs extraidos se importan a Supabase usando el dashboard o la API.

Ver documentacion de Supabase para mas detalles.

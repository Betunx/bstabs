# 📂 Configuraciones

Esta carpeta contiene archivos de configuración para el scraper.

## 📋 URLs

Agrega archivos `.txt` con URLs para procesamiento batch.

### Formato

```
# Comentarios empiezan con #
https://sitio.com/cancion1
https://sitio.com/cancion2

# Agregar más URLs aquí
https://sitio.com/cancion3
```

### Uso

```bash
node ../tools/1-extraction/html-scraper.js --batch urls/mis-urls.txt
```

## 📁 Estructura

```
config/
└── urls/
    ├── acordesweb-urls.txt
    ├── espirituguitarrista-urls.txt
    └── tus-urls.txt
```

## 💡 Tips

- Un archivo por sitio web
- Agrupa por artista o género
- Usa nombres descriptivos

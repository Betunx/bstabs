#!/bin/bash

# Helper script para facilitar el scraping
# Uso: bash scrape.sh [comando] [argumentos]

case "$1" in
  "test")
    echo "🧪 Test con 1 canción de prueba..."
    node tab-scraper-v2.js "https://www.cifraclub.com.br/oasis/wonderwall/"
    ;;

  "spotify")
    if [ -z "$2" ]; then
      echo "❌ Debes proporcionar PLAYLIST_ID(s)"
      echo "Uso: bash scrape.sh spotify PLAYLIST_ID1,PLAYLIST_ID2"
      exit 1
    fi
    echo "🎵 Extrayendo desde Spotify..."
    node spotify-integration.js "$2"
    ;;

  "catalog")
    if [ -z "$2" ]; then
      echo "❌ Debes proporcionar artistas"
      echo "Uso: bash scrape.sh catalog oasis,the-beatles,nirvana"
      exit 1
    fi
    echo "📋 Extrayendo catálogo de artistas..."
    node catalog-scraper.js cifraclub-songs "$2"
    ;;

  "process")
    if [ -z "$2" ]; then
      echo "❌ Debes proporcionar archivo de URLs"
      echo "Uso: bash scrape.sh process urls.txt"
      exit 1
    fi
    CONCURRENCY=${3:-3}
    echo "⚙️  Procesando con concurrencia=$CONCURRENCY..."
    node queue-processor.js process "$2" --concurrency "$CONCURRENCY"
    ;;

  "quick")
    echo "🚀 Quick start con artistas populares..."
    echo "1. Extrayendo catálogo..."
    node catalog-scraper.js cifraclub-songs oasis,the-beatles,nirvana,queen,acdc
    echo ""
    echo "2. Tomando primeros 20 tabs..."
    head -20 catalog-output/cifraclub-urls.txt > catalog-output/quick-test.txt
    echo ""
    echo "3. Procesando..."
    node queue-processor.js process catalog-output/quick-test.txt --concurrency 2
    ;;

  "resume")
    echo "🔄 Reanudando procesamiento anterior..."
    node queue-processor.js resume
    ;;

  "stats")
    echo "📊 Estadísticas de scraping..."
    echo ""
    echo "Tabs completados:"
    find queue-results -name "completed-*.json" -exec wc -l {} \;
    echo ""
    echo "Tabs fallidos:"
    find queue-results -name "failed-*.json" -exec wc -l {} \;
    echo ""
    if [ -f "queue-results/database-import.json" ]; then
      echo "Tabs listos para DB:"
      cat queue-results/database-import.json | grep -c "title"
    fi
    ;;

  *)
    echo "🎸 Black Sheep Tabs - Helper de Scraping"
    echo ""
    echo "Comandos disponibles:"
    echo ""
    echo "  test                    - Prueba con 1 canción"
    echo "  spotify PLAYLIST_IDS    - Extrae desde Spotify"
    echo "  catalog ARTISTAS        - Extrae catálogo de artistas"
    echo "  process URLS [CONC]     - Procesa archivo de URLs"
    echo "  quick                   - Quick start (20 tabs populares)"
    echo "  resume                  - Reanuda procesamiento interrumpido"
    echo "  stats                   - Muestra estadísticas"
    echo ""
    echo "Ejemplos:"
    echo "  bash scrape.sh test"
    echo "  bash scrape.sh spotify 37i9dQZF1DXcBWIGoYBM5M"
    echo "  bash scrape.sh catalog oasis,the-beatles,nirvana"
    echo "  bash scrape.sh process urls.txt 5"
    echo "  bash scrape.sh quick"
    ;;
esac

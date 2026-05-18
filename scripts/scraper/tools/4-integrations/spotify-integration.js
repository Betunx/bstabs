/**
 * Spotify Integration - Extrae canciones desde tus playlists
 *
 * Usa Spotify Web API para:
 * 1. Obtener tracks de tus playlists
 * 2. Buscar tabs correspondientes en CifraClub/AcordesWeb
 * 3. Generar lista de URLs para scraping
 *
 * Requiere: SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class SpotifyIntegration {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.outputDir = path.join(__dirname, 'spotify-output');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Obtiene access token usando Client Credentials Flow
   */
  async authenticate() {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const postData = 'grant_type=client_credentials';

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'accounts.spotify.com',
        path: '/api/token',
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            this.accessToken = result.access_token;
            console.log('✅ Autenticación exitosa con Spotify');
            resolve(this.accessToken);
          } catch (error) {
            reject(new Error('Error parsing auth response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Hace request a Spotify API
   */
  async spotifyRequest(endpoint) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.spotify.com',
        path: endpoint,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      };

      https.get(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error('Error parsing response'));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Obtiene tracks de una playlist
   */
  async getPlaylistTracks(playlistId) {
    console.log(`\n🎵 Obteniendo tracks de playlist: ${playlistId}`);

    try {
      const data = await this.spotifyRequest(`/v1/playlists/${playlistId}/tracks`);
      const tracks = data.items.map(item => ({
        title: item.track.name,
        artist: item.track.artists[0].name,
        artists: item.track.artists.map(a => a.name),
        album: item.track.album.name,
        duration: item.track.duration_ms,
        spotifyUrl: item.track.external_urls.spotify
      }));

      console.log(`   ✅ ${tracks.length} tracks encontrados`);
      return tracks;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtiene tracks de múltiples playlists
   */
  async getMultiplePlaylists(playlistIds) {
    const allTracks = [];

    for (const id of playlistIds) {
      const tracks = await this.getPlaylistTracks(id);
      allTracks.push(...tracks);
      await this.sleep(1000);
    }

    // Elimina duplicados
    const unique = this.deduplicateTracks(allTracks);

    console.log(`\n📦 Total tracks únicos: ${unique.length}`);
    return unique;
  }

  /**
   * Busca tabs para los tracks de Spotify
   */
  async findTabsForTracks(tracks, source = 'cifraclub') {
    console.log(`\n🔍 Buscando tabs en ${source}...\n`);

    const tabUrls = [];
    const baseUrls = {
      'cifraclub': 'https://www.cifraclub.com.br',
      'acordesweb': 'https://acordesweb.com'
    };

    const baseUrl = baseUrls[source];

    for (const track of tracks) {
      // Genera URL probable basada en artista y título
      const artistSlug = this.slugify(track.artist);
      const titleSlug = this.slugify(track.title);

      let url;
      if (source === 'cifraclub') {
        url = `${baseUrl}/${artistSlug}/${titleSlug}/`;
      } else if (source === 'acordesweb') {
        url = `${baseUrl}/${artistSlug}/${titleSlug}`;
      }

      tabUrls.push({
        ...track,
        tabUrl: url,
        source: source
      });

      console.log(`   🎸 ${track.artist} - ${track.title}`);
      console.log(`      → ${url}`);
    }

    return tabUrls;
  }

  /**
   * Exporta tracks a formato procesable
   */
  async exportTracks(playlistIds, sources = ['cifraclub', 'acordesweb']) {
    console.log('\n🎼 INICIANDO EXPORTACIÓN DESDE SPOTIFY\n');

    // Obtiene tracks de Spotify
    const tracks = await this.getMultiplePlaylists(playlistIds);

    if (tracks.length === 0) {
      console.log('❌ No se encontraron tracks');
      return;
    }

    // Guarda tracks originales
    const tracksFile = path.join(this.outputDir, 'spotify-tracks.json');
    fs.writeFileSync(tracksFile, JSON.stringify(tracks, null, 2));
    console.log(`📁 Tracks guardados: ${tracksFile}`);

    // Busca tabs en cada fuente
    for (const source of sources) {
      const tabUrls = await this.findTabsForTracks(tracks, source);

      // Guarda JSON con metadata
      const jsonFile = path.join(this.outputDir, `spotify-${source}.json`);
      fs.writeFileSync(jsonFile, JSON.stringify(tabUrls, null, 2));

      // Guarda archivo de URLs planas
      const urlsFile = path.join(this.outputDir, `spotify-${source}-urls.txt`);
      const urls = tabUrls.map(t => t.tabUrl).join('\n');
      fs.writeFileSync(urlsFile, urls);

      console.log(`\n📝 ${source.toUpperCase()}:`);
      console.log(`   JSON: ${jsonFile}`);
      console.log(`   URLs: ${urlsFile}`);
    }

    console.log(`\n✅ Exportación completa!`);
    console.log(`\n💡 Siguiente paso:`);
    console.log(`   node tab-scraper-v2.js --batch spotify-output/spotify-cifraclub-urls.txt`);
  }

  /**
   * Utilidades
   */
  slugify(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  deduplicateTracks(tracks) {
    const seen = new Set();
    return tracks.filter(track => {
      const key = `${track.artist}|${track.title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SpotifyIntegration;

// Ejecución directa
if (require.main === module) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const playlistArg = process.argv[2];

  if (!clientId || !clientSecret) {
    console.log(`
❌ Faltan credenciales de Spotify

📖 Setup:

1. Ve a https://developer.spotify.com/dashboard
2. Crea una app para obtener Client ID y Secret
3. Exporta las variables de entorno:

   Windows (CMD):
     set SPOTIFY_CLIENT_ID=tu_client_id
     set SPOTIFY_CLIENT_SECRET=tu_client_secret

   Windows (PowerShell):
     $env:SPOTIFY_CLIENT_ID="tu_client_id"
     $env:SPOTIFY_CLIENT_SECRET="tu_client_secret"

   Linux/Mac:
     export SPOTIFY_CLIENT_ID=tu_client_id
     export SPOTIFY_CLIENT_SECRET=tu_client_secret

4. Ejecuta de nuevo:
     node spotify-integration.js PLAYLIST_ID1,PLAYLIST_ID2

📝 Nota: Los Playlist IDs están en la URL de Spotify:
   https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
                                    ^^^^^^^^^^^^^^^^^^^^^^
    `);
    process.exit(1);
  }

  if (!playlistArg) {
    console.log(`
🎸 Spotify Integration

📖 Uso:
    node spotify-integration.js PLAYLIST_ID1,PLAYLIST_ID2,PLAYLIST_ID3

Ejemplo:
    node spotify-integration.js 37i9dQZF1DXcBWIGoYBM5M,37i9dQZF1DX0XUsuxWHRQd

💡 Encuentra el Playlist ID en la URL de Spotify Web
    `);
    process.exit(0);
  }

  const playlistIds = playlistArg.split(',').map(id => id.trim());
  const spotify = new SpotifyIntegration(clientId, clientSecret);

  spotify.exportTracks(playlistIds, ['cifraclub', 'acordesweb'])
    .then(() => {
      console.log('\n🎉 Proceso completado!');
    })
    .catch((error) => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

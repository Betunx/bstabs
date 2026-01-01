import { createClient } from '@supabase/supabase-js'

// Tipos
interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  ADMIN_API_KEY: string
  ARTIST_IMAGES: R2Bucket  // R2 bucket binding
}

type MusicGenre =
  | 'Rock'
  | 'Pop'
  | 'Balada'
  | 'Corrido'
  | 'Norteño'
  | 'Banda'
  | 'Regional Mexicano'
  | 'Ranchera'
  | 'Metal'
  | 'Punk'
  | 'Indie'
  | 'Folk'
  | 'Blues'
  | 'Jazz'
  | 'Gospel/Cristiana'
  | 'Cumbia'
  | 'Salsa'
  | 'Reggae'
  | 'Country'
  | 'Alternativo'

interface Song {
  id?: string
  title: string
  artist: string
  key?: string
  tempo?: number
  time_signature?: string
  tuning?: string
  genre?: MusicGenre
  story?: string
  sections: any[]
  spotify_url?: string
  youtube_url?: string
  source_url?: string
  status?: 'draft' | 'pending' | 'published' | 'archived'
}

interface SongRequest {
  id?: string
  type: 'new_song' | 'edit'
  song_id?: string
  song_title: string
  artist_name?: string
  lyrics?: string
  chords?: string[]
  song_key?: string
  tempo?: number
  spotify_url?: string
  youtube_url?: string
  edit_reason?: 'wrong_chords' | 'wrong_lyrics' | 'missing_section' | 'wrong_key' | 'other'
  description?: string
  user_email?: string
  status?: 'pending' | 'completed' | 'rejected'
}

// CORS headers - SECURITY: Only allow specific origins
const ALLOWED_ORIGINS = [
  'https://www.bstabs.com',
  'https://bstabs.com',
  'https://bstabs.pages.dev',
  'http://localhost:4200', // Development only
];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  };
}

// Legacy - kept for jsonResponse compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

// Helper para respuestas JSON
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

// Verificar API Key
function verifyApiKey(request: Request, env: Env): boolean {
  const apiKey = request.headers.get('x-api-key')
  return apiKey === env.ADMIN_API_KEY
}

// SECURITY: Validación y sanitización de inputs
function validateSearchQuery(query: string): { valid: boolean; sanitized: string; error?: string } {
  if (!query || query.trim().length === 0) {
    return { valid: false, sanitized: '', error: 'Search query cannot be empty' }
  }

  if (query.length > 100) {
    return { valid: false, sanitized: '', error: 'Search query too long (max 100 chars)' }
  }

  // Sanitizar: remover caracteres potencialmente peligrosos
  const sanitized = query.trim().replace(/[<>\"']/g, '')

  return { valid: true, sanitized }
}

function validateGenre(genre: string): { valid: boolean; error?: string } {
  const validGenres: MusicGenre[] = [
    'Rock', 'Pop', 'Balada', 'Corrido', 'Norteño', 'Banda',
    'Regional Mexicano', 'Ranchera', 'Metal', 'Punk', 'Indie',
    'Folk', 'Blues', 'Jazz', 'Gospel/Cristiana', 'Cumbia',
    'Salsa', 'Reggae', 'Country', 'Alternativo'
  ]

  if (!validGenres.includes(genre as MusicGenre)) {
    return { valid: false, error: `Invalid genre. Must be one of: ${validGenres.join(', ')}` }
  }

  return { valid: true }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Manejar preflight CORS - use origin-specific headers
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(request) })
    }

    const url = new URL(request.url)
    const path = url.pathname

    // Inicializar cliente Supabase
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

    try {
      // GET / - Health check
      if (path === '/' && request.method === 'GET') {
        return jsonResponse({
          status: 'ok',
          message: 'Black Sheep Tabs API - Cloudflare Workers',
          version: '1.0.0'
        })
      }

      // GET /songs - Listar canciones publicadas
      if (path === '/songs' && request.method === 'GET') {
        const artist = url.searchParams.get('artist')
        const genre = url.searchParams.get('genre')
        const search = url.searchParams.get('q')

        // SECURITY: Validar inputs
        if (genre) {
          const validation = validateGenre(genre)
          if (!validation.valid) {
            return jsonResponse({ error: validation.error }, 400)
          }
        }

        if (search) {
          const validation = validateSearchQuery(search)
          if (!validation.valid) {
            return jsonResponse({ error: validation.error }, 400)
          }
        }

        if (artist && artist.length > 100) {
          return jsonResponse({ error: 'Artist name too long (max 100 chars)' }, 400)
        }

        let query = supabase
          .from('songs')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (artist) query = query.ilike('artist', `%${artist}%`)
        if (genre) query = query.eq('genre', genre)
        if (search) {
          const { sanitized } = validateSearchQuery(search)
          query = query.or(`title.ilike.%${sanitized}%,artist.ilike.%${sanitized}%`)
        }

        const { data, error } = await query

        if (error) throw error
        return jsonResponse(data)
      }

      // GET /songs/:id - Obtener cancion por ID
      if (path.match(/^\/songs\/[a-f0-9-]+$/) && request.method === 'GET') {
        const id = path.split('/')[2]

        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .single()

        if (error) throw error
        if (!data) return jsonResponse({ error: 'Song not found' }, 404)

        return jsonResponse(data)
      }

      // POST /songs - Crear cancion (requiere API key)
      if (path === '/songs' && request.method === 'POST') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const song: Song = await request.json()

        const { data, error } = await supabase
          .from('songs')
          .insert([song])
          .select()
          .single()

        if (error) throw error
        return jsonResponse(data, 201)
      }

      // PUT /songs/:id - Actualizar cancion (requiere API key)
      if (path.match(/^\/songs\/[a-f0-9-]+$/) && request.method === 'PUT') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const id = path.split('/')[2]
        const updates: Partial<Song> = await request.json()

        const { data, error } = await supabase
          .from('songs')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return jsonResponse(data)
      }

      // DELETE /songs/:id - Eliminar cancion (requiere API key)
      if (path.match(/^\/songs\/[a-f0-9-]+$/) && request.method === 'DELETE') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const id = path.split('/')[2]

        const { error } = await supabase
          .from('songs')
          .delete()
          .eq('id', id)

        if (error) throw error
        return jsonResponse({ message: 'Song deleted' })
      }

      // POST /songs/:id/publish - Publicar cancion (requiere API key)
      if (path.match(/^\/songs\/[a-f0-9-]+\/publish$/) && request.method === 'POST') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const id = path.split('/')[2]

        const { data, error } = await supabase
          .from('songs')
          .update({ status: 'published' })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return jsonResponse(data)
      }

      // POST /songs/:id/reject - Rechazar cancion (vuelve a pending)
      if (path.match(/^\/songs\/[a-f0-9-]+\/reject$/) && request.method === 'POST') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const id = path.split('/')[2]

        const { data, error } = await supabase
          .from('songs')
          .update({ status: 'pending' })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return jsonResponse(data)
      }

      // ===== BÚSQUEDA PÚBLICA =====

      // GET /songs/search - Buscar canciones (para sugerencias)
      if (path === '/songs/search' && request.method === 'GET') {
        const q = url.searchParams.get('q') || ''
        const limit = parseInt(url.searchParams.get('limit') || '10')

        if (q.length < 2) {
          return jsonResponse([])
        }

        const { data, error } = await supabase
          .from('songs')
          .select('id, title, artist')
          .eq('status', 'published')
          .or(`title.ilike.%${q}%,artist.ilike.%${q}%`)
          .limit(limit)

        if (error) throw error
        return jsonResponse(data)
      }

      // ===== SOLICITUDES DE USUARIOS (PÚBLICAS) =====

      // POST /requests - Crear solicitud de canción/edición
      if (path === '/requests' && request.method === 'POST') {
        const requestData: SongRequest = await request.json()

        // Validar campos requeridos para nueva canción
        if (requestData.type === 'new_song') {
          if (!requestData.song_title || !requestData.artist_name || !requestData.lyrics || !requestData.chords || requestData.chords.length === 0) {
            return jsonResponse({ error: 'Para solicitar una canción necesitas: título, artista, letra y al menos un acorde' }, 400)
          }
        }

        // Validar campos requeridos para edición
        if (requestData.type === 'edit') {
          if (!requestData.song_id || !requestData.song_title) {
            return jsonResponse({ error: 'song_id and song_title are required for edit requests' }, 400)
          }
        }

        // Validar tipo
        if (!requestData.type || !['new_song', 'edit'].includes(requestData.type)) {
          return jsonResponse({ error: 'type must be new_song or edit' }, 400)
        }

        const { data, error } = await supabase
          .from('song_requests')
          .insert([{
            type: requestData.type,
            song_id: requestData.song_id || null,
            song_title: requestData.song_title,
            artist_name: requestData.artist_name || null,
            lyrics: requestData.lyrics || null,
            chords: requestData.chords || null,
            song_key: requestData.song_key || null,
            tempo: requestData.tempo || null,
            spotify_url: requestData.spotify_url || null,
            youtube_url: requestData.youtube_url || null,
            edit_reason: requestData.edit_reason || null,
            description: requestData.description || null,
            user_email: requestData.user_email || null,
            status: 'pending'
          }])
          .select()
          .single()

        if (error) throw error
        return jsonResponse({ message: 'Solicitud enviada correctamente', id: data.id }, 201)
      }

      // ===== ADMIN: GESTIÓN DE SOLICITUDES =====

      // GET /admin/requests - Listar solicitudes (requiere API key)
      if (path === '/admin/requests' && request.method === 'GET') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const status = url.searchParams.get('status')
        const type = url.searchParams.get('type')

        let query = supabase
          .from('song_requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (status) query = query.eq('status', status)
        if (type) query = query.eq('type', type)

        const { data, error } = await query

        if (error) throw error
        return jsonResponse(data)
      }

      // PUT /admin/requests/:id - Actualizar solicitud (requiere API key)
      if (path.match(/^\/admin\/requests\/[a-f0-9-]+$/) && request.method === 'PUT') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const id = path.split('/')[3]
        const updates: Partial<SongRequest> = await request.json()

        const { data, error } = await supabase
          .from('song_requests')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return jsonResponse(data)
      }

      // DELETE /admin/requests/:id - Eliminar solicitud (requiere API key)
      if (path.match(/^\/admin\/requests\/[a-f0-9-]+$/) && request.method === 'DELETE') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const id = path.split('/')[3]

        const { error } = await supabase
          .from('song_requests')
          .delete()
          .eq('id', id)

        if (error) throw error
        return jsonResponse({ message: 'Request deleted' })
      }

      // ===== ADMIN: GESTIÓN DE CANCIONES (todas las canciones) =====

      // GET /admin/songs - Listar TODAS las canciones (requiere API key)
      if (path === '/admin/songs' && request.method === 'GET') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const status = url.searchParams.get('status')
        const search = url.searchParams.get('q')

        let query = supabase
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false })

        if (status) query = query.eq('status', status)
        if (search) query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%`)

        const { data, error } = await query

        if (error) throw error
        return jsonResponse(data)
      }

      // GET /admin/stats - Estadísticas (requiere API key)
      if (path === '/admin/stats' && request.method === 'GET') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const [publishedRes, pendingRes, requestsRes] = await Promise.all([
          supabase.from('songs').select('id', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('songs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('song_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
        ])

        return jsonResponse({
          publishedCount: publishedRes.count || 0,
          pendingCount: pendingRes.count || 0,
          pendingRequestsCount: requestsRes.count || 0
        })
      }

      // ===== ARTIST IMAGES (R2) =====

      // GET /artists/images/:slug - Servir imagen de artista
      if (path.match(/^\/artists\/images\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/) && request.method === 'GET') {
        const filename = path.split('/').pop() || ''

        try {
          const object = await env.ARTIST_IMAGES.get(filename)

          if (!object) {
            return new Response('Image not found', { status: 404 })
          }

          const headers = new Headers()
          object.writeHttpMetadata(headers)
          headers.set('Cache-Control', 'public, max-age=31536000') // Cache 1 año

          // Apply CORS headers
          const corsHeaders = getCorsHeaders(request)
          Object.entries(corsHeaders).forEach(([key, value]) => {
            headers.set(key, value)
          })

          return new Response(object.body, { headers })
        } catch (error) {
          console.error('Error fetching image:', error)
          return new Response('Error fetching image', { status: 500 })
        }
      }

      // POST /admin/artists/images/:slug - Subir imagen de artista (requiere API key)
      if (path.match(/^\/admin\/artists\/images\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/) && request.method === 'POST') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const filename = path.split('/').pop() || ''
        const contentType = request.headers.get('content-type') || 'image/jpeg'

        try {
          const imageData = await request.arrayBuffer()

          await env.ARTIST_IMAGES.put(filename, imageData, {
            httpMetadata: {
              contentType: contentType,
            },
          })

          return jsonResponse({
            message: 'Image uploaded successfully',
            filename,
            url: `/artists/images/${filename}`
          })
        } catch (error: any) {
          console.error('Error uploading image:', error)
          return jsonResponse({ error: error.message || 'Error uploading image' }, 500)
        }
      }

      // DELETE /admin/artists/images/:slug - Eliminar imagen de artista (requiere API key)
      if (path.match(/^\/admin\/artists\/images\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/) && request.method === 'DELETE') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        const filename = path.split('/').pop() || ''

        try {
          await env.ARTIST_IMAGES.delete(filename)
          return jsonResponse({ message: 'Image deleted successfully' })
        } catch (error: any) {
          console.error('Error deleting image:', error)
          return jsonResponse({ error: error.message || 'Error deleting image' }, 500)
        }
      }

      // GET /admin/artists/images - Listar todas las imágenes (requiere API key)
      if (path === '/admin/artists/images' && request.method === 'GET') {
        if (!verifyApiKey(request, env)) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }

        try {
          const objects = await env.ARTIST_IMAGES.list()
          const images = objects.objects.map(obj => ({
            key: obj.key,
            size: obj.size,
            uploaded: obj.uploaded,
            url: `/artists/images/${obj.key}`
          }))

          return jsonResponse({ images, count: images.length })
        } catch (error: any) {
          console.error('Error listing images:', error)
          return jsonResponse({ error: error.message || 'Error listing images' }, 500)
        }
      }

      // Ruta no encontrada
      return jsonResponse({ error: 'Not found' }, 404)

    } catch (error: any) {
      console.error('Error:', error)
      return jsonResponse({ error: error.message || 'Internal server error' }, 500)
    }
  },
}

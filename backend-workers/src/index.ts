import { createClient } from '@supabase/supabase-js'

// Tipos
interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  ADMIN_API_KEY: string
}

interface Song {
  id?: string
  title: string
  artist: string
  key?: string
  tempo?: number
  time_signature?: string
  tuning?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  story?: string
  sections: any[]
  spotify_url?: string
  youtube_url?: string
  source_url?: string
  status?: 'draft' | 'pending' | 'published' | 'archived'
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Manejar preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
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
        const difficulty = url.searchParams.get('difficulty')
        const search = url.searchParams.get('q')

        let query = supabase
          .from('songs')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (artist) query = query.ilike('artist', `%${artist}%`)
        if (difficulty) query = query.eq('difficulty', difficulty)
        if (search) query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%`)

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

      // Ruta no encontrada
      return jsonResponse({ error: 'Not found' }, 404)

    } catch (error: any) {
      console.error('Error:', error)
      return jsonResponse({ error: error.message || 'Internal server error' }, 500)
    }
  },
}

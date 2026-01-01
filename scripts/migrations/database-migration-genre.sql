-- =====================================================
-- MIGRACIÓN: Difficulty → Genre
-- Fecha: 2025-12-31
-- Descripción: Eliminar campo difficulty y agregar genre
-- =====================================================

-- PASO 1: Agregar columna genre (nullable para empezar)
ALTER TABLE songs
ADD COLUMN genre TEXT;

-- PASO 2: Agregar constraint para validar géneros permitidos
ALTER TABLE songs
ADD CONSTRAINT songs_genre_check
CHECK (
  genre IS NULL OR genre IN (
    'Rock',
    'Pop',
    'Balada',
    'Corrido',
    'Norteño',
    'Banda',
    'Regional Mexicano',
    'Ranchera',
    'Metal',
    'Punk',
    'Indie',
    'Folk',
    'Blues',
    'Jazz',
    'Gospel/Cristiana',
    'Cumbia',
    'Salsa',
    'Reggae',
    'Country',
    'Alternativo'
  )
);

-- PASO 3: Migrar datos existentes (mapeo de difficulty a genre)
-- Nota: Esto es opcional - puedes asignar géneros manualmente después
-- Esta migración asigna géneros basados en dificultad (ejemplo arbitrario)
UPDATE songs
SET genre = CASE
  WHEN difficulty = 'beginner' THEN 'Pop'
  WHEN difficulty = 'intermediate' THEN 'Rock'
  WHEN difficulty = 'advanced' THEN 'Metal'
  ELSE NULL
END
WHERE genre IS NULL;

-- PASO 4: Eliminar columna difficulty
ALTER TABLE songs
DROP COLUMN difficulty;

-- PASO 5: Crear índice para mejorar performance en filtros por género
CREATE INDEX idx_songs_genre ON songs(genre);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver distribución de géneros
SELECT genre, COUNT(*) as total
FROM songs
GROUP BY genre
ORDER BY total DESC;

-- Ver canciones sin género
SELECT id, title, artist
FROM songs
WHERE genre IS NULL;
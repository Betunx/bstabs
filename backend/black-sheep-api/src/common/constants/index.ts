/**
 * Application-wide constants
 */

export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Rate limiting
  RATE_LIMIT_TTL: 60000, // 60 seconds
  RATE_LIMIT_MAX: 10,

  // Validation
  MAX_TITLE_LENGTH: 200,
  MAX_ARTIST_LENGTH: 200,
  MAX_GENRE_LENGTH: 100,
  MAX_CONTENT_LENGTH: 50000,

  // Status
  SONG_STATUS: {
    PENDING: 'pending',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },
} as const;

export const ERROR_MESSAGES = {
  SONG_NOT_FOUND: 'Song not found',
  INVALID_API_KEY: 'Invalid or missing API key',
  INVALID_ORIGIN: 'Invalid origin',
  MISSING_ORIGIN: 'Missing origin header',
  UNAUTHORIZED: 'Unauthorized access',
} as const;

export const SUCCESS_MESSAGES = {
  SONG_CREATED: 'Song created successfully',
  SONG_UPDATED: 'Song updated successfully',
  SONG_DELETED: 'Song deleted successfully',
  SONG_PUBLISHED: 'Song published successfully',
  SONG_ARCHIVED: 'Song archived successfully',
  BATCH_IMPORTED: 'Batch imported successfully',
} as const;

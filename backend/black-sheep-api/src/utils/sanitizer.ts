/**
 * HTML Sanitizer to prevent XSS attacks
 * Removes dangerous HTML tags and attributes
 */
export class Sanitizer {
  /**
   * Sanitize HTML content by removing script tags and dangerous attributes
   */
  static sanitizeHtml(dirty: string): string {
    if (!dirty) return '';

    // Remove script tags and their content
    let clean = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers (onclick, onerror, etc.)
    clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    clean = clean.replace(/javascript:/gi, '');

    // Remove data: protocol (can be used for XSS)
    clean = clean.replace(/data:text\/html/gi, '');

    // Remove vbscript: protocol
    clean = clean.replace(/vbscript:/gi, '');

    // Remove iframe tags
    clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    // Remove object and embed tags
    clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    clean = clean.replace(/<embed\b[^<]*>/gi, '');

    return clean.trim();
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  static escapeHtml(text: string): string {
    if (!text) return '';

    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  /**
   * Sanitize SQL-like inputs to prevent injection
   * This is a basic check - TypeORM provides better protection
   */
  static sanitizeSql(input: string): string {
    if (!input) return '';

    // Remove SQL keywords that could be dangerous
    const dangerous = [
      'DROP',
      'DELETE',
      'TRUNCATE',
      'ALTER',
      'CREATE',
      'INSERT',
      'UPDATE',
      'EXEC',
      'EXECUTE',
      '--',
      ';--',
      '/*',
      '*/',
      '@@',
      '@',
      'UNION',
    ];

    let clean = input;
    dangerous.forEach((keyword) => {
      const regex = new RegExp(keyword, 'gi');
      clean = clean.replace(regex, '');
    });

    return clean.trim();
  }
}

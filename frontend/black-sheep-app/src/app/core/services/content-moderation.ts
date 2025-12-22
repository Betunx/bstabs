import { Injectable } from '@angular/core';

export interface ModerationResult {
  isValid: boolean;
  reason?: string;
  flaggedWords?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ContentModerationService {

  private readonly offensiveWords = [
    // Español
    'puto', 'puta', 'pendejo', 'pendeja', 'cabron', 'cabrona',
    'chingar', 'verga', 'mamada', 'cagar', 'mierda', 'joder',
    'coger', 'cojones', 'idiota', 'imbecil', 'estupido', 'estupida',
    'mamon', 'mamona', 'culero', 'culera', 'ojete', 'pinche',

    // Inglés
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cunt',
    'bastard', 'damn', 'hell', 'piss', 'cock', 'pussy'
  ];

  private readonly hateSpeech = [
    'nazi', 'racista', 'racismo', 'fascista', 'facho',
    'kill yourself', 'matate', 'muere', 'suicidate',
    'retarded', 'retard', 'autista', 'mongoloide'
  ];

  moderateContent(text: string): ModerationResult {
    if (!text || text.trim().length === 0) {
      return {
        isValid: false,
        reason: 'El contenido no puede estar vacío'
      };
    }

    const normalizedText = text.toLowerCase();
    const flaggedWords: string[] = [];

    // Verificar palabras ofensivas
    for (const word of this.offensiveWords) {
      if (normalizedText.includes(word)) {
        flaggedWords.push(word);
      }
    }

    // Verificar discurso de odio
    for (const hate of this.hateSpeech) {
      if (normalizedText.includes(hate)) {
        return {
          isValid: false,
          reason: 'Tu mensaje contiene discurso de odio o lenguaje inapropiado. Por favor, sé respetuoso.',
          flaggedWords: [hate]
        };
      }
    }

    // Si hay palabras ofensivas
    if (flaggedWords.length > 0) {
      return {
        isValid: false,
        reason: `Tu mensaje contiene lenguaje inapropiado. Por favor, evita usar palabras ofensivas.`,
        flaggedWords
      };
    }

    // Verificar spam (repetición excesiva)
    if (this.isSpam(text)) {
      return {
        isValid: false,
        reason: 'Tu mensaje parece spam. Por favor, escribe algo más significativo.'
      };
    }

    return { isValid: true };
  }

  private isSpam(text: string): boolean {
    // Detectar caracteres repetidos más de 5 veces
    const repeatedChars = /(.)\1{5,}/g;
    if (repeatedChars.test(text)) {
      return true;
    }

    // Detectar palabras repetidas
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = new Map<string, number>();

    for (const word of words) {
      if (word.length < 3) continue; // Ignorar palabras cortas
      wordCount.set(word, (wordCount.get(word) || 0) + 1);

      // Si una palabra se repite más de 3 veces
      if (wordCount.get(word)! > 3) {
        return true;
      }
    }

    return false;
  }
}

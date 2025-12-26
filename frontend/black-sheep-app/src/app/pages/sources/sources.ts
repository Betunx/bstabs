import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';
interface Source {
  name: string;
  url: string;
  description: string;
  type: 'tabs' | 'lyrics' | 'chords';
}

@Component({
  selector: 'app-sources',
  imports: [CommonModule, RouterLink],
  templateUrl: './sources.html',
  styleUrl: './sources.scss',
})
export class Sources {
  sources: Source[] = [
    {
      name: 'CifraClub',
      url: 'https://www.cifraclub.com.br',
      description: 'Acordes y tablaturas de guitarra para canciones populares',
      type: 'tabs'
    },
    {
      name: 'Letras.com',
      url: 'https://www.letras.com',
      description: 'Letras de canciones',
      type: 'lyrics'
    },
    {
      name: 'Musica.com',
      url: 'https://www.musica.com',
      description: 'Letras de canciones y videos musicales',
      type: 'lyrics'
    }
  ];

  getSourcesByType(type: string): Source[] {
    return this.sources.filter(s => s.type === type);
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabViewer } from '../../shared/components/tab-viewer/tab-viewer';
import { Song } from '../../core/models/song.model';

@Component({
  selector: 'app-tab-reader',
  imports: [TabViewer],
  templateUrl: './tab-reader.html',
  styleUrl: './tab-reader.scss',
})
export class TabReader implements OnInit {
  route = inject(ActivatedRoute);
  song = signal<Song | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const songId = this.route.snapshot.paramMap.get('id');
    // TODO: Fetch song from API using songId
    // For now, using mock data based on songId
    this.loadMockSong(songId || '');
  }

  private loadMockSong(songId: string): void {
    // Mock song library - in production, this would come from API
    const mockSongs: { [key: string]: Song } = {
      'wonderwall': this.getWonderwallData(),
      'hotel-california': this.getHotelCaliforniaData(),
      'stairway-to-heaven': this.getStairwayToHeavenData(),
      '1': this.getWonderwallData() // fallback for numeric ID
    };

    const song = mockSongs[songId.toLowerCase()] || mockSongs['wonderwall'];
    this.song.set(song);
    this.loading.set(false);
  }

  private getWonderwallData(): Song {
    return {
      id: '1',
      title: 'Wonderwall',
      artist: 'Oasis',
      key: 'Em',
      tempo: 87,
      timeSignature: '4/4',
      tuning: 'Standard (EADGBE)',
      difficulty: 'beginner',
      story: 'Icónica canción de Oasis lanzada en 1995. Perfecta para principiantes en guitarra.',
      sections: [
        {
          name: 'Intro',
          lines: [
            {
              chords: [
                { chord: 'Em7', position: 0 },
                { chord: 'G', position: 8 },
                { chord: 'Dsus4', position: 16 },
                { chord: 'A7sus4', position: 26 }
              ],
              lyrics: ''
            }
          ]
        },
        {
          name: 'Verso 1',
          lines: [
            {
              chords: [
                { chord: 'Em7', position: 0 },
                { chord: 'G', position: 25 }
              ],
              lyrics: 'Today is gonna be the day'
            },
            {
              chords: [
                { chord: 'Dsus4', position: 0 },
                { chord: 'A7sus4', position: 30 }
              ],
              lyrics: 'That they\'re gonna throw it back to you'
            },
            {
              chords: [
                { chord: 'Em7', position: 0 },
                { chord: 'G', position: 18 }
              ],
              lyrics: 'By now you should\'ve somehow'
            },
            {
              chords: [
                { chord: 'Dsus4', position: 0 },
                { chord: 'A7sus4', position: 25 }
              ],
              lyrics: 'Realized what you gotta do'
            }
          ]
        },
        {
          name: 'Pre-Coro',
          lines: [
            {
              chords: [
                { chord: 'Em7', position: 0 },
                { chord: 'G', position: 17 }
              ],
              lyrics: 'I don\'t believe that anybody'
            },
            {
              chords: [
                { chord: 'Dsus4', position: 0 },
                { chord: 'A7sus4', position: 6 },
                { chord: 'Em7', position: 16 }
              ],
              lyrics: 'Feels the way I do about you now'
            }
          ]
        },
        {
          name: 'Coro',
          lines: [
            {
              chords: [
                { chord: 'Cadd9', position: 0 },
                { chord: 'Dsus4', position: 12 },
                { chord: 'Em7', position: 25 }
              ],
              lyrics: 'And all the roads we have to walk are winding'
            },
            {
              chords: [
                { chord: 'Cadd9', position: 0 },
                { chord: 'Dsus4', position: 12 },
                { chord: 'Em7', position: 27 }
              ],
              lyrics: 'And all the lights that lead us there are blinding'
            },
            {
              chords: [
                { chord: 'Cadd9', position: 0 },
                { chord: 'Dsus4', position: 8 },
                { chord: 'G', position: 18 },
                { chord: 'Dsus4', position: 20 },
                { chord: 'Em7', position: 28 }
              ],
              lyrics: 'There are many things that I'
            },
            {
              chords: [
                { chord: 'Cadd9', position: 0 },
                { chord: 'Dsus4', position: 12 },
                { chord: 'G', position: 27 }
              ],
              lyrics: 'Would like to say to you but I don\'t know how'
            }
          ]
        },
        {
          name: 'Puente',
          lines: [
            {
              chords: [
                { chord: 'Cadd9', position: 0 },
                { chord: 'Em7', position: 10 }
              ],
              lyrics: 'Because maybe'
            },
            {
              chords: [
                { chord: 'G', position: 0 },
                { chord: 'Em7', position: 10 }
              ],
              lyrics: 'You\'re gonna be the one that saves me'
            },
            {
              chords: [
                { chord: 'Cadd9', position: 0 },
                { chord: 'Em7', position: 10 },
                { chord: 'G', position: 20 },
                { chord: 'Em7', position: 30 }
              ],
              lyrics: 'And after all, you\'re my wonderwall'
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getHotelCaliforniaData(): Song {
    return {
      id: 'hotel-california',
      title: 'Hotel California',
      artist: 'Eagles',
      key: 'Bm',
      tempo: 74,
      timeSignature: '4/4',
      tuning: 'Standard (EADGBE)',
      difficulty: 'intermediate',
      story: 'Clásico atemporal de Eagles de 1976. Conocida por su icónico solo de guitarra y letras misteriosas.',
      sections: [
        {
          name: 'Intro',
          lines: [
            {
              chords: [
                { chord: 'Bm', position: 0 },
                { chord: 'F#', position: 12 },
                { chord: 'A', position: 24 },
                { chord: 'E', position: 36 }
              ],
              lyrics: ''
            }
          ]
        },
        {
          name: 'Verso 1',
          lines: [
            {
              chords: [
                { chord: 'Bm', position: 0 }
              ],
              lyrics: 'On a dark desert highway'
            },
            {
              chords: [
                { chord: 'F#', position: 0 }
              ],
              lyrics: 'Cool wind in my hair'
            },
            {
              chords: [
                { chord: 'A', position: 0 }
              ],
              lyrics: 'Warm smell of colitas'
            },
            {
              chords: [
                { chord: 'E', position: 0 }
              ],
              lyrics: 'Rising up through the air'
            }
          ]
        },
        {
          name: 'Coro',
          lines: [
            {
              chords: [
                { chord: 'G', position: 0 },
                { chord: 'D', position: 20 }
              ],
              lyrics: 'Welcome to the Hotel California'
            },
            {
              chords: [
                { chord: 'Em', position: 0 },
                { chord: 'F#', position: 30 }
              ],
              lyrics: 'Such a lovely place (such a lovely place)'
            },
            {
              chords: [
                { chord: 'G', position: 0 },
                { chord: 'D', position: 25 }
              ],
              lyrics: 'Plenty of room at the Hotel California'
            },
            {
              chords: [
                { chord: 'Em', position: 0 },
                { chord: 'F#', position: 18 }
              ],
              lyrics: 'Any time of year, you can find it here'
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getStairwayToHeavenData(): Song {
    return {
      id: 'stairway-to-heaven',
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      key: 'Am',
      tempo: 82,
      timeSignature: '4/4',
      tuning: 'Standard (EADGBE)',
      difficulty: 'advanced',
      story: 'Obra maestra de Led Zeppelin de 1971. Considerada una de las mejores canciones de rock de todos los tiempos.',
      sections: [
        {
          name: 'Intro',
          lines: [
            {
              chords: [
                { chord: 'Am', position: 0 },
                { chord: 'E/G#', position: 8 },
                { chord: 'C/G', position: 16 },
                { chord: 'D/F#', position: 24 }
              ],
              lyrics: ''
            }
          ]
        },
        {
          name: 'Verso 1',
          lines: [
            {
              chords: [
                { chord: 'Am', position: 0 },
                { chord: 'E/G#', position: 23 }
              ],
              lyrics: 'There\'s a lady who\'s sure'
            },
            {
              chords: [
                { chord: 'C/G', position: 0 },
                { chord: 'D/F#', position: 20 }
              ],
              lyrics: 'All that glitters is gold'
            },
            {
              chords: [
                { chord: 'Fmaj7', position: 0 },
                { chord: 'G', position: 15 },
                { chord: 'Am', position: 30 }
              ],
              lyrics: 'And she\'s buying a stairway to heaven'
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

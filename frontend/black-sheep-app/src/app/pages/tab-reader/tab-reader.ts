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
    // For now, using mock data
    this.loadMockSong();
  }

  private loadMockSong(): void {
    // Mock song data with complete tablature
    this.song.set({
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
    });
    this.loading.set(false);
  }
}

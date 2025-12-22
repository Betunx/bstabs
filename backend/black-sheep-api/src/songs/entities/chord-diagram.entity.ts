import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Song } from './song.entity';

export enum InstrumentType {
  GUITAR = 'guitar',
  BASS = 'bass',
  PIANO = 'piano'
}

@Entity('chord_diagrams')
export class ChordDiagram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  chordName: string;

  @Column({
    type: 'enum',
    enum: InstrumentType
  })
  instrument: InstrumentType;

  @Column({ type: 'jsonb' })
  diagram: any;

  @ManyToOne(() => Song, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'song_id' })
  song: Song;

  @Column({ name: 'song_id' })
  songId: string;
}

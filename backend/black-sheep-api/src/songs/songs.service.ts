import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song, SongStatus } from './entities/song.entity';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
  ) {}

  async create(createSongDto: CreateSongDto): Promise<Song> {
    const song = this.songRepository.create(createSongDto);
    return await this.songRepository.save(song);
  }

  async findAll(status?: SongStatus): Promise<Song[]> {
    const query = this.songRepository.createQueryBuilder('song');

    if (status) {
      query.where('song.status = :status', { status });
    }

    return await query
      .orderBy('song.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Song> {
    const song = await this.songRepository.findOne({ where: { id } });

    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }

    return song;
  }

  async update(id: string, updateSongDto: UpdateSongDto): Promise<Song> {
    const song = await this.findOne(id);

    Object.assign(song, updateSongDto);

    return await this.songRepository.save(song);
  }

  async remove(id: string): Promise<void> {
    const song = await this.findOne(id);
    await this.songRepository.remove(song);
  }

  async publish(id: string): Promise<Song> {
    const song = await this.findOne(id);

    song.status = SongStatus.PUBLISHED;
    song.publishedAt = new Date();

    return await this.songRepository.save(song);
  }

  async archive(id: string): Promise<Song> {
    const song = await this.findOne(id);
    song.status = SongStatus.ARCHIVED;
    return await this.songRepository.save(song);
  }

  async importBatch(songs: CreateSongDto[]): Promise<{ imported: number; failed: number; songs: Song[] }> {
    const results: Song[] = [];
    let failed = 0;

    for (const songDto of songs) {
      try {
        const song = await this.create(songDto);
        results.push(song);
      } catch (error) {
        failed++;
        console.error(`Failed to import song: ${songDto.title}`, error);
      }
    }

    return {
      imported: results.length,
      failed,
      songs: results
    };
  }

  async incrementViews(id: string): Promise<void> {
    await this.songRepository.increment({ id }, 'views', 1);
  }

  async searchByTitle(query: string): Promise<Song[]> {
    return await this.songRepository
      .createQueryBuilder('song')
      .where('LOWER(song.title) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(song.artist) LIKE LOWER(:query)', { query: `%${query}%` })
      .andWhere('song.status = :status', { status: SongStatus.PUBLISHED })
      .orderBy('song.views', 'DESC')
      .getMany();
  }
}

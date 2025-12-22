import { IsString, IsOptional, IsArray, IsEnum, IsUrl, MaxLength } from 'class-validator';
import { SongStatus } from '../entities/song.entity';

export class CreateSongDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(200)
  artist: string;

  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  chords?: string[];

  @IsEnum(SongStatus)
  @IsOptional()
  status?: SongStatus;

  @IsUrl()
  @IsOptional()
  sourceUrl?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  genre?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

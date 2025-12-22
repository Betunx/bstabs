import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSongDto } from './create-song.dto';

export class ImportBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSongDto)
  songs: CreateSongDto[];
}

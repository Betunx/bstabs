import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { ImportBatchDto } from './dto/import-batch.dto';
import { SongStatus } from './entities/song.entity';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { CsrfGuard } from '../guards/csrf.guard';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @UseGuards(ApiKeyGuard, CsrfGuard)
  create(@Body() createSongDto: CreateSongDto) {
    return this.songsService.create(createSongDto);
  }

  @Get()
  findAll(@Query('status') status?: SongStatus) {
    return this.songsService.findAll(status);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.songsService.searchByTitle(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const song = await this.songsService.findOne(id);
    await this.songsService.incrementViews(id);
    return song;
  }

  @Patch(':id')
  @UseGuards(ApiKeyGuard, CsrfGuard)
  update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto) {
    return this.songsService.update(id, updateSongDto);
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard, CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.songsService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(ApiKeyGuard, CsrfGuard)
  publish(@Param('id') id: string) {
    return this.songsService.publish(id);
  }

  @Post(':id/archive')
  @UseGuards(ApiKeyGuard, CsrfGuard)
  archive(@Param('id') id: string) {
    return this.songsService.archive(id);
  }

  @Post('import/batch')
  @UseGuards(ApiKeyGuard, CsrfGuard)
  async importBatch(@Body() importBatchDto: ImportBatchDto) {
    return this.songsService.importBatch(importBatchDto.songs);
  }
}

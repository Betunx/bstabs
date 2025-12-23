import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongsModule } from './songs/songs.module';
import { CommonModule } from './common/common.module';
import { databaseConfig } from './config/database.config';
import { APP_CONSTANTS } from './common/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    // Rate limiting using centralized constants
    ThrottlerModule.forRoot([{
      ttl: APP_CONSTANTS.RATE_LIMIT_TTL,
      limit: APP_CONSTANTS.RATE_LIMIT_MAX,
    }]),
    CommonModule,
    SongsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

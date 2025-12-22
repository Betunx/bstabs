import { Module } from '@nestjs/common';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { CsrfGuard } from '../guards/csrf.guard';

/**
 * Common module for shared guards, interceptors, and utilities
 */
@Module({
  providers: [ApiKeyGuard, CsrfGuard],
  exports: [ApiKeyGuard, CsrfGuard],
})
export class CommonModule {}

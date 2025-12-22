import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';

/**
 * CSRF Protection Guard
 * Validates that requests come from the expected origin
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly allowedOrigins: string[] = [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'https://bstabs.com',
    'https://www.bstabs.com',
  ];

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const origin = request.headers.origin || request.headers.referer;

    // Allow GET, HEAD, OPTIONS (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Check origin for state-changing operations
    if (!origin) {
      throw new ForbiddenException('Missing origin header');
    }

    // Validate origin is in allowed list
    const isAllowed = this.allowedOrigins.some((allowed) =>
      origin.startsWith(allowed),
    );

    if (!isAllowed) {
      throw new ForbiddenException('Invalid origin');
    }

    return true;
  }

  /**
   * Generate CSRF token for frontend
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate CSRF token
   */
  static validateToken(token: string, expectedToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken),
    );
  }
}

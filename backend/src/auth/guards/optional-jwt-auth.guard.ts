import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to make authentication optional
  handleRequest(err: any, user: any) {
    // If there's an error or no user, just return null (no authentication)
    // This allows the request to proceed without authentication
    if (err || !user) {
      return null;
    }
    return user;
  }
}

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InvitationService } from '../services/invitation-service/invitation.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Array of paths that don't require authentication
  private readonly publicPaths = ['/login', '/signup'];

  constructor(private router: Router, private invitationService: InvitationService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isPublicPath = this.publicPaths.some((path) =>
      req.url.includes(path)
    );

    const token = localStorage.getItem('authToken');

    // If it's a public path, proceed without token
    if (isPublicPath) {
      return next.handle(req);
    }

    // For protected routes, check token
    if (token) {
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });

      return next.handle(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Clear local storage
            localStorage.clear();
            // Redirect to login
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: this.router.url },
            });
          }
          return throwError(() => error);
        })
      );
    } else {
      // No token found for protected route
      localStorage.clear();
      this.invitationService.removeInvitationPoll();
      this.router.navigate(['/login']);
      return throwError(() => new Error('No authentication token found'));
    }
  }
}

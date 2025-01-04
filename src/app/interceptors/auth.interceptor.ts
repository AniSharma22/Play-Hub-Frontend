import { inject } from '@angular/core';
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

export class AuthInterceptor implements HttpInterceptor {
  // Array of paths that don't require authentication
  private readonly publicPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ];

  // Use dependency injection context to avoid constructor injection
  private router = inject(Router);

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
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.clear();
          this.router.navigate(['/home']);
          // this.router.navigate(['/login'], {
          //         queryParams: { returnUrl: this.router.url },
          //       });
          // this.handleUnauthorized();
        }
        return throwError(() => error);
      })
    );
  }
}

// private handleUnauthorized(): void {
//   // Centralized method to handle unauthorized access
//   try {
//     localStorage.clear();
//     this.authService.loggedIn$.set(false);
//     this.invitationService.removeInvitationPoll();
//     this.router.navigate(['/login'], {
//       queryParams: { returnUrl: this.router.url },
//     });
//   } catch (err) {
//     console.error('Error during unauthorized handling:', err);
//   }
// }

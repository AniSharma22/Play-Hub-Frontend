import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service/auth.service';
import { Role } from '../../../models/models';
import { AuthGuard } from './auth.guard';
import { signal } from '@angular/core';

describe('AuthGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Create spy objects for AuthService and Router
    authService = jasmine.createSpyObj('AuthService', [], {
      role$: signal(Role.user) // Default to non-admin role
    });

    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));

    // Configure the testing module
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow access for admin role', () => {
    // Arrange
    authService.role$.set(Role.admin);

    // Act
    const canActivate = TestBed.runInInjectionContext(() =>
      AuthGuard({} as any, {} as any)
    );

    // Assert
    expect(canActivate).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect non-admin users to Home', async () => {
    // Arrange
    authService.role$.set(Role.user);
    router.navigate.and.returnValue(Promise.resolve(true));

    // Act
    const canActivate = await TestBed.runInInjectionContext(() =>
      AuthGuard({} as any, {} as any)
    );

    // Assert
    expect(canActivate).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['Home']);
  });
});

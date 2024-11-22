// import { TestBed } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { AuthService } from '../../../services/auth-service/auth.service';
// import { AuthGuard } from './auth.guard';
// import { Role } from '../../../models/models';
//
// describe('AuthGuard', () => {
//   let authService: jasmine.SpyObj<AuthService>;
//   let router: jasmine.SpyObj<Router>;
//
//   beforeEach(() => {
//     authService = jasmine.createSpyObj('AuthService', [], { role$: () => Role.user });
//     router = jasmine.createSpyObj('Router', ['navigate']);
//
//     TestBed.configureTestingModule({
//       providers: [
//         { provide: AuthService, useValue: authService },
//         { provide: Router, useValue: router }
//       ]
//     });
//   });
//
//   it('should allow access for admin role', () => {
//     authService.role$ = () => Role.admin;
//
//     const result = TestBed.runInInjectionContext(() =>
//       AuthGuard(
//         {} as any,
//         {} as any
//       )
//     );
//
//     expect(result).toBe(true);
//   });
//
//   it('should redirect non-admin users to Home', async () => {
//     authService.role$ = () => Role.user;
//     router.navigate.and.returnValue(Promise.resolve(true));
//
//     const result = await TestBed.runInInjectionContext(() =>
//       AuthGuard(
//         {} as any,
//         {} as any
//       )
//     );
//
//     expect(router.navigate).toHaveBeenCalledWith(['Home']);
//     expect(result).toBe(false);
//   });
// });

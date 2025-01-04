import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../../../services/auth-service/auth.service';


export const LogoutGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  if (!authService.loggedIn$()){
    return true;
  }else{
    return router.navigate(['Home']).then(() => false);
  }
};

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { jwtDecode } from 'jwt-decode';
import { InvitationService } from '../../../services/invitation-service/invitation.service';

export const LoginGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const invitationService: InvitationService = inject(InvitationService);

  if (hasValidToken()) {
    return true;
  } else {
    invitationService.removeInvitationPoll();
    return router.navigate(['login']).then(() => false);
  }
};

function hasValidToken(): boolean {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return false;
  }

  try {
    const decodedToken: { exp: number } = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    // Check if the token has expired
    return decodedToken.exp > currentTime;
  } catch (error) {
    // In case of any error (invalid token format, decoding issues), treat it as invalid
    return false;
  }
}

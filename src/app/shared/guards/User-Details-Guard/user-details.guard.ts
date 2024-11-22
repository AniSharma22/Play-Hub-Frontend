import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

import { UserService } from '../../../services/user-service/user.service';
import { InvitationService } from '../../../services/invitation-service/invitation.service';

export const UserDetailsGuard: CanActivateFn = (
  route,
  state
): boolean | UrlTree | Promise<boolean | UrlTree> => {
  const userService: UserService = inject(UserService);
  const invitationService = inject(InvitationService)
  const router: Router = inject(Router);

  if (userService.selectedUser) {
    return true;
  } else {
    invitationService.removeInvitationPoll();
    return router.navigate(['login']).then(() => false);
  }
};

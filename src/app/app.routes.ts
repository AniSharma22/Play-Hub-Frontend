import { Routes } from '@angular/router';

import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { BookingsComponent } from './components/bookings/bookings.component';
import { InvitationsComponent } from './components/invitations/invitations.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { GameComponent } from './components/game/game.component';
import { UsersComponent } from './components/users/users.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './shared/guards/auth-guard/auth.guard';
import { UserDetailsGuard } from './shared/guards/User-Details-Guard/user-details.guard';
import { LoginGuard } from './shared/guards/login-guard/login-guard.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'bookings',
    component: BookingsComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'invitations',
    component: InvitationsComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'game',
    component: GameComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [LoginGuard, AuthGuard],
  },
  {
    path: 'users/details',
    component: UserDetailsComponent,
    canActivate: [LoginGuard, AuthGuard, UserDetailsGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [LoginGuard],
  },
  {
    path: '**',
    component: HomeComponent,
  },
];

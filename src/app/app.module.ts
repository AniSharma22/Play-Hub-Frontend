import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  provideRouter,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  withComponentInputBinding,
} from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
} from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
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
import { SpinnerComponent } from './components/spinner/spinner.component';
import { FallbackComponent } from './components/fallback/fallback.component';
import { FullTimePipe } from './shared/pipes/full-time-pipe/full-time.pipe';
import { TimePipe } from './shared/pipes/time-pipe/time.pipe';

import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { ChipModule } from 'primeng/chip';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { StyleClassModule } from 'primeng/styleclass';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputGroupModule } from 'primeng/inputgroup';
import { ChipsModule } from 'primeng/chips';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PaginatorModule } from 'primeng/paginator';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LandingPageComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    BookingsComponent,
    InvitationsComponent,
    LeaderboardComponent,
    GameComponent,
    UsersComponent,
    UserDetailsComponent,
    ProfileComponent,
    SpinnerComponent,
    FallbackComponent,
    FullTimePipe,
    TimePipe,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    ButtonModule,
    RippleModule,
    CardModule,
    NgOptimizedImage,
    RouterOutlet,
    RouterLink,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    FloatLabelModule,
    DropdownModule,
    AvatarModule,
    RouterLinkActive,
    ChipModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    StyleClassModule,
    ToastModule,
    DividerModule,
    HttpClientModule,
    OverlayPanelModule,
    InputGroupModule,
    ChipsModule,
    InputGroupAddonModule,
    DialogModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    FormsModule,
    InputSwitchModule,
    PaginatorModule,
    FileUploadModule,
    CommonModule,
    FileUploadModule,
    TooltipModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    MessageService,
    ConfirmationService,
  ],
  bootstrap: [AppComponent],
  exports: [NavbarComponent],
})
export class AppModule {}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { InvitationService } from '../../services/invitation-service/invitation.service';
import { signal } from '@angular/core';
import { Gender, Role } from '../../models/models';
import { AvatarModule } from 'primeng/avatar';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let invitationServiceSpy: jasmine.SpyObj<InvitationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser = {
    user_id: '1',
    username: 'test-user',
    email: '1',
    password: '1',
    mobile_number: '1',
    gender: Gender.male,
    role: Role.user,
    image_url: 'test',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login'], {
      role$: signal(Role.user),
      user$: signal(mockUser),
      loggedIn$: signal(true),
    });
    invitationServiceSpy = jasmine.createSpyObj(
      'InvitationService',
      ['removeInvitationPoll'],
      {
        isInvitationPending$: signal(true),
      }
    );
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [AvatarModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: InvitationService, useValue: invitationServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the signup page when signup is clicked', () => {
    component.onSignup();

    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['signup']);
  });

  it('should navigate to the login page when login is clicked', () => {
    component.onLogin();

    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['login']);
  });

  it('should navigate to the profile page when profile is clicked', () => {
    component.onProfile();

    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['profile']);
  });

  it('should clear the token, set the loggedIn status to false, clear the invitation poll (setInterval) and navigate to the landing page ', () => {
    spyOn(localStorage, 'removeItem');
    component.onLogout();

    expect(authServiceSpy.loggedIn$()).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(invitationServiceSpy.removeInvitationPoll).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  });
});

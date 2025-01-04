import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageComponent } from './landing-page.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [''], {
      loggedIn$: signal(true),
    });
    routerSpy = jasmine.createSpyObj('RouterService', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LandingPageComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to home page if user is logged in and playNow is clicked', () => {
    component.onPlayNow();

    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['home']);
  });

  it('should navigate to login page if user is logged out and playNow is clicked', () => {
    authServiceSpy.loggedIn$.set(false);
    component.onPlayNow();

    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['login']);
  });
});

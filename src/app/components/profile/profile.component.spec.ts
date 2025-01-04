import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { UserService } from '../../services/user-service/user.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { User } from '../../models/user.models';
import { Gender, Role } from '../../models/models';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AVATARS } from '../../shared/constants/constants';
import { HttpResponse } from '@angular/common/http';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockUser: User = {
    user_id: "2",
    username: "test",
    email: "test.test@watchguard.com",
    password: "test-pass",
    mobile_number: "9902783940",
    gender: Gender.male,
    role: Role.user,
    image_url: "test-image",
    created_at: new Date(),
    updated_at: new Date()
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [''], {
      user$: signal(mockUser)
    });
    userServiceSpy = jasmine.createSpyObj('UserService', ['updateUserDetails']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showSuccess']);

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form with user data', () => {
      expect(component.form.get('username')?.value).toBe(mockUser.username);
      expect(component.form.get('phoneNo')?.value).toBe(mockUser.mobile_number);
      expect(component.selectedAvatar).toBe(mockUser.image_url);
    });

    it('should initialize form in disabled state', () => {
      expect(component.form.disabled).toBeTrue();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.form.enable();
    });

    it('should validate required username', () => {
      const usernameControl = component.form.get('username');
      usernameControl?.setValue('');
      expect(usernameControl?.errors?.['required']).toBeTruthy();
    });

    it('should validate phone number format', () => {
      const phoneControl = component.form.get('phoneNo');
      phoneControl?.setValue('123'); // Invalid phone number
      expect(phoneControl?.errors?.['invalidPhoneNumber']).toBeTruthy();

      phoneControl?.setValue('9902783940'); // Valid phone number
      expect(phoneControl?.errors).toBeNull();
    });

    it('should validate password when entered', () => {
      const passwordControl = component.form.get('password');
      const confirmPasswordControl = component.form.get('confirmPassword');

      passwordControl?.setValue('weak');
      expect(passwordControl?.errors?.['invalidPassword']).toBeTruthy();

      passwordControl?.setValue('StrongPass123!');
      confirmPasswordControl?.setValue('DifferentPass123!');
      expect(component.form.errors?.['passwordMismatch']).toBeTruthy();

      confirmPasswordControl?.setValue('StrongPass123!');
      expect(component.form.errors).toBeNull();
    });
  });

  describe('Edit Mode', () => {
    it('should enable form when edit mode is activated', () => {
      component.onEdit();
      expect(component.isEditable).toBeTrue();
      expect(component.form.enabled).toBeTrue();
    });

    it('should disable form when edit mode is deactivated', () => {
      component.onEdit(); // Enable
      component.onEdit(); // Disable
      expect(component.isEditable).toBeFalse();
      expect(component.form.disabled).toBeFalse();
    });
  });

  describe('Update User Details', () => {
    beforeEach(() => {
      component.form.enable();
    });

    it('should update user details when form is valid and details have changed', () => {
      const updatedDetails = {
        username: 'newUsername',
        phoneNo: '9876543210',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      let mockResponse = new HttpResponse({
        body: {

        }
      });

      userServiceSpy.updateUserDetails.and.returnValue(of(mockResponse));

      component.form.patchValue(updatedDetails);
      component.selectedAvatar = 'new-avatar-url';
      component.isEditable = true;

      component.onEdit(); // This will trigger the update

      expect(userServiceSpy.updateUserDetails).toHaveBeenCalledWith(
        updatedDetails.username,
        updatedDetails.password,
        updatedDetails.phoneNo,
        'new-avatar-url'
      );
      expect(toastServiceSpy.showSuccess).toHaveBeenCalled();
    });

    it('should not update if details are the same', () => {
      component.isEditable = true;
      component.onEdit();
      expect(userServiceSpy.updateUserDetails).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Edit', () => {
    it('should reset form to original values when cancelling edit', () => {
      component.form.enable();
      component.form.patchValue({
        username: 'changed',
        phoneNo: '9876543210',
        password: 'changed',
        confirmPassword: 'changed'
      });
      component.selectedAvatar = 'changed-avatar';

      component.cancelEdit();

      expect(component.form.get('username')?.value).toBe(mockUser.username);
      expect(component.form.get('phoneNo')?.value).toBe(mockUser.mobile_number);
      expect(component.form.get('password')?.value).toBe('');
      expect(component.form.get('confirmPassword')?.value).toBe('');
      expect(component.selectedAvatar).toBe(mockUser.image_url);
      expect(component.isEditable).toBeFalse();
      expect(component.form.disabled).toBeTrue();
    });
  });

  describe('Avatar Selection', () => {
    it('should update selectedAvatar when selecting new avatar', () => {
      const newAvatar = AVATARS[1];
      component.selectAvatar(newAvatar, {} as any);
      expect(component.selectedAvatar).toBe(newAvatar);
    });
  });

  describe('Same Details Check', () => {
    it('should return true when no changes are made', () => {
      expect(component.sameDetails()).toBeTrue();
    });

    it('should return false when changes are made', () => {
      component.form.patchValue({
        username: 'changed',
        phoneNo: '9876543210'
      });
      expect(component.sameDetails()).toBeFalse();
    });
  });
});

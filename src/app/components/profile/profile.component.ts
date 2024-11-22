import {
  Component,
  computed,
  effect,
  OnInit,
  Signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../../services/user-service/user.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { AVATARS } from '../../shared/constants/constants';
import { User } from '../../models/user.models';
import { CustomValidators } from '../../shared/custom-validator/custom-validators';

import { MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  isEditable: boolean = false;
  user: Signal<User | null> = computed(() => this.authService.user$());
  selectedAvatar: string = '';
  @ViewChild('op') overlayPanel!: OverlayPanel;

  form = new FormGroup({
    username: new FormControl<string>('', [Validators.required]),
    phoneNo: new FormControl<string | null>('', [
      Validators.required,
      CustomValidators.isValidPhoneNumber(),
    ]),
    password: new FormControl<string>(''),
    confirmPassword: new FormControl<string>(''),
  });

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService
  ) {
    effect((): void => {
      this.initializeForm(this.user());
    });
  }

  ngOnInit(): void {
    this.setupPasswordValidation();
    this.form.disable();
  }

  private initializeForm(currentUser: User | null): void {
    if (currentUser) {
      console.log(currentUser);
      this.form.patchValue({
        username: currentUser.username,
        phoneNo: currentUser.mobile_number,
      });
      this.selectedAvatar = currentUser.image_url || AVATARS[0];
    }
  }

  private setupPasswordValidation(): void {
    this.form.get('password')?.valueChanges.subscribe((value) => {
      const passwordControl = this.form.get('password');
      const confirmPasswordControl = this.form.get('confirmPassword');

      if (value && value.length > 0) {
        // Update validators if they aren't already set
        if (
          !passwordControl?.hasValidator(CustomValidators.isValidPassword())
        ) {
          passwordControl?.setValidators([CustomValidators.isValidPassword()]);
          confirmPasswordControl?.setValidators([Validators.required]);
          this.form.setValidators(
            CustomValidators.matchPassword('password', 'confirmPassword')
          );
        }
      } else {
        // Clear validators when password is empty
        passwordControl?.setValidators(null);
        confirmPasswordControl?.setValidators(null);
        this.form.setValidators(null);
      }

      passwordControl?.updateValueAndValidity({ emitEvent: false });
      confirmPasswordControl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  onEdit(): void {
    this.isEditable = !this.isEditable;
    if (this.isEditable) {
      this.form.enable();
    } else if (this.form.valid && !this.sameDetails()) {
      const updatedUser = {
        image_url: this.selectedAvatar,
        username: this.form.get('username')?.value!,
        mobile_number: this.form.get('phoneNo')?.value!,
        password: this.form.get('password')?.value!,
      };

      this.userService
        .updateUserDetails(
          updatedUser.username,
          updatedUser.password,
          updatedUser.mobile_number,
          updatedUser.image_url
        )
        .subscribe({
          next: (): void => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Details updated successfully',
            });
            const currUser: User | null = this.user();
            // TODO: Fix the type issue
            // @ts-ignore
            this.authService.user$.set({
              ...currUser,
              username: updatedUser.username,
              mobile_number: updatedUser.mobile_number,
              image_url: updatedUser.image_url,
            });
            this.cancelEdit();
          },
        });
    } else {
      this.form.disable();
    }
  }

  sameDetails(): boolean {
    const currUser: User | null = this.user();
    return (
      this.form.get('username')?.value === currUser?.username &&
      this.form.get('phoneNo')?.value === currUser?.mobile_number &&
      !this.form.get('password')?.value &&
      this.selectedAvatar === this.user()?.image_url
    );
  }

  cancelEdit(): void {
    this.isEditable = false;
    this.form.disable();
    this.selectedAvatar = this.user()?.image_url!;

    // Reset form fields with original user data
    const currUser: User | null = this.user();
    if (currUser) {
      this.form.patchValue({
        username: currUser.username,
        phoneNo: currUser.mobile_number,
        password: '',
        confirmPassword: '',
      });
      this.selectedAvatar = currUser.image_url || AVATARS[0];
    }
  }

  selectAvatar(avatar: string, op: OverlayPanel): void {
    this.selectedAvatar = avatar;
  }

  protected readonly AVATARS = AVATARS;
}

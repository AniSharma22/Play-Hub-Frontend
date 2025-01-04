import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Validator to check if email is of the format name.surname@watchguard.com
  static isValidEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      const regex = /^[a-zA-Z]+\.[a-zA-Z]+@watchguard\.com$/;
      return regex.test(email) ? null : { invalidEmail: true };
    };
  }

  // Validator for password requirements (1 uppercase, 1 lowercase, 1 number, and minimum 8 characters)
  static isValidPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const isValidLength = password?.length >= 8;
      return hasUpper && hasLower && hasNumber && isValidLength
        ? null
        : { invalidPassword: true };
    };
  }

  // Validator to check if phone number is valid (10 digits, starts with 6, 7, 8, or 9)
  static isValidPhoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneNumber = control.value;
      const regex = /^[6-9]\d{9}$/;
      return regex.test(phoneNumber) ? null : { invalidPhoneNumber: true };
    };
  }

  // Validator to check if password and confirm password match
  static matchPassword(
    passwordControlName: string,
    confirmPasswordControlName: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordControlName)?.value;
      const confirmPassword = control.get(confirmPasswordControlName)?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  // Validator to check if password and confirm password match
  static maxPlayersValidator(minPlayersControlName: string): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const minPlayers = form.get(minPlayersControlName)?.value;
      const maxPlayers = form.get('maxPlayers')?.value;

      // Only validate if both values are numbers
      if (minPlayers != null && maxPlayers != null) {
        return maxPlayers > minPlayers
          ? null
          : { maxPlayersTooLow: true };
      }

      return null;
    };
  }
}

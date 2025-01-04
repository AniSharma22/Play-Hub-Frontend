import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { CustomValidators } from './custom-validators';

describe('CustomValidators', () => {
  describe('isValidEmail', () => {
    const validator = CustomValidators.isValidEmail();

    it('should return null for valid email', () => {
      const control = new FormControl('john.doe@watchguard.com');
      expect(validator(control)).toBeNull();
    });

    it('should return invalidEmail for invalid email formats', () => {
      const testCases = [
        'johndoe@watchguard.com',           // No dot
        'john.doe@gmail.com',               // Wrong domain
        'john.doe@WATCHGUARD.COM',          // Wrong case
        'john.doe.smith@watchguard.com',    // Multiple dots
        'john@watchguard.com',              // No surname
      ];

      testCases.forEach(email => {
        const control = new FormControl(email);
        expect(validator(control)).toEqual({ invalidEmail: true });
      });
    });
  });

  describe('isValidPassword', () => {
    const validator = CustomValidators.isValidPassword();

    it('should return null for valid password', () => {
      const testCases = [
        'Password123',
        'StrongPass2023',
        'Test1234',
      ];

      testCases.forEach(password => {
        const control = new FormControl(password);
        expect(validator(control)).toBeNull();
      });
    });

    it('should return invalidPassword for invalid password', () => {
      const testCases = [
        'password',        // No uppercase, no number
        'PASSWORD',        // No lowercase, no number
        'Password',        // No number
        '12345678',        // No letters
        'Short1',          // Too short
      ];

      testCases.forEach(password => {
        const control = new FormControl(password);
        expect(validator(control)).toEqual({ invalidPassword: true });
      });
    });
  });

  describe('isValidPhoneNumber', () => {
    const validator = CustomValidators.isValidPhoneNumber();

    it('should return null for valid phone numbers', () => {
      const testCases = [
        '6123456789',
        '7987654321',
        '8765432109',
        '9876543210'
      ];

      testCases.forEach(phone => {
        const control = new FormControl(phone);
        expect(validator(control)).toBeNull();
      });
    });

    it('should return invalidPhoneNumber for invalid phone numbers', () => {
      const testCases = [
        '5123456789',      // Starts with 5
        '123456789',       // Too short
        '61234567890',     // Too long
        'abcdefghij',      // Non-numeric
      ];

      testCases.forEach(phone => {
        const control = new FormControl(phone);
        expect(validator(control)).toEqual({ invalidPhoneNumber: true });
      });
    });
  });

  describe('matchPassword', () => {
    it('should return null when passwords match', () => {
      const form = new FormGroup({
        password: new FormControl('Password123'),
        confirmPassword: new FormControl('Password123')
      }, { validators: CustomValidators.matchPassword('password', 'confirmPassword') });

      expect(form.errors).toBeNull();
    });

    it('should return passwordMismatch when passwords do not match', () => {
      const form = new FormGroup({
        password: new FormControl('Password123'),
        confirmPassword: new FormControl('Password321')
      }, { validators: CustomValidators.matchPassword('password', 'confirmPassword') });

      expect(form.errors).toEqual({ passwordMismatch: true });
    });
  });

  describe('maxPlayersValidator', () => {
    it('should return null when maxPlayers is greater than minPlayers', () => {
      const form = new FormGroup({
        minPlayers: new FormControl(2),
        maxPlayers: new FormControl(5)
      }, {
        validators: CustomValidators.maxPlayersValidator('minPlayers')
      });

      expect(form.get('maxPlayers')?.errors).toBeNull();
    });

    it('should return maxPlayersTooLow when maxPlayers is not greater than minPlayers', () => {
      const form = new FormGroup({
        minPlayers: new FormControl(5),
        maxPlayers: new FormControl(3)
      }, {
        validators: CustomValidators.maxPlayersValidator('minPlayers')
      });

      form.updateValueAndValidity(); // Trigger validation
      expect(form.errors).toEqual({ maxPlayersTooLow: true });
    });

    it('should return null when either value is null', () => {
      const form = new FormGroup({
        minPlayers: new FormControl(null),
        maxPlayers: new FormControl(5)
      }, {
        validators: CustomValidators.maxPlayersValidator('minPlayers')
      });

      expect(form.get('maxPlayers')?.errors).toBeNull();
    });
  });
});

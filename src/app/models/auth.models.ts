import { Role } from './models';

export type httpError = {
  error: {
    code: number;
    message: string;
  };
};

export type LoginResponse = {
  code: number;
  role: Role;
  token: string;
};

export type SignupResponse = {
  code: number;
  role: Role;
  token: string;
};

export type loginRequest = {
  email: string;
  password: string;
};

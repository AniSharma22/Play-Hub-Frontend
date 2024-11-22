import { Gender, Role } from './models';

export type User = {
  user_id: string;
  username: string;
  email: string;
  password: string;
  mobile_number: string;
  gender: Gender;
  role: Role;
  image_url: string;
  created_at: Date;
  updated_at: Date;
};

export type UsersResponse = {
  code: number;
  message: string;
  total: number;
  users: User[];
};

export type UserResponse = {
  code : number;
  message: string;
  user: User;
}

export type UserDetails = {
  email: string;
  password: string;
  phoneNo: number;
  gender: Gender;
};

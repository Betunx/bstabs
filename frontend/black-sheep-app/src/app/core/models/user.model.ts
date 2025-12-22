export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/** User as returned from auth API (me, login, register). */
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

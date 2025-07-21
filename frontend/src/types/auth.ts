export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: "author" | "admin";
  profile_image_url?: string;
  avatar_path?: string;
  bio?: string;
  career_description?: string;
  x_url?: string;
  github_url?: string;
  profile_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  name?: string;
  role?: "author" | "admin";
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

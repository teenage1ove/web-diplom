export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  height: string | null;
  weight: string | null;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens?: AuthTokens; // Optional - tokens are now in httpOnly cookies
  message?: string;
}

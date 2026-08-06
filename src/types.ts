export type AuthProvider = 'Google' | 'Facebook';

export interface UserProfile {
  name: string;
  email: string;
  provider: AuthProvider;
  avatar: string;
}

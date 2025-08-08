import { ReactNode } from 'react';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthProvider: ({ children }: { children: ReactNode }) => JSX.Element;
export const useAuth: () => AuthContextType;

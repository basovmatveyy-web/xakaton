import { createContext } from 'react';
import type { User, SnilsLoginRequest } from '../../types/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  loginWithDemo: (personaId: string) => Promise<boolean>;
  loginWithSferumId: (customName?: string) => Promise<boolean>;
  loginWithSnils: (req: SnilsLoginRequest) => Promise<boolean>;
  loginWithEsia: () => Promise<boolean>;
  switchRole: (personaId: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

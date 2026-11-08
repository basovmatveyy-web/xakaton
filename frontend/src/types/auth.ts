export type UserRole = 'class_teacher' | 'teacher' | 'zavuch' | 'staff' | 'student';
export type AuthThemeMode = 'light' | 'oled' | 'slate' | 'contrast';

export interface User {
  id: number;
  fullName: string;
  shortName: string;
  role: UserRole;
  roleTitle: string;
  subject: string;
  assignedClass?: string | null;
  school: string;
  email: string;
  sferumUserId: string;
  avatarUrl?: string;
  snils?: string;
  authMethod: 'sferum_id' | 'snils' | 'esia' | 'demo';
}

export interface DemoPersona {
  id: string;
  role: UserRole;
  fullName: string;
  shortName: string;
  roleTitle: string;
  subject: string;
  assignedClass?: string | null;
  classroom?: string;
  school: string;
  email: string;
  sferumUserId: string;
  badge: string;
  badgeColor: string;
  features: string[];
  description: string;
  recommendedFor: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loginTime?: string;
}

export interface SnilsLoginRequest {
  snils: string;
  password: string;
  schoolId: string;
  rememberMe?: boolean;
}

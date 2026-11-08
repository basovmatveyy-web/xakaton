// Основные визуальные компоненты экрана авторизации проекта «СФЕРУМ.КАБИНЕТ»
export { AuthLayout } from './AuthLayout';
export type { AuthLayoutProps } from './AuthLayout';

export { AuthHeader } from './AuthHeader';
export type { AuthHeaderProps } from './AuthHeader';

export type { AuthThemeMode } from '../../types/auth';

export { SferumIdButton } from './SferumIdButton';
export type { SferumIdButtonProps } from './SferumIdButton';

export { SferumEmblem } from './SferumLogo';

// Контекст и вспомогательные компоненты авторизации
export { AuthProvider } from './AuthContext';
export { useAuth } from './useAuth';
export { AuthContext } from './context';
export type { AuthContextType } from './context';
export { AuthView } from './AuthView';
export { AuthModal } from './AuthModal';
export { TeacherProfileModal } from './TeacherProfileModal';
export { DemoRoleSelector } from './DemoRoleSelector';
export { VkIdTab } from './VkIdTab';
export { SnilsLoginTab } from './SnilsLoginTab';
export { DEMO_PERSONAS, personaToUser, SCHOOLS_LIST } from './demoPersonas';

import React from 'react';
import { TeacherProfileModal } from './TeacherProfileModal';
import type { AuthThemeMode } from '../../types/auth';

export interface AuthModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  theme?: AuthThemeMode;
  setTheme?: (t: AuthThemeMode) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ id, isOpen, onClose, theme = 'light', setTheme }) => {
  return (
    <TeacherProfileModal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      theme={theme}
      setTheme={setTheme}
    />
  );
};

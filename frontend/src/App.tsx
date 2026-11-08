import { useState, useEffect } from 'react';
import {
  AppRoot,
  ConfigProvider,
  AdaptivityProvider
} from '@vkontakte/vkui';
import { AuthProvider, useAuth, AuthView, AuthModal } from './components/auth';
import { CabinetView } from './components/cabinet/CabinetView';
import { ToastProvider } from './components/common/ToastContext';
import type { AuthThemeMode } from './types/auth';

interface SystemStatus {
  service: string;
  status: string;
  framework: string;
  database: string;
  school: string;
  activeClass: string;
  stats: {
    usersCount: number;
    roomsCount: number;
    lessonsCount: number;
    statementsCount: number;
    ticketsCount: number;
  };
}

function CabinetApp() {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const [theme, setTheme] = useState<AuthThemeMode>('light');
  const [apiStatus, setApiStatus] = useState<SystemStatus | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Применяем data-theme к body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Запрос статуса бэкенда
  useEffect(() => {
    fetch('/api/system/status')
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch((err) => {
        console.warn('API fetch fallback:', err);
        setApiStatus({
          service: 'Сферум.Кабинет API (Local Core)',
          status: 'Online',
          framework: '.NET 10 (ASP.NET Core Web API)',
          database: 'SQLite (sferum_cabinet.db)',
          school: 'МАОУ ЛИТ г. Новосибирска',
          activeClass: '9А (Классрук: Лосив Р. Б.)',
          stats: {
            usersCount: 5,
            roomsCount: 7,
            lessonsCount: 9,
            statementsCount: 4,
            ticketsCount: 3
          }
        });
      });
  }, []);

  // Если пользователь не авторизован — показывается экран входа
  if (!isAuthenticated) {
    return (
      <ConfigProvider colorScheme={theme === 'light' || theme === 'contrast' ? 'light' : 'dark'}>
        <AdaptivityProvider>
          <AppRoot>
            <AuthView theme={theme} setTheme={setTheme} apiStatus={apiStatus} />
          </AppRoot>
        </AdaptivityProvider>
      </ConfigProvider>
    );
  }

  // Главное рабочее пространство
  return (
    <ConfigProvider colorScheme={theme === 'light' || theme === 'contrast' ? 'light' : 'dark'}>
      <AdaptivityProvider>
        <AppRoot>
          <CabinetView
            user={user}
            theme={theme}
            setTheme={setTheme}
            logout={logout}
            switchRole={switchRole}
            apiStatus={apiStatus}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
          <AuthModal
            id="main-auth-modal"
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            theme={theme}
            setTheme={setTheme}
          />
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CabinetApp />
      </ToastProvider>
    </AuthProvider>
  );
}

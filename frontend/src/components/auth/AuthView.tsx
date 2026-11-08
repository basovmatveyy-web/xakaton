import React, { useState, useEffect } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { Button, Input, Select } from '@vkontakte/vkui';
import {
  Sun,
  Moon,
  Layers,
  Eye,
  EyeOff,
  BookOpen,
  ShieldCheck,
  Wrench,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from './useAuth';
import { DEMO_PERSONAS, SCHOOLS_LIST } from './demoPersonas';
import { formatSnils } from './utils';
import type { AuthThemeMode } from '../../types/auth';

export type AuthTabType = 'vk_id' | 'snils' | 'demo';

export interface AuthViewProps {
  theme: AuthThemeMode;
  setTheme: (t: AuthThemeMode) => void;
  apiStatus?: {
    service: string;
    database: string;
    framework: string;
  } | null;
  defaultTab?: AuthTabType;
}

export const AuthView: React.FC<AuthViewProps> = ({
  theme,
  setTheme,
  defaultTab = 'vk_id'
}) => {
  const [activeTab, setActiveTab] = useState<AuthTabType>(defaultTab);
  const {
    loginWithDemo,
    loginWithSferumId,
    loginWithSnils,
    loginWithEsia,
    isLoading,
    authError
  } = useAuth();

  // Состояние вкладки СНИЛС
  const [schoolId, setSchoolId] = useState(SCHOOLS_LIST[0].id);
  const [snils, setSnils] = useState('154-289-902 84');
  const [password, setPassword] = useState('Lit2026!Secured');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Состояние вкладки Сферум ID
  const [useOtherAccount, setUseOtherAccount] = useState(false);
  const [customName, setCustomName] = useState('');
  const [detectedVkUser, setDetectedVkUser] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  } | null>(() => {
    if (typeof window !== 'undefined' && (window as any).WebApp?.initDataUnsafe?.user) {
      const u = (window as any).WebApp.initDataUnsafe.user;
      return {
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name || '',
        photoUrl: u.photo_url
      };
    }
    return null;
  });

  // Автоматическое распознавание реального профиля VK / MAX WebApp
  useEffect(() => {
    let active = true;

    // Проверка через VK Bridge (только внутри платформы VK / Сферум)
    if (typeof window !== 'undefined' && (vkBridge.isEmbedded() || vkBridge.isIframe())) {
      Promise.race([
        vkBridge.send('VKWebAppGetUserInfo'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 350))
      ])
        .then((info: any) => {
          if (active && info && info.id) {
            setDetectedVkUser({
              id: info.id,
              firstName: info.first_name,
              lastName: info.last_name,
              photoUrl: info.photo_200 || (info as any).photo_100
            });
          }
        })
        .catch((err) => {
          console.info('VK Bridge user info check (standalone/browser):', err);
        });
    }
    return () => {
      active = false;
    };
  }, []);

  const isContrast = theme === 'contrast';

  // Цветовые токены
  const themeStyles = {
    light: {
      pageBg: '#f1f3f6',
      cardBg: 'rgba(255, 255, 255, 0.94)',
      cardBackdropFilter: 'blur(24px)',
      cardBorder: '1px solid rgba(255, 255, 255, 0.85)',
      cardShadow: '0 20px 48px -10px rgba(0, 30, 90, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      inputBg: '#f8fafc',
      inputBorder: '#e2e8f0',
      pillBg: '#f1f5f9',
      activePillBg: '#ffffff',
      activePillShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
    },
    oled: {
      pageBg: '#05070a',
      cardBg: 'rgba(13, 15, 20, 0.88)',
      cardBackdropFilter: 'blur(24px)',
      cardBorder: '1px solid rgba(255, 255, 255, 0.12)',
      cardShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 119, 255, 0.08)',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      inputBg: 'rgba(19, 23, 32, 0.85)',
      inputBorder: '#272f3d',
      pillBg: 'rgba(19, 23, 32, 0.9)',
      activePillBg: '#1e2430',
      activePillShadow: '0 2px 6px rgba(0, 0, 0, 0.4)'
    },
    slate: {
      pageBg: '#0a0d14',
      cardBg: 'rgba(22, 27, 36, 0.9)',
      cardBackdropFilter: 'blur(24px)',
      cardBorder: '1px solid rgba(255, 255, 255, 0.1)',
      cardShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      textPrimary: '#e2e8f0',
      textSecondary: '#8b9cb0',
      inputBg: 'rgba(26, 34, 46, 0.85)',
      inputBorder: '#283446',
      pillBg: 'rgba(26, 34, 46, 0.9)',
      activePillBg: '#232d3d',
      activePillShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
    },
    contrast: {
      pageBg: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '2px solid #000000',
      cardShadow: '4px 4px 0 #000000',
      textPrimary: '#000000',
      textSecondary: '#000000',
      inputBg: '#ffffff',
      inputBorder: '#000000',
      pillBg: '#ffffff',
      activePillBg: '#000000',
      activePillShadow: 'none'
    }
  }[theme];

  const handleSnilsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = snils.replace(/\D/g, '');
    if (digitsOnly.length !== 11) {
      setLocalError('СНИЛС должен содержать 11 цифр');
      return;
    }
    if (!password.trim()) {
      setLocalError('Введите пароль');
      return;
    }
    setLocalError(null);
    loginWithSnils({ snils, password, schoolId, rememberMe: true });
  };

  const getPersonaIcon = (role: string) => {
    switch (role) {
      case 'class_teacher':
        return <BookOpen size={16} color="#2d82ec" />;
      case 'zavuch':
        return <ShieldCheck size={16} color="#8b5cf6" />;
      case 'staff':
        return <Wrench size={16} color="#f59e0b" />;
      case 'student':
        return <GraduationCap size={16} color="#10b981" />;
      default:
        return <BookOpen size={16} color="#2d82ec" />;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: themeStyles.pageBg,
        backgroundImage:
          theme === 'light'
            ? 'url(/auth_bg.jpg)'
            : theme === 'oled' || theme === 'slate'
            ? 'url(/auth_bg_dark.jpg)'
            : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        transition: 'background-color 0.2s ease'
      }}
    >
      {/* Компактная карточка авторизации */}
      <div
        style={{
          width: '100%',
          maxWidth: 390,
          background: themeStyles.cardBg,
          backdropFilter: (themeStyles as Record<string, any>).cardBackdropFilter || 'none',
          WebkitBackdropFilter: (themeStyles as Record<string, any>).cardBackdropFilter || 'none',
          borderRadius: 20,
          border: themeStyles.cardBorder,
          boxShadow: themeStyles.cardShadow,
          padding: '26px 24px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          position: 'relative'
        }}
      >
        {/* Шапка карточки: Логотип + Название + Переключатель тем */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/app_icon_512.png"
              alt="Сферум.Кабинет"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                objectFit: 'contain'
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: -0.4,
                  color: themeStyles.textPrimary
                }}
              >
                СФЕРУМ.КАБИНЕТ
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: themeStyles.textSecondary,
                  fontWeight: 500,
                  marginTop: 1
                }}
              >
                МАОУ ЛИТ г. Новосибирска
              </div>
            </div>
          </div>

          {/* Быстрые 4 темы в 1 ряд */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: themeStyles.pillBg,
              padding: 2,
              borderRadius: 8,
              border: isContrast ? '1px solid #000' : 'none'
            }}
          >
            {(
              [
                { id: 'light', icon: <Sun size={13} />, label: 'Светлая' },
                { id: 'oled', icon: <Moon size={13} />, label: 'Тёмная' },
                { id: 'slate', icon: <Layers size={13} />, label: 'Грифель' },
                { id: 'contrast', icon: <Eye size={13} />, label: 'Контраст' }
              ] as const
            ).map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  title={t.label}
                  onClick={() => setTheme(t.id)}
                  style={{
                    background: active ? (isContrast ? '#000000' : themeStyles.activePillBg) : 'transparent',
                    color: active ? (isContrast ? '#ffffff' : '#2d82ec') : themeStyles.textSecondary,
                    border: 'none',
                    borderRadius: 6,
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    boxShadow: active && !isContrast ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {t.icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Сегментированные вкладки (Instagram / Grok style) */}
        <div
          role="tablist"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 3,
            background: themeStyles.pillBg,
            padding: 3,
            borderRadius: 10,
            border: isContrast ? '1px solid #000' : 'none'
          }}
        >
          {(
            [
              { id: 'vk_id', label: 'Сферум ID' },
              { id: 'snils', label: 'СНИЛС' },
              { id: 'demo', label: 'Демо-вход' }
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: active ? (isContrast ? '#000000' : themeStyles.activePillBg) : 'transparent',
                  color: active
                    ? isContrast
                      ? '#ffffff'
                      : themeStyles.textPrimary
                    : themeStyles.textSecondary,
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 0',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  boxShadow: active && !isContrast ? themeStyles.activePillShadow : 'none'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ВКЛАДКА 1: СФЕРУМ ID (1-Tap вход через VK Bridge / Сферум ID) */}
        {activeTab === 'vk_id' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!useOtherAccount ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: themeStyles.inputBg,
                  border: isContrast ? '1px solid #000' : `1px solid ${themeStyles.inputBorder}`
                }}
              >
                {detectedVkUser?.photoUrl ? (
                  <img
                    src={detectedVkUser.photoUrl}
                    alt={detectedVkUser.firstName}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '2px solid #0077FF'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0077FF 0%, #2563eb 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 15,
                      flexShrink: 0
                    }}
                  >
                    {detectedVkUser
                      ? `${detectedVkUser.firstName[0]}${detectedVkUser.lastName ? detectedVkUser.lastName[0] : ''}`
                      : 'РБ'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: themeStyles.textPrimary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {detectedVkUser
                      ? `${detectedVkUser.lastName} ${detectedVkUser.firstName}`.trim()
                      : 'Лосив Роман Борисович'}
                  </div>
                  <div style={{ fontSize: 11, color: themeStyles.textSecondary, marginTop: 1 }}>
                    {detectedVkUser
                      ? 'Сферум ID • Подтверждённый аккаунт VK'
                      : 'Классный руководитель 9А'}
                  </div>
                </div>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: themeStyles.textSecondary, marginBottom: 6 }}>
                  Имя пользователя или VK ID:
                </div>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Например: Петрова Елена"
                />
              </div>
            )}

            {/* Главная кнопка входа через VK / Сферум ID */}
            <Button
              size="l"
              stretched
              mode="primary"
              loading={isLoading}
              onClick={() => loginWithSferumId(useOtherAccount ? customName : undefined)}
              before={
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: '#ffffff',
                    color: '#0077FF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 900
                  }}
                >
                  VK
                </span>
              }
              after={<ArrowRight size={16} />}
              style={{
                height: 44,
                borderRadius: 12,
                background: '#0077FF',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                border: isContrast ? '2px solid #000' : 'none'
              }}
            >
              {useOtherAccount
                ? 'Войти'
                : detectedVkUser
                ? `Войти как ${detectedVkUser.firstName}`
                : 'Войти через Сферум ID'}
            </Button>

            <button
              type="button"
              onClick={() => setUseOtherAccount(!useOtherAccount)}
              style={{
                background: 'none',
                border: 'none',
                color: isContrast ? '#000' : '#2d82ec',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline'
              }}
            >
              {useOtherAccount ? '← Вернуться к сохраненному' : 'Войти под другим профилем'}
            </button>
          </div>
        )}

        {/* ВКЛАДКА 2: ПО СНИЛС (Gosuslugi Style) */}
        {activeTab === 'snils' && (
          <form onSubmit={handleSnilsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: themeStyles.textSecondary, marginBottom: 4 }}>
                Школа
              </div>
              <Select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                options={SCHOOLS_LIST.map((s) => ({ label: s.name, value: s.id }))}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: themeStyles.textSecondary, marginBottom: 4 }}>
                СНИЛС
              </div>
              <Input
                value={snils}
                onChange={(e) => {
                  setLocalError(null);
                  setSnils(formatSnils(e.target.value));
                }}
                placeholder="XXX-XXX-XXX XX"
                maxLength={14}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: themeStyles.textSecondary, marginBottom: 4 }}>
                Пароль
              </div>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setLocalError(null);
                    setPassword(e.target.value);
                  }}
                  placeholder="Пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: themeStyles.textSecondary,
                    cursor: 'pointer',
                    padding: 4
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {(localError || authError) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: '#fee2e2',
                  color: '#b91c1c',
                  fontSize: 12
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{localError || authError}</span>
              </div>
            )}

            <Button
              size="l"
              stretched
              mode="primary"
              type="submit"
              loading={isLoading}
              style={{
                height: 44,
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                marginTop: 2
              }}
            >
              Войти
            </Button>

            {/* Разделитель */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
              <div style={{ flex: 1, height: 1, background: isContrast ? '#000' : 'rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: 11, color: themeStyles.textSecondary }}>или</span>
              <div style={{ flex: 1, height: 1, background: isContrast ? '#000' : 'rgba(0,0,0,0.1)' }} />
            </div>

            {/* Вход через Госуслуги */}
            <Button
              size="l"
              stretched
              mode="secondary"
              loading={isLoading}
              onClick={loginWithEsia}
              before={
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: '#0d4cd3',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 900
                  }}
                >
                  ГУ
                </span>
              }
              after={<ExternalLink size={14} />}
              style={{
                height: 42,
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 13,
                border: isContrast ? '2px solid #000' : '1px solid #0d4cd340',
                color: '#0d4cd3'
              }}
            >
              Войти через Госуслуги
            </Button>
          </form>
        )}

        {/* ВКЛАДКА 3: ДЕМО-ВХОД ДЛЯ ЖЮРИ (1-Tap Rows like Instagram Switcher) */}
        {activeTab === 'demo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: themeStyles.textSecondary, marginBottom: 2 }}>
              Вход без пароля для жюри и проверки функций:
            </div>

            {DEMO_PERSONAS.map((persona) => {
              return (
                <button
                  key={persona.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => loginWithDemo(persona.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: themeStyles.inputBg,
                    border: isContrast ? '1px solid #000' : `1px solid ${themeStyles.inputBorder}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(45, 130, 236, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getPersonaIcon(persona.role)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: themeStyles.textPrimary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {persona.fullName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: themeStyles.textSecondary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {persona.roleTitle}
                    </div>
                  </div>
                  <ArrowRight size={14} color={themeStyles.textSecondary} style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useContext } from 'react';
import {
  ConfigProvider,
  AdaptivityProvider,
  AppRoot,
  Button
} from '@vkontakte/vkui';
import {
  MapPin,
  ClipboardList,
  CheckCircle2,
  Building,
  School
} from 'lucide-react';
import { AssessmentBuilderIcon } from '../common/CustomIcons';
import { AuthHeader } from './AuthHeader';
import type { AuthThemeMode } from '../../types/auth';
import { SferumIdButton } from './SferumIdButton';
import { SferumEmblem } from './SferumLogo';
import { AuthContext } from './context';
import './auth.css';

export interface AuthLayoutProps {
  children?: React.ReactNode;
  theme?: AuthThemeMode;
  onThemeChange?: (theme: AuthThemeMode) => void;
  onLogin?: (role: string) => void;
  schoolName?: string;
  defaultRole?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  theme: controlledTheme,
  onThemeChange: controlledOnThemeChange,
  onLogin,
  schoolName = 'МАОУ Лицей Информационных Технологий г. Новосибирска',
  defaultRole = 'class_teacher',
  className = '',
  style = {}
}) => {
  const [internalTheme, setInternalTheme] = useState<AuthThemeMode>(controlledTheme || 'light');
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [isLoading, setIsLoading] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const activeTheme = controlledTheme || internalTheme;

  const handleThemeChange = (newTheme: AuthThemeMode) => {
    if (controlledOnThemeChange) {
      controlledOnThemeChange(newTheme);
    } else {
      setInternalTheme(newTheme);
    }
    // Синхронизация data-theme на body
    document.body.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  const authContext = useContext(AuthContext);

  const handleSferumLogin = async () => {
    setIsLoading(true);
    setLoginFeedback('Проверка сертификата ЭЦП и авторизация через Сферум ID...');

    if (authContext) {
      const rolePersonaMap: Record<string, string> = {
        class_teacher: 'losiv',
        zavuch: 'gromova',
        staff: 'sidorov',
        teacher: 'subject_teacher'
      };
      const personaId = rolePersonaMap[selectedRole] || 'losiv';
      await authContext.loginWithDemo(personaId);
    }

    setTimeout(() => {
      setIsLoading(false);
      setLoginFeedback('Вход выполнен успешно');
      if (onLogin) {
        onLogin(selectedRole);
      }
    }, 700);
  };

  const handleEsiaLogin = async () => {
    setIsLoading(true);
    setLoginFeedback('Авторизация через ЕСИА Госуслуги (Госключ ЭЦП)...');
    if (authContext) {
      await authContext.loginWithEsia();
    }
    setTimeout(() => {
      setIsLoading(false);
      if (onLogin) {
        onLogin(selectedRole);
      }
    }, 700);
  };

  const isContrast = activeTheme === 'contrast';
  const vkuiColorScheme = activeTheme === 'light' || activeTheme === 'contrast' ? 'light' : 'dark';

  return (
    <ConfigProvider colorScheme={vkuiColorScheme}>
      <AdaptivityProvider>
        <AppRoot>
          <div
            className={`sferum-auth-root ${className}`}
            data-theme={activeTheme}
            style={{
              background: 'var(--auth-bg-gradient, #f8fafd)',
              color: 'var(--auth-text-primary, #0f172a)',
              ...style
            }}
          >
            {/* Архитектурная фоновая сетка */}
            <div className="sferum-grid-background" aria-hidden="true" />

            {/* Официальная государственная шапка */}
            <AuthHeader
              theme={activeTheme}
              onThemeChange={handleThemeChange}
              schoolName={schoolName}
              systemStatus="Единая образовательная среда"
              onHelpClick={() => setShowHelpModal(true)}
            />

            {/* Основной контейнер экрана авторизации */}
            <main
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '40px 20px 60px',
                position: 'relative',
                zIndex: 10
              }}
            >
              {/* Двухколоночный макет для десктопа и планшетов */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: 32,
                  alignItems: 'start'
                }}
              >
                {/* ЛЕВАЯ КОЛОНКА: Государственный образовательный портал & Ценностные модули */}
                <section aria-labelledby="auth-hero-heading" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    {/* Бейдж школы */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        borderRadius: 20,
                        background: isContrast ? '#000000' : 'var(--auth-badge-bg, #ecfdf5)',
                        color: isContrast ? '#ffffff' : 'var(--auth-badge-text, #065f46)',
                        border: isContrast ? '2px solid #000000' : '1px solid var(--auth-badge-border, #a7f3d0)',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: -0.1,
                        marginBottom: 16
                      }}
                    >
                      <School size={15} />
                      <span>МАОУ «ЛИЦЕЙ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ» • НОВОСИБИРСК</span>
                    </div>

                    <h1
                      id="auth-hero-heading"
                      style={{
                        fontSize: 'clamp(28px, 4vw, 42px)',
                        fontWeight: 900,
                        lineHeight: 1.15,
                        letterSpacing: -0.8,
                        margin: '0 0 16px 0',
                        color: isContrast ? '#000000' : 'var(--auth-text-primary, #0f172a)'
                      }}
                    >
                      СФЕРУМ.КАБИНЕТ
                    </h1>

                    <p
                      style={{
                        fontSize: 'clamp(14px, 1.8vw, 16px)',
                        lineHeight: 1.6,
                        margin: 0,
                        color: isContrast ? '#111111' : 'var(--auth-text-secondary, #475569)',
                        maxWidth: 540
                      }}
                    >
                      Поиск свободных кабинетов в реальном времени, приём заявлений от родителей и быстрая печать проверочных карточек на урок.
                    </p>
                  </div>

                  {/* 3 Ключевых модуля платформы */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Модуль 1: Локатор */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: isContrast ? '#ffffff' : 'var(--auth-card-bg, #ffffff)',
                        border: isContrast ? '2px solid #000000' : '1px solid var(--auth-card-border, #e2e8f0)',
                        boxShadow: isContrast ? '3px 3px 0 #000000' : '0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: isContrast ? '#000000' : 'rgba(45, 130, 236, 0.12)',
                          color: isContrast ? '#ffffff' : '#2d82ec',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: isContrast ? '#000000' : 'var(--auth-text-primary, #0f172a)' }}>
                          Локатор кабинетов
                        </div>
                        <div style={{ fontSize: 12, color: isContrast ? '#222222' : 'var(--auth-text-secondary, #475569)', marginTop: 2 }}>
                          Занятость аудиторий, расписание звонков и свободные кабинеты для консультаций (каб. 311).
                        </div>
                      </div>
                    </div>

                    {/* Модуль 2: Приемная классрука */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: isContrast ? '#ffffff' : 'var(--auth-card-bg, #ffffff)',
                        border: isContrast ? '2px solid #000000' : '1px solid var(--auth-card-border, #e2e8f0)',
                        boxShadow: isContrast ? '3px 3px 0 #000000' : '0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: isContrast ? '#000000' : 'rgba(16, 185, 129, 0.12)',
                          color: isContrast ? '#ffffff' : '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: isContrast ? '#000000' : 'var(--auth-text-primary, #0f172a)' }}>
                          Приёмная заявлений
                        </div>
                        <div style={{ fontSize: 12, color: isContrast ? '#222222' : 'var(--auth-text-secondary, #475569)', marginTop: 2 }}>
                          Записки от родителей с фото, учет причин отсутствия и автоматический табель посещаемости для завуча.
                        </div>
                      </div>
                    </div>

                    {/* Модуль 3: Конструктор проверочных карточек */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: isContrast ? '#ffffff' : 'var(--auth-card-bg, #ffffff)',
                        border: isContrast ? '2px solid #000000' : '1px solid var(--auth-card-border, #e2e8f0)',
                        boxShadow: isContrast ? '3px 3px 0 #000000' : '0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: isContrast ? '#000000' : 'rgba(126, 20, 255, 0.12)',
                          color: isContrast ? '#ffffff' : '#8b5cf6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <AssessmentBuilderIcon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: isContrast ? '#000000' : 'var(--auth-text-primary, #0f172a)' }}>
                          Печать карточек на А4
                        </div>
                        <div style={{ fontSize: 12, color: isContrast ? '#222222' : 'var(--auth-text-secondary, #475569)', marginTop: 2 }}>
                          4 варианта заданий на одном листе с линией отреза ножницами и ответами для учителя. Дети работают на бумаге без телефонов.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Сведения об учебном заведении */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: isContrast ? '#ffffff' : 'rgba(45, 130, 236, 0.06)',
                      border: isContrast ? '1px solid #000000' : '1px solid rgba(45, 130, 236, 0.15)',
                      fontSize: 12,
                      color: isContrast ? '#000000' : 'var(--auth-text-secondary, #475569)'
                    }}
                  >
                    <Building size={16} style={{ color: isContrast ? '#000000' : '#2d82ec', flexShrink: 0 }} />
                    <span>
                      Лицей: <strong>{schoolName}</strong>
                    </span>
                  </div>
                </section>

                {/* ПРАВАЯ КОЛОНКА: Станция входа Сферум ID */}
                <section aria-labelledby="auth-card-heading">
                  <div
                    style={{
                      background: 'var(--auth-card-bg, #ffffff)',
                      borderRadius: 20,
                      border: isContrast ? '3px solid #000000' : '1px solid var(--auth-card-border, #e2e8f0)',
                      boxShadow: 'var(--auth-card-shadow, 0 20px 40px rgba(0, 0, 0, 0.07))',
                      padding: '32px 28px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 20
                    }}
                  >
                    {/* Заголовок карточки входа */}
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          background: isContrast ? '#ffffff' : 'rgba(45, 130, 236, 0.1)',
                          border: isContrast ? '2px solid #000000' : '1px solid rgba(45, 130, 236, 0.25)',
                          marginBottom: 12
                        }}
                      >
                        <SferumEmblem size={32} monochrome={isContrast} />
                      </div>

                      <h2
                        id="auth-card-heading"
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          letterSpacing: -0.4,
                          margin: '0 0 6px 0',
                          color: isContrast ? '#000000' : 'var(--auth-text-primary, #0f172a)'
                        }}
                      >
                        Вход в систему
                      </h2>

                      <p
                        style={{
                          fontSize: 13,
                          margin: 0,
                          color: isContrast ? '#222222' : 'var(--auth-text-muted, #64748b)'
                        }}
                      >
                        Используйте ваш подтвержденный учебный профиль
                      </p>
                    </div>

                    {/* Выбор роли педагога для демонстрации (если не передан children со вкладками) */}
                    {!children && (
                      <div>
                        <label
                          htmlFor="role-select"
                          style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 6,
                            color: isContrast ? '#000000' : 'var(--auth-text-primary, #0f172a)'
                          }}
                        >
                          Роль в образовательном учреждении:
                        </label>
                        <select
                          id="role-select"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: isContrast ? '2px solid #000000' : '1px solid var(--auth-border-subtle, #e2e8f0)',
                            background: isContrast ? '#ffffff' : 'var(--auth-pill-bg, #f8fafc)',
                            color: isContrast ? '#000000' : 'var(--auth-text-primary, #0f172a)',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <option value="class_teacher">Классный руководитель 9А (Лосив Р. Б.)</option>
                          <option value="teacher">Учитель-предметник (Математика / Информатика)</option>
                          <option value="zavuch">Завуч по УВР (Громова А. С.)</option>
                          <option value="staff">Завхоз / Техническая служба (Сидоров В. П.)</option>
                        </select>
                      </div>
                    )}

                    {/* Пользовательский слот или дефолтные элементы */}
                    {children ? (
                      children
                    ) : (
                      <>
                        {/* Главная кнопка авторизации Сферум ID */}
                        <SferumIdButton
                          theme={activeTheme}
                          loading={isLoading}
                          onClick={handleSferumLogin}
                          title="Войти через Сферум ID"
                          subtext="Учебный профиль в VK Мессенджере"
                        />

                        {loginFeedback && (
                          <div
                            style={{
                              padding: '8px 12px',
                              borderRadius: 8,
                              background: isContrast ? '#000000' : '#ecfdf5',
                              color: isContrast ? '#ffffff' : '#047857',
                              border: isContrast ? '1px solid #000000' : '1px solid #a7f3d0',
                              fontSize: 12,
                              fontWeight: 600,
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6
                            }}
                          >
                            <CheckCircle2 size={14} />
                            <span>{loginFeedback}</span>
                          </div>
                        )}

                        {/* Альтернативный вход через Госуслуги / ЕСИА */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Button
                            size="l"
                            mode="secondary"
                            stretched
                            style={{
                              borderRadius: 12,
                              border: isContrast ? '2px solid #000000' : undefined
                            }}
                            onClick={handleEsiaLogin}
                          >
                            Войти через Госуслуги (ЕСИА)
                          </Button>
                        </div>
                      </>
                    )}

                  </div>
                </section>
              </div>

              {/* Футер платформы */}
              <footer
                style={{
                  marginTop: 36,
                  paddingTop: 24,
                  borderTop: isContrast ? '2px solid #000000' : '1px solid var(--auth-border-subtle, #e2e8f0)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 12,
                  color: isContrast ? '#000000' : 'var(--auth-text-muted, #64748b)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: isContrast ? '#000000' : 'var(--auth-text-secondary, #475569)' }}>
                    © 2026 «СФЕРУМ.КАБИНЕТ» • МАОУ Лицей Информационных Технологий г. Новосибирска
                  </div>
                </div>
              </footer>

              {/* Модальное окно контактов службы поддержки */}
              {showHelpModal && (
                <div
                  role="dialog"
                  aria-modal="true"
                  onClick={() => setShowHelpModal(false)}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: 20
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: isContrast ? '#ffffff' : '#ffffff',
                      border: isContrast ? '2px solid #000000' : '1px solid #e2e8f0',
                      borderRadius: 20,
                      padding: '24px 28px',
                      maxWidth: 460,
                      width: '100%',
                      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                        Служба поддержки «Сферум.Кабинет»
                      </h3>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
                        МАОУ Лицей Информационных Технологий
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#1e293b' }}>
                      <div>
                        <strong>Телефон приемной:</strong>{' '}
                        <a href="tel:+73833463500" style={{ color: '#0055d4', textDecoration: 'none' }}>
                          +7 (383) 346-35-00
                        </a>
                      </div>
                      <div>
                        <strong>Электронная почта:</strong>{' '}
                        <a href="mailto:lit@nios.ru" style={{ color: '#0055d4', textDecoration: 'none' }}>
                          lit@nios.ru
                        </a>
                      </div>
                      <div>
                        <strong>Адрес:</strong> г. Новосибирск, ул. Римского-Корсакова, 13
                      </div>
                      <div>
                        <strong>Режим работы:</strong> Пн–Пт: 08:00 – 19:00, Сб: 08:00 – 15:00
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowHelpModal(false)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 10,
                        border: 'none',
                        background: '#0055d4',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Понятно, закрыть
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

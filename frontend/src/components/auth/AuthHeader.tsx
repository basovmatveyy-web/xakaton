import React from 'react';
import { Sun, Moon, Layers, Eye, HelpCircle } from 'lucide-react';
import { SferumEmblem } from './SferumLogo';
import type { AuthThemeMode } from '../../types/auth';
import './auth.css';

export interface AuthHeaderProps {
  theme: AuthThemeMode;
  onThemeChange: (theme: AuthThemeMode) => void;
  schoolName?: string;
  systemStatus?: string;
  onHelpClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  theme,
  onThemeChange,
  schoolName = 'МАОУ Лицей Информационных Технологий',
  systemStatus: _systemStatus,
  onHelpClick,
  className = '',
  style = {}
}) => {
  const isContrast = theme === 'contrast';

  const themesList: Array<{ id: AuthThemeMode; label: string; shortLabel: string; icon: React.ReactNode }> = [
    {
      id: 'light',
      label: 'Сферум Классик',
      shortLabel: 'Светлая',
      icon: <Sun size={14} />
    },
    {
      id: 'oled',
      label: 'OLED Dark',
      shortLabel: 'OLED',
      icon: <Moon size={14} />
    },
    {
      id: 'slate',
      label: 'Школьный грифель',
      shortLabel: 'Грифель',
      icon: <Layers size={14} />
    },
    {
      id: 'contrast',
      label: 'ГОСТ Контраст',
      shortLabel: 'ГОСТ',
      icon: <Eye size={14} />
    }
  ];

  return (
    <header
      className={`sferum-auth-header ${className}`}
      style={{
        width: '100%',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        background: 'var(--auth-header-bg, rgba(255, 255, 255, 0.85))',
        backdropFilter: isContrast ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: isContrast ? 'none' : 'blur(16px)',
        borderBottom: isContrast ? '2px solid #000000' : '1px solid var(--auth-border-subtle, #e2e8f0)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        ...style
      }}
    >
      {/* Левая часть: Государственный логотип и верификация */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: 12,
            background: isContrast ? '#ffffff' : 'rgba(45, 130, 236, 0.1)',
            border: isContrast ? '1.5px solid #cbd5e1' : '1px solid rgba(45, 130, 236, 0.2)',
            flexShrink: 0
          }}
        >
          <SferumEmblem size={26} monochrome={isContrast} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: -0.4,
                color: isContrast ? '#000000' : 'var(--auth-text-primary, #0f172a)'
              }}
            >
              СФЕРУМ.КАБИНЕТ
            </span>
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: isContrast ? '#111111' : 'var(--auth-text-muted, #64748b)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 1
            }}
          >
            <span>{schoolName}</span>
          </div>
        </div>
      </div>

      {/* Правая часть: Переключатель 4 тем оформления и статус сервера */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Индикатор связи с сервером */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            background: isContrast ? '#ffffff' : 'var(--auth-pill-bg, rgba(241, 245, 249, 0.8))',
            border: isContrast ? '1.5px solid #cbd5e1' : '1px solid var(--auth-border-subtle, #e2e8f0)',
            color: isContrast ? '#000000' : 'var(--auth-text-secondary, #475569)'
          }}
        >
          <span className="sferum-pulse-dot" style={{ width: 7, height: 7, background: '#10b981' }} />
          <span>Онлайн</span>
        </div>

        {/* Переключатель 4 тем оформления */}
        <div className="theme-selector-pill" role="radiogroup" aria-label="Выбор темы оформления">
          {themesList.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                title={`Тема: ${t.label}`}
                onClick={() => onThemeChange(t.id)}
                className={`theme-btn ${isActive ? 'active' : ''}`}
              >
                {t.icon}
                <span>{t.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Кнопка справки для учителей */}
        {onHelpClick && (
          <button
            type="button"
            onClick={onHelpClick}
            title="Справка по авторизации"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              border: isContrast ? '1.5px solid #cbd5e1' : '1px solid var(--auth-border-subtle, #e2e8f0)',
              background: isContrast ? '#ffffff' : 'var(--auth-pill-bg, rgba(241, 245, 249, 0.8))',
              color: isContrast ? '#000000' : 'var(--auth-text-secondary, #475569)',
              cursor: 'pointer'
            }}
          >
            <HelpCircle size={16} />
          </button>
        )}
      </div>
    </header>
  );
};

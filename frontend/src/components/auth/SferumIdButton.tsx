import React from 'react';
import { Spinner } from '@vkontakte/vkui';
import { Icon24LogoVkColor } from '@vkontakte/icons';
import { Lock, ArrowRight } from 'lucide-react';
import { SferumEmblem } from './SferumLogo';
import type { AuthThemeMode } from '../../types/auth';
import './auth.css';

export interface SferumIdButtonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  theme?: AuthThemeMode;
  variant?: 'sferum' | 'vkid';
  title?: string;
  subtext?: string;
  size?: 'm' | 'l';
  fullWidth?: boolean;
  showSecurityBadge?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SferumIdButton: React.FC<SferumIdButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  theme = 'light',
  variant = 'sferum',
  title = 'Войти через Сферум ID',
  subtext = 'Учебный профиль в VK Мессенджере',
  size = 'l',
  fullWidth = true,
  showSecurityBadge = true,
  className = '',
  style = {}
}) => {
  const isContrast = theme === 'contrast';

  return (
    <div
      style={{
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-block'
      }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`sferum-id-btn ${className}`}
        style={{
          padding: size === 'l' ? '14px 20px' : '10px 16px',
          minHeight: size === 'l' ? 58 : 46,
          ...style
        }}
        aria-busy={loading}
        aria-disabled={disabled || loading}
      >
        {/* Индикатор загрузки */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Spinner size="s" style={{ color: '#ffffff' }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              Установка защищенного ГОСТ-соединения...
            </span>
          </div>
        ) : (
          <>
            {/* Левый блок: Иконка Сферум / VK ID в белом круге */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size === 'l' ? 36 : 28,
                height: size === 'l' ? 36 : 28,
                borderRadius: '50%',
                background: isContrast ? '#ffffff' : '#ffffff',
                boxShadow: isContrast ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.12)',
                flexShrink: 0
              }}
            >
              {variant === 'sferum' ? (
                <SferumEmblem size={size === 'l' ? 22 : 18} monochrome={isContrast} />
              ) : (
                <Icon24LogoVkColor width={size === 'l' ? 22 : 18} height={size === 'l' ? 22 : 18} />
              )}
            </div>

            {/* Центральный текстовый блок с благородной иерархией */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}
            >
              <div
                style={{
                  fontSize: size === 'l' ? 15 : 13,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: -0.2
                }}
              >
                {title}
              </div>
              {subtext && (
                <div
                  style={{
                    fontSize: size === 'l' ? 11 : 10,
                    opacity: 0.88,
                    fontWeight: 400,
                    marginTop: 2,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}
                >
                  {subtext}
                </div>
              )}
            </div>

            {/* Правый блок: Индикатор защиты или стрелка перехода */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                paddingLeft: 8,
                borderLeft: isContrast
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              {showSecurityBadge ? (
                <div
                  title="Защищенное соединение"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    opacity: 0.95
                  }}
                >
                  <Lock size={13} />
                </div>
              ) : (
                <ArrowRight size={16} />
              )}
            </div>
          </>
        )}
      </button>
    </div>
  );
};

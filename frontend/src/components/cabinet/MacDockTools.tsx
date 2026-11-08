import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Camera,
  ClipboardCheck,
  Wrench
} from 'lucide-react';
import type { AuthThemeMode } from '../../types/auth';

interface MacDockToolsProps {
  theme: AuthThemeMode;
  onNavigateToTab: (tab: any) => void;
  onSelectPrompt: (promptText: string) => void;
}

interface DockItem {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  badgeAlert?: boolean;
  action: () => void;
}

export const MacDockTools: React.FC<MacDockToolsProps> = ({
  theme,
  onNavigateToTab,
  onSelectPrompt
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [bouncingId, setBouncingId] = useState<string | null>(null);

  const triggerClick = (item: DockItem) => {
    setBouncingId(item.id);
    setTimeout(() => {
      setBouncingId(null);
    }, 600);
    item.action();
  };

  const teachingTools: DockItem[] = [
    {
      id: 'plan',
      title: 'План урока',
      badge: '45 мин',
      subtitle: 'Цели ФГОС, хронометраж и тайминг',
      icon: BookOpen,
      action: () =>
        onSelectPrompt(
          'Составь подробный поурочный план урока по информатике для 9А класса по теме: [введите тему], с целями по ФГОС, этапами урока, проверочными вопросами и таймингом 45 минут.'
        )
    },
    {
      id: 'aicards',
      title: 'Проверочная А4',
      badge: 'Печать',
      subtitle: '4 варианта с линией отреза',
      icon: FileText,
      action: () => onNavigateToTab('aicards')
    },
    {
      id: 'fipi',
      title: 'Банк ФИПИ',
      badge: 'ОГЭ / ЕГЭ',
      subtitle: 'Официальные спецификации 2026',
      icon: GraduationCap,
      action: () => onNavigateToTab('fipi')
    },
    {
      id: 'boardscan',
      title: 'Оцифровка доски',
      badge: 'Белый лист',
      subtitle: 'Конспект в векторный PDF без бликов',
      icon: Camera,
      action: () => onNavigateToTab('boardscan')
    }
  ];

  const adminTools: DockItem[] = [
    {
      id: 'classmaster',
      title: 'Приемная 9А',
      badge: '3 справки',
      subtitle: 'Табель пропусков и записки родителей',
      icon: ClipboardCheck,
      badgeAlert: true,
      action: () => onNavigateToTab('classmaster')
    },
    {
      id: 'tickets',
      title: 'Служба завхоза',
      badge: 'Каб. 311',
      subtitle: 'Оперативная заявка на ремонт',
      icon: Wrench,
      action: () => onNavigateToTab('tickets')
    }
  ];

  // Дизайн-токены единого стиля Liquid Glass (Единый благородный формат стекла)
  const liquidTokens = {
    // Стеклянная база полки Дока
    shelfBg: isContrast
      ? '#ffffff'
      : isLight
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0.32) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
    shelfBorder: isContrast
      ? '1.5px solid #94a3b8'
      : isLight
      ? '1px solid rgba(255, 255, 255, 0.78)'
      : '1px solid rgba(255, 255, 255, 0.13)',
    shelfShadow: isContrast
      ? '0 4px 16px rgba(15, 23, 42, 0.08)'
      : isLight
      ? '0 24px 48px -10px rgba(15, 23, 42, 0.12), 0 4px 16px -2px rgba(15, 23, 42, 0.04), inset 0 1.5px 2px rgba(255, 255, 255, 0.95), inset 0 -1px 2px rgba(0, 0, 0, 0.03)'
      : '0 26px 54px -10px rgba(0, 0, 0, 0.7), 0 6px 18px -2px rgba(0, 0, 0, 0.5), inset 0 1.5px 2px rgba(255, 255, 255, 0.28), inset 0 -1px 2px rgba(0, 0, 0, 0.4)',

    // Единый материал жидкого стекла для всех иконок
    iconBaseBg: isContrast
      ? '#f8fafc'
      : isLight
      ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.38) 50%, rgba(240, 246, 255, 0.55) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(255, 255, 255, 0.07) 100%)',
    iconHoverBg: isContrast
      ? '#f1f5f9'
      : isLight
      ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.55) 50%, rgba(240, 246, 255, 0.8) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.14) 100%)',
    iconBorder: isContrast
      ? '1.5px solid #cbd5e1'
      : isLight
      ? '1px solid rgba(255, 255, 255, 0.85)'
      : '1px solid rgba(255, 255, 255, 0.18)',
    iconBorderHover: isContrast
      ? '2px solid #0055d4'
      : isLight
      ? '1px solid rgba(255, 255, 255, 1)'
      : '1px solid rgba(255, 255, 255, 0.38)',

    // Жидкие тени и внутренние световые рефракции
    iconShadow: isContrast
      ? '0 2px 6px rgba(15, 23, 42, 0.06)'
      : isLight
      ? '0 8px 20px -3px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04), inset 0 1.5px 2px rgba(255, 255, 255, 0.95), inset 0 -1.5px 2px rgba(15, 23, 42, 0.05)'
      : '0 8px 22px -3px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1.5px 2px rgba(255, 255, 255, 0.38), inset 0 -1.5px 2px rgba(0, 0, 0, 0.45)',
    iconShadowHover: isContrast
      ? '0 4px 12px rgba(0, 85, 212, 0.2)'
      : isLight
      ? '0 16px 32px -4px rgba(15, 23, 42, 0.14), 0 0 18px 2px rgba(255, 255, 255, 0.85), inset 0 2px 2.5px rgba(255, 255, 255, 1), inset 0 -1.5px 2px rgba(15, 23, 42, 0.06)'
      : '0 18px 36px -4px rgba(0, 0, 0, 0.7), 0 0 22px 2px rgba(255, 255, 255, 0.18), inset 0 2px 2.5px rgba(255, 255, 255, 0.65), inset 0 -1.5px 2px rgba(0, 0, 0, 0.5)',

    // Цвет глифа (монохромный кристальный)
    glyphColor: isContrast ? '#0f172a' : isLight ? '#1e293b' : '#f8fafc',
    glyphColorHover: isContrast ? '#0055d4' : isLight ? '#0f172a' : '#ffffff',
    glyphShadow: isContrast
      ? 'none'
      : isLight
      ? '0 1px 2px rgba(255, 255, 255, 0.8), 0 1px 3px rgba(15, 23, 42, 0.15)'
      : '0 1px 3px rgba(0, 0, 0, 0.7), 0 0 8px rgba(255, 255, 255, 0.35)',

    // Разделитель
    dividerBg: isContrast ? '#94a3b8' : isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.14)',

    // Точка-индикатор
    dotBg: isContrast ? '#64748b' : isLight ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255, 255, 255, 0.45)',
    dotHoverBg: isContrast ? '#0055d4' : isLight ? '#0f172a' : '#ffffff'
  };

  // Вычисляем плавное волновое масштабирование (Smooth Liquid Parabolic Magnification)
  const getItemTransform = (index: number, itemId: string) => {
    if (bouncingId === itemId) {
      return 'translateY(-14px) scale(1.15)';
    }
    if (hoveredIndex === null) {
      return 'translateY(0) scale(1)';
    }
    const dist = Math.abs(hoveredIndex - index);
    if (dist === 0) {
      return 'translateY(-12px) scale(1.22)';
    }
    if (dist === 1) {
      return 'translateY(-5px) scale(1.09)';
    }
    if (dist === 2) {
      return 'translateY(-1.5px) scale(1.025)';
    }
    return 'translateY(0) scale(1)';
  };

  return (
    <div
      style={{
        width: '100%',
        marginTop: 34,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none'
      }}
    >
      <style>{`
        @keyframes liquidGlassSheen {
          0% {
            transform: translateX(-140%) rotate(25deg);
          }
          40%, 100% {
            transform: translateX(240%) rotate(25deg);
          }
        }
        @keyframes liquidGlassCausticWave {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes macDockBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-18px) scale(1.2); }
          50% { transform: translateY(-4px) scale(1.08); }
          75% { transform: translateY(-10px) scale(1.14); }
        }
        @keyframes macDockTooltipFade {
          from {
            opacity: 0;
            transform: translate(-50%, 6px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .mac-dock-bouncing {
          animation: macDockBounce 0.55s cubic-bezier(0.28, 0.84, 0.42, 1.35) !important;
        }
        .liquid-glass-icon {
          position: relative;
          overflow: hidden;
        }
        .liquid-glass-icon::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            60deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.38) 50%,
            rgba(255, 255, 255, 0) 70%
          );
          opacity: 0.6;
          pointer-events: none;
          animation: liquidGlassSheen 6.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Парящая капсула жидкого стекла Liquid Glass */}
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'flex-end',
          gap: 12,
          padding: '8px 14px 10px 14px',
          borderRadius: 24,
          background: liquidTokens.shelfBg,
          backdropFilter: 'blur(36px) saturate(200%)',
          WebkitBackdropFilter: 'blur(36px) saturate(200%)',
          border: liquidTokens.shelfBorder,
          boxShadow: liquidTokens.shelfShadow,
          maxWidth: '100%',
          overflowX: 'visible',
          boxSizing: 'border-box'
        }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Образовательные инструменты в едином Liquid Glass стиле */}
        {teachingTools.map((tool, idx) => {
          const globalIdx = idx;
          const isHovered = hoveredIndex === globalIdx;
          const Icon = tool.icon;
          const isBouncing = bouncingId === tool.id;

          return (
            <div
              key={tool.id}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isHovered ? 40 : 10
              }}
              onMouseEnter={() => setHoveredIndex(globalIdx)}
            >
              {/* Всплывающий Apple Tooltip на наведение */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 14px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isLight ? 'rgba(15, 23, 42, 0.92)' : 'rgba(10, 14, 22, 0.94)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: 9,
                    padding: '6px 12px 7px 12px',
                    boxShadow: '0 10px 28px -4px rgba(0, 0, 0, 0.4)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: 'macDockTooltipFade 0.16s ease-out',
                    zIndex: 100
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff', letterSpacing: -0.2 }}>
                      {tool.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'rgba(255, 255, 255, 0.8)',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '1px 6px',
                        borderRadius: 4
                      }}
                    >
                      {tool.badge}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: 'rgba(255, 255, 255, 0.65)',
                      marginTop: 2,
                      fontWeight: 500
                    }}
                  >
                    {tool.subtitle}
                  </span>

                  {/* Стрелочка вниз в стиле macOS */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -5,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: `5px solid ${isLight ? 'rgba(15, 23, 42, 0.92)' : 'rgba(10, 14, 22, 0.94)'}`
                    }}
                  />
                </div>
              )}

              {/* Единая кнопка Liquid Glass с плавным стеклянным переливом */}
              <button
                type="button"
                onClick={() => triggerClick(tool)}
                className={`liquid-glass-icon ${isBouncing ? 'mac-dock-bouncing' : ''}`}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14.5,
                  background: isHovered ? liquidTokens.iconHoverBg : liquidTokens.iconBaseBg,
                  backdropFilter: 'blur(24px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(190%)',
                  border: isHovered ? liquidTokens.iconBorderHover : liquidTokens.iconBorder,
                  boxShadow: isHovered ? liquidTokens.iconShadowHover : liquidTokens.iconShadow,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transform: getItemTransform(globalIdx, tool.id),
                  transition: isBouncing
                    ? 'none'
                    : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), background 0.28s ease, border-color 0.28s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Верхний преломляющий стеклянный блик каустики */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '52%',
                    borderRadius: '13.5px 13.5px 100% 100% / 13.5px 13.5px 38% 38%',
                    background: isLight
                      ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Единый монохромный глиф иконки */}
                <div
                  style={{
                    color: isHovered ? liquidTokens.glyphColorHover : liquidTokens.glyphColor,
                    filter: isHovered
                      ? `drop-shadow(0 0 8px ${isLight ? 'rgba(0, 119, 255, 0.35)' : 'rgba(255, 255, 255, 0.55)'})`
                      : liquidTokens.glyphShadow,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    transition: 'all 0.25s ease'
                  }}
                >
                  <Icon size={24} strokeWidth={2.0} />
                </div>
              </button>

              {/* Точка-индикатор активного приложения Liquid Glass */}
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  marginTop: 6,
                  background: isHovered ? liquidTokens.dotHoverBg : liquidTokens.dotBg,
                  boxShadow: isHovered
                    ? `0 0 8px ${isLight ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)'}`
                    : 'none',
                  transition: 'all 0.22s ease'
                }}
              />
            </div>
          );
        })}

        {/* Вертикальный стеклянный разделитель Liquid Glass */}
        <div
          style={{
            width: 1,
            height: 38,
            marginBottom: 10,
            background: liquidTokens.dividerBg,
            margin: '0 4px 10px 4px',
            transition: 'background 0.25s ease'
          }}
        />

        {/* Административные инструменты (Приемная 9А, Завхоз) в том же едином Liquid Glass стиле */}
        {adminTools.map((tool, idx) => {
          const globalIdx = teachingTools.length + idx;
          const isHovered = hoveredIndex === globalIdx;
          const Icon = tool.icon;
          const isBouncing = bouncingId === tool.id;

          return (
            <div
              key={tool.id}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isHovered ? 40 : 10
              }}
              onMouseEnter={() => setHoveredIndex(globalIdx)}
            >
              {/* Всплывающий Apple Tooltip на наведение */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 14px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isLight ? 'rgba(15, 23, 42, 0.92)' : 'rgba(10, 14, 22, 0.94)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: 9,
                    padding: '6px 12px 7px 12px',
                    boxShadow: '0 10px 28px -4px rgba(0, 0, 0, 0.4)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: 'macDockTooltipFade 0.16s ease-out',
                    zIndex: 100
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff', letterSpacing: -0.2 }}>
                      {tool.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: tool.badgeAlert ? '#ff6b6b' : 'rgba(255, 255, 255, 0.8)',
                        background: tool.badgeAlert ? 'rgba(255, 107, 107, 0.18)' : 'rgba(255, 255, 255, 0.15)',
                        padding: '1px 6px',
                        borderRadius: 4
                      }}
                    >
                      {tool.badge}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: 'rgba(255, 255, 255, 0.65)',
                      marginTop: 2,
                      fontWeight: 500
                    }}
                  >
                    {tool.subtitle}
                  </span>

                  {/* Стрелочка вниз */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -5,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: `5px solid ${isLight ? 'rgba(15, 23, 42, 0.92)' : 'rgba(10, 14, 22, 0.94)'}`
                    }}
                  />
                </div>
              )}

              {/* Единая кнопка Liquid Glass */}
              <button
                type="button"
                onClick={() => triggerClick(tool)}
                className={`liquid-glass-icon ${isBouncing ? 'mac-dock-bouncing' : ''}`}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14.5,
                  background: isHovered ? liquidTokens.iconHoverBg : liquidTokens.iconBaseBg,
                  backdropFilter: 'blur(24px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(190%)',
                  border: isHovered ? liquidTokens.iconBorderHover : liquidTokens.iconBorder,
                  boxShadow: isHovered ? liquidTokens.iconShadowHover : liquidTokens.iconShadow,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transform: getItemTransform(globalIdx, tool.id),
                  transition: isBouncing
                    ? 'none'
                    : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), background 0.28s ease, border-color 0.28s ease',
                  overflow: 'visible'
                }}
              >
                {/* Глянцевый блик */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '52%',
                    borderRadius: '13.5px 13.5px 100% 100% / 13.5px 13.5px 38% 38%',
                    background: isLight
                      ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    pointerEvents: 'none',
                    overflow: 'hidden'
                  }}
                />

                {/* Стеклянный индикатор уведомлений (Liquid Glass Ruby Badge) */}
                {tool.badgeAlert && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 19,
                      height: 19,
                      padding: '0 4px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.85) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                      color: '#ffffff',
                      fontSize: 10.5,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    3
                  </div>
                )}

                {/* Единый монохромный глиф */}
                <div
                  style={{
                    color: isHovered ? liquidTokens.glyphColorHover : liquidTokens.glyphColor,
                    filter: isHovered
                      ? `drop-shadow(0 0 8px ${isLight ? 'rgba(0, 119, 255, 0.35)' : 'rgba(255, 255, 255, 0.55)'})`
                      : liquidTokens.glyphShadow,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    transition: 'all 0.25s ease'
                  }}
                >
                  <Icon size={24} strokeWidth={2.0} />
                </div>
              </button>

              {/* Точка-индикатор */}
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  marginTop: 6,
                  background: isHovered ? liquidTokens.dotHoverBg : liquidTokens.dotBg,
                  boxShadow: isHovered
                    ? `0 0 8px ${isLight ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)'}`
                    : 'none',
                  transition: 'all 0.22s ease'
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

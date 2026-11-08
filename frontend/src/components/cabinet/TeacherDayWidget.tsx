import React from 'react';
import {
  Calendar,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Bell,
  ArrowRight,
  Wrench,
  Clock,
  Sparkles
} from 'lucide-react';
import type { AuthThemeMode } from '../../types/auth';

interface TeacherDayWidgetProps {
  theme: AuthThemeMode;
  onNavigateToTab: (tab: any) => void;
  isPopover?: boolean;
  onClose?: () => void;
  activeClass?: string;
  onSelectClass?: (clsId: string) => void;
}

export const TeacherDayWidget: React.FC<TeacherDayWidgetProps> = ({
  theme,
  onNavigateToTab,
  isPopover = false,
  onClose,
  activeClass = '9А',
  onSelectClass
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const t = {
    cardBg: isContrast
      ? '#ffffff'
      : isLight
      ? 'rgba(255, 255, 255, 0.72)'
      : 'rgba(20, 24, 34, 0.72)',
    cardBorder: isContrast
      ? '1.5px solid #cbd5e1'
      : isLight
      ? '1px solid rgba(255, 255, 255, 0.85)'
      : '1px solid rgba(255, 255, 255, 0.12)',
    cardShadow: isContrast
      ? '0 4px 16px rgba(0, 0, 0, 0.06)'
      : isLight
      ? '0 24px 48px -12px rgba(15, 23, 42, 0.12), 0 4px 16px -2px rgba(15, 23, 42, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.95)'
      : '0 26px 54px -12px rgba(0, 0, 0, 0.7), 0 6px 18px -2px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.18)',

    textPrimary: isContrast ? '#0a0f1d' : isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isContrast ? '#1e293b' : isLight ? '#475569' : '#94a3b8',
    textMuted: isContrast ? '#334155' : isLight ? '#64748b' : '#94a3b8',

    // Фоновые слоты
    slotBg: isContrast
      ? '#f8fafc'
      : isLight
      ? 'rgba(241, 245, 249, 0.65)'
      : 'rgba(255, 255, 255, 0.04)',
    slotBorder: isContrast
      ? '1.5px solid #cbd5e1'
      : isLight
      ? '1px solid rgba(226, 232, 240, 0.85)'
      : '1px solid rgba(255, 255, 255, 0.08)',
    slotHoverBg: isContrast
      ? '#f1f5f9'
      : isLight
      ? '#ffffff'
      : 'rgba(255, 255, 255, 0.08)',

    accentColor: isContrast ? '#0055d4' : '#0077ff'
  };

  const currentDateStr = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const capitalizedDate = currentDateStr.charAt(0).toUpperCase() + currentDateStr.slice(1);

  return (
    <aside
      aria-label="Расписание и события дня"
      style={{
        background: t.cardBg,
        backdropFilter: 'blur(32px) saturate(190%)',
        WebkitBackdropFilter: 'blur(32px) saturate(190%)',
        border: t.cardBorder,
        borderRadius: 24,
        boxShadow: t.cardShadow,
        padding: isPopover ? '18px 20px' : '22px',
        width: '100%',
        maxWidth: isPopover ? 380 : 385,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative'
      }}
    >
      <style>{`
        @keyframes pulseLiveDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }
        @keyframes liveActivityShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* ─── ШАПКА ВИДЖЕТА ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 119, 255, 0.28), inset 0 1px 1px rgba(255,255,255,0.4)',
              flexShrink: 0
            }}
          >
            <Calendar size={18} strokeWidth={2.2} color="#ffffff" />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.7,
                color: t.textMuted
              }}
            >
              {capitalizedDate}
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: t.textPrimary,
                letterSpacing: '-0.4px',
                lineHeight: 1.2
              }}
            >
              Ваш день
            </div>
          </div>
        </div>

        {/* Прогресс дня: 4 из 6 уроков */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 12,
              background: isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.2)',
              color: isLight ? '#059669' : '#34d399',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Sparkles size={11} />
            <span>4 из 6 уроков</span>
          </span>
          <div
            style={{
              width: 82,
              height: 4.5,
              background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: '66%',
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #0077ff)',
                borderRadius: 3
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── ТЕКУЩИЙ УРОК (LIVE ACTIVITY В СТИЛЕ APPLE DYNAMIC ISLAND) ─── */}
      <div
        style={{
          background: isContrast
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : isLight
            ? 'linear-gradient(135deg, #0284c7 0%, #0066ee 52%, #004ecc 100%)'
            : 'linear-gradient(135deg, rgba(2, 132, 199, 0.35) 0%, rgba(0, 102, 238, 0.22) 100%)',
          borderRadius: 18,
          padding: '14px 16px',
          color: '#ffffff',
          boxShadow: isContrast
            ? '0 4px 14px rgba(15, 23, 42, 0.15)'
            : isLight
            ? '0 12px 28px -4px rgba(0, 102, 238, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.45)'
            : '0 14px 30px -4px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          border: isContrast
            ? '1.5px solid #334155'
            : isLight
            ? '1px solid rgba(255, 255, 255, 0.25)'
            : '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Верхняя строка статуса Live Activity */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 9px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: 'uppercase'
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#34d399',
                boxShadow: '0 0 8px #34d399',
                display: 'inline-block',
                animation: 'pulseLiveDot 1.8s infinite'
              }}
            />
            <span>Идет сейчас • 4-й урок</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11.5,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.95)',
              padding: '2px 8px',
              borderRadius: 14,
              background: 'rgba(0, 0, 0, 0.15)'
            }}
          >
            <Clock size={12} strokeWidth={2.4} />
            <span>11:30 – 12:15</span>
          </div>
        </div>

        {/* Главная информация об уроке */}
        <div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.3px',
              lineHeight: 1.2
            }}
          >
            {activeClass} класс • {activeClass === '11А' ? 'Профиль IT' : activeClass === '10Б' ? 'Информатика и ИКТ' : activeClass === '9А' ? 'Информатика' : 'Информатика и программирование'}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: 'rgba(255, 255, 255, 0.85)',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <MapPin size={13} />
            <span>Кабинет 311 (Мой кабинет)</span>
          </div>
        </div>

        {/* Прогресс-бар урока и тема */}
        <div
          style={{
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 12
          }}
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            Тема: Массивы в Python
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.22)',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            До перемены 18 мин
          </span>
        </div>
      </div>

      {/* ─── СЛЕДУЮЩИЙ УРОК ─── */}
      <div
        style={{
          background: t.slotBg,
          border: t.slotBorder,
          borderRadius: 16,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              color: t.textMuted
            }}
          >
            Следующий • 5-й урок
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: t.textSecondary }}>
            12:30 – 13:15
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14.5,
                fontWeight: 700,
                color: t.textPrimary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              11А класс • Профиль IT
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
              Каб. 311 • Тема: Графы и деревья
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 8,
              background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.16)',
              color: t.accentColor,
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            Перемена 15 мин
          </span>
        </div>
      </div>

      {/* ─── ЗАДАЧИ НА СЕГОДНЯ ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.7,
            color: t.textMuted,
            paddingLeft: 2
          }}
        >
          Задачи на сегодня
        </div>

        {/* 1. Заявления родителей в 9А */}
        <button
          type="button"
          onClick={() => {
            onNavigateToTab('classmaster');
            if (onClose) onClose();
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: 14,
            background: t.slotBg,
            border: t.slotBorder,
            color: t.textPrimary,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.18s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = t.slotHoverBg;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = t.slotBg;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Bell size={15} strokeWidth={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Приемная 9А
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: '#ef4444',
                    color: '#ffffff'
                  }}
                >
                  3 новых
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: t.textMuted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: 1
                }}
              >
                ОРВИ (Иванов), Олимпиада (Петров)
              </div>
            </div>
          </div>
          <ChevronRight size={16} color={t.textMuted} style={{ flexShrink: 0 }} />
        </button>

        {/* 2. Дежурство учителя */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 14,
            background: t.slotBg,
            border: t.slotBorder,
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={16} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary }}>
              Дежурство: 13:15 – 13:30
            </div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>
              После 5 урока • 2 этаж (Правое крыло)
            </div>
          </div>
        </div>
      </div>

      {/* ─── КНОПКИ ДЕЙСТВИЙ ВНИЗУ (СОВРЕМЕННЫЙ APPLE UI) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, paddingTop: 2 }}>
        <button
          type="button"
          onClick={() => {
            if (onSelectClass) onSelectClass(activeClass);
            onNavigateToTab('myclasses');
            if (onClose) onClose();
          }}
          style={{
            height: 42,
            padding: '0 14px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 4px 14px rgba(0, 119, 255, 0.28), inset 0 1px 1px rgba(255,255,255,0.4)',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 119, 255, 0.38)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 119, 255, 0.28)';
          }}
        >
          <span>Табель {activeClass}</span>
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={() => {
            onNavigateToTab('tickets');
            if (onClose) onClose();
          }}
          style={{
            height: 42,
            padding: '0 14px',
            borderRadius: 14,
            background: t.slotBg,
            border: t.slotBorder,
            color: t.textPrimary,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.18s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = t.slotHoverBg;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = t.slotBg;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Wrench size={14} color="#ef4444" strokeWidth={2.2} />
          <span>Завхоз</span>
        </button>
      </div>
    </aside>
  );
};

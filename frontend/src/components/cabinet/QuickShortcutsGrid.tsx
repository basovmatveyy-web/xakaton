import React from 'react';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Camera,
  ClipboardCheck,
  Wrench,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import type { AuthThemeMode } from '../../types/auth';

interface QuickShortcutsGridProps {
  theme: AuthThemeMode;
  onNavigateToTab: (tab: any) => void;
  onSelectPrompt: (promptText: string) => void;
}

export const QuickShortcutsGrid: React.FC<QuickShortcutsGridProps> = ({
  theme,
  onNavigateToTab,
  onSelectPrompt
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const colors = {
    cardBg: isContrast
      ? '#ffffff'
      : isLight
      ? 'rgba(255, 255, 255, 0.85)'
      : 'rgba(19, 24, 32, 0.85)',
    cardBorder: isContrast
      ? '1.5px solid #cbd5e1'
      : isLight
      ? '1px solid rgba(226, 232, 240, 0.8)'
      : '1px solid rgba(255, 255, 255, 0.08)',
    cardHoverBorder: isContrast ? '#0055d4' : isLight ? '#93c5fd' : 'rgba(56, 189, 248, 0.4)',
    textPrimary: isContrast ? '#0a0f1d' : isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isContrast ? '#1e293b' : isLight ? '#475569' : '#94a3b8',
    textMuted: isContrast ? '#334155' : isLight ? '#94a3b8' : '#64748b',
    shadow: isContrast
      ? '0 2px 8px rgba(0, 0, 0, 0.06)'
      : isLight
      ? '0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)'
      : '0 4px 16px -2px rgba(0, 0, 0, 0.4)'
  };

  const SHORTCUTS = [
    {
      id: 'lesson-plan',
      title: 'Составить план урока',
      subtitle: 'Тайминг 45 мин, цели и конспект',
      tag: 'Методист',
      tagColor: '#0077ff',
      tagBg: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)',
      icon: BookOpen,
      iconBg: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
      action: () =>
        onSelectPrompt(
          'Составь подробный поурочный план урока по информатике для 9А класса по теме: [введите тему], с целями по ФГОС, этапами урока, вопросами для первичного закрепления и таймингом 45 минут.'
        )
    },
    {
      id: 'aicards',
      title: 'Конструктор проверочной А4',
      subtitle: '4 варианта с линией отреза',
      tag: 'Печать А4',
      tagColor: '#8b5cf6',
      tagBg: isLight ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.18)',
      icon: FileText,
      iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      action: () => onNavigateToTab('aicards')
    },
    {
      id: 'fipi',
      title: 'Банк заданий ФИПИ',
      subtitle: 'Официальные прототипы ОГЭ/ЕГЭ',
      tag: 'ФГОС 2026',
      tagColor: '#f59e0b',
      tagBg: isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.18)',
      icon: GraduationCap,
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      action: () => onNavigateToTab('fipi')
    },
    {
      id: 'boardscan',
      title: 'Оцифровка доски в PDF',
      subtitle: 'Конспект без фона для болеющих',
      tag: 'Белый лист',
      tagColor: '#10b981',
      tagBg: isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.18)',
      icon: Camera,
      iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      action: () => onNavigateToTab('boardscan')
    },
    {
      id: 'classmaster',
      title: 'Приемная 9А и табель',
      subtitle: '3 справки родителей на проверку',
      tag: 'Справки 9А',
      tagColor: '#0284c7',
      tagBg: isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(2, 132, 199, 0.18)',
      icon: ClipboardCheck,
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      action: () => onNavigateToTab('classmaster')
    },
    {
      id: 'tickets',
      title: 'Служба завхоза (каб. 311)',
      subtitle: 'Заявка на ремонт проектора и ламп',
      tag: 'Оперативно',
      tagColor: '#ef4444',
      tagBg: isLight ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.18)',
      icon: Wrench,
      iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      action: () => onNavigateToTab('tickets')
    }
  ];

  return (
    <div style={{ width: '100%', marginTop: 38 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          padding: '0 4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={15} color="#0077ff" />
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              color: colors.textSecondary
            }}
          >
            Инструменты
          </span>
        </div>
        <span style={{ fontSize: 11.5, color: colors.textMuted }}>
          Переход в 1 клик
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12
        }}
      >
        {SHORTCUTS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              style={{
                background: colors.cardBg,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: colors.cardBorder,
                borderRadius: 16,
                boxShadow: colors.shadow,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = colors.cardHoverBorder;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.border = typeof colors.cardBorder === 'string' ? colors.cardBorder : '';
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: item.iconBg,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)'
                }}
              >
                <Icon size={18} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: item.tagBg,
                      color: item.tagColor
                    }}
                  >
                    {item.tag}
                  </span>
                  <ArrowUpRight size={13} color={colors.textMuted} style={{ flexShrink: 0 }} />
                </div>

                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    marginTop: 6,
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    fontSize: 11.5,
                    color: colors.textSecondary,
                    marginTop: 3,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

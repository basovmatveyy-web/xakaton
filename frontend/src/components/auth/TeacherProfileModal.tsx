import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  LogOut,
  Sun,
  Moon,
  Palette,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from './useAuth';
import { DEMO_PERSONAS } from './demoPersonas';
import { VkIdTab } from './VkIdTab';
import { SnilsLoginTab } from './SnilsLoginTab';
import type { AuthThemeMode } from '../../types/auth';

interface TeacherProfileModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  theme?: AuthThemeMode;
  setTheme?: (t: AuthThemeMode) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  theme = 'light',
  setTheme
}) => {
  const {
    user,
    switchRole,
    loginWithSferumId,
    loginWithSnils,
    loginWithEsia,
    logout,
    isLoading,
    authError
  } = useAuth();

  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const [activeTab, setActiveTab] = useState<'profile' | 'roles' | 'auth'>('profile');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Стилевая система Apple macOS / iOS Inset Grouped
  const colors = {
    overlayBg: 'rgba(0, 0, 0, 0.6)',
    modalBg: isLight ? '#ffffff' : '#1c1c1e',
    modalBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.12)',
    textPrimary: isLight ? '#000000' : '#ffffff',
    textSecondary: isLight ? '#3c3c43' : '#ebebf5',
    textMuted: isLight ? '#8e8e93' : '#8e8e93',
    groupBg: isLight ? '#f2f2f7' : '#2c2c2e',
    divider: isLight ? 'rgba(60, 60, 67, 0.12)' : 'rgba(235, 235, 245, 0.12)',
    accentColor: isContrast ? '#0055d4' : '#007aff',
    hoverBg: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)'
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleRoleSelect = async (personaId: string) => {
    const success = await switchRole(personaId);
    if (success) {
      setActiveTab('profile');
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  // ФИО и инициалы текущего пользователя
  const isStudent = user?.role === 'student';
  const isStaff = user?.role === 'staff';
  const isZavuch = user?.role === 'zavuch';

  const defaultFullName = isStudent
    ? 'Иванов Иван Дмитриевич'
    : isStaff
    ? 'Сидоров Виктор Павлович'
    : isZavuch
    ? 'Громова Александра Сергеевна'
    : 'Лосив Роман Борисович';

  const defaultRoleTitle = isStudent
    ? 'Обучающийся 9А класса • Физмат и IT профиль'
    : isStaff
    ? 'Зам. директора по АХЧ (Завхоз) • Инженерная служба'
    : isZavuch
    ? 'Заместитель директора по УВР (Завуч) • Каб. 201'
    : 'Классный руководитель 9А • Учитель информатики и математики';

  const fullName = user?.fullName || defaultFullName;
  const roleTitle = user?.roleTitle || defaultRoleTitle;
  const school = user?.school || 'МАОУ «Лицей Информационных Технологий»';
  const initial = fullName.trim()[0] || (isStudent ? 'И' : isStaff ? 'С' : isZavuch ? 'Г' : 'Л');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: colors.overlayBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: '88vh',
          background: colors.modalBg,
          borderRadius: 20,
          boxShadow: isLight
            ? '0 20px 50px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            : '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* ─── ШАПКА ОКНА (APPLE WINDOW BAR) ─── */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.divider}`
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>
            {isStudent ? 'Профиль обучающегося' : isStaff ? 'Профиль сотрудника АХЧ' : isZavuch ? 'Профиль завуча по УВР' : 'Профиль педагога'}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: colors.groupBg,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: colors.textSecondary,
              transition: 'opacity 0.15s ease'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ─── АВАТАР И ОСНОВНАЯ ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ ─── */}
        <div
          style={{
            padding: '24px 24px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            borderBottom: `1px solid ${colors.divider}`
          }}
        >
          {/* Аватар */}
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: isStudent
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : isStaff
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : isZavuch
                ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                : 'linear-gradient(135deg, #007aff 0%, #0051b3 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: isStudent
                ? '0 4px 14px rgba(16, 185, 129, 0.35)'
                : isStaff
                ? '0 4px 14px rgba(245, 158, 11, 0.35)'
                : isZavuch
                ? '0 4px 14px rgba(139, 92, 246, 0.35)'
                : '0 4px 14px rgba(0, 122, 255, 0.3)'
            }}
          >
            {initial}
          </div>

          {/* Имя и роль */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, letterSpacing: -0.3 }}>
              {fullName}
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2, lineHeight: 1.35 }}>
              {roleTitle}
            </div>
            <div style={{ fontSize: 12, color: colors.accentColor, marginTop: 4, fontWeight: 500 }}>
              {school}
            </div>
          </div>
        </div>

        {/* ─── СЕГМЕНТИРОВАННЫЙ СВИТЧЕР (APPLE SEGMENTED BAR) ─── */}
        <div style={{ padding: '14px 20px 8px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1.2fr',
              background: colors.groupBg,
              borderRadius: 10,
              padding: 3,
              gap: 2
            }}
          >
            {[
              { id: 'profile', label: 'Данные' },
              { id: 'roles', label: 'Смена роли' },
              { id: 'auth', label: 'Сферум / СНИЛС' }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: active ? (isLight ? '#ffffff' : '#636366') : 'transparent',
                    color: active ? colors.textPrimary : colors.textMuted,
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── ТЕЛО ОКНА ─── */}
        <div style={{ padding: '10px 20px 20px', overflowY: 'auto', flex: 1 }}>
          {/* ВКЛАДКА 1: ОСНОВНЫЕ ДАННЫЕ (APPLE INSET GROUPED LIST) */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {isStudent ? (
                <>
                  {/* Группа 1: Учебные сведения учащегося */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>
                      Учебные сведения
                    </div>
                    <div style={{ background: colors.groupBg, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Класс</span>
                        <strong style={{ color: colors.textPrimary }}>9 «А» класс (Кабинет 311)</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Классный руководитель</span>
                        <strong style={{ color: colors.textPrimary }}>Лосив Роман Борисович</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Профиль обучения</span>
                        <strong style={{ color: colors.accentColor }}>Физико-математический / IT</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Текущий средний балл</span>
                        <strong style={{ color: '#10b981' }}>4.82 (Отличник)</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Статус турникета</span>
                        <strong style={{ color: '#10b981' }}>В лицее (Турникет №2 в 08:14)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Группа 2: Реквизиты, питание и родители */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>
                      Карта питания и Сферум
                    </div>
                    <div style={{ background: colors.groupBg, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Лицевой счёт питания</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ color: colors.textPrimary }}>5401-3110-8842 (840 ₽)</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy('5401-3110-8842', 'card')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedItem === 'card' ? '#34c759' : colors.accentColor, padding: 0 }}
                          >
                            {copiedItem === 'card' ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>СНИЛС</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <code style={{ fontFamily: 'monospace', fontWeight: 600, color: colors.textPrimary }}>189-204-511 88</code>
                          <button
                            type="button"
                            onClick={() => handleCopy('189-204-511 88', 'snils')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedItem === 'snils' ? '#34c759' : colors.accentColor, padding: 0 }}
                          >
                            {copiedItem === 'snils' ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Законный представитель (Мама)</span>
                        <strong style={{ color: colors.textPrimary }}>Иванова Е.В. (+7 913 902-11-44)</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Сферум ID</span>
                        <strong style={{ color: colors.accentColor }}>@ivanov_ivan_9a</strong>
                      </div>
                    </div>
                  </div>
                </>
              ) : isStaff ? (
                <>
                  {/* Группа 1: Служебные данные завхоза */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>
                      Служебные данные АХЧ
                    </div>
                    <div style={{ background: colors.groupBg, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Зона ответственности</span>
                        <strong style={{ color: colors.textPrimary }}>Здание лицея (1–3 этажи, мастерская АХЧ)</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Должность</span>
                        <strong style={{ color: colors.textPrimary }}>Зам. директора по АХЧ (Главный инженер)</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Стаж в лицее</span>
                        <strong style={{ color: colors.textPrimary }}>11 лет</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Электробезопасность</span>
                        <strong style={{ color: '#f59e0b' }}>IV группа (до и выше 1000 В)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Группа 2: Контакты завхоза */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>
                      Контакты и Сферум
                    </div>
                    <div style={{ background: colors.groupBg, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Дежурный телефон</span>
                        <strong style={{ color: colors.textPrimary }}>+7 (913) 774-88-21</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Рабочая почта</span>
                        <strong style={{ color: colors.textPrimary }}>sidorov@maou-lit.ru</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>СНИЛС</span>
                        <code style={{ fontFamily: 'monospace', fontWeight: 600, color: colors.textPrimary }}>112-409-583 31</code>
                      </div>
                    </div>
                  </div>
                </>
              ) : isZavuch ? (
                <>
                  {/* Группа 1: Служебные данные завуча */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>
                      Служебные данные УВР
                    </div>
                    <div style={{ background: colors.groupBg, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Должность</span>
                        <strong style={{ color: colors.textPrimary }}>Зам. директора по УВР (Старшая школа и ГИА)</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Кабинет</span>
                        <strong style={{ color: colors.textPrimary }}>Кабинет 201 (Учительская / Приемная)</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Курируемые параллели</span>
                        <strong style={{ color: colors.accentColor }}>9, 10, 11 классы (ОГЭ и ЕГЭ)</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Квалификационная категория</span>
                        <strong style={{ color: '#10b981' }}>Высшая категория</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Педагогический стаж</span>
                        <strong style={{ color: colors.textPrimary }}>19 лет (в руководстве лицея 8 лет)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Группа 2: Контакты завуча */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>
                      Контакты и Сферум
                    </div>
                    <div style={{ background: colors.groupBg, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Служебный телефон</span>
                        <strong style={{ color: colors.textPrimary }}>+7 (913) 980-22-31</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Рабочая почта</span>
                        <strong style={{ color: colors.textPrimary }}>gromova@maou-lit.ru</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>СНИЛС</span>
                        <code style={{ fontFamily: 'monospace', fontWeight: 600, color: colors.textPrimary }}>132-771-409 62</code>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Электронная подпись</span>
                        <strong style={{ color: '#8b5cf6' }}>Усиленная ЭЦП завуча (Госключ)</strong>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Группа 1: Учебная деятельность и кабинет учителя */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>
                      Служебные данные
                    </div>
                    <div
                      style={{
                        background: colors.groupBg,
                        borderRadius: 12,
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Кабинет</span>
                        <strong style={{ color: colors.textPrimary }}>Кабинет 311 (Лаборатория математики и ИКТ)</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Классное руководство</span>
                        <strong style={{ color: colors.textPrimary }}>9А класс (28 учеников)</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Предметы</span>
                        <strong style={{ color: colors.textPrimary }}>Информатика, Алгебра, Геометрия</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Квалификационная категория</span>
                        <strong style={{ color: '#34c759' }}>Высшая категория</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Педагогический стаж</span>
                        <strong style={{ color: colors.textPrimary }}>14 лет (в лицее 9 лет)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Группа 2: Контактные данные и СНИЛС */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>
                      Контакты и Сферум
                    </div>
                    <div
                      style={{
                        background: colors.groupBg,
                        borderRadius: 12,
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Телефон (Сферум)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ color: colors.textPrimary }}>+7 (913) 921-44-12</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy('+79139214412', 'phone')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedItem === 'phone' ? '#34c759' : colors.accentColor, padding: 0 }}
                          >
                            {copiedItem === 'phone' ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${colors.divider}`, fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>Рабочая почта</span>
                        <strong style={{ color: colors.textPrimary }}>losiv@maou-lit.ru</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13 }}>
                        <span style={{ color: colors.textMuted }}>СНИЛС</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <code style={{ fontFamily: 'monospace', fontWeight: 600, color: colors.textPrimary }}>142-892-304 77</code>
                          <button
                            type="button"
                            onClick={() => handleCopy('142-892-304 77', 'snils')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedItem === 'snils' ? '#34c759' : colors.accentColor, padding: 0 }}
                          >
                            {copiedItem === 'snils' ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Группа 3: Тема интерфейса */}
              {setTheme && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>
                    Оформление приложения
                  </div>
                  <div
                    style={{
                      background: colors.groupBg,
                      borderRadius: 12,
                      padding: 10,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 6
                    }}
                  >
                    {[
                      { id: 'light', label: 'Светлая', icon: Sun },
                      { id: 'oled', label: 'Темная', icon: Moon },
                      { id: 'slate', label: 'Графит', icon: Palette },
                      { id: 'contrast', label: 'Контраст', icon: Layers }
                    ].map((item) => {
                      const isSelected = theme === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTheme(item.id as AuthThemeMode)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 5,
                            padding: '8px 4px',
                            borderRadius: 8,
                            border: isSelected ? `2px solid ${colors.accentColor}` : '2px solid transparent',
                            background: isSelected ? (isLight ? '#ffffff' : '#3a3a3c') : 'transparent',
                            color: isSelected ? colors.textPrimary : colors.textMuted,
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: isSelected ? 600 : 500
                          }}
                        >
                          <Icon size={16} color={isSelected ? colors.accentColor : colors.textMuted} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ВКЛАДКА 2: БЫСТРАЯ СМЕНА РОЛИ (ДЕМО-ДОСТУП) */}
          {activeTab === 'roles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4, marginLeft: 4 }}>
                Выберите роль для переключения рабочего места:
              </div>

              <div
                style={{
                  background: colors.groupBg,
                  borderRadius: 12,
                  overflow: 'hidden'
                }}
              >
                {DEMO_PERSONAS.map((p, idx) => {
                  const isCurrent = (user?.fullName === p.fullName) || (user?.role === p.role && idx === 0);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleRoleSelect(p.id)}
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        border: 'none',
                        borderBottom: idx < DEMO_PERSONAS.length - 1 ? `1px solid ${colors.divider}` : 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                          {p.fullName}
                        </div>
                        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                          {p.roleTitle}
                        </div>
                      </div>

                      {isCurrent ? (
                        <span style={{ fontSize: 12, color: colors.accentColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={14} /> Текущая
                        </span>
                      ) : (
                        <ChevronRight size={16} color={colors.textMuted} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ВКЛАДКА 3: АВТОРИЗАЦИЯ ПО СФЕРУМ ID И СНИЛС */}
          {activeTab === 'auth' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <VkIdTab
                onLogin={async (name) => {
                  const res = await loginWithSferumId(name);
                  if (res) onClose();
                  return res;
                }}
                isLoading={isLoading}
              />

              <div style={{ height: 1, background: colors.divider, margin: '6px 0' }} />

              <SnilsLoginTab
                onLoginSnils={async (req) => {
                  const res = await loginWithSnils(req);
                  if (res) onClose();
                  return res;
                }}
                onLoginEsia={async () => {
                  const res = await loginWithEsia();
                  if (res) onClose();
                  return res;
                }}
                isLoading={isLoading}
                errorMessage={authError}
              />
            </div>
          )}
        </div>

        {/* ─── ПОДВАЛ ОКНА: ВЫХОД ИЗ ПРОФИЛЯ ─── */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: `1px solid ${colors.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: colors.groupBg
          }}
        >
          <div style={{ fontSize: 11, color: colors.textMuted }}>
            МАОУ ЛИТ • СФЕРУМ.КАБИНЕТ
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: '#ff3b30',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6
            }}
          >
            <LogOut size={14} />
            <span>Выйти из профиля</span>
          </button>
        </div>
      </div>
    </div>
  );
};

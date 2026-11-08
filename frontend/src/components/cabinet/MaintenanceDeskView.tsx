import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Clock,
  CheckCircle2,
  Building2,
  Tv,
  Zap,
  Armchair,
  DoorClosed,
  Monitor,
  Droplets,
  Search,
  X
} from 'lucide-react';
import type { AuthThemeMode } from '../../types/auth';

export interface RepairTicket {
  id: string;
  room: string;
  category: string;
  description: string;
  isUrgent: boolean;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface SchoolRoom {
  number: string;
  floor: number;
  wing: string;
  label?: string;
  isMyRoom?: boolean;
}

// 60 кабинетов лицея (101-120, 201-220, 301-320) + основные помещения
const ALL_SCHOOL_ROOMS: SchoolRoom[] = (() => {
  const list: SchoolRoom[] = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let i = 1; i <= 20; i++) {
      const num = `${floor}${i < 10 ? '0' : ''}${i}`;
      const isLeft = i <= 10;
      const wing = isLeft ? 'Левое крыло' : 'Правое крыло';
      list.push({
        number: num,
        floor,
        wing,
        isMyRoom: num === '311',
        label: num === '311' ? 'Кабинет информатики (Лосив Р.Б.)' : undefined
      });
    }
  }
  list.push(
    { number: 'Спортзал', floor: 1, wing: 'Левое крыло', label: 'Большой спортивный зал' },
    { number: 'Столовая', floor: 1, wing: 'Правое крыло', label: 'Обеденный зал' },
    { number: 'Актовый зал', floor: 2, wing: 'Центральный блок', label: 'Актовый зал на 250 мест' },
    { number: 'Библиотека', floor: 2, wing: 'Левое крыло', label: 'Медиатека и читальный зал' }
  );
  return list;
})();

const INITIAL_TICKETS: RepairTicket[] = [
  {
    id: 'Т-104',
    room: '311',
    category: 'Проектор / Доска',
    description: 'Гаснет лампа проектора NEC во время урока (мерцает синим индикатором)',
    isUrgent: true,
    status: 'in_progress',
    createdAt: 'Сегодня, 11:15'
  },
  {
    id: 'Т-103',
    room: '204',
    category: 'Мебель / Парты',
    description: 'Шаткая ножка у парты 2-го ряда со стороны окна, требуется подтянуть болт',
    isUrgent: false,
    status: 'in_progress',
    createdAt: 'Сегодня, 09:40'
  },
  {
    id: 'Т-102',
    room: '108',
    category: 'Электрика / Розетки',
    description: 'Не работает розетка на учительском столе, нет питания для ноутбука',
    isUrgent: false,
    status: 'new',
    createdAt: 'Вчера, 15:20'
  },
  {
    id: 'Т-101',
    room: '311',
    category: 'Освещение / Лампы',
    description: 'Замена двух ламп дневного света у меловой доски (перегорели)',
    isUrgent: false,
    status: 'resolved',
    createdAt: '22 октября'
  }
];

interface MaintenanceDeskViewProps {
  theme?: AuthThemeMode;
  onNavigateToTab?: (tab: any) => void;
}

export const MaintenanceDeskView: React.FC<MaintenanceDeskViewProps> = ({
  theme = 'light'
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const colors = {
    cardBg: isLight ? '#ffffff' : '#141a24',
    cardBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
    cardShadow: isContrast
      ? 'none'
      : isLight
      ? '0 4px 20px -4px rgba(15, 23, 42, 0.06), 0 2px 8px -2px rgba(15, 23, 42, 0.03)'
      : '0 4px 20px -4px rgba(0, 0, 0, 0.4)',
    textPrimary: isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isLight ? '#475569' : '#94a3b8',
    textMuted: isLight ? '#94a3b8' : '#64748b',
    accentColor: isContrast ? '#0000ee' : '#0077ff',
    slotBg: isLight ? '#f8fafc' : '#0d121a',
    hoverBg: isLight ? '#f1f5f9' : '#1b2432',
    badgeBg: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.16)',
    activeBorder: isLight ? '#0077ff' : '#38bdf8'
  };

  // Состояния
  const [tickets, setTickets] = useState<RepairTicket[]>(INITIAL_TICKETS);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'urgent' | 'resolved'>('all');

  // Поля формы
  const [room, setRoom] = useState('311');
  const [category, setCategory] = useState('Проектор / Доска');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [roomInputFocused, setRoomInputFocused] = useState(false);
  const roomDropdownRef = useRef<HTMLDivElement | null>(null);

  // Категории с иконками
  const CATEGORIES = [
    { label: 'Проектор / Доска', icon: Tv },
    { label: 'Электрика / Розетки', icon: Zap },
    { label: 'Мебель / Парты', icon: Armchair },
    { label: 'Окна / Двери / Замки', icon: DoorClosed },
    { label: 'ПК / Сеть / Аудио', icon: Monitor },
    { label: 'Сантехника / Батареи', icon: Droplets }
  ];

  // Поиск подходящих кабинетов в реальном времени
  const matchedRoomInfo = useMemo(() => {
    const q = room.trim().toLowerCase();
    if (!q) return null;
    return ALL_SCHOOL_ROOMS.find((r) => r.number.toLowerCase() === q) || null;
  }, [room]);

  const searchResults = useMemo(() => {
    const q = room.trim().toLowerCase();
    if (!q) {
      return ALL_SCHOOL_ROOMS.filter((r) => r.number === '311' || r.number === '204' || r.number === '108' || r.number === 'Спортзал');
    }
    return ALL_SCHOOL_ROOMS.filter(
      (r) =>
        r.number.toLowerCase().includes(q) ||
        r.wing.toLowerCase().includes(q) ||
        (r.label && r.label.toLowerCase().includes(q)) ||
        `${r.floor} этаж`.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [room]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roomDropdownRef.current && !roomDropdownRef.current.contains(e.target as Node)) {
        setIsRoomDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newTicket: RepairTicket = {
      id: `Т-${Math.floor(Math.random() * 900 + 105)}`,
      room: room.trim() || '311',
      category,
      description: description.trim(),
      isUrgent,
      status: 'new',
      createdAt: 'Только что'
    };

    setTickets([newTicket, ...tickets]);
    setDescription('');
    setIsUrgent(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const handleToggleStatus = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus = t.status === 'resolved' ? 'in_progress' : 'resolved';
        return { ...t, status: nextStatus };
      })
    );
  };

  const handleDeleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const activeCount = tickets.filter((t) => t.status !== 'resolved').length;
  const urgentCount = tickets.filter((t) => t.isUrgent && t.status !== 'resolved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  const filteredTickets = tickets.filter((t) => {
    if (filterTab === 'active') return t.status !== 'resolved';
    if (filterTab === 'urgent') return t.isUrgent && t.status !== 'resolved';
    if (filterTab === 'resolved') return t.status === 'resolved';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 1.4vw + 12px, 24px)' }}>
      {/* ─── ЛАКОНИЧНАЯ ШАПКА ─── */}
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          boxShadow: colors.cardShadow,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
            flexShrink: 0
          }}
        >
          <Wrench size={24} color="#ffffff" />
        </div>

        <h1
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: 'clamp(20px, 1.3vw + 14px, 24px)',
            letterSpacing: '-0.3px',
            color: colors.textPrimary,
            lineHeight: 1.2
          }}
        >
          Служба завхоза
        </h1>
      </div>

      {/* ─── ОСНОВНОЙ РАБОЧИЙ ГРИД (МАСШТАБНЫЙ, ПРЕЗЕНТАБЕЛЬНЫЙ) ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 420px) minmax(460px, 1fr)',
          gap: 'clamp(18px, 1.4vw + 12px, 24px)',
          alignItems: 'start'
        }}
      >
        {/* ─── ЛЕВАЯ КОЛОНКА: ФОРМА ПОДАЧИ ЗАЯВКИ ─── */}
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 20,
            boxShadow: colors.cardShadow,
            padding: 'clamp(20px, 1.5vw + 14px, 28px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 'clamp(16px, 0.6vw + 14px, 19px)',
                letterSpacing: '-0.2px',
                color: colors.textPrimary
              }}
            >
              Новая заявка на ремонт
            </div>
          </div>

          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 1. Умный поиск кабинета с авто-определением */}
            <div ref={roomDropdownRef} style={{ position: 'relative' }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: colors.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8
                }}
              >
                <Building2 size={15} color={colors.accentColor} />
                <span>Кабинет / Помещение</span>
              </label>

              {/* Поле живого поиска */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: colors.slotBg,
                  border: `1.5px solid ${roomInputFocused || isRoomDropdownOpen ? colors.accentColor : colors.cardBorder}`,
                  borderRadius: 12,
                  boxShadow: roomInputFocused ? '0 0 0 3px rgba(0, 119, 255, 0.12)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ paddingLeft: 14, color: colors.accentColor, display: 'flex', alignItems: 'center' }}>
                  <Search size={16} />
                </div>

                <input
                  type="text"
                  value={room}
                  onChange={(e) => {
                    setRoom(e.target.value);
                    setIsRoomDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setRoomInputFocused(true);
                    setIsRoomDropdownOpen(true);
                  }}
                  onBlur={() => setRoomInputFocused(false)}
                  placeholder="Введите номер (например, 311, 204, Спортзал)..."
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 12px',
                    background: 'transparent',
                    border: 'none',
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />

                {room && (
                  <button
                    type="button"
                    onClick={() => {
                      setRoom('');
                      setIsRoomDropdownOpen(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0 12px',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Очистить"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Выпадающий список результатов живого поиска */}
              {isRoomDropdownOpen && searchResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: 12,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                    zIndex: 50,
                    overflow: 'hidden',
                    maxHeight: 260,
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, color: colors.textMuted, borderBottom: `1px solid ${colors.cardBorder}` }}>
                    {room.trim() ? `Найдено помещений (${searchResults.length}):` : 'Быстрый выбор аудитории:'}
                  </div>
                  {searchResults.map((r) => {
                    const isSelected = room.trim().toLowerCase() === r.number.toLowerCase();
                    return (
                      <div
                        key={r.number}
                        onClick={() => {
                          setRoom(r.number);
                          setIsRoomDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          background: isSelected ? colors.badgeBg : 'transparent',
                          borderBottom: `1px solid ${colors.cardBorder}`,
                          transition: 'background 0.12s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = colors.slotBg;
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: r.isMyRoom ? 'rgba(0, 119, 255, 0.12)' : colors.slotBg,
                              color: r.isMyRoom ? colors.accentColor : colors.textPrimary,
                              border: `1px solid ${colors.cardBorder}`
                            }}
                          >
                            № {r.number}
                          </span>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: colors.textPrimary }}>
                              {r.floor} этаж • {r.wing}
                            </div>
                            {r.label && (
                              <div style={{ fontSize: 11, color: colors.textMuted }}>
                                {r.label}
                              </div>
                            )}
                          </div>
                        </div>

                        {r.isMyRoom && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: colors.accentColor,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: colors.badgeBg
                            }}
                          >
                            ★ Мой кабинет
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Карточка авто-определения кабинета */}
              {matchedRoomInfo && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: isLight ? 'rgba(0, 119, 255, 0.05)' : 'rgba(0, 119, 255, 0.12)',
                    border: `1px solid ${isLight ? 'rgba(0, 119, 255, 0.18)' : 'rgba(0, 119, 255, 0.28)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: colors.textPrimary
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} color="#10b981" />
                    <span>
                      <strong>Кабинет {matchedRoomInfo.number}</strong> — {matchedRoomInfo.floor} этаж, {matchedRoomInfo.wing}
                    </span>
                  </div>
                  {matchedRoomInfo.isMyRoom && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: colors.accentColor }}>
                      (Ваша аудитория)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 2. Категория поломки */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: colors.textSecondary,
                  display: 'block',
                  marginBottom: 8
                }}
              >
                Категория оборудования
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat.label;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setCategory(cat.label)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 12px',
                        borderRadius: 10,
                        border: isActive ? `1.5px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                        background: isActive ? colors.badgeBg : colors.slotBg,
                        color: isActive ? colors.accentColor : colors.textPrimary,
                        fontSize: 12.5,
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Описание проблемы */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: colors.textSecondary,
                  display: 'block',
                  marginBottom: 8
                }}
              >
                Что именно сломалось или барахлит
              </label>

              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите характер поломки (например: мерцает лампа проектора, шатается стул, не горит свет у доски)..."
                style={{
                  width: '100%',
                  minHeight: 90,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1px solid ${colors.cardBorder}`,
                  background: colors.slotBg,
                  color: colors.textPrimary,
                  fontSize: 14,
                  lineHeight: 1.5,
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  transition: 'border-color 0.15s ease'
                }}
                required
              />
            </div>

            {/* 4. Срочность */}
            <div
              onClick={() => setIsUrgent(!isUrgent)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                cursor: 'pointer',
                background: isUrgent ? 'rgba(239, 68, 68, 0.08)' : colors.slotBg,
                border: isUrgent ? '1.5px solid rgba(239, 68, 68, 0.35)' : `1px solid ${colors.cardBorder}`,
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  border: isUrgent ? 'none' : `1.5px solid ${colors.textMuted}`,
                  background: isUrgent ? '#ef4444' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}
              >
                {isUrgent && <Check size={14} strokeWidth={3} />}
              </div>

              <span
                style={{
                  fontSize: 14,
                  fontWeight: isUrgent ? 700 : 500,
                  color: isUrgent ? '#ef4444' : colors.textPrimary
                }}
              >
                Срочная заявка
              </span>
            </div>

            {/* 5. Кнопка создания */}
            <button
              type="submit"
              style={{
                width: '100%',
                height: 48,
                borderRadius: 12,
                background: isUrgent ? '#ef4444' : colors.accentColor,
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: isUrgent
                  ? '0 4px 14px rgba(239, 68, 68, 0.3)'
                  : '0 4px 14px rgba(0, 119, 255, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>{isUrgent ? 'Отправить срочную заявку' : 'Создать заявку'}</span>
            </button>

            {successToast && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#ecfdf5',
                  color: '#065f46',
                  fontSize: 13,
                  fontWeight: 700,
                  border: '1px solid #a7f3d0'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Заявка успешно зарегистрирована в журнале</span>
              </div>
            )}
          </form>
        </div>

        {/* ─── ПРАВАЯ КОЛОНКА: ЖУРНАЛ И КАРТОЧКИ ЗАЯВОК ─── */}
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 20,
            boxShadow: colors.cardShadow,
            padding: 'clamp(20px, 1.5vw + 14px, 28px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          {/* Верхняя строка списка с фильтрами */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              borderBottom: `1px solid ${colors.cardBorder}`,
              paddingBottom: 16
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 'clamp(16px, 0.6vw + 14px, 19px)',
                  letterSpacing: '-0.2px',
                  color: colors.textPrimary
                }}
              >
                Список заявок
              </div>
            </div>

            {/* Фильтры в стиле segmented control */}
            <div
              style={{
                display: 'flex',
                background: colors.slotBg,
                padding: 4,
                borderRadius: 10,
                border: `1px solid ${colors.cardBorder}`,
                gap: 4
              }}
            >
              {[
                { id: 'all', label: `Все (${tickets.length})` },
                { id: 'active', label: `В работе (${activeCount})` },
                { id: 'urgent', label: `Срочные (${urgentCount})` },
                { id: 'resolved', label: `Решено (${resolvedCount})` }
              ].map((tab) => {
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: isActive ? colors.cardBg : 'transparent',
                      color: isActive ? colors.textPrimary : colors.textSecondary,
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Карточки заявок */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredTickets.map((t) => {
              const isResolved = t.status === 'resolved';

              return (
                <div
                  key={t.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: colors.slotBg,
                    border: `1px solid ${t.isUrgent && !isResolved ? 'rgba(239, 68, 68, 0.35)' : colors.cardBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    opacity: isResolved ? 0.75 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Верхняя строка карточки: Кабинет, Категория, Срочность и Время */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 14.5,
                          color: colors.textPrimary,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`
                        }}
                      >
                        Каб. {t.room}
                      </span>

                      <span
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          fontWeight: 600
                        }}
                      >
                        {t.category}
                      </span>

                      {t.isUrgent && !isResolved && (
                        <span
                          style={{
                            fontSize: 11.5,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            fontWeight: 700
                          }}
                        >
                          Срочно
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textMuted }}>
                      <Clock size={13} />
                      <span>{t.createdAt}</span>
                      <span style={{ opacity: 0.5 }}>• {t.id}</span>
                    </div>
                  </div>

                  {/* Описание проблемы */}
                  <div
                    style={{
                      fontSize: 14.5,
                      color: colors.textPrimary,
                      lineHeight: 1.5,
                      textDecoration: isResolved ? 'line-through' : 'none'
                    }}
                  >
                    {t.description}
                  </div>

                  {/* Нижняя строка карточки: Статус и кнопки действий */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                      paddingTop: 8,
                      borderTop: `1px solid ${colors.cardBorder}`
                    }}
                  >
                    {/* Статус */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isResolved ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: '#dcfce7',
                            color: '#16a34a',
                            fontSize: 12.5,
                            fontWeight: 700
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Выполнено мастером</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: t.isUrgent ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: t.isUrgent ? '#ef4444' : '#d97706',
                            fontSize: 12.5,
                            fontWeight: 700
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: t.isUrgent ? '#ef4444' : '#f59e0b'
                            }}
                          />
                          <span>В работе у мастера</span>
                        </span>
                      )}
                    </div>

                    {/* Действия */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(t.id)}
                        style={{
                          height: 36,
                          padding: '0 14px',
                          borderRadius: 8,
                          border: `1px solid ${isResolved ? '#bbf7d0' : colors.cardBorder}`,
                          background: isResolved ? '#ecfdf5' : colors.cardBg,
                          color: isResolved ? '#15803d' : colors.textPrimary,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isResolved ? (
                          <>
                            <RotateCcw size={14} />
                            <span>Вернуть в работу</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            <span>Отметить решенным</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTicket(t.id)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: `1px solid ${colors.cardBorder}`,
                          background: colors.cardBg,
                          color: colors.textMuted,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        title="Удалить запись"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTickets.length === 0 && (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: colors.slotBg,
                  borderRadius: 14,
                  border: `1px dashed ${colors.cardBorder}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <CheckCircle2 size={32} color="#10b981" />
                <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>
                  Нет заявок в выбранной категории
                </div>
                <div style={{ fontSize: 13, color: colors.textSecondary }}>
                  Все технические неполадки устранены или еще не зарегистрированы
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

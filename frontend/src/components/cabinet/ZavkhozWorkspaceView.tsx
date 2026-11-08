import React, { useState, useMemo } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Package,
  FileText,
  Printer,
  Search,
  Filter,
  Plus,
  Copy,
  Check,
  Building2
} from 'lucide-react';
import type { AuthThemeMode, User } from '../../types/auth';

export interface ZavkhozTicket {
  id: string;
  room: string;
  floor: number;
  wing: string;
  teacher: string;
  category: 'Проектор / Доска' | 'Мебель / Парты' | 'Электрика / Розетки' | 'Освещение / Лампы' | 'Сантехника' | 'Двери / Замки';
  description: string;
  isUrgent: boolean;
  status: 'new' | 'in_progress' | 'procurement' | 'resolved';
  createdAt: string;
  sferumReplySuggestion?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minThreshold: number;
  location: string;
}

const INITIAL_ZAVKHOZ_TICKETS: ZavkhozTicket[] = [
  {
    id: 'Т-104',
    room: '311',
    floor: 3,
    wing: 'Правое крыло',
    teacher: 'Лосив Роман Борисович',
    category: 'Проектор / Доска',
    description: 'Гаснет лампа проектора NEC во время урока (индикатор мигает синим, проектор отключается)',
    isUrgent: true,
    status: 'in_progress',
    createdAt: 'Сегодня, 11:15',
    sferumReplySuggestion: 'Роман Борисович, запасная лампа NP-M300X взята со склада. Зайду заменить на 5 перемене в 12:15.'
  },
  {
    id: 'Т-103',
    room: '204',
    floor: 2,
    wing: 'Левое крыло',
    teacher: 'Смирнов Андрей Павлович',
    category: 'Мебель / Парты',
    description: 'Шаткая ножка у парты 2-го ряда со стороны окна, требуется затянуть болт М6 с новой гайкой',
    isUrgent: false,
    status: 'in_progress',
    createdAt: 'Сегодня, 09:40',
    sferumReplySuggestion: 'Андрей Павлович, заявку принял. Инструмент с собой, починю парту после уроков в 14:30.'
  },
  {
    id: 'Т-102',
    room: '108',
    floor: 1,
    wing: 'Левое крыло',
    teacher: 'Васильева Ирина Владимировна',
    category: 'Электрика / Розетки',
    description: 'Не работает сетевая розетка у учительского стола, нет питания для ноутбука',
    isUrgent: false,
    status: 'new',
    createdAt: 'Вчера, 15:20',
    sferumReplySuggestion: 'Ирина Владимировна, заявка в очереди. Электрик проверит автомат в щитке до 12:00.'
  },
  {
    id: 'Т-105',
    room: '302',
    floor: 3,
    wing: 'Левое крыло',
    teacher: 'Семенов Михаил Юрьевич',
    category: 'Сантехника',
    description: 'Капает кран в препараторской кабинета физики (износ кран-буксы)',
    isUrgent: false,
    status: 'procurement',
    createdAt: 'Вчера, 14:10',
    sferumReplySuggestion: 'Михаил Юрьевич, кран-буксы заказаны у поставщика, поставка завтра утром.'
  },
  {
    id: 'Т-101',
    room: '311',
    floor: 3,
    wing: 'Правое крыло',
    teacher: 'Лосив Роман Борисович',
    category: 'Освещение / Лампы',
    description: 'Замена двух светодиодных ламп у меловой доски (перегорели)',
    isUrgent: false,
    status: 'resolved',
    createdAt: '22 октября',
    sferumReplySuggestion: 'Лампы заменены, освещенность доски в норме.'
  },
  {
    id: 'Т-098',
    room: '115',
    floor: 1,
    wing: 'Правое крыло',
    teacher: 'Кузнецова Елена Николаевна',
    category: 'Двери / Замки',
    description: 'Туго закрывается дверной замок, клинит язычок',
    isUrgent: false,
    status: 'resolved',
    createdAt: '19 октября',
    sferumReplySuggestion: 'Замок смазан графитовой смазкой, закрывается плавно.'
  }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Лампа для проектора NEC (NP-M300X)', category: 'Оптика', unit: 'шт.', quantity: 2, minThreshold: 3, location: 'Стеллаж А-2' },
  { id: '2', name: 'Светодиодная потолочная панель 600x600 40W', category: 'Освещение', unit: 'шт.', quantity: 12, minThreshold: 5, location: 'Стеллаж Б-1' },
  { id: '3', name: 'Сетевой фильтр Pilot Pro 5м (6 розеток)', category: 'Электрика', unit: 'шт.', quantity: 6, minThreshold: 4, location: 'Стеллаж А-4' },
  { id: '4', name: 'Болты и мебельные заглушки М6 (парты)', category: 'Мебель', unit: 'компл.', quantity: 45, minThreshold: 20, location: 'Ящик В-3' },
  { id: '5', name: 'Картридж HP LaserJet Q2612A / Pantum', category: 'Оргтехника', unit: 'шт.', quantity: 1, minThreshold: 3, location: 'Сейф АХЧ' },
  { id: '6', name: 'Кран-букса керамическая 1/2" (сантехника)', category: 'Сантехника', unit: 'шт.', quantity: 3, minThreshold: 4, location: 'Ящик С-1' },
  { id: '7', name: 'Дверной доводчик Dorma TS-68', category: 'Фурнитура', unit: 'шт.', quantity: 4, minThreshold: 2, location: 'Стеллаж Г-2' },
  { id: '8', name: 'Автоматический выключатель 16А (Legrand)', category: 'Электрика', unit: 'шт.', quantity: 8, minThreshold: 3, location: 'Щитовая' }
];

interface ZavkhozWorkspaceViewProps {
  user: User | null;
  theme: AuthThemeMode;
  activeTab?: string;
  initialTab?: string;
  onNavigateToTab?: (tab: any) => void;
}

const resolveZavkhozTab = (tab?: string): 'tickets' | 'map' | 'warehouse' | 'sheets' => {
  if (!tab) return 'tickets';
  if (tab === 'locator' || tab === 'map') return 'map';
  if (tab === 'warehouse') return 'warehouse';
  if (tab === 'docs' || tab === 'sheets') return 'sheets';
  return 'tickets';
};

export const ZavkhozWorkspaceView: React.FC<ZavkhozWorkspaceViewProps> = ({
  user: _user,
  theme,
  activeTab: propActiveTab,
  initialTab,
  onNavigateToTab
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const [activeTab, setActiveTab] = useState<'tickets' | 'map' | 'warehouse' | 'sheets'>(() => resolveZavkhozTab(propActiveTab || initialTab));

  React.useEffect(() => {
    const current = propActiveTab || initialTab;
    if (current) {
      setActiveTab(resolveZavkhozTab(current));
    }
  }, [propActiveTab, initialTab]);

  const handleTabClick = (tabId: 'tickets' | 'map' | 'warehouse' | 'sheets') => {
    setActiveTab(tabId);
    const parentTab = tabId === 'map' ? 'locator' : tabId === 'sheets' ? 'docs' : tabId;
    onNavigateToTab?.(parentTab);
  };
  const [tickets, setTickets] = useState<ZavkhozTicket[]>(INITIAL_ZAVKHOZ_TICKETS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'urgent' | 'new' | 'in_progress' | 'procurement' | 'resolved'>('all');
  const [selectedFloor, setSelectedFloor] = useState<1 | 2 | 3>(3);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>('311');
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);

  // Форма новой служебной заявки
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newRoom, setNewRoom] = useState('');
  const [newCategory, setNewCategory] = useState<ZavkhozTicket['category']>('Мебель / Парты');
  const [newDesc, setNewDesc] = useState('');
  const [newIsUrgent, setNewIsUrgent] = useState(false);

  // Стейт печатных документов А4
  const [sheetType, setSheetType] = useState<'defect' | 'audit' | 'journal'>('defect');

  const colors = {
    cardBg: isLight ? '#ffffff' : '#141a24',
    cardBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
    textPrimary: isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isLight ? '#475569' : '#94a3b8',
    textMuted: isLight ? '#94a3b8' : '#64748b',
    accentColor: isContrast ? '#0000ee' : '#f59e0b',
    slotBg: isLight ? '#f8fafc' : '#101622',
    slotBorder: isContrast ? '1px solid #000' : isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
    dangerRed: '#ef4444',
    warningYellow: '#f59e0b',
    successGreen: '#10b981',
    infoBlue: '#0077ff'
  };

  // Метрики завхоза
  const metrics = useMemo(() => {
    const total = tickets.length;
    const urgent = tickets.filter((t) => t.isUrgent && t.status !== 'resolved').length;
    const newCount = tickets.filter((t) => t.status === 'new').length;
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
    const procurement = tickets.filter((t) => t.status === 'procurement').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    const lowStock = inventory.filter((i) => i.quantity <= i.minThreshold).length;

    return { total, urgent, newCount, inProgress, procurement, resolved, lowStock };
  }, [tickets, inventory]);

  // Фильтрация тикетов
  const filteredTickets = useMemo(() => {
    let list = tickets;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase().trim();
      list = list.filter((t) =>
        t.room.toLowerCase().includes(q) ||
        t.teacher.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'urgent') list = list.filter((t) => t.isUrgent && t.status !== 'resolved');
    else if (statusFilter === 'new') list = list.filter((t) => t.status === 'new');
    else if (statusFilter === 'in_progress') list = list.filter((t) => t.status === 'in_progress');
    else if (statusFilter === 'procurement') list = list.filter((t) => t.status === 'procurement');
    else if (statusFilter === 'resolved') list = list.filter((t) => t.status === 'resolved');

    return list;
  }, [tickets, ticketSearch, statusFilter]);

  // Смена статуса тикета
  const updateTicketStatus = (ticketId: string, newStatus: ZavkhozTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
  };

  // Изменение количества на складе
  const updateStock = (itemId: string, delta: number) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
    );
  };

  // Копирование ответа учителю
  const copyReply = (ticketId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTicketId(ticketId);
    setTimeout(() => setCopiedTicketId(null), 2000);
  };

  // Создание новой заявки завхозом
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim() || !newDesc.trim()) return;

    const newTicket: ZavkhozTicket = {
      id: `Т-${100 + tickets.length + 1}`,
      room: newRoom.trim(),
      floor: parseInt(newRoom[0]) || 1,
      wing: parseInt(newRoom.slice(-2)) <= 10 ? 'Левое крыло' : 'Правое крыло',
      teacher: 'Сидоров В.П. (Служба АХЧ)',
      category: newCategory,
      description: newDesc.trim(),
      isUrgent: newIsUrgent,
      status: 'in_progress',
      createdAt: 'Только что'
    };

    setTickets([newTicket, ...tickets]);
    setNewRoom('');
    setNewDesc('');
    setNewIsUrgent(false);
    setShowNewTicketModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─── ВЕРХНЯЯ ШАПКА ЗАВХОЗА (APPLE WORKSPACE HEADER) ─── */}
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          padding: '18px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.04)' : '0 4px 24px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: isLight ? '#fef3c7' : 'rgba(245, 158, 11, 0.2)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Wrench size={22} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: colors.textPrimary }}>
                  Служба АХЧ • Рабочее место завхоза
                </h1>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 8,
                    background: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444'
                  }}
                >
                  {metrics.urgent} срочных
                </span>
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                Сидоров Виктор Павлович • Заместитель директора по административно-хозяйственной части
              </div>
            </div>
          </div>

          {/* Быстрые действия завхоза */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowNewTicketModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 12,
                border: 'none',
                background: '#f59e0b',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Plus size={15} />
              <span>Создать заявку</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleTabClick('sheets');
                window.print();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 12,
                border: colors.slotBorder,
                background: colors.slotBg,
                color: colors.textPrimary,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              <span>Печать дефектной ведомости</span>
            </button>
          </div>
        </div>

        {/* Информационная строка: только реальные цифры (БЕЗ ВОДЫ) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            paddingTop: 12,
            borderTop: colors.slotBorder,
            fontSize: 12,
            color: colors.textSecondary
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span>
              Всего заявок: <strong style={{ color: colors.textPrimary }}>{metrics.total}</strong>
            </span>
            <span style={{ color: colors.textMuted }}>•</span>
            <span style={{ color: '#0077ff', fontWeight: 600 }}>
              Новых: {metrics.newCount}
            </span>
            <span style={{ color: colors.textMuted }}>•</span>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>
              В работе: {metrics.inProgress}
            </span>
            <span style={{ color: colors.textMuted }}>•</span>
            <span style={{ color: '#8b5cf6', fontWeight: 600 }}>
              Требуется закупка: {metrics.procurement}
            </span>
            <span style={{ color: colors.textMuted }}>•</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>
              Выполнено: {metrics.resolved}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {metrics.lowStock > 0 ? (
              <span style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={13} />
                {metrics.lowStock} позиции на складе требуют дозаказа
              </span>
            ) : (
              <span style={{ color: '#10b981', fontWeight: 600 }}>
                Склад укомплектован
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── ПЕРЕКЛЮЧАТЕЛЬ РАЗДЕЛОВ ЗАВХОЗА (APPLE SEGMENTED BAR) ─── */}
      <div className="horizontal-scroll-pills" style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
        {[
          { id: 'tickets', label: `Журнал заявок (${metrics.newCount + metrics.inProgress})`, icon: Wrench },
          { id: 'map', label: 'Карта кабинетов (1–3 этажи)', icon: Building2 },
          { id: 'warehouse', label: `Склад АХЧ ${metrics.lowStock > 0 ? `(⚠️ ${metrics.lowStock})` : ''}`, icon: Package },
          { id: 'sheets', label: 'Акты и списание (А4)', icon: FileText }
        ].map((tab) => {
          const active = activeTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 12,
                border: active ? '1px solid #f59e0b' : colors.slotBorder,
                background: active ? colors.cardBg : 'transparent',
                color: active ? colors.textPrimary : colors.textMuted,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <IconComp size={15} color={active ? '#f59e0b' : colors.textMuted} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          РАЗДЕЛ 1: ДИСПЕТЧЕРСКАЯ ЗАЯВОК НА РЕМОНТ (ЖУРНАЛ ТИКЕТОВ)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Поиск и фильтры */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            {/* Поле поиска */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: colors.slotBg,
                border: colors.slotBorder,
                borderRadius: 10,
                padding: '8px 12px',
                flex: '1 1 260px',
                maxWidth: 400
              }}
            >
              <Search size={15} color={colors.textMuted} />
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Поиск по кабинету, учителю или проблеме..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: colors.textPrimary,
                  fontSize: 13,
                  width: '100%'
                }}
              />
              {ticketSearch && (
                <button
                  type="button"
                  onClick={() => setTicketSearch('')}
                  style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: 12 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Фильтры по статусам */}
            <div className="horizontal-scroll-pills" style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', paddingBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginRight: 4, flexShrink: 0 }}>
                <Filter size={11} style={{ display: 'inline', marginRight: 4 }} />
                Фильтр:
              </span>

              {[
                { id: 'all', label: `Все (${metrics.total})` },
                { id: 'urgent', label: `Срочные (${metrics.urgent})` },
                { id: 'new', label: `Новые (${metrics.newCount})` },
                { id: 'in_progress', label: `В работе (${metrics.inProgress})` },
                { id: 'procurement', label: `Закупка (${metrics.procurement})` },
                { id: 'resolved', label: `Выполненные (${metrics.resolved})` }
              ].map((btn) => {
                const active = statusFilter === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setStatusFilter(btn.id as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: active ? '1px solid #f59e0b' : colors.slotBorder,
                      background: active ? (isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.25)') : colors.slotBg,
                      color: active ? (isLight ? '#b45309' : '#f59e0b') : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      flexShrink: 0,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Список заявок */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: colors.textMuted, fontSize: 13, background: colors.cardBg, borderRadius: 16 }}>
                Заявок, удовлетворяющих фильтрам, не обнаружено
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isUrgent = t.isUrgent && t.status !== 'resolved';
                return (
                  <div
                    key={t.id}
                    style={{
                      background: colors.cardBg,
                      border: isUrgent ? '1.5px solid #ef4444' : `1px solid ${colors.cardBorder}`,
                      borderRadius: 16,
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      boxShadow: isUrgent
                        ? '0 4px 16px rgba(239, 68, 68, 0.15)'
                        : isLight
                        ? '0 2px 8px rgba(0,0,0,0.02)'
                        : '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    {/* Верхняя строка тикета */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'monospace', color: colors.textMuted }}>
                          {t.id}
                        </span>

                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: colors.textPrimary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <Building2 size={16} color="#f59e0b" />
                          <span>Кабинет {t.room}</span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: colors.textMuted }}>
                            ({t.floor} этаж • {t.wing})
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: colors.slotBg,
                            border: colors.slotBorder,
                            color: colors.textSecondary
                          }}
                        >
                          {t.category}
                        </span>

                        {isUrgent && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: '#ef4444',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <AlertTriangle size={12} />
                            СРОЧНО (УРОК ИДЕТ)
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: colors.textMuted }}>
                        Заявитель: <strong style={{ color: colors.textPrimary }}>{t.teacher}</strong> • {t.createdAt}
                      </div>
                    </div>

                    {/* Описание проблемы */}
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.45 }}>
                      {t.description}
                    </div>

                    {/* Подвал тикета: Кнопки смены статуса + быстрый ответ учителю */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        paddingTop: 10,
                        borderTop: colors.slotBorder
                      }}
                    >
                      {/* Кнопки переключения статуса */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, marginRight: 2 }}>Статус:</span>

                        {[
                          { id: 'new', label: 'Новая', color: '#0077ff' },
                          { id: 'in_progress', label: 'В работе', color: '#f59e0b' },
                          { id: 'procurement', label: 'Закупка', color: '#8b5cf6' },
                          { id: 'resolved', label: 'Выполнено ✓', color: '#10b981' }
                        ].map((st) => {
                          const isCurrent = t.status === st.id;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => updateTicketStatus(t.id, st.id as any)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 8,
                                border: isCurrent ? `1px solid ${st.color}` : colors.slotBorder,
                                background: isCurrent ? (isLight ? `${st.color}15` : `${st.color}25`) : colors.slotBg,
                                color: isCurrent ? st.color : colors.textMuted,
                                fontSize: 11,
                                fontWeight: isCurrent ? 800 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.12s ease'
                              }}
                            >
                              {st.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Быстрый ответ в Сферум учителю */}
                      {t.sferumReplySuggestion && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: colors.textMuted, fontStyle: 'italic', maxWidth: 'clamp(120px, 35vw, 320px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.sferumReplySuggestion}>
                            «{t.sferumReplySuggestion}»
                          </span>

                          <button
                            type="button"
                            onClick={() => copyReply(t.id, t.sferumReplySuggestion!)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '5px 10px',
                              borderRadius: 8,
                              border: 'none',
                              background: copiedTicketId === t.id ? '#10b981' : isLight ? '#0077ff' : '#0077ff',
                              color: '#ffffff',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            {copiedTicketId === t.id ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedTicketId === t.id ? 'Скопировано!' : 'Ответ в Сферум'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          РАЗДЕЛ 2: КАРТА И ТЕХНИЧЕСКИЙ АУДИТ КАБИНЕТОВ (1–3 ЭТАЖИ)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'map' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, alignItems: 'start' }}>
          {/* Левая часть: Поэтажная схема коридоров */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {/* Переключатель этажей */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: colors.slotBorder, paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                  Этаж:
                </span>
                {[1, 2, 3].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSelectedFloor(f as any)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      border: selectedFloor === f ? '1px solid #f59e0b' : colors.slotBorder,
                      background: selectedFloor === f ? '#f59e0b' : colors.slotBg,
                      color: selectedFloor === f ? '#ffffff' : colors.textPrimary,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {f} этаж
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#10b981' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  В норме
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#ef4444' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                  Открытая заявка
                </span>
              </div>
            </div>

            {/* Коридор этажа: Левое крыло (01–10) и Правое крыло (11–20) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Левое крыло */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Левое крыло ({selectedFloor}01 – {selectedFloor}10):
                </div>
                <div className="responsive-room-matrix" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                  {Array.from({ length: 10 }, (_, i) => {
                    const roomNum = `${selectedFloor}${i + 1 < 10 ? '0' : ''}${i + 1}`;
                    const roomTickets = tickets.filter((t) => t.room === roomNum && t.status !== 'resolved');
                    const hasIssue = roomTickets.length > 0;
                    const isUrgent = roomTickets.some((t) => t.isUrgent);
                    const isSelected = selectedRoomNumber === roomNum;

                    return (
                      <button
                        key={roomNum}
                        type="button"
                        onClick={() => setSelectedRoomNumber(roomNum)}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 12,
                          border: isSelected
                            ? '2px solid #0077ff'
                            : hasIssue
                            ? '1.5px solid #ef4444'
                            : colors.slotBorder,
                          background: hasIssue
                            ? isLight
                              ? 'rgba(239, 68, 68, 0.08)'
                              : 'rgba(239, 68, 68, 0.18)'
                            : isSelected
                            ? isLight
                              ? 'rgba(0, 119, 255, 0.08)'
                              : 'rgba(0, 119, 255, 0.2)'
                            : colors.slotBg,
                          color: colors.textPrimary,
                          cursor: 'pointer',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 800 }}>№ {roomNum}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: hasIssue ? '#ef4444' : '#10b981'
                          }}
                        >
                          {isUrgent ? '● Срочно' : hasIssue ? '● Заявка' : '● В норме'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Правое крыло */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Правое крыло ({selectedFloor}11 – {selectedFloor}20):
                </div>
                <div className="responsive-room-matrix" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                  {Array.from({ length: 10 }, (_, i) => {
                    const roomNum = `${selectedFloor}${i + 11}`;
                    const roomTickets = tickets.filter((t) => t.room === roomNum && t.status !== 'resolved');
                    const hasIssue = roomTickets.length > 0;
                    const isUrgent = roomTickets.some((t) => t.isUrgent);
                    const isSelected = selectedRoomNumber === roomNum;

                    return (
                      <button
                        key={roomNum}
                        type="button"
                        onClick={() => setSelectedRoomNumber(roomNum)}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 12,
                          border: isSelected
                            ? '2px solid #0077ff'
                            : hasIssue
                            ? '1.5px solid #ef4444'
                            : colors.slotBorder,
                          background: hasIssue
                            ? isLight
                              ? 'rgba(239, 68, 68, 0.08)'
                              : 'rgba(239, 68, 68, 0.18)'
                            : isSelected
                            ? isLight
                              ? 'rgba(0, 119, 255, 0.08)'
                              : 'rgba(0, 119, 255, 0.2)'
                            : colors.slotBg,
                          color: colors.textPrimary,
                          cursor: 'pointer',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 800 }}>№ {roomNum}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: hasIssue ? '#ef4444' : '#10b981'
                          }}
                        >
                          {isUrgent ? '● Срочно' : hasIssue ? '● Заявка' : '● В норме'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть: Досье выбранного кабинета */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {selectedRoomNumber ? (
              <>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: colors.textPrimary }}>
                    Кабинет {selectedRoomNumber}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {selectedRoomNumber[0]} этаж • {parseInt(selectedRoomNumber.slice(-2)) <= 10 ? 'Левое крыло' : 'Правое крыло'}
                  </div>
                  {selectedRoomNumber === '311' && (
                    <div style={{ fontSize: 12, color: '#0077ff', fontWeight: 600, marginTop: 4 }}>
                      Заведующий: Лосив Роман Борисович (9А)
                    </div>
                  )}
                </div>

                {/* Заявки по этому кабинету */}
                <div style={{ borderTop: colors.slotBorder, paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                    История и текущие заявки:
                  </div>

                  {tickets.filter((t) => t.room === selectedRoomNumber).length === 0 ? (
                    <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} />
                      Все системы и мебель в порядке
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {tickets
                        .filter((t) => t.room === selectedRoomNumber)
                        .map((tk) => (
                          <div
                            key={tk.id}
                            style={{
                              padding: 10,
                              borderRadius: 10,
                              background: colors.slotBg,
                              border: colors.slotBorder,
                              fontSize: 12
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <strong style={{ color: colors.textPrimary }}>{tk.category}</strong>
                              <span style={{ fontSize: 10, color: tk.status === 'resolved' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                                {tk.status === 'resolved' ? 'Выполнено' : 'В работе'}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 3 }}>
                              {tk.description}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Быстрое добавление заявки по этому кабинету */}
                <button
                  type="button"
                  onClick={() => {
                    setNewRoom(selectedRoomNumber);
                    setShowNewTicketModal(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 0',
                    borderRadius: 10,
                    border: 'none',
                    background: '#f59e0b',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Plus size={14} />
                  <span>Добавить поломку в каб. {selectedRoomNumber}</span>
                </button>
              </>
            ) : (
              <div style={{ color: colors.textMuted, fontSize: 12 }}>
                Выберите кабинет на плане для просмотра статуса
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          РАЗДЕЛ 3: СКЛАД АХЧ И РАСХОДНЫЕ МАТЕРИАЛЫ
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'warehouse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              overflow: 'hidden'
            }}
          >
            <div className="responsive-table-scroll" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 620 }}>
                {/* Шапка таблицы склада */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1.2fr',
                    gap: 12,
                    padding: '12px 18px',
                    background: colors.slotBg,
                    borderBottom: colors.slotBorder,
                    fontSize: 11,
                    fontWeight: 700,
                    color: colors.textMuted,
                    textTransform: 'uppercase'
                  }}
                >
                  <span>Наименование материала / запчасти</span>
                  <span>Категория</span>
                  <span>Остаток</span>
                  <span>Мин. порог</span>
                  <span>Место хранения</span>
                </div>

                {/* Строки склада */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {inventory.map((item, idx) => {
                    const isLow = item.quantity <= item.minThreshold;
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1.2fr',
                          gap: 12,
                          padding: '12px 18px',
                          alignItems: 'center',
                          borderBottom: idx < inventory.length - 1 ? colors.slotBorder : 'none',
                          background: isLow ? (isLight ? 'rgba(239, 68, 68, 0.04)' : 'rgba(239, 68, 68, 0.1)') : 'transparent'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
                            {item.name}
                          </div>
                          {isLow && (
                            <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 700, marginTop: 1 }}>
                              ⚠️ Требуется закупка у поставщика
                            </div>
                          )}
                        </div>

                        <span style={{ fontSize: 12, color: colors.textSecondary }}>{item.category}</span>

                        {/* Изменение остатка (+/-) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => updateStock(item.id, -1)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: colors.slotBorder,
                              background: colors.slotBg,
                              color: colors.textPrimary,
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            -
                          </button>
                          <strong style={{ fontSize: 13, color: isLow ? '#ef4444' : colors.textPrimary, minWidth: 32, textAlign: 'center' }}>
                            {item.quantity} {item.unit}
                          </strong>
                          <button
                            type="button"
                            onClick={() => updateStock(item.id, 1)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: colors.slotBorder,
                              background: colors.slotBg,
                              color: colors.textPrimary,
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            +
                          </button>
                        </div>

                        <span style={{ fontSize: 12, color: colors.textMuted }}>
                          {item.minThreshold} {item.unit}
                        </span>

                        <span style={{ fontSize: 12, color: colors.textSecondary, fontFamily: 'monospace' }}>
                          {item.location}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          РАЗДЕЛ 4: АКТЫ И ДЕФЕКТНЫЕ ВЕДОМОСТИ НА ПЕЧАТЬ (А4)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sheets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Селектор формы + Кнопка печати */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                Форма документа:
              </span>
              {[
                { id: 'defect', label: '1. Дефектная ведомость на замену оборудования' },
                { id: 'audit', label: '2. Акт технической готовности кабинетов' }
              ].map((sh) => (
                <button
                  key={sh.id}
                  type="button"
                  onClick={() => setSheetType(sh.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: sheetType === sh.id ? '1px solid #f59e0b' : colors.slotBorder,
                    background: sheetType === sh.id ? (isLight ? '#fef3c7' : 'rgba(245, 158, 11, 0.2)') : colors.slotBg,
                    color: sheetType === sh.id ? (isLight ? '#b45309' : '#f59e0b') : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {sh.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#f59e0b',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Printer size={15} />
              <span>Печать бланка (А4)</span>
            </button>
          </div>

          {/* Чистый печатный бланк А4 */}
          <div
            id="zavkhoz-printable-sheet"
            style={{
              background: '#ffffff',
              color: '#000000',
              padding: '36px 44px',
              borderRadius: 12,
              border: '1px solid #d1d5db',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              fontFamily: 'Times New Roman, serif',
              boxSizing: 'border-box',
              minHeight: 650
            }}
          >
            {/* Шапка МАОУ ЛИТ */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                МУНИЦИПАЛЬНОЕ АВТОНОМНОЕ ОБЩЕОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ Г. НОВОСИБИРСКА
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, marginTop: 2 }}>
                «ЛИЦЕЙ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ» (МАОУ ЛИТ)
              </div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>
                Служба административно-хозяйственной части (АХЧ)
              </div>
            </div>

            {sheetType === 'defect' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase' }}>
                    ДЕФЕКТНАЯ ВЕДОМОСТЬ НА РЕМОНТ И СПИСАНИЕ ОБОРУДОВАНИЯ
                  </div>
                  <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>
                    на «04» ноября 2026 г. • Составил: зам. директора по АХЧ Сидоров В.П.
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #000', padding: '6px 4px', width: 28 }}>№</th>
                      <th style={{ border: '1px solid #000', padding: '6px 6px', width: 60 }}>Кабинет</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Наименование дефекта / оборудования</th>
                      <th style={{ border: '1px solid #000', padding: '6px 6px', width: 60 }}>Кол-во</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Требуемые мероприятия</th>
                      <th style={{ border: '1px solid #000', padding: '6px 6px', width: 85 }}>Отметка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t, idx) => (
                      <tr key={t.id}>
                        <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center', fontWeight: 600 }}>Каб. {t.room}</td>
                        <td style={{ border: '1px solid #000', padding: '5px 8px' }}>{t.description}</td>
                        <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>1 шт.</td>
                        <td style={{ border: '1px solid #000', padding: '5px 8px' }}>
                          {t.category === 'Проектор / Доска' ? 'Замена лампы NP-M300X со склада' : t.category === 'Мебель / Парты' ? 'Протяжка болтов M6, замена втулки' : 'Техническое обслуживание'}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center', fontSize: 10 }}>
                          {t.status === 'resolved' ? 'Выполнено' : 'В работе'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sheetType === 'audit' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase' }}>
                    АКТ ПРОВЕРКИ ТЕХНИЧЕСКОЙ ГОТОВНОСТИ КАБИНЕТОВ К ЗАНЯТИЯМ
                  </div>
                  <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>
                    Корпус 1 (3 этажа, 60 аудиторий) • Ноябрь 2026 г.
                  </div>
                </div>

                <div style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
                  Комиссия в составе заместителя директора по АХЧ Сидорова В.П. произвела осмотр осветительных приборов, санитарно-технического состояния и мебели учебных аудиторий 101–120, 201–220, 301–320.
                  <br />
                  <strong>Заключение комиссии:</strong> Помещения готовы к образовательному процессу. Выявленные оперативные неисправности (каб. 311, 204) приняты к устранению до 13:00.
                </div>
              </div>
            )}

            {/* Подписи */}
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
              <div>
                Зам. директора по АХЧ: ______________ / Сидоров В.П. /
              </div>
              <div>
                Дата: 04 ноября 2026 г.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── МОДАЛКА СОЗДАНИЯ ЗАЯВКИ ─── */}
      {showNewTicketModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowNewTicketModal(false)}
        >
          <div
            style={{
              background: colors.cardBg,
              color: colors.textPrimary,
              borderRadius: 20,
              padding: 24,
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              border: `1px solid ${colors.cardBorder}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
              Создать служебную заявку
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, display: 'block', marginBottom: 4 }}>
                  Номер кабинета / Помещение:
                </label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="Например: 311 или 204"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: colors.slotBorder,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, display: 'block', marginBottom: 4 }}>
                  Категория дефекта:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: colors.slotBorder,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Проектор / Доска">Проектор / Доска</option>
                  <option value="Мебель / Парты">Мебель / Парты</option>
                  <option value="Электрика / Розетки">Электрика / Розетки</option>
                  <option value="Освещение / Лампы">Освещение / Лампы</option>
                  <option value="Сантехника">Сантехника</option>
                  <option value="Двери / Замки">Двери / Замки</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, display: 'block', marginBottom: 4 }}>
                  Описание проблемы:
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Что именно требуется устранить..."
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: colors.slotBorder,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 13,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={newIsUrgent}
                  onChange={(e) => setNewIsUrgent(e.target.checked)}
                />
                <label htmlFor="urgentCheck" style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, cursor: 'pointer' }}>
                  Срочная заявка (требуется устранить немедленно)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: colors.slotBorder,
                    background: colors.slotBg,
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#f59e0b',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Зарегистрировать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Shuffle,
  BarChart3,
  Users,
  FileText,
  Printer,
  Check,
  Search,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  CalendarRange,
  X,
  ShieldAlert,
  Megaphone
} from 'lucide-react';
import type { User, AuthThemeMode } from '../../types/auth';
import { SchoolNewsFeedView } from './SchoolNewsFeedView';

interface ZavuchWorkspaceViewProps {
  user: User | null;
  theme?: AuthThemeMode;
  activeTab?: string;
  initialTab?: 'schedule_changes' | 'news' | 'summary' | 'replacements' | 'monitoring' | 'workload' | 'orders' | string;
  onNavigateToTab?: (tab: string) => void;
}

interface ReplacementRecord {
  id: string;
  lessonNum: number;
  time: string;
  targetClass: string;
  originalSubject: string;
  absentTeacher: string;
  absentReason: string;
  replacingSubject: string;
  replacingTeacher: string;
  classroom: string;
  status: 'assigned' | 'notified' | 'completed';
}

interface TeacherWorkloadRecord {
  id: string;
  name: string;
  subject: string;
  category: 'Высшая' | 'Первая' | 'Соответствие';
  hoursPerWeek: number;
  classLeadership: string | null;
  attestationYear: string;
  openLessonDate: string;
  status: 'active' | 'courses' | 'sick';
}

// ─────────────────────────────────────────────────────────────────────────────
// СТРУКТУРА ДАННЫХ ДЛЯ «ИЗМЕНЕНИЯ В РАСПИСАНИИ» (ТОЧНО ПО ФОТО ПОЛЬЗОВАТЕЛЯ)
// ─────────────────────────────────────────────────────────────────────────────

interface ScheduleCell {
  text: string;
  rooms: string[];
}

type ScheduleGrid = Record<string, Record<number, ScheduleCell>>;

const PERIODS = [
  { num: 1, time: '08.00' },
  { num: 2, time: '08.50' },
  { num: 3, time: '09.40' },
  { num: 4, time: '10.40' },
  { num: 5, time: '11.35' },
  { num: 6, time: '12.25' },
  { num: 7, time: '13.15' },
  { num: 8, time: '14.00' }
];

const CLASS_BLOCKS = [
  { id: 'b1', classes: ['5А', '5Б', '5В', '5Г', '6А'] },
  { id: 'b2', classes: ['6Б', '6В', '6Г', '7А', '7Б'] },
  { id: 'b3', classes: ['7В', '7И', '7Л', '8А', '8Б'] },
  { id: 'b4', classes: ['8И', '8Л', '9А', '9Б', '9Г'] },
  { id: 'b5', classes: ['9И', '10А', '10Б', '10В', '10И'] },
  { id: 'b6', classes: ['11А', '11И'] }
];

const SCHOOL_ROOMS = [
  '104', '105', '106', '107', '108', '109', '111', '112', '113', '114', '115', '116',
  '121', '127', '204', '205', '206', '207', '208', '211', '212', '213', '214', '215',
  '216', '218', '303', '304', '305', '306', '308', '309', '310', '311', '312', '313', '315'
];

function cell(text: string, rooms: string[]): ScheduleCell {
  return { text, rooms };
}

// Начальная матрица данных с фото пользователя
const INITIAL_SCHEDULE_GRID: ScheduleGrid = {
  // Блок 1
  '5А': {
    1: cell('Разговор о... 213', ['213']),
    2: cell('математика 213', ['213']),
    3: cell('русский язык 113', ['113']),
    4: cell('библ.урок 208', ['208']),
    5: cell('инф 108/инф 127', ['108', '127']),
    6: cell('история 116', ['116'])
  },
  '5Б': {
    1: cell('Разговор о... 115', ['115']),
    2: cell('математика 211', ['211']),
    3: cell('история 116', ['116']),
    4: cell('ТВМ 211', ['211']),
    5: cell('русский язык 115', ['115']),
    6: cell('инф 108/инф 127', ['108', '127'])
  },
  '5В': {
    1: cell('Разговор о... 208', ['208']),
    2: cell('математика 205', ['205']),
    3: cell('ТВМ 205', ['205']),
    4: cell('ИЗО 121', ['121']),
    5: cell('русский язык 311', ['311']),
    6: cell('русский язык 311', ['311'])
  },
  '5Г': {
    2: cell('Разговор о... 313', ['313']),
    3: cell('ИЗО 121', ['121']),
    4: cell('история 111', ['111']),
    5: cell('музыка 207', ['207']),
    6: cell('русский язык 115', ['115'])
  },
  '6А': {
    1: cell('Разговор о... 121', ['121']),
    2: cell('труд (ВСЕ) 121', ['121']),
    3: cell('литература 115', ['115']),
    4: cell('литература 115', ['115']),
    5: cell('труд (ВСЕ) 121', ['121'])
  },

  // Блок 2
  '6Б': {
    2: cell('Разговор о... 310', ['310']),
    3: cell('англ 315/труд 105', ['315', '105']),
    4: cell('англ 315/труд 105', ['315', '105']),
    5: cell('математика 212', ['212']),
    6: cell('история 312', ['312']),
    7: cell('математика 212', ['212'])
  },
  '6В': {
    1: cell('Разговор о... 114', ['114']),
    2: cell('математика 214', ['214']),
    3: cell('инф(ВСЕ) 104', ['104']),
    4: cell('инф(ВСЕ) 104', ['104']),
    5: cell('русский язык 114', ['114'])
  },
  '6Г': {
    1: cell('Разговор о... 315', ['315']),
    2: cell('физкультура', []),
    3: cell('библ.урок 208', ['208']),
    4: cell('история 312', ['312'])
  },
  '7А': {
    2: cell('история 116', ['116']),
    3: cell('физкультура', []),
    4: cell('русский язык 113', ['113']),
    5: cell('Разговор о... 216', ['216']),
    6: cell('физика 306', ['306']),
    7: cell('география 111', ['111'])
  },
  '7Б': {
    2: cell('Разговор о... 206', ['206']),
    3: cell('физика 306', ['306']),
    4: cell('урок безопас 207', ['207']),
    5: cell('география 111', ['111'])
  },

  // Блок 3
  '7В': {
    2: cell('Разговор о... 309', ['309']),
    3: cell('музыка 311', ['311']),
    4: cell('прогр(ВСЕ) 107', ['107']),
    5: cell('физика 306', ['306']),
    6: cell('география 111', ['111'])
  },
  '7И': {
    1: cell('Разговор о... 212', ['212']),
    2: cell('русский язык 115', ['115']),
    3: cell('геометрия 212', ['212']),
    4: cell('музыка 311', ['311']),
    5: cell('история 116', ['116']),
    6: cell('геометрия 212', ['212'])
  },
  '7Л': {
    1: cell('Разговор о... 306', ['306']),
    2: cell('физкультура', []),
    3: cell('география 111', ['111']),
    4: cell('физика 306', ['306']),
    5: cell('труд105/анг 315', ['105', '315']),
    6: cell('англ 315/труд 105', ['315', '105'])
  },
  '8А': {
    1: cell('Разговор о... 111', ['111']),
    2: cell('история 112', ['112']),
    3: cell('алгебра 211', ['211']),
    4: cell('физкультура', []),
    5: cell('инф(ВСЕ) 104', ['104']),
    6: cell('инф(ВСЕ) 104', ['104']),
    7: cell('русский язык 115', ['115'])
  },
  '8Б': {
    1: cell('Разговор о... 207', ['207']),
    2: cell('инф(ВСЕ) 104', ['104']),
    3: cell('химия 304', ['304']),
    4: cell('алгебра 205', ['205']),
    5: cell('пр.матем 205', ['205']),
    6: cell('музыка 207', ['207']),
    7: cell('геометрия 205', ['205'])
  },

  // Блок 4
  '8И': {
    1: cell('Разговор о... 214', ['214']),
    2: cell('пр физика 306', ['306']),
    3: cell('ОБЗР 207', ['207']),
    4: cell('химия 304', ['304']),
    5: cell('физкультура', [])
  },
  '8Л': {
    1: cell('Разговор о... 205', ['205']),
    2: cell('химия 304', ['304']),
    3: cell('труд(ВСЕ) 112', ['112']),
    4: cell('труд(ВСЕ) 112', ['112']),
    5: cell('алгебра 208', ['208']),
    6: cell('алгебра 205', ['205']),
    7: cell('пр. физика 308', ['308']),
    8: cell('Код будущ', [])
  },
  '9А': {
    1: cell('Разговор о... 112', ['112']),
    2: cell('физика 308', ['308']),
    3: cell('алгебра 214', ['214']),
    4: cell('инф(ВСЕ) 127', ['127']),
    5: cell('литература 113', ['113']),
    6: cell('обществозн 112', ['112'])
  },
  '9Б': {
    1: cell('Разговор о... 105', ['105']),
    2: cell('труд(ВСЕ) 105', ['105']),
    3: cell('биология 305', ['305']),
    4: cell('пр. матем 214', ['214']),
    5: cell('химия 304', ['304']),
    6: cell('пр. матем 214', ['214']),
    7: cell('/анг 303', ['303'])
  },
  '9Г': {
    1: cell('Разговор о... 305', ['305']),
    2: cell('литература 114', ['114']),
    3: cell('геометрия 213', ['213']),
    4: cell('русский язык 114', ['114']),
    5: cell('алгебра 213', ['213']),
    6: cell('химия 304', ['304']),
    7: cell('история 112', ['112'])
  },

  // Блок 5
  '9И': {
    1: cell('Разговор о... 308', ['308']),
    2: cell('инф(ВСЕ) 127', ['127']),
    3: cell('англ(ВСЕ) 303', ['303']),
    4: cell('физкультура', []),
    5: cell('геометрия 206', ['206']),
    6: cell('Матем СК 213', ['213'])
  },
  '10А': {
    1: cell('Разговор о... 204', ['204']),
    2: cell('пр.русск.язык 113', ['113']),
    3: cell('физкульт. ЛА', []),
    4: cell('алгебра 212', ['212']),
    5: cell('инф106/англ 204', ['106', '204']),
    6: cell('англ 204/инф 109', ['204', '109'])
  },
  '10Б': {
    1: cell('Разговор о... 312', ['312']),
    2: cell('география 111', ['111']),
    3: cell('англ204/инф 107', ['204', '107']),
    4: cell('инф109/англ 204', ['109', '204']),
    5: cell('геометрия 211', ['211']),
    6: cell('русский пр 114', ['114']),
    7: cell('ИП 312/ИП 109', ['312', '109'])
  },
  '10В': {
    1: cell('Разговор о... 211', ['211']),
    2: cell('инф 107/инф 106', ['107', '106']),
    3: cell('русский язык 114', ['114']),
    4: cell('обществозн 116', ['116']),
    5: cell('инф109/инф 107', ['109', '107']),
    6: cell('геометрия 211', ['211']),
    7: cell('геометрия 211', ['211'])
  },
  '10И': {
    1: cell('Разговор о... 304', ['304']),
    2: cell('алгебра 212', ['212']),
    3: cell('инф109/инф 106', ['109', '106']),
    4: cell('прогр(ВСЕ) 106', ['106']),
    5: cell('обществозн 112', ['112']),
    6: cell('прогр(ВСЕ) 106', ['106']),
    7: cell('литература 114', ['114'])
  },

  // Блок 6
  '11А': {
    1: cell('Разговор о... 107', ['107']),
    2: cell('инф(ВСЕ) 109', ['109']),
    3: cell('физика 308', ['308']),
    4: cell('физика 308', ['308']),
    5: cell('история 312', ['312']),
    6: cell('литература 113', ['113'])
  },
  '11И': {
    2: cell('Разговор о... 204', ['204']),
    3: cell('история 312', ['312']),
    4: cell('ОБЗР 207', ['207']),
    5: cell('физика 308', ['308']),
    6: cell('физика 308', ['308'])
  }
};

const INITIAL_REPLACEMENTS: ReplacementRecord[] = [
  {
    id: 'rep-1',
    lessonNum: 2,
    time: '08:50 – 09:35',
    targetClass: '9Б',
    originalSubject: 'История России',
    absentTeacher: 'Ковалев С.М.',
    absentReason: 'Курсы НИПКиПРО',
    replacingSubject: 'Русский язык (Практикум ОГЭ)',
    replacingTeacher: 'Васильева Е.Н.',
    classroom: '108',
    status: 'assigned'
  },
  {
    id: 'rep-2',
    lessonNum: 4,
    time: '10:40 – 11:25',
    targetClass: '10Б',
    originalSubject: 'Обществознание',
    absentTeacher: 'Ковалев С.М.',
    absentReason: 'Курсы НИПКиПРО',
    replacingSubject: 'Информатика (Проектный трек)',
    replacingTeacher: 'Лосив Р.Б.',
    classroom: '311',
    status: 'notified'
  },
  {
    id: 'rep-3',
    lessonNum: 5,
    time: '11:35 – 12:20',
    targetClass: '11А',
    originalSubject: 'Английский язык (Подгруппа 2)',
    absentTeacher: 'Миронова О.И.',
    absentReason: 'Больничный лист',
    replacingSubject: 'Химия (Подготовка к ЕГЭ)',
    replacingTeacher: 'Попова Т.А.',
    classroom: '218',
    status: 'assigned'
  }
];

const TEACHERS_LIST: TeacherWorkloadRecord[] = [
  {
    id: 't-1',
    name: 'Лосив Роман Борисович',
    subject: 'Математика, Информатика и ИКТ',
    category: 'Высшая',
    hoursPerWeek: 26,
    classLeadership: '9А класс (28 уч.)',
    attestationYear: '2024 г. (действ. до 2029)',
    openLessonDate: '18 марта 2026',
    status: 'active'
  },
  {
    id: 't-2',
    name: 'Васильева Елена Николаевна',
    subject: 'Русский язык и Литература',
    category: 'Высшая',
    hoursPerWeek: 24,
    classLeadership: '11А класс (24 уч.)',
    attestationYear: '2023 г. (действ. до 2028)',
    openLessonDate: '12 февраля 2026',
    status: 'active'
  },
  {
    id: 't-3',
    name: 'Смирнов Виктор Андреевич',
    subject: 'Физика и Астрономия',
    category: 'Первая',
    hoursPerWeek: 22,
    classLeadership: '9Б класс (26 уч.)',
    attestationYear: '2025 г. (действ. до 2030)',
    openLessonDate: '07 апреля 2026',
    status: 'active'
  },
  {
    id: 't-4',
    name: 'Попова Татьяна Анатольевна',
    subject: 'Химия',
    category: 'Высшая',
    hoursPerWeek: 20,
    classLeadership: null,
    attestationYear: '2022 г. (действ. до 2027)',
    openLessonDate: '24 ноября 2025',
    status: 'active'
  },
  {
    id: 't-5',
    name: 'Ковалев Сергей Михайлович',
    subject: 'История и Обществознание',
    category: 'Высшая',
    hoursPerWeek: 25,
    classLeadership: '10Б класс (26 уч.)',
    attestationYear: '2024 г. (действ. до 2029)',
    openLessonDate: '15 мая 2026',
    status: 'courses'
  },
  {
    id: 't-6',
    name: 'Миронова Ольга Игоревна',
    subject: 'Английский язык',
    category: 'Первая',
    hoursPerWeek: 22,
    classLeadership: null,
    attestationYear: '2023 г. (действ. до 2028)',
    openLessonDate: '20 февраля 2026',
    status: 'sick'
  }
];

export const ZavuchWorkspaceView: React.FC<ZavuchWorkspaceViewProps> = ({
  user,
  theme = 'light',
  activeTab: propActiveTab,
  initialTab = 'schedule_changes',
  onNavigateToTab
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const [activeTab, setActiveTab] = useState<'schedule_changes' | 'news' | 'summary' | 'replacements' | 'monitoring' | 'workload' | 'orders'>((propActiveTab as any) || initialTab);
  const [replacements, setReplacements] = useState<ReplacementRecord[]>(INITIAL_REPLACEMENTS);
  const [scheduleGrid, setScheduleGrid] = useState<ScheduleGrid>(INITIAL_SCHEDULE_GRID);
  const [scheduleDate, setScheduleDate] = useState('05.11.26');
  const [scheduleDayLabel, setScheduleDayLabel] = useState('четверг');
  const [showOrderPrintModal, setShowOrderPrintModal] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<'replacements' | 'olympiad' | 'gia'>('replacements');
  const [searchTeacher, setSearchTeacher] = useState('');

  // Состояние редактора отдельной ячейки
  const [editingCell, setEditingCell] = useState<{ classId: string; periodNum: number; text: string; roomInput: string } | null>(null);

  React.useEffect(() => {
    const current = (propActiveTab || initialTab) as any;
    if (current && ['schedule_changes', 'news', 'summary', 'replacements', 'monitoring', 'workload', 'orders'].includes(current)) {
      setActiveTab(current);
    }
  }, [propActiveTab, initialTab]);

  const colors = {
    cardBg: isContrast ? '#ffffff' : isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
    cardBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? 'rgba(0, 0, 0, 0.07)' : 'rgba(255, 255, 255, 0.08)',
    textPrimary: isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isLight ? '#334155' : '#cbd5e1',
    textMuted: isLight ? '#64748b' : '#94a3b8',
    accentColor: '#8b5cf6',
    accentSoft: isLight ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.18)',
    slotBg: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
    emerald: '#10b981',
    emeraldSoft: isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.18)',
    amber: '#f59e0b',
    amberSoft: isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.18)',
    rose: '#f43f5e',
    roseSoft: isLight ? 'rgba(244, 63, 94, 0.08)' : 'rgba(244, 63, 94, 0.18)'
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ДЕТЕКТОР КОЛЛИЗИЙ / НАКЛАДОК КАБИНЕТОВ (LIVE CONFLICT RADAR)
  // ─────────────────────────────────────────────────────────────────────────────
  interface RoomConflict {
    periodNum: number;
    room: string;
    classes: { classId: string; text: string }[];
  }

  const roomConflicts = useMemo(() => {
    const list: RoomConflict[] = [];

    PERIODS.forEach((period) => {
      const roomMap: Record<string, { classId: string; text: string }[]> = {};

      Object.entries(scheduleGrid).forEach(([classId, periodsData]) => {
        const item = periodsData[period.num];
        if (!item || !item.rooms) return;

        item.rooms.forEach((r) => {
          if (!r.trim()) return;
          const cleanRoom = r.trim();
          if (!roomMap[cleanRoom]) {
            roomMap[cleanRoom] = [];
          }
          roomMap[cleanRoom].push({ classId, text: item.text });
        });
      });

      Object.entries(roomMap).forEach(([room, classList]) => {
        if (classList.length > 1) {
          list.push({
            periodNum: period.num,
            room,
            classes: classList
          });
        }
      });
    });

    return list;
  }, [scheduleGrid]);

  // Функция расчета свободных кабинетов на заданный урок
  const getFreeRoomsForPeriod = (periodNum: number) => {
    const occupied = new Set<string>();
    Object.values(scheduleGrid).forEach((periodsData) => {
      const it = periodsData[periodNum];
      if (it?.rooms) {
        it.rooms.forEach((r) => occupied.add(r.trim()));
      }
    });
    return SCHOOL_ROOMS.filter((r) => !occupied.has(r));
  };

  // Моделирование накладки каб. 211 на 3-м уроке для проверки
  const simulateConflict211 = () => {
    setScheduleGrid((prev) => ({
      ...prev,
      '9А': {
        ...prev['9А'],
        3: cell('алгебра 211', ['211'])
      },
      '10В': {
        ...prev['10В'],
        3: cell('геометрия 211', ['211'])
      }
    }));
  };

  // Автоматическое устранение накладки (перенос 10В в свободный 312)
  const resolveConflict211 = () => {
    setScheduleGrid((prev) => ({
      ...prev,
      '10В': {
        ...prev['10В'],
        3: cell('геометрия 312', ['312'])
      }
    }));
  };

  const markReplacementNotified = (id: string) => {
    setReplacements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'notified' } : r))
    );
  };

  const filteredTeachers = TEACHERS_LIST.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTeacher.toLowerCase())
  );

  // Сохранение изменений в ячейке
  const saveCellEdit = () => {
    if (!editingCell) return;
    const { classId, periodNum, text, roomInput } = editingCell;
    const rooms = roomInput
      .split(/[/,\s]+/)
      .map((r) => r.trim())
      .filter((r) => /^\d{3}$/.test(r));

    setScheduleGrid((prev) => ({
      ...prev,
      [classId]: {
        ...(prev[classId] || {}),
        [periodNum]: cell(text || `${roomInput}`, rooms)
      }
    }));
    setEditingCell(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. ШАПКА ЗАВУЧА (БЕЗ ДЕКОРАТИВНЫХ БЕЙДЖЕЙ, ТОЛЬКО СУТЬ)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          padding: 'clamp(20px, 2vw + 12px, 28px)',
          boxShadow: isLight
            ? '0 10px 30px -8px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.04)'
            : '0 16px 40px -12px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Левый блок: Аватар, ФИО, должность */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)',
                flexShrink: 0
              }}
            >
              Г
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 'clamp(20px, 1.4vw + 14px, 26px)',
                    fontWeight: 800,
                    letterSpacing: -0.5,
                    color: colors.textPrimary
                  }}
                >
                  {user?.fullName || 'Громова Александра Сергеевна'}
                </h1>
              </div>

              <div
                style={{
                  fontSize: 'clamp(13px, 0.35vw + 11px, 14px)',
                  color: colors.textMuted,
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                <span><strong>Зам. директора по УВР</strong> (Старшая школа и ГИА)</span>
                <span>•</span>
                <span>МАОУ «Лицей Информационных Технологий»</span>
                <span>•</span>
                <span>Кабинет <strong>201 (Учительская / Приемная)</strong></span>
              </div>
            </div>
          </div>

          {/* Правый блок: Быстрые действия завуча */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('schedule_changes')}
              style={{
                padding: '9px 16px',
                borderRadius: 10,
                background: colors.accentSoft,
                border: '1px solid rgba(139, 92, 246, 0.25)',
                color: colors.accentColor,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease'
              }}
            >
              <CalendarRange size={15} />
              <span>Изменения в расписании</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedOrderType('replacements');
                setShowOrderPrintModal(true);
              }}
              style={{
                padding: '9px 16px',
                borderRadius: 10,
                background: colors.slotBg,
                border: `1px solid ${colors.cardBorder}`,
                color: colors.textSecondary,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7
              }}
            >
              <Printer size={15} />
              <span>Приказ (А4)</span>
            </button>
          </div>
        </div>

        {/* ── 4 ключевые системные метрики завуча ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
            paddingTop: 16,
            borderTop: `1px solid ${colors.cardBorder}`
          }}
        >
          {/* Метрика 1: Накладки по кабинетам */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: roomConflicts.length > 0 ? colors.roseSoft : colors.slotBg,
              border: `1.5px solid ${roomConflicts.length > 0 ? '#f43f5e' : colors.cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Накладки кабинетов</span>
              {roomConflicts.length > 0 ? (
                <ShieldAlert size={15} color="#f43f5e" />
              ) : (
                <Check size={15} color="#10b981" />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: roomConflicts.length > 0 ? '#f43f5e' : '#10b981',
                  letterSpacing: -0.5
                }}
              >
                {roomConflicts.length}
              </span>
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                {roomConflicts.length > 0 ? 'Требуется перенос!' : 'Накладок нет ✓'}
              </span>
            </div>
          </div>

          {/* Метрика 2: Посещаемость лицея */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: colors.slotBg,
              border: `1px solid ${colors.cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Посещаемость лицея (СКУД)</span>
              <UserCheck size={14} color="#10b981" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: '#10b981', letterSpacing: -0.5 }}>93.9%</span>
              <span style={{ fontSize: 12, color: colors.textMuted }}>791 из 842 уч.</span>
            </div>
          </div>

          {/* Метрика 3: Замены уроков сегодня */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: colors.slotBg,
              border: `1px solid ${colors.cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Замены уроков сегодня</span>
              <Shuffle size={14} color={colors.accentColor} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: colors.accentColor, letterSpacing: -0.5 }}>{replacements.length}</span>
              <span style={{ fontSize: 12, color: colors.textMuted }}>Все назначены ✓</span>
            </div>
          </div>

          {/* Метрика 4: Качество знаний */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: colors.slotBg,
              border: `1px solid ${colors.cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Качество знаний (КОУ)</span>
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={13} /> +2.1%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>70.8%</span>
              <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600 }}>9–11 классы</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. НАВИГАЦИОННЫЙ СЕГМЕНТИРОВАННЫЙ БАР
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="horizontal-scroll-pills"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
          padding: 5,
          borderRadius: 14,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          border: `1px solid ${colors.cardBorder}`
        }}
      >
        {[
          {
            id: 'schedule_changes',
            label: 'Изменения в расписании',
            icon: CalendarRange,
            badge: roomConflicts.length > 0 ? `⚠️ ${roomConflicts.length} накладка!` : '05.11.26',
            badgeColor: roomConflicts.length > 0 ? '#f43f5e' : undefined
          },
          { id: 'news', label: 'Лента новостей', icon: Megaphone },
          { id: 'summary', label: 'Сводка и мониторинг', icon: LayoutDashboard },
          { id: 'replacements', label: 'Диспетчерская замен', icon: Shuffle, badge: `${replacements.length}` },
          { id: 'monitoring', label: 'Качество знаний (ОГЭ / ЕГЭ)', icon: BarChart3 },
          { id: 'workload', label: 'Нагрузка учителей', icon: Users },
          { id: 'orders', label: 'Приказы по школе (А4)', icon: FileText }
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                onNavigateToTab?.(tab.id);
              }}
              style={{
                flexShrink: 0,
                minWidth: 'max-content',
                padding: '9px 16px',
                borderRadius: 10,
                border: 'none',
                background: active ? (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.14)') : 'transparent',
                color: active ? colors.textPrimary : colors.textMuted,
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: active ? (isLight ? '0 2px 8px rgba(0, 0, 0, 0.06)' : '0 2px 8px rgba(0, 0, 0, 0.3)') : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={active ? colors.accentColor : 'currentColor'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 800,
                    background: tab.badgeColor || (active ? colors.accentColor : isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'),
                    color: '#ffffff'
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. ВКЛАДКА 0: ИЗМЕНЕНИЯ В РАСПИСАНИИ (ТОЧНАЯ СЕТКА И АНТИ-НАКЛАДКА КАБИНЕТОВ)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'schedule_changes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Панель управления датой и действиями */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Изменения в расписании на</span>
                <input
                  type="text"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{
                    width: 90,
                    fontWeight: 800,
                    fontSize: 16,
                    padding: '3px 8px',
                    borderRadius: 8,
                    border: `1.5px solid ${colors.accentColor}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    textAlign: 'center'
                  }}
                />
                <input
                  type="text"
                  value={scheduleDayLabel}
                  onChange={(e) => setScheduleDayLabel(e.target.value)}
                  style={{
                    width: 90,
                    fontWeight: 600,
                    fontSize: 14,
                    padding: '3px 8px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textSecondary,
                    textAlign: 'center'
                  }}
                  title="День недели"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Кнопка моделирования накладки */}
              <button
                type="button"
                onClick={simulateConflict211}
                title="Смоделировать ошибку: поставить каб. 211 одновременно 9А и 10В на 3-й урок"
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  background: colors.roseSoft,
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#f43f5e',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <AlertTriangle size={14} />
                <span>Тест: накладка каб. 211</span>
              </button>

              {/* Кнопка сброса */}
              <button
                type="button"
                onClick={() => setScheduleGrid(INITIAL_SCHEDULE_GRID)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  background: colors.slotBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Сбросить
              </button>

              {/* Кнопка печати А4 точно по формату */}
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <Printer size={15} />
                <span>Печать А4 (как на фото)</span>
              </button>
            </div>
          </div>

          {/* БАННЕР КОЛЛИЗИЙ И НАКЛАДОК КАБИНЕТОВ */}
          {roomConflicts.length > 0 && (
            <div
              style={{
                background: isLight ? '#fff1f2' : 'rgba(244, 63, 94, 0.15)',
                border: '1.5px solid #f43f5e',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldAlert size={22} color="#f43f5e" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#e11d48' }}>
                      ВНИМАНИЕ! Обнаружена накладка кабинетов ({roomConflicts.length})
                    </div>
                    <div style={{ fontSize: 13, color: colors.textPrimary, marginTop: 2 }}>
                      Один и тот же кабинет назначен нескольким классам на один и тот же урок!
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resolveConflict211}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Check size={14} />
                  <span>Устранить: перенести 10В в свободный каб. 312</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 6, borderTop: '1px solid rgba(244, 63, 94, 0.2)' }}>
                {roomConflicts.map((c, i) => {
                  const freeRooms = getFreeRoomsForPeriod(c.periodNum).slice(0, 5);
                  return (
                    <div key={i} style={{ fontSize: 13, color: colors.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <strong style={{ color: '#e11d48' }}>Кабинет {c.room}</strong> на <strong>{c.periodNum}-м уроке ({PERIODS.find(p => p.num === c.periodNum)?.time})</strong> занят одновременно:
                        {c.classes.map((cls, ci) => (
                          <span key={ci} style={{ marginLeft: 8, fontWeight: 700, background: 'rgba(244, 63, 94, 0.15)', padding: '2px 8px', borderRadius: 4 }}>
                            {cls.classId}: {cls.text}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: 11, color: colors.textMuted }}>
                        Свободны на этот урок: <strong>{freeRooms.join(', ')}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ТАБЛИЦА БЛОКОВ РАСПИСАНИЯ (ТОЧНО КАК В ПЕЧАТНОМ ДОКУМЕНТЕ С ФОТО) ── */}
          <div
            id="schedule-print-sheet"
            style={{
              background: '#ffffff',
              color: '#000000',
              border: '2px solid #000000',
              padding: 18,
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              fontFamily: '"Arial Narrow", Arial, sans-serif'
            }}
          >
            {/* Заголовок печатного листа */}
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20, letterSpacing: 0.5, borderBottom: '2px solid #000000', paddingBottom: 6 }}>
              Изменения в расписании на {scheduleDate}
            </div>

            {/* Сетка блоков (5А-6А, 6Б-7Б, 7В-8Б, 8И-9Г, 9И-10И, 11А-11И) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CLASS_BLOCKS.map((block) => (
                <table
                  key={block.id}
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 11,
                    textAlign: 'center'
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ width: 24, border: '1px solid #000', background: '#f1f5f9' }} />
                      <th style={{ width: 24, border: '1px solid #000', background: '#f1f5f9' }}>№</th>
                      <th style={{ width: 44, border: '1px solid #000', background: '#f1f5f9' }}>Время</th>
                      {block.classes.map((cls) => (
                        <th
                          key={cls}
                          style={{
                            border: '1px solid #000',
                            padding: '4px 6px',
                            fontWeight: 'bold',
                            fontSize: 13,
                            background: '#f8fafc',
                            width: `${100 / block.classes.length}%`
                          }}
                        >
                          {cls}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((p, pIdx) => (
                      <tr key={p.num}>
                        {/* Вертикальная плашка дня недели в первой строке блока */}
                        {pIdx === 0 && (
                          <td
                            rowSpan={PERIODS.length}
                            style={{
                              border: '1px solid #000',
                              writingMode: 'vertical-rl',
                              transform: 'rotate(180deg)',
                              fontWeight: 'bold',
                              letterSpacing: 2,
                              fontSize: 11,
                              padding: '4px 2px',
                              background: '#f8fafc'
                            }}
                          >
                            {scheduleDayLabel}
                          </td>
                        )}

                        <td style={{ border: '1px solid #000', fontWeight: 'bold', padding: '3px 0' }}>
                          {p.num}
                        </td>
                        <td style={{ border: '1px solid #000', fontSize: 10, padding: '3px 0' }}>
                          {p.time}
                        </td>

                        {block.classes.map((cls) => {
                          const cellData = scheduleGrid[cls]?.[p.num];
                          const hasText = Boolean(cellData?.text);

                          // Проверка накладки именно в этой ячейке
                          const isConflicted = cellData?.rooms?.some((r) =>
                            roomConflicts.some((c) => c.periodNum === p.num && c.room === r.trim())
                          );

                          return (
                            <td
                              key={cls}
                              onClick={() => {
                                setEditingCell({
                                  classId: cls,
                                  periodNum: p.num,
                                  text: cellData?.text || '',
                                  roomInput: cellData?.rooms?.join(' ') || ''
                                });
                              }}
                              title="Нажмите для редактирования урока или кабинета"
                              style={{
                                border: '1px solid #000',
                                padding: '3px 4px',
                                fontSize: 11,
                                height: 22,
                                cursor: 'pointer',
                                background: isConflicted
                                  ? '#fee2e2'
                                  : hasText
                                  ? '#ffffff'
                                  : '#fafafa',
                                color: isConflicted ? '#b91c1c' : '#000000',
                                fontWeight: isConflicted ? 'bold' : 'normal',
                                position: 'relative'
                              }}
                            >
                              {cellData?.text ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {cellData.text}
                                  </span>
                                  {isConflicted && (
                                    <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 12 }}>
                                      ⚠️
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: '#cbd5e1' }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. МОДАЛЬНОЕ ОКНО БЫСТРОГО РЕДАКТИРОВАНИЯ ЯЧЕЙКИ УРОКА
      ───────────────────────────────────────────────────────────────────────────── */}
      {editingCell && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCell(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary }}>
                  Урок № {editingCell.periodNum} • {editingCell.classId} класс
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  Время: {PERIODS.find((p) => p.num === editingCell.periodNum)?.time}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                  Текст урока (Предмет + Кабинет как в ведомости):
                </label>
                <input
                  type="text"
                  value={editingCell.text}
                  onChange={(e) => setEditingCell({ ...editingCell, text: e.target.value })}
                  placeholder="Например: математика 213 или инф 108/инф 127"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                  Номер кабинета для детектора накладок:
                </label>
                <input
                  type="text"
                  value={editingCell.roomInput}
                  onChange={(e) => setEditingCell({ ...editingCell, roomInput: e.target.value })}
                  placeholder="211 (или через пробел для подгрупп: 108 127)"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Свободные кабинеты на этот урок */}
              <div style={{ fontSize: 12, color: colors.textMuted, background: colors.slotBg, padding: 10, borderRadius: 8 }}>
                Свободные кабинеты на {editingCell.periodNum}-й урок:<br />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {getFreeRoomsForPeriod(editingCell.periodNum).slice(0, 10).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setEditingCell({
                          ...editingCell,
                          roomInput: r,
                          text: editingCell.text.replace(/\b\d{3}\b/, r) || `Каб. ${r}`
                        });
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: `1px solid ${colors.cardBorder}`,
                        background: colors.cardBg,
                        color: colors.accentColor,
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: 'pointer'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: colors.slotBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={saveCellEdit}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: colors.accentColor,
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          4.1. ВКЛАДКА: ШКОЛЬНАЯ ЛЕНТА НОВОСТЕЙ И ОБЪЯВЛЕНИЙ (NEWS)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'news' && (
        <SchoolNewsFeedView
          user={user}
          theme={theme}
          canPublish={true}
          onNavigateToTab={onNavigateToTab}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. ВКЛАДКА 1: СВОДКА И МОНИТОРИНГ (SUMMARY)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'summary' && (
        <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
          {/* Левая колонка */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 18,
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: colors.textPrimary }}>
                    Посещаемость по параллелям (9–11 классы)
                  </div>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    Данные турникетов СКУД и электронного журнала на 11:30
                  </div>
                </div>

                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: colors.emeraldSoft, padding: '3px 8px', borderRadius: 6 }}>
                  Синхронизировано
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { classId: '9А', leader: 'Лосив Р.Б.', total: 28, present: 26, sick: 1, excused: 1, percent: 92.9 },
                  { classId: '9Б', leader: 'Смирнов В.А.', total: 26, present: 24, sick: 2, excused: 0, percent: 92.3 },
                  { classId: '9В', leader: 'Степанова Н.В.', total: 27, present: 25, sick: 1, excused: 1, percent: 92.6 },
                  { classId: '10А', leader: 'Миронова О.И.', total: 25, present: 24, sick: 1, excused: 0, percent: 96.0 },
                  { classId: '10Б', leader: 'Ковалев С.М.', total: 26, present: 25, sick: 1, excused: 0, percent: 96.2 },
                  { classId: '11А', leader: 'Васильева Е.Н.', total: 24, present: 23, sick: 1, excused: 0, percent: 95.8 }
                ].map((row) => (
                  <div
                    key={row.classId}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '70px 1.4fr 110px 90px',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      alignItems: 'center',
                      fontSize: 13
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 14, color: colors.textPrimary }}>{row.classId}</strong>
                    </div>

                    <div style={{ color: colors.textSecondary }}>
                      {row.leader}
                    </div>

                    <div style={{ color: colors.textMuted }}>
                      {row.present} из {row.total} уч.
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: row.percent >= 95 ? colors.emeraldSoft : colors.accentSoft,
                          color: row.percent >= 95 ? '#10b981' : colors.accentColor,
                          fontWeight: 800,
                          fontSize: 12
                        }}
                      >
                        {row.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 18,
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary }}>
                Внутришкольный контроль (ВШК)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ padding: 12, borderRadius: 10, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                  <div style={{ fontWeight: 700, color: colors.textPrimary }}>
                    Посещение урока: Физика (каб. 204)
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    Учитель: Смирнов В.А. • Тема: Закон Ома • Цель: подготовка к ОГЭ
                  </div>
                  <div style={{ fontSize: 11, color: colors.accentColor, fontWeight: 600, marginTop: 4 }}>
                    Завтра, 13 февраля, 1-й урок (08:30)
                  </div>
                </div>

                <div style={{ padding: 12, borderRadius: 10, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                  <div style={{ fontWeight: 700, color: colors.textPrimary }}>
                    Проверка журналов: 9–11 классы
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    Своевременность выставления оценок за контрольные работы
                  </div>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                    Пятница, 14 февраля
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. ВКЛАДКА 2: ДИСПЕТЧЕРСКАЯ ЗАМЕН УРОКОВ (REPLACEMENTS)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'replacements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
                  Журнал оперативных замен уроков на среду, 12 февраля
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  МАОУ ЛИТ • Все назначенные уроки подлежат официальной тарификации и оплате
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderType('replacements');
                    setShowOrderPrintModal(true);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: colors.accentSoft,
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    color: colors.accentColor,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Printer size={14} /> Печать приказа о заменах (А4)
                </button>
              </div>
            </div>

            {/* Таблица замен */}
            <div
              style={{
                background: colors.slotBg,
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${colors.cardBorder}`
              }}
            >
              <div className="responsive-table-scroll" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ minWidth: 680 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '70px 80px 1.6fr 1.6fr 100px 140px',
                  padding: '12px 16px',
                  borderBottom: `1px solid ${colors.cardBorder}`,
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              >
                <span>Урок</span>
                <span>Класс</span>
                <span>По расписанию (Отсутствует)</span>
                <span>Замена (Учитель и предмет)</span>
                <span>Кабинет</span>
                <span style={{ textAlign: 'right' }}>Статус / Сферум</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {replacements.map((r, idx) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '70px 80px 1.6fr 1.6fr 100px 140px',
                      padding: '14px 16px',
                      alignItems: 'center',
                      borderBottom: idx < replacements.length - 1 ? `1px solid ${colors.cardBorder}` : 'none',
                      fontSize: 13
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 14, color: colors.textPrimary }}>№ {r.lessonNum}</strong>
                      <div style={{ fontSize: 11, color: colors.textMuted }}>{r.time.split('–')[0]}</div>
                    </div>

                    <div>
                      <span style={{ fontWeight: 800, color: colors.accentColor, background: colors.cardBg, padding: '3px 8px', borderRadius: 6, border: `1px solid ${colors.cardBorder}` }}>
                        {r.targetClass}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, color: colors.textPrimary }}>{r.originalSubject}</div>
                      <div style={{ fontSize: 11, color: '#f43f5e', marginTop: 1 }}>
                        {r.absentTeacher} ({r.absentReason})
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: colors.textPrimary }}>{r.replacingSubject}</div>
                      <div style={{ fontSize: 12, color: colors.accentColor, marginTop: 1 }}>
                        {r.replacingTeacher}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontWeight: 700, color: colors.textSecondary }}>
                        Каб. {r.classroom}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {r.status === 'notified' ? (
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Check size={12} /> Уведомлен
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markReplacementNotified(r.id)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            background: colors.accentColor,
                            color: '#ffffff',
                            border: 'none',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Оповестить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. ВКЛАДКА 3: КАЧЕСТВО ЗНАНИЙ (MONITORING)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'monitoring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
                Сводная успеваемость и готовность к ОГЭ / ЕГЭ (3 четверть)
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                Качество обученности (КОУ) рассчитывается по методике Третьякова
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {[
                { classId: '9А класс', teacher: 'Лосив Р.Б.', quality: '71.4%', gpa: '4.42', excellent: 5, good: 15, debts: 0, status: 'Лидер параллели' },
                { classId: '9Б класс', teacher: 'Смирнов В.А.', quality: '61.5%', gpa: '4.18', excellent: 2, good: 14, debts: 1, status: '1 должник (физика)' },
                { classId: '10Б класс', teacher: 'Ковалев С.М.', quality: '69.2%', gpa: '4.35', excellent: 4, good: 14, debts: 0, status: 'Стабильно' },
                { classId: '11А класс', teacher: 'Васильева Е.Н.', quality: '75.0%', gpa: '4.50', excellent: 6, good: 12, debts: 0, status: 'Высокая готовность к ЕГЭ' }
              ].map((c) => (
                <div
                  key={c.classId}
                  style={{
                    padding: 18,
                    borderRadius: 14,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 16, color: colors.textPrimary }}>{c.classId}</strong>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.debts === 0 ? '#10b981' : '#f59e0b' }}>
                      {c.status}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: colors.textMuted }}>
                    Классный руководитель: <strong>{c.teacher}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${colors.cardBorder}`, fontSize: 12 }}>
                    <div>
                      <div style={{ color: colors.textMuted }}>Качество знаний</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: colors.accentColor, marginTop: 2 }}>{c.quality}</div>
                    </div>
                    <div>
                      <div style={{ color: colors.textMuted }}>Средний балл</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, marginTop: 2 }}>{c.gpa}</div>
                    </div>
                    <div>
                      <div style={{ color: colors.textMuted }}>Отличники</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981', marginTop: 2 }}>{c.excellent} чел.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. ВКЛАДКА 4: НАГРУЗКА И КАДРЫ (WORKLOAD)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'workload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
                  Кадровая сетка и тарификационная нагрузка педагогов
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  Учебный план МАОУ ЛИТ на 2026/2027 учебный год
                </div>
              </div>

              <div style={{ width: 240, position: 'relative' }}>
                <Search size={14} color={colors.textMuted} style={{ position: 'absolute', left: 10, top: 10 }} />
                <input
                  type="text"
                  placeholder="Поиск учителя или предмета..."
                  value={searchTeacher}
                  onChange={(e) => setSearchTeacher(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '7px 10px 7px 30px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 12,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div
              style={{
                background: colors.slotBg,
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${colors.cardBorder}`
              }}
            >
              <div className="responsive-table-scroll" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ minWidth: 680 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.8fr 110px 100px 1.4fr 150px 100px',
                  padding: '12px 16px',
                  borderBottom: `1px solid ${colors.cardBorder}`,
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              >
                <span>ФИО учителя и предмет</span>
                <span>Категория</span>
                <span>Нагрузка</span>
                <span>Классное руководство</span>
                <span>Аттестация</span>
                <span style={{ textAlign: 'right' }}>Статус</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredTeachers.map((t, idx) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.8fr 110px 100px 1.4fr 150px 100px',
                      padding: '12px 16px',
                      alignItems: 'center',
                      borderBottom: idx < filteredTeachers.length - 1 ? `1px solid ${colors.cardBorder}` : 'none',
                      fontSize: 13
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: colors.textPrimary }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{t.subject}</div>
                    </div>

                    <div>
                      <span style={{ padding: '2px 7px', borderRadius: 6, background: colors.accentSoft, color: colors.accentColor, fontSize: 11, fontWeight: 700 }}>
                        {t.category}
                      </span>
                    </div>

                    <div>
                      <strong>{t.hoursPerWeek} ч/нед</strong>
                    </div>

                    <div style={{ color: colors.textSecondary }}>
                      {t.classLeadership || '—'}
                    </div>

                    <div style={{ fontSize: 11, color: colors.textMuted }}>
                      {t.attestationYear}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: t.status === 'active' ? '#10b981' : t.status === 'courses' ? '#f59e0b' : '#f43f5e'
                        }}
                      >
                        {t.status === 'active' ? '● В лицее' : t.status === 'courses' ? '● Курсы' : '● Больничный'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          9. ВКЛАДКА 5: ПРИКАЗЫ И АКТЫ (ORDERS)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[
            {
              type: 'replacements' as const,
              number: '№ 44-ОД',
              date: '12 февраля 2026 г.',
              title: 'О назначении замен уроков на период временной нетрудоспособности педагогических работников',
              author: 'Зам. директора по УВР Громова А.С.',
              status: 'Подписан'
            },
            {
              type: 'olympiad' as const,
              number: '№ 41-ОД',
              date: '10 февраля 2026 г.',
              title: 'О направлении обучающихся 9А класса на региональный этап Всероссийской олимпиады школьников',
              author: 'Директор лицея / Завуч',
              status: 'Подписан'
            },
            {
              type: 'gia' as const,
              number: '№ 38-ОД',
              date: '02 февраля 2026 г.',
              title: 'О проведении тренировочного тестирования ОГЭ-2026 по математике и русскому языку',
              author: 'Зам. директора по УВР Громова А.С.',
              status: 'Действует'
            }
          ].map((ord) => (
            <div
              key={ord.number}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: colors.accentColor }}>{ord.number}</span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>{ord.date}</span>
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.4 }}>
                  {ord.title}
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                  {ord.author}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: `1px solid ${colors.cardBorder}`,
                  marginTop: 'auto'
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>
                  ✓ {ord.status}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderType(ord.type);
                    setShowOrderPrintModal(true);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Printer size={13} /> Печать А4
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          10. МОДАЛЬНОЕ ОКНО ПЕЧАТИ ОФИЦИАЛЬНОГО ПРИКАЗА (А4)
      ───────────────────────────────────────────────────────────────────────────── */}
      {showOrderPrintModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowOrderPrintModal(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              color: '#000000',
              borderRadius: 16,
              padding: 36,
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              fontFamily: '"Times New Roman", Times, serif',
              position: 'relative'
            }}
          >
            {/* Официальная шапка МАОУ ЛИТ */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' }}>
                Департамент образования мэрии города Новосибирска
              </div>
              <div style={{ fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>
                Муниципальное автономное общеобразовательное учреждение города Новосибирска<br />
                «Лицей Информационных Технологий» (МАОУ ЛИТ)
              </div>
              <div style={{ fontSize: 10, marginTop: 4 }}>
                630099, г. Новосибирск, ул. Советская, д. 26 • ОГРН 1025402456789 • ИНН 5406123456
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', margin: '20px 0 10px' }}>
              ПРИКАЗ
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}>
              <span>12 февраля 2026 г.</span>
              <span>г. Новосибирск</span>
              <span>
                {selectedOrderType === 'replacements' && '№ 44-ОД'}
                {selectedOrderType === 'olympiad' && '№ 41-ОД'}
                {selectedOrderType === 'gia' && '№ 38-ОД'}
              </span>
            </div>

            {selectedOrderType === 'replacements' && (
              <>
                <div style={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                  «О назначении замен уроков на период временной нетрудоспособности педагогических работников»
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, textIndent: 30, textAlign: 'justify' }}>
                  В связи с временным отсутствием учителя истории Ковалева С.М. (направление на повышение квалификации) и учителя английского языка Мироновой О.И. (листок нетрудоспособности), в целях непрерывного освоения обучающимися основных образовательных программ:
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, marginTop: 10 }}>
                  <strong>ПРИКАЗЫВАЮ:</strong><br />
                  1. Назначить 12 февраля 2026 года следующие замены учебных занятий:<br />
                  — 9Б класс, 2-й урок: Русский язык вместо истории — учитель Васильева Е.Н. (Каб. 108);<br />
                  — 10Б класс, 4-й урок: Информатика вместо обществознания — учитель Лосив Р.Б. (Каб. 311);<br />
                  — 11А класс, 5-й урок: Химия вместо английского языка — учитель Попова Т.А. (Каб. 218).<br />
                  2. Бухгалтерии произвести оплату фактически проведенных часов педагогической нагрузки в установленном порядке.<br />
                  3. Контроль за исполнением настоящего приказа возложить на заместителя директора по УВР Громову А.С.
                </div>
              </>
            )}

            {selectedOrderType === 'olympiad' && (
              <>
                <div style={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                  «О направлении обучающегося 9А класса Иванова И.Д. на Всероссийскую олимпиаду школьников»
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, textIndent: 30, textAlign: 'justify' }}>
                  На основании протокола муниципального этапа Всероссийской олимпиады школьников по информатике и ИКТ:
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, marginTop: 10 }}>
                  <strong>ПРИКАЗЫВАЮ:</strong><br />
                  1. Командировать обучающегося 9 «А» класса <strong>Иванова Ивана Дмитриевича</strong> для участия в региональном этапе ВсОШ на базу НГУ с 16 по 18 февраля 2026 года.<br />
                  2. Назначить сопровождающим педагогом-наставником учителя информатики Лосива Р.Б.<br />
                  3. Сохранить за обучающимся текущую аттестацию по пропущенным занятиям на основании индивидуального плана.
                </div>
              </>
            )}

            {selectedOrderType === 'gia' && (
              <>
                <div style={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                  «О проведении диагностического тренировочного тестирования ОГЭ-2026»
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, textIndent: 30, textAlign: 'justify' }}>
                  В соответствии с планом внутришкольного контроля и подготовки выпускников 9-х классов к государственной итоговой аттестации:
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, marginTop: 10 }}>
                  <strong>ПРИКАЗЫВАЮ:</strong><br />
                  1. Провести 19 февраля 2026 года тренировочное тестирование в формате ОГЭ по математике для учащихся 9А, 9Б, 9В классов в аудиториях 311, 204, 108.<br />
                  2. Экспертной комиссии в составе Лосива Р.Б., Васильевой Е.Н. предоставить сводный аналитический отчет в срок до 22 февраля 2026 года.
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 36, fontSize: 13 }}>
              <div>
                Директор МАОУ ЛИТ:<br />
                Зам. директора по УВР:
              </div>
              <div style={{ textAlign: 'right' }}>
                / Попова Т.А. /<br />
                / Громова А.С. /
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 26, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  background: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Printer size={15} /> Распечатать приказ (А4)
              </button>
              <button
                type="button"
                onClick={() => setShowOrderPrintModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { exportOfficialDocumentPdf } from '../../utils/pdfExport';
import {
  Search,
  Clock,
  Send,
  FileText,
  Plus,
  CheckCircle2,
  Calendar,
  X,
  Layers,
  MapPin,
  Download,
  Sparkles,
  Compass
} from 'lucide-react';
import type { AuthThemeMode } from '../../types/auth';

export interface LessonSlot {
  lessonNum: number;
  time: string;
  classGrade?: string;
  subject?: string;
  teacher?: string;
  isFree?: boolean;
  notes?: string;
  files?: Array<{ name: string; size: string }>;
}

export interface ClassroomInfo {
  number: string;
  floor: 1 | 2 | 3;
  wing: 'Левое крыло' | 'Правое крыло';
  wingCode: 'left' | 'right';
  headTeacher: string;
  capacity: number;
  equipment: string[];
  schedule: LessonSlot[];
}

// Стандартные времена 7 уроков
const LESSON_TIMES = [
  '08:30 – 09:15',
  '09:25 – 10:10',
  '10:25 – 11:10',
  '11:30 – 12:15', // 4 урок (текущий)
  '12:35 – 13:20',
  '13:30 – 14:15', // 6 урок (окно для пересдач)
  '14:25 – 15:10'
];

// Генератор полной базы 60 кабинетов лицея: 101–120, 201–220, 301–320
function generateAllClassrooms(): ClassroomInfo[] {
  const rooms: ClassroomInfo[] = [];

  const TEACHERS_POOL = [
    'Лосив Р.Б.',
    'Семенов М.Ю.',
    'Смирнов А.П.',
    'Сидоров К.А.',
    'Романова Е.В.',
    'Браун Э.В.',
    'Громова А.С.',
    'Лебедева Н.И.',
    'Федорова Т.С.',
    'Кузнецов Д.В.',
    'Громов А.Н.',
    'Ковалева О.М.',
    'Зайцев П.Н.',
    'Соколова И.В.'
  ];

  const SUBJECTS_BY_FLOOR = {
    1: ['Химия', 'Биология', 'Физкультура', 'ОБЖ', 'НВП', 'Экология', 'Труд'],
    2: ['Русский язык', 'Литература', 'Английский язык', 'История', 'Обществознание', 'География', 'Право'],
    3: ['Алгебра', 'Геометрия', 'Информатика', 'Физика', 'Робототехника', 'Астрономия', 'Web-разработка']
  };

  const CLASSES_POOL = ['5А', '5Б', '6А', '6Б', '7А', '7Б', '7В', '8А', '8Б', '9А', '9Б', '10А', '10Б', '11А', '11Б'];

  for (let floor = 1; floor <= 3; floor++) {
    for (let index = 1; index <= 20; index++) {
      const roomNum = `${floor}${index < 10 ? '0' + index : index}`;
      const isLeft = index <= 10;
      const wing = isLeft ? 'Левое крыло' : 'Правое крыло';
      const wingCode = isLeft ? 'left' : 'right';

      // Специальные кабинеты с фиксированными данными
      if (roomNum === '311') {
        rooms.push({
          number: '311',
          floor: 3,
          wing: 'Правое крыло',
          wingCode: 'right',
          headTeacher: 'Лосив Роман Борисович',
          capacity: 30,
          equipment: ['Smart Board 85"', 'Проектор NEC', '15 ПК учеников', 'Wi-Fi Сферум', 'Кондиционер'],
          schedule: [
            { lessonNum: 1, time: LESSON_TIMES[0], classGrade: '8А', subject: 'Алгебра', teacher: 'Лосив Р.Б.' },
            { lessonNum: 2, time: LESSON_TIMES[1], classGrade: '8Б', subject: 'Геометрия', teacher: 'Лосив Р.Б.' },
            { lessonNum: 3, time: LESSON_TIMES[2], classGrade: '10А', subject: 'Информатика', teacher: 'Лосив Р.Б.' },
            {
              lessonNum: 4,
              time: LESSON_TIMES[3],
              classGrade: '9А',
              subject: 'Геометрия',
              teacher: 'Лосив Р.Б.',
              notes: 'Проверочный срез по теореме Пифагора (4 варианта А4)',
              files: [
                { name: 'Технологическая_карта_ФГОС_Геометрия_9А.pdf', size: '240 КБ' },
                { name: 'Карточки_А4_Вариант_1_2.pdf', size: '412 КБ' }
              ]
            },
            { lessonNum: 5, time: LESSON_TIMES[4], classGrade: '11Б', subject: 'Алгебра', teacher: 'Лосив Р.Б.' },
            { lessonNum: 6, time: LESSON_TIMES[5], isFree: true, notes: 'Окно для консультаций и сдачи задолженностей 9А класса' },
            { lessonNum: 7, time: LESSON_TIMES[6], classGrade: 'Кружок', subject: 'Олимпиадная математика', teacher: 'Лосив Р.Б.' }
          ]
        });
        continue;
      }

      // Генерация реалистичного расписания для остальных кабинетов
      const headTeacher = TEACHERS_POOL[(floor * 7 + index) % TEACHERS_POOL.length];
      const subjects = SUBJECTS_BY_FLOOR[floor as 1 | 2 | 3];
      const mainSubject = subjects[(index * 3) % subjects.length];

      // Окна (свободные кабинеты): делаем ~6 кабинетов на этаже свободными на 4 уроке и на 6 уроке
      const isFreeSlot4 = (index % 4 === 0 || index === 8 || index === 14);
      const isFreeSlot6 = (index % 3 === 0 || index === 6 || index === 17);

      const schedule: LessonSlot[] = LESSON_TIMES.map((time, slotIdx) => {
        const lessonNum = slotIdx + 1;
        if (lessonNum === 4 && isFreeSlot4) {
          return { lessonNum, time, isFree: true, notes: 'Свободен для консультаций и замен' };
        }
        if (lessonNum === 6 && isFreeSlot6) {
          return { lessonNum, time, isFree: true, notes: 'Окно для пересдач и проектных работ' };
        }
        if (lessonNum === 7 && index % 2 === 1) {
          return { lessonNum, time, isFree: true };
        }

        const grade = CLASSES_POOL[(floor * 5 + index + slotIdx) % CLASSES_POOL.length];
        return {
          lessonNum,
          time,
          classGrade: grade,
          subject: mainSubject,
          teacher: headTeacher
        };
      });

      rooms.push({
        number: roomNum,
        floor: floor as 1 | 2 | 3,
        wing,
        wingCode,
        headTeacher,
        capacity: 26 + (index % 8),
        equipment: ['Проектор', 'Интерактивная доска', 'Wi-Fi Сферум', 'ПК учителя'],
        schedule
      });
    }
  }

  return rooms;
}

const ALL_CLASSROOMS = generateAllClassrooms();

interface SchoolLocatorViewProps {
  theme: AuthThemeMode;
  onOpenSosTicket: (roomNumber: string) => void;
}

export const SchoolLocatorView: React.FC<SchoolLocatorViewProps> = ({
  theme,
  onOpenSosTicket: _onOpenSosTicket
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  // Текущий этаж (1, 2 или 3)
  const [selectedFloor, setSelectedFloor] = useState<1 | 2 | 3>(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | '9a' | 'freeNow' | 'free6' | 'my'>('all');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('311');

  // Модалка вызова ученика на пересдачу
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directStudent, setDirectStudent] = useState('Иванов Иван (9А)');
  const [directText, setDirectText] = useState('Иван, жду Вас на пересдачу во вторник на 6 уроке (13:30) в каб. 311.');
  const [directSentToast, setDirectSentToast] = useState(false);

  // Прикрепленные материалы к текущему уроку
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [attachedFilesList, setAttachedFilesList] = useState<Array<{ name: string; size: string }>>([
    { name: 'Технологическая_карта_ФГОС_Геометрия_9А.pdf', size: '240 КБ' },
    { name: 'Карточки_А4_Вариант_1_2.pdf', size: '412 КБ' }
  ]);

  const colors = {
    cardBg: isContrast ? '#ffffff' : isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(18, 22, 32, 0.82)',
    cardBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.1)',
    cardShadow: isContrast ? '0 4px 16px rgba(15, 23, 42, 0.06)' : isLight ? '0 16px 36px -8px rgba(15, 23, 42, 0.08)' : '0 18px 42px -8px rgba(0, 0, 0, 0.65)',
    slotBg: isContrast ? '#f8fafc' : isLight ? 'rgba(248, 250, 252, 0.9)' : 'rgba(255, 255, 255, 0.04)',
    slotBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? '1px solid rgba(226, 232, 240, 0.85)' : '1px solid rgba(255, 255, 255, 0.08)',
    textPrimary: isContrast ? '#0a0f1d' : isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isContrast ? '#1e293b' : isLight ? '#475569' : '#94a3b8',
    textMuted: isContrast ? '#334155' : isLight ? '#64748b' : '#94a3b8',
    accentColor: isContrast ? '#0055d4' : '#0077ff'
  };

  // 20 кабинетов выбранного этажа (или поиск по всем 60)
  const currentFloorRooms = useMemo(() => {
    return ALL_CLASSROOMS.filter((room) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNum = room.number.toLowerCase().includes(q);
        const matchesTeacher = room.headTeacher.toLowerCase().includes(q);
        const matchesLessons = room.schedule.some(
          (s) =>
            (s.classGrade && s.classGrade.toLowerCase().includes(q)) ||
            (s.subject && s.subject.toLowerCase().includes(q))
        );
        return matchesNum || matchesTeacher || matchesLessons;
      }
      return room.floor === selectedFloor;
    });
  }, [selectedFloor, searchQuery]);

  // Выбранный кабинет для инспектора справа
  const selectedRoom = useMemo(() => {
    return (
      ALL_CLASSROOMS.find((r) => r.number === selectedRoomNumber) ||
      ALL_CLASSROOMS.find((r) => r.number === '311') ||
      ALL_CLASSROOMS[0]
    );
  }, [selectedRoomNumber]);

  // Быстрые сценарии
  const handleSelectScenario = (filter: 'all' | '9a' | 'freeNow' | 'free6' | 'my') => {
    setActiveQuickFilter(filter);
    if (filter === '9a' || filter === 'my' || filter === 'free6') {
      setSelectedFloor(3);
      setSelectedRoomNumber('311');
    }
  };

  const handleSendDirect = () => {
    setDirectSentToast(true);
    setTimeout(() => {
      setDirectSentToast(false);
      setShowDirectModal(false);
    }, 1800);
  };

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    setAttachedFilesList((prev) => [
      ...prev,
      { name: newFileName.trim().endsWith('.pdf') ? newFileName.trim() : `${newFileName.trim()}.pdf`, size: '184 КБ' }
    ]);
    setNewFileName('');
    setShowAddFileModal(false);
  };

  // Статистика свободных кабинетов на этаже
  const freeCountOnFloor = useMemo(() => {
    return ALL_CLASSROOMS.filter((r) => r.floor === selectedFloor && r.schedule.find((s) => s.lessonNum === 4)?.isFree).length;
  }, [selectedFloor]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <style>{`
        @keyframes locatorPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.88); }
        }
      `}</style>

      {/* ─── ВЕРХНИЙ КОМАНДНЫЙ БАР (ЭТАЖИ + СТАТУС + ПОИСК) ─── */}
      <div
        style={{
          background: colors.cardBg,
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          border: colors.cardBorder,
          borderRadius: 20,
          boxShadow: colors.cardShadow,
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 119, 255, 0.3), inset 0 1px 1px rgba(255,255,255,0.45)',
              flexShrink: 0
            }}
          >
            <Compass size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary, letterSpacing: -0.4 }}>
                Навигатор по лицею
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 8,
                  background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.2)',
                  color: colors.accentColor,
                  fontWeight: 700
                }}
              >
                МАОУ ЛИТ • 60 кабинетов
              </span>
            </div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              Поэтажная схема коридоров и быстрый поиск по номерам кабинетов
            </div>
          </div>
        </div>

        {/* Быстрый поиск кабинета или класса */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              background: isLight ? 'rgba(241, 245, 249, 0.85)' : 'rgba(255, 255, 255, 0.06)',
              border: colors.slotBorder,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12
            }}
          >
            <Clock size={14} color={colors.accentColor} />
            <span style={{ fontWeight: 700, color: colors.textPrimary }}>4-й урок (11:30–12:15)</span>
            <span style={{ color: colors.textMuted }}>• 18 мин до звонка</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 10,
              background: colors.cardBg,
              border: colors.slotBorder,
              width: 220
            }}
          >
            <Search size={14} color={colors.textMuted} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Номер: 311, 204, 108, 9А..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 12.5,
                color: colors.textPrimary,
                fontFamily: 'inherit'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── ПЕРЕКЛЮЧАТЕЛЬ ЭТАЖЕЙ (101–120, 201–220, 301–320) + СЦЕНАРИИ ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        {/* Сегментированный переключатель 3 этажей */}
        <div
          style={{
            display: 'inline-flex',
            padding: 4,
            borderRadius: 14,
            background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(20, 24, 34, 0.85)',
            border: colors.slotBorder,
            gap: 4
          }}
        >
          {(
            [
              { floor: 1, title: '1 Этаж', range: 'Каб. 101 – 120' },
              { floor: 2, title: '2 Этаж', range: 'Каб. 201 – 220' },
              { floor: 3, title: '3 Этаж', range: 'Каб. 301 – 320' }
            ] as const
          ).map((f) => {
            const active = selectedFloor === f.floor && !searchQuery.trim();
            return (
              <button
                key={f.floor}
                type="button"
                onClick={() => {
                  setSelectedFloor(f.floor);
                  setSearchQuery('');
                  if (f.floor === 3) setSelectedRoomNumber('311');
                  else setSelectedRoomNumber(`${f.floor}01`);
                }}
                style={{
                  padding: '7px 18px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? colors.accentColor : 'transparent',
                  color: active ? '#ffffff' : colors.textPrimary,
                  fontWeight: 800,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.18s ease',
                  boxShadow: active ? '0 3px 10px rgba(0, 119, 255, 0.32)' : 'none'
                }}
              >
                <Layers size={14} />
                <span>{f.title}</span>
                <span style={{ fontSize: 11, opacity: active ? 0.9 : 0.6, fontWeight: 500 }}>
                  ({f.range})
                </span>
              </button>
            );
          })}
        </div>

        {/* Быстрые фильтры-сценарии */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleSelectScenario(activeQuickFilter === 'my' ? 'all' : 'my')}
            style={{
              padding: '6px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeQuickFilter === 'my' ? colors.accentColor : colors.slotBg,
              color: activeQuickFilter === 'my' ? '#ffffff' : colors.textPrimary,
              border: colors.slotBorder,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={12} />
            <span>Мой кабинет (311)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectScenario(activeQuickFilter === '9a' ? 'all' : '9a')}
            style={{
              padding: '6px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeQuickFilter === '9a' ? colors.accentColor : colors.slotBg,
              color: activeQuickFilter === '9a' ? '#ffffff' : colors.textPrimary,
              border: colors.slotBorder,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <MapPin size={12} />
            <span>Где 9А класс</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectScenario(activeQuickFilter === 'freeNow' ? 'all' : 'freeNow')}
            style={{
              padding: '6px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeQuickFilter === 'freeNow' ? colors.accentColor : colors.slotBg,
              color: activeQuickFilter === 'freeNow' ? '#ffffff' : colors.textPrimary,
              border: colors.slotBorder,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            <span>Свободные сейчас ({freeCountOnFloor})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectScenario(activeQuickFilter === 'free6' ? 'all' : 'free6')}
            style={{
              padding: '6px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeQuickFilter === 'free6' ? colors.accentColor : colors.slotBg,
              color: activeQuickFilter === 'free6' ? '#ffffff' : colors.textPrimary,
              border: colors.slotBorder
            }}
          >
            <span>Окна на 6 уроке (Пересдачи)</span>
          </button>
        </div>
      </div>

      {/* ─── ОСНОВНОЙ ВИД: СХЕМА КОРИДОРА ИНТЕРАКТИВНО + ИНСПЕКТОР СПРАВА ─── */}
      <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(280px, 1fr)', gap: 18, alignItems: 'start' }}>
        {/* ЛЕВАЯ ЧАСТЬ: АРХИТЕКТУРНЫЙ КОРИДОР (20 КАБИНЕТОВ ВДОЛЬ КОРИДОРА) */}
        <div
          style={{
            background: colors.cardBg,
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            border: colors.cardBorder,
            borderRadius: 20,
            boxShadow: colors.cardShadow,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {/* Заголовок этажа */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: colors.slotBorder, paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary, letterSpacing: -0.3 }}>
                {searchQuery.trim()
                  ? `Результаты поиска (${currentFloorRooms.length})`
                  : `Этаж № ${selectedFloor} • Схема коридора (Кабинеты ${selectedFloor}01 – ${selectedFloor}20)`}
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: colors.textMuted, fontWeight: 600 }}>
              Кликните по номеру кабинета для просмотра расписания
            </span>
          </div>

          {/* СХЕМА ДВУХ КРЫЛЬЕВ: ЗАПАДНОЕ (01–10) И ВОСТОЧНОЕ (11–20) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 1. ЗАПАДНОЕ КРЫЛО (Кабинеты 01 - 10) */}
            <div
              style={{
                background: isLight ? 'rgba(248, 250, 252, 0.85)' : 'rgba(10, 14, 22, 0.5)',
                border: colors.slotBorder,
                borderRadius: 16,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.textMuted }}>
                  Левое крыло • Кабинеты {selectedFloor}01 – {selectedFloor}10
                </span>
                <span style={{ fontSize: 10.5, color: colors.textMuted }}>Лестница 1</span>
              </div>

              {/* Северная сторона коридора (01 - 05) */}
              <div className="responsive-room-matrix" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
                {currentFloorRooms.slice(0, 5).map((room) => renderCompactRoomTile(room))}
              </div>

              {/* Коридор левого крыла */}
              <div
                style={{
                  height: 26,
                  borderRadius: 8,
                  background: isLight ? 'rgba(226, 232, 240, 0.75)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: colors.textSecondary
                }}
              >
                <span>← Лестница 1</span>
                <span style={{ color: colors.textMuted }}>Коридор левого крыла</span>
                <span>К правому крылу →</span>
              </div>

              {/* Южная сторона коридора (06 - 10) */}
              <div className="responsive-room-matrix" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
                {currentFloorRooms.slice(5, 10).map((room) => renderCompactRoomTile(room))}
              </div>
            </div>

            {/* 2. ПРАВОЕ КРЫЛО (Кабинеты 11 - 20) */}
            <div
              style={{
                background: isLight ? 'rgba(248, 250, 252, 0.85)' : 'rgba(10, 14, 22, 0.5)',
                border: colors.slotBorder,
                borderRadius: 16,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.textMuted }}>
                  Правое крыло • Кабинеты {selectedFloor}11 – {selectedFloor}20
                </span>
                <span style={{ fontSize: 10.5, color: colors.textMuted }}>Лестница 2</span>
              </div>

              {/* Северная сторона коридора (11 - 15) — Включает Каб. 311 */}
              <div className="responsive-room-matrix" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
                {currentFloorRooms.slice(10, 15).map((room) => renderCompactRoomTile(room))}
              </div>

              {/* Коридор правого крыла */}
              <div
                style={{
                  height: 26,
                  borderRadius: 8,
                  background: isLight ? 'rgba(226, 232, 240, 0.75)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: colors.textSecondary
                }}
              >
                <span>← К левому крылу</span>
                <span style={{ color: colors.textMuted }}>Коридор правого крыла (Каб. 311)</span>
                <span>Лестница 2 →</span>
              </div>

              {/* Южная сторона коридора (16 - 20) */}
              <div className="responsive-room-matrix" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
                {currentFloorRooms.slice(15, 20).map((room) => renderCompactRoomTile(room))}
              </div>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ИНСПЕКТОР ВЫБРАННОГО КАБИНЕТА */}
        <div
          style={{
            background: colors.cardBg,
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            border: colors.cardBorder,
            borderRadius: 20,
            boxShadow: colors.cardShadow,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'sticky',
            top: 20
          }}
        >
          {/* Шапка кабинета */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <span style={{ fontWeight: 900, fontSize: 26, color: colors.textPrimary, letterSpacing: -0.5 }}>
                  Кабинет {selectedRoom.number}
                </span>
                <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                  Заведующий кабинетом: <strong style={{ color: colors.textPrimary }}>{selectedRoom.headTeacher}</strong>
                </div>
              </div>
            </div>

            {/* Быстрое назначение пересдачи в этом кабинете */}
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowDirectModal(true)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(0, 119, 255, 0.28)'
                }}
              >
                <Send size={14} />
                <span>Назначить пересдачу в каб. {selectedRoom.number}</span>
              </button>
            </div>
          </div>

          {/* Текущее состояние на 4 уроке */}
          {(() => {
            const slot4 = selectedRoom.schedule.find((s) => s.lessonNum === 4);
            const isFree = slot4?.isFree;
            const has9a = slot4?.classGrade === '9А';

            return (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: has9a
                    ? (isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)')
                    : isFree
                    ? (isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.12)')
                    : colors.slotBg,
                  border: has9a ? `1.5px solid ${colors.accentColor}` : colors.slotBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, color: colors.textMuted }}>
                    Идет сейчас • 4-й урок (11:30–12:15)
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: colors.textPrimary, marginTop: 2 }}>
                    {isFree ? (
                      <span style={{ color: '#10b981' }}>Кабинет свободен</span>
                    ) : (
                      <span>{slot4?.classGrade} класс • {slot4?.subject}</span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary }}>
                  {isFree ? 'Окно' : '18 мин до конца'}
                </span>
              </div>
            );
          })()}

          {/* Полное расписание 1–7 уроков */}
          <div style={{ borderTop: colors.slotBorder, paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} color={colors.accentColor} />
                Сетка уроков на сегодня:
              </span>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                {selectedRoom.schedule.find((s) => s.lessonNum === 6)?.isFree ? '6 урок свободен' : 'Занят'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {selectedRoom.schedule.map((slot) => {
                const isCurrent = slot.lessonNum === 4;
                const isFree = slot.isFree;

                return (
                  <div
                    key={slot.lessonNum}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 8,
                      background: isCurrent
                        ? (isLight ? 'rgba(0, 119, 255, 0.1)' : 'rgba(0, 119, 255, 0.2)')
                        : isFree
                        ? (isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.1)')
                        : colors.slotBg,
                      border: isCurrent
                        ? `1.5px solid ${colors.accentColor}`
                        : isFree
                        ? '1px dashed #10b981'
                        : colors.slotBorder
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          background: isCurrent ? colors.accentColor : isLight ? '#ffffff' : '#222c3c',
                          color: isCurrent ? '#ffffff' : colors.textPrimary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10.5,
                          fontWeight: 800
                        }}
                      >
                        {slot.lessonNum}
                      </span>
                      <div>
                        <span style={{ fontSize: 10, color: colors.textMuted, marginRight: 6 }}>{slot.time}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary }}>
                          {isFree ? (
                            <span style={{ color: '#10b981' }}>Свободен для занятий</span>
                          ) : (
                            <span>{slot.classGrade} • {slot.subject}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: 10.5, fontWeight: 700, color: isCurrent ? colors.accentColor : colors.textMuted }}>
                      {isCurrent ? 'СЕЙЧАС' : isFree ? 'Окно' : slot.teacher?.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Прикрепленные материалы (для 311) */}
          {selectedRoom.number === '311' && (
            <div style={{ borderTop: colors.slotBorder, paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={13} color={colors.accentColor} />
                  Материалы 9А (Геометрия):
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddFileModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.accentColor,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                >
                  <Plus size={12} />
                  <span>Добавить</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {attachedFilesList.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: colors.slotBorder,
                      fontSize: 11,
                      color: colors.textPrimary
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                      {file.name}
                    </span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (file.name.endsWith('.pdf')) {
                          exportOfficialDocumentPdf({
                            title: file.name.replace('.pdf', ''),
                            content: `### МАОУ «Лицей Информационных Технологий» г. Новосибирска\nКабинет: **${selectedRoom.number}** (${selectedRoom.floor} этаж, ${selectedRoom.wing})\nФайл: **${file.name}**\nОтветственный преподаватель: **${selectedRoom.headTeacher}**\n\n- Документ утвержден учебной частью лицея.\n- Регламент эксплуатации оборудования и требования безопасности соответствуют СанПиН и ФГОС РФ.\n- Методические материалы согласованы для проведения занятий в 9А классе.`,
                            authorName: selectedRoom.headTeacher || 'Лосив Роман Борисович',
                            category: 'Учебно-методический комплекс кабинета',
                            filename: file.name
                          });
                        } else {
                          const blob = new Blob([
                            `МАОУ Лицей Информационных Технологий (г. Новосибирск)\nКабинет: ${selectedRoom.number} (${selectedRoom.floor} этаж, ${selectedRoom.wing})\nФайл: ${file.name}\nОтветственный преподаватель: ${selectedRoom.headTeacher}\n\nРегламент эксплуатации оборудования и требования безопасности согласованы с администрацией лицея.`
                          ], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = file.name;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }
                      }}
                      style={{ color: colors.accentColor, display: 'flex', alignItems: 'center' }}
                      title="Скачать файл"
                    >
                      <Download size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── МОДАЛКА: НАЗНАЧЕНИЕ ПЕРЕСДАЧИ В СФЕРУМ ─── */}
      {showDirectModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16
          }}
          onClick={() => setShowDirectModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              background: colors.cardBg,
              backdropFilter: 'blur(32px)',
              border: colors.cardBorder,
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 24px 50px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: colors.textPrimary }}>
                Назначить пересдачу в Сферуме (Каб. {selectedRoom.number})
              </div>
              <button
                type="button"
                onClick={() => setShowDirectModal(false)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                Ученик:
              </label>
              <input
                type="text"
                value={directStudent}
                onChange={(e) => setDirectStudent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: colors.slotBg,
                  border: colors.slotBorder,
                  color: colors.textPrimary,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                Сообщение ученику и родителям:
              </label>
              <textarea
                value={directText}
                onChange={(e) => setDirectText(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: colors.slotBg,
                  border: colors.slotBorder,
                  color: colors.textPrimary,
                  fontSize: 13,
                  resize: 'none',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {directSentToast ? (
              <div
                style={{
                  padding: '11px 14px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  fontSize: 12.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <CheckCircle2 size={16} color="#059669" />
                <span>Уведомление отправлено в чат Сферума!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendDirect}
                style={{
                  padding: '11px 18px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(0, 119, 255, 0.3)'
                }}
              >
                <Send size={14} />
                <span>Отправить в чат Сферума</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── МОДАЛКА: ПРИКРЕПЛЕНИЕ МАТЕРИАЛОВ ─── */}
      {showAddFileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16
          }}
          onClick={() => setShowAddFileModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 400,
              background: colors.cardBg,
              backdropFilter: 'blur(32px)',
              border: colors.cardBorder,
              borderRadius: 20,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary }}>
                Прикрепить материал к уроку
              </div>
              <button
                type="button"
                onClick={() => setShowAddFileModal(false)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                Название файла или документа:
              </label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Конспект_9А_Теорема_Пифагора.pdf"
                autoFocus
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: colors.slotBg,
                  border: colors.slotBorder,
                  color: colors.textPrimary,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleAddFile}
              disabled={!newFileName.trim()}
              style={{
                padding: '10px 18px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: newFileName.trim() ? 'pointer' : 'not-allowed',
                opacity: newFileName.trim() ? 1 : 0.6,
                boxShadow: '0 4px 14px rgba(0, 119, 255, 0.3)'
              }}
            >
              Прикрепить к карточке урока
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Компактная плашка кабинета: ТОЛЬКО НОМЕР И КЛАСС/СТАТУС (БЕЗ ВОДЯНИСТЫХ НАЗВАНИЙ)
  function renderCompactRoomTile(room: ClassroomInfo) {
    const isSelected = room.number === selectedRoomNumber;
    const currentSlot = room.schedule.find((s) => s.lessonNum === 4);
    const isFreeNow = currentSlot?.isFree;
    const has9a = currentSlot?.classGrade === '9А';
    const isMyRoom = room.number === '311';

    return (
      <button
        key={room.number}
        type="button"
        onClick={() => setSelectedRoomNumber(room.number)}
        style={{
          height: 60,
          borderRadius: 12,
          padding: '6px 8px',
          background: isSelected
            ? (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.12)')
            : has9a
            ? (isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)')
            : isFreeNow
            ? (isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.08)')
            : (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)'),
          border: isSelected
            ? `2px solid ${colors.accentColor}`
            : isMyRoom
            ? '1.5px solid rgba(0, 119, 255, 0.5)'
            : isFreeNow
            ? (isLight ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(16, 185, 129, 0.25)')
            : colors.slotBorder,
          boxShadow: isSelected
            ? '0 6px 16px -2px rgba(0, 119, 255, 0.28)'
            : '0 1px 3px rgba(0, 0, 0, 0.03)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          transition: 'all 0.16s ease',
          transform: isSelected ? 'scale(1.04)' : 'none',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = 'translateY(-1.5px)';
            e.currentTarget.style.borderColor = colors.accentColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = isMyRoom
              ? 'rgba(0, 119, 255, 0.5)'
              : isFreeNow
              ? (isLight ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)')
              : isLight
              ? 'rgba(226, 232, 240, 0.85)'
              : 'rgba(255, 255, 255, 0.08)';
          }
        }}
      >
        {/* Номер кабинета крупно и четко */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              fontSize: 15.5,
              fontWeight: 900,
              color: isSelected ? colors.accentColor : colors.textPrimary,
              letterSpacing: -0.3
            }}
          >
            {room.number}
          </span>
          {isMyRoom && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: colors.accentColor,
                animation: 'locatorPulse 1.8s infinite'
              }}
            />
          )}
        </div>

        {/* Компактный бейдж статуса (ТОЛЬКО КЛАСС ИЛИ СВОБОДЕН) */}
        {has9a ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#ffffff',
              background: colors.accentColor,
              padding: '1px 6px',
              borderRadius: 6,
              lineHeight: 1.2
            }}
          >
            9А здесь
          </span>
        ) : isFreeNow ? (
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: '#059669',
              background: isLight ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.22)',
              padding: '1px 6px',
              borderRadius: 6,
              lineHeight: 1.2
            }}
          >
            Свободен
          </span>
        ) : (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: colors.textSecondary,
              lineHeight: 1.2
            }}
          >
            {currentSlot?.classGrade || 'Урок'}
          </span>
        )}
      </button>
    );
  }
};

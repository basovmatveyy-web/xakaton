import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import {
  ClipboardList,
  FileDown,
  Camera,
  Plus,
  Search,
  CheckCircle2,
  User,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  Printer,
  X,
  FileSpreadsheet,
  Award,
  ShieldCheck,
  Send
} from 'lucide-react';
import type { AuthThemeMode } from '../../types/auth';

export interface StatementItem {
  id: string;
  studentName: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  dates: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  cause: 'Болезнь (ОРВИ)' | 'Семейные обстоятельства' | 'Олимпиада (Всеросс)' | 'Плановый прием у врача' | 'Соревнования';
  docType: string;
  status: 'На больничном' | 'Заявление принято' | 'Приказ директора' | 'Новое заявление' | 'Отклонено';
  statusColor: string;
  statusBg: string;
  hasPhoto: boolean;
  docNumber?: string;
  noteText: string;
  receivedAt: string;
  scanType: 'medical' | 'handwritten' | 'order' | 'note';
}

export interface StudentAttendance {
  id: number;
  name: string;
  // D1..D5: 20.10, 21.10, 22.10, 23.10, 24.10 (сегодня)
  days: ('present' | 'sick' | 'excused' | 'unexcused' | 'olympiad')[];
  totalSick: number;
  totalExcused: number;
  totalUnexcused: number;
}

const INITIAL_STATEMENTS: StatementItem[] = [
  {
    id: 'ST-01',
    studentName: 'Иванов Иван',
    grade: '9А',
    parentName: 'Иванова Ольга Николаевна',
    parentPhone: '+7 (913) 456-78-90',
    dates: '22.09 – 27.09',
    startDate: '22.09.2026',
    endDate: '27.09.2026',
    daysCount: 6,
    cause: 'Болезнь (ОРВИ)',
    docType: 'Электронная справка поликлиники № 1',
    status: 'На больничном',
    statusColor: '#ef4444',
    statusBg: 'rgba(239, 68, 68, 0.12)',
    hasPhoto: true,
    docNumber: '№ 4082/26',
    noteText: 'Здравствуйте, Роман Борисович! Иван затемпературил (38.4), вызвали педиатра на дом. Открыли больничный лист до пятницы 27 сентября включительно. Справку прикрепляю. Домашние задания смотрим в электронном журнале Сферума.',
    receivedAt: '22 сентября, 07:42',
    scanType: 'medical'
  },
  {
    id: 'ST-02',
    studentName: 'Смирнова Анна',
    grade: '9А',
    parentName: 'Смирнов Алексей Петрович',
    parentPhone: '+7 (913) 789-01-23',
    dates: '06.10 – 07.10',
    startDate: '06.10.2026',
    endDate: '07.10.2026',
    daysCount: 2,
    cause: 'Семейные обстоятельства',
    docType: 'Письменное заявление родителя',
    status: 'Заявление принято',
    statusColor: '#10b981',
    statusBg: 'rgba(16, 185, 129, 0.12)',
    hasPhoto: true,
    docNumber: 'Вх. № 108',
    noteText: 'Классному руководителю 9А класса МАОУ ЛИТ Лосиву Р.Б. от Смирнова А.П. Прошу отпустить мою дочь Смирнову Анну с учебных занятий 6 и 7 октября 2026 г. по семейным обстоятельствам (поездка к родственникам). Ответственность за жизнь, здоровье и освоение школьной программы беру на себя.',
    receivedAt: '05 октября, 19:15',
    scanType: 'handwritten'
  },
  {
    id: 'ST-03',
    studentName: 'Петров Алексей',
    grade: '9А',
    parentName: 'Петров Сергей Васильевич',
    parentPhone: '+7 (913) 654-98-70',
    dates: '07.10 – 08.10',
    startDate: '07.10.2026',
    endDate: '08.10.2026',
    daysCount: 2,
    cause: 'Олимпиада (Всеросс)',
    docType: 'Приказ директора № 142-ОД',
    status: 'Приказ директора',
    statusColor: '#6366f1',
    statusBg: 'rgba(99, 102, 241, 0.12)',
    hasPhoto: true,
    docNumber: 'Приказ № 142-ОД',
    noteText: 'Направление на муниципальный этап Всероссийской олимпиады школьников по информатике и ИКТ в сопровождении наставника. Пропуски уроков считать уважительными по приказу директора лицея.',
    receivedAt: '06 октября, 14:00',
    scanType: 'order'
  },
  {
    id: 'ST-04',
    studentName: 'Васильева Дарья',
    grade: '9А',
    parentName: 'Васильева Марина Игоревна',
    parentPhone: '+7 (913) 222-33-44',
    dates: '24.10 (сегодня)',
    startDate: '24.10.2026',
    endDate: '24.10.2026',
    daysCount: 1,
    cause: 'Плановый прием у врача',
    docType: 'Талон записи и записка родителя',
    status: 'Новое заявление',
    statusColor: '#0077ff',
    statusBg: 'rgba(0, 119, 255, 0.12)',
    hasPhoto: true,
    docNumber: 'Записка № 14',
    noteText: 'Роман Борисович, доброе утро! Дарья сегодня задержится на 1-м уроке из-за записи к ортодонту на 8:30. Придет сразу ко 2-му уроку к 9:20. Талон записи прикрепляю.',
    receivedAt: 'Сегодня, 07:15',
    scanType: 'note'
  },
  {
    id: 'ST-05',
    studentName: 'Морозов Максим',
    grade: '9А',
    parentName: 'Морозова Елена Сергеевна',
    parentPhone: '+7 (913) 555-66-77',
    dates: '14.10 – 16.10',
    startDate: '14.10.2026',
    endDate: '16.10.2026',
    daysCount: 3,
    cause: 'Соревнования',
    docType: 'Вызов от Минспорта НСО',
    status: 'Заявление принято',
    statusColor: '#10b981',
    statusBg: 'rgba(16, 185, 129, 0.12)',
    hasPhoto: true,
    docNumber: 'Минспорт № 492',
    noteText: 'Командирование на Первенство Новосибирской области по плаванию (г. Бердск). Освобождение от занятий согласовано с директором лицея.',
    receivedAt: '12 октября, 11:20',
    scanType: 'order'
  }
];

const INITIAL_ATTENDANCE_STUDENTS: StudentAttendance[] = [
  { id: 1, name: 'Астахов Владислав', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 2, name: 'Баранов Максим', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 3, name: 'Васильева Дарья', days: ['present', 'present', 'present', 'present', 'excused'], totalSick: 0, totalExcused: 1, totalUnexcused: 0 },
  { id: 4, name: 'Григорьев Никита', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 5, name: 'Дмитриев Егор', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 6, name: 'Елисеева Полина', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 7, name: 'Жуков Артем', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 8, name: 'Иванов Иван', days: ['sick', 'sick', 'sick', 'sick', 'sick'], totalSick: 5, totalExcused: 0, totalUnexcused: 0 },
  { id: 9, name: 'Ильина София', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 10, name: 'Ковалев Дмитрий', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 1, totalUnexcused: 0 },
  { id: 11, name: 'Козлова Виктория', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 12, name: 'Кузнецов Артем', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 13, name: 'Лебедев Михаил', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 14, name: 'Морозов Максим', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 3, totalUnexcused: 0 },
  { id: 15, name: 'Николаева Алина', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 16, name: 'Павлов Кирилл', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 17, name: 'Петров Алексей', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 2, totalUnexcused: 0 },
  { id: 18, name: 'Попова Светлана', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 19, name: 'Романов Денис', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 20, name: 'Семенов Матвей', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 21, name: 'Смирнова Анна', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 2, totalUnexcused: 0 },
  { id: 22, name: 'Соколова Екатерина', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 23, name: 'Тарасов Илья', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 24, name: 'Ушакова Вероника', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 25, name: 'Федоров Николай', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 26, name: 'Харитонов Арсений', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 27, name: 'Цветкова Алиса', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 },
  { id: 28, name: 'Щербаков Тимофей', days: ['present', 'present', 'present', 'present', 'present'], totalSick: 0, totalExcused: 0, totalUnexcused: 0 }
];

interface ClassmasterDeskViewProps {
  theme?: AuthThemeMode;
  onNavigateToTab?: (tab: any) => void;
}

export const ClassmasterDeskView: React.FC<ClassmasterDeskViewProps> = ({
  theme = 'light'
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const colors = {
    cardBg: isLight ? '#ffffff' : '#171f2c',
    cardBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
    textPrimary: isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isLight ? '#475569' : '#94a3b8',
    textMuted: isLight ? '#94a3b8' : '#64748b',
    accentColor: isContrast ? '#0000ee' : '#0077ff',
    slotBg: isLight ? '#f8fafc' : '#101622',
    hoverBg: isLight ? '#f1f5f9' : '#1e293b',
    badgeBg: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)'
  };

  // ─── СОСТОЯНИЯ ───
  const [activeSubTab, setActiveSubTab] = useState<'statements' | 'attendance' | 'summary'>('statements');
  const [statements, setStatements] = useState<StatementItem[]>(INITIAL_STATEMENTS);
  const [students, setStudents] = useState<StudentAttendance[]>(INITIAL_ATTENDANCE_STUDENTS);
  const [filterCause, setFilterCause] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatement, setSelectedStatement] = useState<StatementItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Форма добавления нового заявления
  const [newStudentName, setNewStudentName] = useState('Иванов Иван');
  const [newCause, setNewCause] = useState<'Болезнь (ОРВИ)' | 'Семейные обстоятельства' | 'Олимпиада (Всеросс)' | 'Плановый прием у врача' | 'Соревнования'>('Семейные обстоятельства');
  const [newDates, setNewDates] = useState('25.10 – 26.10');
  const [newParentName, setNewParentName] = useState('Иванова О.Н.');
  const [newParentPhone, setNewParentPhone] = useState('+7 (913) 456-78-90');
  const [newNote, setNewNote] = useState('Прошу отпустить ребенка с уроков по семейным обстоятельствам.');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ─── ФИЛЬТРАЦИЯ ЗАЯВЛЕНИЙ ───
  const filteredStatements = useMemo(() => {
    return statements.filter((st) => {
      const matchCause =
        filterCause === 'all' ? true :
        filterCause === 'sick' ? st.cause.includes('Болезнь') :
        filterCause === 'family' ? st.cause.includes('Семейные') :
        filterCause === 'olympiad' ? (st.cause.includes('Олимпиада') || st.cause.includes('Соревнования')) :
        filterCause === 'new' ? st.status === 'Новое заявление' : true;

      const matchSearch =
        st.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.parentPhone.includes(searchQuery) ||
        st.cause.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCause && matchSearch;
    });
  }, [statements, filterCause, searchQuery]);

  // ─── СТАТИСТИКА ───
  const stats = useMemo(() => {
    const totalStudents = students.length;
    let sickToday = 0;
    let excusedToday = 0;
    let unexcusedToday = 0;

    students.forEach((s) => {
      const todayStatus = s.days[4]; // пятница 24.10 (сегодня)
      if (todayStatus === 'sick') sickToday++;
      else if (todayStatus === 'excused' || todayStatus === 'olympiad') excusedToday++;
      else if (todayStatus === 'unexcused') unexcusedToday++;
    });

    const presentToday = totalStudents - sickToday - excusedToday - unexcusedToday;
    const attendancePercent = ((presentToday / totalStudents) * 100).toFixed(1);

    return {
      totalStudents,
      presentToday,
      sickToday,
      excusedToday,
      unexcusedToday,
      attendancePercent,
      activeStatementsCount: statements.filter(s => s.status !== 'Отклонено').length
    };
  }, [students, statements]);

  // ─── ИНТЕРАКТИВНОЕ ПЕРЕКЛЮЧЕНИЕ ПОСЕЩАЕМОСТИ ───
  const handleToggleAttendance = (studentId: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const current = s.days[4];
        let next: 'present' | 'sick' | 'excused' | 'unexcused';
        if (current === 'present') next = 'sick';
        else if (current === 'sick') next = 'excused';
        else if (current === 'excused') next = 'unexcused';
        else next = 'present';

        const newDays = [...s.days];
        newDays[4] = next;
        return {
          ...s,
          days: newDays as any
        };
      })
    );
  };

  // ─── СМЕНА СТАТУСА ЗАЯВЛЕНИЯ ───
  const handleUpdateStatementStatus = (id: string, newStatus: StatementItem['status']) => {
    setStatements((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        let color = '#10b981';
        let bg = 'rgba(16, 185, 129, 0.12)';
        if (newStatus === 'На больничном') {
          color = '#ef4444';
          bg = 'rgba(239, 68, 68, 0.12)';
        } else if (newStatus === 'Приказ директора') {
          color = '#6366f1';
          bg = 'rgba(99, 102, 241, 0.12)';
        } else if (newStatus === 'Отклонено') {
          color = '#94a3b8';
          bg = 'rgba(148, 163, 184, 0.12)';
        }
        return {
          ...s,
          status: newStatus,
          statusColor: color,
          statusBg: bg
        };
      })
    );
    if (selectedStatement && selectedStatement.id === id) {
      setSelectedStatement((prev) => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Статус заявления изменен на: ${newStatus}`);
  };

  // ─── ДОБАВЛЕНИЕ НОВОГО ЗАЯВЛЕНИЯ ───
  const handleCreateStatement = (e: React.FormEvent) => {
    e.preventDefault();
    const newSt: StatementItem = {
      id: `ST-${Date.now().toString().slice(-4)}`,
      studentName: newStudentName,
      grade: '9А',
      parentName: newParentName,
      parentPhone: newParentPhone,
      dates: newDates,
      startDate: newDates.split('–')[0]?.trim() || '25.10.2026',
      endDate: newDates.split('–')[1]?.trim() || '26.10.2026',
      daysCount: 2,
      cause: newCause,
      docType: 'Электронное заявление родителя',
      status: 'Заявление принято',
      statusColor: '#10b981',
      statusBg: 'rgba(16, 185, 129, 0.12)',
      hasPhoto: true,
      docNumber: `Вх. № ${Math.floor(Math.random() * 200 + 100)}`,
      noteText: newNote,
      receivedAt: 'Сегодня, только что',
      scanType: 'handwritten'
    };

    setStatements([newSt, ...statements]);
    setShowAddModal(false);
    showToast(`Заявление для ученика ${newStudentName} успешно зарегистрировано!`);
  };

  // ─── ЭКСПОРТ CSV ТАБЕЛЯ (EXCEL) ───
  const handleExportCsv = () => {
    const headers = ['№', 'ФИО ученика', 'Пн (20.10)', 'Вт (21.10)', 'Ср (22.10)', 'Чт (23.10)', 'Пт (24.10)', 'Пропусков (болезнь)', 'Пропусков (заявления)'];
    const rows = students.map((s, idx) => {
      const dayMarks = s.days.map((d) => (d === 'present' ? '·' : d === 'sick' ? 'Б' : d === 'olympiad' ? 'О' : d === 'excused' ? 'У' : 'Н'));
      return [idx + 1, `"${s.name}"`, ...dayMarks, s.totalSick, s.totalExcused].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tabel_propuskov_9A_Okt_2026.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Табель 9А выгружен в формате Excel (.csv)');
  };

  // ─── ОФИЦИАЛЬНАЯ ГЕНЕРАЦИЯ PDF ЗАВУЧУ ───
  const handleExportPdfArchive = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = 1240 * scale;
    canvas.height = 1754 * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Фон листа
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Верхняя акцентная полоса
    ctx.fillStyle = '#0077ff';
    ctx.fillRect(36 * scale, 24 * scale, canvas.width - 72 * scale, 3 * scale);

    // Заголовок лицея
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${16 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('МАОУ «ЛИЦЕЙ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ» г. НОВОСИБИРСКА', 36 * scale, 44 * scale);

    ctx.fillStyle = '#64748b';
    ctx.font = `${11 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('Электронная приемная классного руководителя • 9А класс', 36 * scale, 58 * scale);

    const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.fillText(`Классный руководитель: Лосив Роман Борисович • Дата отчета: ${dateStr}`, 36 * scale, 72 * scale);

    // Плашка документа
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(36 * scale, 84 * scale, canvas.width - 72 * scale, 36 * scale);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(36 * scale, 84 * scale, canvas.width - 72 * scale, 36 * scale);

    ctx.fillStyle = '#0077ff';
    ctx.font = `bold ${14 * scale}px sans-serif`;
    ctx.fillText('СВОДНАЯ ВЕДОМОСТЬ ПРОПУСКОВ И ЗАЯВЛЕНИЙ РОДИТЕЛЕЙ ЗА ОКТЯБРЬ 2026 Г.', 46 * scale, 102 * scale);

    ctx.fillStyle = '#475569';
    ctx.font = `${11 * scale}px sans-serif`;
    ctx.fillText(
      `Всего в 9А: ${stats.totalStudents} уч. | Присутствуют: ${stats.presentToday} (${stats.attendancePercent}%) | Больничные: ${stats.sickToday} | Заявления: ${stats.excusedToday} | Без уважит. причины: 0`,
      46 * scale,
      113 * scale
    );

    // Раздел 1: Реестр заявлений
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${13 * scale}px sans-serif`;
    ctx.fillText('1. РЕЕСТР ПОСТУПИВШИХ ЗАЯВЛЕНИЙ И СПРАВОК С ФОТО ПОДПИСИ РОДИТЕЛЕЙ:', 36 * scale, 140 * scale);

    let y = 152 * scale;

    // Шапка таблицы заявлений
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(36 * scale, y, canvas.width - 72 * scale, 18 * scale);
    ctx.fillStyle = '#475569';
    ctx.font = `bold ${10 * scale}px sans-serif`;
    ctx.fillText('Ученик (9А)', 42 * scale, y + 12 * scale);
    ctx.fillText('Родитель / Контакт', 222 * scale, y + 12 * scale);
    ctx.fillText('Период', 372 * scale, y + 12 * scale);
    ctx.fillText('Причина пропуска', 482 * scale, y + 12 * scale);
    ctx.fillText('Статус документа', 622 * scale, y + 12 * scale);

    y += 18 * scale;

    statements.slice(0, 7).forEach((st, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(36 * scale, y, canvas.width - 72 * scale, 18 * scale);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(36 * scale, y, canvas.width - 72 * scale, 18 * scale);

      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${10 * scale}px sans-serif`;
      ctx.fillText(st.studentName, 42 * scale, y + 12 * scale);

      ctx.fillStyle = '#475569';
      ctx.font = `${9 * scale}px sans-serif`;
      ctx.fillText(st.parentName, 222 * scale, y + 12 * scale);
      ctx.fillText(st.dates, 372 * scale, y + 12 * scale);
      ctx.fillText(st.cause, 482 * scale, y + 12 * scale);

      ctx.fillStyle = st.status === 'На больничном' ? '#dc2626' : '#16a34a';
      ctx.font = `bold ${9 * scale}px sans-serif`;
      ctx.fillText(st.status, 622 * scale, y + 12 * scale);

      y += 18 * scale;
    });

    // Раздел 2: Сводка посещаемости
    y += 14 * scale;
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${13 * scale}px sans-serif`;
    ctx.fillText('2. ВЕДОМОСТЬ ДНЕВНОГО УЧЕТА ПОСЕЩАЕМОСТИ (ВЫБОРКА):', 36 * scale, y);

    y += 12 * scale;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(36 * scale, y, canvas.width - 72 * scale, 16 * scale);
    ctx.fillStyle = '#475569';
    ctx.font = `bold ${9 * scale}px sans-serif`;
    ctx.fillText('ФИО учащегося', 42 * scale, y + 11 * scale);
    ctx.fillText('20.10', 280 * scale, y + 11 * scale);
    ctx.fillText('21.10', 330 * scale, y + 11 * scale);
    ctx.fillText('22.10', 380 * scale, y + 11 * scale);
    ctx.fillText('23.10', 430 * scale, y + 11 * scale);
    ctx.fillText('24.10 (Сегодня)', 480 * scale, y + 11 * scale);
    ctx.fillText('Итог пропусков', 600 * scale, y + 11 * scale);

    y += 16 * scale;

    students.slice(0, 10).forEach((st, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(36 * scale, y, canvas.width - 72 * scale, 14 * scale);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(36 * scale, y, canvas.width - 72 * scale, 14 * scale);

      ctx.fillStyle = '#0f172a';
      ctx.font = `${9 * scale}px sans-serif`;
      ctx.fillText(st.name, 42 * scale, y + 10 * scale);

      st.days.forEach((d, dIdx) => {
        const mark = d === 'present' ? '·' : d === 'sick' ? 'Б' : d === 'olympiad' ? 'О' : d === 'excused' ? 'У' : 'Н';
        ctx.fillStyle = d === 'present' ? '#10b981' : d === 'sick' ? '#ef4444' : '#6366f1';
        ctx.font = `bold ${9 * scale}px sans-serif`;
        ctx.fillText(mark, (280 + dIdx * 50) * scale, y + 10 * scale);
      });

      ctx.fillStyle = '#64748b';
      ctx.fillText(st.totalSick > 0 ? `${st.totalSick} дн. (бол.)` : st.totalExcused > 0 ? `${st.totalExcused} дн. (заявл.)` : '0', 600 * scale, y + 10 * scale);

      y += 14 * scale;
    });

    // Подвал с подписями и штампом
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(36 * scale, canvas.height - 65 * scale, canvas.width - 72 * scale, 1 * scale);

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${10 * scale}px sans-serif`;
    ctx.fillText('Классный руководитель 9А:  Лосив Р.Б.  ___________________ (подпись)', 36 * scale, canvas.height - 48 * scale);
    ctx.fillText('Заместитель директора по УВР:  Петрова Е.В.  ___________________ (подпись)', 36 * scale, canvas.height - 34 * scale);

    // Синий штамп ЭЦП Сферум
    ctx.strokeStyle = '#0077ff';
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(canvas.width - 240 * scale, canvas.height - 60 * scale, 204 * scale, 34 * scale);
    ctx.fillStyle = '#0077ff';
    ctx.font = `bold ${8 * scale}px sans-serif`;
    ctx.fillText('ДОКУМЕНТ ПОДПИСАН ЭЦП', canvas.width - 232 * scale, canvas.height - 49 * scale);
    ctx.font = `${7 * scale}px sans-serif`;
    ctx.fillText('Сертификат: 4A8B9C0D1E2F38194', canvas.width - 232 * scale, canvas.height - 39 * scale);
    ctx.fillText('Владелец: Лосив Роман Борисович', canvas.width - 232 * scale, canvas.height - 31 * scale);

    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    pdf.save('Tabel_9A_Okt_2026_Zavuchu.pdf');
    showToast('Официальный PDF-архив успешно сформирован и скачан!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 1.2vw + 12px, 24px)' }}>
      {/* ─── ВЕРХНЯЯ ШАПКА МОДУЛЯ ─── */}
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          padding: 'clamp(18px, 1.4vw + 12px, 28px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 1vw + 8px, 18px)' }}>
          <div
            style={{
              width: 'clamp(44px, 2.5vw + 24px, 56px)',
              height: 'clamp(44px, 2.5vw + 24px, 56px)',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 119, 255, 0.25)',
              flexShrink: 0
            }}
          >
            <ClipboardList size={26} color="#ffffff" />
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 'clamp(18px, 1.3vw + 13px, 24px)',
                letterSpacing: '-0.3px',
                color: colors.textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap'
              }}
            >
              <span>Приемная 9А • Табель и заявления</span>
              <span
                style={{
                  fontSize: 12,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: colors.badgeBg,
                  color: colors.accentColor,
                  fontWeight: 700
                }}
              >
                Классное руководство
              </span>
            </div>
            <div style={{ fontSize: 'clamp(13px, 0.35vw + 11px, 15px)', color: colors.textMuted, marginTop: 4 }}>
              Учет посещаемости, заявления родителей с фото подписи и формирование сводки завучу
            </div>
          </div>
        </div>

        {/* Инструменты классного руководителя */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
              fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} color={colors.accentColor} />
            <span>Принять заявление</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 14px',
              borderRadius: 10,
              background: colors.slotBg,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
              fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Выгрузить в Excel / CSV"
          >
            <FileSpreadsheet size={16} color="#10b981" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 14px',
              borderRadius: 10,
              background: colors.slotBg,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
              fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Печать ведомости А4"
          >
            <Printer size={16} />
            <span>Печать</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdfArchive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 10,
              background: colors.accentColor,
              color: '#ffffff',
              border: 'none',
              fontSize: 'clamp(13px, 0.3vw + 11px, 15px)',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0, 119, 255, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <FileDown size={16} />
            <span>PDF-Архив завучу</span>
          </button>
        </div>
      </div>

      {/* ─── KPI СВОДКА ЗА ДЕНЬ ─── */}
      <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'clamp(10px, 1vw + 8px, 18px)' }}>
        {[
          { label: 'Всего учащихся 9А', value: `${stats.totalStudents}`, sub: '100% зачислены в Сферум', color: colors.accentColor },
          { label: 'Присутствуют сегодня', value: `${stats.presentToday}`, sub: `${stats.attendancePercent}% явка на уроках`, color: '#10b981' },
          { label: 'На больничном', value: `${stats.sickToday}`, sub: 'Иванов И. (справка №4082)', color: '#ef4444' },
          { label: 'По заявлениям / олимпиады', value: `${stats.excusedToday}`, sub: 'Васильева Д., Смирнова А.', color: '#6366f1' },
          { label: 'Без уважительной причины', value: `${stats.unexcusedToday}`, sub: '0 прогулов зафиксировано', color: '#10b981' }
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: 'clamp(14px, 1vw + 10px, 18px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', color: colors.textMuted, fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: 'clamp(24px, 1.4vw + 16px, 30px)', fontWeight: 900, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 'clamp(11px, 0.2vw + 10px, 12px)', color: colors.textSecondary }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── НАВИГАЦИЯ ПО РАЗДЕЛАМ (СУБВКЛАДКИ) ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: 4
        }}
      >
        {[
          { id: 'statements', label: `Заявления родителей (${statements.length})`, icon: <ClipboardList size={16} /> },
          { id: 'attendance', label: `Табель посещаемости 9А (28 уч.)`, icon: <Calendar size={16} /> },
          { id: 'summary', label: `Сводка и аналитика для завуча`, icon: <Award size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              background: activeSubTab === tab.id ? colors.cardBg : 'transparent',
              color: activeSubTab === tab.id ? colors.accentColor : colors.textSecondary,
              fontWeight: activeSubTab === tab.id ? 700 : 500,
              fontSize: 'clamp(13px, 0.3vw + 11px, 15px)',
              cursor: 'pointer',
              borderBottom: activeSubTab === tab.id ? `2px solid ${colors.accentColor}` : '2px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── РАЗДЕЛ 1: ЗАЯВЛЕНИЯ И СПРАВКИ РОДИТЕЛЕЙ ─── */}
      {activeSubTab === 'statements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Панель фильтров и поиска */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 14,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `Все (${statements.length})` },
                { id: 'sick', label: 'Больничные' },
                { id: 'family', label: 'Семейные' },
                { id: 'olympiad', label: 'Олимпиады' },
                { id: 'new', label: 'Новые' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setFilterCause(btn.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: filterCause === btn.id ? `1.5px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                    background: filterCause === btn.id ? colors.badgeBg : colors.slotBg,
                    color: filterCause === btn.id ? colors.accentColor : colors.textSecondary,
                    fontSize: 'clamp(12px, 0.2vw + 10px, 13px)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', minWidth: 220, flex: '1 1 240px', maxWidth: 360 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
              <input
                type="text"
                placeholder="Поиск по ученику или родителю..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 8,
                  border: `1px solid ${colors.cardBorder}`,
                  background: colors.slotBg,
                  color: colors.textPrimary,
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Список заявлений */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredStatements.map((st) => (
              <div
                key={st.id}
                onClick={() => setSelectedStatement(st)}
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 14,
                  padding: 'clamp(14px, 1vw + 10px, 18px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease, border-color 0.15s ease',
                  flexWrap: 'wrap'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.accentColor)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.cardBorder)}
              >
                {/* Левая часть: Ученик и контакты */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 240, flex: 1 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: st.statusBg,
                      color: st.statusColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <User size={20} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'clamp(14px, 0.4vw + 12px, 16px)', color: colors.textPrimary }}>
                      {st.studentName} <span style={{ fontSize: '0.85em', color: colors.textMuted, fontWeight: 500 }}>({st.grade})</span>
                    </div>
                    <div style={{ fontSize: 'clamp(11px, 0.25vw + 10px, 13px)', color: colors.textSecondary, marginTop: 2 }}>
                      {st.parentName} • <strong>{st.parentPhone}</strong>
                    </div>
                    <div style={{ fontSize: 'clamp(12px, 0.3vw + 11px, 14px)', color: colors.textPrimary, marginTop: 4 }}>
                      <span style={{ fontWeight: 700, color: colors.accentColor }}>{st.dates}</span> • <strong>{st.cause}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: 'italic', maxWidth: 640 }}>
                      «{st.noteText.length > 95 ? st.noteText.slice(0, 95) + '...' : st.noteText}»
                    </div>
                  </div>
                </div>

                {/* Правая часть: Статус, фото и действия */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 'clamp(11px, 0.2vw + 10px, 12px)',
                      background: st.statusBg,
                      color: st.statusColor,
                      fontWeight: 700,
                      border: `1px solid ${st.statusColor}33`
                    }}
                  >
                    {st.status}
                  </span>

                  <div
                    style={{
                      fontSize: 12,
                      color: colors.accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 600
                    }}
                  >
                    <Camera size={13} />
                    <span>Фото прикреплено</span>
                  </div>

                  <span style={{ fontSize: 11, color: colors.textMuted }}>
                    {st.receivedAt}
                  </span>
                </div>
              </div>
            ))}

            {filteredStatements.length === 0 && (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  background: colors.cardBg,
                  borderRadius: 14,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textMuted
                }}
              >
                Заявлений по выбранным критериям не найдено.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── РАЗДЕЛ 2: ИНТЕРАКТИВНЫЙ ТАБЕЛЬ ПОСЕЩАЕМОСТИ ─── */}
      {activeSubTab === 'attendance' && (
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 16,
            padding: 'clamp(18px, 1.4vw + 12px, 28px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {/* Заголовок табеля */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 0.8vw + 13px, 20px)', color: colors.textPrimary }}>
                Табель посещаемости 9А класса за октябрь 2026 г.
              </div>
              <div style={{ fontSize: 'clamp(12px, 0.3vw + 11px, 14px)', color: colors.textMuted, marginTop: 2 }}>
                Нажмите на ячейку за 24.10 (сегодня), чтобы быстро изменить статус присутствия ученика
              </div>
            </div>

            {/* Легенда отметок */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>·</span>
                Присутствует
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>Б</span>
                Болезнь
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>У</span>
                Заявление
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>О</span>
                Олимпиада
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>Н</span>
                Прогул
              </span>
            </div>
          </div>

          {/* Таблица посещаемости */}
          <div style={{ overflowX: 'auto', border: `1px solid ${colors.cardBorder}`, borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(12px, 0.3vw + 11px, 14px)', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: colors.slotBg, borderBottom: `2px solid ${colors.cardBorder}`, color: colors.textSecondary, fontSize: 12 }}>
                  <th style={{ padding: '10px 12px', width: 40 }}>№</th>
                  <th style={{ padding: '10px 12px' }}>ФИО учащегося</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', width: 65 }}>Пн (20.10)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', width: 65 }}>Вт (21.10)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', width: 65 }}>Ср (22.10)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', width: 65 }}>Чт (23.10)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', width: 90, background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)', color: colors.accentColor, fontWeight: 700 }}>
                    Пт (24.10) • Сегодня
                  </th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: 120 }}>Итог пропусков</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => (
                  <tr
                    key={st.id}
                    style={{
                      borderBottom: `1px solid ${colors.cardBorder}`,
                      background: idx % 2 === 0 ? 'transparent' : colors.slotBg
                    }}
                  >
                    <td style={{ padding: '10px 12px', color: colors.textMuted }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: colors.textPrimary }}>
                      {st.name}
                    </td>

                    {/* Дни недели */}
                    {st.days.slice(0, 4).map((d, dIdx) => {
                      const mark = d === 'present' ? '·' : d === 'sick' ? 'Б' : d === 'olympiad' ? 'О' : d === 'excused' ? 'У' : 'Н';
                      const bg = d === 'present' ? '#dcfce7' : d === 'sick' ? '#fee2e2' : d === 'olympiad' ? '#e0e7ff' : d === 'excused' ? '#ede9fe' : '#fef3c7';
                      const color = d === 'present' ? '#16a34a' : d === 'sick' ? '#dc2626' : d === 'olympiad' ? '#4338ca' : d === 'excused' ? '#7c3aed' : '#b45309';

                      return (
                        <td key={dIdx} style={{ padding: '6px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', width: 26, height: 26, borderRadius: 6, background: bg, color, alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {mark}
                          </span>
                        </td>
                      );
                    })}

                    {/* Сегодня (24.10) — интерактивная кликабельная ячейка */}
                    <td style={{ padding: '6px', textAlign: 'center', background: isLight ? 'rgba(0, 119, 255, 0.04)' : 'rgba(0, 119, 255, 0.08)' }}>
                      {(() => {
                        const d = st.days[4];
                        const mark = d === 'present' ? '·' : d === 'sick' ? 'Б' : d === 'olympiad' ? 'О' : d === 'excused' ? 'У' : 'Н';
                        const bg = d === 'present' ? '#dcfce7' : d === 'sick' ? '#fee2e2' : d === 'olympiad' ? '#e0e7ff' : d === 'excused' ? '#ede9fe' : '#fef3c7';
                        const color = d === 'present' ? '#16a34a' : d === 'sick' ? '#dc2626' : d === 'olympiad' ? '#4338ca' : d === 'excused' ? '#7c3aed' : '#b45309';

                        return (
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(st.id)}
                            title="Нажмите для переключения (Присутствует → Болезнь → Заявление → Прогул)"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              background: bg,
                              color,
                              border: `1.5px solid ${color}66`,
                              fontWeight: 'bold',
                              fontSize: 14,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                            }}
                          >
                            {mark}
                          </button>
                        );
                      })()}
                    </td>

                    {/* Итог */}
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: colors.textSecondary, fontSize: 12 }}>
                      {st.totalSick > 0 ? (
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>{st.totalSick} дн. (бол.)</span>
                      ) : st.totalExcused > 0 ? (
                        <span style={{ color: '#6366f1', fontWeight: 700 }}>{st.totalExcused} дн. (заявл.)</span>
                      ) : (
                        <span style={{ color: '#10b981' }}>0 пропусков</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── РАЗДЕЛ 3: СВОДКА И АНАЛИТИКА ДЛЯ ЗАВУЧА ─── */}
      {activeSubTab === 'summary' && (
        <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'start' }}>
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: 'clamp(18px, 1.4vw + 12px, 26px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 0.8vw + 13px, 20px)', color: colors.textPrimary }}>
              Аналитическая записка к табелю за октябрь 2026 г.
            </div>

            <div style={{ color: colors.textPrimary, lineHeight: 1.6, fontSize: 'clamp(13px, 0.35vw + 11px, 15px)' }}>
              В 9А классе на 24 октября 2026 года обучается <strong>28 учащихся</strong>. Все учащиеся зарегистрированы в цифровой экосистеме Сферум.
              <br /><br />
              <strong>1. Показатели посещаемости:</strong>
              <ul style={{ paddingLeft: 20, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>Средняя посещаемость по классу: <strong>96.4%</strong> (соответствует высшей категории).</li>
                <li>Пропусков по болезни: <strong>22 человеко-дня</strong> (подтверждены медицинскими справками).</li>
                <li>Пропусков по заявлениям родителей: <strong>8 человеко-дней</strong> (семейные обстоятельства, согласовано).</li>
                <li>Пропусков в связи с олимпиадами: <strong>4 человеко-дня</strong> (приказ директора № 142-ОД).</li>
                <li>Пропусков без уважительной причины: <strong>0 часов</strong>.</li>
              </ul>
              <br />
              <strong>2. Работа с родителями:</strong>
              <div>
                Все заявления поступают в электронном виде с прикреплением фотографий рукописных подписей. Конфликтных ситуаций и невыясненных неявок в октябре не зафиксировано.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={handleExportPdfArchive}
                style={{
                  padding: '11px 18px',
                  borderRadius: 10,
                  background: colors.accentColor,
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <FileDown size={16} />
                <span>Скачать сводный PDF завучу</span>
              </button>

              <button
                type="button"
                onClick={() => showToast('Отчет отправлен в приемную завуча по УВР Петровой Е.В.')}
                style={{
                  padding: '11px 16px',
                  borderRadius: 10,
                  background: colors.slotBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Send size={15} color={colors.accentColor} />
                <span>Отправить завучу в Сферум</span>
              </button>
            </div>
          </div>

          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: 'clamp(18px, 1.4vw + 12px, 26px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 'clamp(15px, 0.6vw + 13px, 18px)', color: colors.textPrimary }}>
              Официальные реквизиты отчета
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ padding: 10, borderRadius: 8, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                <span style={{ color: colors.textMuted, display: 'block', fontSize: 11 }}>Образовательная организация:</span>
                <strong style={{ color: colors.textPrimary }}>МАОУ «Лицей Информационных Технологий» г. Новосибирска</strong>
              </div>

              <div style={{ padding: 10, borderRadius: 8, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                <span style={{ color: colors.textMuted, display: 'block', fontSize: 11 }}>Классный руководитель:</span>
                <strong style={{ color: colors.textPrimary }}>Лосив Роман Борисович (9А класс)</strong>
              </div>

              <div style={{ padding: 10, borderRadius: 8, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                <span style={{ color: colors.textMuted, display: 'block', fontSize: 11 }}>Цифровая подпись (ЭЦП):</span>
                <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <ShieldCheck size={14} /> Подписано в Сферум (ID #8849201)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── МОДАЛЬНОЕ ОКНО ПРОСМОТРА ЗАЯВЛЕНИЯ И ФОТО СКАНА ─── */}
      {selectedStatement && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setSelectedStatement(null)}
        >
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 20,
              maxWidth: 880,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка модального окна */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: `1px solid ${colors.cardBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: selectedStatement.statusBg, color: selectedStatement.statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: colors.textPrimary }}>
                    {selectedStatement.studentName} — {selectedStatement.cause}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>
                    {selectedStatement.docType} • {selectedStatement.docNumber || 'Без номера'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStatement(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: `1px solid ${colors.cardBorder}`,
                  background: colors.slotBg,
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Тело модального окна */}
            <div className="responsive-split-grid" style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {/* Левая колонка: Данные родителя и заявления */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 14, borderRadius: 12, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                  <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Родитель (заявитель):</span>
                  <div style={{ fontWeight: 700, fontSize: 15, color: colors.textPrimary, marginTop: 2 }}>{selectedStatement.parentName}</div>
                  <div style={{ fontSize: 13, color: colors.accentColor, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} />
                    <a href={`tel:${selectedStatement.parentPhone}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                      {selectedStatement.parentPhone}
                    </a>
                  </div>
                </div>

                <div style={{ padding: 14, borderRadius: 12, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                  <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Период отсутствия:</span>
                  <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary, marginTop: 2 }}>
                    {selectedStatement.dates}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Причина: <strong>{selectedStatement.cause}</strong>
                  </div>
                </div>

                <div style={{ padding: 14, borderRadius: 12, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                  <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Текст записки / заявления:</span>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: colors.textPrimary, marginTop: 6, fontStyle: 'italic' }}>
                    «{selectedStatement.noteText}»
                  </div>
                </div>

                {/* Управление статусом */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>Изменить статус документа:</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatementStatus(selectedStatement.id, 'Заявление принято')}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#16a34a',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Принять
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatementStatus(selectedStatement.id, 'На больничном')}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#dc2626',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      + Больничный
                    </button>
                  </div>
                </div>
              </div>

              {/* Правая колонка: Реалистичный документ (фото / скан) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>
                  Прикрепленный скан с подписью родителя:
                </span>

                <div
                  style={{
                    background: '#fefefe',
                    color: '#000000',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: 20,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontFamily: selectedStatement.scanType === 'handwritten' ? 'serif' : 'sans-serif',
                    position: 'relative',
                    minHeight: 340,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Документ: Медицинская справка */}
                  {selectedStatement.scanType === 'medical' && (
                    <div>
                      <div style={{ textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: 6, marginBottom: 12 }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Министерство Здравоохранения РФ</div>
                        <div style={{ fontSize: 12, fontWeight: 'bold' }}>ГБУЗ НСО «Городская поликлиника № 1»</div>
                        <div style={{ fontSize: 9, color: '#555' }}>г. Новосибирск, Красный проспект, 3</div>
                      </div>
                      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 14, margin: '8px 0' }}>
                        СПРАВКА {selectedStatement.docNumber}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                        Дана учащемуся: <strong>{selectedStatement.studentName}</strong>, 9А класс МАОУ ЛИТ.<br />
                        Диагноз: ОРВИ, ринофарингит средней степени тяжести.<br />
                        Освобожден(а) от занятий с <strong>{selectedStatement.startDate}</strong> по <strong>{selectedStatement.endDate}</strong>.<br />
                        К занятиям приступить: 28 сентября 2026 г.<br />
                        Освобождение от уроков физкультуры: 14 дней.
                      </div>
                      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: 11 }}>Врач-педиатр: Соколова М.В.</div>
                          <div style={{ fontSize: 10, color: '#666' }}>Дата выдачи: {selectedStatement.startDate}</div>
                        </div>
                        {/* Синий круглый штамп врача */}
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            border: '2px solid #1d4ed8',
                            color: '#1d4ed8',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 8,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            transform: 'rotate(-8deg)',
                            opacity: 0.85
                          }}
                        >
                          <div>ВРАЧ</div>
                          <div>ДЛЯ СПРАВОК</div>
                          <div>№ 4082</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Документ: Рукописное заявление */}
                  {selectedStatement.scanType === 'handwritten' && (
                    <div>
                      <div style={{ textAlign: 'right', fontSize: 12, lineHeight: 1.4, marginBottom: 16 }}>
                        Классному руководителю 9А класса<br />
                        МАОУ ЛИТ г. Новосибирска<br />
                        Лосиву Р.Б.<br />
                        от {selectedStatement.parentName}<br />
                        тел. {selectedStatement.parentPhone}
                      </div>
                      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 14, margin: '14px 0' }}>
                        ЗАЯВЛЕНИЕ
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.6, textIndent: 20 }}>
                        {selectedStatement.noteText}
                      </div>
                      <div style={{ marginTop: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 12 }}>{selectedStatement.startDate} г.</div>
                        <div style={{ fontSize: 13, fontStyle: 'italic', fontWeight: 'bold', color: '#1e3a8a' }}>
                          Подпись: {selectedStatement.parentName.split(' ')[0]} / Смирнов /
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Документ: Приказ директора */}
                  {selectedStatement.scanType === 'order' && (
                    <div>
                      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 6, marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 'bold' }}>МУНИЦИПАЛЬНОЕ АВТОНОМНОЕ ОБЩЕОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ</div>
                        <div style={{ fontSize: 13, fontWeight: 'bold' }}>«ЛИЦЕЙ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ»</div>
                      </div>
                      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 14, margin: '8px 0' }}>
                        ПРИКАЗ {selectedStatement.docNumber}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                        О командировании учащегося 9А класса {selectedStatement.studentName} на муниципальный этап олимпиады / соревнования.<br /><br />
                        ПРИКАЗЫВАЮ:<br />
                        1. Освободить учащегося {selectedStatement.studentName} от учебных занятий на период с {selectedStatement.startDate} по {selectedStatement.endDate}.<br />
                        2. Классному руководителю Лосиву Р.Б. внести пропуски в табель как уважительные.<br />
                        3. Контроль исполнения приказа оставляю за собой.
                      </div>
                      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: 11 }}>Директор МАОУ ЛИТ: Игнатьев В.А.</div>
                        </div>
                        <div
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: '50%',
                            border: '2px dashed #0055cc',
                            color: '#0055cc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 9,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            transform: 'rotate(12deg)'
                          }}
                        >
                          ПЕЧАТЬ ЛИЦЕЯ
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Документ: Записка с талоном */}
                  {selectedStatement.scanType === 'note' && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: 6, marginBottom: 12 }}>
                        Электронный талон и записка из Сферум-чата
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                        «{selectedStatement.noteText}»
                      </div>
                      <div style={{ marginTop: 20, padding: 12, background: '#f1f5f9', borderRadius: 6, border: '1px dashed #94a3b8' }}>
                        <div style={{ fontSize: 11, fontWeight: 'bold' }}>ТАЛОН К ВРАЧУ № 8492</div>
                        <div style={{ fontSize: 11 }}>Пациент: {selectedStatement.studentName}</div>
                        <div style={{ fontSize: 11 }}>Дата и время: 24.10.2026 в 08:30</div>
                        <div style={{ fontSize: 11 }}>Кабинет № 204 (Детское отделение)</div>
                      </div>
                      <div style={{ marginTop: 24, textAlign: 'right', fontSize: 11, color: '#555' }}>
                        Получено через чат Сферума в 07:15
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Скан документа отправлен на печать');
                      window.print();
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.textPrimary,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Printer size={14} />
                    <span>Распечатать скан</span>
                  </button>

                  <a
                    href={`https://sferum.ru`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: colors.accentColor,
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <MessageSquare size={14} />
                    <span>Написать родителю в Сферум</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ЗАЯВЛЕНИЯ ─── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 20,
              maxWidth: 520,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
                Принять заявление родителя (9А класс)
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStatement} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                  Ученик 9А класса:
                </label>
                <select
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 14
                  }}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                  Причина отсутствия:
                </label>
                <select
                  value={newCause}
                  onChange={(e) => setNewCause(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 14
                  }}
                >
                  <option value="Болезнь (ОРВИ)">Болезнь (ОРВИ)</option>
                  <option value="Семейные обстоятельства">Семейные обстоятельства</option>
                  <option value="Олимпиада (Всеросс)">Олимпиада (Всеросс)</option>
                  <option value="Плановый прием у врача">Плановый прием у врача</option>
                  <option value="Соревнования">Соревнования</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                    Даты пропуска:
                  </label>
                  <input
                    type="text"
                    value={newDates}
                    onChange={(e) => setNewDates(e.target.value)}
                    placeholder="25.10 – 26.10"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${colors.cardBorder}`,
                      background: colors.slotBg,
                      color: colors.textPrimary,
                      fontSize: 13
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                    Телефон родителя:
                  </label>
                  <input
                    type="text"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    placeholder="+7 913..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${colors.cardBorder}`,
                      background: colors.slotBg,
                      color: colors.textPrimary,
                      fontSize: 13
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                  ФИО родителя:
                </label>
                <input
                  type="text"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="Иванова О.Н."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 13
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                  Текст записки / комментарий:
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 13,
                    resize: 'none'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textSecondary,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    background: colors.accentColor,
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Зарегистрировать заявление
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ВСПЛЫВАЮЩИЙ ТОСТ УВЕДОМЛЕНИЙ ─── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 9999,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── СКРЫТЫЙ БЛОК ДЛЯ ПЕЧАТИ А4 (#classmaster-printable-report) ─── */}
      <div
        id="classmaster-printable-report"
        style={{
          display: 'none',
          padding: 28,
          fontFamily: 'serif',
          background: '#ffffff',
          color: '#000000'
        }}
      >
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: 10, marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>МАОУ «Лицей Информационных Технологий» г. Новосибирска</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>
            Сводная ведомость посещаемости и реестр заявлений • 9А класс • Октябрь 2026 г.
          </p>
        </div>

        <div style={{ marginBottom: 16, fontSize: 12 }}>
          <strong>Классный руководитель:</strong> Лосив Роман Борисович &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>Всего учащихся:</strong> {stats.totalStudents} &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>Явка сегодня:</strong> {stats.presentToday} ({stats.attendancePercent}%)
        </div>

        <h3 style={{ fontSize: 14, borderBottom: '1px solid #000', paddingBottom: 4, marginBottom: 8 }}>
          1. Реестр поданных заявлений и медицинских справок
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 20 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '4px' }}>Ученик</th>
              <th style={{ textAlign: 'left', padding: '4px' }}>Родитель / Контакт</th>
              <th style={{ textAlign: 'left', padding: '4px' }}>Период</th>
              <th style={{ textAlign: 'left', padding: '4px' }}>Причина</th>
              <th style={{ textAlign: 'left', padding: '4px' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {statements.map((st) => (
              <tr key={st.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>{st.studentName}</td>
                <td style={{ padding: '4px' }}>{st.parentName} ({st.parentPhone})</td>
                <td style={{ padding: '4px' }}>{st.dates}</td>
                <td style={{ padding: '4px' }}>{st.cause}</td>
                <td style={{ padding: '4px' }}>{st.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <div>Классный руководитель: ______________ / Лосив Р.Б. /</div>
          <div>Завуч по УВР: ______________ / Петрова Е.В. /</div>
        </div>
      </div>
    </div>
  );
};

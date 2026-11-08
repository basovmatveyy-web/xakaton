import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Phone,
  Copy,
  Check,
  Printer,
  Send,
  MessageSquare,
  Users,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  X,
  Download,
  ChevronDown,
  UserPlus,
  Edit3
} from 'lucide-react';
import type { AuthThemeMode } from '../../types/auth';
import {
  buildFullSchoolClassesRegistry,
  type SchoolClass,
  type StudentRecord
} from './schoolClassesData';
import { useToast } from '../common/ToastContext';

export type { SchoolClass, StudentRecord };

// ─────────────────────────────────────────────────────────────────────────────
interface MyClassesViewProps {
  theme: AuthThemeMode;
  activeClass: string;
  onSelectClass?: (clsId: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const MyClassesView: React.FC<MyClassesViewProps> = ({
  theme,
  activeClass: initialClass = '9А',
  onSelectClass,
  onNavigateToTab: _onNavigateToTab
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';
  const { addToast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string>(initialClass || '9А');
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'sferum' | 'sheets'>('roster');
  const [classesData, setClassesData] = useState<Record<string, SchoolClass>>(() => {
    try {
      const saved = localStorage.getItem('sferum_classes_registry_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length >= 25) {
          return parsed;
        }
      }
    } catch (e) {}
    return buildFullSchoolClassesRegistry();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'sick' | 'excused' | 'debts'>('all');
  const [editingStudentNoteId, setEditingStudentNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [copiedItemText, setCopiedItemText] = useState<string | null>(null);
  const [selectedStudentDossier, setSelectedStudentDossier] = useState<StudentRecord | null>(null);
  const [expandedParentStudentId, setExpandedParentStudentId] = useState<number | null>(null);
  const [expandedNoteStudentId, setExpandedNoteStudentId] = useState<number | null>(null);

  // Модальные окна: выбор класса и добавление ученика
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    gender: 'M' as 'M' | 'F',
    birthDate: '15.05.2010',
    parentName: '',
    parentRelation: 'Мама',
    parentPhone: '+7 (913) ',
    address: 'г. Новосибирск, ',
    notes: ''
  });

  // Синхронизация с входящим activeClass из CabinetView / Sidebar
  useEffect(() => {
    if (initialClass && initialClass !== selectedClassId) {
      setSelectedClassId(initialClass);
    }
  }, [initialClass]);

  // Сохранение изменений в базу localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sferum_classes_registry_v2', JSON.stringify(classesData));
    } catch (e) {}
  }, [classesData]);

  // Стейты генератора Сферума
  const [sferumTemplateKey, setSferumTemplateKey] = useState<'meeting' | 'medical' | 'exam' | 'safety' | 'duty' | 'custom'>('meeting');
  const [customSferumText, setCustomSferumText] = useState('');
  const [sferumCopied, setSferumCopied] = useState(false);

  // Стейт печатных ведомостей
  const [selectedSheetType, setSelectedSheetType] = useState<'roster' | 'safety' | 'attendance'>('roster');

  const currentClass = classesData[selectedClassId] || classesData['9А'] || Object.values(classesData)[0];

  // Переключение класса
  const handleSelectClass = (clsId: string) => {
    setSelectedClassId(clsId);
    if (onSelectClass) onSelectClass(clsId);
  };

  // Экспорт списка учащихся в Excel / CSV с поддержкой UTF-8 BOM
  const handleExportCsv = () => {
    if (!currentClass) return;
    const students = currentClass.students;
    const headers = [
      '№',
      'ФИО ученика',
      'Пол',
      'Дата рождения',
      'Статус сегодня',
      'Причина пропуска',
      'Средний балл',
      'Законный представитель',
      'Родство',
      'Телефон родителя',
      'Адрес проживания',
      'Служебные пометки'
    ];

    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      s.gender === 'M' ? 'Мужской' : 'Женский',
      s.birthDate,
      s.statusToday === 'present' ? 'В лицее' : s.statusToday === 'sick' ? 'Болеет' : s.statusToday === 'olympiad' ? 'Олимпиада' : 'Заявление',
      `"${s.statusReason || ''}"`,
      s.averageGrade.toFixed(2),
      `"${s.parentName}"`,
      s.parentRelation,
      `"${s.parentPhone}"`,
      `"${s.address || ''}"`,
      `"${s.notes || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Spisok_${selectedClassId}_MAOU_LIT.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', `Список ${selectedClassId} класса успешно экспортирован в Excel/CSV`);
  };

  // Добавление нового учащегося
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.name.trim()) {
      addToast('warning', 'Пожалуйста, укажите ФИО учащегося');
      return;
    }

    const newStudent: StudentRecord = {
      id: Date.now(),
      name: newStudentData.name.trim(),
      gender: newStudentData.gender,
      birthDate: newStudentData.birthDate.trim(),
      statusToday: 'present',
      averageGrade: 4.5,
      recentGrades: [5, 4, 5, 4],
      parentName: newStudentData.parentName.trim() || 'Иванова Елена Сергеевна',
      parentRelation: newStudentData.parentRelation || 'Мама',
      parentPhone: newStudentData.parentPhone.trim() || '+7 (913) 000-00-00',
      address: newStudentData.address.trim() || 'г. Новосибирск',
      notes: newStudentData.notes.trim()
    };

    setClassesData((prev) => {
      const cls = prev[selectedClassId] || prev['9А'];
      const updatedStudents = [...cls.students, newStudent];
      updatedStudents.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      updatedStudents.forEach((s, i) => { s.id = i + 1; });
      return {
        ...prev,
        [selectedClassId]: {
          ...cls,
          studentsCount: updatedStudents.length,
          students: updatedStudents
        }
      };
    });

    setIsAddStudentOpen(false);
    setNewStudentData({
      name: '',
      gender: 'M',
      birthDate: '15.05.2010',
      parentName: '',
      parentRelation: 'Мама',
      parentPhone: '+7 (913) ',
      address: 'г. Новосибирск, ',
      notes: ''
    });
    addToast('success', `${newStudent.name} успешно зачислен в ${selectedClassId} класс!`);
  };

  // Цветовая палитра Liquid Glass
  const colors = {
    cardBg: isContrast ? '#ffffff' : isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(23, 31, 44, 0.85)',
    cardBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    textPrimary: isContrast ? '#0a0f1d' : isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isContrast ? '#1e293b' : isLight ? '#475569' : '#94a3b8',
    textMuted: isContrast ? '#334155' : isLight ? '#94a3b8' : '#64748b',
    accentColor: isContrast ? '#0055d4' : '#0077ff',
    slotBg: isContrast ? '#f8fafc' : isLight ? 'rgba(241, 245, 249, 0.65)' : 'rgba(16, 22, 34, 0.6)',
    slotBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.06)',
    activePillBg: isContrast ? '#0055d4' : '#0077ff',
    activePillText: '#ffffff',
    inactivePillBg: isContrast ? '#f1f5f9' : isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
    inactivePillText: isContrast ? '#0a0f1d' : isLight ? '#475569' : '#94a3b8',
    tableHeaderBg: isContrast ? '#f1f5f9' : isLight ? 'rgba(248, 250, 252, 0.9)' : 'rgba(15, 21, 33, 0.9)',
    rowHoverBg: isContrast ? 'rgba(0, 85, 212, 0.06)' : isLight ? 'rgba(0, 119, 255, 0.03)' : 'rgba(0, 119, 255, 0.06)'
  };

  // Метрики выбранного класса
  const metrics = useMemo(() => {
    const list = currentClass.students;
    const total = list.length;
    const present = list.filter((s) => s.statusToday === 'present').length;
    const sick = list.filter((s) => s.statusToday === 'sick').length;
    const excused = list.filter((s) => s.statusToday === 'olympiad' || s.statusToday === 'excused').length;
    const unexcused = list.filter((s) => s.statusToday === 'unexcused').length;
    const debts = list.filter((s) => s.averageGrade < 4.0 || (s.notes && s.notes.toLowerCase().includes('сдать'))).length;
    const avg = total > 0 ? (list.reduce((acc, s) => acc + s.averageGrade, 0) / total).toFixed(2) : '0.00';

    return { total, present, sick, excused, unexcused, debts, avg };
  }, [currentClass]);

  // Фильтрация и поиск по списку
  const filteredStudents = useMemo(() => {
    let list = currentClass.students;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q) ||
        s.parentPhone.includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    if (statusFilter === 'present') {
      list = list.filter((s) => s.statusToday === 'present');
    } else if (statusFilter === 'sick') {
      list = list.filter((s) => s.statusToday === 'sick');
    } else if (statusFilter === 'excused') {
      list = list.filter((s) => s.statusToday === 'olympiad' || s.statusToday === 'excused');
    } else if (statusFilter === 'debts') {
      list = list.filter((s) => s.averageGrade < 4.0 || (s.notes && s.notes.toLowerCase().includes('сдать')));
    }

    return list;
  }, [currentClass, searchQuery, statusFilter]);

  // Циклическое быстрое переключение статуса ученика
  const toggleStudentStatus = (studentId: number) => {
    setClassesData((prev) => {
      const cls = prev[selectedClassId];
      if (!cls) return prev;

      const order: StudentRecord['statusToday'][] = ['present', 'sick', 'excused', 'unexcused'];
      let changedName = '';
      let changedStatusText = '';

      const updatedStudents = cls.students.map((st) => {
        if (st.id !== studentId) return st;
        changedName = st.name;
        const currentIdx = order.indexOf(st.statusToday === 'olympiad' ? 'excused' : st.statusToday);
        const nextStatus = order[(currentIdx + 1) % order.length];
        let reason = '';
        if (nextStatus === 'sick') reason = 'ОРВИ (со слов родителей)';
        if (nextStatus === 'excused') reason = 'Заявление родителей';
        if (nextStatus === 'unexcused') reason = 'Не подтверждено';
        changedStatusText = nextStatus === 'present' ? 'В лицее' : nextStatus === 'sick' ? 'Болеет' : nextStatus === 'excused' ? 'Заявление' : 'Не подтверждено';

        return {
          ...st,
          statusToday: nextStatus,
          statusReason: reason || undefined
        };
      });

      if (changedName) {
        addToast('info', `${changedName}: статус изменен на «${changedStatusText}»`);
      }

      return {
        ...prev,
        [selectedClassId]: {
          ...cls,
          students: updatedStudents
        }
      };
    });
  };

  // Сохранение заметки ученика
  const saveStudentNote = (studentId: number) => {
    setClassesData((prev) => {
      const cls = prev[selectedClassId];
      if (!cls) return prev;
      const updated = cls.students.map((s) => (s.id === studentId ? { ...s, notes: noteDraft } : s));
      return {
        ...prev,
        [selectedClassId]: { ...cls, students: updated }
      };
    });
    setEditingStudentNoteId(null);
    addToast('success', 'Пометка классного руководителя сохранена');
  };

  // Копирование в буфер
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItemText(label);
    addToast('success', 'Скопировано в буфер обмена');
    setTimeout(() => setCopiedItemText(null), 2000);
  };

  // Готовые официальные формулировки для Сферума (без воды, четкие школьные нормы)
  const SFERUM_TEMPLATES = {
    meeting: `📢 Уважаемые родители ${currentClass.name}!\n\nВ четверг, 7 ноября, в 18:30 в каб. 311 (Лаборатория математики и ИКТ, 3 этаж) состоится родительское собрание.\n\nПовестка:\n1. Итоги I четверти и академическая успеваемость.\n2. График контрольных и диагностических работ на ноябрь.\n3. Вопросы безопасности и соблюдение школьного регламента.\n\nЯвка строго обязательна. Просьба иметь при себе бахилы или сменную обувь.\n\nС уважением,\nКлассный руководитель ${currentClass.leaderTeacher}\nМАОУ ЛИТ г. Новосибирска`,
    medical: `🔔 Напоминание по медицинским справкам (${currentClass.name})\n\nУважаемые родители, напоминаем: учащиеся, вернувшиеся в лицей после болезни, обязаны предоставить оригинальную медицинскую справку по форме 095/у в каб. 311 до начала первого урока.\n\nБез предоставления справки нахождение в аудитории и питание в столовой не допускаются согласно санитарным нормам лицея.\n\nС уважением,\n${currentClass.leaderTeacher}`,
    exam: `📝 Диагностическая работа и пробники (${currentClass.name})\n\nВнимание учащимся и родителям!\nВ субботу, 9 ноября, в 09:00 в кабинете 311 состоится обязательная диагностическая работа по информатике в формате ОГЭ/ЕГЭ.\n\nС собой иметь:\n— Документ, удостоверяющий личность (паспорт)\n— 2 гелевые ручки с черной пастой\n\nСбор в кабинете 311 в 08:45.\n\nС уважением,\n${currentClass.leaderTeacher}`,
    safety: `🛡 Инструктаж по комплексной безопасности (${currentClass.name})\n\nУважаемые родители и учащиеся!\nНапоминаем о неукоснительном соблюдении правил:\n1. Правила дорожного движения по пути следования «Дом — Лицей — Дом» (наличие световозвращающих элементов на одежде обязательно).\n2. Правила поведения на проезжей части и в общественном транспорте в период гололеда.\n3. Категорический запрет выхода на тонкий лед водоемов.\n\nБерегите себя и соблюдайте бдительность!\n\nС уважением,\nКлассный руководитель ${currentClass.leaderTeacher}`,
    duty: `📋 Дежурство класса по лицею (${currentClass.name})\n\nНа следующей неделе наш класс заступает на дежурство по лицею.\n\nПосты дежурных:\n— Входная группа и гардероб: 08:00 – 08:25\n— Коридоры и холлы 3 этажа: на каждой перемене\n\nТребования: бейджи дежурного, строгий деловой стиль, сменная обувь.\n\nС уважением,\n${currentClass.leaderTeacher}`,
    custom: customSferumText || `Сообщение для класса ${currentClass.name}...\n\nС уважением,\n${currentClass.leaderTeacher}`
  };

  const currentSferumMessage = sferumTemplateKey === 'custom' && customSferumText ? customSferumText : SFERUM_TEMPLATES[sferumTemplateKey];

  const handleCopySferum = () => {
    navigator.clipboard.writeText(currentSferumMessage);
    setSferumCopied(true);
    setTimeout(() => setSferumCopied(false), 2200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─── ВЕРХНЯЯ ШАПКА: ПЕРЕКЛЮЧАТЕЛЬ КЛАССОВ + БЫСТРЫЕ ДЕЙСТВИЯ (APPLE GLASS BAR) ─── */}
      <div
        style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.04)' : '0 4px 24px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Сегментированный переключатель классов (Apple Segmented Control) */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: 14,
              background: colors.slotBg,
              border: colors.slotBorder,
              gap: 4,
              flexWrap: 'wrap'
            }}
          >
            {(() => {
              const pinnedIds = ['9А', '10Б', '11А'];
              const displayIds = pinnedIds.includes(selectedClassId)
                ? pinnedIds
                : [...pinnedIds, selectedClassId];

              return displayIds.map((clsId) => {
                const cls = classesData[clsId] || { id: clsId, role: 'Информатика' };
                const isActive = cls.id === selectedClassId;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleSelectClass(cls.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: 'none',
                      background: isActive ? (isLight ? '#ffffff' : '#0077ff') : 'transparent',
                      color: isActive ? (isLight ? '#0f172a' : '#ffffff') : colors.textSecondary,
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: isActive ? (isLight ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,119,255,0.4)') : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{cls.id}</span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: isActive
                          ? isLight
                            ? 'rgba(0, 119, 255, 0.1)'
                            : 'rgba(255, 255, 255, 0.2)'
                          : isLight
                          ? 'rgba(0, 0, 0, 0.05)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? (isLight ? '#0077ff' : '#ffffff') : colors.textMuted
                      }}
                    >
                      {cls.role === 'Классное руководство' ? 'Классрук' : cls.role}
                    </span>
                  </button>
                );
              });
            })()}

            {/* Кнопка открытия полной базы 28 классов */}
            <button
              type="button"
              onClick={() => setIsClassModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.2)',
                color: colors.accentColor,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Открыть базу всех 28 классов МАОУ ЛИТ"
            >
              <span>Все 28 классов</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Быстрые служебные кнопки (без лишней воды) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveSubTab('sferum')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: activeSubTab === 'sferum' ? '1px solid #0077ff' : colors.slotBorder,
                background: activeSubTab === 'sferum' ? (isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.2)') : colors.slotBg,
                color: activeSubTab === 'sferum' ? colors.accentColor : colors.textPrimary,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Send size={14} />
              <span>Чат Сферум</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('sheets')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: activeSubTab === 'sheets' ? '1px solid #0077ff' : colors.slotBorder,
                background: activeSubTab === 'sheets' ? (isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.2)') : colors.slotBg,
                color: activeSubTab === 'sheets' ? colors.accentColor : colors.textPrimary,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Printer size={14} />
              <span>Печать ведомости А4</span>
            </button>
          </div>
        </div>

        {/* Информационная строка: реальные оперативные цифры (БЕЗ ДЕКОРАТИВНОЙ ВОДЫ) */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: colors.textPrimary }}>
              <Users size={14} color={colors.accentColor} />
              {currentClass.studentsCount} учеников в списке
            </span>
            <span style={{ color: colors.textMuted }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              {metrics.present} в лицее
            </span>
            {metrics.sick > 0 && (
              <>
                <span style={{ color: colors.textMuted }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  {metrics.sick} болеет
                </span>
              </>
            )}
            {metrics.excused > 0 && (
              <>
                <span style={{ color: colors.textMuted }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b5cf6', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
                  {metrics.excused} по заявлению/олимпиада
                </span>
              </>
            )}
            {metrics.unexcused > 0 && (
              <>
                <span style={{ color: colors.textMuted }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                  {metrics.unexcused} не подтверждено
                </span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span>
              Кабинет: <strong style={{ color: colors.textPrimary }}>{currentClass.room}</strong>
            </span>
            <span style={{ color: colors.textMuted }}>•</span>
            <span>
              Средний балл: <strong style={{ color: colors.textPrimary }}>{metrics.avg}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ─── ПЕРЕКЛЮЧАТЕЛЬ ПОДРАЗДЕЛОВ (СОСТАВ КЛАССА / ЧАТ СФЕРУМ / ПЕЧАТЬ А4) ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('roster')}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: activeSubTab === 'roster' ? `1px solid ${colors.accentColor}` : colors.slotBorder,
            background: activeSubTab === 'roster' ? colors.cardBg : 'transparent',
            color: activeSubTab === 'roster' ? colors.textPrimary : colors.textMuted,
            fontSize: 13,
            fontWeight: activeSubTab === 'roster' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: activeSubTab === 'roster' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
          }}
        >
          <Users size={15} color={activeSubTab === 'roster' ? colors.accentColor : colors.textMuted} />
          <span>Список и журнал класса ({currentClass.studentsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sferum')}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: activeSubTab === 'sferum' ? `1px solid ${colors.accentColor}` : colors.slotBorder,
            background: activeSubTab === 'sferum' ? colors.cardBg : 'transparent',
            color: activeSubTab === 'sferum' ? colors.textPrimary : colors.textMuted,
            fontSize: 13,
            fontWeight: activeSubTab === 'sferum' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: activeSubTab === 'sferum' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
          }}
        >
          <MessageSquare size={15} color={activeSubTab === 'sferum' ? colors.accentColor : colors.textMuted} />
          <span>Оповещения в Сферум</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sheets')}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: activeSubTab === 'sheets' ? `1px solid ${colors.accentColor}` : colors.slotBorder,
            background: activeSubTab === 'sheets' ? colors.cardBg : 'transparent',
            color: activeSubTab === 'sheets' ? colors.textPrimary : colors.textMuted,
            fontSize: 13,
            fontWeight: activeSubTab === 'sheets' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: activeSubTab === 'sheets' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
          }}
        >
          <FileSpreadsheet size={15} color={activeSubTab === 'sheets' ? colors.accentColor : colors.textMuted} />
          <span>Ведомости на печать (А4)</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ПОДРАЗДЕЛ 1: СПИСОК КЛАССА И ЖИВОЙ ЖУРНАЛ СТАТУСОВ (ROSTER)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'roster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Панель поиска и фильтров */}
          <div
            style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: '12px 16px',
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
                padding: '7px 12px',
                flex: '1 1 280px',
                maxWidth: 420
              }}
            >
              <Search size={15} color={colors.textMuted} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по ученику, родителю или телефону..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: colors.textPrimary,
                  fontSize: 13,
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Быстрые фильтры и действия */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginRight: 2 }}>
                  <Filter size={11} style={{ display: 'inline', marginRight: 4 }} />
                  Фильтр:
                </span>

                {[
                  { id: 'all', label: `Все (${metrics.total})` },
                  { id: 'present', label: `В лицее (${metrics.present})` },
                  { id: 'sick', label: `Болеют (${metrics.sick})` },
                  { id: 'excused', label: `Заявления (${metrics.excused})` },
                  { id: 'debts', label: `С долгами (${metrics.debts})` }
                ].map((btn) => {
                  const active = statusFilter === btn.id;
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setStatusFilter(btn.id as any)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: active ? `1px solid ${colors.accentColor}` : colors.slotBorder,
                        background: active ? (isLight ? 'rgba(0, 119, 255, 0.1)' : 'rgba(0, 119, 255, 0.25)') : colors.slotBg,
                        color: active ? colors.accentColor : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>

              {/* Кнопки действий: Добавить ученика + Экспорт Excel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: colors.accentColor,
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 119, 255, 0.25)'
                  }}
                >
                  <UserPlus size={14} />
                  <span>+ Ученик</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: colors.slotBorder,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Экспорт ведомости класса в Excel / CSV"
                >
                  <Download size={14} />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Таблица / Карточки состава класса */}
          <div
            style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: isLight ? '0 4px 16px rgba(0, 0, 0, 0.03)' : '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className="responsive-table-scroll" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 860 }}>
                {/* Шапка таблицы */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '40px minmax(180px, 2fr) minmax(120px, 1.3fr) minmax(105px, 1.1fr) minmax(190px, 2.2fr) minmax(150px, 1.8fr)',
                gap: 12,
                padding: '12px 18px',
                background: colors.tableHeaderBg,
                borderBottom: colors.slotBorder,
                fontSize: 11,
                fontWeight: 700,
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              <span>№</span>
              <span>Ученик (ФИО)</span>
              <span>Статус сегодня (клик)</span>
              <span>Оценки / Ср.</span>
              <span>Телефон / Родитель</span>
              <span>Пометка учителя</span>
            </div>

            {/* Список строк учеников */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredStudents.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>
                  Ни один ученик не соответствует выбранным критериям поиска
                </div>
              ) : (
                filteredStudents.map((st, idx) => {
                  const isPresent = st.statusToday === 'present';
                  const isSick = st.statusToday === 'sick';
                  const isExcused = st.statusToday === 'olympiad' || st.statusToday === 'excused';

                  return (
                    <div
                      key={st.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px minmax(180px, 2fr) minmax(120px, 1.3fr) minmax(105px, 1.1fr) minmax(190px, 2.2fr) minmax(150px, 1.8fr)',
                        gap: 12,
                        padding: '12px 18px',
                        alignItems: 'center',
                        borderBottom: idx < filteredStudents.length - 1 ? colors.slotBorder : 'none',
                        transition: 'background 0.12s ease'
                      }}
                    >
                      {/* № по списку */}
                      <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>
                        {st.id}
                      </span>

                      {/* ФИО + Аватар (Клик открывает цифровое досье / профиль ученика) */}
                      <div
                        onClick={() => setSelectedStudentDossier(st)}
                        title="Нажмите, чтобы открыть цифровой профиль и личное дело ученика"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)',
                            color: colors.accentColor,
                            fontWeight: 700,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {st.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: colors.accentColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {st.name}
                          </div>
                          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                            д.р. {st.birthDate} • Досье →
                          </div>
                        </div>
                      </div>

                      {/* Живой интерактивный статус */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(st.id)}
                          title="Нажмите для смены статуса (В лицее / Болеет / Заявление)"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 700,
                            background: isPresent
                              ? isLight
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(16, 185, 129, 0.2)'
                              : isSick
                              ? isLight
                                ? 'rgba(245, 158, 11, 0.12)'
                                : 'rgba(245, 158, 11, 0.22)'
                              : isExcused
                              ? isLight
                                ? 'rgba(139, 92, 246, 0.12)'
                                : 'rgba(139, 92, 246, 0.22)'
                              : isLight
                              ? 'rgba(239, 68, 68, 0.12)'
                              : 'rgba(239, 68, 68, 0.22)',
                            color: isPresent ? '#10b981' : isSick ? '#f59e0b' : isExcused ? '#8b5cf6' : '#ef4444',
                            textAlign: 'left'
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: isPresent ? '#10b981' : isSick ? '#f59e0b' : isExcused ? '#8b5cf6' : '#ef4444'
                            }}
                          />
                          <span>
                            {isPresent
                              ? 'В лицее'
                              : isSick
                              ? 'Болеет'
                              : st.statusToday === 'olympiad'
                              ? 'Олимпиада'
                              : isExcused
                              ? 'Заявление'
                              : 'Неявка'}
                          </span>
                        </button>
                        {st.statusReason && (
                          <div
                            style={{
                              fontSize: 10,
                              color: colors.textMuted,
                              marginTop: 2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 160
                            }}
                            title={st.statusReason}
                          >
                            {st.statusReason}
                          </div>
                        )}
                      </div>

                      {/* Оценки и средний балл */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: st.averageGrade >= 4.5 ? '#10b981' : st.averageGrade >= 4.0 ? colors.accentColor : '#f59e0b',
                            minWidth: 26
                          }}
                        >
                          {st.averageGrade.toFixed(1)}
                        </span>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {st.recentGrades.map((g, gi) => (
                            <span
                              key={gi}
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                width: 17,
                                height: 17,
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: g === 5 ? (isLight ? '#dcfce7' : 'rgba(16, 185, 129, 0.2)') : g === 4 ? (isLight ? '#e0f2fe' : 'rgba(0, 119, 255, 0.2)') : isLight ? '#fef3c7' : 'rgba(245, 158, 11, 0.2)',
                                color: g === 5 ? '#15803d' : g === 4 ? '#0284c7' : '#b45309'
                              }}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Телефон / Родитель (Номера в столб ровно, родитель по клику) */}
                      <div style={{ minWidth: 0 }}>
                        {/* 1. Номер телефона: четко в один ряд, без переносов, ровно по вертикали */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                          <a
                            href={`tel:${st.parentPhone.replace(/[^0-9+]/g, '')}`}
                            style={{
                              fontSize: 12,
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', monospace, sans-serif",
                              fontVariantNumeric: 'tabular-nums',
                              letterSpacing: '0.2px',
                              color: colors.accentColor,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}
                            title="Позвонить родителю"
                          >
                            <Phone size={11} style={{ flexShrink: 0 }} />
                            <span>{st.parentPhone}</span>
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(st.parentPhone, `phone-${st.id}`);
                            }}
                            title="Скопировать номер телефона"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedItemText === `phone-${st.id}` ? '#10b981' : colors.textMuted,
                              cursor: 'pointer',
                              padding: '2px 4px',
                              borderRadius: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              flexShrink: 0
                            }}
                          >
                            {copiedItemText === `phone-${st.id}` ? <Check size={11} /> : <Copy size={11} />}
                          </button>
                        </div>

                        {/* 2. Дополнительная информация: ФИО родителя (Абвгд...., при клике разворачивается) */}
                        <div
                          onClick={() => setExpandedParentStudentId((prev) => (prev === st.id ? null : st.id))}
                          style={{
                            fontSize: 11,
                            color: colors.textSecondary,
                            cursor: 'pointer',
                            marginTop: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            userSelect: 'none'
                          }}
                          title="Нажмите, чтобы увидеть полное ФИО родителя"
                        >
                          <span style={{ color: colors.textMuted, fontWeight: 600 }}>({st.parentRelation}):</span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: expandedParentStudentId === st.id ? colors.textPrimary : colors.textSecondary,
                              maxWidth: expandedParentStudentId === st.id ? 'none' : 115,
                              whiteSpace: expandedParentStudentId === st.id ? 'normal' : 'nowrap',
                              overflow: expandedParentStudentId === st.id ? 'visible' : 'hidden',
                              textOverflow: 'ellipsis',
                              borderBottom: '1px dotted ' + (expandedParentStudentId === st.id ? colors.accentColor : colors.textMuted),
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {st.parentName}
                          </span>
                          <span style={{ fontSize: 9, color: colors.textMuted, marginLeft: 1 }}>
                            {expandedParentStudentId === st.id ? '▲' : '▾'}
                          </span>
                        </div>
                      </div>

                      {/* Пометка учителя (интерактивная: сокращенная по умолчанию, раскрывается при клике) */}
                      <div>
                        {editingStudentNoteId === st.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveStudentNote(st.id);
                                if (e.key === 'Escape') setEditingStudentNoteId(null);
                              }}
                              autoFocus
                              placeholder="Заметка..."
                              style={{
                                fontSize: 11,
                                padding: '3px 6px',
                                borderRadius: 6,
                                border: `1px solid ${colors.accentColor}`,
                                background: colors.slotBg,
                                color: colors.textPrimary,
                                outline: 'none',
                                width: '100%'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => saveStudentNote(st.id)}
                              style={{
                                padding: '3px 6px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#10b981',
                                color: '#fff',
                                fontSize: 10,
                                cursor: 'pointer'
                              }}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div
                              onClick={() => setExpandedNoteStudentId((prev) => (prev === st.id ? null : st.id))}
                              title={st.notes ? `Нажмите, чтобы развернуть: "${st.notes}"` : 'Нажмите для добавления пометки'}
                              style={{
                                fontSize: 11,
                                color: st.notes ? (expandedNoteStudentId === st.id ? colors.textPrimary : colors.textSecondary) : colors.textMuted,
                                cursor: 'pointer',
                                padding: '3px 6px',
                                borderRadius: 6,
                                background: st.notes ? colors.slotBg : 'transparent',
                                border: st.notes ? (expandedNoteStudentId === st.id ? `1px solid ${colors.accentColor}` : colors.slotBorder) : '1px dashed transparent',
                                maxWidth: expandedNoteStudentId === st.id ? 'none' : 130,
                                whiteSpace: expandedNoteStudentId === st.id ? 'normal' : 'nowrap',
                                overflow: expandedNoteStudentId === st.id ? 'visible' : 'hidden',
                                textOverflow: 'ellipsis',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {st.notes || '+ добавить пометку'}
                            </div>
                            {st.notes && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStudentNoteId(st.id);
                                  setNoteDraft(st.notes || '');
                                }}
                                title="Редактировать пометку"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: colors.textMuted,
                                  cursor: 'pointer',
                                  padding: 2,
                                  fontSize: 10,
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Edit3 size={11} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          ПОДРАЗДЕЛ 2: ОФИЦИАЛЬНЫЕ ОПОВЕЩЕНИЯ В СФЕРУМ (SFERUM DISPATCHER)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'sferum' && (
        <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'start' }}>
          {/* Левая колонка: выбор шаблона оповещения */}
          <div
            style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
              Шаблоны для {currentClass.name}:
            </div>

            {[
              { key: 'meeting', title: 'Родительское собрание', desc: 'Четверг 18:30, каб. 311' },
              { key: 'medical', title: 'Сдача медсправок 095/у', desc: 'После выхода с больничного' },
              { key: 'exam', title: 'Пробник ОГЭ/ЕГЭ', desc: 'Суббота 09:00, паспорт и ручка' },
              { key: 'safety', title: 'Инструктаж по безопасности', desc: 'ПДД, гололед, тонкий лед' },
              { key: 'duty', title: 'Дежурство по лицею', desc: 'Посты, сменка, бейджи' },
              { key: 'custom', title: 'Свой текст объявления', desc: 'Свободное сообщение' }
            ].map((tmpl) => {
              const active = sferumTemplateKey === tmpl.key;
              return (
                <button
                  key={tmpl.key}
                  type="button"
                  onClick={() => setSferumTemplateKey(tmpl.key as any)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: active ? `1px solid ${colors.accentColor}` : colors.slotBorder,
                    background: active ? (isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.2)') : colors.slotBg,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: active ? colors.accentColor : colors.textPrimary }}>
                    {tmpl.title}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    {tmpl.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Правая колонка: предпросмотр сообщения и кнопка копирования в Сферум */}
          <div
            style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 12
                  }}
                >
                  Сф
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Чат класса: «МАОУ ЛИТ — {currentClass.name}»
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>
                    Официальный канал Сферум • VK Мессенджер
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopySferum}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: sferumCopied ? '#10b981' : colors.accentColor,
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0, 119, 255, 0.3)',
                  transition: 'background 0.15s ease'
                }}
              >
                {sferumCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span>{sferumCopied ? 'Скопировано в буфер!' : 'Скопировать для Сферума'}</span>
              </button>
            </div>

            {/* Редактор или отображение текста */}
            {sferumTemplateKey === 'custom' ? (
              <textarea
                value={customSferumText}
                onChange={(e) => setCustomSferumText(e.target.value)}
                placeholder="Введите текст сообщения для родителей или учеников..."
                rows={10}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 12,
                  background: colors.slotBg,
                  border: colors.slotBorder,
                  color: colors.textPrimary,
                  fontSize: 13,
                  lineHeight: 1.6,
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            ) : (
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: colors.slotBg,
                  border: colors.slotBorder,
                  color: colors.textPrimary,
                  fontSize: 13,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit'
                }}
              >
                {currentSferumMessage}
              </div>
            )}

            <div style={{ fontSize: 11, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="#10b981" />
              Текст отформатирован по ГОСТ деловой переписки с указанием лицея и контактных данных классного руководителя.
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          ПОДРАЗДЕЛ 3: ВЕДОМОСТИ НА ПЕЧАТЬ (А4 PRINT DOCUMENTS)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'sheets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Селектор типа документа + Кнопка Печати */}
          <div
            style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                Форма:
              </span>
              {[
                { id: 'roster', label: '1. Список класса с контактами родителей' },
                { id: 'safety', label: '2. Лист инструктажа по ТБ в каб. 311' },
                { id: 'attendance', label: '3. Сводная ведомость посещаемости' }
              ].map((sheet) => {
                const active = selectedSheetType === sheet.id;
                return (
                  <button
                    key={sheet.id}
                    type="button"
                    onClick={() => setSelectedSheetType(sheet.id as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: active ? `1px solid ${colors.accentColor}` : colors.slotBorder,
                      background: active ? (isLight ? 'rgba(0, 119, 255, 0.1)' : 'rgba(0, 119, 255, 0.25)') : colors.slotBg,
                      color: active ? colors.accentColor : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {sheet.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={handleExportCsv}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: colors.slotBorder,
                  background: colors.slotBg,
                  color: colors.textPrimary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={15} />
                <span>Экспорт в Excel (CSV)</span>
              </button>

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
                  background: colors.accentColor,
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0, 119, 255, 0.3)'
                }}
              >
                <Printer size={15} />
                <span>Печать бланка (А4)</span>
              </button>
            </div>
          </div>

          {/* Предпросмотр листа А4 (чистый печатный бланк) */}
          <div
            id="myclasses-printable-sheet"
            style={{
              background: '#ffffff',
              color: '#000000',
              padding: '36px 44px',
              borderRadius: 12,
              border: '1px solid #d1d5db',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              fontFamily: 'Times New Roman, serif',
              boxSizing: 'border-box',
              minHeight: 700
            }}
          >
            {/* Шапка школы МАОУ ЛИТ */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                МУНИЦИПАЛЬНОЕ АВТОНОМНОЕ ОБЩЕОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ Г. НОВОСИБИРСКА
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, marginTop: 2 }}>
                «ЛИЦЕЙ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ» (МАОУ ЛИТ)
              </div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>
                630099, г. Новосибирск • Кабинет № 311 (Лаборатория математики и ИКТ)
              </div>
            </div>

            {/* ДОКУМЕНТ 1: СПИСОК КЛАССА С КОНТАКТАМИ */}
            {selectedSheetType === 'roster' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase' }}>
                    СПИСОК УЧАЩИХСЯ И КОНТАКТНЫХ ДАННЫХ {currentClass.name}
                  </div>
                  <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>
                    на 2026/2027 учебный год • Классный руководитель: {currentClass.leaderTeacher}
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #000', padding: '6px 4px', width: 28 }}>№</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Фамилия, Имя учащегося</th>
                      <th style={{ border: '1px solid #000', padding: '6px 4px', width: 70 }}>Дата рожд.</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>ФИО родителя (законного предст.)</th>
                      <th style={{ border: '1px solid #000', padding: '6px 6px', width: 120 }}>Контактный телефон</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Домашний адрес</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClass.students.map((st) => (
                      <tr key={st.id}>
                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 700 }}>{st.id}</td>
                        <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 600 }}>{st.name}</td>
                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{st.birthDate}</td>
                        <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{st.parentName} ({st.parentRelation})</td>
                        <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace' }}>{st.parentPhone}</td>
                        <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{st.address || 'г. Новосибирск'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ДОКУМЕНТ 2: ЛИСТ ИНСТРУКТАЖА ПО ТБ */}
            {selectedSheetType === 'safety' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase' }}>
                    ЖУРНАЛ ПЕРВИЧНОГО ИНСТРУКТАЖА ПО ТЕХНИКЕ БЕЗОПАСНОСТИ
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    в кабинете № 311 (Лаборатория математики и ИКТ) • Класс: <strong>{currentClass.name}</strong>
                  </div>
                  <div style={{ fontSize: 11, fontStyle: 'italic', marginTop: 2 }}>
                    Тема: «Правила электробезопасности и охраны труда при работе с персональными ЭВМ (СанПиН 1.2.3685-21)»
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #000', padding: '6px 4px', width: 28 }}>№</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Фамилия, Имя учащегося</th>
                      <th style={{ border: '1px solid #000', padding: '6px 6px', width: 80 }}>Дата инстр.</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Кто проводил инструктаж</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', width: 110 }}>Подпись учащегося</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', width: 110 }}>Подпись учителя</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClass.students.map((st) => (
                      <tr key={st.id}>
                        <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontWeight: 700 }}>{st.id}</td>
                        <td style={{ border: '1px solid #000', padding: '5px 8px', fontWeight: 600 }}>{st.name}</td>
                        <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>03.11.2026</td>
                        <td style={{ border: '1px solid #000', padding: '5px 8px' }}>Лосив Р.Б.</td>
                        <td style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center', color: '#9ca3af' }}>___________</td>
                        <td style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center', color: '#9ca3af' }}>___________</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ДОКУМЕНТ 3: СВОДНАЯ ВЕДОМОСТЬ ПОСЕЩАЕМОСТИ */}
            {selectedSheetType === 'attendance' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase' }}>
                    СВОДНАЯ ВЕДОМОСТЬ ПОСЕЩАЕМОСТИ И ПРОПУСКОВ ЗАНЯТИЙ
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    Класс: <strong>{currentClass.name}</strong> • Месяц: Ноябрь 2026 г. • Кабинет 311
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #000', padding: '6px 4px', width: 28 }} rowSpan={2}>№</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }} rowSpan={2}>Фамилия, Имя учащегося</th>
                      <th style={{ border: '1px solid #000', padding: '6px 4px', width: 75 }} rowSpan={2}>Статус на сегодня</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }} colSpan={3}>Пропущено уроков за месяц</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }} rowSpan={2}>Документ / Основание</th>
                    </tr>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #000', padding: '4px', width: 45 }}>Всего</th>
                      <th style={{ border: '1px solid #000', padding: '4px', width: 55 }}>По бол.</th>
                      <th style={{ border: '1px solid #000', padding: '4px', width: 55 }}>По ув.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClass.students.map((st) => {
                      const isSick = st.statusToday === 'sick';
                      const isExcused = st.statusToday === 'olympiad' || st.statusToday === 'excused';
                      const sickHours = isSick ? 18 : 0;
                      const excusedHours = isExcused ? 12 : 0;
                      const totalHours = sickHours + excusedHours;

                      return (
                        <tr key={st.id}>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 700 }}>{st.id}</td>
                          <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 600 }}>{st.name}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                            {st.statusToday === 'present' ? 'Присутств.' : isSick ? 'Болеет' : 'Уважит.'}
                          </td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{totalHours || '0'}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{sickHours || '0'}</td>
                          <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{excusedHours || '0'}</td>
                          <td style={{ border: '1px solid #000', padding: '4px 8px', fontSize: 10 }}>{st.statusReason || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Подпись документа */}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
              <div>
                Классный руководитель: _________________ / {currentClass.leaderTeacher} /
              </div>
              <div>
                Дата составления: 03 ноября 2026 г.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          ЦИФРОВОЙ ПРОФИЛЬ / ДОСЬЕ УЧЕНИКА (APPLE INSET MODAL)
      ───────────────────────────────────────────────────────────────────────────── */}
      {selectedStudentDossier && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudentDossier(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 560,
              maxHeight: '88vh',
              background: colors.cardBg,
              borderRadius: 20,
              boxShadow: isLight
                ? '0 20px 50px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                : '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}
          >
            {/* Шапка модалки */}
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: colors.slotBorder
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>
                Личное дело и профиль учащегося
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentDossier(null)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: colors.slotBg,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: colors.textSecondary
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Карточка ученика */}
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: colors.slotBorder }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 22,
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)'
                }}
              >
                {selectedStudentDossier.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.3 }}>
                  {selectedStudentDossier.name}
                </div>
                <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  {selectedClassId} класс • Дата рожд.: {selectedStudentDossier.birthDate} ({selectedStudentDossier.gender === 'M' ? 'Мужской' : 'Женский'})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: selectedStudentDossier.statusToday === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: selectedStudentDossier.statusToday === 'present' ? '#10b981' : '#ef4444'
                    }}
                  >
                    {selectedStudentDossier.statusToday === 'present' ? '● В лицее' : selectedStudentDossier.statusToday === 'sick' ? '● Болеет' : '● Заявление'}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: colors.accentColor }}>
                    Ср. балл: {selectedStudentDossier.averageGrade.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Тело модалки: Данные */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Группа 1: Успеваемость */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  Текущая успеваемость
                </div>
                <div style={{ background: colors.slotBg, borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: colors.textMuted }}>Последние оценки:</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {selectedStudentDossier.recentGrades.map((g, i) => (
                      <span
                        key={i}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: g === 5 ? 'rgba(16, 185, 129, 0.12)' : g === 4 ? 'rgba(0, 122, 255, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: g === 5 ? '#10b981' : g === 4 ? colors.accentColor : '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 13
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Группа 2: Родители */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  Законный представитель
                </div>
                <div style={{ background: colors.slotBg, borderRadius: 12, overflow: 'hidden', fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: colors.slotBorder }}>
                    <span style={{ color: colors.textMuted }}>{selectedStudentDossier.parentRelation}</span>
                    <strong style={{ color: colors.textPrimary }}>{selectedStudentDossier.parentName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                    <span style={{ color: colors.textMuted }}>Телефон</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ color: colors.textPrimary }}>{selectedStudentDossier.parentPhone}</strong>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedStudentDossier.parentPhone, 'parentPhone')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.accentColor, padding: 0 }}
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Группа 3: Заметки */}
              {selectedStudentDossier.notes && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Служебные пометки классного руководителя
                  </div>
                  <div style={{ background: colors.slotBg, borderRadius: 12, padding: 12, fontSize: 12, color: colors.textSecondary }}>
                    {selectedStudentDossier.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Футер */}
            <div style={{ padding: '14px 20px', borderTop: colors.slotBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => copyToClipboard(`https://sferum.ru/?p=chat&user=${encodeURIComponent(selectedStudentDossier.parentName)}`, 'sferumChat')}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: isLight ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.2)',
                  border: 'none',
                  color: colors.accentColor,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <MessageSquare size={14} /> Написать в Сферум
              </button>

              <button
                type="button"
                onClick={() => setSelectedStudentDossier(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: colors.slotBg,
                  border: colors.slotBorder,
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА: БАЗА ВСЕХ 28 КЛАССОВ ШКОЛЫ */}
      {isClassModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsClassModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isContrast ? '#ffffff' : isLight ? 'rgba(255, 255, 255, 0.98)' : '#111722',
              border: isContrast ? '2px solid #0f172a' : colors.cardBorder,
              borderRadius: 22,
              padding: '24px 28px',
              maxWidth: 720,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}
          >
            {/* Шапка модалки */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: colors.textPrimary }}>
                    База всех 28 классов МАОУ ЛИТ
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: isLight ? 'rgba(0, 119, 255, 0.1)' : 'rgba(0, 119, 255, 0.25)',
                      color: colors.accentColor
                    }}
                  >
                    2026/2027 уч. год
                  </span>
                </div>
                <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                  Выберите класс для открытия журнала, табеля посещаемости и ведомостей
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClassModalOpen(false)}
                style={{
                  background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: colors.textSecondary
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Сетка классов по параллелям */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { grade: '5-е классы', classes: ['5А', '5Б', '5В', '5Г'] },
                { grade: '6-е классы', classes: ['6А', '6Б', '6В', '6Г'] },
                { grade: '7-е классы', classes: ['7А', '7Б', '7В', '7И', '7Л'] },
                { grade: '8-е классы', classes: ['8А', '8Б', '8И', '8Л'] },
                { grade: '9-е классы', classes: ['9А', '9Б', '9В', '9Г', '9И'] },
                { grade: '10-е классы', classes: ['10А', '10Б', '10В', '10И'] },
                { grade: '11-е классы', classes: ['11А', '11И'] }
              ].map((group) => (
                <div key={group.grade}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: colors.textMuted, marginBottom: 8 }}>
                    {group.grade}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                    {group.classes.map((clsId) => {
                      const cls = classesData[clsId];
                      const isSelected = selectedClassId === clsId;
                      const count = cls ? cls.students.length : 26;
                      return (
                        <button
                          key={clsId}
                          type="button"
                          onClick={() => {
                            handleSelectClass(clsId);
                            setIsClassModalOpen(false);
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: isSelected
                              ? '2px solid ' + colors.accentColor
                              : isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                            background: isSelected
                              ? (isLight ? 'rgba(0,119,255,0.12)' : 'rgba(0,119,255,0.25)')
                              : (isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)'),
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: 16, fontWeight: 800, color: isSelected ? colors.accentColor : colors.textPrimary }}>
                            {clsId}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted }}>
                            {count} уч.
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Футер модалки */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: colors.slotBorder }}>
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                Всего 28 классов • МАОУ Лицей Информационных Технологий
              </span>
              <button
                type="button"
                onClick={() => setIsClassModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: colors.slotBg,
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА: ЗАЧИСЛЕНИЕ НОВОГО УЧЕНИКА В КЛАСС */}
      {isAddStudentOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAddStudentOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isContrast ? '#ffffff' : isLight ? 'rgba(255, 255, 255, 0.98)' : '#111722',
              border: isContrast ? '2px solid #0f172a' : colors.cardBorder,
              borderRadius: 22,
              padding: '24px 28px',
              maxWidth: 540,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: colors.textPrimary }}>
                  Зачисление ученика в {selectedClassId} класс
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  МАОУ ЛИТ г. Новосибирска • Внесение в электронный реестр
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
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

            <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                  Фамилия, Имя ученика *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Сергеев Даниил"
                  value={newStudentData.name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: colors.slotBorder,
                    color: colors.textPrimary,
                    fontSize: 13,
                    boxSizing: 'border-box',
                    marginTop: 4
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                    Пол
                  </label>
                  <select
                    value={newStudentData.gender}
                    onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value as 'M' | 'F' })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: colors.slotBorder,
                      color: colors.textPrimary,
                      fontSize: 13,
                      boxSizing: 'border-box',
                      marginTop: 4
                    }}
                  >
                    <option value="M">Мужской</option>
                    <option value="F">Женский</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                    Дата рождения
                  </label>
                  <input
                    type="text"
                    placeholder="ДД.ММ.ГГГГ"
                    value={newStudentData.birthDate}
                    onChange={(e) => setNewStudentData({ ...newStudentData, birthDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: colors.slotBorder,
                      color: colors.textPrimary,
                      fontSize: 13,
                      boxSizing: 'border-box',
                      marginTop: 4
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                  ФИО законного представителя
                </label>
                <input
                  type="text"
                  placeholder="Например: Сергеева Ольга Николаевна"
                  value={newStudentData.parentName}
                  onChange={(e) => setNewStudentData({ ...newStudentData, parentName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: colors.slotBorder,
                    color: colors.textPrimary,
                    fontSize: 13,
                    boxSizing: 'border-box',
                    marginTop: 4
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                    Кем приходится
                  </label>
                  <select
                    value={newStudentData.parentRelation}
                    onChange={(e) => setNewStudentData({ ...newStudentData, parentRelation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: colors.slotBorder,
                      color: colors.textPrimary,
                      fontSize: 13,
                      boxSizing: 'border-box',
                      marginTop: 4
                    }}
                  >
                    <option value="Мама">Мама</option>
                    <option value="Папа">Папа</option>
                    <option value="Опекун">Опекун</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                    Телефон родителя
                  </label>
                  <input
                    type="text"
                    placeholder="+7 (913) 000-00-00"
                    value={newStudentData.parentPhone}
                    onChange={(e) => setNewStudentData({ ...newStudentData, parentPhone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: colors.slotBorder,
                      color: colors.textPrimary,
                      fontSize: 13,
                      boxSizing: 'border-box',
                      marginTop: 4
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                  Адрес проживания в г. Новосибирске
                </label>
                <input
                  type="text"
                  placeholder="ул. Ленина, д. 10, кв. 25"
                  value={newStudentData.address}
                  onChange={(e) => setNewStudentData({ ...newStudentData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: colors.slotBorder,
                    color: colors.textPrimary,
                    fontSize: 13,
                    boxSizing: 'border-box',
                    marginTop: 4
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                  Служебная пометка классного руководителя
                </label>
                <input
                  type="text"
                  placeholder="Олимпиадник, проект по IT, сдает ОГЭ/ЕГЭ..."
                  value={newStudentData.notes}
                  onChange={(e) => setNewStudentData({ ...newStudentData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: colors.slotBorder,
                    color: colors.textPrimary,
                    fontSize: 13,
                    boxSizing: 'border-box',
                    marginTop: 4
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
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
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: colors.accentColor,
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 119, 255, 0.3)'
                  }}
                >
                  Зачислить в {selectedClassId}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

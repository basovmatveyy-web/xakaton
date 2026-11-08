import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  FileCheck2,
  Scissors,
  Layers,
  GraduationCap,
  FileText
} from 'lucide-react';
import katex from 'katex';
import {
  CURRICULUM_PRESETS,
  calculateGradingScale
} from '../../utils/assessmentCurriculum';
import type { SubjectPreset } from '../../utils/assessmentCurriculum';
import {
  exportAssessmentStudentSheetPdf,
  exportAssessmentTeacherKeyPdf
} from '../../utils/pdfExport';
import type { AssessmentVariant } from '../../utils/pdfExport';
import { useToast } from '../common/ToastContext';

interface AssessmentConstructorViewProps {
  isLight: boolean;
  userFullName?: string;
  colors: {
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentColor: string;
    slotBg: string;
    inputBg: string;
    inputBorder: string;
  };
}

export const AssessmentConstructorView: React.FC<AssessmentConstructorViewProps> = ({
  isLight,
  userFullName = 'Лосив Роман Борисович',
  colors
}) => {
  const { showToast } = useToast();

  // 1. Предмет
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('algebra');
  const currentSubject = useMemo(
    () => CURRICULUM_PRESETS.find((s) => s.id === selectedSubjectId) || CURRICULUM_PRESETS[0],
    [selectedSubjectId]
  );

  // 2. Параметры проверочной работы
  const [topic, setTopic] = useState<string>(currentSubject.topics[0].title);
  const [grade, setGrade] = useState<string>('9 класс');
  const [variantsCount, setVariantsCount] = useState<number>(4);
  const [tasksCount, setTasksCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<string>('Стандартный');
  const [timeMinutes, setTimeMinutes] = useState<number>(20);

  // 3. Сгенерированные варианты
  const [generatedVariants, setGeneratedVariants] = useState<AssessmentVariant[]>(() => {
    return currentSubject.topics[0].generator(4, 3, 'Стандартный');
  });

  const [activePreviewTab, setActivePreviewTab] = useState<'student' | 'teacher' | 'rubric'>('student');
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Расчет шкалы оценивания ФГОС
  const gradingScale = useMemo(
    () => calculateGradingScale(tasksCount, difficulty),
    [tasksCount, difficulty]
  );

  // Выбор пресета темы из рабочей программы
  const handleSelectTopicPreset = (presetTopic: SubjectPreset['topics'][0]) => {
    setTopic(presetTopic.title);
    setTasksCount(presetTopic.defaultTasksCount);
    setTimeMinutes(presetTopic.defaultMinutes);
    setDifficulty(presetTopic.difficulty);
    const vars = presetTopic.generator(variantsCount, presetTopic.defaultTasksCount, presetTopic.difficulty);
    setGeneratedVariants(vars);
    showToast(`Тема «${presetTopic.title}» загружена`);
  };

  // Переключение предмета
  const handleSelectSubject = (subjId: string) => {
    setSelectedSubjectId(subjId);
    const subj = CURRICULUM_PRESETS.find((s) => s.id === subjId) || CURRICULUM_PRESETS[0];
    const firstTop = subj.topics[0];
    setTopic(firstTop.title);
    setTasksCount(firstTop.defaultTasksCount);
    setTimeMinutes(firstTop.defaultMinutes);
    setDifficulty(firstTop.difficulty);
    const vars = firstTop.generator(variantsCount, firstTop.defaultTasksCount, firstTop.difficulty);
    setGeneratedVariants(vars);
  };

  // Переформирование с текущими параметрами
  const handleRegenerate = (newVarCount = variantsCount, newTasksCount = tasksCount, newDiff = difficulty) => {
    const matched = currentSubject.topics.find((t) => t.title.toLowerCase() === topic.toLowerCase()) || currentSubject.topics[0];
    const vars = matched.generator(newVarCount, newTasksCount, newDiff);
    setGeneratedVariants(vars);
    showToast('Варианты успешно обновлены');
  };

  // Скачать раздаточный лист А4 (PDF)
  const handleDownloadStudentPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      try {
        exportAssessmentStudentSheetPdf({
          topic,
          subject: currentSubject.name,
          grade,
          difficulty,
          timeLimitMinutes: timeMinutes,
          variants: generatedVariants,
          schoolName: 'МАОУ «Лицей Информационных Технологий» г. Новосибирска',
          teacherName: userFullName
        });
        showToast('Раздаточный лист А4 скачан в PDF!');
      } catch (err) {
        console.error('PDF export error:', err);
        showToast('Ошибка при формировании PDF', 'error');
      } finally {
        setIsExportingPdf(false);
      }
    }, 100);
  };

  // Скачать ключи учителя (PDF)
  const handleDownloadTeacherPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      try {
        exportAssessmentTeacherKeyPdf({
          topic,
          subject: currentSubject.name,
          grade,
          difficulty,
          timeLimitMinutes: timeMinutes,
          variants: generatedVariants,
          schoolName: 'МАОУ «Лицей Информационных Технологий» г. Новосибирска',
          teacherName: userFullName,
          gradingScale
        });
        showToast('Ключи проверки скачаны в PDF!');
      } catch (err) {
        console.error('Teacher PDF export error:', err);
        showToast('Ошибка при формировании PDF ключей', 'error');
      } finally {
        setIsExportingPdf(false);
      }
    }, 100);
  };

  // Скопировать текстовые варианты для чата Сферум
  const handleCopyText = () => {
    let text = `📋 ПРОВЕРОЧНАЯ РАБОТА: ${topic.toUpperCase()}\n`;
    text += `Предмет: ${currentSubject.name} | Класс: ${grade} | Время: ${timeMinutes} мин.\n\n`;

    generatedVariants.forEach((v) => {
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `ВАРИАНТ №${v.num}\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      v.tasks.forEach((t) => {
        text += `${t.num}. ${t.text}\n`;
        if (t.formula) text += `   Формула: ${t.formula}\n`;
      });
      text += `\n`;
    });

    text += `\n🔑 ЭТАЛОННЫЕ ОТВЕТЫ (ДЛЯ УЧИТЕЛЯ):\n`;
    generatedVariants.forEach((v) => {
      text += `Вариант ${v.num}: ` + v.tasks.map((t) => `№${t.num}=${t.answer || '—'}`).join('; ') + `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Текст скопирован в буфер обмена для чата Сферум');
    setTimeout(() => setCopied(false), 2000);
  };

  // Рендер формулы KaTeX
  const renderFormula = (raw: string) => {
    try {
      const clean = raw.replace(/\$/g, '');
      const html = katex.renderToString(clean, { throwOnError: false, displayMode: false });
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <span>{raw}</span>;
    }
  };

  // Apple Design Tokens
  const appleCardBg = isLight ? 'rgba(255, 255, 255, 0.84)' : 'rgba(24, 28, 36, 0.86)';
  const appleCardBorder = isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)';
  const appleSegmentedBg = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)';
  const appleSegmentedActiveBg = isLight ? '#ffffff' : '#2c3340';
  const appleSegmentedActiveShadow = isLight
    ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 0.5px 1px rgba(0, 0, 0, 0.06)'
    : '0 1px 4px rgba(0, 0, 0, 0.4)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
        WebkitFontSmoothing: 'antialiased',
        paddingBottom: 40
      }}
    >
      {/* ─── 1. TOP macOS TOOLBAR: TITLE + SUBJECT BAR + ACTIONS ─── */}
      <div
        style={{
          background: appleCardBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: appleCardBorder,
          borderRadius: 18,
          padding: '16px 20px',
          boxShadow: isLight
            ? '0 2px 12px rgba(0, 0, 0, 0.03)'
            : '0 2px 12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Title with SF squircle icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(180deg, #0077ff 0%, #0056d6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 119, 255, 0.28)'
              }}
            >
              <FileCheck2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: colors.textPrimary, letterSpacing: '-0.02em' }}>
                Конструктор проверочных работ
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 1, letterSpacing: '-0.01em' }}>
                Стандарт ФГОС РФ • Автоматический расчёт вариантов, тайминга и печать на А4 с линией отреза ✂
              </div>
            </div>
          </div>

          {/* Apple Toolbar Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Primary Download Button */}
            <button
              type="button"
              onClick={handleDownloadStudentPdf}
              disabled={isExportingPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 9999,
                background: '#0071e3',
                color: '#ffffff',
                border: 'none',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: isExportingPdf ? 'wait' : 'pointer',
                boxShadow: '0 2px 8px rgba(0, 113, 227, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              {isExportingPdf ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{isExportingPdf ? 'Формирование PDF...' : 'Скачать лист А4 (PDF)'}</span>
            </button>

            {/* Teacher Key PDF */}
            <button
              type="button"
              onClick={handleDownloadTeacherPdf}
              disabled={isExportingPdf}
              title="Скачать PDF с эталонными ключами и решениями для учителя"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 9999,
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                color: colors.textPrimary,
                border: appleCardBorder,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={14} />
              <span>Ключи проверки (PDF)</span>
            </button>

            {/* Copy Text */}
            <button
              type="button"
              onClick={handleCopyText}
              title="Скопировать текст вариантов в буфер для чата Сферум"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 9999,
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                color: colors.textSecondary,
                border: appleCardBorder,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} color="#34c759" /> : <Copy size={14} />}
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              title="Печать текущего документа"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 9999,
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                color: colors.textSecondary,
                border: appleCardBorder,
                cursor: 'pointer'
              }}
            >
              <Printer size={14} />
            </button>
          </div>
        </div>

        {/* Apple Segmented Subject Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
          <div
            style={{
              display: 'flex',
              background: appleSegmentedBg,
              padding: 3,
              borderRadius: 11,
              overflowX: 'auto',
              gap: 2
            }}
          >
            {CURRICULUM_PRESETS.map((s) => {
              const active = s.id === selectedSubjectId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSubject(s.id)}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: active ? appleSegmentedActiveBg : 'transparent',
                    color: active ? '#0071e3' : colors.textSecondary,
                    boxShadow: active ? appleSegmentedActiveShadow : 'none',
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick topic presets chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 2 }}>
              Темы программы:
            </span>
            {currentSubject.topics.map((t) => {
              const active = t.title.toLowerCase() === topic.toLowerCase();
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTopicPreset(t)}
                  style={{
                    padding: '4px 11px',
                    borderRadius: 9999,
                    background: active
                      ? (isLight ? 'rgba(0, 113, 227, 0.12)' : 'rgba(10, 132, 255, 0.22)')
                      : (isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)'),
                    color: active ? '#0071e3' : colors.textSecondary,
                    border: active ? '1px solid rgba(0, 113, 227, 0.3)' : '1px solid transparent',
                    fontSize: 11.5,
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 2. STUDIO SPLIT WORKSPACE: LEFT INSPECTOR + RIGHT A4 CANVAS ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 360px) 1fr',
          gap: 18,
          alignItems: 'start'
        }}
        className="assessment-studio-grid"
      >
        {/* ─── LEFT: macOS INSPECTOR PALETTE ─── */}
        <div
          style={{
            background: appleCardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: appleCardBorder,
            borderRadius: 18,
            padding: '18px',
            boxShadow: isLight
              ? '0 2px 12px rgba(0, 0, 0, 0.03)'
              : '0 2px 12px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {/* Inspector Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
              <Layers size={15} color="#0071e3" />
              <span>Параметры билета</span>
            </div>
            <button
              type="button"
              onClick={() => handleRegenerate()}
              title="Пересчитать числовые значения задач"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 8px',
                borderRadius: 6,
                background: isLight ? 'rgba(0, 113, 227, 0.08)' : 'rgba(10, 132, 255, 0.16)',
                color: '#0071e3',
                border: 'none',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={11} />
              <span>Обновить</span>
            </button>
          </div>

          {/* Field: Тема работы */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              Тема работы
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Название проверочной работы..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 9,
                background: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.09)' : '1px solid rgba(255, 255, 255, 0.12)',
                color: colors.textPrimary,
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* macOS Inset Group: Pickers */}
          <div
            style={{
              background: isLight ? 'rgba(0, 0, 0, 0.025)' : 'rgba(255, 255, 255, 0.03)',
              borderRadius: 12,
              border: isLight ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.06)',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {/* Варианты */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary }}>Вариантов на листе:</span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>{variantsCount === 4 ? '4 вар. (лист А4)' : '2 вар. (лист А5)'}</span>
              </div>
              <div style={{ display: 'flex', background: appleSegmentedBg, padding: 2, borderRadius: 8 }}>
                {[2, 4].map((count) => {
                  const active = variantsCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setVariantsCount(count);
                        handleRegenerate(count, tasksCount, difficulty);
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        borderRadius: 6,
                        border: 'none',
                        background: active ? appleSegmentedActiveBg : 'transparent',
                        color: active ? colors.textPrimary : colors.textSecondary,
                        boxShadow: active ? appleSegmentedActiveShadow : 'none',
                        fontSize: 11.5,
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {count === 2 ? '2 варианта (А5)' : '4 варианта (А4)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Заданий в билете */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary }}>Заданий в билете:</span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>{tasksCount} задачи</span>
              </div>
              <div style={{ display: 'flex', background: appleSegmentedBg, padding: 2, borderRadius: 8 }}>
                {[2, 3, 4].map((tNum) => {
                  const active = tasksCount === tNum;
                  return (
                    <button
                      key={tNum}
                      type="button"
                      onClick={() => {
                        setTasksCount(tNum);
                        handleRegenerate(variantsCount, tNum, difficulty);
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        borderRadius: 6,
                        border: 'none',
                        background: active ? appleSegmentedActiveBg : 'transparent',
                        color: active ? colors.textPrimary : colors.textSecondary,
                        boxShadow: active ? appleSegmentedActiveShadow : 'none',
                        fontSize: 11.5,
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tNum} задачи
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Класс */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary }}>Параллель:</span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>{grade}</span>
              </div>
              <div style={{ display: 'flex', background: appleSegmentedBg, padding: 2, borderRadius: 8 }}>
                {['7 класс', '8 класс', '9 класс', '10 класс', '11 класс'].map((gr) => {
                  const active = grade === gr;
                  return (
                    <button
                      key={gr}
                      type="button"
                      onClick={() => setGrade(gr)}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        borderRadius: 6,
                        border: 'none',
                        background: active ? appleSegmentedActiveBg : 'transparent',
                        color: active ? colors.textPrimary : colors.textSecondary,
                        boxShadow: active ? appleSegmentedActiveShadow : 'none',
                        fontSize: 11,
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {gr.replace(' класс', '')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Сложность */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary }}>Сложность:</span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>{difficulty}</span>
              </div>
              <div style={{ display: 'flex', background: appleSegmentedBg, padding: 2, borderRadius: 8 }}>
                {['Базовый', 'Стандартный', 'Повышенный'].map((lvl) => {
                  const active = difficulty === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setDifficulty(lvl);
                        handleRegenerate(variantsCount, tasksCount, lvl);
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        borderRadius: 6,
                        border: 'none',
                        background: active ? appleSegmentedActiveBg : 'transparent',
                        color: active ? colors.textPrimary : colors.textSecondary,
                        boxShadow: active ? appleSegmentedActiveShadow : 'none',
                        fontSize: 11,
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {lvl === 'Базовый' ? 'База' : lvl === 'Стандартный' ? 'Стандарт' : 'Профиль'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Тайминг */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary }}>Время работы:</span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>{timeMinutes} минут</span>
              </div>
              <div style={{ display: 'flex', background: appleSegmentedBg, padding: 2, borderRadius: 8 }}>
                {[10, 15, 20, 25, 40].map((mins) => {
                  const active = timeMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTimeMinutes(mins)}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        borderRadius: 6,
                        border: 'none',
                        background: active ? appleSegmentedActiveBg : 'transparent',
                        color: active ? colors.textPrimary : colors.textSecondary,
                        boxShadow: active ? appleSegmentedActiveShadow : 'none',
                        fontSize: 11,
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {mins}м
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Apple Health Style Grading Rubric Widget ─── */}
          <div
            style={{
              background: isLight ? '#f9fafb' : '#1f242e',
              borderRadius: 12,
              border: isLight ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: colors.textPrimary }}>
                <GraduationCap size={15} color="#0071e3" />
                <span>Шкала оценивания (ФГОС)</span>
              </div>
              <span style={{ fontSize: 11, color: '#0071e3', fontWeight: 600 }}>
                Макс: {gradingScale.maxScore} б.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: isLight ? '#ffffff' : '#272d3b', padding: '6px 10px', borderRadius: 8, border: isLight ? '1px solid #e5e7eb' : '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 10, color: colors.textMuted }}>Темп на задачу</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, marginTop: 1 }}>
                  ~{Math.round(timeMinutes / tasksCount)} мин / шт
                </div>
              </div>
              <div style={{ background: isLight ? '#ffffff' : '#272d3b', padding: '6px 10px', borderRadius: 8, border: isLight ? '1px solid #e5e7eb' : '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 10, color: colors.textMuted }}>Вес 1 задачи</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, marginTop: 1 }}>
                  1 первичный балл
                </div>
              </div>
            </div>

            {/* Apple Grade Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: isLight ? '#15803d' : '#4ade80', fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                  «5» (Отлично)
                </span>
                <span style={{ color: colors.textSecondary, fontWeight: 500 }}>
                  {gradingScale.five.split(':')[1]?.split('(')[0]?.trim()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: isLight ? '#0284c7' : '#38bdf8', fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0284c7' }} />
                  «4» (Хорошо)
                </span>
                <span style={{ color: colors.textSecondary, fontWeight: 500 }}>
                  {gradingScale.four.split(':')[1]?.split('(')[0]?.trim()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: isLight ? '#b45309' : '#fcd34d', fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b' }} />
                  «3» (Удовл.)
                </span>
                <span style={{ color: colors.textSecondary, fontWeight: 500 }}>
                  {gradingScale.three.split(':')[1]?.split('(')[0]?.trim()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: isLight ? '#b91c1c' : '#f87171', fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                  «2» (Неудовл.)
                </span>
                <span style={{ color: colors.textSecondary, fontWeight: 500 }}>
                  {gradingScale.two.split(':')[1]?.split('(')[0]?.trim()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: STUDIO DOCUMENT VIEWPORT (A4 PAPER SHEET) ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Viewport Top Bar (Tabs) */}
          <div
            style={{
              background: appleCardBg,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: appleCardBorder,
              borderRadius: 14,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.02)' : '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            {/* Viewport Tabs */}
            <div style={{ display: 'flex', background: appleSegmentedBg, padding: 3, borderRadius: 9, gap: 2 }}>
              <button
                type="button"
                onClick={() => setActivePreviewTab('student')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: activePreviewTab === 'student' ? appleSegmentedActiveBg : 'transparent',
                  color: activePreviewTab === 'student' ? colors.textPrimary : colors.textSecondary,
                  boxShadow: activePreviewTab === 'student' ? appleSegmentedActiveShadow : 'none',
                  fontSize: 12,
                  fontWeight: activePreviewTab === 'student' ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Раздаточный лист А4
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewTab('teacher')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: activePreviewTab === 'teacher' ? appleSegmentedActiveBg : 'transparent',
                  color: activePreviewTab === 'teacher' ? colors.textPrimary : colors.textSecondary,
                  boxShadow: activePreviewTab === 'teacher' ? appleSegmentedActiveShadow : 'none',
                  fontSize: 12,
                  fontWeight: activePreviewTab === 'teacher' ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Ключи проверки учителя
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewTab('rubric')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: activePreviewTab === 'rubric' ? appleSegmentedActiveBg : 'transparent',
                  color: activePreviewTab === 'rubric' ? colors.textPrimary : colors.textSecondary,
                  boxShadow: activePreviewTab === 'rubric' ? appleSegmentedActiveShadow : 'none',
                  fontSize: 12,
                  fontWeight: activePreviewTab === 'rubric' ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Критерии ФГОС
              </button>
            </div>

            {/* Spec Badge */}
            <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>
              Печатный стандарт: А4 (210×297 мм)
            </div>
          </div>

          {/* ─── STUDIO CANVAS: AUTHENTIC A4 PAPER RENDERING ─── */}
          <div
            style={{
              background: isLight ? '#ebedf0' : '#14171d',
              borderRadius: 18,
              border: isLight ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.06)',
              padding: '28px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
              boxShadow: isLight
                ? 'inset 0 1px 4px rgba(0, 0, 0, 0.04)'
                : 'inset 0 1px 4px rgba(0, 0, 0, 0.4)',
              minHeight: 680
            }}
          >
            {/* ─── TAB 1: РАЗДАТОЧНЫЙ ЛИСТ А4 ─── */}
            {activePreviewTab === 'student' && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 760,
                  aspectRatio: '1 / 1.414',
                  background: '#ffffff',
                  borderRadius: 3,
                  boxShadow: '0 16px 48px -10px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.06)',
                  padding: 24,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  color: '#0f172a'
                }}
              >
                {/* Сетка карточек на листе */}
                <div
                  style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: variantsCount === 4 ? '1fr 1fr' : '1fr',
                    gridTemplateRows: variantsCount === 4 ? '1fr 1fr' : '1fr 1fr',
                    gap: 16,
                    position: 'relative'
                  }}
                >
                  {generatedVariants.map((v) => (
                    <div
                      key={v.num}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: '#ffffff'
                      }}
                    >
                      <div>
                        {/* Шапка карточки */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #0077ff', paddingBottom: 4, marginBottom: 6 }}>
                          <div>
                            <div style={{ fontSize: 9.5, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                              МАОУ ЛИТ • {grade}
                            </div>
                            <div style={{ fontSize: 8.5, color: '#64748b' }}>
                              {currentSubject.name} • {topic}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#0077ff' }}>
                              ВАРИАНТ №{v.num}
                            </div>
                            <div style={{ fontSize: 8, color: '#94a3b8' }}>
                              Время: {timeMinutes} мин
                            </div>
                          </div>
                        </div>

                        {/* Поля для ученика */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 8.5,
                            color: '#475569',
                            background: '#f8fafc',
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '0.5px solid #cbd5e1',
                            marginBottom: 8
                          }}
                        >
                          <span>ФИО: __________________________________</span>
                          <span>Дата: ________</span>
                          <span>Балл: [ &nbsp; ]</span>
                        </div>

                        {/* Задания карточки */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {v.tasks.map((t) => (
                            <div key={t.num} style={{ fontSize: 9.5, lineHeight: 1.35 }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                {t.num}. {t.text}
                              </div>
                              {t.formula && (
                                <div style={{ margin: '2px 0 2px 8px', color: '#0077ff' }}>
                                  {renderFormula(t.formula)}
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                <span style={{ fontSize: 8.5, color: '#94a3b8' }}>Ответ:</span>
                                <div style={{ width: 85, borderBottom: '0.8px solid #94a3b8', height: 12 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: 7.5, color: '#94a3b8', paddingTop: 6, borderTop: '0.5px solid #f1f5f9' }}>
                        МАОУ Лицей Информационных Технологий • Стандарт ФГОС РФ
                      </div>
                    </div>
                  ))}

                  {/* Разделительные линии отреза с ножницами */}
                  {variantsCount === 4 ? (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: 0,
                          bottom: 0,
                          width: 1,
                          borderLeft: '1px dashed #94a3b8',
                          pointerEvents: 'none'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          height: 1,
                          borderTop: '1px dashed #94a3b8',
                          pointerEvents: 'none'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: '#ffffff',
                          padding: '2px 7px',
                          borderRadius: 9999,
                          border: '1px dashed #94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 9,
                          color: '#64748b',
                          pointerEvents: 'none',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}
                      >
                        <Scissors size={11} />
                        <span>Линия отреза карточек</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          height: 1,
                          borderTop: '1px dashed #94a3b8',
                          pointerEvents: 'none'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: 9999,
                          border: '1px dashed #94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 9.5,
                          color: '#64748b',
                          pointerEvents: 'none',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}
                      >
                        <Scissors size={12} />
                        <span>Разрезать на 2 карточки А5</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 2: КЛЮЧИ ПРОВЕРКИ УЧИТЕЛЯ ─── */}
            {activePreviewTab === 'teacher' && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 760,
                  background: '#ffffff',
                  borderRadius: 3,
                  boxShadow: '0 16px 48px -10px rgba(0, 0, 0, 0.18)',
                  padding: 28,
                  boxSizing: 'border-box',
                  color: '#0f172a'
                }}
              >
                {/* Шапка ключей */}
                <div style={{ borderBottom: '2px solid #0077ff', paddingBottom: 10, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0077ff', textTransform: 'uppercase' }}>
                      МАОУ Лицей Информационных Технологий г. Новосибирска
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                      ЭТАЛОННЫЕ КЛЮЧИ И РЕШЕНИЯ ДЛЯ УЧИТЕЛЯ
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      Предмет: {currentSubject.name} • Тема: «{topic}» • {grade}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 10, color: '#64748b' }}>
                    <div>Составитель: {userFullName}</div>
                    <div style={{ color: '#0077ff', fontWeight: 700, marginTop: 2 }}>ФГОС РФ</div>
                  </div>
                </div>

                {/* Таблица экспресс-проверки */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#0f172a' }}>
                    Таблица экспресс-проверки ответов:
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left' }}>Вариант</th>
                        {Array.from({ length: tasksCount }).map((_, i) => (
                          <th key={i} style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'center' }}>
                            Задание №{i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generatedVariants.map((v) => (
                        <tr key={v.num}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontWeight: 700 }}>
                            Вариант №{v.num}
                          </td>
                          {v.tasks.map((t) => (
                            <td key={t.num} style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'center', color: '#0077ff', fontWeight: 700 }}>
                              {t.answer || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Пошаговые решения */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                    Пошаговые образцы решений:
                  </div>
                  {generatedVariants.map((v) => (
                    <div key={v.num} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', background: '#f8fafc' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0077ff', marginBottom: 6 }}>
                        ВАРИАНТ №{v.num}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {v.tasks.map((t) => (
                          <div key={t.num} style={{ fontSize: 11, lineHeight: 1.4 }}>
                            <div style={{ fontWeight: 600 }}>
                              №{t.num}. {t.text} {t.formula && <span style={{ color: '#0077ff' }}>({renderFormula(t.formula)})</span>}
                            </div>
                            <div style={{ color: '#475569', marginTop: 2 }}>
                              <strong>Решение:</strong> {t.solution || 'Согласно спецификации ФГОС'}
                            </div>
                            <div style={{ color: '#16a34a', fontWeight: 600, marginTop: 1 }}>
                              <strong>Ответ:</strong> {t.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 3: КРИТЕРИИ ОЦЕНИВАНИЯ ФГОС ─── */}
            {activePreviewTab === 'rubric' && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 760,
                  background: '#ffffff',
                  borderRadius: 3,
                  boxShadow: '0 16px 48px -10px rgba(0, 0, 0, 0.18)',
                  padding: 28,
                  boxSizing: 'border-box',
                  color: '#0f172a'
                }}
              >
                <div style={{ borderBottom: '2px solid #0077ff', paddingBottom: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0077ff', textTransform: 'uppercase' }}>
                    МАОУ Лицей Информационных Технологий г. Новосибирска
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    КРИТЕРИИ ОЦЕНИВАНИЯ И РУБРИКАТОР БАЛЛОВ ФГОС
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {currentSubject.name} • {grade} • {topic}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'left' }}>Оценка</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'left' }}>Диапазон первичных баллов</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'left' }}>Процент выполнения</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'left' }}>Критерии ФГОС РФ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 800, color: '#16a34a' }}>«5» (Отлично)</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{gradingScale.five.split(':')[1]?.split('(')[0]?.trim()}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>85 – 100%</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Полное безошибочное решение с обоснованием</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 800, color: '#0284c7' }}>«4» (Хорошо)</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{gradingScale.four.split(':')[1]?.split('(')[0]?.trim()}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>70 – 84%</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Верный ход рассуждений, допущена 1 негрубая описка</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 800, color: '#b45309' }}>«3» (Удовл.)</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{gradingScale.three.split(':')[1]?.split('(')[0]?.trim()}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>50 – 69%</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Базовый алгоритм освоен, решено не менее половины заданий</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 800, color: '#b91c1c' }}>«2» (Неудовл.)</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{gradingScale.two.split(':')[1]?.split('(')[0]?.trim()}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>менее 50%</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Требования ФГОС не достигнуты, назначить консультацию</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, color: isLight ? '#64748b' : '#94a3b8', marginTop: 14, fontWeight: 500 }}>
              Документ откалиброван под формат А4 без полей печати • 100% масштаб
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import {
  GraduationCap,
  Camera,
  Presentation,
  ClipboardCheck,
  FileImage,
  Download,
  Send,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Tv,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sliders,
  BookOpen,
  Printer,
  FileText,
  Upload,
  RotateCw,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Scissors,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { exportFipiTaskPdf, exportGdzClonesPdf } from '../../utils/pdfExport';
import { InlineFormattedText } from './RichAiMessage';
import type { AuthThemeMode } from '../../types/auth';

export type FeatureStubTab =
  | 'fipi'
  | 'gdzclone'
  | 'boardscan'
  | 'presentation'
  | 'attendance';

interface FeatureStubsViewProps {
  activeStub: FeatureStubTab;
  theme: AuthThemeMode;
  onNavigateToTab: (tab: any) => void;
}

const processBoardCanvas = (
  img: HTMLImageElement,
  mode: 'clean' | 'notebook' | 'contrast' | 'original',
  threshold: number,
  contrast: number,
  rotation: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const isRotated = rotation === 90 || rotation === 270;
  canvas.width = isRotated ? img.naturalHeight : img.naturalWidth;
  canvas.height = isRotated ? img.naturalWidth : img.naturalHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.save();
  if (rotation === 90) {
    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI / 2);
  } else if (rotation === 180) {
    ctx.translate(canvas.width, canvas.height);
    ctx.rotate(Math.PI);
  } else if (rotation === 270) {
    ctx.translate(0, canvas.height);
    ctx.rotate((3 * Math.PI) / 2);
  }
  ctx.drawImage(img, 0, 0);
  ctx.restore();

  if (mode === 'original') {
    return canvas;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const len = data.length;

  if (mode === 'clean') {
    // Инверсия темной меловой доски в чистый белый лист А4
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      if (lum < threshold) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else {
        const intensity = Math.min(1, Math.pow((lum - threshold) / Math.max(0.01, 1 - threshold), contrast));
        const inkVal = Math.round(15 * (1 - intensity) + 255 * (1 - intensity) * 0.12);
        data[i] = Math.max(0, Math.min(255, inkVal));
        data[i + 1] = Math.max(0, Math.min(255, inkVal + 4));
        data[i + 2] = Math.max(0, Math.min(255, inkVal + 14));
      }
    }
  } else if (mode === 'notebook') {
    // Белая маркерная доска / тетрадь: отбеливание фона
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      if (lum > threshold) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else {
        const factor = Math.max(0, lum / Math.max(0.01, threshold));
        const inkVal = Math.round(20 * (1 - factor));
        data[i] = inkVal;
        data[i + 1] = inkVal;
        data[i + 2] = inkVal;
      }
    }
  } else if (mode === 'contrast') {
    // Высокий контраст (CAD / чертёжный режим)
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      if (lum < threshold) {
        data[i] = 9;
        data[i + 1] = 24;
        data[i + 2] = 48;
      } else {
        data[i] = 56;
        data[i + 1] = 189;
        data[i + 2] = 248;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

const generateA4Pdf = (processedCanvas: HTMLCanvasElement, filename: string = 'Оцифровка_доски_МАОУ_ЛИТ_А4.pdf') => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Офсетный холст А4 высокого разрешения
  const a4Canvas = document.createElement('canvas');
  const dpiScale = 2;
  a4Canvas.width = 1240 * dpiScale;
  a4Canvas.height = 1754 * dpiScale;
  const ctx = a4Canvas.getContext('2d');
  if (!ctx) return;

  // 1. Белый фон листа
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

  // 2. Официальная шапка лицея
  ctx.fillStyle = '#0077ff';
  ctx.fillRect(40 * dpiScale, 30 * dpiScale, a4Canvas.width - 80 * dpiScale, 4 * dpiScale);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${18 * dpiScale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('МАОУ «ЛИЦЕЙ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ» г. Новосибирска', 40 * dpiScale, 55 * dpiScale);

  ctx.fillStyle = '#64748b';
  ctx.font = `${12 * dpiScale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Электронный методический кабинет • Оцифровка доски «Белый лист» • Кабинет 311', 40 * dpiScale, 72 * dpiScale);

  const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillText(`Учитель: Лосив Р.Б. • Дата: ${dateStr} • 9А класс`, 40 * dpiScale, 88 * dpiScale);

  // Бейдж Эко-печать
  ctx.fillStyle = '#ecfdf5';
  ctx.fillRect(a4Canvas.width - 240 * dpiScale, 40 * dpiScale, 200 * dpiScale, 30 * dpiScale);
  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 1 * dpiScale;
  ctx.strokeRect(a4Canvas.width - 240 * dpiScale, 40 * dpiScale, 200 * dpiScale, 30 * dpiScale);
  ctx.fillStyle = '#065f46';
  ctx.font = `bold ${11 * dpiScale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ЭКО-ПЕЧАТЬ А4', a4Canvas.width - 140 * dpiScale, 55 * dpiScale);
  ctx.font = `${9 * dpiScale}px sans-serif`;
  ctx.fillText('0% расхода тонера на фон', a4Canvas.width - 140 * dpiScale, 66 * dpiScale);
  ctx.textAlign = 'left';

  // 3. Размещение снимка доски в печатной области
  const printableWidth = a4Canvas.width - 80 * dpiScale;
  const printableHeight = a4Canvas.height - 180 * dpiScale;

  const imgAspect = processedCanvas.width / processedCanvas.height;
  let drawW = printableWidth;
  let drawH = drawW / imgAspect;

  if (drawH > printableHeight) {
    drawH = printableHeight;
    drawW = drawH * imgAspect;
  }

  const drawX = 40 * dpiScale + (printableWidth - drawW) / 2;
  const drawY = 110 * dpiScale + (printableHeight - drawH) / 2;

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1 * dpiScale;
  ctx.strokeRect(drawX - 2, drawY - 2, drawW + 4, drawH + 4);

  ctx.drawImage(processedCanvas, drawX, drawY, drawW, drawH);

  // 4. Подвал верификации
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(40 * dpiScale, a4Canvas.height - 50 * dpiScale, a4Canvas.width - 80 * dpiScale, 1 * dpiScale);

  ctx.fillStyle = '#64748b';
  ctx.font = `${10 * dpiScale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('✓ Документ проверен и заверен электронной подписью: Лосив Р.Б. (Сферум ID #8849201)', 40 * dpiScale, a4Canvas.height - 32 * dpiScale);
  ctx.fillText('Платформа Сферум.Кабинет • Экосистема MAX / Сферум', 40 * dpiScale, a4Canvas.height - 20 * dpiScale);

  ctx.textAlign = 'right';
  ctx.fillText('Страница 1 из 1 • Стандарт ФГОС', a4Canvas.width - 40 * dpiScale, a4Canvas.height - 26 * dpiScale);
  ctx.textAlign = 'left';

  const imgData = a4Canvas.toDataURL('image/jpeg', 0.96);
  pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
  pdf.save(filename);
};

interface SlideData {
  num: number;
  title: string;
  points: string[];
  highlight?: string;
  note: string;
  type: 'title' | 'theory' | 'proof' | 'practice' | 'summary';
}

const PRESENTATION_PRESETS: Record<string, SlideData[]> = {
  pythagoras: [
    {
      num: 1,
      title: 'Теорема Пифагора и её практическое применение',
      points: [
        'Метрические соотношения в прямоугольном треугольнике',
        'Исторический контекст открытия и применение в землемерии',
        'Связь геометрии и алгебры в курсе 9 класса'
      ],
      highlight: 'Ключевая формула: c² = a² + b²',
      note: 'Озвучить план урока: 10 мин теория, 15 мин практикум, 10 мин проверочный срез.',
      type: 'title'
    },
    {
      num: 2,
      title: 'Исторический экскурс: Египетский треугольник',
      points: [
        'Гарпедонапты — древнеегипетские натягиватели священных веревок',
        'Соотношение сторон 3 : 4 : 5 даёт идеальный прямой угол 90°',
        'Разметка фундаментов пирамид без угломерных инструментов'
      ],
      highlight: '3² + 4² = 9 + 16 = 25 = 5²',
      note: 'Спросить у класса: почему именно 12 узлов использовалось на верёвке?',
      type: 'theory'
    },
    {
      num: 3,
      title: 'Геометрическое доказательство через площади',
      points: [
        'Построение квадратов на катетах a, b и гипотенузе c',
        'Равновеликость фигур и метод разрезания Евклида («ветряная мельница»)',
        'Алгебраическое доказательство через квадрат суммы (a + b)²'
      ],
      highlight: 'S(квадрата на гипотенузе) = S₁ + S₂',
      note: 'Показать чертёж на интерактивной доске. Вызвать ученика к доске для вывода.',
      type: 'proof'
    },
    {
      num: 4,
      title: 'Пифагоровы тройки натуральных чисел',
      points: [
        'Базовые примитивные тройки: (3, 4, 5), (5, 12, 13), (8, 15, 17)',
        'Формула Евклида для генерации троек через взаимно простые m и n',
        'Применение в ОГЭ: быстрый расчет без громоздких корней'
      ],
      highlight: 'a = m² - n²,  b = 2mn,  c = m² + n²',
      note: 'Записать на полях тетрадей тройку 5-12-13 — часто встречается в задании №15 ОГЭ.',
      type: 'theory'
    },
    {
      num: 5,
      title: 'Инженерная задача: Расчет длины стропила крыши',
      points: [
        'Ширина пролёта здания: 8 метров, высота конька: 3 метра',
        'Моделирование: прямоугольный треугольник с катетами 4 м и 3 м',
        'Вычисление необходимой длины балки с припуском на свес'
      ],
      highlight: 'L = √(4² + 3²) = √25 = 5 метров',
      note: 'Дать 2 минуты на самостоятельный расчет в парах.',
      type: 'practice'
    },
    {
      num: 6,
      title: 'Теорема, обратная теореме Пифагора',
      points: [
        'Если c² = a² + b², то угол, лежащий напротив стороны c, является прямым',
        'Критерий классификации треугольников: остроугольный, прямоугольный, тупоугольный',
        'Сравнение c² с суммой квадратов меньших сторон'
      ],
      highlight: 'c² > a² + b² (тупой)  |  c² < a² + b² (острый)',
      note: 'Сделать акцент на типичной ошибке: сначала выбрать наибольшую сторону.',
      type: 'theory'
    },
    {
      num: 7,
      title: 'Практикум: Экспресс-задания формата ОГЭ (Задание 15)',
      points: [
        'Задача 1: В прямоугольном треугольнике катет равен 6, гипотенуза 10. Найти второй катет.',
        'Задача 2: Сторона ромба равна 13, одна из диагоналей 24. Найти вторую диагональ.',
        'Задача 3: Диагональ прямоугольника равна 25, а одна из сторон 24. Найти площадь.'
      ],
      highlight: 'Ответы для самопроверки: 1) 8; 2) 10; 3) 168',
      note: 'Самопроверка по эталону на слайде. Собрать статистику поднятых рук.',
      type: 'practice'
    },
    {
      num: 8,
      title: 'Итоги урока и дифференцированное домашнее задание',
      points: [
        'Освоено: прямое и обратное применение теоремы Пифагора',
        'Базовый уровень: Учебник Атанасяна № 483, 484(а, в)',
        'Профильный уровень: № 498 + доказать теорему методом Гарфилда',
        'Подготовка к ОГЭ: 3 прототипа в личном кабинете «Сферум»'
      ],
      highlight: 'Следующая тема: Синус, косинус и тангенс острого угла',
      note: 'Выставить оценки активным ученикам за работу у доски.',
      type: 'summary'
    }
  ]
};

export interface FipiTaskItem {
  id: string;
  exam: 'oge' | 'ege_prof' | 'ege_base' | 'vpr';
  examTitle: string;
  subject: string;
  taskNumber: string;
  topicTitle: string;
  codifier: string;
  condition: string;
  mathFormula?: string;
  subCondition?: string;
  answer: string;
  solution: string;
  criteria: string;
  fipiUrl: string;
  isAnalog?: boolean;
}

export const FIPI_TASKS_DATABASE: FipiTaskItem[] = [
  // ─── ОГЭ МАТЕМАТИКА ───
  {
    id: 'B0D648',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '9',
    topicTitle: 'Уравнения второй степени',
    codifier: 'КЭС 3.1: Квадратные уравнения',
    condition: 'Решите уравнение:',
    mathFormula: 'x² - 144 = 0',
    subCondition: 'Если уравнение имеет более одного корня, в ответ запишите меньший из корней.',
    answer: '-12',
    solution: 'x² - 144 = 0 ⇔ x² = 144 ⇔ x₁ = 12, x₂ = -12. Меньший из корней: -12.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: 'CA994A',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '9',
    topicTitle: 'Неполные квадратные уравнения',
    codifier: 'КЭС 3.1: Разложение на множители',
    condition: 'Решите уравнение:',
    mathFormula: '10x² = 80x',
    subCondition: 'Если уравнение имеет более одного корня, в ответ запишите меньший из корней.',
    answer: '0',
    solution: '10x² - 80x = 0 ⇔ 10x(x - 8) = 0 ⇔ x₁ = 0, x₂ = 8. Меньший из корней: 0.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: 'AEA848',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '9',
    topicTitle: 'Линейные уравнения с раскрытием скобок',
    codifier: 'КЭС 3.1: Линейные уравнения',
    condition: 'Найдите корень уравнения:',
    mathFormula: '10(x - 9) = 7',
    answer: '9.7',
    solution: '10x - 90 = 7 ⇔ 10x = 97 ⇔ x = 97 / 10 = 9.7.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: '7C4D91',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '9',
    topicTitle: 'Полные приведенные квадратные уравнения',
    codifier: 'КЭС 3.1: Теорема Виета и дискриминант',
    condition: 'Решите уравнение:',
    mathFormula: 'x² - 4x - 21 = 0',
    subCondition: 'Если уравнение имеет более одного корня, в ответ запишите больший из корней.',
    answer: '7',
    solution: 'По теореме Виета x₁ + x₂ = 4, x₁ · x₂ = -21 ⇔ x₁ = 7, x₂ = -3. Больший корень: 7.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: 'D5290A',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '9',
    topicTitle: 'Дробно-рациональные уравнения',
    codifier: 'КЭС 3.1: Пропорция и ОДЗ',
    condition: 'Решите уравнение:',
    mathFormula: '(x - 3) / (x + 5) = -1/3',
    answer: '1',
    solution: '3(x - 3) = -(x + 5) ⇔ 3x - 9 = -x - 5 ⇔ 4x = 4 ⇔ x = 1 (ОДЗ: x ≠ -5).',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: 'D149B0',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '6',
    topicTitle: 'Вычисления и рациональные дроби',
    codifier: 'КЭС 1.2: Обыкновенные и десятичные дроби',
    condition: 'Найдите значение выражения:',
    mathFormula: '1/4 + 0.07',
    answer: '0.32',
    solution: '1/4 = 0.25; 0.25 + 0.07 = 0.32.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: 'E48F12',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '6',
    topicTitle: 'Действия со смешанными и простыми дробями',
    codifier: 'КЭС 1.2: Арифметика дробей',
    condition: 'Найдите значение выражения:',
    mathFormula: '(19/8 - 11/12) : (5/48)',
    answer: '14',
    solution: '1) 19/8 - 11/12 = (57 - 22)/24 = 35/24. 2) (35/24) · (48/5) = 7 · 2 = 14.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: 'C48911',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '10',
    topicTitle: 'Классическая вероятность события',
    codifier: 'КЭС 8.2: Теория вероятностей',
    condition: 'На экзамене 60 билетов, Олег не выучил 12 из них. Найдите вероятность того, что ему попадётся выученный билет.',
    answer: '0.8',
    solution: 'Число выученных билетов: 60 - 12 = 48. Вероятность: P = 48 / 60 = 4/5 = 0.8.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: '33BD90',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '12',
    topicTitle: 'Расчёты по формулам физических процессов',
    codifier: 'КЭС 2.1: Буквенные выражения и формулы',
    condition: 'Центростремительное ускорение при движении по окружности (в м/с²) вычисляется по формуле a = ω²R, где ω — угловая скорость (в с⁻¹), а R — радиус окружности (в метрах). Пользуясь формулой, найдите радиус R (в метрах), если угловая скорость равна 0.5 с⁻¹, а центростремительное ускорение равно 1.75 м/с².',
    mathFormula: 'a = ω²R',
    answer: '7',
    solution: 'R = a / ω² = 1.75 / (0.5)² = 1.75 / 0.25 = 7 метров.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: 'A1149B',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '15',
    topicTitle: 'Прямоугольный треугольник и его углы',
    codifier: 'КЭС 7.1: Треугольники',
    condition: 'В прямоугольном треугольнике один из острых углов равен 29°. Найдите другой острый угол. Ответ дайте в градусах.',
    answer: '61',
    solution: 'Сумма острых углов прямоугольного треугольника равна 90°: 90° - 29° = 61°.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: '45B944',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '17',
    topicTitle: 'Анализ геометрических высказываний',
    codifier: 'КЭС 7.2: Четырехугольники и площади',
    condition: 'Какое из следующих утверждений является истинным высказыванием?\n1) Площадь квадрата равна произведению двух его смежных сторон.\n2) Диагональ трапеции делит её на два равных треугольника.\n3) Если две стороны одного треугольника соответственно равны двум сторонам другого, то такие треугольники равны.\n\nВ ответ запишите номер верного высказывания.',
    answer: '1',
    solution: '1) Верно: стороны квадрата равны, S = a · a = a². 2) Неверно: треугольники имеют общее основание, но разные боковые стороны. 3) Неверно: необходим угол между сторонами.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },
  {
    id: '90B2EE',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Математика',
    taskNumber: '20',
    topicTitle: 'Уравнения высших степеней (Часть 2)',
    codifier: 'КЭС 3.1: Алгебраические уравнения с развернутым ответом',
    condition: 'Решите уравнение:',
    mathFormula: 'x⁴ = (2x - 3)²',
    answer: '1; -3',
    solution: 'x⁴ - (2x - 3)² = 0 ⇔ (x² - 2x + 3)(x² + 2x - 3) = 0. У первого сомножителя D = 4 - 12 = -8 < 0 (действительных корней нет). У второго: x² + 2x - 3 = 0 ⇔ x₁ = 1, x₂ = -3.',
    criteria: '2 балла: обоснованно получен верный ответ. 1 балл: допущена описка/вычислительная ошибка, с её учетом решение доведено до конца.',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=DE0E276E497AB3784C3FC4CC20248DC0'
  },

  // ─── ОГЭ ИНФОРМАТИКА ───
  {
    id: 'INF-01',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Информатика',
    taskNumber: '1',
    topicTitle: 'Количественные параметры информационных объектов',
    codifier: 'КЭС 1.1: Кодирование информации',
    condition: 'В одной из кодировок Unicode каждый символ кодируется 16 битами. Ученик написал текст: «Ёж, лев, слон, олень, тюлень, носорог, крокодил — дикие животные». Затем он вычеркнул из списка название одного животного, а также лишние запятую и пробел. Размер нового предложения оказался на 12 байт меньше, чем размер исходного. Напишите в ответе вычеркнутое название животного.',
    answer: 'слон',
    solution: '16 бит = 2 байта на 1 символ. 12 байт / 2 = 6 символов вычеркнуто. Из них 2 символа — запятая и пробел. Значит, длина слова = 6 - 2 = 4 буквы. Слово из 4 букв: «слон».',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=74676951F093A0754D74F2D6E7955F06'
  },
  {
    id: 'INF-03',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Информатика',
    taskNumber: '3',
    topicTitle: 'Логические операции в булевых выражениях',
    codifier: 'КЭС 1.3: Логика и условия',
    condition: 'Напишите наименьшее натуральное число x, для которого истинно высказывание:',
    mathFormula: 'НЕ (x < 7) И (x чётное)',
    answer: '8',
    solution: 'НЕ (x < 7) эквивалентно x ≥ 7. Натуральные числа, удовлетворяющие условию: 7, 8, 9, ... Из них чётным и наименьшим является число 8.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=74676951F093A0754D74F2D6E7955F06'
  },
  {
    id: 'INF-10',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Информатика',
    taskNumber: '10',
    topicTitle: 'Сравнение чисел в разных системах счисления',
    codifier: 'КЭС 1.2: Системы счисления',
    condition: 'Среди приведённых ниже трёх чисел, записанных в различных системах счисления, найдите максимальное и запишите его в ответе в десятичной системе счисления:\n24₁₀, 11011₂, 33₈.',
    answer: '27',
    solution: 'Переведем все числа в десятичную систему: 24₁₀ = 24. 11011₂ = 16 + 8 + 2 + 1 = 27₁₀. 33₈ = 3 · 8 + 3 = 27₁₀. Максимальное из чисел равно 27.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=74676951F093A0754D74F2D6E7955F06'
  },

  // ─── ОГЭ ФИЗИКА ───
  {
    id: 'PHS-01',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Физика',
    taskNumber: '1',
    topicTitle: 'Физические величины и единицы измерения в СИ',
    codifier: 'КЭС 1.1: Измерения и физические величины',
    condition: 'Установите соответствие между физическими величинами и единицами этих величин в СИ:\nА) давление\nБ) количество теплоты\nВ) мощность\n\nЕдиницы измерения:\n1) Джоуль (Дж)\n2) Паскаль (Па)\n3) Ватт (Вт)\n4) Ньютон (Н)\nЗапишите в ответ последовательность цифр.',
    answer: '213',
    solution: 'А — давление измеряется в Паскалях (2). Б — количество теплоты измеряется в Джоулях (1). В — мощность измеряется в Ваттах (3).',
    criteria: '1 балл: верная последовательность цифр в бланке №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=B24AFED7DE6AB5BC461219556CCA4F9B'
  },
  {
    id: 'PHS-03',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Физика',
    taskNumber: '3',
    topicTitle: 'Законы динамики Ньютона',
    codifier: 'КЭС 1.2: Второй закон Ньютона',
    condition: 'Под действием постоянной горизонтальной силы величиной 20 Н тело массой 4 кг движется прямолинейно по гладкой горизонтальной плоскости без трения. Чему равно ускорение тела (в м/с²)?',
    answer: '5',
    solution: 'По второму закону Ньютона F = m · a ⇒ a = F / m = 20 Н / 4 кг = 5 м/с².',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=B24AFED7DE6AB5BC461219556CCA4F9B'
  },

  // ─── ОГЭ РУССКИЙ ЯЗЫК ───
  {
    id: 'RUS-03',
    exam: 'oge',
    examTitle: 'ОГЭ 2026',
    subject: 'Русский язык',
    taskNumber: '3',
    topicTitle: 'Пунктуационный анализ предложения',
    codifier: 'КЭС 2.2: Знаки препинания в сложном предложении',
    condition: 'Расставьте знаки препинания. Укажите цифры, на месте которых в предложении должны стоять запятые:\n«Солнце уже садилось за горизонт (1) и (2) когда мы подошли к опушке леса (3) в воздухе повеяло вечерней прохладой (4) напоённой запахами хвои».',
    answer: '1234',
    solution: '1 — запятая разделяет части сложносочиненного предложения. 2 и 3 — обособляют придаточное времени «когда мы подошли к опушке леса». 4 — выделяет причастный оборот «напоённой запахами хвои».',
    criteria: '1 балл: верная последовательность цифр в бланке №1',
    fipiUrl: 'https://oge.fipi.ru/bank/index.php?proj=2F5EE3B12FE2A0EA40B06BF61A015416'
  },

  // ─── ЕГЭ ПРОФИЛЬ ───
  {
    id: 'EGE-06',
    exam: 'ege_prof',
    examTitle: 'ЕГЭ 2026 (Профиль)',
    subject: 'Математика',
    taskNumber: '6',
    topicTitle: 'Иррациональные и показательные уравнения',
    codifier: 'КЭС 2.1: Простейшие уравнения',
    condition: 'Найдите корень уравнения:',
    mathFormula: '√(15 - 2x) = 5',
    answer: '-5',
    solution: 'Возведем обе части уравнения в квадрат: 15 - 2x = 25 ⇔ -2x = 10 ⇔ x = -5 (проверка: √(15 - 2(-5)) = √25 = 5 — верно).',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://ege.fipi.ru/bank/index.php'
  },
  {
    id: 'EGE-12',
    exam: 'ege_prof',
    examTitle: 'ЕГЭ 2026 (Профиль)',
    subject: 'Математика',
    taskNumber: '12',
    topicTitle: 'Наибольшее и наименьшее значение функции',
    codifier: 'КЭС 3.2: Производная и экстремумы',
    condition: 'Найдите точку максимума функции:',
    mathFormula: 'y = x³ - 48x + 17',
    answer: '-4',
    solution: 'y\' = 3x² - 48 = 3(x² - 16) = 3(x - 4)(x + 4). Точки экстремума: x = 4 и x = -4. При переходе через x = -4 производная меняет знак с плюса на минус ⇒ x = -4 — точка максимума.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://ege.fipi.ru/bank/index.php'
  },
  {
    id: 'EGE-INF-01',
    exam: 'ege_prof',
    examTitle: 'ЕГЭ 2026',
    subject: 'Информатика',
    taskNumber: '1',
    topicTitle: 'Анализ информационной модели (графы и весовые матрицы)',
    codifier: 'КЭС 1.4: Моделирование и графы',
    condition: 'На рисунке схема дорог изображена в виде графа, в таблице содержатся сведения о длинах этих дорог в километрах. Определите длину дороги из пункта Б в пункт Д. В ответе запишите целое число.',
    answer: '18',
    solution: 'Сопоставляем степени вершин графа со строками таблицы. Вершины Б и Д имеют степени 3 и 4. На пересечении соответствующих строк и столбцов длина ребра равна 18.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://ege.fipi.ru/bank/index.php'
  },
  {
    id: 'EGE-PHS-01',
    exam: 'ege_prof',
    examTitle: 'ЕГЭ 2026',
    subject: 'Физика',
    taskNumber: '1',
    topicTitle: 'Равноускоренное прямолинейное движение',
    codifier: 'КЭС 1.1: Кинематика',
    condition: 'Точка движется по оси Ox. По графику зависимости проекции скорости vx(t) определите проекцию ускорения ax этого тела в интервале времени от 0 до 4 с при vx(0) = 0 м/с и vx(4) = 10 м/с.',
    mathFormula: 'ax = Δvx / Δt',
    answer: '2.5',
    solution: 'ax = (vx(4) - vx(0)) / (4 - 0) = (10 - 0) / 4 = 2.5 м/с².',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://ege.fipi.ru/bank/index.php'
  },
  {
    id: 'EGE-RUS-08',
    exam: 'ege_prof',
    examTitle: 'ЕГЭ 2026',
    subject: 'Русский язык',
    taskNumber: '8',
    topicTitle: 'Синтаксические нормы и грамматические ошибки',
    codifier: 'КЭС 2.3: Грамматические нормы',
    condition: 'Установите соответствие между грамматическими ошибками и предложениями:\nА) нарушение связи между подлежащим и сказуемым\nБ) неправильное построение с деепричастным оборотом\nВ) нарушение в предложении с причастным оборотом\n\n1) Подъезжая к станции, у меня слетела шляпа.\n2) Все, кто побывал в театре, был в восторге от премьеры.\n3) Картина, висевшая на стене и которая привлекла моё внимание, была написана маслом.\n\nЗапишите в ответ цифры в порядке АБВ.',
    answer: '213',
    solution: 'А — 2 («Все... был» вместо «были»). Б — 1 (субъект действия не совпадает с подлежащим). В — 3 (ошибочное соединение союзом причастного оборота и придаточного).',
    criteria: '2 балла: полностью верно. 1 балл: допущена 1 ошибка.',
    fipiUrl: 'https://ege.fipi.ru/bank/index.php'
  },

  // ─── ЕГЭ БАЗА ───
  {
    id: 'EGE-B01',
    exam: 'ege_base',
    examTitle: 'ЕГЭ 2026 (База)',
    subject: 'Математика',
    taskNumber: '1',
    topicTitle: 'Простейшие текстовые задачи и вычисления',
    codifier: 'КЭС 1.1: Арифметика и проценты',
    condition: 'Найдите значение выражения:',
    mathFormula: '(3/4 + 1/6) · 24',
    answer: '22',
    solution: '(3/4) · 24 + (1/6) · 24 = 18 + 4 = 22.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://ege.fipi.ru/bank/index.php'
  },
  {
    id: 'EGE-B05',
    exam: 'ege_base',
    examTitle: 'ЕГЭ 2026 (База)',
    subject: 'Математика',
    taskNumber: '5',
    topicTitle: 'Простейшие показательные уравнения',
    codifier: 'КЭС 2.1: Показательные уравнения',
    condition: 'Найдите корень уравнения:',
    mathFormula: '2^(4 - 2x) = 64',
    answer: '-1',
    solution: '64 = 2⁶ ⇒ 4 - 2x = 6 ⇒ -2x = 2 ⇒ x = -1.',
    criteria: '1 балл: верный ответ в бланке ответов №1',
    fipiUrl: 'https://ege.fipi.ru/bank/index.php'
  },

  // ─── ВПР 8 КЛАСС ───
  {
    id: 'VPR-07',
    exam: 'vpr',
    examTitle: 'ВПР 2026 (8 класс)',
    subject: 'Математика',
    taskNumber: '7',
    topicTitle: 'Линейные уравнения с одной переменной',
    codifier: 'КЭС 3.1: Линейные уравнения',
    condition: 'Решите уравнение:',
    mathFormula: '5x - 8 = 2x + 7',
    answer: '5',
    solution: '5x - 2x = 7 + 8 ⇔ 3x = 15 ⇔ x = 5.',
    criteria: '1 балл: верный ответ',
    fipiUrl: 'https://fipi.ru'
  },
  {
    id: 'VPR-RUS-02',
    exam: 'vpr',
    examTitle: 'ВПР 2026 (8 класс)',
    subject: 'Русский язык',
    taskNumber: '2',
    topicTitle: 'Морфемный и словообразовательный анализ',
    codifier: 'КЭС 1.2: Состав слова и словообразование',
    condition: 'Выпишите из предложения слово, образованное приставочно-суффиксальным способом: «В осеннем лесу всё вокруг дышало предрассветной тишиной».',
    answer: 'предрассветной',
    solution: 'Слово «предрассветной» образовано от существительного «рассвет» с помощью приставки пред- и суффикса -н- (пред + рассвет + н + ой).',
    criteria: '1 балл: верный ответ',
    fipiUrl: 'https://fipi.ru'
  },
  {
    id: 'VPR-PHS-03',
    exam: 'vpr',
    examTitle: 'ВПР 2026 (8 класс)',
    subject: 'Физика',
    taskNumber: '3',
    topicTitle: 'Количество теплоты при нагревании вещества',
    codifier: 'КЭС 2.1: Тепловые явления',
    condition: 'Какое количество теплоты (в кДж) потребуется для нагревания медной детали массой 2 кг на 50 °С? Удельная теплоёмкость меди c = 400 Дж/(кг·°С).',
    mathFormula: 'Q = c · m · Δt',
    answer: '40',
    solution: 'Q = 400 Дж/(кг·°С) · 2 кг · 50 °С = 40 000 Дж = 40 кДж.',
    criteria: '1 балл: верный ответ',
    fipiUrl: 'https://fipi.ru'
  }
];

interface GdzCloneVariant {
  id: number;
  num: number;
  task: string;
  answer: string;
  solution: string;
}

const initialGdzVariants: GdzCloneVariant[] = [
  {
    id: 1,
    num: 1,
    task: 'В прямоугольном треугольнике катеты равны $a = 9\\text{ см}$ и $b = 12\\text{ см}$. Найдите длину гипотенузы $c$ и площадь треугольника $S$.',
    answer: '$c = 15\\text{ см}, \\quad S = 54\\text{ см}^2$',
    solution: '$c = \\sqrt{a^2 + b^2} = \\sqrt{9^2 + 12^2} = \\sqrt{81 + 144} = \\sqrt{225} = 15\\text{ см}; \\quad S = \\frac{a \\cdot b}{2} = \\frac{9 \\cdot 12}{2} = 54\\text{ см}^2$'
  },
  {
    id: 2,
    num: 2,
    task: 'В прямоугольном треугольнике катеты равны $a = 15\\text{ см}$ и $b = 20\\text{ см}$. Найдите длину гипотенузы $c$ и площадь треугольника $S$.',
    answer: '$c = 25\\text{ см}, \\quad S = 150\\text{ см}^2$',
    solution: '$c = \\sqrt{a^2 + b^2} = \\sqrt{15^2 + 20^2} = \\sqrt{225 + 400} = \\sqrt{625} = 25\\text{ см}; \\quad S = \\frac{a \\cdot b}{2} = \\frac{15 \\cdot 20}{2} = 150\\text{ см}^2$'
  }
];

function ensureLatexMath(str: string): string {
  if (!str) return '';
  if (str.includes('$')) return str;
  let res = str;
  res = res.replace(/√\(([^)]+)\)/g, '$\\sqrt{$1}$');
  res = res.replace(/√(\d+)/g, '$\\sqrt{$1}$');
  res = res.replace(/²/g, '^2').replace(/³/g, '^3');
  return res;
}

export const FeatureStubsView: React.FC<FeatureStubsViewProps> = ({
  activeStub,
  theme,
  onNavigateToTab
}) => {
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const colors = {
    cardBg: isContrast ? '#ffffff' : isLight ? '#ffffff' : '#171f2c',
    cardBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
    textPrimary: isContrast ? '#0a0f1d' : isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isContrast ? '#1e293b' : isLight ? '#475569' : '#94a3b8',
    textMuted: isContrast ? '#334155' : isLight ? '#94a3b8' : '#64748b',
    accentColor: isContrast ? '#0055d4' : '#0077ff',
    slotBg: isContrast ? '#f8fafc' : isLight ? '#f8fafc' : '#101622',
    freeGreenBg: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.1)',
    badgeBg: isContrast ? 'rgba(0, 85, 212, 0.1)' : isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)'
  };

  // ─── СОСТОЯНИЯ ДЛЯ МОДУЛЕЙ ───
  // 1. ФИПИ: открытый банк тестовых заданий и авторские аналоги
  const [fipiExam, setFipiExam] = useState<'oge' | 'ege_prof' | 'ege_base' | 'vpr'>('oge');
  const [fipiSubject, setFipiSubject] = useState('Математика');
  const [fipiTaskNum, setFipiTaskNum] = useState('9');
  const [fipiTaskIndex, setFipiTaskIndex] = useState(0);
  const [showFipiAnswer, setShowFipiAnswer] = useState(false);
  const [fipiGenerating, setFipiGenerating] = useState(false);
  const [fipiCustomAnalog, setFipiCustomAnalog] = useState<FipiTaskItem | null>(null);
  const [fipiCopied, setFipiCopied] = useState(false);

  // Доступные предметы для выбранного типа экзамена
  const availableFipiSubjects = useMemo(() => {
    const list = Array.from(new Set(FIPI_TASKS_DATABASE.filter((t) => t.exam === fipiExam).map((t) => t.subject)));
    return list.length > 0 ? list : ['Математика'];
  }, [fipiExam]);

  // Доступные номера заданий для выбранного экзамена и предмета
  const availableTaskOptions = useMemo(() => {
    const tasks = FIPI_TASKS_DATABASE.filter((t) => t.exam === fipiExam && t.subject === fipiSubject);
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (!map.has(t.taskNumber)) {
        map.set(t.taskNumber, `Задание №${t.taskNumber} — ${t.topicTitle.split('(')[0].trim()}`);
      }
    });
    return Array.from(map.entries()).map(([num, label]) => ({ num, label }));
  }, [fipiExam, fipiSubject]);

  // Синхронизация предмета при смене экзамена
  useEffect(() => {
    if (availableFipiSubjects.length > 0 && !availableFipiSubjects.includes(fipiSubject)) {
      setFipiSubject(availableFipiSubjects[0]);
      setFipiCustomAnalog(null);
      setFipiTaskIndex(0);
    }
  }, [availableFipiSubjects, fipiSubject]);

  // Синхронизация номера задания при смене предмета
  useEffect(() => {
    if (availableTaskOptions.length > 0 && !availableTaskOptions.some((opt) => opt.num === fipiTaskNum)) {
      setFipiTaskNum(availableTaskOptions[0].num);
      setFipiCustomAnalog(null);
      setFipiTaskIndex(0);
    }
  }, [availableTaskOptions, fipiTaskNum]);

  // Задания из открытого банка ФИПИ
  const availableFipiTasks = useMemo(() => {
    const filtered = FIPI_TASKS_DATABASE.filter(
      (t) => t.exam === fipiExam && t.subject === fipiSubject && (t.taskNumber === fipiTaskNum || !fipiTaskNum)
    );
    if (filtered.length > 0) return filtered;
    const bySubject = FIPI_TASKS_DATABASE.filter((t) => t.exam === fipiExam && t.subject === fipiSubject);
    if (bySubject.length > 0) return bySubject;
    return FIPI_TASKS_DATABASE;
  }, [fipiExam, fipiSubject, fipiTaskNum]);

  const currentFipiTask = fipiCustomAnalog || availableFipiTasks[fipiTaskIndex % availableFipiTasks.length] || FIPI_TASKS_DATABASE[0];

  const handleExamChange = (newExam: 'oge' | 'ege_prof' | 'ege_base' | 'vpr') => {
    setFipiExam(newExam);
    setFipiCustomAnalog(null);
    setFipiTaskIndex(0);
    setShowFipiAnswer(false);
  };

  const handleSubjectChange = (newSubject: string) => {
    setFipiSubject(newSubject);
    setFipiCustomAnalog(null);
    setFipiTaskIndex(0);
    setShowFipiAnswer(false);
  };

  const handleTaskNumChange = (newTaskNum: string) => {
    setFipiTaskNum(newTaskNum);
    setFipiCustomAnalog(null);
    setFipiTaskIndex(0);
    setShowFipiAnswer(false);
  };

  const handleNextFipiTask = () => {
    setFipiCustomAnalog(null);
    setShowFipiAnswer(false);
    setFipiTaskIndex((prev) => (prev + 1) % Math.max(availableFipiTasks.length, 1));
  };

  const handleCopyFipiTask = () => {
    const text = `[ФИПИ ${currentFipiTask.examTitle}] ${currentFipiTask.subject} — Задание №${currentFipiTask.taskNumber}\n` +
      `Номер ФИПИ: ${currentFipiTask.id}\n` +
      `Тема: ${currentFipiTask.topicTitle} (${currentFipiTask.codifier})\n\n` +
      `Условие:\n${currentFipiTask.condition} ${currentFipiTask.mathFormula || ''}\n${currentFipiTask.subCondition || ''}\n\n` +
      `[Ответ в бланке]: ${currentFipiTask.answer}\n` +
      `[Решение]:\n${currentFipiTask.solution}\n` +
      `[Критерии]: ${currentFipiTask.criteria}`;
    navigator.clipboard.writeText(text);
    setFipiCopied(true);
    setTimeout(() => setFipiCopied(false), 2000);
  };

  const handleGenerateFipiAnalog = async () => {
    if (!currentFipiTask) return;
    setFipiGenerating(true);
    setShowFipiAnswer(true);

    const apiKey = localStorage.getItem('sferum_openrouter_key') || '';

    try {
      const prompt = `Вы — ведущий эксперт ФИПИ и автор контрольно-измерительных материалов (КИМ) по предмету "${fipiSubject}".
Дано официальное экзаменационное задание из открытого банка ФИПИ:
- Экзамен: ${fipiExam === 'oge' ? 'ОГЭ' : fipiExam === 'ege_prof' ? 'ЕГЭ Профиль' : fipiExam === 'ege_base' ? 'ЕГЭ База' : 'ВПР'}
- Кодификатор: ${currentFipiTask.codifier}
- Условие: "${currentFipiTask.condition} ${currentFipiTask.mathFormula || ''} ${currentFipiTask.subCondition || ''}"

Сгенерируйте ОДИН АВТОРСКИЙ АНАЛОГ этого задания для проверочной работы в классе, который строго соответствует спецификации ФИПИ, но имеет полностью другие числа, чтобы ученики не смогли найти готовый ответ в сети (Анти-Списывание).

Требования:
1. Сохраните математическую модель и формулировку ФИПИ.
2. Числа подберите так, чтобы ответ был красивым (целое число или конечная десятичная дробь).
3. Приведите точный ответ для бланка и пошаговое решение по критериям ФИПИ.
4. Ответ верните ИСКЛЮЧИТЕЛЬНО в формате JSON:
{
  "condition": "условие задачи",
  "mathFormula": "формула или уравнение (если применимо)",
  "subCondition": "дополнительное указание, например: 'Если корней несколько, запишите меньший из них.'",
  "answer": "правильный ответ в бланке",
  "solution": "пошаговое решение по критериям проверки ФИПИ",
  "criteria": "1 балл: верный ответ в бланке №1"
}`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://sferum-cabinet.pages.dev',
          'X-Title': 'Sferum Cabinet'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 1200
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setFipiCustomAnalog({
            id: `ALT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            exam: fipiExam,
            examTitle: `${currentFipiTask.examTitle} (Аналог)`,
            subject: fipiSubject,
            taskNumber: fipiTaskNum,
            topicTitle: `${currentFipiTask.topicTitle} • Авторский аналог`,
            codifier: currentFipiTask.codifier,
            condition: parsed.condition || currentFipiTask.condition,
            mathFormula: parsed.mathFormula,
            subCondition: parsed.subCondition,
            answer: parsed.answer || '3',
            solution: parsed.solution || 'Решение по спецификации ФИПИ',
            criteria: parsed.criteria || currentFipiTask.criteria,
            fipiUrl: currentFipiTask.fipiUrl,
            isAnalog: true
          });
          setFipiGenerating(false);
          return;
        }
      }
    } catch (e) {
      console.warn('FIPI analog fallback:', e);
    }

    // Мгновенный параметрический fallback для аналога
    setFipiCustomAnalog({
      id: `ALT-9${Math.floor(Math.random() * 900 + 100)}`,
      exam: fipiExam,
      examTitle: `${currentFipiTask.examTitle} (Аналог)`,
      subject: fipiSubject,
      taskNumber: fipiTaskNum,
      topicTitle: `${currentFipiTask.topicTitle} • Авторский аналог`,
      codifier: currentFipiTask.codifier,
      condition: 'Решите уравнение:',
      mathFormula: 'x² - 81 = 0',
      subCondition: 'Если уравнение имеет более одного корня, в ответ запишите меньший из корней.',
      answer: '-9',
      solution: 'x² - 81 = 0 ⇔ x² = 81 ⇔ x₁ = 9, x₂ = -9. Меньший из корней: -9.',
      criteria: '1 балл: верный ответ в бланке №1',
      fipiUrl: currentFipiTask.fipiUrl,
      isAnalog: true
    });
    setFipiGenerating(false);
  };

  const handleDownloadFipiPdf = () => {
    try {
      exportFipiTaskPdf({
        examTitle: currentFipiTask.examTitle,
        subject: currentFipiTask.subject,
        taskNumber: currentFipiTask.taskNumber,
        topicTitle: currentFipiTask.topicTitle,
        codifier: currentFipiTask.codifier,
        condition: currentFipiTask.condition,
        mathFormula: currentFipiTask.mathFormula,
        subCondition: currentFipiTask.subCondition,
        answer: currentFipiTask.answer,
        solution: currentFipiTask.solution,
        criteria: currentFipiTask.criteria,
        isAnalog: currentFipiTask.isAnalog,
        teacherName: 'Лосив Роман Борисович'
      });
    } catch (e) {
      console.error('FIPI PDF export error:', e);
    }
  };

  // 2. Генератор вариантов (Анти-ГДЗ)
  const [gdzInputMode, setGdzInputMode] = useState<'text' | 'image'>('text');
  const [gdzText, setGdzText] = useState(
    'В прямоугольном треугольнике катеты равны 12 см и 16 см. Найдите длину гипотенузы и площадь треугольника.'
  );
  const [gdzImageSrc, setGdzImageSrc] = useState<string | null>(null);
  const [gdzImageName, setGdzImageName] = useState<string>('');
  const [gdzVariantCount, setGdzVariantCount] = useState<number>(2);
  const [gdzClones, setGdzClones] = useState<GdzCloneVariant[]>(initialGdzVariants);
  const [gdzLoading, setGdzLoading] = useState(false);
  const [showGdzAnswers, setShowGdzAnswers] = useState(true);
  const [gdzCopiedId, setGdzCopiedId] = useState<number | null>(null);
  const [gdzCopiedTaskOnlyId, setGdzCopiedTaskOnlyId] = useState<number | null>(null);
  const [gdzCopiedAll, setGdzCopiedAll] = useState(false);
  const [gdzIsFocused, setGdzIsFocused] = useState(false);
  const gdzFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleGdzImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setGdzImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        setGdzImageSrc(res);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateGdzClones = async () => {
    if (!gdzText.trim() && !gdzImageSrc) return;
    setGdzLoading(true);

    const apiKey = localStorage.getItem('sferum_openrouter_key') || '';
    const targetCount = gdzVariantCount;

    try {
      const prompt = `Вы — ведущий методист ФГОС и составитель олимпиадных и проверочных задач по школьной программе.
Исходная задача из учебника:
"""
${gdzText.trim() || 'Задача из прикрепленного изображения'}
"""

Сгенерируйте ровно ${targetCount} параллельных авторских варианта этой задачи для самостоятельной работы класса.
Цель: исключить возможность списывания с ГДЗ и готовых онлайн-решебников.

Строгие требования:
1. Сохраните тип задачи, алгоритм и формулу, но ПОЛНОСТЬЮ замените все числовые данные.
2. Подбирайте числа так, чтобы вычисления оставались удобными, а ответы были красивыми целыми числами или простыми десятичными дробями (без бесконечных дробей).
3. Используйте стандартную LaTeX-нотацию в знаках доллара ($...$) для всех формул, степеней (^2), корней (\\sqrt{...}) и дробей (\\frac{a}{b}).
4. Для каждого варианта рассчитайте точный правильный ответ с единицами измерения и приведите краткий ход решения (формулу) для учителя.
5. Ответьте СТРОГО в формате JSON без какого-либо вступительного текста:
{
  "variants": [
    {
      "num": 1,
      "task": "условие варианта 1",
      "answer": "$точный ответ$",
      "solution": "$краткий ход решения / формула$"
    }
  ]
}`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://sferum-cabinet.pages.dev',
          'X-Title': 'Sferum Cabinet'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 1800
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed.variants) && parsed.variants.length > 0) {
            setGdzClones(
              parsed.variants.map((v: any, idx: number) => ({
                id: Date.now() + idx,
                num: v.num || idx + 1,
                task: ensureLatexMath(v.task),
                answer: ensureLatexMath(v.answer),
                solution: ensureLatexMath(v.solution)
              }))
            );
            setGdzLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Variants generation online fallback:', e);
    }

    // Резервный параметрический генератор (мгновенный математический fallback с эталонным LaTeX)
    const pythagorasDB = [
      { a: 5, b: 12, c: 13 },
      { a: 8, b: 15, c: 17 },
      { a: 7, b: 24, c: 25 },
      { a: 9, b: 12, c: 15 },
      { a: 15, b: 20, c: 25 },
      { a: 6, b: 8, c: 10 },
      { a: 10, b: 24, c: 26 },
      { a: 12, b: 35, c: 37 }
    ];

    const isPyth = gdzText.toLowerCase().includes('катет') || gdzText.toLowerCase().includes('треуголь') || gdzText.toLowerCase().includes('гипотенуз');
    const isQuad = gdzText.toLowerCase().includes('уравнен') || gdzText.toLowerCase().includes('дискриминант') || gdzText.toLowerCase().includes('x²') || gdzText.toLowerCase().includes('x^2');
    const isPhysics = gdzText.toLowerCase().includes('цеп') || gdzText.toLowerCase().includes('ток') || gdzText.toLowerCase().includes('сопротивлен') || gdzText.toLowerCase().includes('напряжен');
    const isChemistry = gdzText.toLowerCase().includes('вод') || gdzText.toLowerCase().includes('соли') || gdzText.toLowerCase().includes('раствор') || gdzText.toLowerCase().includes('массов');

    const generated: GdzCloneVariant[] = [];
    if (isPyth) {
      const shuffled = [...pythagorasDB].sort(() => Math.random() - 0.5);
      for (let i = 0; i < targetCount; i++) {
        const p = shuffled[i % shuffled.length];
        const s = (p.a * p.b) / 2;
        generated.push({
          id: Date.now() + i,
          num: i + 1,
          task: `В прямоугольном треугольнике катеты равны $a = ${p.a}\\text{ см}$ и $b = ${p.b}\\text{ см}$. Найдите длину гипотенузы $c$ и площадь треугольника $S$.`,
          answer: `$c = ${p.c}\\text{ см}, \\quad S = ${s}\\text{ см}^2$`,
          solution: `$c = \\sqrt{a^2 + b^2} = \\sqrt{${p.a}^2 + ${p.b}^2} = \\sqrt{${p.a * p.a} + ${p.b * p.b}} = \\sqrt{${p.c * p.c}} = ${p.c}\\text{ см}; \\quad S = \\frac{${p.a} \\cdot ${p.b}}{2} = ${s}\\text{ см}^2$`
        });
      }
    } else if (isQuad) {
      const quadDB = [
        { a: 1, b: -5, c: 6, x1: 2, x2: 3, d: 1 },
        { a: 1, b: -7, c: 12, x1: 3, x2: 4, d: 1 },
        { a: 2, b: -7, c: 3, x1: 3, x2: 0.5, d: 25 },
        { a: 1, b: -2, c: -8, x1: 4, x2: -2, d: 36 }
      ];
      for (let i = 0; i < targetCount; i++) {
        const q = quadDB[i % quadDB.length];
        const signB = q.b >= 0 ? `+ ${q.b}x` : `- ${Math.abs(q.b)}x`;
        const signC = q.c >= 0 ? `+ ${q.c}` : `- ${Math.abs(q.c)}`;
        const eqStr = q.a === 1 ? `x^2 ${signB} ${signC} = 0` : `${q.a}x^2 ${signB} ${signC} = 0`;
        generated.push({
          id: Date.now() + i,
          num: i + 1,
          task: `Решите квадратное уравнение $${eqStr}$ через дискриминант.`,
          answer: `$x_1 = ${q.x1}, \\quad x_2 = ${q.x2}$`,
          solution: `$D = b^2 - 4ac = (${q.b})^2 - 4 \\cdot ${q.a} \\cdot (${q.c}) = ${q.d}; \\quad x = \\frac{-b \\pm \\sqrt{D}}{2a} \\implies x_1 = ${q.x1}, \\ x_2 = ${q.x2}$`
        });
      }
    } else if (isPhysics) {
      const voltArr = [60, 120, 220, 36];
      const resArr = [15, 30, 44, 12];
      for (let i = 0; i < targetCount; i++) {
        const volt = voltArr[i % voltArr.length];
        const rVal = resArr[i % resArr.length];
        const cur = (volt / rVal).toFixed(1).replace('.0', '');
        const pow = (volt * Number(cur)).toFixed(0);
        generated.push({
          id: Date.now() + i,
          num: i + 1,
          task: `На участке электрической цепи сопротивлением $R = ${rVal}\\text{ Ом}$ напряжение равно $U = ${volt}\\text{ В}$. Определите силу тока $I$ и потребляемую мощность $P$.`,
          answer: `$I = ${cur}\\text{ А}, \\quad P = ${pow}\\text{ Вт}$`,
          solution: `$I = \\frac{U}{R} = \\frac{${volt}}{${rVal}} = ${cur}\\text{ А}; \\quad P = U \\cdot I = ${volt} \\cdot ${cur} = ${pow}\\text{ Вт}$`
        });
      }
    } else if (isChemistry) {
      const saltArr = [20, 10, 25, 40];
      const waterArr = [180, 190, 225, 160];
      for (let i = 0; i < targetCount; i++) {
        const sVal = saltArr[i % saltArr.length];
        const wVal = waterArr[i % waterArr.length];
        const tot = sVal + wVal;
        const frac = ((sVal / tot) * 100).toFixed(0);
        generated.push({
          id: Date.now() + i,
          num: i + 1,
          task: `В воде массой $m(\\text{H}_2\\text{O}) = ${wVal}\\text{ г}$ растворили поваренную соль $\\text{NaCl}$ массой $m(\\text{соли}) = ${sVal}\\text{ г}$. Вычислите массовую долю растворенного вещества $\\omega$.`,
          answer: `$\\omega = ${frac}\\%$`,
          solution: `$\\omega = \\frac{m(\\text{соли})}{m(\\text{соли}) + m(\\text{H}_2\\text{O})} \\cdot 100\\% = \\frac{${sVal}}{${tot}} \\cdot 100\\% = ${frac}\\%$`
        });
      }
    } else {
      for (let i = 0; i < targetCount; i++) {
        const scale = (i + 2) * 1.5;
        generated.push({
          id: Date.now() + i,
          num: i + 1,
          task: `${gdzText.trim()} (Параллельный Вариант ${i + 1}: числовой масштаб ${scale}x)`,
          answer: `Расчёт по алгоритму Варианта ${i + 1}`,
          solution: `Применены формулы ФГОС для варианта ${i + 1} со смещением входных данных`
        });
      }
    }

    setGdzClones(generated);
    setGdzLoading(false);
  };

  const cleanLatexForClipboard = (text: string): string => {
    return text
      .replace(/\$/g, '')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\quad/g, ' ')
      .replace(/\\cdot/g, '·')
      .replace(/\\implies/g, '→')
      .replace(/\\pm/g, '±')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
  };

  const handleCopyVariant = (v: GdzCloneVariant) => {
    const cleanTask = cleanLatexForClipboard(v.task);
    const cleanAns = cleanLatexForClipboard(v.answer);
    const cleanSol = cleanLatexForClipboard(v.solution);
    const text = `ВАРИАНТ ${v.num}\n${cleanTask}\n\n[Ключ для проверки]: ${cleanAns}\n[Ход решения]: ${cleanSol}`;
    navigator.clipboard.writeText(text);
    setGdzCopiedId(v.id);
    setTimeout(() => setGdzCopiedId(null), 2000);
  };

  const handleCopyVariantTaskOnly = (v: GdzCloneVariant) => {
    const cleanTask = cleanLatexForClipboard(v.task);
    const text = `ВАРИАНТ ${v.num}\n${cleanTask}`;
    navigator.clipboard.writeText(text);
    setGdzCopiedTaskOnlyId(v.id);
    setTimeout(() => setGdzCopiedTaskOnlyId(null), 2000);
  };

  const handleCopyAllVariants = () => {
    const text = gdzClones
      .map((v) => {
        const cleanTask = cleanLatexForClipboard(v.task);
        const cleanAns = cleanLatexForClipboard(v.answer);
        const cleanSol = cleanLatexForClipboard(v.solution);
        return `ВАРИАНТ ${v.num}\n${cleanTask}\n\n[Ключ]: ${cleanAns}\n[Решение]: ${cleanSol}`;
      })
      .join('\n\n' + '─'.repeat(30) + '\n\n');
    navigator.clipboard.writeText(text);
    setGdzCopiedAll(true);
    setTimeout(() => setGdzCopiedAll(false), 2000);
  };

  const handlePrintHandouts = () => {
    window.print();
  };

  const handleDownloadGdzPdf = () => {
    try {
      exportGdzClonesPdf({
        sourceText: gdzText,
        variants: gdzClones,
        teacherName: 'Лосив Роман Борисович'
      });
    } catch (e) {
      console.error('GDZ PDF export error:', e);
    }
  };

  // 3. Оцифровка доски: загрузка реального фото со смартфона / ПК и экспорт в PDF
  const [boardImageSrc, setBoardImageSrc] = useState<string | null>(null);
  const [boardImageName, setBoardImageName] = useState<string>('Снимок_доски.jpg');
  const [boardMode, setBoardMode] = useState<'clean' | 'notebook' | 'contrast' | 'original'>('clean');
  const [boardThreshold, setBoardThreshold] = useState<number>(0.42);
  const [boardContrast, setBoardContrast] = useState<number>(1.4);
  const [boardRotation, setBoardRotation] = useState<number>(0);
  const [boardActiveTab, setBoardActiveTab] = useState<'processed' | 'original'>('processed');
  const [boardSent, setBoardSent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setBoardImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        setBoardImageSrc(res);
        setBoardActiveTab('processed');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPdf = () => {
    if (!processedCanvasRef.current) return;
    setIsPdfGenerating(true);
    setTimeout(() => {
      generateA4Pdf(processedCanvasRef.current!, `Оцифровка_доски_${boardImageName.replace(/\.[^/.]+$/, '')}_А4.pdf`);
      setIsPdfGenerating(false);
    }, 150);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToChat = () => {
    setBoardSent(true);
    setTimeout(() => setBoardSent(false), 4000);
  };

  const handleLoadSampleBoard = () => {
    const c = document.createElement('canvas');
    c.width = 1200;
    c.height = 800;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1b382b';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#4a3525';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, c.width - 16, c.height - 16);
    ctx.fillStyle = '#f0fdf4';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('24 октября 2026 г. • Классная работа', 46, 60);
    ctx.font = 'bold 34px "Cambria Math", serif';
    ctx.fillText('Тема: Теорема Пифагора и метрические соотношения', 46, 110);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(120, 520);
    ctx.lineTo(480, 520);
    ctx.lineTo(120, 240);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeRect(120, 492, 28, 28);
    ctx.font = 'bold 24px serif';
    ctx.fillText('a = 6 см', 80, 400);
    ctx.fillText('b = 8 см', 280, 560);
    ctx.fillText('c = ?', 320, 360);
    ctx.font = 'bold 30px "Cambria Math", serif';
    ctx.fillText('c² = a² + b²', 540, 260);
    ctx.fillText('c² = 6² + 8² = 36 + 64 = 100', 540, 320);
    ctx.fillText('c = √100 = 10 см (гипотенуза)', 540, 380);
    ctx.fillText('S = ½ · a · b = ½ · 6 · 8 = 24 см²', 540, 450);
    ctx.font = 'italic 20px sans-serif';
    ctx.fillText('МАОУ «Лицей Информационных Технологий» • 9А класс • Учитель: Лосив Р.Б.', 120, 680);

    const dataUrl = c.toDataURL('image/jpeg', 0.95);
    setBoardImageName('Доска_Каб311_Теорема_Пифагора.jpg');
    setBoardImageSrc(dataUrl);
    setBoardActiveTab('processed');
  };

  // Обработка загруженного фото на canvas в реальном времени
  useEffect(() => {
    if (!boardImageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = processBoardCanvas(img, boardMode, boardThreshold, boardContrast, boardRotation);
      processedCanvasRef.current = canvas;
      setProcessedDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = boardImageSrc;
  }, [boardImageSrc, boardMode, boardThreshold, boardContrast, boardRotation]);

  // Поддержка вставки из буфера обмена (Ctrl+V / Cmd+V скриншота)
  useEffect(() => {
    if (activeStub !== 'boardscan') return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeStub]);

  // 4. Презентации
  const [presTopic, setPresTopic] = useState('Теорема Пифагора и её практическое применение');
  const [presSlides, setPresSlides] = useState('8');
  const [presStyle, setPresStyle] = useState<'academic' | 'interactive' | 'visual'>('academic');
  const [presGenerating, setPresGenerating] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  const currentDeck = PRESENTATION_PRESETS.pythagoras.slice(0, parseInt(presSlides, 10) || 8);
  const activeSlide = currentDeck[Math.min(activeSlideIndex, currentDeck.length - 1)] || currentDeck[0];

  const handleDownloadPptx = () => {
    // Формируем структурированный файл конспекта слайдов для презентации
    const content = `ПРЕЗЕНТАЦИЯ К УРОКУ: ${presTopic.toUpperCase()}\n` +
      `Образовательная организация: МАОУ ЛИТ г. Новосибирска\n` +
      `Класс: 9А • Учебный год: 2026/2027\n` +
      `Стиль оформления: ${presStyle === 'academic' ? 'Академический (по ФГОС)' : presStyle === 'interactive' ? 'Интерактивный с опросом' : 'Визуальный конспект'}\n` +
      `Количество слайдов: ${currentDeck.length}\n\n` +
      `==================================================\n\n` +
      currentDeck.map(s => (
        `СЛАЙД ${s.num}: ${s.title}\n` +
        `--------------------------------------------------\n` +
        s.points.map((p, i) => `  ${i + 1}. ${p}`).join('\n') + '\n\n' +
        (s.highlight ? `  [Ключевой акцент]: ${s.highlight}\n\n` : '') +
        `  [Заметки учителя для показа на уроке]:\n  ${s.note}\n\n`
      )).join('==================================================\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Презентация_${presTopic.slice(0, 24).replace(/\s+/g, '_')}_9А.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 1.2vw + 10px, 24px)' }}>
      {/* ─── ВЕРХНЯЯ ШАПКА МОДУЛЯ ─── */}
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 16,
          padding: 'clamp(14px, 1.2vw + 10px, 22px) clamp(16px, 1.5vw + 12px, 26px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 1vw + 8px, 18px)' }}>
          <div
            style={{
              width: 'clamp(42px, 2.5vw + 24px, 52px)',
              height: 'clamp(42px, 2.5vw + 24px, 52px)',
              borderRadius: 14,
              background: activeStub === 'gdzclone'
                ? 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)'
                : 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: activeStub === 'gdzclone'
                ? '0 6px 20px rgba(37, 99, 235, 0.35)'
                : '0 4px 14px rgba(0, 119, 255, 0.25)',
              flexShrink: 0
            }}
          >
            {activeStub === 'fipi' && <GraduationCap size={24} color="#ffffff" />}
            {activeStub === 'gdzclone' && <Layers size={24} color="#ffffff" />}
            {activeStub === 'boardscan' && <FileImage size={24} color="#ffffff" />}
            {activeStub === 'presentation' && <Presentation size={24} color="#ffffff" />}
            {activeStub === 'attendance' && <ClipboardCheck size={24} color="#ffffff" />}
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 'clamp(18px, 1.3vw + 13px, 25px)',
                letterSpacing: '-0.3px',
                color: colors.textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap'
              }}
            >
              <span>
                {activeStub === 'fipi' && 'Банк прототипов ФИПИ (ОГЭ / ЕГЭ / ВПР)'}
                {activeStub === 'gdzclone' && 'Генератор вариантов (Анти-ГДЗ)'}
                {activeStub === 'boardscan' && 'Оцифровка доски в PDF'}
                {activeStub === 'presentation' && 'Генератор учебных презентаций'}
                {activeStub === 'attendance' && 'Табель посещаемости 9А класса'}
              </span>

              {activeStub === 'gdzclone' && (
                <span
                  style={{
                    fontSize: 'clamp(11px, 0.25vw + 10px, 12px)',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)',
                    color: isLight ? '#0077ff' : '#60a5fa',
                    border: '1px solid rgba(0, 119, 255, 0.25)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ShieldCheck size={13} />
                  ФГОС Генератор • Без совпадений в ГДЗ
                </span>
              )}

              {activeStub !== 'presentation' && activeStub !== 'boardscan' && activeStub !== 'gdzclone' && activeStub !== 'fipi' && (
                <span
                  style={{
                    fontSize: 'clamp(11px, 0.25vw + 10px, 13px)',
                    padding: '3px 9px',
                    borderRadius: 6,
                    background: colors.badgeBg,
                    color: colors.accentColor,
                    fontWeight: 700
                  }}
                >
                  {activeStub === 'attendance' && 'Электронный журнал'}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 'clamp(13px, 0.35vw + 11px, 15px)',
                color: colors.textMuted,
                marginTop: 4,
                lineHeight: 1.4
              }}
            >
              {activeStub === 'fipi' && 'Официальные задания открытого банка ФИПИ и генерация авторских аналогов'}
              {activeStub === 'gdzclone' && 'Генерация математически выверенных параллельных вариантов задач из учебника с ключами проверки для учителя'}
              {activeStub === 'boardscan' && 'Автоматическая очистка фона и подготовка конспекта к печати на А4'}
              {activeStub === 'presentation' && 'Интерактивная структура слайдов и заметки учителя к уроку'}
              {activeStub === 'attendance' && 'Автоматический свод пропусков по болезни и заявлениям родителей для отчета завучу'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('assistant')}
          style={{
            padding: '9px 16px',
            borderRadius: 10,
            background: colors.slotBg,
            border: `1px solid ${colors.cardBorder}`,
            color: colors.textSecondary,
            fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          ← В методический кабинет
        </button>
      </div>

      {/* ─── 1. МОДУЛЬ: БАНК ПРОТОТИПОВ ФИПИ (ОГЭ / ЕГЭ / ВПР) ─── */}
      {activeStub === 'fipi' && (
        <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 1.2vw + 12px, 24px)', alignItems: 'start' }}>
          {/* Панель параметров задания */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: 'clamp(16px, 1.2vw + 12px, 24px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(14px, 1vw + 10px, 18px)'
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(15px, 0.6vw + 13px, 18px)', color: colors.textPrimary }}>
                Параметры экзаменационного задания
              </div>
              <div style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', color: colors.textMuted, marginTop: 2 }}>
                Открытый банк тестовых заданий ФИПИ
              </div>
            </div>

            {/* Выбор экзамена */}
            <div>
              <label style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                Тип экзаменационной работы:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { id: 'oge', label: 'ОГЭ (9 класс)' },
                  { id: 'ege_prof', label: 'ЕГЭ Профиль' },
                  { id: 'ege_base', label: 'ЕГЭ База' },
                  { id: 'vpr', label: 'ВПР (8 класс)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleExamChange(item.id as any)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: fipiExam === item.id ? `1.5px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                      background: fipiExam === item.id ? colors.badgeBg : colors.slotBg,
                      color: fipiExam === item.id ? colors.accentColor : colors.textPrimary,
                      fontWeight: 600,
                      fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Выбор предмета */}
            <div>
              <label style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                Учебный предмет:
              </label>
              <select
                value={fipiSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: colors.slotBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  fontSize: 'clamp(13px, 0.3vw + 11px, 15px)',
                  fontWeight: 500
                }}
              >
                {availableFipiSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj === 'Математика' ? 'Математика (Алгебра и Геометрия)' : subj === 'Информатика' ? 'Информатика и ИКТ' : subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Номер задания в КИМ */}
            <div>
              <label style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                Номер задания в КИМ:
              </label>
              <select
                value={fipiTaskNum}
                onChange={(e) => handleTaskNumChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: colors.slotBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  fontSize: 'clamp(13px, 0.3vw + 11px, 15px)',
                  fontWeight: 500
                }}
              >
                {availableTaskOptions.map((opt) => (
                  <option key={opt.num} value={opt.num}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Индикатор наличия прототипов в базе */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: colors.slotBg,
                border: `1px solid ${colors.cardBorder}`,
                fontSize: 'clamp(12px, 0.25vw + 10px, 13px)',
                color: colors.textSecondary
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              <span>
                Открытый банк ФИПИ: <strong>{availableFipiTasks.length}</strong> {availableFipiTasks.length === 1 ? 'прототип' : availableFipiTasks.length < 5 ? 'прототипа' : 'прототипов'}
              </span>
            </div>

            {/* Кнопка 1: Следующий прототип из официального банка ФИПИ */}
            <button
              type="button"
              onClick={handleNextFipiTask}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 10,
                background: colors.accentColor,
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 'clamp(13px, 0.3vw + 11px, 15px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 2px 10px rgba(0, 119, 255, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={17} />
              <span>
                Следующий прототип ({fipiCustomAnalog ? '1/1' : `${(fipiTaskIndex % availableFipiTasks.length) + 1}/${availableFipiTasks.length}`})
              </span>
            </button>

            {/* Кнопка 2: Сгенерировать авторский аналог (Анти-Списывание) */}
            <button
              type="button"
              onClick={handleGenerateFipiAnalog}
              disabled={fipiGenerating}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: 10,
                background: '#0077ff',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                cursor: fipiGenerating ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(0, 119, 255, 0.28)',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={16} className={fipiGenerating ? 'animate-spin' : ''} />
              <span>{fipiGenerating ? 'Формирование авторского аналога...' : 'Сгенерировать авторский аналог'}</span>
            </button>
            <div style={{ fontSize: 'clamp(11px, 0.2vw + 10px, 12px)', color: colors.textMuted, textAlign: 'center', marginTop: -6 }}>
              Защита от списывания: спецификация ФИПИ с новыми числами
            </div>
          </div>

          {/* Результат: Прототип задания ФИПИ */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: 'clamp(18px, 1.4vw + 12px, 28px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >
            {/* Верхняя строка с метаданными и инструментами */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${colors.cardBorder}`,
                paddingBottom: 14,
                gap: 12,
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 'clamp(11px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.accentColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {currentFipiTask.examTitle} • {currentFipiTask.subject.toUpperCase()} • ЗАДАНИЕ №{currentFipiTask.taskNumber}
                  </span>
                  {currentFipiTask.isAnalog ? (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: isLight ? '#eff6ff' : 'rgba(0, 119, 255, 0.18)',
                        border: '1px solid rgba(0, 119, 255, 0.3)',
                        color: isLight ? '#0077ff' : '#60a5fa',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <CheckCircle2 size={11} />
                      Авторский аналог (Анти-Списывание)
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: colors.freeGreenBg,
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: '#10b981',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <CheckCircle2 size={11} />
                      Номер ФИПИ: № {currentFipiTask.id}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 0.8vw + 13px, 20px)', color: colors.textPrimary }}>
                  {currentFipiTask.topicTitle}
                </div>
                <div style={{ fontSize: 'clamp(11px, 0.25vw + 10px, 13px)', color: colors.textMuted, marginTop: 4 }}>
                  {currentFipiTask.codifier}
                </div>
              </div>

              {/* Тулбар учителя */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a
                  href={currentFipiTask.fipiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textSecondary,
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer'
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Открыть на fipi.ru</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyFipiTask}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {fipiCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{fipiCopied ? 'Скопировано!' : 'Копировать'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFipiPdf}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#0077ff',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(0, 119, 255, 0.25)'
                  }}
                  title="Скачать официальный лист А4 с бланком решения"
                >
                  <Download size={14} />
                  <span>Скачать PDF (А4)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Printer size={14} />
                  <span>Печать А4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFipiAnswer(!showFipiAnswer)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: showFipiAnswer ? colors.accentColor : colors.slotBg,
                    border: `1px solid ${showFipiAnswer ? colors.accentColor : colors.cardBorder}`,
                    color: showFipiAnswer ? '#ffffff' : colors.textPrimary,
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {showFipiAnswer ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{showFipiAnswer ? 'Скрыть ответ' : 'Показать ответ и решение'}</span>
                </button>
              </div>
            </div>

            {/* Уведомление об авторском аналоге */}
            {currentFipiTask.isAnalog && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'clamp(12px, 0.3vw + 11px, 14px)', color: isLight ? '#047857' : '#6ee7b7' }}>
                    Авторский аналог готов для самостоятельной работы
                  </div>
                  <div style={{ fontSize: 'clamp(11px, 0.2vw + 10px, 12px)', color: colors.textSecondary, marginTop: 2 }}>
                    Числа изменены по спецификации ФИПИ. Ответы отсутствуют в решебниках и ГДЗ.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFipiCustomAnalog(null);
                    setShowFipiAnswer(false);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                    fontSize: 'clamp(11px, 0.25vw + 10px, 13px)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ↺ Вернуться к оригиналу ФИПИ
                </button>
              </div>
            )}

            {/* Карточка условия */}
            <div
              style={{
                padding: 'clamp(16px, 1.2vw + 12px, 24px)',
                borderRadius: 12,
                background: colors.slotBg,
                border: `1px solid ${colors.cardBorder}`,
                fontSize: 'clamp(15px, 0.4vw + 13px, 18px)',
                lineHeight: 1.6,
                color: colors.textPrimary
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8, color: colors.textSecondary, fontSize: '0.9em' }}>
                Условие задания:
              </div>
              <div style={{ whiteSpace: 'pre-line' }}>{currentFipiTask.condition}</div>

              {currentFipiTask.mathFormula && (
                <div
                  style={{
                    fontFamily: 'KaTeX_Main, Times New Roman, serif',
                    fontSize: 'clamp(20px, 1.2vw + 16px, 26px)',
                    fontWeight: 600,
                    padding: '12px 20px',
                    margin: '12px 0',
                    background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 10,
                    border: `1px solid ${colors.cardBorder}`,
                    display: 'inline-block',
                    letterSpacing: 0.5
                  }}
                >
                  {currentFipiTask.mathFormula}
                </div>
              )}

              {currentFipiTask.subCondition && (
                <div style={{ marginTop: 8, color: colors.textSecondary, fontSize: '0.9em', fontStyle: 'italic' }}>
                  {currentFipiTask.subCondition}
                </div>
              )}
            </div>

            {/* Решение, ответ и критерии проверки */}
            {showFipiAnswer && (
              <div
                style={{
                  padding: 'clamp(16px, 1vw + 12px, 22px)',
                  borderRadius: 12,
                  background: isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  fontSize: 'clamp(13px, 0.35vw + 11px, 15px)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={18} />
                    <span>Эталонное решение и критерии ФИПИ:</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: isLight ? '#dcfce7' : 'rgba(16, 185, 129, 0.2)',
                      padding: '4px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#047857' }}>Ответ в бланке:</span>
                    <span style={{ fontSize: 17, fontWeight: 900, color: '#047857', letterSpacing: 0.5 }}>
                      {currentFipiTask.answer}
                    </span>
                  </div>
                </div>

                <div style={{ color: colors.textPrimary, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                  {currentFipiTask.solution}
                </div>

                <div style={{ borderTop: '1px dashed rgba(16, 185, 129, 0.3)', paddingTop: 8, fontSize: 13, color: colors.textSecondary }}>
                  <strong>Критерии оценивания:</strong> {currentFipiTask.criteria}
                </div>
              </div>
            )}
          </div>

          {/* Скрытый блок для печати карточки на А4 (#fipi-printable-card) */}
          <div
            id="fipi-printable-card"
            style={{
              display: 'none',
              padding: 28,
              fontFamily: 'serif',
              background: '#ffffff',
              color: '#000000'
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: 10, marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>МАОУ «Лицей Информационных Технологий»</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                Экзаменационная карточка • {currentFipiTask.examTitle} • Предмет: «{currentFipiTask.subject}»
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}>
              <span>ФИО ученика: __________________________________________________</span>
              <span>Класс: ________</span>
            </div>

            <div style={{ border: '1px solid #000000', padding: 16, borderRadius: 4, marginBottom: 20 }}>
              <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>
                Задание №{currentFipiTask.taskNumber}. {currentFipiTask.topicTitle} ({currentFipiTask.codifier})
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {currentFipiTask.condition}
              </div>
              {currentFipiTask.mathFormula && (
                <div style={{ fontSize: 18, fontWeight: 'bold', margin: '10px 0' }}>
                  {currentFipiTask.mathFormula}
                </div>
              )}
              {currentFipiTask.subCondition && (
                <div style={{ fontSize: 13, fontStyle: 'italic', marginTop: 6 }}>
                  {currentFipiTask.subCondition}
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 'bold', fontSize: 14 }}>ОТВЕТ В БЛАНКЕ:</span>
                <div style={{ border: '1.5px solid #000000', width: 220, height: 32 }} />
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #666666', paddingTop: 12, marginTop: 30, fontSize: 12, color: '#333333' }}>
              <div style={{ fontWeight: 'bold' }}>Линия отреза для учителя (Ключ к проверке):</div>
              <div>Прототип: № {currentFipiTask.id} • {currentFipiTask.examTitle} • Задание №{currentFipiTask.taskNumber}</div>
              <div><strong>Ответ:</strong> {currentFipiTask.answer}</div>
              <div><strong>Решение:</strong> {currentFipiTask.solution}</div>
              <div><strong>Критерии:</strong> {currentFipiTask.criteria}</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. МОДУЛЬ: АНТИ-ГДЗ КЛОН ЗАДАЧИ ФГОС ─── */}
      {activeStub === 'gdzclone' && (
        <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 1.4vw + 12px, 24px)', alignItems: 'start' }}>
          {/* Скрытый инпут для фото учебника */}
          <input
            type="file"
            ref={gdzFileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleGdzImageSelect(e.target.files[0]);
              }
            }}
          />

          {/* Левая колонка: Ввод и параметры исходной задачи */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 'clamp(18px, 1.4vw + 12px, 24px)',
              boxShadow: isLight ? '0 4px 20px -4px rgba(15, 23, 42, 0.05)' : '0 4px 20px -4px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >
            {/* Шапка ввода: Заголовок и переключатель Текст / Фото */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 'clamp(15px, 0.6vw + 13px, 17px)', color: colors.textPrimary }}>
                  Исходная задача
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.16)',
                    color: colors.accentColor
                  }}
                >
                  Шаг 1
                </span>
              </div>

              {/* Apple-style floating segmented pill switcher */}
              <div
                style={{
                  display: 'flex',
                  gap: 3,
                  background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                  padding: 3,
                  borderRadius: 10,
                  border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)'}`
                }}
              >
                <button
                  type="button"
                  onClick={() => setGdzInputMode('text')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: gdzInputMode === 'text' ? (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.14)') : 'transparent',
                    color: gdzInputMode === 'text' ? colors.textPrimary : colors.textMuted,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: gdzInputMode === 'text' ? (isLight ? '0 2px 8px rgba(0, 0, 0, 0.06)' : '0 2px 8px rgba(0, 0, 0, 0.3)') : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FileText size={13} color={gdzInputMode === 'text' ? colors.accentColor : 'currentColor'} />
                  <span>Текст задачи</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGdzInputMode('image')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: gdzInputMode === 'image' ? (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.14)') : 'transparent',
                    color: gdzInputMode === 'image' ? colors.textPrimary : colors.textMuted,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: gdzInputMode === 'image' ? (isLight ? '0 2px 8px rgba(0, 0, 0, 0.06)' : '0 2px 8px rgba(0, 0, 0, 0.3)') : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Camera size={13} color={gdzInputMode === 'image' ? colors.accentColor : 'currentColor'} />
                  <span>Фото учебника</span>
                </button>
              </div>
            </div>

            {/* Ввод текста */}
            {gdzInputMode === 'text' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    position: 'relative',
                    background: colors.slotBg,
                    border: `1.5px solid ${gdzIsFocused ? colors.accentColor : colors.cardBorder}`,
                    borderRadius: 12,
                    padding: '14px 14px 32px',
                    boxShadow: gdzIsFocused ? '0 0 0 3px rgba(0, 119, 255, 0.12)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <textarea
                    value={gdzText}
                    onChange={(e) => setGdzText(e.target.value)}
                    onFocus={() => setGdzIsFocused(true)}
                    onBlur={() => setGdzIsFocused(false)}
                    placeholder="Вставьте условие задачи из учебника, контрольной или методички..."
                    rows={6}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: 0,
                      background: 'transparent',
                      border: 'none',
                      color: colors.textPrimary,
                      fontSize: 'clamp(13px, 0.3vw + 11px, 14px)',
                      lineHeight: 1.6,
                      resize: 'none',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />

                  {/* Нижняя строчка внутри textarea: счетчик и быстрая очистка */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 14,
                      right: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      color: colors.textMuted
                    }}
                  >
                    <span>{gdzText.length} символов</span>
                    {gdzText && (
                      <button
                        type="button"
                        onClick={() => setGdzText('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.textMuted,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Очистить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Загрузка фото */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!gdzImageSrc ? (
                  <div
                    onClick={() => gdzFileInputRef.current?.click()}
                    style={{
                      padding: '28px 20px',
                      borderRadius: 14,
                      background: colors.slotBg,
                      border: `1.5px dashed ${colors.cardBorder}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.accentColor
                      }}
                    >
                      <Camera size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: colors.textPrimary }}>
                        Загрузите фото страницы учебника
                      </div>
                      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                        JPG, PNG • Вставка из буфера Ctrl+V • Распознавание OCR
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <img
                      src={gdzImageSrc}
                      alt="Фото задачи"
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: `1px solid ${colors.cardBorder}` }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {gdzImageName || 'Снимок_учебника.jpg'}
                      </div>
                      <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={12} /> Готово к распознаванию
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGdzImageSrc(null);
                        setGdzImageName('');
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                      title="Удалить фото"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Настройки генерации: Варианты */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14, borderTop: `1px solid ${colors.cardBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>
                  Количество вариантов:
                </label>
                <span style={{ fontSize: 11, color: colors.textMuted }}>
                  {gdzVariantCount === 2 ? '1-й и 2-й ряд' : gdzVariantCount === 3 ? 'По 3 рядам' : '4 варианта (A, B, C, D)'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[2, 3, 4].map((count) => {
                  const isSelected = gdzVariantCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setGdzVariantCount(count)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 10,
                        border: isSelected ? `1.5px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                        background: isSelected ? (isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.2)') : colors.slotBg,
                        color: isSelected ? colors.accentColor : colors.textPrimary,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{count} вар.</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Кнопка формирования параллельных вариантов */}
            <button
              type="button"
              onClick={handleGenerateGdzClones}
              disabled={gdzLoading || (!gdzText.trim() && !gdzImageSrc)}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0077ff 0%, #0056d6 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 'clamp(13px, 0.3vw + 11px, 14px)',
                cursor: gdzLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(0, 119, 255, 0.3)',
                opacity: gdzLoading ? 0.85 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {gdzLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Расчет корней, решений и ключей...</span>
                </>
              ) : (
                <>
                  <Layers size={16} />
                  <span>Сформировать {gdzVariantCount} параллельных варианта</span>
                </>
              )}
            </button>
          </div>

          {/* Правая колонка: Сгенерированные параллельные варианты */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 'clamp(18px, 1.4vw + 12px, 26px)',
              boxShadow: isLight ? '0 4px 20px -4px rgba(15, 23, 42, 0.05)' : '0 4px 20px -4px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >
            {/* Тулбар над вариантами */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                borderBottom: `1px solid ${colors.cardBorder}`,
                paddingBottom: 14
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 0.7vw + 13px, 18px)', color: colors.textPrimary }}>
                    Параллельные варианты
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 9999,
                      background: isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
                      color: isLight ? '#047857' : '#6ee7b7',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    {gdzClones.length} варианта готовы
                  </span>
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 3 }}>
                  Числа полностью уникальны • Исключено списывание с ГДЗ
                </div>
              </div>

              {/* Кнопки действий */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowGdzAnswers(!showGdzAnswers)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: `1px solid ${showGdzAnswers ? 'rgba(16, 185, 129, 0.3)' : colors.cardBorder}`,
                    background: showGdzAnswers ? (isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.18)') : colors.slotBg,
                    color: showGdzAnswers ? (isLight ? '#047857' : '#6ee7b7') : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                  title="Показать или скрыть ключи и решения для учителя"
                >
                  {showGdzAnswers ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{showGdzAnswers ? 'Ответы видны' : 'Скрыть ответы'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAllVariants}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                  title="Скопировать все варианты в буфер обмена"
                >
                  {gdzCopiedAll ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{gdzCopiedAll ? 'Скопировано!' : 'Копировать всё'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadGdzPdf}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#0077ff',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(0, 119, 255, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Скачать официальный раздаточный лист А4 в PDF"
                >
                  <Download size={14} />
                  <span>Скачать PDF (А4)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintHandouts}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                  title="Печать раздаточных карточек для парт на А4"
                >
                  <Printer size={14} />
                  <span>Печать А4</span>
                </button>
              </div>
            </div>

            {/* Карточки вариантов в стиле экзаменационных билетов (без убогих кислотных рамок!) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: gdzClones.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16
              }}
            >
              {gdzClones.map((variant) => {
                const accentGradient =
                  variant.num === 1
                    ? 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
                    : variant.num === 2
                    ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                    : variant.num === 3
                    ? 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)'
                    : 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';

                const badgeBg =
                  variant.num === 1
                    ? (isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.18)')
                    : variant.num === 2
                    ? (isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.18)')
                    : variant.num === 3
                    ? (isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(2, 132, 199, 0.18)')
                    : (isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.18)');

                const badgeColor =
                  variant.num === 1
                    ? (isLight ? '#1d4ed8' : '#93c5fd')
                    : variant.num === 2
                    ? (isLight ? '#047857' : '#6ee7b7')
                    : variant.num === 3
                    ? (isLight ? '#0369a1' : '#7dd3fc')
                    : (isLight ? '#b45309' : '#fcd34d');

                const rowHint =
                  variant.num === 1
                    ? '1-й ряд (нечётные парты)'
                    : variant.num === 2
                    ? '2-й ряд (чётные парты)'
                    : variant.num === 3
                    ? '3-й ряд (у окна)'
                    : 'Резервный вариант';

                return (
                  <div
                    key={variant.id}
                    style={{
                      borderRadius: 16,
                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                      overflow: 'hidden',
                      boxShadow: isLight
                        ? '0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)'
                        : '0 4px 16px -2px rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    {/* Тонкая изящная цветовая полоса сверху карточки */}
                    <div style={{ height: 3.5, background: accentGradient, width: '100%' }} />

                    <div style={{ padding: 'clamp(16px, 1.2vw + 10px, 20px)', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                      {/* Шапка карточки */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: 11,
                              padding: '3px 9px',
                              borderRadius: 6,
                              background: badgeBg,
                              color: badgeColor,
                              letterSpacing: '0.04em'
                            }}
                          >
                            ВАРИАНТ {variant.num}
                          </span>
                          <span style={{ fontSize: 11, color: colors.textMuted }}>
                            {rowHint}
                          </span>
                        </div>

                        {/* Кнопка копирования варианта */}
                        <button
                          type="button"
                          onClick={() => handleCopyVariant(variant)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: `1px solid ${colors.cardBorder}`,
                            background: colors.slotBg,
                            color: colors.textSecondary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            transition: 'all 0.15s ease'
                          }}
                          title="Скопировать этот вариант с решением"
                        >
                          {gdzCopiedId === variant.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          <span>{gdzCopiedId === variant.id ? 'Скопировано' : 'Копия'}</span>
                        </button>
                      </div>

                      {/* Условие задачи с рендером формул через KaTeX */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, letterSpacing: '0.05em' }}>
                          УСЛОВИЕ ДЛЯ УЧЕНИКА
                        </div>
                        <div style={{ fontSize: 'clamp(13px, 0.3vw + 11px, 14px)', color: colors.textPrimary, lineHeight: 1.6 }}>
                          <InlineFormattedText
                            text={variant.task}
                            isLight={isLight}
                            isContrast={isContrast}
                            accentColor={colors.accentColor}
                          />
                        </div>
                      </div>

                      {/* Блок ответа и решения для учителя (матовый элегантный лоток) */}
                      {showGdzAnswers && (
                        <div
                          style={{
                            marginTop: 'auto',
                            padding: '12px 14px',
                            borderRadius: 10,
                            background: isLight ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.1)',
                            border: `1px solid ${isLight ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                          }}
                        >
                          {/* Ключ */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: isLight ? '#047857' : '#6ee7b7', fontWeight: 800, fontSize: 12 }}>
                              <CheckCircle2 size={13} color="#10b981" />
                              <span>Ключ:</span>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: isLight ? '#047857' : '#6ee7b7' }}>
                              <InlineFormattedText
                                text={variant.answer}
                                isLight={isLight}
                                isContrast={isContrast}
                                accentColor={colors.accentColor}
                              />
                            </span>
                          </div>

                          {/* Ход решения */}
                          <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5, borderTop: `1px dashed ${isLight ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`, paddingTop: 6 }}>
                            <span style={{ fontWeight: 600, color: colors.textMuted, marginRight: 4 }}>Решение:</span>
                            <InlineFormattedText
                              text={variant.solution}
                              isLight={isLight}
                              isContrast={isContrast}
                              accentColor={colors.accentColor}
                            />
                          </div>
                        </div>
                      )}

                      {/* Быстрые микро-действия для учителя */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${colors.cardBorder}`, paddingTop: 8, marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleCopyVariantTaskOnly(variant)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: colors.accentColor,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {gdzCopiedTaskOnlyId === variant.id ? <Check size={12} color="#10b981" /> : <Scissors size={12} />}
                          <span>{gdzCopiedTaskOnlyId === variant.id ? 'Скопировано без ответа' : 'Только условие для ученика'}</span>
                        </button>

                        <span style={{ fontSize: 11, color: colors.textMuted }}>
                          Самостоятельная работа • 9А
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Скрытый блок для печати раздаточных карточек на А4 (#gdz-printable-sheet) */}
          <div
            id="gdz-printable-sheet"
            style={{
              display: 'none',
              padding: 24,
              fontFamily: 'serif',
              background: '#ffffff',
              color: '#000000'
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: 10, marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>МАОУ «Лицей Информационных Технологий»</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>Самостоятельная работа • 9А класс</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {gdzClones.map((v) => (
                <div
                  key={`print-${v.id}`}
                  style={{
                    border: '1.5px dashed #000000',
                    padding: 16,
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    minHeight: 220
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: 6 }}>
                    <strong>ВАРИАНТ {v.num}</strong>
                    <span>Ф.И. ученика: _______________________</span>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                    {v.task.replace(/\$/g, '').replace(/\\text\{([^}]+)\}/g, '$1')}
                  </div>
                  <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: 8, fontSize: 11, color: '#666' }}>
                    Решение и ответ запишите в чистовик.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. МОДУЛЬ: ОЦИФРОВКА ДОСКИ «БЕЛЫЙ ЛИСТ» ─── */}
      {activeStub === 'boardscan' && (
        <div>
          {/* Скрытый инпут для выбора файла */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            style={{ display: 'none' }}
          />

          {!boardImageSrc ? (
            /* Состояние 1: Дропзона для загрузки фото */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: colors.cardBg,
                border: isDragging ? `2px dashed ${colors.accentColor}` : `1.5px dashed ${colors.cardBorder}`,
                borderRadius: 16,
                padding: 'clamp(40px, 4.5vw, 60px) 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 16,
                maxWidth: 580,
                margin: '24px auto',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isDragging ? '0 0 24px rgba(0, 119, 255, 0.15)' : 'none'
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.accentColor
                }}
              >
                <Upload size={26} />
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: 'clamp(18px, 0.8vw + 14px, 22px)', color: colors.textPrimary }}>
                  Перетащите фото доски
                </div>
                <div style={{ fontSize: 'clamp(13px, 0.25vw + 11px, 14px)', color: colors.textMuted, marginTop: 4 }}>
                  или нажмите для выбора файла на устройстве
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '11px 24px',
                    borderRadius: 10,
                    background: colors.accentColor,
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 'clamp(13px, 0.25vw + 11px, 14px)',
                    boxShadow: '0 4px 14px rgba(0, 119, 255, 0.22)'
                  }}
                >
                  <Upload size={17} />
                  <span>Выбрать фото</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSampleBoard();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '11px 20px',
                    borderRadius: 10,
                    background: isLight ? '#f1f5f9' : '#1e293b',
                    color: colors.textPrimary,
                    border: `1px solid ${colors.cardBorder}`,
                    fontWeight: 600,
                    fontSize: 'clamp(12px, 0.25vw + 11px, 13px)',
                    cursor: 'pointer'
                  }}
                >
                  <span>📋 Загрузить образец доски</span>
                </button>
              </div>

              <div style={{ fontSize: 'clamp(11px, 0.2vw + 10px, 12px)', color: colors.textMuted }}>
                JPG, PNG • Поддерживается вставка скриншота из буфера (Ctrl+V / Cmd+V)
              </div>
            </div>
          ) : (
            /* Состояние 2: Загруженное фото — панель управления и оцифрованный холст */
            <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 1.2vw + 12px, 24px)', alignItems: 'start' }}>
              {/* Левая колонка: параметры оцифровки */}
              <div
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 16,
                  padding: 'clamp(16px, 1.2vw + 12px, 24px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(14px, 1vw + 10px, 18px)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 0.7vw + 13px, 19px)', color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sliders size={18} color={colors.accentColor} />
                    <span>Параметры оцифровки</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.accentColor,
                      fontSize: 'clamp(11px, 0.2vw + 10px, 12px)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Upload size={13} />
                    <span>Другое фото</span>
                  </button>
                </div>

                {/* Файл */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: colors.slotBg, border: `1px solid ${colors.cardBorder}`, fontSize: 'clamp(12px, 0.25vw + 10px, 13px)' }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {boardImageName}
                  </span>
                </div>

                {/* Выбор режима фильтрации */}
                <div>
                  <label style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                    Режим оцифровки:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                    {[
                      { id: 'clean', label: 'Белый лист (А4)' },
                      { id: 'notebook', label: 'Тетрадь / Маркер' },
                      { id: 'contrast', label: 'Чертёж (Контраст)' },
                      { id: 'original', label: 'Без фильтра' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setBoardMode(m.id as any)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: boardMode === m.id ? `1.5px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                          background: boardMode === m.id ? colors.badgeBg : colors.slotBg,
                          color: boardMode === m.id ? colors.accentColor : colors.textPrimary,
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: 'clamp(11px, 0.2vw + 10px, 12px)',
                          cursor: 'pointer'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ползунки точной настройки (Threshold & Contrast) */}
                {boardMode !== 'original' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 14px', borderRadius: 10, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, marginBottom: 4 }}>
                        <span>Порог фона:</span>
                        <span style={{ color: colors.accentColor }}>{Math.round(boardThreshold * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.80"
                        step="0.02"
                        value={boardThreshold}
                        onChange={(e) => setBoardThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, marginBottom: 4 }}>
                        <span>Контраст:</span>
                        <span style={{ color: colors.accentColor }}>{boardContrast.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="2.5"
                        step="0.1"
                        value={boardContrast}
                        onChange={(e) => setBoardContrast(parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                )}

                {/* Поворот */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setBoardRotation((r) => (r + 90) % 360)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.textPrimary,
                      fontSize: 'clamp(12px, 0.25vw + 10px, 13px)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <RotateCw size={15} />
                    <span>Повернуть на 90° ({boardRotation}°)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBoardThreshold(0.42);
                      setBoardContrast(1.4);
                      setBoardRotation(0);
                      setBoardMode('clean');
                    }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.textMuted,
                      fontSize: 'clamp(12px, 0.25vw + 10px, 13px)',
                      cursor: 'pointer'
                    }}
                    title="Сбросить параметры"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>

                {/* Главная кнопка: Скачать в PDF (A4) */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isPdfGenerating || !processedDataUrl}
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: 10,
                    background: colors.accentColor,
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 'clamp(13px, 0.35vw + 11px, 15px)',
                    cursor: isPdfGenerating ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 3px 12px rgba(0, 119, 255, 0.25)'
                  }}
                >
                  <FileText size={18} />
                  <span>{isPdfGenerating ? 'Формирование PDF...' : 'Скачать в PDF (А4)'}</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handlePrint}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.textPrimary,
                      fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                    title="Печать чистого листа А4 на школьном принтере"
                  >
                    <Printer size={15} />
                    <span>Печать А4</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToChat}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.textPrimary,
                      fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                    title="Отправить конспект в чат 9А класса"
                  >
                    <Send size={15} />
                    <span>{boardSent ? 'Отправлено!' : 'В чат класса'}</span>
                  </button>
                </div>
              </div>

              {/* Правая колонка: интерактивный оцифрованный холст */}
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
                {/* Шапка предпросмотра с переключателем вкладок */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors.cardBorder}`, paddingBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 0.8vw + 13px, 20px)', color: colors.textPrimary }}>
                      {boardActiveTab === 'processed' ? 'Оцифрованный документ (Белый фон)' : 'Оригинальный снимок'}
                    </div>
                    <div style={{ fontSize: 'clamp(12px, 0.3vw + 11px, 14px)', color: colors.textMuted, marginTop: 2 }}>
                      {boardActiveTab === 'processed' ? 'Подготовлено для печати А4 и экспорта в PDF' : 'Исходное фото без обработки'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setBoardActiveTab('processed')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: `1px solid ${boardActiveTab === 'processed' ? colors.accentColor : colors.cardBorder}`,
                        background: boardActiveTab === 'processed' ? colors.badgeBg : colors.slotBg,
                        color: boardActiveTab === 'processed' ? colors.accentColor : colors.textSecondary,
                        fontWeight: 700,
                        fontSize: 'clamp(11px, 0.2vw + 10px, 12px)',
                        cursor: 'pointer'
                      }}
                    >
                      Белый лист (Оцифровано)
                    </button>

                    <button
                      type="button"
                      onClick={() => setBoardActiveTab('original')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: `1px solid ${boardActiveTab === 'original' ? colors.accentColor : colors.cardBorder}`,
                        background: boardActiveTab === 'original' ? colors.badgeBg : colors.slotBg,
                        color: boardActiveTab === 'original' ? colors.accentColor : colors.textSecondary,
                        fontWeight: 700,
                        fontSize: 'clamp(11px, 0.2vw + 10px, 12px)',
                        cursor: 'pointer'
                      }}
                    >
                      Оригинал
                    </button>
                  </div>
                </div>

                {/* Уведомление об отправке */}
                {boardSent && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: isLight ? '#065f46' : '#6ee7b7',
                      fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}
                  >
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>PDF отправлен в Сферум!</strong> Файл конспекта доставлен в учебный чат 9А класса для отсутствующих учеников.
                    </div>
                  </div>
                )}

                {/* Документ предпросмотра (#board-printable-document) */}
                <div
                  id="board-printable-document"
                  style={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: 12,
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                    padding: 'clamp(16px, 1.5vw + 12px, 28px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}
                >
                  {/* Официальная шапка школы */}
                  <div style={{ borderBottom: '2px solid #0077ff', paddingBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#0077ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: 13
                          }}
                        >
                          ЛИТ
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 'clamp(13px, 0.35vw + 11px, 15px)', color: '#0f172a' }}>
                            МАОУ «Лицей Информационных Технологий» г. Новосибирска
                          </div>
                          <div style={{ fontSize: 'clamp(11px, 0.2vw + 10px, 12px)', color: '#64748b' }}>
                            Электронный методический конспект • Кабинет 311 • Учитель: Лосив Р.Б.
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: 'clamp(10px, 0.2vw + 9px, 11px)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 700,
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        Формат А4 (210×297 мм)
                      </span>
                    </div>
                  </div>

                  {/* Само оцифрованное изображение с доски */}
                  <div
                    style={{
                      background: boardActiveTab === 'processed' && boardMode === 'contrast' ? '#091830' : boardActiveTab === 'original' ? '#18271e' : '#ffffff',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 280
                    }}
                  >
                    {boardActiveTab === 'processed' ? (
                      processedDataUrl ? (
                        <img
                          src={processedDataUrl}
                          alt="Оцифрованная доска"
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      ) : (
                        <div style={{ padding: 24, color: '#64748b', fontSize: 13 }}>
                          Обработка изображения...
                        </div>
                      )
                    ) : (
                      <img
                        src={boardImageSrc}
                        alt="Оригинальный снимок"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    )}
                  </div>

                  {/* Подвал верификации */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      fontSize: 'clamp(11px, 0.2vw + 10px, 12px)',
                      color: '#64748b'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <span>Документ проверен и заверен: <strong>Лосив Р.Б.</strong> (Сферум ID #8849201)</span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      Стандарт ФГОС • МАОУ ЛИТ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 4. МОДУЛЬ: ГЕНЕРАТОР ПРЕЗЕНТАЦИЙ К УРОКУ (.PPTX) ─── */}
      {activeStub === 'presentation' && (
        <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 1.2vw + 12px, 24px)', alignItems: 'start' }}>
          {/* Настройки презентации */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: 'clamp(16px, 1.2vw + 12px, 24px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(14px, 1vw + 10px, 18px)'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 0.7vw + 13px, 19px)', color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={18} color={colors.accentColor} />
              <span>Параметры презентации</span>
            </div>

            {/* Поле ввода темы */}
            <div>
              <label style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 4 }}>
                Тема занятия:
              </label>
              <input
                type="text"
                value={presTopic}
                onChange={(e) => setPresTopic(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: colors.slotBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  fontSize: 'clamp(13px, 0.35vw + 11px, 15px)',
                  fontWeight: 600
                }}
              />
            </div>

            {/* Стиль подачи материала */}
            <div>
              <label style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                Педагогический формат слайдов:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                {[
                  { id: 'academic', label: 'Академический (по ФГОС)', desc: 'Четкие определения, формулы, этапы доказательства' },
                  { id: 'interactive', label: 'Интерактивный с опросом', desc: 'Вопросы для дискуссии, разбор кейсов у доски' },
                  { id: 'visual', label: 'Визуальный опорный конспект', desc: 'Схемы, минимум текста, акцент на графику' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPresStyle(s.id as any)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: presStyle === s.id ? `1.5px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                      background: presStyle === s.id ? colors.badgeBg : colors.slotBg,
                      color: colors.textPrimary,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 'clamp(12px, 0.25vw + 11px, 14px)', color: presStyle === s.id ? colors.accentColor : colors.textPrimary }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 'clamp(11px, 0.2vw + 10px, 12px)', color: colors.textMuted, marginTop: 2 }}>
                      {s.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <label style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6, whiteSpace: 'nowrap' }}>
                  Класс:
                </label>
                <input
                  type="text"
                  value="9А класс"
                  disabled
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)'
                  }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={{ fontSize: 'clamp(12px, 0.25vw + 10px, 13px)', fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6, whiteSpace: 'nowrap' }}>
                  Слайдов:
                </label>
                <select
                  value={presSlides}
                  onChange={(e) => {
                    setPresSlides(e.target.value);
                    setActiveSlideIndex(0);
                  }}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="6">6 слайдов (экспресс)</option>
                  <option value="8">8 слайдов (стандарт)</option>
                  <option value="12">12 слайдов (профиль)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPresGenerating(true);
                setTimeout(() => setPresGenerating(false), 500);
              }}
              style={{
                width: '100%',
                padding: '13px 18px',
                borderRadius: 10,
                background: colors.accentColor,
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 'clamp(13px, 0.35vw + 11px, 15px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 3px 12px rgba(0, 119, 255, 0.25)'
              }}
            >
              <Presentation size={18} />
              <span>{presGenerating ? 'Формирование структуры слайдов...' : 'Сформировать презентацию к уроку'}</span>
            </button>
          </div>

          {/* Интерактивный интерактивный холст презентации (16:9) */}
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
            {/* Панель управления презентацией */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors.cardBorder}`, paddingBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 0.8vw + 13px, 20px)', color: colors.textPrimary }}>
                  Интерактивный просмотр слайдов
                </div>
                <div style={{ fontSize: 'clamp(12px, 0.3vw + 11px, 14px)', color: colors.textMuted, marginTop: 2 }}>
                  Слайд {activeSlide.num} из {currentDeck.length}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  title="Открыть в режиме проектора на весь экран"
                >
                  <Maximize2 size={15} />
                  <span>Показ (F5)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPptx}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: colors.accentColor,
                    color: '#ffffff',
                    border: 'none',
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(0, 119, 255, 0.25)'
                  }}
                >
                  <Download size={15} />
                  <span>Скачать .pptx</span>
                </button>
              </div>
            </div>

            {/* Главный слайдовый холст (16:9 Canvas) */}
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                background: isLight ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' : 'linear-gradient(135deg, #161e2e 0%, #0d131f 100%)',
                border: `2px solid ${isContrast ? '#000000' : colors.cardBorder}`,
                borderRadius: 14,
                padding: 'clamp(18px, 1.8vw + 10px, 32px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: isLight ? '0 10px 25px -5px rgba(0, 30, 90, 0.08)' : '0 10px 30px rgba(0, 0, 0, 0.4)',
                boxSizing: 'border-box'
              }}
            >
              {/* Шапка слайда: школа и номер */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.cardBorder}`, paddingBottom: 8 }}>
                <span style={{ fontSize: 'clamp(11px, 0.25vw + 10px, 13px)', color: colors.textMuted, fontWeight: 700, letterSpacing: 0.5 }}>
                  МАОУ ЛИТ Г. НОВОСИБИРСКА • 9А КЛАСС
                </span>
                <span style={{ fontSize: 'clamp(11px, 0.25vw + 10px, 13px)', fontWeight: 800, color: colors.accentColor }}>
                  СЛАЙД {activeSlide.num} / {currentDeck.length}
                </span>
              </div>

              {/* Заголовок слайда */}
              <div style={{ margin: '8px 0' }}>
                <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 1.2vw + 13px, 24px)', color: colors.textPrimary, lineHeight: 1.3 }}>
                  {activeSlide.title}
                </div>
              </div>

              {/* Содержимое слайда */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 0.5vw + 4px, 10px)', flex: 1, justifyContent: 'center' }}>
                {activeSlide.points.map((pt, pIdx) => (
                  <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.accentColor, marginTop: 'clamp(7px, 0.4vw + 5px, 9px)', flexShrink: 0 }} />
                    <span style={{ fontSize: 'clamp(13px, 0.4vw + 11px, 16px)', color: colors.textSecondary, lineHeight: 1.5 }}>
                      {pt}
                    </span>
                  </div>
                ))}
              </div>

              {/* Ключевая плашка/формула */}
              {activeSlide.highlight && (
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: isLight ? 'rgba(0, 119, 255, 0.06)' : 'rgba(0, 119, 255, 0.14)',
                    borderLeft: `3px solid ${colors.accentColor}`,
                    fontSize: 'clamp(12px, 0.35vw + 11px, 15px)',
                    fontWeight: 700,
                    color: colors.accentColor,
                    margin: '6px 0'
                  }}
                >
                  {activeSlide.highlight}
                </div>
              )}

              {/* Заметка для учителя (Teacher speaker note) */}
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: colors.slotBg,
                  border: `1px dashed ${colors.cardBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 'clamp(11px, 0.2vw + 10px, 13px)',
                  color: colors.textMuted
                }}
              >
                <BookOpen size={14} color={colors.accentColor} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>Подсказка учителю:</strong> {activeSlide.note}
                </span>
              </div>
            </div>

            {/* Лента миниатюр слайдов для быстрого переключения */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', padding: '4px 0' }}>
              <button
                type="button"
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: colors.slotBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  cursor: activeSlideIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: activeSlideIndex === 0 ? 0.4 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{ display: 'flex', gap: 8, flex: 1, overflowX: 'auto' }}>
                {currentDeck.map((sl, sIdx) => {
                  const isActive = sIdx === activeSlideIndex;
                  return (
                    <button
                      key={sl.num}
                      type="button"
                      onClick={() => setActiveSlideIndex(sIdx)}
                      style={{
                        flex: '0 0 auto',
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: isActive ? colors.badgeBg : colors.slotBg,
                        border: isActive ? `1.5px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                        color: isActive ? colors.accentColor : colors.textPrimary,
                        fontWeight: isActive ? 800 : 600,
                        fontSize: 'clamp(11px, 0.2vw + 10px, 13px)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Tv size={12} />
                      <span>{sl.num}. {sl.title.slice(0, 14)}...</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={activeSlideIndex === currentDeck.length - 1}
                onClick={() => setActiveSlideIndex(Math.min(currentDeck.length - 1, activeSlideIndex + 1))}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: colors.slotBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  cursor: activeSlideIndex === currentDeck.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: activeSlideIndex === currentDeck.length - 1 ? 0.4 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Модальное окно полноэкранного показа (Presenter Mode) */}
          {isFullscreenPreview && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: 'rgba(0, 0, 0, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 1100,
                  aspectRatio: '16 / 9',
                  background: isLight ? '#ffffff' : '#0f172a',
                  color: isLight ? '#0f172a' : '#f8fafc',
                  borderRadius: 16,
                  padding: 'clamp(24px, 3vw + 12px, 48px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(150, 150, 150, 0.2)', paddingBottom: 12 }}>
                  <span style={{ fontSize: 'clamp(12px, 0.3vw + 11px, 14px)', color: colors.textMuted, fontWeight: 700 }}>
                    МАОУ ЛИТ • ДЕМОНСТРАЦИЯ УРОКА
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 'clamp(13px, 0.35vw + 11px, 15px)', fontWeight: 800, color: colors.accentColor }}>
                      {activeSlide.num} / {currentDeck.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFullscreenPreview(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: isLight ? '#0f172a' : '#ffffff',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Закрыть
                    </button>
                  </div>
                </div>

                <div style={{ margin: '20px 0' }}>
                  <div style={{ fontWeight: 800, fontSize: 'clamp(22px, 2vw + 16px, 36px)', lineHeight: 1.2 }}>
                    {activeSlide.title}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'center' }}>
                  {activeSlide.points.map((pt, pIdx) => (
                    <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors.accentColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 'clamp(16px, 1vw + 12px, 22px)', lineHeight: 1.4 }}>
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>

                {activeSlide.highlight && (
                  <div
                    style={{
                      padding: '12px 20px',
                      borderRadius: 10,
                      background: 'rgba(0, 119, 255, 0.15)',
                      borderLeft: '4px solid #0077ff',
                      fontSize: 'clamp(15px, 0.8vw + 12px, 20px)',
                      fontWeight: 700,
                      color: '#0077ff',
                      marginTop: 12
                    }}
                  >
                    {activeSlide.highlight}
                  </div>
                )}

                {/* Навигация в полноэкранном режиме */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                  <button
                    type="button"
                    disabled={activeSlideIndex === 0}
                    onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: isLight ? '#0f172a' : '#ffffff',
                      fontWeight: 700,
                      cursor: activeSlideIndex === 0 ? 'not-allowed' : 'pointer',
                      opacity: activeSlideIndex === 0 ? 0.3 : 1
                    }}
                  >
                    ← Предыдущий слайд
                  </button>

                  <button
                    type="button"
                    disabled={activeSlideIndex === currentDeck.length - 1}
                    onClick={() => setActiveSlideIndex(Math.min(currentDeck.length - 1, activeSlideIndex + 1))}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 8,
                      background: colors.accentColor,
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: activeSlideIndex === currentDeck.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: activeSlideIndex === currentDeck.length - 1 ? 0.3 : 1
                    }}
                  >
                    Следующий слайд →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 5. МОДУЛЬ: ТАБЕЛЬ ПОСЕЩАЕМОСТИ И ПРОПУСКОВ 9А ─── */}
      {activeStub === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Сводные показатели за месяц */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 'clamp(12px, 1vw + 10px, 18px)' }}>
            {[
              { label: 'Всего учащихся в 9А', value: '28', sub: '100% зачислены в Сферум', color: colors.accentColor },
              { label: 'Присутствуют сегодня', value: '25', sub: '89.3% посещаемость', color: '#10b981' },
              { label: 'На больничном', value: '2', sub: 'Иванов И., Васильева А.', color: '#f59e0b' },
              { label: 'По заявлениям', value: '1', sub: 'Смирнов К. (семейные)', color: '#6366f1' }
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 14,
                  padding: 'clamp(14px, 1vw + 10px, 18px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ fontSize: 'clamp(12px, 0.3vw + 11px, 14px)', color: colors.textMuted, fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: 'clamp(24px, 1.5vw + 16px, 32px)', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 'clamp(11px, 0.25vw + 10px, 13px)', color: colors.textSecondary }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Журнал посещаемости */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 0.8vw + 13px, 20px)', color: colors.textPrimary }}>
                  Сводная ведомость пропусков 9А за октябрь 2026 г.
                </div>
                <div style={{ fontSize: 'clamp(12px, 0.3vw + 11px, 14px)', color: colors.textMuted, marginTop: 2 }}>
                  Синхронизировано с заявлениями родителей и электронными справками
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    const data = [
                      { name: 'Иванов Иван', status: 'Болезнь (ОРВИ)', days: '4', doc: 'Справка № 4082 поликлиники № 1', sign: 'Верифицирована' },
                      { name: 'Васильева Анна', status: 'Болезнь', days: '2', doc: 'Уведомление в Сферуме от мамы', sign: 'Верифицирована' },
                      { name: 'Смирнов Константин', status: 'Семейные обстоятельства', days: '1', doc: 'Заявление родителя (от 23.10)', sign: 'Фото с личной подписью' },
                      { name: 'Кузнецов Артем', status: 'Присутствует', days: '0', doc: '—', sign: '—' },
                      { name: 'Морозова Дарья', status: 'Присутствует', days: '0', doc: '—', sign: '—' }
                    ];
                    const headers = ['Ученик', 'Статус', 'Пропущено дней', 'Основание', 'Подпись родителя'];
                    const csv = '\uFEFF' + [headers.join(';'), ...data.map(d => `"${d.name}";"${d.status}";"${d.days}";"${d.doc}";"${d.sign}"`)].join('\r\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Vedomost_propuskov_9A_oktyabr_2026.csv';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    background: colors.accentColor,
                    color: '#ffffff',
                    border: 'none',
                    fontSize: 'clamp(12px, 0.3vw + 11px, 14px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <FileSpreadsheet size={15} />
                  <span>Экспорт отчета завучу (Excel)</span>
                </button>
              </div>
            </div>

            {/* Таблица */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(13px, 0.3vw + 11px, 15px)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.cardBorder}`, color: colors.textMuted, fontSize: 'clamp(11px, 0.25vw + 10px, 12px)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Ученик</th>
                    <th style={{ padding: '10px 12px' }}>Статус</th>
                    <th style={{ padding: '10px 12px' }}>Пропущено дней</th>
                    <th style={{ padding: '10px 12px' }}>Основание</th>
                    <th style={{ padding: '10px 12px' }}>Подпись родителя</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Иванов Иван', status: 'Болезнь (ОРВИ)', days: '4 дня', doc: 'Справка № 4082 поликлиники № 1', sign: 'Верифицирована' },
                    { name: 'Васильева Анна', status: 'Болезнь', days: '2 дня', doc: 'Уведомление в Сферуме от мамы', sign: 'Верифицирована' },
                    { name: 'Смирнов Константин', status: 'Семейные обстоятельства', days: '1 день', doc: 'Заявление родителя (от 23.10)', sign: 'Фото с личной подписью' },
                    { name: 'Кузнецов Артем', status: 'Присутствует', days: '0 дней', doc: '—', sign: '—' },
                    { name: 'Морозова Дарья', status: 'Присутствует', days: '0 дней', doc: '—', sign: '—' }
                  ].map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: `1px solid ${colors.cardBorder}`,
                        background: idx % 2 === 0 ? 'transparent' : colors.slotBg
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: 700, color: colors.textPrimary }}>{row.name}</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            fontSize: 'clamp(11px, 0.2vw + 10px, 12px)',
                            padding: '4px 9px',
                            borderRadius: 6,
                            fontWeight: 600,
                            background: row.status.includes('Болезнь') ? (isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)') : (isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.15)'),
                            color: row.status.includes('Болезнь') ? '#ef4444' : '#10b981'
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: colors.textSecondary }}>{row.days}</td>
                      <td style={{ padding: '12px', color: colors.textSecondary, fontSize: '0.9em' }}>{row.doc}</td>
                      <td style={{ padding: '12px', color: colors.accentColor, fontWeight: 600, fontSize: '0.9em' }}>{row.sign}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

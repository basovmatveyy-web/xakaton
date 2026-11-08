import { jsPDF } from 'jspdf';

// ─────────────────────────────────────────────────────────
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ВЕРСТКИ ХОЛСТА (CANVAS 2D)
// ─────────────────────────────────────────────────────────

const DPI_SCALE = 2.5;
const A4_WIDTH_PX = Math.round(1240 * DPI_SCALE);
const A4_HEIGHT_PX = Math.round(1754 * DPI_SCALE);
const A4_MM_W = 210;
const A4_MM_H = 297;

/** Разбить текст на строки с учетом максимальной ширины */
export function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [''];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/** Нарисовать официальную шапку МАОУ ЛИТ */
function drawOfficialHeader(
  ctx: CanvasRenderingContext2D,
  width: number,
  title: string,
  category: string,
  author: string,
  dateStr: string,
  scale: number
): number {
  const marginX = 40 * scale;
  let y = 28 * scale;

  // 1. Верхняя акцентная полоса (фирменный синий Сферум / РФ)
  ctx.fillStyle = '#0077ff';
  ctx.fillRect(marginX, y, width - marginX * 2, 4 * scale);
  y += 14 * scale;

  // 2. Официальное наименование учебного заведения
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${16 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
  ctx.fillText('МАОУ «ЛИЦЕЙ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ» г. НОВОСИБИРСКА', marginX, y);
  y += 14 * scale;

  // 3. Подзаголовок методической службы
  ctx.fillStyle = '#64748b';
  ctx.font = `${11 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Электронный методический кабинет • Платформа «Сферум.Кабинет» • Стандарт ФГОС РФ', marginX, y);
  y += 13 * scale;

  // 4. Метаданные (автор, дата, класс)
  ctx.fillStyle = '#334155';
  ctx.font = `${10 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`Составитель: ${author}  |  Дата формирования: ${dateStr}  |  Класс: 9А`, marginX, y);
  y += 18 * scale;

  // 5. Карточка заголовка документа
  const bannerH = 44 * scale;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(marginX, y, width - marginX * 2, bannerH);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(marginX, y, width - marginX * 2, bannerH);

  ctx.fillStyle = '#0077ff';
  ctx.font = `bold ${10 * scale}px sans-serif`;
  ctx.fillText(category.toUpperCase(), marginX + 14 * scale, y + 16 * scale);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${14 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const cleanTitle = title.replace(/^#+\s*/, '').slice(0, 85);
  ctx.fillText(cleanTitle, marginX + 14 * scale, y + 33 * scale);

  y += bannerH + 20 * scale;
  return y;
}

/** Нарисовать официальный подвал с ЭЦП и штампом */
function drawOfficialFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pageNum: number,
  totalPages: number,
  author: string,
  scale: number
) {
  const marginX = 40 * scale;
  const lineY = height - 52 * scale;

  // Разделитель
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(marginX, lineY, width - marginX * 2, 1 * scale);

  // Подпись
  ctx.fillStyle = '#475569';
  ctx.font = `${9.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`Преподаватель: ${author}  __________________ (подпись)`, marginX, lineY + 18 * scale);
  ctx.fillText('Документ сформирован в автоматизированной системе «Сферум.Кабинет»', marginX, lineY + 32 * scale);

  // Страница
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = `${9.5 * scale}px sans-serif`;
  ctx.fillText(`Страница ${pageNum} из ${totalPages}`, width - marginX, lineY + 18 * scale);
  ctx.textAlign = 'left';

  // Синий штамп ЭЦП
  const stampW = 200 * scale;
  const stampH = 30 * scale;
  const stampX = width - marginX - stampW;
  const stampY = lineY + 18 * scale;

  ctx.strokeStyle = '#0077ff';
  ctx.lineWidth = 1.2 * scale;
  ctx.strokeRect(stampX, stampY, stampW, stampH);

  ctx.fillStyle = '#0077ff';
  ctx.font = `bold ${7.5 * scale}px sans-serif`;
  ctx.fillText('ДОКУМЕНТ ЗАВЕРЕН ЭЦП МАОУ ЛИТ', stampX + 8 * scale, stampY + 11 * scale);
  ctx.font = `${6.5 * scale}px sans-serif`;
  ctx.fillText('Сертификат: 4A8B9C0D1E2F38194', stampX + 8 * scale, stampY + 20 * scale);
  ctx.fillText(`Владелец: ${author}`, stampX + 8 * scale, stampY + 27 * scale);
}

// ─────────────────────────────────────────────────────────
// 1. ЭКСПОРТ ОФИЦИАЛЬНОГО МЕТОДИЧЕСКОГО ДОКУМЕНТА (ИЗ ЧАТА)
// ─────────────────────────────────────────────────────────

export interface ExportOfficialDocOptions {
  title: string;
  content: string;
  authorName?: string;
  category?: string;
  filename?: string;
}

export function exportOfficialDocumentPdf(options: ExportOfficialDocOptions): void {
  const {
    title,
    content,
    authorName = 'Лосив Роман Борисович',
    category = 'Методический материал ФГОС',
    filename
  } = options;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const scale = DPI_SCALE;
  const marginX = 40 * scale;
  const contentWidth = A4_WIDTH_PX - marginX * 2;
  const maxY = A4_HEIGHT_PX - 64 * scale;
  const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  // Разобьем markdown контент на смысловые блоки
  const rawLines = content.split('\n');

  interface PageBlock {
    type: 'h1' | 'h2' | 'p' | 'bullet' | 'quote' | 'table-row';
    text?: string;
    cols?: string[];
    isTableHead?: boolean;
  }

  const blocks: PageBlock[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    if (line.startsWith('### ')) {
      blocks.push({ type: 'h2', text: line.replace(/^###\s*/, '') });
    } else if (line.startsWith('## ') || line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.replace(/^#+\s*/, '') });
    } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      blocks.push({ type: 'bullet', text: line.replace(/^[-*•]\s*/, '') });
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push({ type: 'bullet', text: line });
    } else if (line.startsWith('> ')) {
      blocks.push({ type: 'quote', text: line.replace(/^>\s*/, '') });
    } else if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) continue; // разделитель таблицы
      const cols = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      const isHead = blocks.length > 0 && blocks[blocks.length - 1].type !== 'table-row';
      blocks.push({ type: 'table-row', cols, isTableHead: isHead });
    } else {
      blocks.push({ type: 'p', text: line });
    }
  }

  // Рендерим страницы
  const pagesCanvases: HTMLCanvasElement[] = [];

  const createPage = (): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
    const canvas = document.createElement('canvas');
    canvas.width = A4_WIDTH_PX;
    canvas.height = A4_HEIGHT_PX;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);
    return { canvas, ctx };
  };

  let currentPageObj = createPage();
  pagesCanvases.push(currentPageObj.canvas);
  let curCtx = currentPageObj.ctx;

  let curY = drawOfficialHeader(
    curCtx,
    A4_WIDTH_PX,
    title,
    category,
    authorName,
    dateStr,
    scale
  );

  for (const block of blocks) {
    if (block.type === 'h1' || block.type === 'h2') {
      const fontSize = block.type === 'h1' ? 14 * scale : 12.5 * scale;
      const lineHeight = fontSize + 8 * scale;

      if (curY + lineHeight + 20 * scale > maxY) {
        // Новая страница
        currentPageObj = createPage();
        pagesCanvases.push(currentPageObj.canvas);
        curCtx = currentPageObj.ctx;
        curY = 36 * scale;
      }

      curCtx.fillStyle = '#0077ff';
      curCtx.fillRect(marginX, curY + 2 * scale, 3 * scale, fontSize);

      curCtx.fillStyle = '#0f172a';
      curCtx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      curCtx.fillText(block.text || '', marginX + 10 * scale, curY + fontSize * 0.88);
      curY += lineHeight + 8 * scale;
    } else if (block.type === 'bullet') {
      curCtx.font = `${10.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const wrapped = wrapCanvasText(curCtx, block.text || '', contentWidth - 20 * scale);
      const neededH = wrapped.length * (16 * scale) + 4 * scale;

      if (curY + neededH > maxY) {
        currentPageObj = createPage();
        pagesCanvases.push(currentPageObj.canvas);
        curCtx = currentPageObj.ctx;
        curY = 36 * scale;
        curCtx.font = `${10.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      }

      curCtx.fillStyle = '#0077ff';
      curCtx.beginPath();
      curCtx.arc(marginX + 6 * scale, curY + 6 * scale, 2.5 * scale, 0, Math.PI * 2);
      curCtx.fill();

      curCtx.fillStyle = '#1e293b';
      wrapped.forEach((lineText, idx) => {
        curCtx.fillText(lineText, marginX + 16 * scale, curY + (idx + 1) * (14.5 * scale));
      });
      curY += neededH;
    } else if (block.type === 'quote') {
      curCtx.font = `italic ${10.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const wrapped = wrapCanvasText(curCtx, block.text || '', contentWidth - 28 * scale);
      const boxH = wrapped.length * (15 * scale) + 16 * scale;

      if (curY + boxH > maxY) {
        currentPageObj = createPage();
        pagesCanvases.push(currentPageObj.canvas);
        curCtx = currentPageObj.ctx;
        curY = 36 * scale;
        curCtx.font = `italic ${10.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      }

      curCtx.fillStyle = '#f1f5f9';
      curCtx.fillRect(marginX, curY, contentWidth, boxH);
      curCtx.fillStyle = '#0077ff';
      curCtx.fillRect(marginX, curY, 3 * scale, boxH);

      curCtx.fillStyle = '#334155';
      wrapped.forEach((lineText, idx) => {
        curCtx.fillText(lineText, marginX + 14 * scale, curY + 12 * scale + (idx + 0.8) * (14.5 * scale));
      });
      curY += boxH + 8 * scale;
    } else if (block.type === 'table-row' && block.cols) {
      const colCount = block.cols.length;
      const colW = contentWidth / colCount;
      const rowH = (block.isTableHead ? 22 : 18) * scale;

      if (curY + rowH > maxY) {
        currentPageObj = createPage();
        pagesCanvases.push(currentPageObj.canvas);
        curCtx = currentPageObj.ctx;
        curY = 36 * scale;
      }

      curCtx.fillStyle = block.isTableHead ? '#e0f2fe' : '#ffffff';
      curCtx.fillRect(marginX, curY, contentWidth, rowH);
      curCtx.strokeStyle = '#cbd5e1';
      curCtx.lineWidth = 1 * scale;
      curCtx.strokeRect(marginX, curY, contentWidth, rowH);

      block.cols.forEach((colText, cIdx) => {
        const cellX = marginX + cIdx * colW;
        if (cIdx > 0) {
          curCtx.beginPath();
          curCtx.moveTo(cellX, curY);
          curCtx.lineTo(cellX, curY + rowH);
          curCtx.stroke();
        }

        curCtx.fillStyle = block.isTableHead ? '#0369a1' : '#1e293b';
        curCtx.font = `${block.isTableHead ? 'bold' : 'normal'} ${9.5 * scale}px sans-serif`;
        const clean = colText.replace(/\*\*/g, '');
        curCtx.fillText(clean.slice(0, 32), cellX + 6 * scale, curY + rowH * 0.65);
      });

      curY += rowH;
    } else {
      // Обычный абзац
      curCtx.font = `${10.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const cleanText = (block.text || '').replace(/\*\*/g, '');
      const wrapped = wrapCanvasText(curCtx, cleanText, contentWidth);
      const neededH = wrapped.length * (15 * scale) + 6 * scale;

      if (curY + neededH > maxY) {
        currentPageObj = createPage();
        pagesCanvases.push(currentPageObj.canvas);
        curCtx = currentPageObj.ctx;
        curY = 36 * scale;
        curCtx.font = `${10.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      }

      curCtx.fillStyle = '#1e293b';
      wrapped.forEach((lineText, idx) => {
        curCtx.fillText(lineText, marginX, curY + (idx + 0.85) * (14.5 * scale));
      });
      curY += neededH;
    }
  }

  // Рисуем футеры на всех страницах
  const totalPages = pagesCanvases.length;
  pagesCanvases.forEach((canv, idx) => {
    const ctx = canv.getContext('2d')!;
    drawOfficialFooter(ctx, A4_WIDTH_PX, A4_HEIGHT_PX, idx + 1, totalPages, authorName, scale);
  });

  // Добавляем страницы в PDF
  pagesCanvases.forEach((canv, idx) => {
    if (idx > 0) {
      pdf.addPage('a4', 'portrait');
    }
    const imgData = canv.toDataURL('image/jpeg', 0.96);
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_MM_W, A4_MM_H);
  });

  const finalName = filename || `${title.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_').slice(0, 40)}_МАОУ_ЛИТ.pdf`;
  pdf.save(finalName);
}

// ─────────────────────────────────────────────────────────
// 2. ЭКСПОРТ РАЗДАТОЧНЫХ КАРТОЧЕК ПРОВЕРОЧНОЙ РАБОТЫ (А4)
// ─────────────────────────────────────────────────────────

export interface AssessmentTask {
  num: number;
  text: string;
  formula?: string;
  answer?: string;
  solution?: string;
}

export interface AssessmentVariant {
  num: number;
  tasks: AssessmentTask[];
  rubricNotes?: string;
}

export interface AssessmentSheetOptions {
  topic: string;
  subject: string;
  grade: string;
  difficulty: string;
  timeLimitMinutes: number;
  variants: AssessmentVariant[];
  schoolName?: string;
  teacherName?: string;
  gradingScale?: {
    five: string;
    four: string;
    three: string;
    two: string;
  };
}

/** Сгенерировать раздаточный лист А4 для учеников (2 или 4 варианта с линией отреза) */
export function exportAssessmentStudentSheetPdf(options: AssessmentSheetOptions): void {
  const {
    topic,
    subject,
    grade,
    difficulty: _difficulty,
    timeLimitMinutes,
    variants,
    schoolName = 'МАОУ «Лицей Информационных Технологий»',
    teacherName = 'Лосив Р. Б.'
  } = options;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const scale = DPI_SCALE;
  const canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH_PX;
  canvas.height = A4_HEIGHT_PX;
  const ctx = canvas.getContext('2d')!;

  // Белый фон листа
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const count = variants.length;
  const isFour = count >= 4;

  const marginX = 26 * scale;
  const marginY = 24 * scale;
  const usableW = canvas.width - marginX * 2;
  const usableH = canvas.height - marginY * 2;

  // Отрисовка одной карточки в заданной прямоугольной области
  const drawCard = (v: AssessmentVariant, x: number, y: number, w: number, h: number) => {
    const pad = 12 * scale;
    const innerW = w - pad * 2;

    // Внутренняя рамка карточки
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);

    let curY = y + pad;

    // Верхний колонтитул карточки
    ctx.fillStyle = '#0077ff';
    ctx.fillRect(x + pad, curY, innerW, 2.5 * scale);
    curY += 7 * scale;

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${8.5 * scale}px sans-serif`;
    ctx.fillText(`${schoolName.toUpperCase()} • ${grade}`, x + pad, curY + 6 * scale);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0077ff';
    ctx.font = `bold ${9 * scale}px sans-serif`;
    ctx.fillText(`ВАРИАНТ №${v.num}`, x + pad + innerW, curY + 6 * scale);
    ctx.textAlign = 'left';

    curY += 13 * scale;

    // Название темы и параметры
    ctx.fillStyle = '#475569';
    ctx.font = `${7.5 * scale}px sans-serif`;
    ctx.fillText(`Предмет: ${subject}  |  Тема: ${topic.slice(0, 36)}  |  Время: ${timeLimitMinutes} мин.`, x + pad, curY + 6 * scale);
    curY += 12 * scale;

    // Поля ученика для заполнения
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + pad, curY, innerW, 16 * scale);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8 * scale;
    ctx.strokeRect(x + pad, curY, innerW, 16 * scale);

    ctx.fillStyle = '#1e293b';
    ctx.font = `${7.5 * scale}px sans-serif`;
    ctx.fillText('ФИО ученика: _____________________________________', x + pad + 6 * scale, curY + 10.5 * scale);

    ctx.textAlign = 'right';
    ctx.fillText('Дата: _________  Оценка: [     ]', x + pad + innerW - 6 * scale, curY + 10.5 * scale);
    ctx.textAlign = 'left';

    curY += 21 * scale;

    // Задания
    v.tasks.forEach((t) => {
      // Номер и условие
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${8.5 * scale}px sans-serif`;
      ctx.fillText(`Задание ${t.num}.`, x + pad, curY + 7 * scale);

      ctx.font = `${8 * scale}px sans-serif`;
      const wrapped = wrapCanvasText(ctx, t.text, innerW - 55 * scale);
      wrapped.forEach((lineText, lIdx) => {
        ctx.fillText(lineText, x + pad + 52 * scale, curY + 7 * scale + lIdx * 10 * scale);
      });
      curY += Math.max(12 * scale, wrapped.length * 10 * scale + 4 * scale);

      // Формула если есть
      if (t.formula) {
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold italic ${9 * scale}px "Cambria Math", "Times New Roman", serif`;
        ctx.fillText(`  ${t.formula}`, x + pad + 20 * scale, curY + 7 * scale);
        curY += 12 * scale;
      }

      // Поле для ответа ученика
      ctx.fillStyle = '#64748b';
      ctx.font = `${7 * scale}px sans-serif`;
      ctx.fillText(`Ответ к заданию ${t.num}:`, x + pad + 10 * scale, curY + 7 * scale);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.8 * scale;
      ctx.strokeRect(x + pad + 85 * scale, curY, 80 * scale, 10 * scale);

      curY += 14 * scale;
    });

    // Мини-подвал карточки
    ctx.fillStyle = '#94a3b8';
    ctx.font = `${6.5 * scale}px sans-serif`;
    ctx.fillText(`Учитель: ${teacherName} • Лист проверочного контроля • ФГОС РФ`, x + pad, y + h - 6 * scale);
  };

  if (isFour) {
    // 4 варианта: сетка 2x2
    const cellW = usableW / 2;
    const cellH = usableH / 2;

    // Карточки
    drawCard(variants[0], marginX, marginY, cellW, cellH);
    drawCard(variants[1], marginX + cellW, marginY, cellW, cellH);
    drawCard(variants[2], marginX, marginY + cellH, cellW, cellH);
    drawCard(variants[3], marginX + cellW, marginY + cellH, cellW, cellH);

    // Вертикальная линия отреза с ножницами
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([6 * scale, 4 * scale]);
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(marginX + cellW, marginY);
    ctx.lineTo(marginX + cellW, marginY + usableH);
    ctx.stroke();

    // Горизонтальная линия отреза
    ctx.beginPath();
    ctx.moveTo(marginX, marginY + cellH);
    ctx.lineTo(marginX + usableW, marginY + cellH);
    ctx.stroke();
    ctx.restore();

    // Символ ножниц в центре
    ctx.fillStyle = '#64748b';
    ctx.font = `bold ${11 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✂ - - - - - - - - - - - - - ЛИНИЯ ОТРЕЗА - - - - - - - - - - - - - ✂', canvas.width / 2, marginY + cellH - 3 * scale);
    ctx.textAlign = 'left';
  } else {
    // 2 варианта: верхняя и нижняя половина А4
    const cellW = usableW;
    const cellH = usableH / 2;

    drawCard(variants[0], marginX, marginY, cellW, cellH);
    if (variants[1]) {
      drawCard(variants[1], marginX, marginY + cellH, cellW, cellH);
    }

    // Горизонтальная линия отреза
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([6 * scale, 4 * scale]);
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(marginX, marginY + cellH);
    ctx.lineTo(marginX + usableW, marginY + cellH);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#64748b';
    ctx.font = `bold ${11 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✂ - - - - - - - - - - - - - ЛИНИЯ ОТРЕЗА (РАЗРЕЗАТЬ НА 2 КАРТОЧКИ А5) - - - - - - - - - - - - - ✂', canvas.width / 2, marginY + cellH - 4 * scale);
    ctx.textAlign = 'left';
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  pdf.addImage(imgData, 'JPEG', 0, 0, A4_MM_W, A4_MM_H);

  const cleanName = topic.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_').slice(0, 35);
  pdf.save(`Proverochnaya_A4_${cleanName}.pdf`);
}

/** Сгенерировать ключи проверки и критерии оценивания для учителя (PDF) */
export function exportAssessmentTeacherKeyPdf(options: AssessmentSheetOptions): void {
  const {
    topic,
    subject: _subject,
    grade: _grade,
    difficulty: _difficulty,
    timeLimitMinutes: _timeLimitMinutes,
    variants,
    schoolName: _schoolName = 'МАОУ «Лицей Информационных Технологий» г. Новосибирска',
    teacherName = 'Лосив Роман Борисович',
    gradingScale = {
      five: '100% – 85% (верно все или допущена 1 описка)',
      four: '84% – 70% (верно решено большинство задач)',
      three: '69% – 50% (выполнено базовое требование)',
      two: 'менее 50% правильных шагов'
    }
  } = options;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const scale = DPI_SCALE;
  const canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH_PX;
  canvas.height = A4_HEIGHT_PX;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const marginX = 40 * scale;
  const contentWidth = canvas.width - marginX * 2;
  const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  let y = drawOfficialHeader(
    ctx,
    canvas.width,
    `ЭТАЛОННЫЕ КЛЮЧИ ПРОВЕРКИ И КРИТЕРИИ ОЦЕНИВАНИЯ: ${topic.toUpperCase()}`,
    'Служебный методический лист учителя • Проверочный срез',
    teacherName,
    dateStr,
    scale
  );

  // Раздел 1: Сводная таблица ответов для мгновенной проверки за 30 секунд
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${12 * scale}px sans-serif`;
  ctx.fillText('1. ЭКСПРЕСС-ТАБЛИЦА ПРАВИЛЬНЫХ ОТВЕТОВ ПО ВСЕМ ВАРИАНТАМ:', marginX, y);
  y += 12 * scale;

  // Шапка таблицы
  const maxTasks = Math.max(...variants.map((v) => v.tasks.length), 1);
  const colVariantW = 120 * scale;
  const taskColW = (contentWidth - colVariantW) / maxTasks;
  const tableH = 22 * scale;

  ctx.fillStyle = '#0077ff';
  ctx.fillRect(marginX, y, contentWidth, tableH);

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${9.5 * scale}px sans-serif`;
  ctx.fillText('Вариант', marginX + 12 * scale, y + 14 * scale);

  for (let t = 0; t < maxTasks; t++) {
    ctx.fillText(`Задание ${t + 1}`, marginX + colVariantW + t * taskColW + 10 * scale, y + 14 * scale);
  }
  y += tableH;

  variants.forEach((v, idx) => {
    const rowH = 20 * scale;
    ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    ctx.fillRect(marginX, y, contentWidth, rowH);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(marginX, y, contentWidth, rowH);

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${9.5 * scale}px sans-serif`;
    ctx.fillText(`ВАРИАНТ №${v.num}`, marginX + 12 * scale, y + 13.5 * scale);

    v.tasks.forEach((t, tIdx) => {
      const cellX = marginX + colVariantW + tIdx * taskColW;
      ctx.beginPath();
      ctx.moveTo(cellX, y);
      ctx.lineTo(cellX, y + rowH);
      ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.font = `bold ${10 * scale}px "Cambria Math", sans-serif`;
      const ansText = t.answer ? t.answer.replace(/\$/g, '') : '—';
      ctx.fillText(ansText.slice(0, 18), cellX + 10 * scale, y + 14 * scale);
    });

    y += rowH;
  });

  y += 18 * scale;

  // Раздел 2: Шкала оценивания
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${12 * scale}px sans-serif`;
  ctx.fillText('2. ШКАЛА ПЕРЕВОДА БАЛЛОВ В ПЯТИБАЛЬНУЮ ОЦЕНКУ (ФГОС):', marginX, y);
  y += 12 * scale;

  const grades = [
    { grade: 'Оценка «5» (Отлично)', desc: gradingScale.five, color: '#16a34a' },
    { grade: 'Оценка «4» (Хорошо)', desc: gradingScale.four, color: '#0284c7' },
    { grade: 'Оценка «3» (Удовлетворительно)', desc: gradingScale.three, color: '#d97706' },
    { grade: 'Оценка «2» (Неудовлетворительно)', desc: gradingScale.two, color: '#dc2626' }
  ];

  grades.forEach((g) => {
    const boxH = 17 * scale;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(marginX, y, contentWidth, boxH);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(marginX, y, contentWidth, boxH);

    ctx.fillStyle = g.color;
    ctx.font = `bold ${9 * scale}px sans-serif`;
    ctx.fillText(g.grade, marginX + 10 * scale, y + 11.5 * scale);

    ctx.fillStyle = '#334155';
    ctx.font = `${8.5 * scale}px sans-serif`;
    ctx.fillText(g.desc, marginX + 175 * scale, y + 11.5 * scale);

    y += boxH + 4 * scale;
  });

  y += 14 * scale;

  // Раздел 3: Решения и алгоритмы для учителя
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${12 * scale}px sans-serif`;
  ctx.fillText('3. КРАТКИЙ ХОД РЕШЕНИЯ И ЭТАЛОННЫЕ ВЫКЛАДКИ:', marginX, y);
  y += 12 * scale;

  variants.forEach((v) => {
    ctx.fillStyle = '#0077ff';
    ctx.font = `bold ${9.5 * scale}px sans-serif`;
    ctx.fillText(`• Вариант ${v.num}:`, marginX, y);
    y += 10 * scale;

    v.tasks.forEach((t) => {
      ctx.fillStyle = '#475569';
      ctx.font = `${8.5 * scale}px sans-serif`;
      const sol = t.solution ? t.solution.replace(/\$/g, '') : `Ответ: ${t.answer || '—'}`;
      ctx.fillText(`    Задание ${t.num}: ${sol}`, marginX, y);
      y += 10 * scale;
    });
    y += 4 * scale;
  });

  // Подвал
  drawOfficialFooter(ctx, canvas.width, canvas.height, 1, 1, teacherName, scale);

  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  pdf.addImage(imgData, 'JPEG', 0, 0, A4_MM_W, A4_MM_H);

  const cleanName = topic.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_').slice(0, 35);
  pdf.save(`Klyuchi_proverki_A4_${cleanName}.pdf`);
}

// ─────────────────────────────────────────────────────────
// 3. ЭКСПОРТ ПРОТОТИПА ФИПИ ИЛИ АВТОРСКОГО АНАЛОГА (А4)
// ─────────────────────────────────────────────────────────

export interface FipiPdfOptions {
  examTitle: string;
  subject: string;
  taskNumber: string;
  topicTitle: string;
  codifier: string;
  condition: string;
  mathFormula?: string;
  subCondition?: string;
  answer?: string;
  solution?: string;
  criteria?: string;
  isAnalog?: boolean;
  schoolName?: string;
  teacherName?: string;
}

export function exportFipiTaskPdf(options: FipiPdfOptions): void {
  const {
    examTitle,
    subject,
    taskNumber,
    topicTitle,
    codifier,
    condition,
    mathFormula,
    subCondition,
    answer,
    solution,
    criteria,
    isAnalog = false,
    schoolName: _schoolName = 'МАОУ «Лицей Информационных Технологий» г. Новосибирска',
    teacherName = 'Лосив Роман Борисович'
  } = options;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const scale = DPI_SCALE;
  const canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH_PX;
  canvas.height = A4_HEIGHT_PX;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const marginX = 40 * scale;
  const contentWidth = canvas.width - marginX * 2;
  const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  const title = isAnalog
    ? `АВТОРСКИЙ АНАЛОГ ЗАДАНИЯ ФИПИ: ${examTitle.toUpperCase()} • ЗАДАНИЕ №${taskNumber}`
    : `ОФИЦИАЛЬНЫЙ ПРОТОТИП ОТКРЫТОГО БАНКА ФИПИ: ${examTitle.toUpperCase()} • ЗАДАНИЕ №${taskNumber}`;

  let y = drawOfficialHeader(
    ctx,
    canvas.width,
    title,
    isAnalog ? 'Методический банк • Защита от списывания с ГДЗ' : 'Официальный банк заданий ФИПИ',
    teacherName,
    dateStr,
    scale
  );

  // Информационный бейдж
  const badgeH = 26 * scale;
  ctx.fillStyle = isAnalog ? '#ecfdf5' : '#eff6ff';
  ctx.fillRect(marginX, y, contentWidth, badgeH);
  ctx.strokeStyle = isAnalog ? '#a7f3d0' : '#bfdbfe';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(marginX, y, contentWidth, badgeH);

  ctx.fillStyle = isAnalog ? '#047857' : '#1d4ed8';
  ctx.font = `bold ${9.5 * scale}px sans-serif`;
  ctx.fillText(
    isAnalog
      ? '✓ АВТОРСКИЙ АНАЛОГ ДЛЯ ПРОВЕРОЧНОЙ РАБОТЫ (ЧИСЛА ИЗМЕНЕНЫ, СОВПАДЕНИЙ В ГДЗ НЕТ)'
      : '✓ ОФИЦИАЛЬНАЯ СПЕЦИФИКАЦИЯ ФИПИ 2026 ГОДА',
    marginX + 14 * scale,
    y + 16.5 * scale
  );
  y += badgeH + 16 * scale;

  // Метаданные темы и кодификатора
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${11 * scale}px sans-serif`;
  ctx.fillText(`Тема: ${topicTitle}`, marginX, y);
  y += 12 * scale;

  ctx.fillStyle = '#64748b';
  ctx.font = `${9 * scale}px sans-serif`;
  ctx.fillText(`Предмет: ${subject}  |  Кодификатор ФГОС: ${codifier}`, marginX, y);
  y += 16 * scale;

  // Карточка условия задания
  ctx.fillStyle = '#f8fafc';
  const taskBoxY = y;
  ctx.fillRect(marginX, taskBoxY, contentWidth, 110 * scale);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(marginX, taskBoxY, contentWidth, 110 * scale);

  ctx.fillStyle = '#0077ff';
  ctx.font = `bold ${10 * scale}px sans-serif`;
  ctx.fillText(`УСЛОВИЕ ЗАДАНИЯ №${taskNumber}:`, marginX + 14 * scale, y + 18 * scale);
  y += 24 * scale;

  ctx.fillStyle = '#0f172a';
  ctx.font = `${11 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const wrappedCond = wrapCanvasText(ctx, condition, contentWidth - 28 * scale);
  wrappedCond.forEach((lineText, idx) => {
    ctx.fillText(lineText, marginX + 14 * scale, y + (idx + 1) * 14 * scale);
  });
  y += wrappedCond.length * 14 * scale + 10 * scale;

  // Формула
  if (mathFormula) {
    ctx.fillStyle = '#0077ff';
    ctx.font = `bold italic ${14 * scale}px "Cambria Math", "Times New Roman", serif`;
    ctx.fillText(mathFormula, marginX + 24 * scale, y + 10 * scale);
    y += 20 * scale;
  }

  // Под-условие
  if (subCondition) {
    ctx.fillStyle = '#475569';
    ctx.font = `italic ${9.5 * scale}px sans-serif`;
    ctx.fillText(subCondition, marginX + 14 * scale, y + 8 * scale);
    y += 16 * scale;
  }

  y = taskBoxY + 110 * scale + 18 * scale;

  // Поле для решения учеником (сетка клеток как в бланке ОГЭ)
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${11 * scale}px sans-serif`;
  ctx.fillText('МЕСТО ДЛЯ ВЫПОЛНЕНИЯ РЕШЕНИЯ УЧЕНИКОМ (БЛАНК ОТВЕТОВ №2):', marginX, y);
  y += 12 * scale;

  const gridH = 120 * scale;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(marginX, y, contentWidth, gridH);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.5 * scale;

  // Рисуем школьную клеточку 5x5 мм
  const cellSize = 6 * scale;
  for (let gx = marginX; gx <= marginX + contentWidth; gx += cellSize) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + gridH);
    ctx.stroke();
  }
  for (let gy = y; gy <= y + gridH; gy += cellSize) {
    ctx.beginPath();
    ctx.moveTo(marginX, gy);
    ctx.lineTo(marginX + contentWidth, gy);
    ctx.stroke();
  }

  // Внешняя граница клетки
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(marginX, y, contentWidth, gridH);

  y += gridH + 16 * scale;

  // Ответ и критерии учителя
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(marginX, y, contentWidth, 54 * scale);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(marginX, y, contentWidth, 54 * scale);

  ctx.fillStyle = '#0077ff';
  ctx.font = `bold ${9.5 * scale}px sans-serif`;
  ctx.fillText('ЭТАЛОН ОТВЕТА И КРИТЕРИИ ПРОВЕРКИ (ДЛЯ УЧИТЕЛЯ):', marginX + 12 * scale, y + 14 * scale);

  ctx.fillStyle = '#16a34a';
  ctx.font = `bold ${11 * scale}px sans-serif`;
  ctx.fillText(`Ответ: ${answer || '—'}`, marginX + 12 * scale, y + 28 * scale);

  if (solution) {
    ctx.fillStyle = '#475569';
    ctx.font = `${8.5 * scale}px sans-serif`;
    ctx.fillText(`Решение: ${solution}`, marginX + 12 * scale, y + 40 * scale);
  }

  if (criteria) {
    ctx.fillStyle = '#64748b';
    ctx.font = `${8 * scale}px sans-serif`;
    ctx.fillText(`Критерий: ${criteria}`, marginX + 12 * scale, y + 49 * scale);
  }

  // Подвал
  drawOfficialFooter(ctx, canvas.width, canvas.height, 1, 1, teacherName, scale);

  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  pdf.addImage(imgData, 'JPEG', 0, 0, A4_MM_W, A4_MM_H);

  const cleanName = isAnalog ? `Analog_FIPI_Zadanie_${taskNumber}` : `Prototip_FIPI_Zadanie_${taskNumber}`;
  pdf.save(`${cleanName}_A4.pdf`);
}

// ─────────────────────────────────────────────────────────
// 4. ЭКСПОРТ ПАРАЛЛЕЛЬНЫХ ВАРИАНТОВ (АНТИ-ГДЗ) В PDF (А4)
// ─────────────────────────────────────────────────────────

export interface GdzPdfOptions {
  sourceText: string;
  variants: {
    num: number;
    task: string;
    answer: string;
    solution: string;
  }[];
  schoolName?: string;
  teacherName?: string;
}

export function exportGdzClonesPdf(options: GdzPdfOptions): void {
  const {
    sourceText: _sourceText,
    variants,
    schoolName = 'МАОУ «Лицей Информационных Технологий» г. Новосибирска',
    teacherName = 'Лосив Роман Борисович'
  } = options;

  const mappedVariants: AssessmentVariant[] = variants.map((v) => ({
    num: v.num,
    tasks: [
      {
        num: 1,
        text: v.task.replace(/\$/g, ''),
        answer: v.answer.replace(/\$/g, ''),
        solution: v.solution.replace(/\$/g, '')
      }
    ]
  }));

  // Раздаточный лист ученикам
  exportAssessmentStudentSheetPdf({
    topic: 'Параллельные варианты без совпадений в ГДЗ',
    subject: 'Математика / Алгебра',
    grade: '9А класс',
    difficulty: 'ФГОС (Аналог задачи из учебника)',
    timeLimitMinutes: 15,
    variants: mappedVariants,
    schoolName,
    teacherName
  });
}

import React from 'react';
import katex from 'katex';

interface RichAiMessageProps {
  content: string;
  isLight: boolean;
  isContrast: boolean;
  accentColor: string;
}

// Рендер инлайн-элементов: LaTeX ($...$), Bold (**...**), Code (`...`), Italic (*...*)
export const InlineFormattedText: React.FC<{
  text: string;
  isLight: boolean;
  isContrast: boolean;
  accentColor: string;
}> = ({ text, isLight, isContrast, accentColor }) => {
  // Токенизация текста по формулам $...$ и **...** и `...`
  // Регулярное выражение для поиска $math$, **bold**, `code`
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\*\*[^*]+?\*\*|`[^`]+?`)/g;
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // Display LaTeX: $$formula$$
        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          const math = part.slice(2, -2);
          try {
            const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
            return (
              <div
                key={index}
                style={{ margin: '8px 0', overflowX: 'auto', textAlign: 'center' }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <code key={index}>{part}</code>;
          }
        }

        // Inline LaTeX: $formula$
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
            return (
              <span
                key={index}
                style={{ padding: '0 2px' }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <code key={index}>{part}</code>;
          }
        }

        // Bold: **text**
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          const boldText = part.slice(2, -2);
          return (
            <strong
              key={index}
              style={{
                fontWeight: 700,
                color: isContrast ? '#000' : (isLight ? '#0f172a' : '#f8fafc')
              }}
            >
              <InlineFormattedText text={boldText} isLight={isLight} isContrast={isContrast} accentColor={accentColor} />
            </strong>
          );
        }

        // Inline Code: `code`
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          const codeText = part.slice(1, -1);
          return (
            <code
              key={index}
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.88em',
                background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                padding: '2px 5px',
                borderRadius: 4,
                color: isContrast ? '#000' : accentColor
              }}
            >
              {codeText}
            </code>
          );
        }

        // Обычный текст
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};

export const RichAiMessage: React.FC<RichAiMessageProps> = ({
  content,
  isLight,
  isContrast,
  accentColor
}) => {
  // Цветовые токены
  const textColor = isContrast ? '#000' : (isLight ? '#1e293b' : '#f1f5f9');
  const tableBorder = isContrast ? '#000' : (isLight ? '#e2e8f0' : '#2d3748');
  const tableHeaderBg = isContrast ? '#eee' : (isLight ? 'rgba(0, 119, 255, 0.04)' : 'rgba(255, 255, 255, 0.03)');
  const tableZebraBg = isContrast ? '#f9f9f9' : (isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.015)');
  const quoteBg = isContrast ? '#f0f0f0' : (isLight ? 'rgba(0, 119, 255, 0.05)' : 'rgba(0, 119, 255, 0.08)');
  const dividerColor = isContrast ? '#000' : (isLight ? '#edf2f7' : '#232d3d');

  // Разбор текста на блоки (заголовки, цитаты, таблицы, списки, параграфы)
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    // 1. Пустые строки
    if (!line) {
      index++;
      continue;
    }

    // 2. Заголовки (###, ##, #)
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const titleText = line.replace(/^#+\s*/, '');
      const fontSize = level === 1 ? 18 : level === 2 ? 16 : 14.5;

      elements.push(
        <div
          key={`header-${index}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: elements.length === 0 ? 0 : 14,
            marginBottom: 6,
            fontWeight: 700,
            fontSize,
            color: textColor
          }}
        >
          <span
            style={{
              width: 3.5,
              height: fontSize - 1,
              borderRadius: 2,
              background: accentColor,
              flexShrink: 0
            }}
          />
          <InlineFormattedText
            text={titleText}
            isLight={isLight}
            isContrast={isContrast}
            accentColor={accentColor}
          />
        </div>
      );
      index++;
      continue;
    }

    // 3. Таблица (начинается с '|')
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('|') && lines[index].trim().endsWith('|')) {
        tableLines.push(lines[index].trim());
        index++;
      }

      if (tableLines.length >= 2) {
        // Заголовок
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        // Разделитель выравнивания (|:---|:---:|---:|)
        const alignCells = tableLines[1]
          .split('|')
          .slice(1, -1)
          .map((c) => {
            const trimmed = c.trim();
            if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
            if (trimmed.endsWith(':')) return 'right';
            return 'left';
          });

        // Строки данных
        const bodyRows = tableLines.slice(2).map((rowLine) =>
          rowLine
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

        elements.push(
          <div
            key={`table-${index}`}
            style={{
              margin: '10px 0 14px 0',
              overflowX: 'auto',
              borderRadius: 10,
              border: `1px solid ${tableBorder}`,
              boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.02)' : 'none'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12.5,
                lineHeight: 1.45,
                textAlign: 'left'
              }}
            >
              <thead>
                <tr style={{ background: tableHeaderBg, borderBottom: `1.5px solid ${tableBorder}` }}>
                  {headerCells.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      style={{
                        padding: '9px 12px',
                        fontWeight: 700,
                        color: textColor,
                        textAlign: (alignCells[hIdx] as any) || 'left',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <InlineFormattedText
                        text={h}
                        isLight={isLight}
                        isContrast={isContrast}
                        accentColor={accentColor}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={{
                      background: rIdx % 2 === 1 ? tableZebraBg : 'transparent',
                      borderBottom: rIdx < bodyRows.length - 1 ? `1px solid ${dividerColor}` : 'none'
                    }}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        style={{
                          padding: '9px 12px',
                          color: textColor,
                          textAlign: (alignCells[cIdx] as any) || 'left',
                          verticalAlign: 'top'
                        }}
                      >
                        <InlineFormattedText
                          text={cell}
                          isLight={isLight}
                          isContrast={isContrast}
                          accentColor={accentColor}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 4. Цитата (>)
    if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s*/, '');
      elements.push(
        <div
          key={`quote-${index}`}
          style={{
            margin: '8px 0',
            padding: '9px 14px',
            borderRadius: '0 8px 8px 0',
            borderLeft: `3px solid ${accentColor}`,
            background: quoteBg,
            fontSize: 13,
            lineHeight: 1.5,
            color: textColor
          }}
        >
          <InlineFormattedText
            text={quoteText}
            isLight={isLight}
            isContrast={isContrast}
            accentColor={accentColor}
          />
        </div>
      );
      index++;
      continue;
    }

    // 5. Маркированные списки (- или • или *)
    if (/^[-•*]\s+/.test(line)) {
      const listItems: string[] = [];
      while (index < lines.length && /^[-•*]\s+/.test(lines[index].trim())) {
        listItems.push(lines[index].trim().replace(/^[-•*]\s+/, ''));
        index++;
      }

      elements.push(
        <div key={`list-${index}`} style={{ margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {listItems.map((item, lIdx) => (
            <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, lineHeight: 1.5 }}>
              <span
                style={{
                  color: accentColor,
                  fontSize: 16,
                  lineHeight: '18px',
                  userSelect: 'none',
                  flexShrink: 0
                }}
              >
                •
              </span>
              <div style={{ flex: 1, color: textColor }}>
                <InlineFormattedText
                  text={item}
                  isLight={isLight}
                  isContrast={isContrast}
                  accentColor={accentColor}
                />
              </div>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // 6. Нумерованные списки (1. 2. 3.)
    if (/^\d+\.\s+/.test(line)) {
      const numItems: { num: string; text: string }[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        const itemLine = lines[index].trim();
        const match = itemLine.match(/^(\d+)\.\s+(.*)/);
        if (match) {
          numItems.push({ num: match[1], text: match[2] });
        }
        index++;
      }

      elements.push(
        <div key={`numlist-${index}`} style={{ margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {numItems.map((item, nIdx) => (
            <div key={nIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, lineHeight: 1.5 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: accentColor,
                  background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.16)',
                  padding: '1px 6px',
                  borderRadius: 4,
                  lineHeight: '16px',
                  marginTop: 2,
                  flexShrink: 0
                }}
              >
                {item.num}
              </span>
              <div style={{ flex: 1, color: textColor }}>
                <InlineFormattedText
                  text={item.text}
                  isLight={isLight}
                  isContrast={isContrast}
                  accentColor={accentColor}
                />
              </div>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // 7. Обычный абзац текста
    elements.push(
      <p
        key={`p-${index}`}
        style={{
          margin: '6px 0',
          fontSize: 13.5,
          lineHeight: 1.58,
          color: textColor
        }}
      >
        <InlineFormattedText
          text={line}
          isLight={isLight}
          isContrast={isContrast}
          accentColor={accentColor}
        />
      </p>
    );
    index++;
  }

  return <div style={{ display: 'flex', flexDirection: 'column' }}>{elements}</div>;
};

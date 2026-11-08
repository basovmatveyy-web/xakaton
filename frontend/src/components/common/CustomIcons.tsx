import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Фирменный академический вензель / эмблема «Сферум.Кабинет»
 * Строгая геометрия: раскрытая книга знаний, вписанная в щит безопасности и сферу
 */
export const SferumEmblemIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  className,
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M12 2L4 5.5V11.5C4 16.5 7.4 21.1 12 22.5C16.6 21.1 20 16.5 20 11.5V5.5L12 2Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8.5V16M8.5 12H15.5"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.5" />
  </svg>
);

/**
 * Иконка «Методический помощник / Цифровой наставник»
 * Академическое гусиное перо с кристаллом знаний
 */
export const AcademicQuillIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  className,
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M20.24 3.76C18.57 2.09 15.54 2.87 13.5 4.91L5.5 12.91C4.4 14.01 3.5 16.01 3.05 18.01C2.9 18.71 3.4 19.31 4.1 19.21C6.1 18.81 8.1 17.91 9.2 16.81L17.2 8.81C19.24 6.77 20.02 3.74 20.24 3.76Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.8 11.3L14.7 15.2"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M3 21L6 20"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Иконка «Школьный локатор / Архитектурная сетка лицея»
 * Изометрический план аудитории с меткой локации
 */
export const SchoolGridLocatorIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  className,
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.75" />
    <path d="M3 9H21M9 3V21" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
    <circle cx="15" cy="15" r="2.5" fill={color} />
  </svg>
);

/**
 * Иконка «Конструктор проверочных работ / Карточек А4»
 * Чертёжный треугольник, линейка и разметка теста
 */
export const AssessmentBuilderIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  className,
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 2V8H20" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 13H16M8 17H13" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="15.5" cy="17" r="1.5" stroke={color} strokeWidth="1.5" />
  </svg>
);

/**
 * Иконка «Цифровая приемная классрука»
 * Официальная папка с гербовой лентой и ведомостью
 */
export const ClassmasterRegistryIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  className,
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M19 4H5C3.9 4 3 4.9 3 6V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V6C21 4.9 20.1 4 19 4Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    <path d="M9 14L11 16L15 12" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Иконка «Техническая заявка завхозу»
 * Строгий ключ технического контроля
 */
export const MaintenanceServiceIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  className,
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M14.7 6.3C13.2 4.8 11 4.4 9.1 5.3L12 8.2L10.2 10L7.3 7.1C6.4 9 6.8 11.2 8.3 12.7C9.8 14.2 12 14.6 13.9 13.7L19.8 19.6C20.2 20 20.8 20 21.2 19.6C21.6 19.2 21.6 18.6 21.2 18.2L15.3 12.3C16.2 10.4 15.8 8.2 14.7 6.3Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Иконка «Методический импульс / Вычислительный консилиум»
 * Стилизованный квантовый узел взаимодействия вместо попсовых искорок
 */
export const AcademicPulseIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  className,
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M12 3V6M12 18V21M3 12H6M18 12H21"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.75" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </svg>
);

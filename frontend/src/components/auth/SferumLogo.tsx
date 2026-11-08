import React from 'react';

interface SferumEmblemProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  monochrome?: boolean;
}

/**
 * Официальный векторный знак «Сферум» (Оригами-молния)
 * С высокой детализацией градиентов или монохромной версией для темы ГОСТ.
 */
export const SferumEmblem: React.FC<SferumEmblemProps> = ({
  size = 32,
  className = '',
  style = {},
  monochrome = false,
}) => {
  if (monochrome) {
    return (
      <svg
        width={size}
        height={(size * 46) / 48}
        viewBox="0 0 48 46"
        fill="currentColor"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
        aria-hidden="true"
      >
        <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={(size * 46) / 48}
      viewBox="0 0 48 46"
      fill="none"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sferum-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#863bff" />
          <stop offset="60%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#2d82ec" />
        </linearGradient>
        <linearGradient id="sferum-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#47bfff" />
          <stop offset="100%" stopColor="#2d82ec" />
        </linearGradient>
      </defs>
      <path
        fill="url(#sferum-grad-main)"
        d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
      />
      {/* Внутренняя грань со светотеневым акцентом */}
      <path
        fill="url(#sferum-grad-cyan)"
        opacity="0.9"
        d="M38.907.474c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94c-.664.845-2.021.375-2.021-.698V33.937l14.981-22.99H25.04c-.92 0-1.456-1.04-.92-1.788L38.907.474z"
      />
    </svg>
  );
};

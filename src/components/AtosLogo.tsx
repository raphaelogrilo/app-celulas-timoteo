import React from 'react';

interface AtosLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: 'white' | 'black';
}

export const AtosLogo: React.FC<AtosLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'white',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Ícone Geométrico Oficial Atos */}
      <svg
        viewBox="0 0 100 100"
        className={`${iconSizes[size]} flex-shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo Externo Dourado */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="#FAAB36"
          strokeWidth="9"
        />
        {/* Diamante / Delta Central com vazado interno */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50 22L72 58L50 82L28 58L50 22ZM50 44L61 62H39L50 44Z"
          fill="#FAAB36"
        />
      </svg>

      {/* Tipografia Oficial 'atos' */}
      {showText && (
        <span
          className={`font-black tracking-tighter lowercase leading-none ${textSizes[size]} ${
            textColor === 'white' ? 'text-white' : 'text-slate-900'
          }`}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.06em' }}
        >
          atos
        </span>
      )}
    </div>
  );
};

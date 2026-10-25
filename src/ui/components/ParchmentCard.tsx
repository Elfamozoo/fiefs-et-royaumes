import React from 'react';

interface ParchmentCardProps {
  title?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const ParchmentCard: React.FC<ParchmentCardProps> = ({
  title,
  subtitle,
  badge,
  children,
  className = '',
  headerAction,
}) => {
  return (
    <div
      className={`relative bg-parchment-light border-2 border-parchment-border rounded-lg shadow-parchment p-5 text-iron-grey-900 transition-all ${className}`}
      style={{
        boxShadow: '0 4px 14px rgba(100, 70, 30, 0.12), inset 0 0 40px rgba(186, 141, 83, 0.08)',
      }}
    >
      {/* Antique corner accents */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-royal-gold-600 opacity-60 pointer-events-none" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-royal-gold-600 opacity-60 pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-royal-gold-600 opacity-60 pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-royal-gold-600 opacity-60 pointer-events-none" />

      {(title || subtitle || badge || headerAction) && (
        <div className="flex items-center justify-between border-b border-parchment-border/70 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="font-serif font-bold text-lg text-iron-grey-900 tracking-wide">
                  {title}
                </h3>
              )}
              {badge && <span>{badge}</span>}
            </div>
            {subtitle && (
              <p className="text-xs font-serif text-iron-grey-600 italic mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div>{children}</div>
    </div>
  );
};

import React from 'react';

interface WaxSealButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'seal' | 'gold' | 'iron' | 'parchment';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const WaxSealButton: React.FC<WaxSealButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    seal: 'bg-crimson-seal text-parchment-50 border border-crimson-800 shadow-wax-seal hover:bg-crimson-800 active:translate-y-0.5',
    gold: 'bg-gradient-to-b from-royal-gold-400 to-royal-gold-600 text-iron-grey-900 font-bold border border-royal-gold-700 shadow-md hover:from-royal-gold-300 hover:to-royal-gold-500 active:translate-y-0.5',
    iron: 'bg-gradient-to-b from-iron-grey-600 to-iron-grey-800 text-parchment-50 border border-iron-grey-900 shadow-md hover:from-iron-grey-500 hover:to-iron-grey-700 active:translate-y-0.5',
    parchment: 'bg-parchment-200 text-iron-grey-900 border border-parchment-border hover:bg-parchment-300 active:translate-y-0.5',
  };

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed transform-none hover:from-transparent hover:to-transparent active:translate-y-0'
    : 'cursor-pointer';

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-serif tracking-wider rounded transition-all duration-150 select-none ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { ParchmentCard } from './ParchmentCard';

interface MedievalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const MedievalModal: React.FC<MedievalModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={`relative z-10 w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto`}>
        <ParchmentCard
          title={title}
          subtitle={subtitle}
          headerAction={
            <button
              onClick={onClose}
              className="p-1 rounded-full text-iron-grey-600 hover:text-crimson-700 hover:bg-parchment-200 transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          }
        >
          {children}
        </ParchmentCard>
      </div>
    </div>
  );
};

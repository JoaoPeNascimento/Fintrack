import { ReactNode, useEffect } from 'react';

type GastoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function GastoModal({ isOpen, onClose, title, children }: GastoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#2D2B55]/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="clay-modal clay-bg-dialog w-full max-w-2xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#7C5CFC] to-[#FF7EB3] bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-clay-secondary hover:text-clay-primary transition-colors p-2 rounded-full hover:bg-[#F0EDFF] dark:hover:bg-[#242145] clay-icon w-10 h-10 flex items-center justify-center cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

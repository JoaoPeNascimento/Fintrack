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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div className="overlay" onClick={onClose} />

      {/* Modal Content */}
      <div className="card relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-line">
          <h2 className="text-lg font-semibold text-fg">
            {title}
          </h2>
          <button onClick={onClose} className="icon-btn" aria-label="Fechar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

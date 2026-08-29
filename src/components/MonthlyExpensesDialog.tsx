'use client';

import { useState, useEffect } from 'react';
import { getExpensesByMonthAndYear } from '@/actions/gasto';
import ExpenseTable from './ExpenseTable';

interface MonthlyExpensesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  label: string;
}

export default function MonthlyExpensesDialog({ 
  isOpen, 
  onClose, 
  month, 
  year, 
  label 
}: MonthlyExpensesDialogProps) {
  const [gastos, setGastos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Close when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch data when opened
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getExpensesByMonthAndYear(month, year)
        .then(res => {
          if (res.success) {
            setGastos(res.data);
          } else {
            setGastos([]);
          }
        })
        .catch(err => {
          console.error('Failed to fetch monthly expenses', err);
          setGastos([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setGastos([]); // clear when closed
    }
  }, [isOpen, month, year]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-[#2D2B55]/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Dialog body */}
      <div className="clay-modal relative clay-bg-dialog w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#7C5CFC]/10 bg-[#F0EDFF]/30 dark:bg-[#242145]/30">
          <div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#7C5CFC] to-[#FF7EB3] bg-clip-text text-transparent">
              Despesas de {label}
            </h2>
            <p className="text-clay-secondary text-sm font-medium mt-1">
              Detalhamento de todos os gastos deste período
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-clay-secondary hover:text-clay-primary clay-icon w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F0EDFF] dark:hover:bg-[#242145] transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="clay-step w-12 h-12 bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center">
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <ExpenseTable gastos={gastos} />
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-[#7C5CFC]/10 bg-[#F0EDFF]/20 dark:bg-[#242145]/20 flex justify-end">
          <button 
            onClick={onClose}
            className="clay-button px-6 py-2 bg-white/60 dark:bg-gray-800/60 text-clay-primary font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

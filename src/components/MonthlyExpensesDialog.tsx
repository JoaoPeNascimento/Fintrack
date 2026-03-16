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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Dialog body */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/50">
          <div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Despesas de {label}
            </h2>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Detalhamento de todos os gastos deste período
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <ExpenseTable gastos={gastos} />
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

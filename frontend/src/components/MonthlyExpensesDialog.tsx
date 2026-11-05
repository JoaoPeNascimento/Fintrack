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
      <div className="overlay" onClick={onClose}></div>

      {/* Dialog body */}
      <div className="card relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-xl" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h2 className="text-lg font-semibold text-fg">
              Despesas de {label}
            </h2>
            <p className="text-sm text-muted">
              Detalhamento de todos os gastos deste período
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-line border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <ExpenseTable gastos={gastos} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-line flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

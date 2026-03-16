'use client';

import { useState } from 'react';
import MonthlyExpensesDialog from '@/components/MonthlyExpensesDialog';

interface MonthlySummaryItem {
  month: number;
  year: number;
  label: string;
  shortLabel: string;
  totalAmount: number;
  expenseCount: number;
}

export default function ProfileMonthlyHistory({ history }: { history: MonthlySummaryItem[] }) {
  const [selectedMonth, setSelectedMonth] = useState<MonthlySummaryItem | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 border-dashed transition-colors duration-300">
        <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum histórico de gastos encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {history.map((item, index) => (
          <button
            key={`${item.year}-${item.month}`}
            onClick={() => setSelectedMonth(item)}
            className="flex flex-col text-left bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-500/50 p-5 rounded-xl transition-all group group-hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-bl-full -z-10 opacity-50 transition-transform duration-300 group-hover:scale-110"></div>
            
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1 tracking-wide uppercase">
              {item.label}
            </span>
            
            <span className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalAmount)}
            </span>
            
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1 rounded-md self-start border border-gray-100 dark:border-gray-700/50 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 dark:text-indigo-500">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {item.expenseCount} {item.expenseCount === 1 ? 'gasto' : 'gastos'}
            </span>
          </button>
        ))}
      </div>

      <MonthlyExpensesDialog
        isOpen={!!selectedMonth}
        onClose={() => setSelectedMonth(null)}
        month={selectedMonth?.month || 0}
        year={selectedMonth?.year || 0}
        label={selectedMonth?.label || ''}
      />
    </>
  );
}

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
      <div className="text-center py-12 clay-card-static bg-[#F0EDFF]/30">
        <p className="text-clay-secondary font-medium">Nenhum histórico de gastos encontrado.</p>
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
            className="clay-card flex flex-col text-left clay-bg-dialog p-5 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 clay-bg-purple rounded-bl-full -z-10 opacity-30 transition-transform duration-300 group-hover:scale-110"></div>
            
            <span className="text-sm font-bold text-clay-purple mb-1 tracking-wide uppercase">
              {item.label}
            </span>
            
            <span className="text-2xl font-extrabold text-clay-primary mb-3 transition-colors duration-300">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalAmount)}
            </span>
            
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-clay-secondary clay-badge bg-[#F0EDFF] dark:bg-[#242145] px-2.5 py-1 self-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7C5CFC] dark:text-[#a58eff]">
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

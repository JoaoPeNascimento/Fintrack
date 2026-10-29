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

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProfileMonthlyHistory({ history }: { history: MonthlySummaryItem[] }) {
  const [selectedMonth, setSelectedMonth] = useState<MonthlySummaryItem | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-10 rounded-lg border border-dashed border-line">
        <p className="text-sm text-muted">Nenhum histórico de gastos encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {history.map((item) => (
          <button
            key={`${item.year}-${item.month}`}
            onClick={() => setSelectedMonth(item)}
            className="group flex flex-col text-left rounded-lg border border-line bg-surface p-4 hover:border-primary/40 hover:bg-surface-2/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="text-sm font-medium text-muted first-letter:uppercase">
              {item.label}
            </span>

            <span className="num text-xl font-semibold text-fg mt-1">
              {currencyFormatter.format(item.totalAmount)}
            </span>

            <span className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>{item.expenseCount} {item.expenseCount === 1 ? 'gasto' : 'gastos'}</span>
              <span className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Ver detalhes →</span>
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

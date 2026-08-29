'use client';

import { memo, useMemo } from 'react';
import { DespesaFixa } from '@/components/DespesaFixaManager';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const FixedExpenseTable = ({ despesas, onViewClick }: { despesas: DespesaFixa[]; onViewClick?: (despesa: DespesaFixa) => void }) => {
  const total = useMemo(() => despesas ? despesas.reduce((acc, d) => acc + d.value, 0) : 0, [despesas]);

  if (!despesas || despesas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-clay-secondary">
        <div className="clay-icon w-12 h-12 bg-gradient-to-br from-[#FFF0F5] to-[#FFE0EB] flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-[#FF7EB3]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-sm font-medium">Você não possui despesas fixas cadastradas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[400px]">
        <thead>
          <tr className="border-b border-[#FF7EB3]/10 pb-2">
            <th className="py-3 px-4 font-semibold text-[#FF7EB3] dark:text-[#ff9ecf] text-sm">Nome / Descrição</th>
            <th className="py-3 px-4 font-semibold text-[#FF7EB3] dark:text-[#ff9ecf] text-sm w-40 text-right">Valor Mensal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#FF7EB3]/5">
          {despesas.map((despesa) => (
            <tr key={despesa._id} onClick={() => onViewClick && onViewClick(despesa)} className="clay-table-row group cursor-pointer">
              <td className="py-4 px-4">
                <p className="font-semibold text-clay-primary text-sm">{despesa.name}</p>
                {despesa.description && (
                  <p className="text-xs text-clay-secondary mt-1 truncate max-w-[200px] sm:max-w-xs" title={despesa.description}>
                    {despesa.description}
                  </p>
                )}
              </td>
              <td className="py-4 px-4 text-right whitespace-nowrap">
                <span className="font-bold text-[#FF7EB3] dark:text-[#ff9ecf] text-sm">
                  {currencyFormatter.format(despesa.value)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-[#FF7EB3]/10 bg-[#FFF0F5]/30 dark:bg-[#3A2338]/30">
          <tr>
            <td className="py-4 px-4 text-[#FF7EB3] dark:text-[#ff9ecf] font-bold text-sm">
              Subtotal Mensal Fixo
            </td>
            <td className="py-4 px-4 text-right whitespace-nowrap">
              <span className="font-bold text-[#FF7EB3] dark:text-[#ff9ecf] text-sm">
                {currencyFormatter.format(total)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default memo(FixedExpenseTable);

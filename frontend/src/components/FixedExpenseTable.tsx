'use client';

import { memo, useMemo } from 'react';
import { DespesaFixa } from '@/components/DespesaFixaManager';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const FixedExpenseTable = ({ despesas, onViewClick }: { despesas: DespesaFixa[]; onViewClick?: (despesa: DespesaFixa) => void }) => {
  const total = useMemo(() => despesas ? despesas.reduce((acc, d) => acc + d.value, 0) : 0, [despesas]);

  if (!despesas || despesas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-2 text-muted flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-sm font-medium text-fg">Você não possui despesas fixas cadastradas.</p>
        <p className="text-sm text-muted mt-1">Cadastre-as na página de Perfil.</p>
      </div>
    );
  }

  const th = 'py-3 px-4 eyebrow font-medium';

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[400px]">
        <thead className="bg-surface-2">
          <tr>
            <th className={th}>Descrição</th>
            <th className={`${th} w-40 text-right`}>Valor mensal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {despesas.map((despesa) => (
            <tr key={despesa._id} onClick={() => onViewClick && onViewClick(despesa)} className="cursor-pointer hover:bg-surface-2/60 transition-colors">
              <td className="py-3 px-4">
                <p className="font-medium text-fg text-sm">{despesa.name}</p>
                {despesa.description && (
                  <p className="text-xs text-muted mt-0.5 truncate max-w-[200px] sm:max-w-xs" title={despesa.description}>
                    {despesa.description}
                  </p>
                )}
              </td>
              <td className="num py-3 px-4 text-right whitespace-nowrap text-sm font-semibold text-fg">
                {currencyFormatter.format(despesa.value)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-line bg-surface-2/60">
          <tr>
            <td className="py-3 px-4 text-sm font-medium text-muted">
              Total · {despesas.length} {despesas.length === 1 ? 'despesa' : 'despesas'}
            </td>
            <td className="num py-3 px-4 text-right whitespace-nowrap text-sm font-semibold text-fg">
              {currencyFormatter.format(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default memo(FixedExpenseTable);

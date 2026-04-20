'use client';

import { useTransition, memo, useMemo } from 'react';
import { deleteGasto } from '@/actions/gasto';
import toast from 'react-hot-toast';

type Gasto = {
  _id: string;
  name: string;
  value: number;
  date: string | null;
  payment_method: string;
  installments?: number;
  description?: string;
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ExpenseTable = ({ gastos, onEdit, onViewClick }: { gastos: Gasto[]; onEdit?: (gasto: Gasto) => void; onViewClick?: (gasto: Gasto) => void }) => {
  const [isPending, startTransition] = useTransition();
  const total = useMemo(() => gastos ? gastos.reduce((acc, gasto) => acc + gasto.value, 0) : 0, [gastos]);

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

    startTransition(async () => {
      const res = await deleteGasto(id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };
  if (!gastos || gastos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
        <svg className="w-16 h-16 mb-4 text-indigo-200 dark:text-indigo-900/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">Nenhum gasto registrado ainda.</p>
        <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">Sua lista de despesas aparecerá aqui.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-indigo-100 dark:border-gray-700 pb-2">
            <th className="py-4 px-4 font-semibold text-indigo-800 dark:text-indigo-300 text-sm w-32">Data</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 dark:text-indigo-300 text-sm">Nome / Descrição</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 dark:text-indigo-300 text-sm w-32 text-right">Valor</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 dark:text-indigo-300 text-sm w-40 text-center">Forma de Pagamento</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 dark:text-indigo-300 text-sm w-24 text-center">Parcelas</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 dark:text-indigo-300 text-sm w-16 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {gastos.map((gasto) => (
            <tr key={gasto._id} onClick={() => onViewClick && onViewClick(gasto)} className="hover:bg-indigo-50/50 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer">
              <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {gasto.date ? dateFormatter.format(new Date(gasto.date)) : '--/--/----'}
              </td>
              <td className="py-4 px-4">
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{gasto.name}</p>
                {gasto.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px] sm:max-w-xs" title={gasto.description}>
                    {gasto.description}
                  </p>
                )}
              </td>
              <td className="py-4 px-4 text-right whitespace-nowrap">
                <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                  {currencyFormatter.format(gasto.value)}
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-center">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 inline-block">
                  {gasto.payment_method === 'CARTAO' ? 'Cartão' :
                   gasto.payment_method === 'PIX' ? 'Pix' :
                   gasto.payment_method === 'DINHEIRO' ? 'Dinheiro' : gasto.payment_method}
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-300 font-medium">
                {gasto.installments ? `${gasto.installments}x` : '1x'}
              </td>
              <td className="py-4 px-4 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(gasto); }}
                    className="p-2 text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="Editar despesa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(gasto._id); }}
                    disabled={isPending}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Excluir despesa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-indigo-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <tr>
            <td colSpan={2} className="py-4 px-4 text-indigo-900 dark:text-indigo-200 font-bold text-sm">
              Total ({gastos.length} {gastos.length === 1 ? 'gasto registrado' : 'gastos registrados'})
            </td>
            <td className="py-4 px-4 text-right whitespace-nowrap">
              <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                {currencyFormatter.format(total)}
              </span>
            </td>
            <td colSpan={3}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default memo(ExpenseTable);

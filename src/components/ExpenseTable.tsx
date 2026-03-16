'use client';

import { useTransition } from 'react';
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

export default function ExpenseTable({ gastos }: { gastos: Gasto[] }) {
  const [isPending, startTransition] = useTransition();

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
      <div className="flex flex-col items-center justify-center py-10 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">Nenhum gasto registrado ainda.</p>
        <p className="text-sm mt-1">Sua lista de despesas aparecerá aqui.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-indigo-100 pb-2">
            <th className="py-4 px-4 font-semibold text-indigo-800 text-sm w-32">Data</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 text-sm">Nome / Descrição</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 text-sm w-32 text-right">Valor</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 text-sm w-40 text-center">Forma de Pagamento</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 text-sm w-24 text-center">Parcelas</th>
            <th className="py-4 px-4 font-semibold text-indigo-800 text-sm w-16 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {gastos.map((gasto) => (
            <tr key={gasto._id} className="hover:bg-indigo-50/50 transition-colors group">
              <td className="py-4 px-4 text-sm text-gray-600 whitespace-nowrap">
                {gasto.date ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(gasto.date)) : '--/--/----'}
              </td>
              <td className="py-4 px-4">
                <p className="font-semibold text-gray-800 text-sm">{gasto.name}</p>
                {gasto.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px] sm:max-w-xs" title={gasto.description}>
                    {gasto.description}
                  </p>
                )}
              </td>
              <td className="py-4 px-4 text-right whitespace-nowrap">
                <span className="font-bold text-red-600 text-sm">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gasto.value)}
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-center">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 inline-block">
                  {gasto.payment_method === 'CARTAO' ? 'Cartão' :
                   gasto.payment_method === 'PIX' ? 'Pix' :
                   gasto.payment_method === 'DINHEIRO' ? 'Dinheiro' : gasto.payment_method}
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-center text-gray-600 font-medium">
                {gasto.installments ? `${gasto.installments}x` : '1x'}
              </td>
              <td className="py-4 px-4 text-center">
                <button
                  onClick={() => handleDelete(gasto._id)}
                  disabled={isPending}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Excluir despesa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import { useTransition, memo, useMemo } from 'react';
import { deleteGasto } from '@/actions/gasto';
import toast from 'react-hot-toast';
import { formatCalendarDate } from '@/lib/date';

type Gasto = {
  _id: string;
  name: string;
  value: number;
  date: string | null;
  payment_method: string;
  installments?: number;
  description?: string;
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ExpenseTable = ({ gastos, onEdit, onViewClick, canDelete = true, ownerId }: { gastos: Gasto[]; onEdit?: (gasto: Gasto) => void; onViewClick?: (gasto: Gasto) => void; canDelete?: boolean; ownerId?: string }) => {
  const [isPending, startTransition] = useTransition();
  const total = useMemo(() => gastos ? gastos.reduce((acc, gasto) => acc + gasto.value, 0) : 0, [gastos]);

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

    startTransition(async () => {
      const res = await deleteGasto(id, ownerId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };
  if (!gastos || gastos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-2 text-muted flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-fg">Nenhum gasto registrado ainda.</p>
        <p className="text-sm text-muted mt-1">Use &quot;Nova despesa&quot; para registrar o primeiro.</p>
      </div>
    );
  }

  const th = 'py-3 px-4 eyebrow font-medium whitespace-nowrap';

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead className="bg-surface-2">
          <tr>
            <th className={`${th} sticky left-0 z-10 bg-surface-2 min-w-[180px]`}>Descrição</th>
            <th className={`${th} w-32`}>Data</th>
            <th className={`${th} w-40`}>Pagamento</th>
            <th className={`${th} w-24 text-center`}>Parcelas</th>
            <th className={`${th} w-36 text-right`}>Valor</th>
            <th className={`${th} w-24 text-right`}><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {gastos.map((gasto) => (
            <tr key={gasto._id} onClick={() => onViewClick && onViewClick(gasto)} className="group cursor-pointer hover:bg-surface-2/60 transition-colors">
              <td className="sticky left-0 z-10 bg-surface group-hover:bg-surface-2 py-3 px-4 transition-colors">
                <p className="font-medium text-fg text-sm">{gasto.name}</p>
                {gasto.description && (
                  <p className="text-xs text-muted mt-0.5 truncate max-w-[200px] sm:max-w-xs" title={gasto.description}>
                    {gasto.description}
                  </p>
                )}
              </td>
              <td className="num py-3 px-4 text-sm text-muted whitespace-nowrap">
                {formatCalendarDate(gasto.date)}
              </td>
              <td className="py-3 px-4 text-sm">
                <span className="badge">
                  {gasto.payment_method === 'CARTAO' ? 'Cartão' :
                   gasto.payment_method === 'PIX' ? 'Pix' :
                   gasto.payment_method === 'DINHEIRO' ? 'Dinheiro' : gasto.payment_method}
                </span>
              </td>
              <td className="num py-3 px-4 text-sm text-center text-muted">
                {gasto.installments ? `${gasto.installments}x` : '1x'}
              </td>
              <td className="num py-3 px-4 text-right whitespace-nowrap text-sm font-semibold text-fg">
                {currencyFormatter.format(gasto.value)}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-1">
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(gasto); }}
                      className="icon-btn hover:text-primary"
                      title="Editar despesa"
                      aria-label={`Editar ${gasto.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(gasto._id); }}
                      disabled={isPending}
                      className="icon-btn hover:text-danger disabled:opacity-50"
                      title="Excluir despesa"
                      aria-label={`Excluir ${gasto.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-line bg-surface-2/60">
          <tr>
            <td className="sticky left-0 z-10 bg-surface-2 py-3 px-4 text-sm font-medium text-muted">
              Total · {gastos.length} {gastos.length === 1 ? 'gasto' : 'gastos'}
            </td>
            <td colSpan={3}></td>
            <td className="num py-3 px-4 text-right whitespace-nowrap text-sm font-semibold text-fg">
              {currencyFormatter.format(total)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default memo(ExpenseTable);

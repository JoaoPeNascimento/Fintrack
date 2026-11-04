import type { ReactNode } from 'react';
import { DespesaFixa } from './DespesaFixaManager';
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

type ViewExpenseDetailsProps = {
  gasto: Gasto | DespesaFixa | null;
  onClose: () => void;
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function isGastoType(gasto: Gasto | DespesaFixa): gasto is Gasto {
  return 'payment_method' in gasto;
}

function formatPaymentMethod(method: string) {
  if (method === 'CARTAO') return 'Cartão';
  if (method === 'PIX') return 'Pix';
  if (method === 'DINHEIRO') return 'Dinheiro';
  return method;
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-fg text-right">{children}</dd>
    </div>
  );
}

export default function ViewExpenseDetails({ gasto, onClose }: ViewExpenseDetailsProps) {
  if (!gasto) return null;

  const isGasto = isGastoType(gasto);

  return (
    <div className="space-y-6">
      <div>
        <span className="badge">
          <span className={`w-2 h-2 rounded-sm ${isGasto ? 'bg-variable' : 'bg-fixed'}`} />
          {isGasto ? 'Gasto variável' : 'Despesa fixa'}
        </span>
        <p className="text-xl font-semibold text-fg break-words mt-3">{gasto.name}</p>
        <p className="num text-3xl font-semibold text-fg tracking-tight mt-1">
          {currencyFormatter.format(gasto.value)}
        </p>
      </div>

      {isGasto && (
        <dl className="divide-y divide-line border-y border-line">
          {gasto.date && (
            <DetailRow label="Data">
              <span className="num">{formatCalendarDate(gasto.date)}</span>
            </DetailRow>
          )}
          <DetailRow label="Forma de pagamento">{formatPaymentMethod(gasto.payment_method)}</DetailRow>
          {(gasto.installments ?? 0) > 1 && (
            <DetailRow label="Parcelas">
              <span className="num">{gasto.installments}x</span>
            </DetailRow>
          )}
        </dl>
      )}

      {gasto.description && (
        <div>
          <p className="eyebrow mb-2">Descrição</p>
          <p className="text-sm text-fg whitespace-pre-wrap leading-relaxed">
            {gasto.description}
          </p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button onClick={onClose} className="btn btn-ghost w-full sm:w-auto">
          Fechar
        </button>
      </div>
    </div>
  );
}

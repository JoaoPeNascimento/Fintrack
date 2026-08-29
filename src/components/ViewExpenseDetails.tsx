import { DespesaFixa } from './DespesaFixaManager';

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
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

function isGastoType(gasto: Gasto | DespesaFixa): gasto is Gasto {
  return 'payment_method' in gasto;
}

export default function ViewExpenseDetails({ gasto, onClose }: ViewExpenseDetailsProps) {
  if (!gasto) return null;

  const isGasto = isGastoType(gasto);

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-4 clay-bg-container clay-card-static p-6">
        <h3 className="text-sm font-bold text-clay-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
           {isGasto ? (
              <><span className="w-2 h-2 rounded-full bg-[#7C5CFC] flex-shrink-0 animate-pulse"></span> Gasto Variável</>
           ) : (
              <><span className="w-2 h-2 rounded-full bg-[#FF7EB3] flex-shrink-0 animate-pulse"></span> Despesa Fixa</>
           )}
        </h3>
        <p className="text-2xl sm:text-3xl font-extrabold text-clay-primary break-words">{gasto.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="clay-card clay-bg-purple p-5 flex flex-col justify-center">
          <p className="text-xs font-bold text-clay-purple uppercase tracking-wider mb-1">Valor</p>
          <p className="text-2xl sm:text-3xl font-black text-clay-purple">
            {currencyFormatter.format(gasto.value)}
          </p>
        </div>

        {isGasto && gasto.date && (
          <div className="clay-card clay-bg-container p-5 flex flex-col justify-center">
            <p className="text-xs font-bold text-clay-secondary uppercase tracking-wider mb-1">Data</p>
            <p className="text-lg font-bold text-clay-primary">
              {dateFormatter.format(new Date(gasto.date as string))}
            </p>
          </div>
        )}

        {isGasto && (
          <div className="clay-card clay-bg-container p-5 flex flex-col justify-center">
            <p className="text-xs font-bold text-clay-secondary uppercase tracking-wider mb-1">Forma de Pagamento</p>
            <div className="inline-flex mt-1">
              <span className="clay-badge px-3 py-1 text-sm font-semibold bg-[#F0EDFF] dark:bg-[#242145] text-[#7C5CFC] dark:text-[#a58eff] capitalize">
                {gasto.payment_method.toLowerCase() === 'cartao' ? 'cartão' : gasto.payment_method.toLowerCase()}
              </span>
            </div>
          </div>
        )}

        {isGasto && (gasto.installments ?? 0) > 1 && (
          <div className="clay-card clay-bg-container p-5 flex flex-col justify-center">
            <p className="text-xs font-bold text-clay-secondary uppercase tracking-wider mb-1">Parcelas</p>
            <p className="text-lg font-bold text-clay-primary">
              {gasto.installments}x
            </p>
          </div>
        )}
      </div>

      {gasto.description && (
        <div className="clay-card-static clay-bg-container p-5">
          <p className="text-xs font-bold text-clay-secondary uppercase tracking-wider mb-2">Descrição</p>
          <p className="text-base text-clay-primary whitespace-pre-wrap leading-relaxed">
            {gasto.description}
          </p>
        </div>
      )}
      
      <div className="flex justify-end pt-4 space-x-3">
        <button
          onClick={onClose}
          className="clay-button px-8 py-3 font-bold text-white bg-gradient-to-r from-[#7C5CFC] to-[#9B7FFF] w-full sm:w-auto text-center cursor-pointer"
        >
          Fechar Detalhes
        </button>
      </div>
    </div>
  );
}

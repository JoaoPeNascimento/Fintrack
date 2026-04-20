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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col mb-4 bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
           {isGasto ? (
              <><span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 animate-pulse"></span> Gasto Variável</>
           ) : (
              <><span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-pulse"></span> Despesa Fixa</>
           )}
        </h3>
        <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white break-words">{gasto.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50 p-5 rounded-2xl flex flex-col justify-center transform hover:scale-[1.02] transition-transform duration-300">
          <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">Valor</p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300">
            {currencyFormatter.format(gasto.value)}
          </p>
        </div>

        {isGasto && gasto.date && (
          <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl flex flex-col justify-center transform hover:scale-[1.02] transition-transform duration-300">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Data</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {dateFormatter.format(new Date(gasto.date as string))}
            </p>
          </div>
        )}

        {isGasto && (
          <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl flex flex-col justify-center transform hover:scale-[1.02] transition-transform duration-300">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Forma de Pagamento</p>
            <div className="inline-flex mt-1">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 capitalize shadow-sm">
                {gasto.payment_method.toLowerCase() === 'cartao' ? 'cartão' : gasto.payment_method.toLowerCase()}
              </span>
            </div>
          </div>
        )}

        {isGasto && (gasto.installments ?? 0) > 1 && (
          <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl flex flex-col justify-center transform hover:scale-[1.02] transition-transform duration-300">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Parcelas</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {gasto.installments}x
            </p>
          </div>
        )}
      </div>

      {gasto.description && (
        <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Descrição</p>
          <p className="text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {gasto.description}
          </p>
        </div>
      )}
      
      <div className="flex justify-end pt-4 space-x-3">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-500 dark:hover:to-gray-600 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto text-center border-t border-white/10"
        >
          Fechar Detalhes
        </button>
      </div>
    </div>
  );
}

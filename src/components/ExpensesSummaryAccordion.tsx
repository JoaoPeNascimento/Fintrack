'use client';

import { useState } from 'react';

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

export default function ExpensesSummaryAccordion({ gastos = [], despesasFixas = [] }: { gastos: Gasto[], despesasFixas?: DespesaFixa[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const totalGastos = gastos.reduce((acc, gasto) => acc + gasto.value, 0);
  const totalFixas = despesasFixas.reduce((acc, d) => acc + d.value, 0);
  const totalGlobal = totalGastos + totalFixas;

  const expensesByMethod = gastos.reduce((acc, gasto) => {
    const method = gasto.payment_method;
    acc[method] = (acc[method] || 0) + gasto.value;
    return acc;
  }, {} as Record<string, number>);

  const formatMethod = (method: string) => {
    if (method === 'CARTAO') return 'Cartão';
    if (method === 'PIX') return 'Pix';
    if (method === 'DINHEIRO') return 'Dinheiro';
    return method;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if ((!gastos || gastos.length === 0) && (!despesasFixas || despesasFixas.length === 0)) return null;

  return (
    <div className="w-full mt-6 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 dark:border-gray-700/50 overflow-hidden transition-colors duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors focus:outline-none"
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Resumo Global do Mês
          </span>
          <span className="text-xl font-bold text-red-600 dark:text-red-400 leading-none">
            {formatCurrency(totalGlobal)}
          </span>
        </div>
        <div className="flex items-center justify-center p-2 rounded-full bg-indigo-50 dark:bg-gray-700/50 text-indigo-500 transition-colors">
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Accordion Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Detalhamento
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
               <span className="block text-xs text-indigo-500 dark:text-indigo-400 uppercase font-bold tracking-wider mb-1">Total Variável</span>
               <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(totalGastos)}</span>
            </div>
            <div className="bg-rose-50/50 dark:bg-rose-900/10 p-3 rounded-xl border border-rose-100 dark:border-rose-800/30">
               <span className="block text-xs text-rose-500 dark:text-rose-400 uppercase font-bold tracking-wider mb-1">Total Fixo</span>
               <span className="text-lg font-bold text-rose-700 dark:text-rose-300">{formatCurrency(totalFixas)}</span>
            </div>
          </div>
          
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
            Gastos Variáveis por Forma de Pagamento
          </h4>
          <div className="space-y-2">
            {Object.entries(expensesByMethod)
              .sort(([, a], [, b]) => b - a)
              .map(([method, value]) => (
              <div key={method} className="flex justify-between items-center bg-white/50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100/50 dark:border-gray-700/30">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                   {formatMethod(method)}
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {formatCurrency(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

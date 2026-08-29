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
    <div className="w-full mt-6 clay-card-static clay-bg-container overflow-hidden transition-colors duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="clay-accordion-btn w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none cursor-pointer"
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold text-clay-secondary uppercase tracking-wider mb-1">
            Resumo Global do Mês
          </span>
          <span className="text-xl font-bold text-clay-pink leading-none">
            {formatCurrency(totalGlobal)}
          </span>
        </div>
        <div className="flex items-center justify-center p-2 rounded-full bg-[#F0EDFF] dark:bg-[#242145] clay-icon text-[#7C5CFC] dark:text-[#a58eff]">
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
        <div className="p-4 sm:p-5 border-t border-[#7C5CFC]/10">
          <h3 className="text-sm font-semibold text-clay-primary mb-3">
            Detalhamento
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="clay-icon clay-bg-purple p-3 rounded-xl">
               <span className="block text-xs text-clay-purple uppercase font-bold tracking-wider mb-1">Total Variável</span>
               <span className="text-lg font-bold text-clay-purple">{formatCurrency(totalGastos)}</span>
            </div>
            <div className="clay-icon clay-bg-pink p-3 rounded-xl">
               <span className="block text-xs text-clay-pink uppercase font-bold tracking-wider mb-1">Total Fixo</span>
               <span className="text-lg font-bold text-clay-pink">{formatCurrency(totalFixas)}</span>
            </div>
          </div>
          
          <h4 className="text-xs font-semibold text-clay-secondary uppercase mb-3">
            Gastos Variáveis por Forma de Pagamento
          </h4>
          <div className="space-y-2">
            {Object.entries(expensesByMethod)
              .sort(([, a], [, b]) => b - a)
              .map(([method, value]) => (
              <div key={method} className="flex justify-between items-center bg-white/40 dark:bg-gray-800/40 clay-icon p-3 rounded-xl border border-white/20 dark:border-gray-800/20">
                <span className="text-sm text-clay-primary font-medium flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]"></span>
                   {formatMethod(method)}
                </span>
                <span className="text-sm font-bold text-clay-primary">
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

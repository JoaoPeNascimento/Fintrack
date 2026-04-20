'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import GastoForm from './GastoForm';
import ExpenseTable from './ExpenseTable';
import FixedExpenseTable from './FixedExpenseTable';
import { DespesaFixa } from './DespesaFixaManager';
import GastoModal from './GastoModal';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), { 
  ssr: false, 
  loading: () => <div className="animate-pulse h-[300px] bg-gray-200 dark:bg-gray-700/50 rounded-2xl w-full m-6"></div> 
});

type Gasto = {
  _id: string;
  name: string;
  value: number;
  date: string | null;
  payment_method: string;
  installments?: number;
  description?: string;
};

type Card = {
  id: string;
  name: string;
  color?: string;
};

export default function DashboardClient({ gastos, cards, despesasFixas = [] }: { gastos: Gasto[], cards: Card[], despesasFixas?: DespesaFixa[] }) {
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = useCallback((gasto: Gasto) => {
    setEditingGasto(gasto);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingGasto(null);
    setIsModalOpen(false);
  }, []);

  const handleOpenNew = useCallback(() => {
    setEditingGasto(null);
    setIsModalOpen(true);
  }, []);

  const totalGastos = useMemo(() => gastos.reduce((acc, gasto) => acc + gasto.value, 0), [gastos]);
  const totalFixas = useMemo(() => despesasFixas.reduce((acc, d) => acc + d.value, 0), [despesasFixas]);
  const totalGlobal = totalGastos + totalFixas;

  const formatter = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);
  const formatCurrency = useCallback((value: number) => formatter.format(value), [formatter]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full pb-24 relative">
      <GastoModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingGasto ? 'Editar Gasto' : 'Adicionar Nova Despesa'}
      >
        <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
          {editingGasto ? 'Altere as informações da sua despesa.' : 'Preencha os dados abaixo para registrar no seu gerenciador financeiro.'}
        </p>
        <GastoForm gastoToEdit={editingGasto} onSuccess={handleCloseModal} cards={cards} />
      </GastoModal>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
         <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-2xl p-6 shadow-lg text-white transform hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-xs sm:text-sm font-medium opacity-80 mb-1 uppercase tracking-wider">Total Variável (Mês)</h3>
            <p className="text-2xl sm:text-3xl font-extrabold">{formatCurrency(totalGastos)}</p>
         </div>
         <div className="bg-gradient-to-br from-rose-500 to-orange-600 dark:from-rose-600 dark:to-orange-700 rounded-2xl p-6 shadow-lg text-white transform hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-xs sm:text-sm font-medium opacity-80 mb-1 uppercase tracking-wider">Total Fixo (Mês)</h3>
            <p className="text-2xl sm:text-3xl font-extrabold">{formatCurrency(totalFixas)}</p>
         </div>
         <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl p-6 shadow-lg text-white transform hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-xs sm:text-sm font-medium opacity-80 mb-1 uppercase tracking-wider">Despesa Global (Mês)</h3>
            <p className="text-2xl sm:text-3xl font-extrabold">{formatCurrency(totalGlobal)}</p>
         </div>
      </div>

      {/* Charts */}
      <DashboardCharts gastos={gastos} despesasFixas={despesasFixas} />

      {/* Tables Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full items-start">
        {/* Expenses List */}
        <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 p-6 sm:p-8 overflow-hidden transition-colors duration-300">
          <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
            Meus Gastos Variáveis
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
            Histórico detalhado das suas despesas variáveis.
          </p>
          <ExpenseTable gastos={gastos} onEdit={handleEdit} />
        </div>

        {/* Fixed Expenses List */}
        <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 p-6 sm:p-8 overflow-hidden transition-colors duration-300">
          <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 dark:from-rose-400 dark:to-orange-400 mb-2">
            Despesas Fixas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
            Gerencie suas contas que vencem todo mês.
          </p>
          <FixedExpenseTable despesas={despesasFixas} />
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={handleOpenNew}
        className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-[0_10px_25px_rgba(99,102,241,0.5)] hover:shadow-[0_15px_35px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 group"
        aria-label="Adicionar Nova Despesa"
        title="Adicionar Nova Despesa"
      >
        <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

    </div>
  );
}

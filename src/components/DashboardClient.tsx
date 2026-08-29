'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import GastoForm from './GastoForm';
import ExpenseTable from './ExpenseTable';
import FixedExpenseTable from './FixedExpenseTable';
import { DespesaFixa } from './DespesaFixaManager';
import GastoModal from './GastoModal';
import ViewExpenseDetails from './ViewExpenseDetails';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), { 
  ssr: false, 
  loading: () => <div className="animate-pulse h-[300px] bg-[#F0EDFF]/50 clay-card-static w-full m-6"></div> 
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
  const [viewingGasto, setViewingGasto] = useState<Gasto | DespesaFixa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isGastosOpen, setIsGastosOpen] = useState(true);
  const [isDespesasOpen, setIsDespesasOpen] = useState(true);

  const handleEdit = useCallback((gasto: Gasto) => {
    setEditingGasto(gasto);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingGasto(null);
    setIsModalOpen(false);
  }, []);

  const handleViewClick = useCallback((gasto: Gasto | DespesaFixa) => {
    setViewingGasto(gasto);
    setIsViewModalOpen(true);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setViewingGasto(null);
    setIsViewModalOpen(false);
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
        <p className="text-clay-secondary mb-6 font-medium">
          {editingGasto ? 'Altere as informações da sua despesa.' : 'Preencha os dados abaixo para registrar no seu gerenciador financeiro.'}
        </p>
        <GastoForm gastoToEdit={editingGasto} onSuccess={handleCloseModal} cards={cards} />
      </GastoModal>

      <GastoModal 
        isOpen={isViewModalOpen} 
        onClose={handleCloseViewModal}
        title="Detalhes"
      >
        <ViewExpenseDetails gasto={viewingGasto} onClose={handleCloseViewModal} />
      </GastoModal>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
         <div className="clay-stat clay-bg-purple p-6 text-clay-primary">
            <h3 className="text-xs sm:text-sm font-medium text-clay-purple mb-1 uppercase tracking-wider">Total Variável (Mês)</h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-clay-purple">{formatCurrency(totalGastos)}</p>
         </div>
         <div className="clay-stat clay-bg-pink p-6 text-clay-primary">
            <h3 className="text-xs sm:text-sm font-medium text-clay-pink mb-1 uppercase tracking-wider">Total Fixo (Mês)</h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-clay-pink">{formatCurrency(totalFixas)}</p>
         </div>
         <div className="clay-stat clay-bg-teal p-6 text-clay-primary">
            <h3 className="text-xs sm:text-sm font-medium text-clay-teal mb-1 uppercase tracking-wider">Despesa Global (Mês)</h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-clay-teal">{formatCurrency(totalGlobal)}</p>
         </div>
      </div>

      {/* Charts */}
      <DashboardCharts gastos={gastos} despesasFixas={despesasFixas} />

      {/* Tables (Accordions) */}
      <div className="flex flex-col gap-6 w-full">
        {/* Gastos Variáveis Accordion */}
        <div className="w-full clay-card-static clay-bg-container overflow-hidden transition-colors duration-300">
          <button
            onClick={() => setIsGastosOpen(!isGastosOpen)}
            className="clay-accordion-btn w-full flex items-center justify-between p-6 sm:p-8 text-left focus:outline-none cursor-pointer"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#7C5CFC] to-[#9B7FFF] bg-clip-text text-transparent">
                Meus Gastos Variáveis
              </h2>
              <p className="text-sm text-clay-secondary font-medium mt-1">
                Histórico detalhado das suas despesas variáveis.
              </p>
            </div>
            <div className="flex items-center justify-center p-2.5 rounded-full bg-[#F0EDFF] dark:bg-[#242145] clay-icon text-[#7C5CFC] dark:text-[#a58eff]">
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${isGastosOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div className={`grid transition-all duration-300 ease-in-out ${isGastosOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-[#7C5CFC]/10 pt-6">
                <ExpenseTable gastos={gastos} onEdit={handleEdit} onViewClick={handleViewClick} />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Expenses Accordion */}
        <div className="w-full clay-card-static clay-bg-pink overflow-hidden transition-colors duration-300">
          <button
            onClick={() => setIsDespesasOpen(!isDespesasOpen)}
            className="clay-accordion-btn w-full flex items-center justify-between p-6 sm:p-8 text-left focus:outline-none cursor-pointer"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#FF7EB3] to-[#FFB347] bg-clip-text text-transparent">
                Despesas Fixas
              </h2>
              <p className="text-sm text-clay-secondary font-medium mt-1">
                Gerencie suas contas que vencem todo mês.
              </p>
            </div>
            <div className="flex items-center justify-center p-2.5 rounded-full bg-[#FFF0F5] dark:bg-[#3A2338] clay-icon text-[#FF7EB3] dark:text-[#ff9ecf]">
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${isDespesasOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div className={`grid transition-all duration-300 ease-in-out ${isDespesasOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-[#FF7EB3]/10 pt-6">
                <FixedExpenseTable despesas={despesasFixas} onViewClick={handleViewClick} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={handleOpenNew}
        className="clay-button fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-40 bg-gradient-to-r from-[#7C5CFC] to-[#9B7FFF] text-white rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center animate-pulse-clay group cursor-pointer"
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

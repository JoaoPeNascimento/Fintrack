'use client';

import { useState, useCallback, useMemo, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import GastoForm from './GastoForm';
import ExpenseTable from './ExpenseTable';
import FixedExpenseTable from './FixedExpenseTable';
import { DespesaFixa } from './DespesaFixaManager';
import GastoModal from './GastoModal';
import ViewExpenseDetails from './ViewExpenseDetails';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), { 
  ssr: false, 
  loading: () => <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"><div className="card h-[340px] animate-pulse" /><div className="card h-[340px] animate-pulse" /></div> 
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

  const fixedShare = totalGlobal > 0 ? (totalFixas / totalGlobal) * 100 : 0;
  const variableShare = totalGlobal > 0 ? 100 - fixedShare : 0;
  const monthLabel = useMemo(() => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date()), []);

  return (
    <div className="flex flex-col gap-6 w-full pb-24 sm:pb-0 relative">
      <GastoModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingGasto ? 'Editar despesa' : 'Nova despesa'}
      >
        <p className="text-sm text-muted mb-5">
          {editingGasto ? 'Altere as informações da sua despesa.' : 'Registre um gasto variável em poucos segundos.'}
        </p>
        <GastoForm gastoToEdit={editingGasto} onSuccess={handleCloseModal} cards={cards} />
      </GastoModal>

      <GastoModal 
        isOpen={isViewModalOpen} 
        onClose={handleCloseViewModal}
        title="Detalhes da despesa"
      >
        <ViewExpenseDetails gasto={viewingGasto} onClose={handleCloseViewModal} />
      </GastoModal>

      {/* Page heading + primary action */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow first-letter:uppercase">{monthLabel}</p>
          <h1 className="text-2xl font-semibold text-fg tracking-tight mt-1">Visão geral</h1>
        </div>
        <button onClick={handleOpenNew} className="btn btn-accent hidden sm:inline-flex">
          <PlusIcon className="w-4 h-4" />
          Nova despesa
        </button>
      </div>

      {/* Monthly summary */}
      <section className="card p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <p className="text-sm font-medium text-muted">Total gasto no mês</p>
            <p className="num text-3xl sm:text-4xl font-semibold text-fg tracking-tight mt-1">{formatCurrency(totalGlobal)}</p>
            <p className="text-sm text-muted mt-1">
              {gastos.length + despesasFixas.length} {gastos.length + despesasFixas.length === 1 ? 'lançamento' : 'lançamentos'}
            </p>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-center gap-4">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2"
              role="img"
              aria-label={`Fixas ${fixedShare.toFixed(0)}%, variáveis ${variableShare.toFixed(0)}%`}
            >
              <div className="bg-fixed transition-all duration-500" style={{ width: `${fixedShare}%` }} />
              <div className="bg-variable transition-all duration-500" style={{ width: `${variableShare}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SummaryItem colorClass="bg-fixed" label="Despesas fixas" value={formatCurrency(totalFixas)} share={fixedShare} count={despesasFixas.length} />
              <SummaryItem colorClass="bg-variable" label="Gastos variáveis" value={formatCurrency(totalGastos)} share={variableShare} count={gastos.length} />
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <DashboardCharts gastos={gastos} despesasFixas={despesasFixas} />

      {/* Tables (Accordions) */}
      <div className="flex flex-col gap-6 w-full">
        <AccordionSection
          title="Gastos variáveis"
          subtitle="Compras e pagamentos avulsos do mês."
          total={formatCurrency(totalGastos)}
          dotClass="bg-variable"
          isOpen={isGastosOpen}
          onToggle={() => setIsGastosOpen(!isGastosOpen)}
        >
          <ExpenseTable gastos={gastos} onEdit={handleEdit} onViewClick={handleViewClick} />
        </AccordionSection>

        <AccordionSection
          title="Despesas fixas"
          subtitle="Contas recorrentes que vencem todo mês."
          total={formatCurrency(totalFixas)}
          dotClass="bg-fixed"
          isOpen={isDespesasOpen}
          onToggle={() => setIsDespesasOpen(!isDespesasOpen)}
        >
          <FixedExpenseTable despesas={despesasFixas} onViewClick={handleViewClick} />
        </AccordionSection>
      </div>

      {/* FAB - mobile only */}
      <button
        onClick={handleOpenNew}
        className="sm:hidden fixed bottom-5 right-5 z-40 btn btn-accent rounded-full h-14 px-5 shadow-lg"
        aria-label="Adicionar nova despesa"
      >
        <PlusIcon className="w-5 h-5" />
        Nova despesa
      </button>

    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m7-7H5" />
    </svg>
  );
}

function SummaryItem({ colorClass, label, value, share, count }: { colorClass: string; label: string; value: string; share: number; count: number }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className={`w-2.5 h-2.5 rounded-sm ${colorClass}`} />
        {label}
        <span className="num text-xs">· {share.toFixed(0)}%</span>
      </div>
      <p className="num text-lg sm:text-xl font-semibold text-fg mt-1">{value}</p>
      <p className="text-xs text-muted">{count} {count === 1 ? 'item' : 'itens'}</p>
    </div>
  );
}

function AccordionSection({ title, subtitle, total, dotClass, isOpen, onToggle, children }: {
  title: string;
  subtitle: string;
  total: string;
  dotClass: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-6 text-left hover:bg-surface-2/60 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className={`mt-2 w-2.5 h-2.5 rounded-sm shrink-0 ${dotClass}`} />
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-fg">{title}</h2>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="num text-sm sm:text-base font-semibold text-fg">{total}</span>
          <svg
            className={`w-5 h-5 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-line">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

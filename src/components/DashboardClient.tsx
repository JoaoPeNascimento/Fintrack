'use client';

import { useState } from 'react';
import GastoForm from './GastoForm';
import ExpenseTable from './ExpenseTable';
import ExpensesSummaryAccordion from './ExpensesSummaryAccordion';

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

export default function DashboardClient({ gastos, cards }: { gastos: Gasto[], cards: Card[] }) {
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);

  const handleEdit = (gasto: Gasto) => {
    setEditingGasto(gasto);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingGasto(null);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full">
      {/* Form Container */}
      <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 p-6 sm:p-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {editingGasto ? 'Editar Gasto' : 'Adicionar Gasto'}
          </h1>
          {editingGasto && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar Edição
            </button>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
          {editingGasto ? 'Altere as informações da sua despesa.' : 'Registre uma nova despesa no seu gerenciador financeiro.'}
        </p>

        <GastoForm gastoToEdit={editingGasto} onSuccess={handleCancelEdit} cards={cards} />
      </div>

      {/* Expenses List */}
      <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 p-6 sm:p-8 overflow-hidden transition-colors duration-300">
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
          Meus Gastos
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
          Acompanhe o histórico das suas despesas.
        </p>
        <ExpenseTable gastos={gastos} onEdit={handleEdit} />
        <ExpensesSummaryAccordion gastos={gastos} />
      </div>
    </div>
  );
}

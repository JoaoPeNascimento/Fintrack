'use client';

import { createGasto } from '@/actions/gasto';
import { useRef, useActionState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Initial state for the action
const initialState = {
  success: false,
  message: '',
};

export default function GastoForm() {
  const [state, formAction, isPending] = useActionState(createGasto, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        formRef.current?.reset();
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Nome */}
        <div className="lg:col-span-4">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            Nome da Despesa
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Ex: Supermercado"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white/50 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Valor */}
        <div className="lg:col-span-2">
          <label htmlFor="value" className="block text-sm font-semibold text-gray-700 mb-1">
            Valor (R$)
          </label>
          <input
            type="number"
            name="value"
            id="value"
            step="0.01"
            min="0"
            placeholder="0.00"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white/50 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Data */}
        <div className="lg:col-span-2">
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-1">
            Data
          </label>
          <input
            type="date"
            name="date"
            id="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white/50 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Forma de Pagamento */}
        <div className="lg:col-span-2">
          <label htmlFor="payment_method" className="block text-sm font-semibold text-gray-700 mb-1">
            Pagamento
          </label>
          <select
            name="payment_method"
            id="payment_method"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white/50 text-gray-900 placeholder:text-gray-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat pr-10"
          >
            <option value="CARTAO">Cartão</option>
            <option value="PIX">Pix</option>
            <option value="DINHEIRO">Dinheiro</option>
          </select>
        </div>

        {/* Parcelas */}
        <div className="lg:col-span-2">
          <label htmlFor="installments" className="block text-sm font-semibold text-gray-700 mb-1">
            Parcelas
          </label>
          <input
            type="number"
            name="installments"
            id="installments"
            min="1"
            defaultValue="1"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white/50 text-gray-900 placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Descrição */}
        <div className="lg:col-span-9">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
            Descrição do Gasto (Opcional)
          </label>
          <input
            type="text"
            name="description"
            id="description"
            placeholder="Adicione mais detalhes sobre essa despesa..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white/50 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Botão de Envio */}
        <div className="lg:col-span-3">
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-[50px] bg-gradient-to-r from-indigo-600 hover:from-indigo-700 to-purple-600 hover:to-purple-700 text-white font-bold px-4 rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center"
          >
            {isPending ? 'Registrando...' : 'Registrar Gasto'}
          </button>
        </div>
      </div>
    </form>
  );
}

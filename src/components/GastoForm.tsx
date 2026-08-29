'use client';

import { createGasto } from '@/actions/gasto';
import { useRef, useActionState, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Initial state for the action
const initialState = {
  success: false,
  message: '',
};

type Gasto = {
  _id: string;
  name: string;
  value: number;
  date: string | null;
  payment_method: string;
  installments?: number;
  description?: string;
  cardId?: string;
};

type Card = {
  id: string;
  name: string;
  color?: string;
};

export default function GastoForm({ gastoToEdit, onSuccess, cards = [] }: { gastoToEdit?: Gasto | null; onSuccess?: () => void; cards?: Card[] } = {}) {
  const [state, formAction, isPending] = useActionState(createGasto, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [paymentMethod, setPaymentMethod] = useState('PIX');

  useEffect(() => {
    if (gastoToEdit && formRef.current) {
      const form = formRef.current;
      const nameInput = form.elements.namedItem('name') as HTMLInputElement;
      if (nameInput) nameInput.value = gastoToEdit.name;

      const valueInput = form.elements.namedItem('value') as HTMLInputElement;
      if (valueInput) valueInput.value = gastoToEdit.value.toString();

      const dateInput = form.elements.namedItem('date') as HTMLInputElement;
      if (dateInput) dateInput.value = gastoToEdit.date ? gastoToEdit.date.split('T')[0] : '';
      
      setPaymentMethod(gastoToEdit.payment_method === 'CARTAO' && gastoToEdit.cardId ? `CARD_${gastoToEdit.cardId}` : gastoToEdit.payment_method);
      
      const installmentsInput = form.elements.namedItem('installments') as HTMLInputElement;
      if (installmentsInput) installmentsInput.value = (gastoToEdit.installments || 1).toString();
      
      const descInput = form.elements.namedItem('description') as HTMLInputElement;
      if (descInput) descInput.value = gastoToEdit.description || '';
    } else if (formRef.current) {
      formRef.current.reset();
      setPaymentMethod('PIX');
    }
  }, [gastoToEdit]);

  const lastStateRef = useRef(state);

  useEffect(() => {
    if (state !== lastStateRef.current) {
      lastStateRef.current = state;
      if (state?.message) {
        if (state.success) {
          toast.success(state.message);
          formRef.current?.reset();
          setPaymentMethod('PIX'); // Reset state on success
          if (onSuccess) onSuccess();
        } else {
          toast.error(state.message);
        }
      }
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {gastoToEdit && <input type="hidden" name="id" value={gastoToEdit._id} />}
      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Nome */}
        <div className="lg:col-span-4">
          <label htmlFor="name" className="block text-sm font-semibold text-clay-primary mb-1">
            Nome da Despesa
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Ex: Supermercado"
            required
            className="clay-input w-full px-4 py-3 text-clay-primary placeholder:text-clay-secondary/50"
          />
        </div>

        {/* Valor */}
        <div className="lg:col-span-2">
          <label htmlFor="value" className="block text-sm font-semibold text-clay-primary mb-1">
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
            className="clay-input w-full px-4 py-3 text-clay-primary placeholder:text-clay-secondary/50"
          />
        </div>

        {/* Data */}
        <div className="lg:col-span-2">
          <label htmlFor="date" className="block text-sm font-semibold text-clay-primary mb-1">
            Data
          </label>
          <input
            type="date"
            name="date"
            id="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required
            className="clay-input w-full px-4 py-3 text-clay-primary"
          />
        </div>

        {/* Forma de Pagamento */}
        <div className={paymentMethod.startsWith('CARD_') ? "lg:col-span-2" : "lg:col-span-4"}>
          <label htmlFor="payment_method" className="block text-sm font-semibold text-clay-primary mb-1">
            Pagamento
          </label>
          <select
            name="payment_method"
            id="payment_method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
            className="clay-input w-full px-4 py-3 text-clay-primary appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%237C5CFC%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat pr-10"
          >
            <option value="PIX">Pix</option>
            <option value="DINHEIRO">Dinheiro</option>
            <optgroup label="Cartões de Crédito">
              {cards.length === 0 && <option disabled>Nenhum cartão cadastrado</option>}
              {cards.map(card => (
                <option key={card.id} value={`CARD_${card.id}`}>{card.name} (Cartão)</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Parcelas */}
        {paymentMethod.startsWith('CARD_') && (
          <div className="lg:col-span-2">
            <label htmlFor="installments" className="block text-sm font-semibold text-clay-primary mb-1">
              Parcelas
            </label>
            <input
              type="number"
              name="installments"
              id="installments"
              min="1"
              defaultValue="1"
              className="clay-input w-full px-4 py-3 text-clay-primary"
            />
          </div>
        )}
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Descrição */}
        <div className="lg:col-span-9">
          <label htmlFor="description" className="block text-sm font-semibold text-clay-primary mb-1">
            Descrição do Gasto (Opcional)
          </label>
          <input
            type="text"
            name="description"
            id="description"
            placeholder="Adicione mais detalhes sobre essa despesa..."
            className="clay-input w-full px-4 py-3 text-clay-primary placeholder:text-clay-secondary/50"
          />
        </div>

        {/* Botão de Envio */}
        <div className="lg:col-span-3">
          <button
            type="submit"
            disabled={isPending}
            className="clay-button w-full h-[50px] bg-gradient-to-r from-[#7C5CFC] to-[#9B7FFF] text-white font-bold px-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (gastoToEdit ? 'Atualizando...' : 'Registrando...') : (gastoToEdit ? 'Atualizar Gasto' : 'Registrar Gasto')}
          </button>
        </div>
      </div>
    </form>
  );
}

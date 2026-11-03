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

  const isCard = paymentMethod.startsWith('CARD_');

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      {gastoToEdit && <input type="hidden" name="id" value={gastoToEdit._id} />}

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {/* Nome */}
        <div className="sm:col-span-3">
          <label htmlFor="name" className="label">Descrição</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Ex: Supermercado"
            required
            autoFocus
            className="input"
          />
        </div>

        {/* Valor */}
        <div className="sm:col-span-2">
          <label htmlFor="value" className="label">Valor</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">R$</span>
            <input
              type="number"
              name="value"
              id="value"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="0,00"
              required
              className="input num pl-10 text-right font-semibold text-base"
            />
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${isCard ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {/* Data */}
        <div>
          <label htmlFor="date" className="label">Data</label>
          <input
            type="date"
            name="date"
            id="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required
            className="input"
          />
        </div>

        {/* Forma de Pagamento */}
        <div>
          <label htmlFor="payment_method" className="label">Pagamento</label>
          <select
            name="payment_method"
            id="payment_method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
            className="input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_0.75rem_center] bg-no-repeat pr-10"
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
        {isCard && (
          <div>
            <label htmlFor="installments" className="label">Parcelas</label>
            <input
              type="number"
              name="installments"
              id="installments"
              min="1"
              defaultValue="1"
              className="input num"
            />
          </div>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="label">
          Observação <span className="font-normal text-muted">(opcional)</span>
        </label>
        <input
          type="text"
          name="description"
          id="description"
          placeholder="Adicione mais detalhes sobre essa despesa..."
          className="input"
        />
      </div>

      {/* Botão de Envio */}
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-accent w-full sm:w-auto sm:min-w-[180px] h-11"
        >
          {isPending ? (gastoToEdit ? 'Atualizando...' : 'Registrando...') : (gastoToEdit ? 'Salvar alterações' : 'Registrar despesa')}
        </button>
      </div>
    </form>
  );
}

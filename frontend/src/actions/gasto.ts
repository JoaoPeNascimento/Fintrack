'use server';

import { revalidatePath } from 'next/cache';
import { backendFetch, errorMessage } from '@/lib/backend';

type BackendExpense = {
  id: string;
  name: string;
  description: string | null;
  value: number;
  date: string | null;
  paymentMethod: 'CARTAO' | 'PIX' | 'DINHEIRO';
  installments: number;
  cardId: string | null;
};

type MonthlySummary = {
  month: number;
  year: number;
  label: string;
  shortLabel: string;
  totalAmount: number;
  expenseCount: number;
};

function toPlainGasto(g: BackendExpense) {
  return {
    _id: g.id,
    name: g.name,
    value: g.value,
    date: g.date, // dia do calendário "yyyy-MM-dd"; formate com '@/lib/date'
    payment_method: g.paymentMethod,
    installments: g.installments,
    description: g.description ?? undefined,
    cardId: g.cardId ?? undefined,
  };
}

function revalidate() {
  revalidatePath('/dashboard');
  revalidatePath('/profile');
}

export async function createGasto(_prevState: unknown, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const installmentsStr = formData.get('installments') as string;

    // The backend applies the business rules (installment split, "CARD_<id>" parsing, defaults)
    const body = {
      name: formData.get('name') as string,
      value: parseFloat(formData.get('value') as string),
      date: (formData.get('date') as string) || null,
      paymentMethod: formData.get('payment_method') as string,
      installments: installmentsStr ? parseInt(installmentsStr, 10) : 1,
      description: formData.get('description') as string,
    };

    if (id) {
      await backendFetch(`/expenses/${encodeURIComponent(id)}`, { method: 'PUT', body });
      revalidate();
      return { success: true, message: 'Gasto atualizado com sucesso!' };
    }

    await backendFetch('/expenses', { method: 'POST', body });
    revalidate();
    return { success: true, message: 'Gasto registrado com sucesso!' };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Falha ao registrar gasto.') };
  }
}

export async function getUserGastos() {
  try {
    const gastos = await backendFetch<BackendExpense[]>('/expenses/active');
    return { success: true, data: gastos.map(toPlainGasto) };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getMonthlyExpenseSummary() {
  try {
    const data = await backendFetch<MonthlySummary[]>('/expenses/monthly-summary');
    return { success: true, data };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getExpensesByMonthAndYear(month: number, year: number) {
  try {
    const gastos = await backendFetch<BackendExpense[]>(`/expenses?month=${month}&year=${year}`);
    return { success: true, data: gastos.map(toPlainGasto) };
  } catch {
    return { success: false, data: [] };
  }
}

export async function deleteGasto(id: string) {
  try {
    await backendFetch(`/expenses/${encodeURIComponent(id)}`, { method: 'DELETE' });

    revalidate();

    return { success: true, message: 'Gasto excluído com sucesso!' };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Erro ao excluir gasto.') };
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { backendFetch, errorMessage } from '@/lib/backend';

type BackendFixedExpense = {
  id: string;
  name: string;
  description: string | null;
  value: number;
};

function revalidate() {
  revalidatePath('/dashboard');
  revalidatePath('/profile');
}

export async function createDespesaFixa(_prevState: unknown, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const body = {
      name: formData.get('name') as string,
      value: parseFloat(formData.get('value') as string),
      description: formData.get('description') as string,
    };

    if (id) {
      await backendFetch(`/fixed-expenses/${encodeURIComponent(id)}`, { method: 'PUT', body });
      revalidate();
      return { success: true, message: 'Despesa fixa atualizada com sucesso!' };
    }

    await backendFetch('/fixed-expenses', { method: 'POST', body });
    revalidate();
    return { success: true, message: 'Despesa fixa registrada com sucesso!' };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Falha ao criar despesa fixa.') };
  }
}

export async function getUserDespesasFixas() {
  try {
    const items = await backendFetch<BackendFixedExpense[]>('/fixed-expenses');

    const plainItems = items.map((d) => ({
      _id: d.id,
      name: d.name,
      value: d.value,
      description: d.description ?? undefined,
    }));

    return { success: true, data: plainItems };
  } catch {
    return { success: false, data: [] };
  }
}

export async function deleteDespesaFixa(id: string) {
  try {
    await backendFetch(`/fixed-expenses/${encodeURIComponent(id)}`, { method: 'DELETE' });

    revalidate();

    return { success: true, message: 'Despesa excluída com sucesso!' };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Erro ao excluir despesa.') };
  }
}

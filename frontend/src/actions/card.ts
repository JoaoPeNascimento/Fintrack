'use server';

import { revalidatePath } from 'next/cache';
import { backendFetch, errorMessage } from '@/lib/backend';
import type { CardColor } from '@/components/CardManager';

type CardInput = {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
};

type BackendCard = Omit<CardInput, 'color'> & { id: string; color: CardColor };

function toCardData(card: BackendCard) {
  return {
    _id: card.id,
    name: card.name,
    limit: card.limit,
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    color: card.color,
  };
}

export async function createCard(formData: CardInput) {
  try {
    const card = await backendFetch<BackendCard>('/cards', { method: 'POST', body: formData });

    revalidatePath('/profile');

    return { success: true, message: 'Cartão registrado com sucesso!', card: toCardData(card) };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Falha ao salvar o cartão no banco de dados.') };
  }
}

export async function getUserCards() {
  try {
    const cards = await backendFetch<BackendCard[]>('/cards');

    const plainCards = cards.map((c) => ({
      id: c.id,
      name: c.name,
      limit: c.limit,
      closingDay: c.closingDay,
      dueDay: c.dueDay,
      color: c.color,
    }));

    return { success: true, data: plainCards };
  } catch {
    return { success: false, data: [] };
  }
}

export async function updateCard(cardId: string, formData: CardInput) {
  try {
    const card = await backendFetch<BackendCard>(`/cards/${encodeURIComponent(cardId)}`, {
      method: 'PUT',
      body: formData,
    });

    revalidatePath('/profile');

    return { success: true, message: 'Cartão atualizado com sucesso!', card: toCardData(card) };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Falha ao atualizar cartão.') };
  }
}

export async function deleteCard(cardId: string) {
  try {
    await backendFetch(`/cards/${encodeURIComponent(cardId)}`, { method: 'DELETE' });

    revalidatePath('/profile');
    return { success: true, message: 'Cartão deletado com sucesso!' };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Falha ao deletar cartão.') };
  }
}

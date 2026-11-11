'use server';

import { revalidatePath } from 'next/cache';
import { BackendError, backendFetch, errorMessage } from '@/lib/backend';
import type { MyShare, ShareInvite, SharePermission, SharedSpace } from '@/lib/share';

function revalidate() {
  revalidatePath('/profile');
  revalidatePath('/shared/[ownerId]', 'page');
}

/** Configuração do compartilhamento do usuário atual; `data` é null se ele nunca compartilhou. */
export async function getMyShare() {
  try {
    const data = await backendFetch<MyShare | undefined>('/share');
    return { success: true, data: data ?? null };
  } catch {
    return { success: false, data: null };
  }
}

export async function configureShare(permission: SharePermission, enabled: boolean) {
  try {
    const data = await backendFetch<MyShare>('/share', { method: 'PUT', body: { permission, enabled } });
    revalidate();
    return {
      success: true,
      message: enabled ? 'Compartilhamento atualizado!' : 'Compartilhamento desativado.',
      data,
    };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Falha ao salvar o compartilhamento.'), data: null };
  }
}

export async function regenerateShareLink() {
  try {
    const data = await backendFetch<MyShare>('/share/regenerate', { method: 'POST' });
    revalidate();
    return { success: true, message: 'Novo link gerado. O link anterior não funciona mais.', data };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Falha ao gerar novo link.'), data: null };
  }
}

export async function removeShareMember(memberId: string) {
  try {
    await backendFetch(`/share/members/${encodeURIComponent(memberId)}`, { method: 'DELETE' });
    revalidate();
    return { success: true, message: 'Acesso removido.' };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Falha ao remover o acesso.') };
  }
}

/** `status` diferencia link inválido (404) de falha de comunicação. */
export async function getShareInvite(token: string) {
  try {
    const data = await backendFetch<ShareInvite>(`/share-invites/${encodeURIComponent(token)}`);
    return { success: true, status: 200, data };
  } catch (error) {
    return { success: false, status: error instanceof BackendError ? error.status : 500, data: null };
  }
}

export async function acceptShare(token: string) {
  try {
    const { ownerId } = await backendFetch<{ ownerId: string }>(
      `/share-invites/${encodeURIComponent(token)}/accept`,
      { method: 'POST' }
    );
    revalidatePath('/profile');
    return { success: true, message: 'Compartilhamento aceito!', ownerId };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Não foi possível aceitar o compartilhamento.'), ownerId: null };
  }
}

export async function getSharedWithMe() {
  try {
    const data = await backendFetch<SharedSpace[]>('/shared');
    return { success: true, data };
  } catch {
    return { success: false, data: [] as SharedSpace[] };
  }
}

export async function getSharedSpace(ownerId: string) {
  try {
    const data = await backendFetch<SharedSpace>(`/shared/${encodeURIComponent(ownerId)}`);
    return { success: true, status: 200, data };
  } catch (error) {
    return { success: false, status: error instanceof BackendError ? error.status : 500, data: null };
  }
}

export async function leaveShare(ownerId: string) {
  try {
    await backendFetch(`/shared/${encodeURIComponent(ownerId)}`, { method: 'DELETE' });
    revalidatePath('/profile');
    return { success: true, message: 'Você saiu do compartilhamento.' };
  } catch (error) {
    return { success: false, message: errorMessage(error, 'Falha ao sair do compartilhamento.') };
  }
}

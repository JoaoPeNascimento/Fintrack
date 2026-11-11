// Tipos e textos do compartilhamento, usados tanto no servidor quanto no navegador.

export type SharePermission = 'VIEW_ONLY' | 'ADD_EXPENSES' | 'EDIT_ALL';

export type ShareUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export type MyShare = {
  token: string;
  permission: SharePermission;
  enabled: boolean;
  members: { user: ShareUser; joinedAt: string }[];
};

export type ShareInvite = {
  owner: ShareUser;
  permission: SharePermission;
  alreadyMember: boolean;
  isOwner: boolean;
};

export type SharedSpace = {
  owner: ShareUser;
  permission: SharePermission;
};

export const PERMISSION_OPTIONS: { value: SharePermission; label: string; description: string }[] = [
  {
    value: 'VIEW_ONLY',
    label: 'Só visualizar',
    description: 'Vê gastos, despesas fixas e cartões, sem alterar nada.',
  },
  {
    value: 'ADD_EXPENSES',
    label: 'Apenas adicionar gastos',
    description: 'Vê tudo e pode registrar novos gastos, mas não edita nem exclui.',
  },
  {
    value: 'EDIT_ALL',
    label: 'Editar tudo',
    description: 'Adiciona, edita e exclui gastos, despesas fixas e cartões.',
  },
];

export function permissionLabel(permission: SharePermission) {
  return PERMISSION_OPTIONS.find((o) => o.value === permission)?.label ?? permission;
}

export function displayName(user: ShareUser) {
  return user.name || user.email || 'Usuário';
}

/** O que a regra permite na interface (o backend faz a mesma verificação). */
export function capabilities(permission?: SharePermission) {
  // Sem regra = o próprio dono.
  const p = permission ?? 'EDIT_ALL';
  return {
    canCreateExpense: p !== 'VIEW_ONLY',
    canModifyExpense: p === 'EDIT_ALL',
    canManageCardsAndFixed: p === 'EDIT_ALL',
  };
}

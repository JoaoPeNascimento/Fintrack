'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import GastoModal from './GastoModal';
import UserAvatar from './UserAvatar';
import { acceptShare } from '@/actions/share';
import { PERMISSION_OPTIONS, displayName, type ShareInvite } from '@/lib/share';

/** Confirmação exibida a quem abre um link de compartilhamento, antes de ver os gastos. */
export default function ShareInviteModal({ token, invite }: { token: string; invite: ShareInvite }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const name = displayName(invite.owner);
  const rule = PERMISSION_OPTIONS.find((o) => o.value === invite.permission);

  const handleCancel = useCallback(() => router.push('/dashboard'), [router]);

  const handleProceed = () => {
    startTransition(async () => {
      const res = await acceptShare(token);
      if (res.success && res.ownerId) {
        toast.success(res.message);
        router.push(`/shared/${res.ownerId}`);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <GastoModal isOpen onClose={handleCancel} title="Gastos compartilhados com você">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <UserAvatar user={invite.owner} size="md" />
          <div className="min-w-0">
            <p className="text-base font-semibold text-fg truncate">{name}</p>
            {invite.owner.email && invite.owner.name && (
              <p className="text-sm text-muted truncate">{invite.owner.email}</p>
            )}
          </div>
        </div>

        <p className="text-sm text-fg">
          <strong>{name}</strong> compartilhou os gastos, despesas fixas e cartões com você.
          Deseja prosseguir com a visualização?
        </p>

        {rule && (
          <div className="rounded-xl border border-line bg-surface-2/60 p-4">
            <p className="eyebrow">Sua permissão</p>
            <p className="text-sm font-semibold text-fg mt-1">{rule.label}</p>
            <p className="text-sm text-muted">{rule.description}</p>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button type="button" onClick={handleCancel} disabled={isPending} className="btn btn-ghost">
            Cancelar
          </button>
          <button type="button" onClick={handleProceed} disabled={isPending} className="btn btn-accent sm:min-w-[160px]">
            {isPending ? 'Abrindo...' : 'Prosseguir'}
          </button>
        </div>
      </div>
    </GastoModal>
  );
}

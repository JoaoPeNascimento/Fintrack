'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import UserAvatar from './UserAvatar';
import { leaveShare } from '@/actions/share';
import { displayName, permissionLabel, type SharedSpace } from '@/lib/share';

export default function SharedWithMeList({ initialSpaces }: { initialSpaces: SharedSpace[] }) {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [isPending, startTransition] = useTransition();

  const handleLeave = (ownerId: string, name: string) => {
    if (!window.confirm(`Sair do compartilhamento de ${name}? Você precisará de um novo convite para voltar.`)) return;
    startTransition(async () => {
      const res = await leaveShare(ownerId);
      if (res.success) {
        setSpaces((prev) => prev.filter((s) => s.owner.id !== ownerId));
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
          Compartilhados comigo
          <span className="badge num">{spaces.length}</span>
        </h2>
        <p className="text-sm text-muted">Gastos que outras pessoas compartilharam com você.</p>
      </div>

      {spaces.length === 0 ? (
        <p className="text-center py-6 text-sm text-muted">
          Nenhum compartilhamento ainda. Quando alguém enviar um link para você, ele aparecerá aqui.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {spaces.map(({ owner, permission }) => (
            <li key={owner.id} className="relative flex items-center gap-3 rounded-xl border border-line p-4 hover:bg-surface-2/60 transition-colors">
              <UserAvatar user={owner} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/shared/${owner.id}`}
                  className="block text-sm font-semibold text-fg truncate after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {displayName(owner)}
                </Link>
                <span className="badge mt-1">{permissionLabel(permission)}</span>
              </div>
              <button
                type="button"
                onClick={() => handleLeave(owner.id, displayName(owner))}
                disabled={isPending}
                className="icon-btn hover:text-danger relative z-10 disabled:opacity-50"
                title="Sair do compartilhamento"
                aria-label={`Sair do compartilhamento de ${displayName(owner)}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

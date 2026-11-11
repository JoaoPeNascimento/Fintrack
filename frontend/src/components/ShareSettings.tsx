'use client';

import { useState, useSyncExternalStore, useTransition } from 'react';
import toast from 'react-hot-toast';
import GastoModal from './GastoModal';
import UserAvatar from './UserAvatar';
import { configureShare, regenerateShareLink, removeShareMember } from '@/actions/share';
import { PERMISSION_OPTIONS, displayName, permissionLabel, type MyShare, type SharePermission } from '@/lib/share';

const noopSubscribe = () => () => {};

const joinedFormatter =new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ShareSettings({ initialShare }: { initialShare: MyShare | null }) {
  const [share, setShare] = useState<MyShare | null>(initialShare);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<SharePermission>(initialShare?.permission ?? 'VIEW_ONLY');
  // Depois de salvar, o modal passa a exibir o link gerado.
  const [savedInModal, setSavedInModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Vazio no servidor e na hidratação; a origem real só existe no navegador.
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => '');

  const enabled = share?.enabled ?? false;
  const link = share && origin ? `${origin}/share/${share.token}` : '';

  const openRulesModal = () => {
    setSelected(share?.permission ?? 'VIEW_ONLY');
    setSavedInModal(false);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleToggle = () => {
    if (!enabled) {
      openRulesModal();
      return;
    }
    if (!share) return;
    startTransition(async () => {
      const res = await configureShare(share.permission, false);
      if (res.success && res.data) {
        setShare(res.data);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleSaveRules = () => {
    startTransition(async () => {
      const res = await configureShare(selected, true);
      if (res.success && res.data) {
        setShare(res.data);
        setSavedInModal(true);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleRegenerate = () => {
    if (!window.confirm('Gerar um novo link? O link atual deixará de funcionar (quem já entrou continua com acesso).')) return;
    startTransition(async () => {
      const res = await regenerateShareLink();
      if (res.success && res.data) {
        setShare(res.data);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleRemoveMember = (memberId: string, name: string) => {
    if (!window.confirm(`Remover o acesso de ${name}?`)) return;
    startTransition(async () => {
      const res = await removeShareMember(memberId);
      if (res.success) {
        setShare((prev) => prev && { ...prev, members: prev.members.filter((m) => m.user.id !== memberId) });
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado!');
    } catch {
      toast.error('Não foi possível copiar. Selecione o link e copie manualmente.');
    }
  };

  return (
    <section className="card p-5 sm:p-6">
      <GastoModal isOpen={isModalOpen} onClose={closeModal} title={savedInModal ? 'Link de compartilhamento' : 'Regras do compartilhamento'}>
        {!savedInModal ? (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted">
              Escolha o que as pessoas com o link poderão fazer com seus gastos, despesas fixas e cartões.
              A regra vale para todos que entrarem pelo link.
            </p>
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Regra de compartilhamento</legend>
              {PERMISSION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                    selected === option.value ? 'border-primary bg-surface-2' : 'border-line hover:bg-surface-2/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="permission"
                    value={option.value}
                    checked={selected === option.value}
                    onChange={() => setSelected(option.value)}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-fg">{option.label}</span>
                    <span className="block text-sm text-muted">{option.description}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={closeModal} className="btn btn-ghost">Cancelar</button>
              <button type="button" onClick={handleSaveRules} disabled={isPending} className="btn btn-accent sm:min-w-[180px]">
                {isPending ? 'Salvando...' : enabled ? 'Salvar regras' : 'Gerar link'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted">
              Envie este link para quem deve acessar seus gastos. A pessoa precisará entrar com a conta Google
              e confirmar antes de ver os dados.
            </p>
            <ShareLinkField link={link} onCopy={copyLink} />
            <p className="text-sm text-muted">
              Regra: <span className="badge">{share && permissionLabel(share.permission)}</span>
            </p>
            <div className="flex justify-end">
              <button type="button" onClick={closeModal} className="btn btn-accent sm:min-w-[140px]">Concluir</button>
            </div>
          </div>
        )}
      </GastoModal>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-fg">Compartilhar meus gastos</h2>
          <p className="text-sm text-muted">
            Permita que outras pessoas vejam ou ajudem a controlar seus gastos, despesas fixas e cartões.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Compartilhamento de gastos"
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? 'bg-accent' : 'bg-surface-2 border border-line'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {enabled && share && (
        <div className="mt-5 flex flex-col gap-5 border-t border-line pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Regra atual: <span className="badge">{permissionLabel(share.permission)}</span>
            </p>
            <button type="button" onClick={openRulesModal} className="btn btn-ghost">Editar regras</button>
          </div>

          <div>
            <ShareLinkField link={link} onCopy={copyLink} />
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isPending}
              className="mt-2 text-sm text-muted hover:text-fg underline underline-offset-2 cursor-pointer disabled:opacity-50"
            >
              Gerar novo link
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-fg mb-3">
              Pessoas com acesso <span className="badge num ml-1">{share.members.length}</span>
            </h3>
            {share.members.length === 0 ? (
              <p className="text-sm text-muted">Ninguém entrou pelo link ainda.</p>
            ) : (
              <ul className="divide-y divide-line rounded-xl border border-line">
                {share.members.map(({ user, joinedAt }) => (
                  <li key={user.id} className="flex items-center gap-3 px-4 py-3">
                    <UserAvatar user={user} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-fg truncate">{displayName(user)}</p>
                      <p className="text-xs text-muted truncate">
                        {user.email ? `${user.email} · ` : ''}desde {joinedFormatter.format(new Date(joinedAt))}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(user.id, displayName(user))}
                      disabled={isPending}
                      className="btn btn-ghost text-danger"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!enabled && share && share.members.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          Compartilhamento desativado.{' '}
          {share.members.length === 1
            ? '1 pessoa voltará a ter acesso se você reativar.'
            : `${share.members.length} pessoas voltarão a ter acesso se você reativar.`}
        </p>
      )}
    </section>
  );
}

function ShareLinkField({ link, onCopy }: { link: string; onCopy: () => void }) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        readOnly
        value={link}
        aria-label="Link de compartilhamento"
        onFocus={(e) => e.currentTarget.select()}
        className="input num text-sm flex-1 min-w-0"
      />
      <button type="button" onClick={onCopy} disabled={!link} className="btn btn-primary shrink-0">
        Copiar
      </button>
    </div>
  );
}

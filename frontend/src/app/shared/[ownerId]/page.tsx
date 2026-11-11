import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import CardManager from '@/components/CardManager';
import DashboardClient from '@/components/DashboardClient';
import DespesaFixaManager from '@/components/DespesaFixaManager';
import UserAvatar from '@/components/UserAvatar';
import { getCurrentSession } from '@/lib/backend';
import { capabilities, displayName, permissionLabel } from '@/lib/share';
import { getSharedSpace } from '@/actions/share';
import { getUserGastos } from '@/actions/gasto';
import { getUserCards } from '@/actions/card';
import { getUserDespesasFixas } from '@/actions/despesaFixa';

/** Visão geral dos gastos de outro usuário, acessada por um convidado. */
export default async function SharedDashboardPage({ params }: { params: Promise<{ ownerId: string }> }) {
  const { ownerId } = await params;
  const session = await getCurrentSession();

  if (!session) {
    redirect('/');
  }

  // Chamadas independentes ao backend: em paralelo. Todas verificam o acesso do convidado no servidor.
  const [space, gastosData, cardsData, despesasFixasData] = await Promise.all([
    getSharedSpace(ownerId),
    getUserGastos(ownerId),
    getUserCards(ownerId),
    getUserDespesasFixas(ownerId),
  ]);

  if (!space.success || !space.data) {
    return (
      <div className="min-h-screen bg-bg">
        <AppHeader active="shared" user={session.user} />
        <main className="max-w-xl mx-auto w-full px-4 sm:px-6 py-10">
          <section className="card p-6 text-center">
            <h1 className="text-lg font-semibold text-fg">
              {space.status === 404 ? 'Compartilhamento indisponível' : 'Não foi possível carregar o compartilhamento'}
            </h1>
            <p className="text-sm text-muted mt-2">
              {space.status === 404
                ? 'Você não tem mais acesso a estes gastos: o compartilhamento foi desativado ou seu acesso foi removido.'
                : 'Tente recarregar a página em alguns instantes.'}
            </p>
            <Link href="/profile" className="btn btn-accent mt-5 inline-flex">Voltar ao perfil</Link>
          </section>
        </main>
      </div>
    );
  }

  const { owner, permission } = space.data;
  const { canManageCardsAndFixed } = capabilities(permission);
  const gastos = gastosData.success ? gastosData.data : [];
  const cards = cardsData.success ? cardsData.data : [];
  const despesasFixas = despesasFixasData.success ? despesasFixasData.data : [];

  const failed = [
    !gastosData.success && 'gastos',
    !cardsData.success && 'cartões',
    !despesasFixasData.success && 'despesas fixas',
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader active="shared" user={session.user} />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        <section className="card p-4 sm:p-5 flex flex-wrap items-center gap-3">
          <UserAvatar user={owner} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">Você está vendo os gastos de</p>
            <p className="text-base font-semibold text-fg truncate">{displayName(owner)}</p>
          </div>
          <span className="badge">{permissionLabel(permission)}</span>
          <Link href="/profile" className="btn btn-ghost">Voltar ao perfil</Link>
        </section>

        {failed.length > 0 && (
          <div role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            Não foi possível carregar {failed.join(', ')}. Os valores abaixo podem estar incompletos — tente recarregar a página.
          </div>
        )}

        <DashboardClient
          gastos={gastos}
          cards={cards}
          despesasFixas={despesasFixas}
          ownerId={ownerId}
          permission={permission}
          title={`Visão geral de ${displayName(owner)}`}
        />

        {canManageCardsAndFixed && (
          <div className="flex flex-col gap-6">
            <CardManager initialCards={cards} ownerId={ownerId} />
            <DespesaFixaManager initialDespesas={despesasFixas} ownerId={ownerId} />
          </div>
        )}
      </main>
    </div>
  );
}

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getMonthlyExpenseSummary } from '@/actions/gasto';
import { getUserCards } from '@/actions/card';
import ProfileMonthlyHistory from '@/components/ProfileMonthlyHistory';
import AppHeader from '@/components/AppHeader';
import CardManager from '@/components/CardManager';
import { getUserDespesasFixas } from '@/actions/despesaFixa';
import DespesaFixaManager from '@/components/DespesaFixaManager';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  const historyData = await getMonthlyExpenseSummary();
  const history = historyData.success ? historyData.data : [];

  const cardsData = await getUserCards();
  const userCards = cardsData.success ? cardsData.data : [];

  const despesasFixasData = await getUserDespesasFixas();
  const despesasFixas = despesasFixasData.success ? despesasFixasData.data : [];

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader active="profile" user={session.user} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">

        {/* User Profile Info */}
        <section className="card p-5 sm:p-6 flex items-center gap-4">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt="Avatar"
              className="w-16 h-16 rounded-full border border-line object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center">
              <span className="text-primary font-semibold text-2xl">
                {session.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-fg truncate">
              {session.user?.name}
            </h1>
            <p className="text-sm text-muted truncate">
              {session.user?.email}
            </p>
            <span className="badge mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Conta ativa
            </span>
          </div>
        </section>

        {/* Card Management Section */}
        <CardManager initialCards={userCards} />

        {/* Fixed Expenses Management Section */}
        <DespesaFixaManager initialDespesas={despesasFixas} />

        {/* Monthly History Section */}
        <section className="card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-fg">Histórico mensal</h2>
            <p className="text-sm text-muted">
              Selecione um mês para ver o detalhamento das despesas.
            </p>
          </div>

          <ProfileMonthlyHistory history={history} />
        </section>
      </main>
    </div>
  );
}

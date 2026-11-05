import DashboardClient from '@/components/DashboardClient';
import AppHeader from '@/components/AppHeader';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/backend';
import { getUserGastos } from '@/actions/gasto';
import { getUserCards } from '@/actions/card';
import { getUserDespesasFixas } from '@/actions/despesaFixa';

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/');
  }

  // Chamadas independentes ao backend: em paralelo, não em sequência.
  const [gastosData, cardsData, despesasFixasData] = await Promise.all([
    getUserGastos(),
    getUserCards(),
    getUserDespesasFixas(),
  ]);
  const gastos = gastosData.success ? gastosData.data : [];
  const cards = cardsData.success ? cardsData.data : [];
  const despesasFixas = despesasFixasData.success ? despesasFixasData.data : [];

  // Sem isso, uma falha no backend aparece como um dashboard vazio, indistinguível de "sem gastos".
  const failed = [
    !gastosData.success && 'gastos',
    !cardsData.success && 'cartões',
    !despesasFixasData.success && 'despesas fixas',
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader active="dashboard" user={session.user} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {failed.length > 0 && (
          <div role="alert" className="mb-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            Não foi possível carregar {failed.join(', ')}. Os valores abaixo podem estar incompletos — tente recarregar a página.
          </div>
        )}
        <DashboardClient gastos={gastos} cards={cards} despesasFixas={despesasFixas} />
      </main>
    </div>
  );
}

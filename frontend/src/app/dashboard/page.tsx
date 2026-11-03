import DashboardClient from '@/components/DashboardClient';
import AppHeader from '@/components/AppHeader';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserGastos } from '@/actions/gasto';
import { getUserCards } from '@/actions/card';
import { getUserDespesasFixas } from '@/actions/despesaFixa';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  const gastosData = await getUserGastos();
  const gastos = gastosData.success ? gastosData.data : [];

  const cardsData = await getUserCards();
  const cards = cardsData.success ? cardsData.data : [];

  const despesasFixasData = await getUserDespesasFixas();
  const despesasFixas = despesasFixasData.success ? despesasFixasData.data : [];

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader active="dashboard" user={session.user} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <DashboardClient gastos={gastos} cards={cards} despesasFixas={despesasFixas} />
      </main>
    </div>
  );
}

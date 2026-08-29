import DashboardClient from '@/components/DashboardClient';
import LogoutButton from '@/components/LogoutButton';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserGastos } from '@/actions/gasto';
import { getUserCards } from '@/actions/card';
import { getUserDespesasFixas } from '@/actions/despesaFixa';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

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
    <div className="min-h-screen landing-gradient transition-colors duration-300">
      
      {/* Header Navbar */}
      <header className="clay-header w-full px-6 py-4 bg-white/50 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
        <Link href="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-[#7C5CFC]/30 clay-icon"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F0EDFF] to-[#E6E0FF] flex items-center justify-center clay-icon">
              <span className="text-[#7C5CFC] font-bold">
                {session.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-clay-primary leading-tight">
              {session.user?.name}
            </span>
            <span className="text-xs text-[#7C5CFC] font-medium hover:underline">
              Ver Perfil
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center p-6 mt-4 sm:mt-8 gap-8 max-w-6xl mx-auto w-full">
        <DashboardClient gastos={gastos} cards={cards} despesasFixas={despesasFixas} />
      </main>
    </div>
  );
}

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getMonthlyExpenseSummary } from '@/actions/gasto';
import { getUserCards } from '@/actions/card';
import ProfileMonthlyHistory from '@/components/ProfileMonthlyHistory';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import ThemeToggle from '@/components/ThemeToggle';
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
    <div className="min-h-screen landing-gradient transition-colors duration-300">
      
      {/* Header Navbar */}
      <header className="clay-header w-full px-6 py-4 bg-white/50 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-[#7C5CFC] font-semibold hover:opacity-80 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Voltar ao Dashboard
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center p-6 mt-4 sm:mt-10 gap-8 max-w-4xl mx-auto w-full">
        
        {/* User Profile Info Card */}
        <div className="w-full clay-card-static bg-gradient-to-br from-[#F0EDFF]/80 to-[#E8E0FF]/60 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 transition-colors duration-300">
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Avatar" 
              className="w-32 h-32 rounded-full border-4 border-[#7C5CFC]/20 clay-icon object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F0EDFF] to-[#E6E0FF] flex items-center justify-center clay-icon">
              <span className="text-[#7C5CFC] font-extrabold text-5xl">
                {session.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          
          <div className="flex flex-col text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#7C5CFC] to-[#FF7EB3] bg-clip-text text-transparent mb-1">
              {session.user?.name}
            </h1>
            <p className="text-clay-secondary font-medium text-lg mb-4">
              {session.user?.email}
            </p>
            <div className="inline-flex items-center gap-2 bg-[#F0EDFF] clay-badge text-[#7C5CFC] px-4 py-2 font-semibold text-sm self-center sm:self-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Conta Ativa
            </div>
          </div>
        </div>

        {/* Card Management Section */}
        <CardManager initialCards={userCards} />

        {/* Fixed Expenses Management Section */}
        <DespesaFixaManager initialDespesas={despesasFixas} />

        {/* Monthly History Section */}
        <div className="w-full clay-card-static bg-gradient-to-br from-[#F0EDFF]/80 to-[#E8E0FF]/60 p-8 sm:p-10 transition-colors duration-300">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-clay-primary mb-2 flex items-center gap-3">
              <div className="clay-icon w-10 h-10 bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              Histórico de Gastos Mensais
            </h2>
            <p className="text-clay-secondary font-medium">
              Selecione um mês para visualizar o detalhamento das despesas.
            </p>
          </div>

          <ProfileMonthlyHistory history={history} />
        </div>
      </main>
    </div>
  );
}

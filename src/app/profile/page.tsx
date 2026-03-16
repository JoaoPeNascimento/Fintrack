import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getMonthlyExpenseSummary } from '@/actions/gasto';
import ProfileMonthlyHistory from '@/components/ProfileMonthlyHistory';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  const historyData = await getMonthlyExpenseSummary();
  const history = historyData.success ? historyData.data : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      
      {/* Header Navbar */}
      <header className="w-full px-6 py-4 bg-white/60 backdrop-blur-md border-b border-white/50 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Voltar ao Dashboard
        </Link>
        
        <LogoutButton />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center p-6 mt-4 sm:mt-10 gap-8 max-w-4xl mx-auto w-full">
        
        {/* User Profile Info Card */}
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8">
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Avatar" 
              className="w-32 h-32 rounded-full border-4 border-indigo-100 shadow-md object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-200 shadow-md">
              <span className="text-indigo-600 font-extrabold text-5xl">
                {session.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          
          <div className="flex flex-col text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-1">
              {session.user?.name}
            </h1>
            <p className="text-gray-500 font-medium text-lg mb-4">
              {session.user?.email}
            </p>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm self-center sm:self-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Conta Ativa
            </div>
          </div>
        </div>

        {/* Monthly History Section */}
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Histórico de Gastos Mensais
            </h2>
            <p className="text-gray-500 font-medium">
              Selecione um mês para visualizar o detalhamento das despesas.
            </p>
          </div>

          <ProfileMonthlyHistory history={history} />
        </div>
      </main>
    </div>
  );
}

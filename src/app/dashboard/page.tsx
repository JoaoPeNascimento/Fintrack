import DashboardClient from '@/components/DashboardClient';
import LogoutButton from '@/components/LogoutButton';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserGastos } from '@/actions/gasto';
import { getUserCards } from '@/actions/card';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      
      {/* Header Navbar */}
      <header className="w-full px-6 py-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-white/50 dark:border-gray-800/50 shadow-sm flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
        <Link href="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-indigo-200 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200">
              <span className="text-indigo-600 font-bold">
                {session.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">
              {session.user?.name}
            </span>
            <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium hover:underline">
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
        <DashboardClient gastos={gastos} cards={cards} />
      </main>
    </div>
  );
}

import GastoForm from '@/components/GastoForm';
import LogoutButton from '@/components/LogoutButton';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      
      {/* Header Navbar */}
      <header className="w-full px-6 py-4 bg-white/60 backdrop-blur-md border-b border-white/50 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
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
            <span className="text-sm font-bold text-gray-800 leading-tight">
              {session.user?.name}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Minha Conta
            </span>
          </div>
        </div>
        
        <LogoutButton />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center p-6 mt-4 sm:mt-10">
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
          Adicionar Gasto
        </h1>
        <p className="text-gray-500 mb-8 font-medium">
          Registre uma nova despesa no seu gerenciador financeiro.
        </p>

        <GastoForm />
        </div>
      </main>
    </div>
  );
}

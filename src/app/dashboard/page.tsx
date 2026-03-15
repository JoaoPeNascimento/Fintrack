import GastoForm from '@/components/GastoForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8 sm:p-10">
        
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {session.user?.name}
          </span>
          {session.user?.image && (
            <img 
              src={session.user.image} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-indigo-200"
            />
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 mt-8 sm:mt-0">
          Adicionar Gasto
        </h1>
        <p className="text-gray-500 mb-8 font-medium">
          Registre uma nova despesa no seu gerenciador financeiro.
        </p>

        <GastoForm />
      </div>
    </div>
  );
}

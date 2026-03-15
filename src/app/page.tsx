import GastoForm from '@/components/GastoForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8 sm:p-10">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
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

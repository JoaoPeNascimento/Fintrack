'use client';

import { useMemo, memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type Gasto = {
  _id: string;
  name: string;
  value: number;
  date: string | null;
  payment_method: string;
};

type DespesaFixa = {
  _id: string;
  name: string;
  value: number;
};

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const DashboardCharts = ({ gastos, despesasFixas }: { gastos: Gasto[], despesasFixas: DespesaFixa[] }) => {
  
  const pieData = useMemo(() => {
    const expensesByMethod = gastos.reduce((acc, gasto) => {
      let method = gasto.payment_method;
      if (method.startsWith('CARD_')) method = 'Cartão';
      else if (method === 'PIX') method = 'Pix';
      else if (method === 'DINHEIRO') method = 'Dinheiro';
      
      acc[method] = (acc[method] || 0) + gasto.value;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(expensesByMethod).map(key => ({
      name: key,
      value: expensesByMethod[key]
    }));
  }, [gastos]);

  const barData = useMemo(() => {
    const totalGastos = gastos.reduce((acc, g) => acc + g.value, 0);
    const totalFixas = despesasFixas.reduce((acc, d) => acc + d.value, 0);

    return [
      { name: 'Fixas', valor: totalFixas, fill: '#ef4444' }, // Red-ish for fixed
      { name: 'Variáveis', valor: totalGastos, fill: '#6366f1' }, // Indigo for variable
    ];
  }, [gastos, despesasFixas]);

  const formatCurrency = (value: number) => {
    return currencyFormatter.format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Gráfico Tipo de Pagamento */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 p-6 flex flex-col justify-center items-center transition-colors duration-300">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 w-full text-left">
          Despesas Variáveis por Tipo
        </h3>
        {pieData.length > 0 ? (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Sem dados para exibir</div>
        )}
      </div>

      {/* Gráfico Fixas vs Variáveis */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 p-6 flex flex-col justify-center items-center transition-colors duration-300">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 w-full text-left">
          Fixas vs Variáveis
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
              <YAxis 
                tick={{fill: '#6b7280'}} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `R$${val}`}
                width={80}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                formatter={(value: any) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                 {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default memo(DashboardCharts);

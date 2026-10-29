'use client';

import { useMemo, memo, useEffect, useState } from 'react';
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

// Recharts writes colors as SVG attributes, so the palette mirrors the CSS tokens in globals.css
const PALETTE = {
  light: { series: ['#1E3A8A', '#0891B2', '#64748B', '#3B82F6'], fixed: '#1E3A8A', variable: '#0891B2', grid: '#E2E8F0', tick: '#64748B', surface: '#FFFFFF', fg: '#0F172A' },
  dark: { series: ['#60A5FA', '#22D3EE', '#94A3B8', '#818CF8'], fixed: '#60A5FA', variable: '#22D3EE', grid: '#1F2937', tick: '#94A3B8', surface: '#111827', fg: '#E5E7EB' },
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const compactFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

const DashboardCharts = ({ gastos, despesasFixas }: { gastos: Gasto[], despesasFixas: DespesaFixa[] }) => {
  const isDark = useIsDark();
  const colors = isDark ? PALETTE.dark : PALETTE.light;

  const pieData = useMemo(() => {
    const expensesByMethod = gastos.reduce((acc, gasto) => {
      let method = gasto.payment_method;
      if (method.startsWith('CARD_') || method === 'CARTAO') method = 'Cartão';
      else if (method === 'PIX') method = 'Pix';
      else if (method === 'DINHEIRO') method = 'Dinheiro';

      acc[method] = (acc[method] || 0) + gasto.value;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(expensesByMethod)
      .map(key => ({ name: key, value: expensesByMethod[key] }))
      .sort((a, b) => b.value - a.value);
  }, [gastos]);

  const totalVariable = useMemo(() => pieData.reduce((acc, d) => acc + d.value, 0), [pieData]);

  const barData = useMemo(() => {
    const totalGastos = gastos.reduce((acc, g) => acc + g.value, 0);
    const totalFixas = despesasFixas.reduce((acc, d) => acc + d.value, 0);

    return [
      { name: 'Fixas', valor: totalFixas, fill: colors.fixed },
      { name: 'Variáveis', valor: totalGastos, fill: colors.variable },
    ];
  }, [gastos, despesasFixas, colors]);

  const formatCurrency = (value: number) => {
    return currencyFormatter.format(value);
  };

  const tooltipStyle = {
    borderRadius: '8px',
    border: `1px solid ${colors.grid}`,
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
    background: colors.surface,
    color: colors.fg,
    fontSize: '13px',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Gráfico Tipo de Pagamento */}
      <section className="card p-5 sm:p-6 flex flex-col">
        <h3 className="text-base font-semibold text-fg">Gastos variáveis por pagamento</h3>
        <p className="text-sm text-muted mb-4">Como você pagou neste mês.</p>
        {pieData.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
            <div className="relative w-48 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke={colors.surface}
                    strokeWidth={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors.series[index % colors.series.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: colors.fg }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted">Total</span>
                <span className="num text-sm font-semibold text-fg">{compactFormatter.format(totalVariable)}</span>
              </div>
            </div>
            <ul className="w-full space-y-3">
              {pieData.map((entry, index) => (
                <li key={entry.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-fg">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colors.series[index % colors.series.length] }} />
                    {entry.name}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="num font-semibold text-fg">{formatCurrency(entry.value)}</span>
                    <span className="num text-xs text-muted w-10 text-right">
                      {totalVariable > 0 ? `${((entry.value / totalVariable) * 100).toFixed(0)}%` : '0%'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex-1 min-h-48 flex items-center justify-center text-sm text-muted">Sem gastos variáveis neste mês.</div>
        )}
      </section>

      {/* Gráfico Fixas vs Variáveis */}
      <section className="card p-5 sm:p-6 flex flex-col">
        <h3 className="text-base font-semibold text-fg">Fixas vs. variáveis</h3>
        <p className="text-sm text-muted mb-4">Comparativo do mês.</p>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={colors.grid} />
              <XAxis dataKey="name" tick={{ fill: colors.tick, fontSize: 13 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: colors.tick, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => compactFormatter.format(Number(val))}
                width={72}
              />
              <Tooltip
                cursor={{ fill: colors.grid, opacity: 0.4 }}
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={tooltipStyle}
                itemStyle={{ color: colors.fg }}
              />
              <Bar dataKey="valor" name="Valor" radius={[4, 4, 0, 0]} maxBarSize={72}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default memo(DashboardCharts);

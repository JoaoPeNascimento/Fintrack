'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

// ─── Scroll Reveal Hook ──────────────────────────────────────────────
// `ready` precisa refletir quando o conteúdo está montado: na primeira renderização
// a página mostra só o spinner (sessão carregando) e o ref ainda é nulo.
function useScrollReveal(ready: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!ready || !el) return;

    const targets = el.querySelectorAll('.scroll-reveal');
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((t) => t.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [ready]);

  return ref;
}

// ─── Icons ───────────────────────────────────────────────────────────
const ICONS = {
  receipt: 'M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .67V2l-1 .67L16 2l-3 2-3-2-3 2-3-2zM8 8h8M8 12h8M8 16h5',
  card: 'M2 5h20v14H2zM2 10h20M6 15h4',
  repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 01-3 3H3',
  chart: 'M3 3v18h18M7 15l4-4 3 3 5-6',
  calendar: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  moon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 018 0v4',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  check: 'M20 6L9 17l-5-5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  layers: 'M12 2l10 5-10 5L2 7l10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
} as const;

function StrokeIcon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GoogleButton({ onClick, label, variant = 'primary' }: { onClick: () => void; label: string; variant?: 'primary' | 'accent' }) {
  return (
    <button onClick={onClick} className={`btn btn-${variant} h-12 px-6 text-base`}>
      <span className="bg-white rounded-sm p-0.5 flex">
        <GoogleIcon className="w-4 h-4" />
      </span>
      {label}
    </button>
  );
}

// ─── Section primitives ──────────────────────────────────────────────
function SectionHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="scroll-reveal text-center max-w-2xl mx-auto mb-12">
      <p className="eyebrow text-primary mb-3">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-fg tracking-tight mb-3">{title}</h2>
      {children && <p className="text-muted text-base sm:text-lg leading-relaxed">{children}</p>}
    </div>
  );
}

function IconBadge({ icon, tone = 'primary' }: { icon: string; tone?: 'primary' | 'accent' | 'variable' }) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    variable: 'bg-variable/10 text-variable',
  };
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
      <StrokeIcon d={icon} />
    </div>
  );
}

// ─── Mockups ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const rows = [
    { name: 'Supermercado', method: 'Cartão', value: 'R$ 320,00' },
    { name: 'Combustível', method: 'Pix', value: 'R$ 210,00' },
    { name: 'Notebook', method: '10x', value: 'R$ 450,00' },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto" aria-hidden="true">
      <div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
      <div className="card relative shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Visão geral · Outubro</span>
          <span className="badge">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Atualizado
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted">Total gasto no mês</p>
          <p className="num text-3xl font-semibold text-fg tracking-tight mt-1">R$ 2.130,00</p>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2 mt-4">
            <div className="bg-fixed" style={{ width: '42%' }} />
            <div className="bg-variable" style={{ width: '58%' }} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-muted"><span className="w-2 h-2 rounded-sm bg-fixed" />Fixas · 42%</p>
              <p className="num text-sm font-semibold text-fg mt-0.5">R$ 890,00</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-muted"><span className="w-2 h-2 rounded-sm bg-variable" />Variáveis · 58%</p>
              <p className="num text-sm font-semibold text-fg mt-0.5">R$ 1.240,00</p>
            </div>
          </div>
        </div>
        <ul className="border-t border-line divide-y divide-line">
          {rows.map((row) => (
            <li key={row.name} className="flex items-center justify-between px-5 py-2.5">
              <span className="flex items-center gap-2">
                <span className="text-sm text-fg">{row.name}</span>
                <span className="badge num">{row.method}</span>
              </span>
              <span className="num text-sm font-semibold text-fg">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating chip */}
      <div className="card absolute -bottom-5 -left-3 sm:-left-8 px-4 py-3 shadow-lg shadow-slate-900/10 hidden sm:flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <StrokeIcon d={ICONS.check} className="w-4 h-4" />
        </span>
        <span>
          <span className="block text-xs text-muted">Gasto registrado</span>
          <span className="num block text-sm font-semibold text-fg">Farmácia · R$ 64,90</span>
        </span>
      </div>
    </div>
  );
}

function InstallmentMockup() {
  const current = 2;
  const total = 10;
  return (
    <div className="card p-6 w-full max-w-md shadow-xl shadow-slate-900/5" aria-hidden="true">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-fg">Notebook</p>
          <p className="text-xs text-muted mt-0.5">Cartão Azul · compra em agosto</p>
        </div>
        <span className="badge num">{total}x</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-5">
        <div className="rounded-lg bg-surface-2 p-3">
          <p className="text-xs text-muted">Valor total</p>
          <p className="num text-lg font-semibold text-fg">R$ 4.500,00</p>
        </div>
        <div className="rounded-lg bg-surface-2 p-3">
          <p className="text-xs text-muted">Por parcela</p>
          <p className="num text-lg font-semibold text-primary">R$ 450,00</p>
        </div>
      </div>
      <div className="flex gap-1 mt-5">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i === current ? 'bg-primary' : 'bg-primary/20'}`} />
        ))}
      </div>
      <p className="text-xs text-muted mt-2">Uma parcela por mês · aparece no painel até a última</p>
    </div>
  );
}

function CardsMockup() {
  return (
    <div className="relative w-full max-w-md h-60" aria-hidden="true">
      <div className="absolute right-0 top-0 w-72 h-44 rounded-2xl bg-variable p-5 text-white shadow-xl rotate-3 opacity-90">
        <p className="text-sm font-semibold">Cartão Ciano</p>
      </div>
      <div className="absolute left-0 bottom-0 w-80 h-48 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] p-5 text-white shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Cartão Azul</p>
          <StrokeIcon d={ICONS.card} className="w-5 h-5 opacity-80" />
        </div>
        <div>
          <p className="text-xs text-white/70">Limite</p>
          <p className="num text-xl font-semibold">R$ 6.000,00</p>
        </div>
        <div className="flex gap-6 text-xs">
          <span><span className="text-white/70">Fecha</span> <span className="num font-semibold">dia 3</span></span>
          <span><span className="text-white/70">Vence</span> <span className="num font-semibold">dia 10</span></span>
        </div>
      </div>
    </div>
  );
}

function HistoryMockup() {
  const months = [
    { m: 'Mai', fixed: 50, variable: 30 },
    { m: 'Jun', fixed: 50, variable: 42 },
    { m: 'Jul', fixed: 52, variable: 25 },
    { m: 'Ago', fixed: 52, variable: 48 },
    { m: 'Set', fixed: 55, variable: 35 },
    { m: 'Out', fixed: 55, variable: 40 },
  ];
  return (
    <div className="card p-6 w-full max-w-md shadow-xl shadow-slate-900/5" aria-hidden="true">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-fg">Histórico mensal</p>
        <span className="flex gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-fixed" />Fixas</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-variable" />Variáveis</span>
        </span>
      </div>
      <div className="flex items-end justify-between gap-3 h-40 mt-6">
        {months.map(({ m, fixed, variable }) => (
          <div key={m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div className="w-full max-w-8 flex flex-col-reverse rounded-md overflow-hidden" style={{ height: `${fixed + variable}%` }}>
              <div className="bg-fixed" style={{ height: `${(fixed / (fixed + variable)) * 100}%` }} />
              <div className="bg-variable flex-1" />
            </div>
            <span className="text-xs text-muted">{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Content blocks ──────────────────────────────────────────────────
function FeatureCard({ icon, title, tone, children, className = '' }: { icon: string; title: string; tone?: 'primary' | 'accent' | 'variable'; children: ReactNode; className?: string }) {
  return (
    <div className={`card p-6 flex flex-col gap-4 transition-colors hover:border-primary/40 ${className}`}>
      <IconBadge icon={icon} tone={tone} />
      <div>
        <h3 className="text-base font-semibold text-fg">{title}</h3>
        <p className="text-sm text-muted leading-relaxed mt-1">{children}</p>
      </div>
    </div>
  );
}

function Showcase({ eyebrow, title, points, visual, reverse }: { eyebrow: string; title: string; points: string[]; visual: ReactNode; reverse?: boolean }) {
  return (
    <div className="scroll-reveal grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className={reverse ? 'lg:order-2' : ''}>
        <p className="eyebrow text-primary mb-3">{eyebrow}</p>
        <h3 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight mb-5">{title}</h3>
        <ul className="space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-muted">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <StrokeIcon d={ICONS.check} className="w-3 h-3" />
              </span>
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`flex justify-center ${reverse ? 'lg:order-1 lg:justify-start' : 'lg:justify-end'}`}>{visual}</div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="relative card p-6">
      <span className="w-9 h-9 rounded-full bg-primary text-on-primary text-sm font-semibold flex items-center justify-center ring-4 ring-bg">
        {n}
      </span>
      <h3 className="text-base font-semibold text-fg mt-4">{title}</h3>
      <p className="text-sm text-muted leading-relaxed mt-1">{children}</p>
    </div>
  );
}

const CAPABILITIES: { icon: string; tone: 'primary' | 'accent' | 'variable'; area: string; where: string; items: string[] }[] = [
  {
    icon: ICONS.receipt,
    tone: 'primary',
    area: 'Gastos do dia a dia',
    where: 'Painel',
    items: [
      'Registrar um gasto com descrição, valor, data e forma de pagamento',
      'Pagar com Pix, dinheiro ou um dos seus cartões de crédito',
      'Adicionar uma observação opcional com mais detalhes',
      'Ver os detalhes de qualquer lançamento',
      'Editar ou excluir um gasto lançado errado',
    ],
  },
  {
    icon: ICONS.layers,
    tone: 'variable',
    area: 'Compras parceladas',
    where: 'Painel',
    items: [
      'Lançar uma compra no cartão em várias parcelas',
      'Ter o valor total dividido automaticamente por parcela',
      'Ver a parcela no painel de cada mês até a última',
      'Ver o número de parcelas de cada lançamento',
    ],
  },
  {
    icon: ICONS.card,
    tone: 'accent',
    area: 'Cartões de crédito',
    where: 'Painel',
    items: [
      'Cadastrar quantos cartões quiser',
      'Definir limite, dia de fechamento e dia de vencimento',
      'Escolher uma cor para reconhecer cada cartão',
      'Editar ou remover cartões a qualquer momento',
    ],
  },
  {
    icon: ICONS.repeat,
    tone: 'primary',
    area: 'Despesas fixas',
    where: 'Painel',
    items: [
      'Cadastrar contas recorrentes como aluguel, internet e assinaturas',
      'Ver o total comprometido com fixas todo mês',
      'Atualizar o valor quando a conta mudar',
      'Excluir uma despesa que deixou de existir',
    ],
  },
  {
    icon: ICONS.chart,
    tone: 'variable',
    area: 'Visão geral do mês',
    where: 'Painel',
    items: [
      'Ver o total gasto no mês corrente',
      'Comparar fixas e variáveis em um gráfico de barras',
      'Ver os gastos variáveis por forma de pagamento',
      'Conferir a lista de lançamentos ativos do mês',
    ],
  },
  {
    icon: ICONS.calendar,
    tone: 'accent',
    area: 'Histórico',
    where: 'Perfil',
    items: [
      'Consultar o resumo de cada mês anterior',
      'Abrir os lançamentos de um mês específico',
      'Comparar a evolução dos gastos ao longo do tempo',
      'Ver o total de fixas e variáveis de cada mês',
    ],
  },
];

function CapabilityCard({ icon, tone, area, where, items }: (typeof CAPABILITIES)[number]) {
  return (
    <div className="card p-6 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <IconBadge icon={icon} tone={tone} />
          <h3 className="text-base font-semibold text-fg">{area}</h3>
        </div>
        <span className="badge shrink-0">{where}</span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted leading-relaxed">
            <StrokeIcon d={ICONS.check} className="w-4 h-4 mt-0.5 text-accent shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FAQ = [
  {
    q: 'O Fintrack é gratuito?',
    a: 'Sim. Não há mensalidade, plano pago ou anúncios. Basta entrar com sua conta Google para começar.',
  },
  {
    q: 'Preciso conectar minha conta bancária?',
    a: 'Não. Você registra os gastos manualmente, em poucos segundos. O Fintrack não pede acesso a bancos, senhas ou cartões reais.',
  },
  {
    q: 'Como funcionam as compras parceladas?',
    a: 'Ao registrar uma compra no cartão, informe o valor total e o número de parcelas. O Fintrack divide o valor e mantém a parcela no painel de cada mês até a última ser paga.',
  },
  {
    q: 'Qual a diferença entre despesas fixas e variáveis?',
    a: 'Fixas são contas recorrentes, como aluguel e internet, cadastradas uma única vez. Variáveis são os gastos do dia a dia. O painel mostra quanto cada grupo representa no mês.',
  },
  {
    q: 'Outras pessoas podem ver meus dados?',
    a: 'Não. Toda leitura e escrita é restrita ao usuário autenticado: cada conta enxerga apenas os próprios gastos, cartões e despesas.',
  },
];

// ─── Main Landing Page ───────────────────────────────────────────────
export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();
  const pageRef = useScrollReveal(status !== 'loading');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleLogin = useCallback(() => {
    signIn('google', { callbackUrl: '/dashboard' });
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-line border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const navLinks = [
    { href: '#recursos', label: 'Recursos' },
    { href: '#funcionalidades', label: 'Funcionalidades' },
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#seguranca', label: 'Segurança' },
    { href: '#faq', label: 'Dúvidas' },
  ];

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden" ref={pageRef}>

      {/* ───── Navbar ───── */}
      <nav className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          <a href="#" aria-label="Fintrack, início"><Logo /></a>
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="px-3 py-2 rounded-md text-sm font-medium text-muted hover:text-fg hover:bg-surface-2 transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={handleLogin} className="btn btn-primary">
              Entrar
            </button>
          </div>
        </div>
      </nav>

      {/* ───── Hero ───── */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-primary/[0.07] to-transparent pointer-events-none" aria-hidden="true" />
        <div
          className="absolute inset-x-0 top-0 h-[560px] pointer-events-none opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent)]"
          style={{ backgroundImage: 'radial-gradient(var(--line) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Gratuito · Login com Google
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-fg leading-[1.08] tracking-tight mb-5">
              Controle seus <span className="text-primary">gastos</span> com clareza e sem planilhas
            </h1>

            <p className="text-muted text-lg max-w-lg leading-relaxed mb-8">
              Registre despesas fixas, gastos do dia a dia e compras parceladas no cartão. Veja, a qualquer momento, quanto já saiu no mês e para onde foi.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <GoogleButton onClick={handleLogin} label="Entrar com Google" />
              <a href="#recursos" className="btn btn-ghost h-12 px-6 text-base">
                Conhecer recursos
                <StrokeIcon d={ICONS.arrow} className="w-4 h-4" />
              </a>
            </div>

            <ul className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 mt-8 text-sm text-muted">
              {['Sem cartão de crédito', 'Sem anúncios', 'Modo escuro'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <StrokeIcon d={ICONS.check} className="w-4 h-4 text-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center lg:justify-end">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ───── Highlights strip ───── */}
      <section className="border-y border-line bg-surface">
        <dl className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { k: 'R$ 0', v: 'para usar, para sempre' },
            { k: '1 clique', v: 'para entrar com Google' },
            { k: '3 tipos', v: 'de gasto: fixo, à vista e parcelado' },
            { k: '100%', v: 'dos seus dados só para você' },
          ].map(({ k, v }) => (
            <div key={k} className="text-center md:text-left">
              <dt className="num text-2xl sm:text-3xl font-bold text-fg tracking-tight">{k}</dt>
              <dd className="text-sm text-muted mt-1">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ───── Recursos (bento) ───── */}
      <section id="recursos" className="px-4 sm:px-6 py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader eyebrow="Recursos" title="Tudo o que você precisa, nada que atrapalhe">
            O Fintrack reúne em um só lugar as peças que mais pesam no orçamento: contas recorrentes, cartões e o gasto do dia a dia.
          </SectionHeader>

          <div className="scroll-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={ICONS.receipt} title="Gastos variáveis" className="lg:col-span-2">
              Lance compras em Pix, dinheiro ou cartão de crédito com descrição, data e valor. O painel do mês se atualiza na hora, com o total e a lista dos últimos lançamentos.
            </FeatureCard>
            <FeatureCard icon={ICONS.repeat} title="Despesas fixas" tone="variable">
              Aluguel, internet, academia: cadastre uma vez e elas entram em todos os meses automaticamente.
            </FeatureCard>
            <FeatureCard icon={ICONS.card} title="Cartões de crédito" tone="accent">
              Registre limite, dia de fechamento, vencimento e uma cor para identificar cada cartão.
            </FeatureCard>
            <FeatureCard icon={ICONS.layers} title="Compras parceladas">
              Informe o total e o número de parcelas; o Fintrack divide o valor e acompanha mês a mês.
            </FeatureCard>
            <FeatureCard icon={ICONS.chart} title="Gráficos do mês" tone="variable">
              Veja os gastos por forma de pagamento e a proporção entre fixas e variáveis.
            </FeatureCard>
            <FeatureCard icon={ICONS.calendar} title="Histórico mensal" tone="accent" className="lg:col-span-2">
              Na página de perfil, consulte o resumo de cada mês e compare a evolução dos seus gastos ao longo do tempo para encontrar onde dá para economizar.
            </FeatureCard>
            <FeatureCard icon={ICONS.moon} title="Claro ou escuro">
              Interface responsiva, pensada para o celular e o computador, com tema claro e escuro.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* ───── Showcases ───── */}
      <section className="border-t border-line bg-surface/50 px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto space-y-24">
          <Showcase
            eyebrow="Parcelamento"
            title="Parcelas que se acompanham sozinhas"
            points={[
              'Informe o valor total e em quantas vezes foi a compra.',
              'O valor é dividido automaticamente entre as parcelas.',
              'A parcela aparece no painel de cada mês até a última ser paga.',
            ]}
            visual={<InstallmentMockup />}
          />
          <Showcase
            reverse
            eyebrow="Cartões"
            title="Todos os seus cartões, organizados"
            points={[
              'Cadastre quantos cartões quiser, com limite e cor próprios.',
              'Guarde os dias de fechamento e vencimento de cada um.',
              'Escolha o cartão na hora de lançar o gasto e saiba onde cada compra caiu.',
            ]}
            visual={<CardsMockup />}
          />
          <Showcase
            eyebrow="Histórico"
            title="Entenda seus hábitos mês a mês"
            points={[
              'Resumo mensal com o total de despesas fixas e variáveis.',
              'Compare meses e identifique os períodos de maior gasto.',
              'Consulte os lançamentos de qualquer mês anterior.',
            ]}
            visual={<HistoryMockup />}
          />
        </div>
      </section>

      {/* ───── O que você pode fazer ───── */}
      <section id="funcionalidades" className="border-t border-line px-4 sm:px-6 py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader eyebrow="Funcionalidades" title="O que você pode fazer no Fintrack">
            Um resumo de tudo o que está disponível hoje no painel e na página de perfil.
          </SectionHeader>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITIES.map((c) => (
              <CapabilityCard key={c.area} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* ───── Como funciona ───── */}
      <section id="como-funciona" className="border-t border-line px-4 sm:px-6 py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <SectionHeader eyebrow="Como funciona" title="Três passos para organizar suas finanças">
            Sem cadastro longo, sem fórmulas. Você registra, o Fintrack soma e organiza.
          </SectionHeader>

          <div className="scroll-reveal relative grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="hidden md:block absolute top-[2.6rem] left-[16%] right-[16%] h-px bg-line" aria-hidden="true" />
            <Step n={1} title="Acesse com sua conta Google">
              Login em um clique, sem formulários nem confirmação de e-mail.
            </Step>
            <Step n={2} title="Registre suas despesas">
              Cadastre contas fixas e cartões uma vez e lance os gastos do dia a dia em segundos.
            </Step>
            <Step n={3} title="Acompanhe o mês">
              Totais, gráficos e histórico mensal mostram para onde está indo o seu dinheiro.
            </Step>
          </div>
        </div>
      </section>

      {/* ───── Segurança ───── */}
      <section id="seguranca" className="border-t border-line bg-surface/50 px-4 sm:px-6 py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader eyebrow="Privacidade e segurança" title="Seus dados continuam sendo seus">
            Nada de senha nova para lembrar nem acesso ao seu banco. Você controla o que entra no Fintrack.
          </SectionHeader>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard icon={ICONS.user} title="Login pelo Google">
              A autenticação é feita pela sua conta Google. O Fintrack não cria nem armazena senhas.
            </FeatureCard>
            <FeatureCard icon={ICONS.lock} title="Acesso isolado por conta" tone="accent">
              Cada leitura e gravação é restrita ao usuário autenticado. Ninguém mais vê seus lançamentos.
            </FeatureCard>
            <FeatureCard icon={ICONS.shield} title="Sem conexão bancária" tone="variable">
              Os gastos são registrados por você. Não pedimos dados de conta, agência ou número de cartão.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section id="faq" className="border-t border-line px-4 sm:px-6 py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <SectionHeader eyebrow="Dúvidas frequentes" title="Perguntas comuns" />

          <div className="scroll-reveal card divide-y divide-line overflow-hidden">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none text-fg font-medium hover:bg-surface-2 transition-colors [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="w-6 h-6 rounded-full border border-line flex items-center justify-center text-muted shrink-0 transition-transform group-open:rotate-45">
                    <StrokeIcon d="M12 5v14M5 12h14" className="w-3.5 h-3.5" />
                  </span>
                </summary>
                <p className="px-6 pb-5 -mt-1 text-sm text-muted leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-24">
        <div className="scroll-reveal max-w-6xl mx-auto relative overflow-hidden rounded-2xl bg-primary px-6 py-14 sm:px-12 sm:py-16 text-center">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(var(--on-primary) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-on-primary tracking-tight">
              Comece a organizar seus gastos hoje
            </h2>
            <p className="text-on-primary/80 mt-3 mb-8 max-w-xl mx-auto text-lg">
              Leva menos de um minuto para registrar a primeira despesa. Gratuito, sem anúncios.
            </p>
            <GoogleButton onClick={handleLogin} label="Começar gratuitamente" variant="accent" />
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-line bg-surface px-4 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Logo size="sm" />
            <p className="text-muted text-sm max-w-xs text-center md:text-left">
              Gerenciador financeiro pessoal para gastos variáveis, cartões e despesas fixas.
            </p>
          </div>
          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-muted hover:text-fg transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-line text-center md:text-left">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} Fintrack. Suas finanças, organizadas.
          </p>
        </div>
      </footer>
    </div>
  );
}

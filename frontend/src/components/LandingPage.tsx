'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

// ─── Scroll Reveal Hook ──────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const children = el.querySelectorAll('.scroll-reveal');
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
}

// ─── Icons ───────────────────────────────────────────────────────────
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

function StrokeIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// ─── Dashboard Mockup ────────────────────────────────────────────────
function DashboardMockup() {
  const rows = [
    { name: 'Supermercado', method: 'Cartão', value: 'R$ 320,00' },
    { name: 'Combustível', method: 'Pix', value: 'R$ 210,00' },
    { name: 'Farmácia', method: 'Pix', value: 'R$ 64,90' },
  ];

  return (
    <div className="card w-full max-w-md mx-auto shadow-xl shadow-slate-900/5 overflow-hidden" aria-hidden="true">
      <div className="px-5 py-3 border-b border-line flex items-center justify-between">
        <span className="text-xs font-medium text-muted">Visão geral · Outubro</span>
        <span className="badge">Atualizado</span>
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
              <span className="badge">{row.method}</span>
            </span>
            <span className="num text-sm font-semibold text-fg">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="card p-6">
      <span className="w-8 h-8 rounded-full bg-primary text-on-primary text-sm font-semibold flex items-center justify-center">
        {n}
      </span>
      <h4 className="text-base font-semibold text-fg mt-4">{title}</h4>
      <p className="text-sm text-muted leading-relaxed mt-1">{children}</p>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="card p-6 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <StrokeIcon d={icon} />
      </div>
      <div>
        <h4 className="text-base font-semibold text-fg">{title}</h4>
        <p className="text-sm text-muted leading-relaxed mt-1">{children}</p>
      </div>
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────
export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();
  const saibaMaisRef = useScrollReveal();

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

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">

      {/* ───── Navbar ───── */}
      <nav className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={handleLogin} className="btn btn-ghost">
              Entrar
            </button>
          </div>
        </div>
      </nav>

      {/* ───── Hero Section ───── */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-primary/[0.06] to-transparent pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Gratuito · Login com Google
            </span>

            <h1 className="text-4xl sm:text-5xl font-bold text-fg leading-[1.1] tracking-tight mb-5">
              Controle seus <span className="text-primary">gastos</span> com clareza e sem planilhas
            </h1>

            <p className="text-muted text-lg max-w-lg leading-relaxed mb-8">
              Registre despesas fixas e variáveis em segundos e veja, a qualquer momento, quanto já saiu no mês e para onde foi.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button onClick={handleLogin} className="btn btn-primary h-12 px-6 text-base">
                <span className="bg-white rounded-sm p-0.5 flex">
                  <GoogleIcon className="w-4 h-4" />
                </span>
                Entrar com Google
              </button>

              <a href="#saiba-mais" className="btn btn-ghost h-12 px-6 text-base">
                Como funciona
              </a>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="flex justify-center lg:justify-end">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ───── Saiba Mais Section ───── */}
      <section id="saiba-mais" className="border-t border-line bg-surface/50 px-4 sm:px-6 py-16 sm:py-20" ref={saibaMaisRef}>
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center scroll-reveal">
            <p className="eyebrow text-primary mb-3">Como funciona</p>
            <h2 className="text-3xl font-bold text-fg tracking-tight mb-3">
              Três passos para organizar suas finanças
            </h2>
            <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
              Sem cadastro longo, sem fórmulas. Você registra, o Fintrack soma e organiza.
            </p>
          </div>

          {/* Block 1: Como Funciona */}
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step n={1} title="Acesse com sua conta Google">
              Login em um clique, sem formulários nem confirmações de e-mail.
            </Step>
            <Step n={2} title="Registre suas despesas">
              Cadastre contas fixas (aluguel, internet) uma vez e lance os gastos do dia a dia em segundos.
            </Step>
            <Step n={3} title="Acompanhe o mês">
              Totais, gráficos e histórico mensal mostram para onde está indo o seu dinheiro.
            </Step>
          </div>

          {/* Block 2: Por que Utilizar */}
          <div className="scroll-reveal space-y-6">
            <h3 className="text-xl font-semibold text-fg text-center sm:text-left">Por que usar o Fintrack</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Feature icon="M9 17v-6m4 6V7m4 10v-3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" title="Simples, sem planilhas">
                Uma interface objetiva, focada no essencial: quanto você gastou e onde.
              </Feature>
              <Feature icon="M3 12h4l3-9 4 18 3-9h4" title="Fixas e variáveis separadas">
                Entenda quanto da sua renda já está comprometida com contas recorrentes e quanto ainda sobra.
              </Feature>
              <Feature icon="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" title="Gratuito e seguro">
                Autenticação pelo Google. Sem mensalidades, anúncios ou custos ocultos.
              </Feature>
              <Feature icon="M1 4h22v16H1zM1 10h22" title="Cartões e parcelas">
                Cadastre seus cartões com fechamento e vencimento e acompanhe compras parceladas.
              </Feature>
            </div>
          </div>

          {/* Call to Action */}
          <div className="scroll-reveal card p-8 sm:p-10 text-center">
            <h3 className="text-2xl font-semibold text-fg tracking-tight">Comece a organizar seus gastos hoje</h3>
            <p className="text-muted mt-2 mb-6">Leva menos de um minuto para registrar a primeira despesa.</p>
            <button onClick={handleLogin} className="btn btn-accent h-12 px-6 text-base">
              <span className="bg-white rounded-sm p-0.5 flex">
                <GoogleIcon className="w-4 h-4" />
              </span>
              Começar gratuitamente
            </button>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-line px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} Fintrack. Suas finanças, organizadas.
          </p>
        </div>
      </footer>
    </div>
  );
}

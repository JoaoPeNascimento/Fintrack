'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';

// ─── Floating Decorative Elements ────────────────────────────────────
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Coin */}
      <div className="animate-float absolute top-[12%] left-[8%] w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 opacity-60 clay-icon flex items-center justify-center text-2xl select-none">
        💰
      </div>
      {/* Chart */}
      <div className="animate-float-delayed absolute top-[18%] right-[10%] w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-300 opacity-50 clay-icon flex items-center justify-center text-2xl select-none">
        📊
      </div>
      {/* Card */}
      <div className="animate-float-slow absolute bottom-[25%] left-[5%] w-20 h-12 rounded-xl bg-gradient-to-br from-indigo-200 to-purple-300 opacity-40 clay-icon flex items-center justify-center text-xl select-none">
        💳
      </div>
      {/* Piggy */}
      <div className="animate-float absolute bottom-[15%] right-[7%] w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-200 to-rose-300 opacity-50 clay-icon flex items-center justify-center text-2xl select-none" style={{ animationDelay: '1.5s' }}>
        🐷
      </div>
      {/* Small circles */}
      <div className="animate-float-delayed absolute top-[40%] left-[15%] w-6 h-6 rounded-full bg-gradient-to-br from-violet-300 to-purple-400 opacity-30" style={{ animationDelay: '0.8s' }} />
      <div className="animate-float-slow absolute top-[55%] right-[18%] w-8 h-8 rounded-full bg-gradient-to-br from-cyan-200 to-teal-300 opacity-25" style={{ animationDelay: '2s' }} />
      <div className="animate-float absolute top-[70%] left-[45%] w-5 h-5 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 opacity-30" style={{ animationDelay: '3s' }} />
      {/* Large background blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200/30 to-indigo-200/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-pink-200/25 to-orange-200/15 blur-3xl" />
    </div>
  );
}

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

// ─── Dashboard Mockup ────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="clay-card bg-gradient-to-br from-white to-[#F8F6FF] p-5 w-full max-w-md mx-auto">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-emerald-400" />
        <div className="ml-auto h-3 w-20 rounded-full bg-gray-200/80" />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="clay-icon bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-3 text-center">
          <p className="text-[10px] text-clay-secondary font-medium">Variável</p>
          <p className="text-sm font-black text-[#7C5CFC]">R$1.240</p>
        </div>
        <div className="clay-icon bg-gradient-to-br from-rose-100 to-orange-100 rounded-xl p-3 text-center">
          <p className="text-[10px] text-clay-secondary font-medium">Fixo</p>
          <p className="text-sm font-black text-rose-500">R$890</p>
        </div>
        <div className="clay-icon bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl p-3 text-center">
          <p className="text-[10px] text-clay-secondary font-medium">Total</p>
          <p className="text-sm font-black text-emerald-600">R$2.130</p>
        </div>
      </div>
      {/* Chart placeholder */}
      <div className="clay-icon bg-gradient-to-br from-[#F0EDFF] to-[#E8E0FF] rounded-xl p-4 mb-3">
        <div className="flex items-end gap-1.5 h-16 justify-center">
          {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
            <div
              key={i}
              className="w-3 rounded-t-md transition-all duration-500"
              style={{
                height: `${h}%`,
                background: `linear-gradient(to top, #7C5CFC, ${i % 3 === 0 ? '#FF7EB3' : i % 3 === 1 ? '#5CE0D8' : '#FFB347'})`,
                opacity: 0.8,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
      {/* List rows */}
      <div className="space-y-2">
        {[
          { name: 'Supermercado', value: 'R$320,00', color: '#7C5CFC' },
          { name: 'Uber', value: 'R$85,50', color: '#FF7EB3' },
          { name: 'Netflix', value: 'R$44,90', color: '#5CE0D8' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-xs text-clay-primary font-medium">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-clay-primary">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────
export default function LandingPage() {
  const { data: session, status } = useSession();
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
      <div className="min-h-screen landing-gradient flex items-center justify-center">
        <div className="clay-step w-16 h-16 bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen landing-gradient overflow-x-hidden">

      {/* ───── Navbar ───── */}
      <nav className="w-full px-6 sm:px-10 py-5 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="clay-icon w-11 h-11 bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-2xl font-black text-clay-primary tracking-tight">Fintrack</span>
        </div>

        <button
          onClick={handleLogin}
          className="clay-button bg-gradient-to-r from-[#7C5CFC] to-[#9B7FFF] text-white font-bold px-6 py-2.5 text-sm cursor-pointer"
        >
          Entrar
        </button>
      </nav>

      {/* ───── Hero Section ───── */}
      <section className="relative px-6 sm:px-10 pt-6 pb-12 sm:pt-10 sm:pb-16 max-w-7xl mx-auto">
        <FloatingElements />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="clay-icon bg-gradient-to-r from-[#F0EDFF] to-[#FFE0EB] px-5 py-2 mb-6 inline-flex items-center gap-2">
              <span className="text-sm">✨</span>
              <span className="text-sm font-semibold text-[#7C5CFC]">Grátis e fácil de usar</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-clay-primary leading-[1.1] mb-6">
              Controle seus{' '}
              <span className="bg-gradient-to-r from-[#7C5CFC] to-[#FF7EB3] bg-clip-text text-transparent">
                gastos
              </span>{' '}
              com facilidade
            </h1>

            <p className="text-clay-secondary text-lg sm:text-xl max-w-lg leading-relaxed mb-8">
              O gerenciador financeiro mais simples e completo. Cadastre despesas, acompanhe seus gastos fixos e variáveis, e tenha visão total das suas finanças.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={handleLogin}
                className="clay-button animate-pulse-clay bg-gradient-to-r from-[#7C5CFC] to-[#9B7FFF] text-white font-bold px-8 py-4 text-lg cursor-pointer flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#e0e0ff"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffe0eb"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                </svg>
                Começar com Google
              </button>

              <a
                href="#saiba-mais"
                className="clay-button bg-white/70 text-clay-primary font-bold px-8 py-4 text-lg text-center cursor-pointer hover:bg-white/90"
              >
                Saiba mais
              </a>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="flex justify-center lg:justify-end animate-float-slow">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ───── Saiba Mais Section ───── */}
      <section id="saiba-mais" className="px-6 sm:px-10 py-12 sm:py-16 bg-white/40 border-t border-[#E6E0FF]/60" ref={saibaMaisRef}>
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          {/* Header */}
          <div className="text-center scroll-reveal">
            <div className="clay-icon bg-gradient-to-r from-[#F0EDFF] to-[#E8E0FF] px-5 py-2 inline-flex items-center gap-2 mb-4">
              <span className="text-sm">💡</span>
              <span className="text-sm font-semibold text-[#7C5CFC]">Saiba Mais</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-clay-primary mb-3">
              Como funciona e por que usar o{' '}
              <span className="bg-gradient-to-r from-[#7C5CFC] to-[#FF7EB3] bg-clip-text text-transparent">
                Fintrack
              </span>
            </h2>
            <p className="text-clay-secondary text-base sm:text-lg max-w-2xl mx-auto">
              Entenda em detalhes o funcionamento da aplicação e como ela ajuda você a ter controle absoluto das suas finanças.
            </p>
          </div>

          {/* Block 1: Como Funciona */}
          <div className="scroll-reveal space-y-6">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="clay-icon w-10 h-10 bg-gradient-to-br from-[#FFB347] to-[#FFCC70] flex items-center justify-center text-xl">
                ⚡
              </div>
              <h3 className="text-2xl font-extrabold text-clay-primary">Como Funciona</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="clay-card bg-gradient-to-br from-white to-[#F8F6FF] p-6 space-y-3">
                <div className="clay-step w-10 h-10 bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <h4 className="text-lg font-bold text-clay-primary">Acesso com 1 clique</h4>
                <p className="text-clay-secondary text-sm leading-relaxed">
                  Faça login instantâneo com a sua conta Google. Sem formulários nem confirmações de e-mail demoradas.
                </p>
              </div>

              <div className="clay-card bg-gradient-to-br from-white to-[#F8F6FF] p-6 space-y-3">
                <div className="clay-step w-10 h-10 bg-gradient-to-br from-[#FF7EB3] to-[#FF9ECF] flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <h4 className="text-lg font-bold text-clay-primary">Cadastre suas Despesas</h4>
                <p className="text-clay-secondary text-sm leading-relaxed">
                  Adicione custos fixos (aluguel, contas) e variáveis (mercado, transporte) rapidamente com poucos cliques.
                </p>
              </div>

              <div className="clay-card bg-gradient-to-br from-white to-[#F8F6FF] p-6 space-y-3">
                <div className="clay-step w-10 h-10 bg-gradient-to-br from-[#5CE0D8] to-[#7EEEE6] flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <h4 className="text-lg font-bold text-clay-primary">Visão Total e Relatórios</h4>
                <p className="text-clay-secondary text-sm leading-relaxed">
                  Acompanhe gráficos interativos e totais mensais no seu dashboard para manter o orçamento sob controle.
                </p>
              </div>
            </div>
          </div>

          {/* Block 2: Por que Utilizar */}
          <div className="scroll-reveal space-y-6">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="clay-icon w-10 h-10 bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center text-xl text-white">
                🎯
              </div>
              <h3 className="text-2xl font-extrabold text-clay-primary">Por que utilizar a aplicação?</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="clay-card bg-gradient-to-br from-[#F0EDFF] to-[#E6E0FF] p-6 flex items-start gap-4">
                <div className="clay-icon w-12 h-12 bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center text-2xl shrink-0 text-white">
                  📊
                </div>
                <div>
                  <h4 className="text-lg font-bold text-clay-primary mb-1">Simplicidade sem Planilhas</h4>
                  <p className="text-clay-secondary text-sm leading-relaxed">
                    Esqueça planilhas complexas e fórmulas do Excel. Uma interface limpa e focada no que é essencial.
                  </p>
                </div>
              </div>

              <div className="clay-card clay-card-pink bg-gradient-to-br from-[#FFF0F5] to-[#FFE0EB] p-6 flex items-start gap-4">
                <div className="clay-icon w-12 h-12 bg-gradient-to-br from-[#FF7EB3] to-[#FF9ECF] flex items-center justify-center text-2xl shrink-0 text-white">
                  📌
                </div>
                <div>
                  <h4 className="text-lg font-bold text-clay-primary mb-1">Clareza entre Gastos Fixos vs Variáveis</h4>
                  <p className="text-clay-secondary text-sm leading-relaxed">
                    Entenda quanto da sua renda está comprometida com contas recorrentes e quanto você ainda tem para gastar.
                  </p>
                </div>
              </div>

              <div className="clay-card clay-card-teal bg-gradient-to-br from-[#E8FFF9] to-[#D0FFF0] p-6 flex items-start gap-4">
                <div className="clay-icon w-12 h-12 bg-gradient-to-br from-[#5CE0D8] to-[#7EEEE6] flex items-center justify-center text-2xl shrink-0 text-white">
                  🔒
                </div>
                <div>
                  <h4 className="text-lg font-bold text-clay-primary mb-1">100% Gratuito e Seguro</h4>
                  <p className="text-clay-secondary text-sm leading-relaxed">
                    Sua conta é autenticada de forma segura pelo Google. Sem mensalidades, anúncios ou custos ocultos.
                  </p>
                </div>
              </div>

              <div className="clay-card clay-card-orange bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] p-6 flex items-start gap-4">
                <div className="clay-icon w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FFCC70] flex items-center justify-center text-2xl shrink-0 text-white">
                  🎨
                </div>
                <div>
                  <h4 className="text-lg font-bold text-clay-primary mb-1">Interface Moderna e Dark Mode</h4>
                  <p className="text-clay-secondary text-sm leading-relaxed">
                    Design em Claymorphism atraente, responsivo e com suporte completo para modo claro e escuro.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action button inside Saiba Mais */}
          <div className="scroll-reveal text-center pt-2">
            <button
              onClick={handleLogin}
              className="clay-button animate-pulse-clay bg-gradient-to-r from-[#7C5CFC] to-[#9B7FFF] text-white font-bold px-8 py-3.5 text-base cursor-pointer inline-flex items-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#e0e0ff"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffe0eb"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
              </svg>
              Começar Agora — É Grátis
            </button>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="px-6 sm:px-10 py-8 border-t border-[#E6E0FF]/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="clay-icon w-8 h-8 bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-clay-primary">Fintrack</span>
          </div>
          <p className="text-clay-secondary text-sm">
            © {new Date().getFullYear()} Fintrack. Feito com 💜 para suas finanças.
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import LogoutButton from './LogoutButton';
import Logo from './Logo';

type AppHeaderProps = {
  /** 'shared' = visão de um compartilhamento: nenhum item do menu fica destacado. */
  active: 'dashboard' | 'profile' | 'shared';
  user?: { name?: string | null; image?: string | null };
};

const navItems = [
  { key: 'dashboard', href: '/dashboard', label: 'Visão geral' },
  { key: 'profile', href: '/profile', label: 'Perfil' },
] as const;

export default function AppHeader({ active, user }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-line bg-surface/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/dashboard" aria-label="Fintrack — início">
            <Logo />
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active === item.key ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/profile" className="flex items-center gap-2 rounded-md p-1 hover:bg-surface-2 transition-colors" title="Ver perfil">
            {user?.image ? (
              <img src={user.image} alt="" className="w-8 h-8 rounded-full border border-line" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-surface-2 text-primary text-sm font-semibold flex items-center justify-center">
                {user?.name?.charAt(0) || 'U'}
              </span>
            )}
            <span className="hidden md:block text-sm font-medium text-fg max-w-[160px] truncate">{user?.name}</span>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

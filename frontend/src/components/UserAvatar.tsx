import type { ShareUser } from '@/lib/share';

export default function UserAvatar({ user, size = 'sm' }: { user: ShareUser; size?: 'sm' | 'md' }) {
  const dimensions = size === 'md' ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm';
  if (user.image) {
    return <img src={user.image} alt="" className={`${dimensions} rounded-full border border-line object-cover shrink-0`} />;
  }
  return (
    <span className={`${dimensions} rounded-full bg-surface-2 text-primary font-semibold flex items-center justify-center shrink-0`}>
      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
    </span>
  );
}

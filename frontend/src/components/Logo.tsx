export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  return (
    <span className="flex items-center gap-2">
      <span className={`${box} rounded-lg bg-primary text-on-primary flex items-center justify-center`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M4 19V5m0 14h16M8 15l3-4 3 2 5-6" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight text-fg">Fintrack</span>
    </span>
  );
}

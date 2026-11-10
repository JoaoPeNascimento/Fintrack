import Image from 'next/image';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const px = size === 'sm' ? 28 : 34;
  return (
    <span className="flex items-center gap-2">
      <Image
        src="/fintrack-mark.png"
        alt=""
        width={px}
        height={px}
        priority
        className="dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.6)]"
      />
      <span className="text-lg font-semibold tracking-tight text-fg">Fintrack</span>
    </span>
  );
}

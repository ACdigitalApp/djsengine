import discImg from '@/assets/vinyl-disc-only.png';
import armImg from '@/assets/vinyl-arm-only.png';

interface TurntableProps {
  size?: 'sm' | 'lg';
}

export function Turntable({ size = 'lg' }: TurntableProps) {
  const containerClass = size === 'sm'
    ? 'relative w-10 h-10'
    : 'relative w-full max-w-[560px] aspect-square';

  return (
    <div className={containerClass}>
      {/* Subtle ambient glow (only on large) */}
      {size === 'lg' && (
        <div className="absolute inset-0 rounded-full bg-[#2D6A4F]/10 blur-3xl" />
      )}

      {/* Layer A: Spinning disc */}
      <img
        src={discImg}
        alt="DJ'S ENGINE vinyl disc"
        width={size === 'sm' ? 40 : 1024}
        height={size === 'sm' ? 40 : 1024}
        className="relative z-10 w-full h-full object-contain animate-vinyl-spin"
      />

      {/* Layer B: Fixed tonearm */}
      <img
        src={armImg}
        alt=""
        aria-hidden
        width={size === 'sm' ? 20 : 512}
        height={size === 'sm' ? 20 : 512}
        className="absolute z-20 w-[45%] h-auto object-contain"
        style={{
          top: '8%',
          right: '2%',
          transform: 'rotate(-30deg)',
        }}
      />

      {/* Subtle shimmer overlay on disc */}
      {size === 'lg' && (
        <div
          className="absolute inset-0 z-15 rounded-full pointer-events-none animate-vinyl-shimmer"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.06) 10%, transparent 20%, transparent 50%, rgba(255,255,255,0.04) 60%, transparent 70%)',
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
}

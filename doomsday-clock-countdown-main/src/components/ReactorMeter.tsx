import React, { useMemo } from 'react';

type ReactorMeterProps = {
  progress: number;     // 0..1
  label?: string;
};

function clamp01(t: number) { return Math.min(1, Math.max(0, t)); }

export default function ReactorMeter({ progress, label = 'energia acumulada para estourar a bomba' }: ReactorMeterProps) {
  const p = clamp01(progress);
  const percent = p * 100;
  const intensity = Math.pow(p, 3); // efeitos mais fortes perto do fim
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      : false;

  const sparks = useMemo(() => {
    const n = Math.round(6 + 24 * intensity);
    return Array.from({ length: n }, (_, i) => ({
      key: i,
      left: Math.random() * percent,
      size: 2 + Math.random() * 3,
      dur: 0.8 + Math.random() * 0.9,
      delay: Math.random() * 0.6,
      rise: 12 + Math.random() * (30 + 60 * intensity),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent]);

  const shakeClass = intensity > 0.8 && !prefersReduced ? 'animate-[shake_150ms_infinite]' : '';

  return (
    <div className="w-full max-w-3xl mx-auto select-none">
      <style>{`
        @keyframes stripeMove { from { background-position: 0 0; } to { background-position: 28px 0; } }
        @keyframes glowPulse  { 0%,100% { opacity: .9 } 50% { opacity: 1 } }
        @keyframes sparkRise  { from { transform: translateY(0); opacity: .9 } to { transform: translateY(-var(--rise)); opacity: 0 } }
        @keyframes shake { 0%{transform:translateX(0)}25%{transform:translateX(.5px)}50%{transform:translateX(-.5px)}75%{transform:translateX(.5px)}100%{transform:translateX(0)} }
      `}</style>

      <p className="mb-2 text-xs sm:text-sm md:text-base font-mono tracking-widest text-foreground text-center">
        <span className="uppercase text-atomic-yellow font-bold">{label}:</span>{' '}
        <span className="font-bold text-atomic-yellow drop-shadow-[0_0_6px_hsl(var(--atomic-yellow))]">
          {percent.toFixed(2)}%
        </span>
      </p>

      <div
        className={`relative h-5 sm:h-5.5 md:h-6 w-full rounded-full overflow-hidden ${shakeClass}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.45) 100%)',
          boxShadow: 'inset 0 0 0 1px hsl(var(--atomic-orange)/0.35), 0 0 14px hsl(var(--atomic-orange)/0.18)',
        }}
      >
        <div
          className="h-full rounded-full relative transition-[width] duration-500"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, hsl(var(--atomic-yellow)) 0%, hsl(var(--atomic-orange)) 55%, hsl(var(--destructive)) 100%)',
            boxShadow: `0 0 ${8 + 28 * intensity}px hsl(var(--atomic-orange))`,
            filter: `saturate(${1 + 0.8 * intensity})`,
          }}
        >
          {!prefersReduced && (
            <div
              className="absolute inset-0 opacity-25"
              style={{
                background:
                  'repeating-linear-gradient(135deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 10px, rgba(0,0,0,0.28) 10px, rgba(0,0,0,0.28) 20px)',
                animation: `stripeMove ${1.2 - 0.6 * intensity}s linear infinite`,
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(0deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0) 100%)',
              mixBlendMode: 'screen',
              opacity: 0.9,
              animation: !prefersReduced ? 'glowPulse 2s ease-in-out infinite' : undefined,
            }}
          />
        </div>

        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 h-full"
            style={{
              left: `${tick}%`,
              width: tick === 0 || tick === 100 ? 2 : 1,
              background: 'hsl(var(--atomic-orange)/0.35)',
            }}
          />
        ))}

        {!prefersReduced &&
          sparks.map((s) => (
            <div
              key={s.key}
              className="absolute bottom-0 rounded-full"
              style={
                {
                  left: `${s.left}%`,
                  width: s.size,
                  height: s.size,
                  background: 'hsl(var(--atomic-yellow))',
                  filter: `drop-shadow(0 0 ${6 + 18 * intensity}px hsl(var(--atomic-yellow)))`,
                  animation: `sparkRise ${s.dur}s ease-out ${s.delay}s infinite`,
                  
                  '--rise': `${s.rise}px`,
                } as React.CSSProperties
              }
            />
          ))}
      </div>

      <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-1 font-mono">
        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
      </div>
    </div>
  );
}

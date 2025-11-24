import { useEffect, useMemo, useState } from 'react';
import AtomicCountdown from '@/components/AtomicCountdown';
import ReactorMeter from '@/components/ReactorMeter';

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

const Index = () => {
  const [blackout, setBlackout] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 entre BASE e END

  // BASE fixa: 19/08/2025 00:00 (hora local)
  const BASE = useMemo(() => new Date('2025-07-23T00:00:00').getTime(), []);
  // END alvo (ajuste a data que você definiu)
  const END_TARGET = useMemo(() => new Date('2026-01-15T00:00:00').getTime(), []);

  // Progresso decorrido desde BASE até END_TARGET (independente do countdown)
  useEffect(() => {
    const total = Math.max(1, END_TARGET - BASE);

    const tick = () => {
      const now = Date.now();
      const p = clamp((now - BASE) / total, 0, 1);
      setProgress(p);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [BASE, END_TARGET]);

  return (
    <div 
      className="h-screen w-screen overflow-hidden relative flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url('/lovable-uploads/9a3254f4-4de0-40d3-ba0b-66d20e674363.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay escuro para legibilidade (esconde no blackout) */}
      {!blackout && <div className="absolute inset-0 bg-black/60" />}

      {/* Conteúdo principal (mostra apenas antes do zero) */}
      {!blackout && (
        <div className="relative z-10 text-center space-y-8 md:space-y-10 px-6 sm:px-8 max-w-6xl">
          {/* Citação principal */}
          <div className="space-y-4 sm:space-y-6">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground font-mono leading-relaxed tracking-wide">
              "Quando eu te procurei com aqueles cálculos, achamos que poderíamos iniciar uma reação em cadeia que{' '}
              <span className="text-atomic-orange font-bold drop-shadow-[0_0_10px_hsl(var(--atomic-orange))]">
                destruiria o mundo inteiro
              </span>
              ..."
            </p>
          </div>

          {/* Countdown (usa END_TARGET) */}
          <div className="py-4 sm:py-6">
            <AtomicCountdown
              target={new Date(END_TARGET)}
              onComplete={() => setBlackout(true)}
            />
          </div>

          {/* Medidor visual do progresso decorrido desde 19/08/2025 */}
          <ReactorMeter progress={progress} label="energia acumulada para estourar a bomba" />
        </div>
      )}

      {/* BLACKOUT + Mensagem final (quando o timer chega a zero) */}
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${blackout ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: '#000' }}
      >
        <div className="px-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-widest text-atomic-yellow drop-shadow-[0_0_12px_hsl(var(--atomic-yellow))] uppercase">
            Nós destruímos
          </h1>
          <p className="mt-4 sm:mt-5 md:mt-6 text-base sm:text-lg md:text-xl text-foreground/90 font-mono italic">
            "Agora tornei-me a morte, <span className="text-destructive font-bold not-italic">o destruidor de mundos</span>"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

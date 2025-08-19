import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

type AtomicCountdownProps = {
  /** Data/epoch alvo. Se não for passado, usa um fallback. */
  target?: number | Date;
  /** Progresso de 0→1 ao longo da contagem. */
  onProgress?: (p: number) => void;
  /** Chamado quando o contador chega a zero. */
  onComplete?: () => void;        // 👈 ADICIONADO
};

const AtomicCountdown = ({ target, onProgress, onComplete }: AtomicCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  // Calcula timestamp alvo
  const targetTs =
    typeof target === 'number'
      ? target
      : target instanceof Date
      ? target.getTime()
      : new Date('2025-11-25T00:00:00').getTime(); // fallback

  // Total de ms desde o mount até o alvo (para normalizar o progresso)
  const totalMsRef = useRef(Math.max(1, targetTs - Date.now()));
  const completedRef = useRef(false); // evita múltiplos onComplete()

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const difference = targetTs - now;

      const p = clamp(1 - difference / totalMsRef.current);
      onProgress?.(p);

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();            // 👈 DISPARA QUANDO ZERA
        }
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetTs, onProgress, onComplete]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="relative">
      <Card className="bg-steel-gray/20 border-atomic-orange/30 backdrop-blur-sm shadow-[0_0_20px_hsl(var(--atomic-orange)/0.3)] p-6 text-center min-w-[110px]">
        <div className="text-5xl font-bold text-atomic-yellow font-mono tracking-wider drop-shadow-[0_0_10px_hsl(var(--atomic-yellow))]">
          {value.toString().padStart(2, '0')}
        </div>
        <div className="text-xs md:text-sm uppercase tracking-[0.2em] text-muted-foreground font-semibold mt-2">
          {label}
        </div>
      </Card>
      <div className="absolute inset-0 bg-gradient-to-t from-atomic-orange/10 to-transparent rounded-lg pointer-events-none" />
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 md:gap-8">
      <div className="flex gap-3 md:gap-4 items-center">
        <TimeUnit value={timeLeft.days} label="DIAS" />
        <div className="text-4xl md:text-6xl text-atomic-orange font-bold animate-pulse">:</div>
        <TimeUnit value={timeLeft.hours} label="HORAS" />
        <div className="text-4xl md:text-6xl text-atomic-orange font-bold animate-pulse">:</div>
        <TimeUnit value={timeLeft.minutes} label="MINUTOS" />
        <div className="text-4xl md:text-6xl text-atomic-orange font-bold animate-pulse">:</div>
        <TimeUnit value={timeLeft.seconds} label="SEGUNDOS" />
      </div>
    </div>
  );
};

export default AtomicCountdown;

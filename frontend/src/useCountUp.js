import { useState, useEffect, useRef } from 'react';

function useCountUp(target, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const end = Number(target) || 0;
    const start = 0;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;

      setValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(update);
      } else {
        setValue(end);
      }
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration]);

  const numericValue = Number.isFinite(value) ? value : 0;
  return Number(numericValue.toFixed(decimals));
}

export default useCountUp;

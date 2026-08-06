import { useEffect, useRef, useState } from 'react';

function useCountUp(target, { duration = 900, decimals = 0 } = {}) {
  const [value, setValue] = useState(0);
  const animationRef = useRef(null);
  const startRef = useRef(null);
  const previousTargetRef = useRef(0);

  useEffect(() => {
    const endValue = Number(target) || 0;
    const startValue = Number(previousTargetRef.current) || 0;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) {
        startRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const nextValue = startValue + (endValue - startValue) * progress;
      setValue(nextValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    };

    animationRef.current = requestAnimationFrame(step);
    previousTargetRef.current = endValue;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration]);

  return Number(value.toFixed(decimals));
}

export default useCountUp;

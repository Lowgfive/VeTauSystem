import { useState, useEffect } from 'react';

export function useSeatTimer(expiresAt: number | null) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      return Math.max(0, Math.floor((expiresAt - now) / 1000));
    };

    // Update every second
    const intervalId = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expiresAt]); // Hook correctly responds via closures and fixed timestamps

  const isExpired = expiresAt !== null && timeLeft <= 0;
  const isCritical = timeLeft > 0 && timeLeft <= 120; // Last 2 minutes

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { timeLeft, isExpired, formattedTime, isCritical };
}

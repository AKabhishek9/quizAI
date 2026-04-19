"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isExpired: boolean;
  percentage: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newDuration?: number) => void;
}

export function useTimer(
  durationSeconds: number,
  onExpire?: () => void
): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep callback ref fresh
  // Update the ref inside an effect to avoid ref mutations during render
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(
    (newDuration?: number) => {
      clearTimer();
      setTimeRemaining(newDuration ?? durationSeconds);
      setIsRunning(false);
    },
    [durationSeconds, clearTimer]
  );

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  return {
    timeRemaining,
    isRunning,
    isExpired: timeRemaining === 0,
    percentage: (timeRemaining / durationSeconds) * 100,
    start,
    pause,
    resume,
    reset,
  };
}

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
  /** Reset the timer and immediately start it — avoids React batching issues with separate reset() + start() calls */
  resetAndStart: (newDuration?: number) => void;
}

export function useTimer(
  durationSeconds: number,
  onExpire?: () => void
): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  // Generation counter: bumped on every reset so the interval effect always re-fires
  const [generation, setGeneration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep callback ref fresh
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
      setGeneration((g) => g + 1);
    },
    [durationSeconds, clearTimer]
  );

  const resetAndStart = useCallback(
    (newDuration?: number) => {
      clearTimer();
      setTimeRemaining(newDuration ?? durationSeconds);
      setIsRunning(true);
      setGeneration((g) => g + 1);
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
    // `generation` ensures interval is recreated after resetAndStart
  }, [isRunning, clearTimer, generation]);

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
    resetAndStart,
  };
}

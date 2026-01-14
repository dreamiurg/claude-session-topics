const FIBONACCI_THRESHOLDS = [1, 2, 3, 5, 8];

export function shouldGenerate(count: number, currentTopic: string, regenInterval = 10): boolean {
  // Always generate if no topic
  if (!currentTopic) {
    return true;
  }

  // Check Fibonacci thresholds
  if (FIBONACCI_THRESHOLDS.includes(count)) {
    return true;
  }

  // After Fibonacci phase, generate every regenInterval
  if (count > 8) {
    const sinceFib = count - 8;
    return sinceFib % regenInterval === 0;
  }

  return false;
}

export function nextGenerationAt(count: number, regenInterval = 10): number {
  if (count < 1) return 1;
  if (count < 2) return 2;
  if (count < 3) return 3;
  if (count < 5) return 5;
  if (count < 8) return 8;

  const sinceFib = count - 8;
  const nextInterval = Math.ceil(sinceFib / regenInterval) * regenInterval;
  return 8 + nextInterval;
}

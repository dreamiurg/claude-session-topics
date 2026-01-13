// src/display.ts
import { nextGenerationAt } from './schedule.js';
import type { SessionState } from './types.js';

export function formatTopicDisplay(state: SessionState | null, regenInterval = 10): string {
  if (!state) {
    return '○ Just getting started...';
  }

  // Calculate next generation point
  const nextAt = nextGenerationAt(state.count, regenInterval);
  const remaining = nextAt - state.count;
  const hasTopicAlready = !!state.topic;

  // If we have a topic, show it with progress circle
  if (state.topic) {
    const circle = getCircleForProgress(state.count, nextAt, hasTopicAlready);

    // Show topic with progress circle (age no longer needed)
    return `${circle} ${state.topic}`;
  }

  // Show error (except "waiting for conversation")
  if (state.error && state.error !== 'waiting for conversation') {
    return `⚠️ ${state.error}`;
  }

  // No topic yet - show progress message
  if (remaining <= 0) {
    return '● Thinking about a topic...';
  }

  const circle = getCircleForProgress(state.count, nextAt, hasTopicAlready);
  const message = getConversationalMessage(circle, state.count, hasTopicAlready, remaining);

  return `${circle} ${message}`;
}

function getCircleForProgress(count: number, nextAt: number, hasTopicAlready: boolean): string {
  // If we're at or past threshold, show full circle
  if (count >= nextAt) {
    return '●';
  }

  // Calculate last generation point
  let lastAt = 0;
  if (hasTopicAlready) {
    const FIBONACCI_THRESHOLDS = [1, 2, 3, 5, 8];

    // If nextAt is in Fibonacci sequence, find the previous one
    if (nextAt <= 8) {
      const index = FIBONACCI_THRESHOLDS.indexOf(nextAt);
      if (index > 0) {
        lastAt = FIBONACCI_THRESHOLDS[index - 1];
      }
    } else {
      // After Fibonacci (nextAt > 8), we generate every 10
      // So lastAt is nextAt - 10
      lastAt = nextAt - 10;
    }
  }

  // Calculate progress: (current - last) / (next - last)
  const range = nextAt - lastAt;
  const progress = range > 0 ? (count - lastAt) / range : 0;

  // Map to circle states
  if (progress < 0.2) return '○';
  if (progress < 0.4) return '◔';
  if (progress < 0.6) return '◑';
  if (progress < 0.8) return '◕';
  return '●';
}

function getConversationalMessage(
  circle: string,
  count: number,
  hasTopicAlready: boolean,
  remaining: number
): string {
  // Generating state
  if (circle === '●') {
    return hasTopicAlready ? 'Refining topic...' : 'Thinking about a topic...';
  }

  // First topic generation (no topic yet)
  if (!hasTopicAlready) {
    if (count === 0) return 'Just getting started...';
    if (count === 1) return 'Getting to know your session...';
    if (remaining === 1) return 'Almost ready for a topic...';
    return 'Building up context...';
  }

  // Topic refinement (has topic already)
  if (remaining === 1) return 'Almost time to update...';
  if (remaining <= 3) return 'Nearly ready to refine...';

  // Progress-based messages
  if (circle === '○') return 'Continuing conversation...';
  if (circle === '◔') return 'Building understanding...';
  if (circle === '◑') return 'Making progress...';
  if (circle === '◕') return 'Almost ready to update...';

  return 'Exploring your task...';
}

// src/display.ts
import { nextGenerationAt } from './schedule.js';
import type { SessionState } from './types.js';

export function formatAge(timestamp: number): string {
  const age = (Date.now() - timestamp) / 1000;

  if (age < 300) return 'now';
  if (age < 900) return '~10m';
  if (age < 1800) return '~20m';
  if (age < 3600) return '~45m';
  if (age < 7200) return '~1h';

  const hours = Math.floor(age / 3600);
  return `~${hours}h`;
}

export function formatTopicDisplay(state: SessionState | null, regenInterval = 10): string {
  if (!state) {
    return 'Topic: after 1 message';
  }

  // Show topic if we have one
  if (state.topic) {
    const age = formatAge(state.generated_at);
    return `${state.topic} (${age})`;
  }

  // Show error (except "waiting for conversation")
  if (state.error && state.error !== 'waiting for conversation') {
    return state.error;
  }

  // Show countdown to next generation
  const nextAt = nextGenerationAt(state.count, regenInterval);
  const remaining = nextAt - state.count;

  if (remaining <= 0) {
    return 'Generating topic...';
  }

  return `Topic: in ${remaining} messages`;
}

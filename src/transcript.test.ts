import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseTranscript } from './transcript.js';

describe('Transcript Parsing', () => {
  it('should parse transcript messages', async () => {
    const fixture = join(__dirname, 'test-fixtures', 'sample-transcript.jsonl');
    const context = await parseTranscript(fixture, 50);

    expect(context).toContain('User: Hello');
    expect(context).toContain('Claude: Of course');
  });

  it('should return null for missing file', async () => {
    const context = await parseTranscript('/nonexistent/file.jsonl', 50);
    expect(context).toBeNull();
  });
});

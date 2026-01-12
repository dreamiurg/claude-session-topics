import { describe, it, expect } from 'vitest';
import { parseTranscript, findTranscriptPath } from './transcript';
import { join } from 'path';

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

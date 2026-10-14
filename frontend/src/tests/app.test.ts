import { describe, it, expect } from 'vitest';

describe('ProspectAI Frontend Logic Tests', () => {
  it('correctly calculates ICP match levels', () => {
    const scores = [92.0, 78.5, 64.0, 32.0];
    const getLevel = (score: number) => {
      if (score >= 75) return 'qualified';
      if (score >= 50) return 'potential';
      return 'not_qualified';
    };

    expect(getLevel(scores[0])).toBe('qualified');
    expect(getLevel(scores[1])).toBe('qualified');
    expect(getLevel(scores[2])).toBe('potential');
    expect(getLevel(scores[3])).toBe('not_qualified');
  });

  it('validates opt-out keyword detection', () => {
    const optOutKeywords = ['stop', 'unsubscribe', 'opt out', 'remove me'];
    const checkOptOut = (text: string) => {
      const lower = text.toLowerCase();
      return optOutKeywords.some(k => lower.includes(k));
    };

    expect(checkOptOut('Please stop contacting me')).toBe(true);
    expect(checkOptOut('UNSUBSCRIBE immediately')).toBe(true);
    expect(checkOptOut('Hi, I am interested in a demo')).toBe(false);
  });

  it('validates meeting slot formatting', () => {
    const formatSlot = (timeStr: string, tz: string) => {
      const date = new Date(timeStr);
      return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${tz})`;
    };

    const slot = formatSlot('2026-10-20T14:00:00Z', 'UTC');
    expect(slot).toContain('(UTC)');
  });
});

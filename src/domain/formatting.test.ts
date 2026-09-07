import { describe, expect, test } from 'vitest';
import { formatTimestamp, severityColor } from './formatting';
import { STATUS_COLORS } from '../config';

describe('formatTimestamp', () => {
  test('formats a timestamp with padded hours/minutes', () => {
    expect(formatTimestamp('2036-07-11T09:42:00Z')).toBe('Jul 11, 09:42 UTC');
  });

  test('does not pad the day-of-month (matches existing display convention)', () => {
    expect(formatTimestamp('2036-01-05T03:07:00Z')).toBe('Jan 5, 03:07 UTC');
  });

  test('handles midnight correctly', () => {
    expect(formatTimestamp('2036-12-31T00:00:00Z')).toBe('Dec 31, 00:00 UTC');
  });
});

describe('severityColor', () => {
  test('maps critical to the bad color', () => {
    expect(severityColor('critical')).toBe(STATUS_COLORS.bad);
  });

  test('maps warning to the warn color', () => {
    expect(severityColor('warning')).toBe(STATUS_COLORS.warn);
  });

  test('maps info to the info color', () => {
    expect(severityColor('info')).toBe(STATUS_COLORS.info);
  });

  test('falls back to the neutral color for anything else', () => {
    expect(severityColor('unknown')).toBe(STATUS_COLORS.neutral);
  });
});

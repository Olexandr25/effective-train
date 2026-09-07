import { describe, expect, test } from 'vitest';
import { classifyLowerBound, classifyRange } from './threshold';

describe('classifyLowerBound', () => {
  test('is bad below the bad threshold', () => {
    expect(classifyLowerBound(5, 10, 20)).toBe('bad');
  });

  test('is warn between the two thresholds', () => {
    expect(classifyLowerBound(15, 10, 20)).toBe('warn');
  });

  test('is ok at or above the warn threshold', () => {
    expect(classifyLowerBound(20, 10, 20)).toBe('ok');
  });

  test('the bad threshold itself is warn, not bad (strict comparison)', () => {
    expect(classifyLowerBound(10, 10, 20)).toBe('warn');
  });
});

describe('classifyRange', () => {
  test('is ok inside the band', () => {
    expect(classifyRange(0, -30, 40)).toBe('ok');
  });

  test('is warn above the upper bound', () => {
    expect(classifyRange(41, -30, 40)).toBe('warn');
  });

  test('is warn below the lower bound', () => {
    expect(classifyRange(-31, -30, 40)).toBe('warn');
  });

  test('the bounds themselves are ok (strict comparison)', () => {
    expect(classifyRange(40, -30, 40)).toBe('ok');
    expect(classifyRange(-30, -30, 40)).toBe('ok');
  });
});

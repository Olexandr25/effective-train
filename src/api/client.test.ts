import { describe, expect, it, vi, afterEach } from 'vitest';
import { getData, getDataOrNull } from './client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getData', () => {
  it('resolves with the parsed JSON body on a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ hello: 'world' }) }))
    );
    await expect(getData('station')).resolves.toEqual({ hello: 'world' });
  });

  it('throws with the status code when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) })));
    await expect(getData('station')).rejects.toThrow('503');
  });
});

describe('getDataOrNull', () => {
  it('swallows a failure and resolves null instead of throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network down'))));
    await expect(getDataOrNull('station')).resolves.toBeNull();
  });
});

// Fetch wrapper for the station API. The only place allowed to call
// fetch() directly — see CLAUDE.md "Architecture".

export async function getData<T>(path: string): Promise<T> {
  const url = '/api/' + path + '.json';
  // simulated network latency so loading states are visible
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));
  if (typeof window !== 'undefined' && window.location.search.indexOf('fail=1') !== -1) {
    throw new Error('Simulated uplink failure (remove ?fail=1 from the URL)');
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Request failed: ' + res.status);
  }
  return (await res.json()) as T;
}

export function getDataOrNull<T>(path: string): Promise<T | null> {
  return getData<T>(path).catch(() => null);
}

// Pure telemetry math: downsampling for sparklines and trend direction.
// No React, no DOM.

export function downsampleTelemetry(points: number[], maxPoints: number): number[] {
  if (points.length <= maxPoints) return points;
  const bucketSize = points.length / maxPoints;
  const result: number[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    let sum = 0;
    let count = 0;
    for (let j = start; j < end && j < points.length; j++) {
      sum += points[j];
      count++;
    }
    result.push(count > 0 ? sum / count : points[start]);
  }
  return result;
}

export type Trend = '↑' | '↓' | '→';

export function computeTrend(current: number, previous: number, epsilon: number): Trend {
  const delta = current - previous;
  if (delta > epsilon) return '↑';
  if (delta < -epsilon) return '↓';
  return '→';
}

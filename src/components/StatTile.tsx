import type { ReactNode } from 'react';

// One tile in the dashboard grid. The 8 tiles used to be near-identical
// hand-written JSX blocks inside Dashboard.tsx; this is that shape,
// extracted once. Callers build the value/sub content (they differ in
// units, trend arrows, and formatting) and pass a tile level for color.

interface StatTileProps {
  label: string;
  tileClass: string;
  sub: ReactNode;
  valueFontSize?: number;
  children: ReactNode;
}

export default function StatTile({ label, tileClass, sub, valueFontSize, children }: StatTileProps) {
  return (
    <div className={'tile ' + tileClass}>
      <div className="tile-label">{label}</div>
      <div className="tile-value" style={valueFontSize ? { fontSize: valueFontSize } : undefined}>
        {children}
      </div>
      <div className="tile-sub">{sub}</div>
    </div>
  );
}

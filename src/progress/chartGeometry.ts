/** Pure chart geometry: values in, scaled coordinates, y-axis ticks and SVG paths out. No React, no I/O. */

export interface ChartXY {
  x: number;
  y: number;
}

export interface ChartTick {
  /** The value the gridline stands for. */
  value: number;
  y: number;
}

export interface ChartGeometry {
  points: ChartXY[];
  /** Low, middle and high gridlines; they bracket the smallest and largest value. */
  ticks: ChartTick[];
  /** The line through the points, or "" with no point. */
  linePath: string;
  /** The line closed down to the bottom edge, for the soft fill, or "" with no point. */
  areaPath: string;
}

/** Inset so dots and the stroke never clip at the edge. */
const PAD_X = 8;
const PAD_Y = 14;
/** How far the axis reaches past the data, as a share of the spread. */
const HEADROOM = 0.1;

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/**
 * Lays `values` (oldest first) out evenly across `width` x `height`. Equal values draw a flat line in the middle;
 * one point sits in the middle; no point gives empty paths.
 */
export function chartGeometry(values: number[], width: number, height: number): ChartGeometry {
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const spread = max - min;
  const room = spread === 0 ? Math.max(Math.abs(max) * HEADROOM, 1) : spread * HEADROOM;
  const lo = min - room;
  const hi = max + room;
  const top = PAD_Y;
  const bottom = height - PAD_Y;
  const yOf = (v: number) => top + ((hi - v) / (hi - lo)) * (bottom - top);

  const n = values.length;
  const points = values.map((v, i) => ({
    x: n === 1 ? width / 2 : PAD_X + (i * (width - 2 * PAD_X)) / (n - 1),
    y: yOf(v),
  }));
  const ticks = [lo, (lo + hi) / 2, hi].map((value) => ({ value, y: yOf(value) }));

  if (n === 0) return { points, ticks, linePath: "", areaPath: "" };
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${fmt(p.x)} ${fmt(p.y)}`).join(" ");
  const areaPath = `${linePath} V${fmt(height)} H${fmt(points[0].x)} Z`;
  return { points, ticks, linePath, areaPath };
}

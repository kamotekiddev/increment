import { chartGeometry } from "./chartGeometry";

describe("chartGeometry", () => {
  it("scales 8 points into a 318 x 110 box, oldest left, higher values higher up", () => {
    const g = chartGeometry([60, 62.5, 62.5, 65, 67.5, 67.5, 70, 72.5], 318, 110);
    expect(g.points).toHaveLength(8);
    expect(g.points[0].x).toBeLessThan(g.points[7].x);
    for (let i = 1; i < 8; i++) expect(g.points[i].x).toBeGreaterThan(g.points[i - 1].x);
    for (const p of g.points) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(318);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(110);
    }
    expect(g.points[7].y).toBeLessThan(g.points[0].y);
    expect(g.points[1].y).toBe(g.points[2].y);
  });

  it("draws the line and the fill under it as SVG paths", () => {
    const g = chartGeometry([1, 2, 3], 318, 110);
    expect(g.linePath).toMatch(/^M[\d.]+ [\d.]+( L[\d.]+ [\d.]+){2}$/);
    expect(g.areaPath.startsWith(g.linePath)).toBe(true);
    expect(g.areaPath.endsWith("Z")).toBe(true);
    expect(g.areaPath).toContain("V110");
  });

  it("draws equal values as a flat line, never NaN", () => {
    const g = chartGeometry([60, 60, 60], 318, 110);
    expect(new Set(g.points.map((p) => p.y)).size).toBe(1);
    expect(`${g.linePath}${g.areaPath}`).not.toContain("NaN");
    expect(g.ticks.every((t) => Number.isFinite(t.y) && Number.isFinite(t.value))).toBe(true);
  });

  it("does not throw on zero or one point", () => {
    const none = chartGeometry([], 318, 110);
    expect(none.points).toEqual([]);
    expect(none.linePath).toBe("");
    expect(none.areaPath).toBe("");
    const one = chartGeometry([60], 318, 110);
    expect(one.points).toHaveLength(1);
    expect(Number.isFinite(one.points[0].x) && Number.isFinite(one.points[0].y)).toBe(true);
    expect(one.linePath).not.toContain("NaN");
  });

  it("brackets min and max with the y-axis ticks, top tick highest", () => {
    const g = chartGeometry([60, 72.5, 65], 318, 110);
    const values = g.ticks.map((t) => t.value);
    expect(Math.min(...values)).toBeLessThanOrEqual(60);
    expect(Math.max(...values)).toBeGreaterThanOrEqual(72.5);
    const top = g.ticks.reduce((a, b) => (b.value > a.value ? b : a));
    const bottom = g.ticks.reduce((a, b) => (b.value < a.value ? b : a));
    expect(top.y).toBeLessThan(bottom.y);
  });
});

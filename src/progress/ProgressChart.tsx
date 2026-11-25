import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

import { Text } from "@/components";
import { shortDateLabel } from "@/history/historyQueries";
import { chartSeries, type ChartMetric, type ChartRange } from "@/records/recordsQueries";
import { fontFamily, fontSize, lineHeight, opacity, radius, spacing, useColors } from "@/theme";
import type { Unit } from "@/units";

import { chartGeometry } from "./chartGeometry";

const WIDTH = 318;
const HEIGHT = 110;

const WEIGHTED_TOGGLE: { metric: ChartMetric; label: string }[] = [
  { metric: "weight", label: "Weight" },
  { metric: "oneRepMax", label: "Est. 1RM" },
  { metric: "volume", label: "Volume" },
];

const RANGES: { range: ChartRange; label: string }[] = [
  { range: "last8", label: "Last 8" },
  { range: "last20", label: "Last 20" },
  { range: "all", label: "All" },
];

/** Half-width of the invisible tap target around each dot, in chart units (about 24 px across on a phone). */
const HIT_RADIUS = 12;

const number = (n: number) => n.toLocaleString("en-US");

/**
 * The live chart of a weighted exercise (variant A): the metric toggle above, a line with a soft fill and dots below.
 * Opens on Weight over the latest 8 workouts; the range button cycles Last 8 / Last 20 / All and a tap on a dot reads
 * its date and value (the last point by default). Re-read when `readKey` changes (Progress passes a fresh hero each read).
 */
export function ProgressChart({ exerciseId, unit, readKey }: { exerciseId: number; unit: Unit; readKey: unknown }) {
  const colors = useColors();
  const [metric, setMetric] = useState<ChartMetric>("weight");
  const [range, setRange] = useState<ChartRange>("last8");
  // A tapped dot belongs to one exercise, metric and range; any change of those drops it (back to the last point).
  const selectionKey = `${exerciseId}|${metric}|${range}|${unit}`;
  const [tapped, setTapped] = useState<{ key: string; index: number } | null>(null);
  const series = useMemo(
    () => chartSeries(exerciseId, metric, range, unit),
    // `readKey` re-reads after a workout is finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exerciseId, metric, range, unit, readKey],
  );
  const points = useMemo(() => series?.points ?? [], [series]);
  const plottable = points.length >= 2;
  const geometry = useMemo(() => chartGeometry(points.map((p) => p.value), WIDTH, HEIGHT), [points]);
  const unitLabel = metric === "volume" || metric === "weight" || metric === "oneRepMax" ? unit : "reps";
  const selectedIndex =
    tapped && tapped.key === selectionKey && tapped.index < points.length ? tapped.index : points.length - 1;
  const selected = points[selectedIndex];
  const rangeLabel = RANGES.find((r) => r.range === range)?.label;
  const cycleRange = () => setRange(RANGES[(RANGES.findIndex((r) => r.range === range) + 1) % RANGES.length].range);
  const values = points.map((p) => p.value);
  const message =
    metric === "oneRepMax" && points.length === 0 && (series?.workouts ?? 0) > 0
      ? "No Est. 1RM yet: every set was over 12 reps."
      : "Your chart starts after your second workout.";

  return (
    <View style={{ gap: spacing.md }}>
      <View
        accessibilityRole="tablist"
        style={{ flexDirection: "row", gap: 2, padding: 3, borderRadius: radius.pill, backgroundColor: colors.bg }}
      >
        {WEIGHTED_TOGGLE.map((t) => {
          const on = t.metric === metric;
          return (
            <Pressable
              key={t.metric}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setMetric(t.metric)}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: "center",
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: on ? colors.accent : "transparent",
                opacity: pressed ? opacity.pressed : 1,
              })}
            >
              <Text tone={on ? "onAccent" : undefined} style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.caption }}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {plottable ? (
        <View style={{ gap: spacing.snug }}>
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.small }}>
            {`${number(selected.value)} ${unitLabel} · ${shortDateLabel(selected.date)}`}
          </Text>
          <View style={{ borderRadius: radius.inset, overflow: "hidden", backgroundColor: colors.bg }}>
            <Svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              width="100%"
              height={undefined}
              style={{ aspectRatio: WIDTH / HEIGHT }}
              accessibilityRole="image"
              accessibilityLabel={`${WEIGHTED_TOGGLE.find((t) => t.metric === metric)?.label} chart, ${points.length} workouts, selected ${number(selected.value)} ${unitLabel}, ${shortDateLabel(selected.date)}`}
            >
              <Path d={`M0 ${geometry.ticks[1].y}H${WIDTH}`} stroke={colors.line} />
              <Path d={geometry.areaPath} fill={colors.accent} opacity={0.12} />
              <Path d={geometry.linePath} stroke={colors.accent} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {geometry.points.map((p, i) => {
                const isSelected = i === selectedIndex;
                return (
                  <G key={points[i].date + i}>
                    <Circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 5 : 2.6}
                      fill={isSelected ? colors.accent : colors.card}
                      stroke={colors.accent}
                      strokeWidth={1.5}
                    />
                    <Circle cx={p.x} cy={p.y} r={HIT_RADIUS} fill="transparent" onPress={() => setTapped({ key: selectionKey, index: i })} />
                  </G>
                );
              })}
            </Svg>
          </View>
        </View>
      ) : (
        <View
          style={{
            height: 120,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 28,
            borderRadius: radius.inset,
            backgroundColor: colors.bg,
          }}
        >
          <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.detail, textAlign: "center" }}>
            {message}
          </Text>
        </View>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text tone="muted" style={{ fontSize: fontSize.caption }}>
          {plottable ? `${number(Math.min(...values))} to ${number(Math.max(...values))} ${unitLabel}` : ""}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Range: ${rangeLabel}. Tap to change.`}
          onPress={cycleRange}
          style={({ pressed }) => ({
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.pill,
            backgroundColor: colors.bg,
            opacity: pressed ? opacity.pressed : 1,
          })}
        >
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.caption }}>{`${rangeLabel} ▾`}</Text>
        </Pressable>
      </View>
    </View>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, View, type GestureResponderEvent } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { BottomSheet, Text } from "@/components";
import { shortDateLabel } from "@/history/historyQueries";
import { chartSeriesFrom, chartSource, type ChartMetric, type ChartRange } from "@/records/recordsQueries";
import { chart, fontFamily, fontSize, lineHeight, minTouch, opacity, radius, spacing, useColors } from "@/theme";
import type { Unit } from "@/units";

import { chartGeometry, nearestPointIndex } from "./chartGeometry";
import { thousands } from "./progressQueries";

const WIDTH = 318;
const HEIGHT = 110;

const WEIGHTED_TOGGLE: { metric: ChartMetric; label: string }[] = [
  { metric: "weight", label: "Weight" },
  { metric: "oneRepMax", label: "Est. 1RM" },
  { metric: "volume", label: "Volume" },
];

const BODYWEIGHT_TOGGLE: { metric: ChartMetric; label: string }[] = [
  { metric: "repsInSet", label: "Reps in a set" },
  { metric: "repsInWorkout", label: "Reps in a workout" },
];

const RANGES: { range: ChartRange; label: string; title: string; detail: string }[] = [
  { range: "last8", label: "Last 8", title: "Last 8 workouts", detail: "The latest 8, the closest look at now" },
  { range: "last20", label: "Last 20", title: "Last 20 workouts", detail: "A few months of progress" },
  { range: "all", label: "All", title: "All workouts", detail: "Every workout you've logged" },
];

/** `1,920` or `62.5`: thousands commas on the whole part, never the runtime's Intl data (as the Records card). */
const number = (n: number) => {
  const [whole, decimal] = String(n).split(".");
  return decimal ? `${thousands(Number(whole))}.${decimal}` : thousands(n);
};

/**
 * The live chart of an exercise (weighted or bodyweight) (variant A): the metric toggle above, a line with a soft fill and dots below.
 * Opens on Weight over the latest 8 workouts; the range dropdown (a sheet) picks Last 8 / Last 20 / All and a tap on a dot reads
 * its date and value (the last point by default). Re-read when `readKey` changes (Progress passes a fresh hero each read).
 */
export function ProgressChart({
  exerciseId,
  unit,
  readKey,
  loadType = "weighted",
}: {
  exerciseId: number;
  unit: Unit;
  readKey: unknown;
  loadType?: "weighted" | "bodyweight";
}) {
  const colors = useColors();
  const toggle = loadType === "bodyweight" ? BODYWEIGHT_TOGGLE : WEIGHTED_TOGGLE;
  const [metric, setMetric] = useState<ChartMetric>(toggle[0].metric);
  const [range, setRange] = useState<ChartRange>("last8");
  // A tapped dot belongs to one exercise, metric and range; any change of those drops it (back to the last point).
  const selectionKey = `${exerciseId}|${metric}|${range}|${unit}`;
  const [tapped, setTapped] = useState<{ key: string; index: number } | null>(null);
  // The sessions are read once per exercise and read; metric, range and unit are derived in memory.
  const source = useMemo(
    () => chartSource(exerciseId),
    // `readKey` re-reads after a workout is finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exerciseId, readKey],
  );
  const series = useMemo(() => (source ? chartSeriesFrom(source, metric, range, unit) : null), [source, metric, range, unit]);
  const [width, setWidth] = useState(0);
  const points = useMemo(() => series?.points ?? [], [series]);
  const plottable = points.length >= 2;
  const geometry = useMemo(() => chartGeometry(points.map((p) => p.value), WIDTH, HEIGHT), [points]);
  const unitLabel = loadType === "bodyweight" ? "reps" : unit;
  const selectedIndex =
    tapped && tapped.key === selectionKey && tapped.index < points.length ? tapped.index : points.length - 1;
  const selected = points[selectedIndex];
  // One full-width layer takes the tap: the touch x (in points) maps to chart units and picks the nearest dot.
  const pick = (e: GestureResponderEvent) => {
    if (width <= 0) return;
    const index = nearestPointIndex(geometry.points, (e.nativeEvent.locationX * WIDTH) / width);
    if (index >= 0) setTapped({ key: selectionKey, index });
  };
  const rangeLabel = RANGES.find((r) => r.range === range)?.label;
  const [rangeOpen, setRangeOpen] = useState(false);
  const chooseRange = (next: ChartRange) => {
    setRange(next);
    setRangeOpen(false);
  };
  const values = points.map((p) => p.value);
  const message =
    metric === "oneRepMax" && points.length === 0 && (series?.workouts ?? 0) > 0
      ? "No Est. 1RM yet: every set was over 12 reps."
      : "Your chart starts after your second workout.";

  return (
    <View style={{ gap: spacing.md }}>
      <View
        accessibilityRole="tablist"
        style={{ flexDirection: "row", gap: chart.toggleGap, padding: chart.togglePadding, borderRadius: radius.pill, backgroundColor: colors.bg }}
      >
        {toggle.map((t) => {
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
                backgroundColor: on ? colors.accent : chart.clear,
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
          <View
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            style={{ borderRadius: radius.inset, overflow: "hidden", backgroundColor: colors.bg }}
          >
            <Svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              width="100%"
              height={undefined}
              style={{ aspectRatio: WIDTH / HEIGHT }}
              accessibilityRole="image"
              accessibilityLabel={`${toggle.find((t) => t.metric === metric)?.label} chart, ${points.length} workouts, selected ${number(selected.value)} ${unitLabel}, ${shortDateLabel(selected.date)}`}
            >
              <Path d={`M0 ${geometry.ticks[1].y}H${WIDTH}`} stroke={colors.line} />
              <Path d={geometry.areaPath} fill={colors.accent} opacity={chart.fillOpacity} />
              <Path d={geometry.linePath} stroke={colors.accent} strokeWidth={chart.lineWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {geometry.points.map((p, i) => {
                const isSelected = i === selectedIndex;
                return (
                  <Circle
                    key={points[i].date + i}
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? chart.dotSelectedRadius : chart.dotRadius}
                    fill={isSelected ? colors.accent : colors.card}
                    stroke={colors.accent}
                    strokeWidth={chart.dotStroke}
                  />
                );
              })}
              <Rect x={0} y={0} width={WIDTH} height={HEIGHT} fill={chart.clear} onPress={pick} />
            </Svg>
          </View>
        </View>
      ) : (
        <View
          style={{
            height: chart.emptyHeight,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: chart.emptyPaddingX,
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
          onPress={() => setRangeOpen(true)}
          style={({ pressed }) => ({
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.pill,
            backgroundColor: colors.bg,
            opacity: pressed ? opacity.pressed : 1,
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.caption }}>{rangeLabel}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.iconFaint} />
          </View>
        </Pressable>
      </View>
      <BottomSheet visible={rangeOpen} onDismiss={() => setRangeOpen(false)}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">Chart range</Text>
          <Text tone="muted" style={{ fontSize: fontSize.small }}>
            How many workouts of this exercise the chart shows.
          </Text>
        </View>
        <View style={{ gap: spacing.sm }}>
          {RANGES.map((r) => {
            const on = r.range === range;
            return (
              <Pressable
                key={r.range}
                accessibilityRole="button"
                accessibilityLabel={`${r.title}. ${r.detail}`}
                accessibilityState={{ selected: on }}
                onPress={() => chooseRange(r.range)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  minHeight: minTouch + spacing.lg,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.row,
                  backgroundColor: on ? colors.accentTint : colors.card,
                  opacity: pressed ? opacity.pressed : 1,
                })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: fontFamily.semibold }}>{r.title}</Text>
                  <Text tone="muted" style={{ fontSize: fontSize.small }}>
                    {r.detail}
                  </Text>
                </View>
                {on ? <Ionicons name="checkmark-circle" size={24} color={colors.accent} /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

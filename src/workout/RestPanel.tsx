import { Pressable, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { Text } from "@/components";
import { fontFamily, fontSize, minTouch, opacity, radius, restPanel, spacing, useColors } from "@/theme";

/** "1:42" as words for a screen reader: "1 minute 42 seconds". */
function spokenTime(text: string): string {
  const [m, s] = text.split(":").map(Number);
  const part = (n: number, unit: string) => (n > 0 ? `${n} ${unit}${n === 1 ? "" : "s"}` : "");
  return [part(m, "minute"), part(s, "second")].filter(Boolean).join(" ") || "0 seconds";
}

const R = (restPanel.ring - restPanel.stroke) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function AdjustButton({ label, text, onPress }: { label: string; text: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        height: minTouch,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.sunk,
        opacity: pressed ? opacity.pressed : 1,
      })}
    >
      <Text variant="label" style={{ fontSize: fontSize.small }}>
        {text}
      </Text>
    </Pressable>
  );
}

/** The rest panel: ring with the countdown, the Next up line and -15s, +15s, Skip. The caller shows it only while a rest runs. */
export function RestPanel({
  text,
  fraction,
  nextUp,
  onAdjust,
  onSkip,
  onLayout,
}: {
  /** The countdown as m:ss. */
  text: string;
  /** Ring fill, 1 full to 0 empty. */
  fraction: number;
  nextUp: string | null;
  onAdjust: (deltaSeconds: number) => void;
  onSkip: () => void;
  /** Reports the panel's height so the list can scroll clear of it. */
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const center = restPanel.ring / 2;
  return (
    <View
      onLayout={onLayout}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.lg + 2,
        paddingTop: spacing.xl - spacing.xs,
        paddingHorizontal: spacing.xl - spacing.xs,
        paddingBottom: Math.max(insets.bottom, spacing.xl - spacing.xs),
        borderTopLeftRadius: restPanel.corner,
        borderTopRightRadius: restPanel.corner,
        backgroundColor: colors.card,
      }}
    >
      <View
        accessible
        accessibilityRole="timer"
        accessibilityLabel={`Rest, ${spokenTime(text)} left`}
        style={{ width: restPanel.ring, height: restPanel.ring, alignItems: "center", justifyContent: "center" }}
      >
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute" }}>
          <Svg width={restPanel.ring} height={restPanel.ring}>
            <Circle cx={center} cy={center} r={R} stroke={colors.sunk} strokeWidth={restPanel.stroke} fill="none" />
            <Circle
              cx={center}
              cy={center}
              r={R}
              stroke={colors.accent}
              strokeWidth={restPanel.stroke}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * fraction} ${CIRCUMFERENCE}`}
              fill="none"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
        </View>
        <Text
          style={{ fontFamily: fontFamily.semibold, fontSize: restPanel.time, lineHeight: restPanel.timeLine, letterSpacing: -0.7 }}
        >
          {text}
        </Text>
        <Text tone="muted" style={{ fontFamily: fontFamily.medium, fontSize: restPanel.label, lineHeight: restPanel.label + 3 }}>
          rest
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: spacing.sm + 2 }}>
        {nextUp ? (
          <View accessible accessibilityLabel={`Next up, ${nextUp}`}>
            <Text variant="caption" tone="muted" style={{ fontFamily: fontFamily.medium }}>
              Next up
            </Text>
            <Text variant="label" numberOfLines={1} style={{ fontSize: fontSize.body, lineHeight: 20 }}>
              {nextUp}
            </Text>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", gap: spacing.xs + 2 }}>
          <AdjustButton label="Subtract 15 seconds" text="−15s" onPress={() => onAdjust(-15)} />
          <AdjustButton label="Add 15 seconds" text="+15s" onPress={() => onAdjust(15)} />
          <AdjustButton label="Skip rest" text="Skip" onPress={onSkip} />
        </View>
      </View>
    </View>
  );
}

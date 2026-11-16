import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { minTouch, opacity, radius, spacing, useColors } from "@/theme";

import { canMoveExercise } from "./canMoveExercise";
import type { RoutineExerciseItem } from "./routineQueries";
import { setupSubtitle } from "./setupText";

export interface ReorderListProps {
  rows: readonly RoutineExerciseItem[];
  onMove: (index: number, direction: "up" | "down") => void;
}

/** Exercise rows with ▲ ▼ buttons (44 pt). No tap-to-edit and no ⋯ while reordering. */
export function ReorderList({ rows, onMove }: ReorderListProps) {
  const colors = useColors();
  return (
    <View style={{ borderRadius: radius.md, backgroundColor: colors.card, overflow: "hidden" }}>
      {rows.map((row, index) => (
        <View
          key={row.id}
          style={{
            minHeight: minTouch,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            paddingVertical: spacing.sm,
            paddingLeft: spacing.lg,
            paddingRight: spacing.sm,
            borderTopWidth: index === 0 ? 0 : 1,
            borderTopColor: colors.line,
          }}
        >
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="label" numberOfLines={1}>
              {row.name}
            </Text>
            <Text variant="caption" tone="muted">
              {setupSubtitle(row)}
            </Text>
          </View>
          <MoveButton
            glyph="▲"
            label={`Move ${row.name} up`}
            disabled={!canMoveExercise(rows.length, index, "up")}
            onPress={() => onMove(index, "up")}
          />
          <MoveButton
            glyph="▼"
            label={`Move ${row.name} down`}
            disabled={!canMoveExercise(rows.length, index, "down")}
            onPress={() => onMove(index, "down")}
          />
        </View>
      ))}
    </View>
  );
}

function MoveButton({
  glyph,
  label,
  disabled,
  onPress,
}: {
  glyph: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: minTouch,
        height: minTouch,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        backgroundColor: pressed ? colors.accentTint : "transparent",
        opacity: disabled ? opacity.disabled : 1,
      })}
    >
      <Text variant="label" tone="accent">
        {glyph}
      </Text>
    </Pressable>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontSize, minTouch, opacity, radius, size, spacing, useColors } from "@/theme";

import { canMoveExercise } from "./canMoveExercise";
import { ExerciseTile } from "./ExerciseTile";
import type { RoutineExerciseItem } from "./routineQueries";
import { setupSubtitle } from "./setupText";

export interface ReorderListProps {
  rows: readonly RoutineExerciseItem[];
  onMove: (index: number, direction: "up" | "down") => void;
}

/** Exercise cards with up and down buttons (44 pt). No tap-to-edit while reordering. */
export function ReorderList({ rows, onMove }: ReorderListProps) {
  const colors = useColors();
  return (
    <View style={{ gap: spacing.sm }}>
      {rows.map((row, index) => (
        <View
          key={row.id}
          style={{
            minHeight: size.row,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: spacing.sm,
            paddingLeft: spacing.md,
            paddingRight: 10,
            borderRadius: radius.row,
            backgroundColor: colors.card,
          }}
        >
          <ExerciseTile equipment={row.equipment} />
          <View style={{ flex: 1 }}>
            <Text variant="label" style={{ fontSize: fontSize.body }} numberOfLines={1}>
              {row.name}
            </Text>
            <Text variant="caption" tone="muted">
              {setupSubtitle(row)}
            </Text>
          </View>
          <MoveButton
            icon="chevron-up"
            label={`Move ${row.name} up`}
            disabled={!canMoveExercise(rows.length, index, "up")}
            onPress={() => onMove(index, "up")}
          />
          <MoveButton
            icon="chevron-down"
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
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: "chevron-up" | "chevron-down";
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
        borderRadius: radius.pill,
        backgroundColor: pressed ? colors.line : colors.sunk,
        opacity: disabled ? opacity.disabled : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={colors.ink} />
    </Pressable>
  );
}

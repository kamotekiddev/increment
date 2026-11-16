import Ionicons from "@expo/vector-icons/Ionicons";
import { FlatList, Pressable, View, type FlatListProps } from "react-native";

import { Text } from "@/components";
import { ExerciseTile } from "@/routines/ExerciseTile";
import { fontFamily, fontSize, minTouch, opacity, radius, size, spacing, useColors } from "@/theme";
import { exerciseMeta } from "./exerciseMeta";
import type { ExerciseSummary } from "./filterExercises";
import { rowSubtitle } from "./rowSubtitle";

export interface ExerciseListProps<T extends ExerciseSummary = ExerciseSummary> {
  /** Already filtered and ordered; the list only displays them. */
  exercises: T[];
  /** What happens when a row is tapped. */
  onSelect: (exercise: T) => void;
  /** Ids shown as "Added" and not tappable (the routine picker). Omitted in the Library. */
  disabledIds?: ReadonlySet<number>;
  /** The routine picker look: rows grouped in one white card, with an equipment icon and a plus or Added marker. */
  picker?: boolean;
  /** Rendered above the rows; scrolls with the list. */
  ListHeaderComponent?: FlatListProps<T>["ListHeaderComponent"];
  /** Shown when `exercises` is empty. */
  ListEmptyComponent?: FlatListProps<T>["ListEmptyComponent"];
  /** Extra space under the last row, for a fixed action bar. */
  bottomInset?: number;
}

/** Reusable virtualised exercise list: name plus a muted line of muscle groups per row. */
export function ExerciseList<T extends ExerciseSummary = ExerciseSummary>({
  exercises,
  onSelect,
  disabledIds,
  picker = false,
  ListHeaderComponent,
  ListEmptyComponent,
  bottomInset = spacing.xxl * 3,
}: ExerciseListProps<T>) {
  const colors = useColors();
  return (
    <FlatList
      data={exercises}
      keyExtractor={(exercise) => String(exercise.id)}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={{ paddingBottom: bottomInset }}
      extraData={disabledIds}
      renderItem={({ item, index }) => {
        const added = disabledIds?.has(item.id) ?? false;
        if (picker) {
          const first = index === 0;
          const last = index === exercises.length - 1;
          return (
            <View
              style={{
                marginHorizontal: spacing.xl,
                paddingHorizontal: spacing.lg,
                backgroundColor: colors.card,
                borderTopLeftRadius: first ? radius.card : 0,
                borderTopRightRadius: first ? radius.card : 0,
                borderBottomLeftRadius: last ? radius.card : 0,
                borderBottomRightRadius: last ? radius.card : 0,
                paddingTop: first ? 2 : 0,
                paddingBottom: last ? 2 : 0,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: added }}
                disabled={added}
                onPress={() => onSelect(item)}
                style={({ pressed }) => ({
                  minHeight: size.pickerRow,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  opacity: added ? opacity.disabled : pressed ? opacity.pressed : 1,
                  borderTopWidth: first ? 0 : 1,
                  borderTopColor: colors.line,
                })}
              >
                <ExerciseTile equipment={item.equipment ?? ""} />
                <View style={{ flex: 1 }}>
                  <Text variant="label" style={{ fontSize: fontSize.body }}>
                    {item.name}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {exerciseMeta({ muscles: item.muscles, equipment: item.equipment ?? "" })}
                  </Text>
                </View>
                {added ? (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.sunk }}>
                    <Text variant="caption" tone="muted" style={{ fontFamily: fontFamily.semibold }}>
                      Added
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.accentTint,
                    }}
                  >
                    <Ionicons name="add" size={18} color={colors.accent} />
                  </View>
                )}
              </Pressable>
            </View>
          );
        }
        return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: added }}
          disabled={added}
          onPress={() => onSelect(item)}
          style={({ pressed }) => ({
            minHeight: minTouch,
            justifyContent: "center",
            opacity: added ? opacity.disabled : 1,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
            backgroundColor: pressed ? colors.sunk : colors.bg,
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text variant="label">{item.name}</Text>
              <Text variant="caption" tone="muted">
                {rowSubtitle(item)}
              </Text>
            </View>
            {added ? (
              <Text variant="caption" tone="muted">
                Added
              </Text>
            ) : null}
          </View>
        </Pressable>
        );
      }}
    />
  );
}

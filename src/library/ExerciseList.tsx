import { FlatList, Pressable, View, type FlatListProps } from "react-native";

import { Text } from "@/components";
import { minTouch, opacity, spacing, useColors } from "@/theme";
import type { ExerciseSummary } from "./filterExercises";
import { rowSubtitle } from "./rowSubtitle";

export interface ExerciseListProps<T extends ExerciseSummary = ExerciseSummary> {
  /** Already filtered and ordered; the list only displays them. */
  exercises: T[];
  /** What happens when a row is tapped. */
  onSelect: (exercise: T) => void;
  /** Ids shown as "Added" and not tappable (the routine picker). Omitted in the Library. */
  disabledIds?: ReadonlySet<number>;
  /** Rendered above the rows; scrolls with the list. */
  ListHeaderComponent?: FlatListProps<T>["ListHeaderComponent"];
  /** Shown when `exercises` is empty. */
  ListEmptyComponent?: FlatListProps<T>["ListEmptyComponent"];
}

/** Reusable virtualised exercise list: name plus a muted line of muscle groups per row. */
export function ExerciseList<T extends ExerciseSummary = ExerciseSummary>({
  exercises,
  onSelect,
  disabledIds,
  ListHeaderComponent,
  ListEmptyComponent,
}: ExerciseListProps<T>) {
  const colors = useColors();
  return (
    <FlatList
      data={exercises}
      keyExtractor={(exercise) => String(exercise.id)}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={{ paddingBottom: spacing.xxl * 3 }}
      extraData={disabledIds}
      renderItem={({ item }) => {
        const added = disabledIds?.has(item.id) ?? false;
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

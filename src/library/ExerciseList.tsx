import { FlatList, Pressable, View, type FlatListProps } from "react-native";

import { Text } from "@/components";
import { minTouch, spacing, useColors } from "@/theme";
import type { ExerciseSummary } from "./filterExercises";
import { rowSubtitle } from "./rowSubtitle";

export interface ExerciseListProps<T extends ExerciseSummary = ExerciseSummary> {
  /** Already filtered and ordered; the list only displays them. */
  exercises: T[];
  /** What happens when a row is tapped. */
  onSelect: (exercise: T) => void;
  /** Rendered above the rows; scrolls with the list. */
  ListHeaderComponent?: FlatListProps<T>["ListHeaderComponent"];
  /** Shown when `exercises` is empty. */
  ListEmptyComponent?: FlatListProps<T>["ListEmptyComponent"];
}

/** Reusable virtualised exercise list: name plus a muted line of muscle groups per row. */
export function ExerciseList<T extends ExerciseSummary = ExerciseSummary>({
  exercises,
  onSelect,
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
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelect(item)}
          style={({ pressed }) => ({
            minHeight: minTouch,
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
            backgroundColor: pressed ? colors.sunk : colors.bg,
          })}
        >
          <View style={{ gap: spacing.xs }}>
            <Text variant="label">{item.name}</Text>
            <Text variant="caption" tone="muted">
              {rowSubtitle(item)}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

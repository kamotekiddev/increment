import { FlatList, Pressable, View, type FlatListProps } from "react-native";

import { Text } from "@/components";
import { minTouch, spacing, useColors } from "@/theme";
import { rowSubtitle } from "./rowSubtitle";

export interface ExerciseListItem {
  id: number;
  name: string;
  muscles: string[];
  equipment: string;
}

export interface ExerciseListProps<T extends ExerciseListItem = ExerciseListItem> {
  /** Already filtered and ordered; the list only displays them. */
  exercises: T[];
  /** What happens when a row is tapped. The Library opens the detail; Routines will add to the routine. */
  onSelect: (exercise: T) => void;
  /** Search box and chips go here (ticket 03); scrolls with the list. */
  ListHeaderComponent?: FlatListProps<T>["ListHeaderComponent"];
  /** Shown when `exercises` is empty. */
  ListEmptyComponent?: FlatListProps<T>["ListEmptyComponent"];
}

/** Reusable virtualised exercise list: name plus a muted "Muscle · Equipment" line per row. */
export function ExerciseList<T extends ExerciseListItem = ExerciseListItem>({
  exercises,
  onSelect,
  ListHeaderComponent,
  ListEmptyComponent,
}: ExerciseListProps<T>) {
  const colors = useColors();
  return (
    <FlatList
      data={exercises}
      keyExtractor={(e) => String(e.id)}
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

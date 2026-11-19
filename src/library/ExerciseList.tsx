import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { FlatList, Pressable, View, type FlatListProps } from "react-native";

import { Text } from "@/components";
import { ExerciseTile } from "@/routines/ExerciseTile";
import { fontFamily, fontSize, opacity, radius, size, spacing, useColors } from "@/theme";

import { routineCountLabel } from "./browseState";
import { exerciseMeta } from "./exerciseMeta";
import type { ExerciseSummary } from "./filterExercises";

export interface ExerciseListProps<T extends ExerciseSummary = ExerciseSummary> {
  /** Already filtered and ordered; the list only displays them. */
  exercises: T[];
  /** What happens when a row is tapped. */
  onSelect: (exercise: T) => void;
  /** Ids shown as "Added" and not tappable (the routine picker). Omitted in the Library. */
  disabledIds?: ReadonlySet<number>;
  /** How many routines each exercise is in: a Library row shows "2 routines", or a chevron when none. */
  routineCounts?: ReadonlyMap<number, number>;
  /** The routine picker look: rows grouped in one white card, with an equipment icon and a plus or Added marker. */
  picker?: boolean;
  /** Rendered above the rows; scrolls with the list. */
  ListHeaderComponent?: FlatListProps<T>["ListHeaderComponent"];
  /** Shown when `exercises` is empty. */
  ListEmptyComponent?: FlatListProps<T>["ListEmptyComponent"];
  /** Extra space under the last row, for a fixed action bar. */
  bottomInset?: number;
}

/** Reusable virtualised exercise list: equipment tile, name, and a muted "Chest · Barbell" line per row. */
export function ExerciseList<T extends ExerciseSummary = ExerciseSummary>({
  exercises,
  onSelect,
  disabledIds,
  routineCounts,
  picker = false,
  ListHeaderComponent,
  ListEmptyComponent,
  bottomInset = spacing.xxl * 3,
}: ExerciseListProps<T>) {
  const colors = useColors();
  // One stable value, so the list re-renders rows only when either marker set changes.
  const extraData = useMemo(() => [disabledIds, routineCounts], [disabledIds, routineCounts]);
  return (
    <FlatList
      data={exercises}
      keyExtractor={(exercise) => String(exercise.id)}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={{ paddingBottom: bottomInset }}
      extraData={extraData}
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
        const routines = routineCounts?.get(item.id) ?? 0;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: added }}
            disabled={added}
            onPress={() => onSelect(item)}
            style={({ pressed }) => ({
              height: size.libraryRow,
              marginHorizontal: spacing.xl,
              marginBottom: spacing.sm,
              paddingLeft: spacing.md,
              paddingRight: spacing.lg,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              borderRadius: radius.row,
              backgroundColor: colors.card,
              opacity: added ? opacity.disabled : pressed ? opacity.pressed : 1,
            })}
          >
            <ExerciseTile equipment={item.equipment ?? ""} large />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="label" numberOfLines={1} style={{ fontSize: fontSize.body }}>
                {item.name}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: fontSize.small }}>
                {exerciseMeta({ muscles: item.muscles, equipment: item.equipment ?? "" })}
              </Text>
            </View>
            {added ? (
              <Text variant="caption" tone="muted">
                Added
              </Text>
            ) : routines > 0 ? (
              <View
                style={{
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: colors.line,
                }}
              >
                <Text variant="caption" tone="soft" style={{ fontFamily: fontFamily.medium }}>
                  {routineCountLabel(routines)}
                </Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.iconFaint} />
            )}
          </Pressable>
        );
      }}
    />
  );
}

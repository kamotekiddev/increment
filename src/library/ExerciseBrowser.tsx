import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { Button, Input, Text } from "@/components";
import { minTouch, spacing, useColors } from "@/theme";

import { emptyMessage, NO_FILTERS, toggleChip } from "./browseState";
import { ChipRow } from "./ChipRow";
import { ExerciseList } from "./ExerciseList";
import { filterExercises, type ExerciseFilter, type ExerciseSummary } from "./filterExercises";
import { MUSCLE_GROUPS } from "./muscleGroups";

export interface ExerciseBrowserProps {
  exercises: ExerciseSummary[];
  /** What happens when a row is tapped. */
  onSelect: (exercise: ExerciseSummary) => void;
}

/** Search box, muscle group chips, the A-Z list and the no-match state with Clear filters. */
export function ExerciseBrowser({ exercises, onSelect }: ExerciseBrowserProps) {
  const colors = useColors();
  const [filter, setFilter] = useState<ExerciseFilter>(NO_FILTERS);

  const visible = useMemo(() => filterExercises(exercises, filter), [exercises, filter]);

  const header = (
    <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
      <View style={{ paddingHorizontal: spacing.xl, justifyContent: "center" }}>
        <Input
          value={filter.search}
          onChangeText={(search) => setFilter({ ...filter, search })}
          placeholder="Search exercises"
          accessibilityLabel="Search exercises"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={{ paddingRight: minTouch }}
        />
        {filter.search.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setFilter({ ...filter, search: "" })}
            style={{
              position: "absolute",
              right: spacing.xl,
              width: minTouch,
              height: minTouch,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close-circle" size={20} color={colors.iconFaint} />
          </Pressable>
        ) : null}
      </View>
      <ChipRow
        label="Muscle group"
        options={MUSCLE_GROUPS}
        active={filter.group}
        onToggle={(group) => setFilter({ ...filter, group: toggleChip(filter.group, group) })}
      />
    </View>
  );

  const empty =
    exercises.length === 0 ? undefined : (
      <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.lg }}>
        <Text variant="body" tone="muted">
          {emptyMessage(filter)}
        </Text>
        <Button label="Clear filters" variant="secondary" onPress={() => setFilter(NO_FILTERS)} />
      </View>
    );

  return (
    <ExerciseList
      exercises={visible}
      onSelect={onSelect}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
    />
  );
}

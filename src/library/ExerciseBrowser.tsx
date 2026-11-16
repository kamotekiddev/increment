import { useMemo, useState } from "react";
import { View } from "react-native";

import { Button, Input, Text } from "@/components";
import { spacing } from "@/theme";

import { emptyMessage, NO_FILTERS, toggleChip } from "./browseState";
import { ChipRow } from "./ChipRow";
import { ExerciseList } from "./ExerciseList";
import {
  filterExercises,
  getFilterOptions,
  type ExerciseFilter,
  type ExerciseSummary,
} from "./filterExercises";

export interface ExerciseBrowserProps {
  exercises: ExerciseSummary[];
  /** What happens when a row is tapped. */
  onSelect: (exercise: ExerciseSummary) => void;
}

/** Search box, muscle and equipment chips, the A-Z list and the no-match state with Clear filters. */
export function ExerciseBrowser({ exercises, onSelect }: ExerciseBrowserProps) {
  const [filter, setFilter] = useState<ExerciseFilter>(NO_FILTERS);

  const options = useMemo(() => getFilterOptions(exercises), [exercises]);
  const visible = useMemo(() => filterExercises(exercises, filter), [exercises, filter]);

  const header = (
    <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <Input
          value={filter.search}
          onChangeText={(search) => setFilter({ ...filter, search })}
          placeholder="Search exercises"
          accessibilityLabel="Search exercises"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>
      <ChipRow
        label="Muscle"
        options={options.muscles}
        active={filter.muscle}
        onToggle={(muscle) => setFilter({ ...filter, muscle: toggleChip(filter.muscle, muscle) })}
      />
      <ChipRow
        label="Equipment"
        options={options.equipment}
        active={filter.equipment}
        onToggle={(equipment) =>
          setFilter({ ...filter, equipment: toggleChip(filter.equipment, equipment) })
        }
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

import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { Button, Input, Text } from "@/components";
import { db } from "@/db/client";
import { exercises } from "@/db/schema";
import { emptyMessage, toggleChip } from "@/library/browseState";
import { ChipRow } from "@/library/ChipRow";
import { ExerciseList, type ExerciseListItem } from "@/library/ExerciseList";
import { filterExercises, getFilterOptions } from "@/library/filterExercises";
import { spacing, useColors } from "@/theme";

// The tab stays mounted under the pushed detail route, so plain state keeps the
// search text and chips while the lifter is on an exercise.
export default function LibraryScreen() {
  const colors = useColors();
  const [items, setItems] = useState<ExerciseListItem[]>([]);
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);

  useEffect(() => {
    db.select({
      id: exercises.id,
      name: exercises.name,
      muscles: exercises.muscles,
      equipment: exercises.equipment,
    })
      .from(exercises)
      .then(setItems);
  }, []);

  const options = useMemo(() => getFilterOptions(items), [items]);
  const filters = useMemo(
    () => ({ search, muscle, equipment }),
    [search, muscle, equipment],
  );
  const visible = useMemo(
    () => filterExercises(items, filters),
    [items, filters],
  );

  const clearFilters = () => {
    setSearch("");
    setMuscle(null);
    setEquipment(null);
  };

  const header = (
    <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <Input
          value={search}
          onChangeText={setSearch}
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
        active={muscle}
        onToggle={(m) => setMuscle(toggleChip(muscle, m))}
      />
      <ChipRow
        label="Equipment"
        options={options.equipment}
        active={equipment}
        onToggle={(e) => setEquipment(toggleChip(equipment, e))}
      />
    </View>
  );

  const empty =
    items.length === 0 ? undefined : (
      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <Text variant="body" tone="muted">
          {emptyMessage(filters)}
        </Text>
        <Button
          label="Clear filters"
          variant="secondary"
          onPress={clearFilters}
        />
      </View>
    );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: spacing.xxl * 2,
      }}
    >
      <Text
        variant="heading"
        style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}
      >
        Library
      </Text>
      <ExerciseList
        exercises={visible}
        onSelect={(exercise) =>
          router.push({
            pathname: "/exercise/[id]",
            params: { id: String(exercise.id) },
          })
        }
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
      />
    </View>
  );
}

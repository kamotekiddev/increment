import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Button, Text } from "@/components";
import { fontFamily, fontSize, minTouch, radius, size, spacing, useColors } from "@/theme";

import { emptyMessage, isFiltering, NO_FILTERS, resultCount, toggleChip } from "./browseState";
import { ChipRow } from "./ChipRow";
import { ExerciseList } from "./ExerciseList";
import { filterExercises, type ExerciseFilter, type ExerciseSummary } from "./filterExercises";
import { MUSCLE_GROUPS } from "./muscleGroups";

export interface ExerciseBrowserProps<T extends ExerciseSummary = ExerciseSummary> {
  exercises: T[];
  /** What happens when a row is tapped. */
  onSelect: (exercise: T) => void;
  /** Ids shown as "Added" and not tappable (the routine picker). */
  disabledIds?: ReadonlySet<number>;
  /** How many routines each exercise is in (the Library's trailing pill). */
  routineCounts?: ReadonlyMap<number, number>;
  /** The routine picker look (see `ExerciseList`): a slimmer search box and no result count. */
  picker?: boolean;
  /** Extra space under the last row, for a fixed action bar. */
  bottomInset?: number;
}

/** Search box, muscle group chips, the A-Z list and the no-match card with Clear filters. */
export function ExerciseBrowser<T extends ExerciseSummary = ExerciseSummary>({
  exercises,
  onSelect,
  disabledIds,
  routineCounts,
  picker = false,
  bottomInset,
}: ExerciseBrowserProps<T>) {
  const colors = useColors();
  const [filter, setFilter] = useState<ExerciseFilter>(NO_FILTERS);

  const visible = useMemo(() => filterExercises(exercises, filter), [exercises, filter]);
  const showCount = !picker && isFiltering(filter) && visible.length > 0;

  const header = (
    <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
      <SearchField
        value={filter.search}
        onChange={(search) => setFilter({ ...filter, search })}
        compact={picker}
      />
      <ChipRow
        label="Muscle group"
        options={MUSCLE_GROUPS}
        active={filter.group}
        onToggle={(group) => setFilter({ ...filter, group: toggleChip(filter.group, group) })}
        onClear={() => setFilter({ ...filter, group: null })}
      />
      {showCount ? (
        <Text variant="caption" tone="muted" style={{ paddingHorizontal: spacing.xl, fontSize: fontSize.small, fontFamily: fontFamily.medium }}>
          {resultCount(visible.length)}
        </Text>
      ) : null}
    </View>
  );

  const empty =
    exercises.length === 0 ? undefined : (
      <View
        style={{
          marginHorizontal: spacing.xl,
          paddingTop: spacing.xl,
          paddingBottom: spacing.xl,
          paddingHorizontal: spacing.xl,
          gap: spacing.md,
          alignItems: "center",
          borderRadius: radius.card,
          backgroundColor: colors.card,
        }}
      >
        <View
          style={{
            width: size.emptyIcon,
            height: size.emptyIcon,
            borderRadius: radius.inset,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.accentTint,
          }}
        >
          <Ionicons name="search" size={28} color={colors.accent} />
        </View>
        <Text variant="title" style={{ fontFamily: fontFamily.semibold, textAlign: "center" }}>
          {emptyMessage(filter)}
        </Text>
        <Text tone="muted" style={{ fontSize: fontSize.label, textAlign: "center" }}>
          Check the spelling, or clear the filters.
        </Text>
        <Button label="Clear filters" variant="outlined" stretch onPress={() => setFilter(NO_FILTERS)} />
      </View>
    );

  return (
    <ExerciseList
      exercises={visible}
      onSelect={onSelect}
      disabledIds={disabledIds}
      routineCounts={routineCounts}
      picker={picker}
      bottomInset={bottomInset}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
    />
  );
}

/** The white pill search box with a search icon, an accent ring while focused, and a clear button. */
function SearchField({ value, onChange, compact }: { value: string; onChange: (text: string) => void; compact: boolean }) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  const height = compact ? size.searchCompact : size.search;
  return (
    <View
      style={{
        marginHorizontal: spacing.xl,
        height,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingLeft: spacing.lg,
        paddingRight: value.length > 0 ? spacing.xs : spacing.lg,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: focused ? colors.accent : "transparent",
        backgroundColor: colors.card,
      }}
    >
      <Ionicons name="search" size={20} color={colors.inkMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search exercises"
        placeholderTextColor={colors.inkMuted}
        accessibilityLabel="Search exercises"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={{
          flex: 1,
          alignSelf: "stretch",
          color: colors.ink,
          fontFamily: fontFamily.medium,
          fontSize: compact ? fontSize.body : fontSize.lead,
        }}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChange("")}
          style={{ width: minTouch, height: minTouch, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="close-circle" size={20} color={colors.iconFaint} />
        </Pressable>
      ) : null}
    </View>
  );
}

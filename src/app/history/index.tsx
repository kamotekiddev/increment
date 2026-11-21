import { router } from "expo-router";
import { SectionList, View } from "react-native";

import { RoundButton, Text } from "@/components";
import { HistoryEmpty } from "@/history/HistoryEmpty";
import { HistoryListRow } from "@/history/HistoryListRow";
import { useWorkoutHistory } from "@/history/useWorkoutHistory";
import { ScreenHeader } from "@/routines/ScreenHeader";
import { fontSize, spacing, useColors } from "@/theme";

/** Every finished Workout, newest first, under month titles. Read-only; rows open nothing yet. */
export default function HistoryScreen() {
  const colors = useColors();
  const sections = useWorkoutHistory();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SectionList
        sections={sections ?? []}
        keyExtractor={(row) => String(row.workoutId)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
        ListHeaderComponent={
          <ScreenHeader left={<RoundButton icon="chevron-back" label="Back" onPress={() => router.back()} />} title="History" />
        }
        ListEmptyComponent={sections === undefined ? undefined : <HistoryEmpty />}
        renderSectionHeader={({ section }) => (
          <Text
            variant="label"
            tone="muted"
            accessibilityRole="header"
            style={{
              marginTop: spacing.xl,
              marginBottom: spacing.md,
              marginHorizontal: spacing.xl + spacing.xs,
              fontSize: fontSize.small,
              lineHeight: 18,
            }}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item, index, section }) => (
          <HistoryListRow row={item} first={index === 0} last={index === section.data.length - 1} />
        )}
      />
    </View>
  );
}

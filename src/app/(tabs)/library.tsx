import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RoundButton, Text } from "@/components";
import { newExerciseParams } from "@/library/createFlow";
import { ExerciseBrowser } from "@/library/ExerciseBrowser";
import { useExercises, useRoutineCounts } from "@/library/exerciseQueries";
import { spacing, textStyle, useColors } from "@/theme";

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const exercises = useExercises();
  const routineCounts = useRoutineCounts();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing.xl }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.md,
        }}
      >
        <Text variant="heading" accessibilityRole="header" style={textStyle.screenTitle}>
          Library
        </Text>
        <RoundButton icon="add" label="Create custom exercise" filled onPress={() => router.push("/exercise/new")} />
      </View>
      <ExerciseBrowser
        exercises={exercises}
        routineCounts={routineCounts}
        onCreate={(name) => router.push({ pathname: "/exercise/new", params: newExerciseParams(name) })}
        onSelect={(exercise) =>
          router.push({ pathname: "/exercise/[id]", params: { id: String(exercise.id) } })
        }
      />
    </View>
  );
}

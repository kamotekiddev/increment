import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components";
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
      <Text
        variant="heading"
        accessibilityRole="header"
        style={[textStyle.screenTitle, { paddingHorizontal: spacing.xl, paddingBottom: spacing.md }]}
      >
        Library
      </Text>
      <ExerciseBrowser
        exercises={exercises}
        routineCounts={routineCounts}
        onSelect={(exercise) =>
          router.push({ pathname: "/exercise/[id]", params: { id: String(exercise.id) } })
        }
      />
    </View>
  );
}

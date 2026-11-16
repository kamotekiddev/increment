import { router } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components";
import { ExerciseBrowser } from "@/library/ExerciseBrowser";
import { useExercises } from "@/library/exerciseQueries";
import { spacing, useColors } from "@/theme";

export default function LibraryScreen() {
  const colors = useColors();
  const exercises = useExercises();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: spacing.xxl * 2 }}>
      <Text variant="heading" style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
        Library
      </Text>
      <ExerciseBrowser
        exercises={exercises}
        onSelect={(exercise) =>
          router.push({ pathname: "/exercise/[id]", params: { id: String(exercise.id) } })
        }
      />
    </View>
  );
}

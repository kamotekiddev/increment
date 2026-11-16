import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Text } from "@/components";
import { db } from "@/db/client";
import { exercises } from "@/db/schema";
import { ExerciseList, type ExerciseListItem } from "@/library/ExerciseList";
import { spacing, useColors } from "@/theme";

export default function LibraryScreen() {
  const colors = useColors();
  const [items, setItems] = useState<ExerciseListItem[]>([]);

  useEffect(() => {
    db.select({ id: exercises.id, name: exercises.name, muscles: exercises.muscles, equipment: exercises.equipment })
      .from(exercises)
      .then((rows) => setItems([...rows].sort((a, b) => a.name.localeCompare(b.name))));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: spacing.xxl * 2 }}>
      <Text variant="heading" style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
        Library
      </Text>
      <ExerciseList
        exercises={items}
        onSelect={(exercise) => router.push({ pathname: "/exercise/[id]", params: { id: String(exercise.id) } })}
      />
    </View>
  );
}

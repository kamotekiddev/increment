import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components";
import { ExercisePicker } from "@/progress/ExercisePicker";
import { ProNoticeSheet } from "@/progress/ProNoticeSheet";
import { ProgressHero } from "@/progress/ProgressHero";
import { RecordsCard } from "@/progress/RecordsCard";
import { useExerciseProgress } from "@/progress/useExerciseProgress";
import { fontSize, minTouch, opacity, radius, size, spacing, textStyle, useColors } from "@/theme";

/** The Progress tab: the exercise pill, its hero card and its Records card. The picker and empty states come later. */
export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const progress = useExerciseProgress();
  const [proNotice, setProNotice] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xxl * 4,
          gap: spacing.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text variant="heading" accessibilityRole="header" style={textStyle.screenTitle}>
            Progress
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/history")}
            hitSlop={(minTouch - size.chip) / 2}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              height: size.chip,
              paddingHorizontal: 14,
              borderRadius: radius.pill,
              backgroundColor: colors.card,
              opacity: pressed ? opacity.pressed : 1,
            })}
          >
            <MaterialCommunityIcons name="history" size={16} color={colors.ink} />
            <Text variant="label" style={{ fontSize: fontSize.small }}>
              History
            </Text>
          </Pressable>
        </View>
        {progress ? (
          <>
            <ExercisePicker exerciseId={progress.exerciseId} name={progress.name} equipment={progress.equipment} />
            {progress.hero ? <ProgressHero hero={progress.hero} onProPress={() => setProNotice(true)} /> : null}
            {progress.records ? <RecordsCard exerciseName={progress.name} rows={progress.records} onProPress={() => setProNotice(true)} /> : null}
          </>
        ) : progress === null ? (
          <Text tone="muted">No workouts yet.</Text>
        ) : null}
      </ScrollView>
      <ProNoticeSheet visible={proNotice} onDismiss={() => setProNotice(false)} />
    </View>
  );
}

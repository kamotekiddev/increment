import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, radius, spacing, useColors } from "@/theme";

export type ExerciseTab = "how-to" | "history";

const TABS: { key: ExerciseTab; label: string }[] = [
  { key: "how-to", label: "How to" },
  { key: "history", label: "History" },
];

/**
 * The How to / History switch of Exercise detail. Each tab is its own screen, and switching replaces the route,
 * so Back always leaves for the Library in one press.
 */
export function ExerciseTabs({ active, exerciseId }: { active: ExerciseTab; exerciseId: number }) {
  const colors = useColors();
  const open = (tab: ExerciseTab) => {
    if (tab === active) return;
    const params = { id: String(exerciseId) };
    router.replace(tab === "history" ? { pathname: "/exercise/[id]/history", params } : { pathname: "/exercise/[id]", params });
  };
  return (
    <View
      accessibilityRole="tablist"
      style={{ flexDirection: "row", backgroundColor: colors.sunk, borderRadius: radius.lg, padding: spacing.xs, gap: spacing.xs }}
    >
      {TABS.map(({ key, label }) => {
        const selected = key === active;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => open(key)}
            style={{
              flex: 1,
              height: 40,
              borderRadius: radius.inset,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected ? colors.card : "transparent",
            }}
          >
            <Text
              variant="label"
              tone={selected ? "ink" : "muted"}
              style={{ fontSize: fontSize.label, fontFamily: selected ? fontFamily.semibold : fontFamily.medium }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

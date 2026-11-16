import { TabList, TabSlot, TabTrigger, Tabs } from "expo-router/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabButton } from "@/components/TabButton";
import { radius, spacing, useColors } from "@/theme";

export default function TabsLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Tabs>
      <TabSlot />
      <TabList
        style={{
          position: "absolute",
          bottom: Math.max(insets.bottom, spacing.lg),
          left: spacing.xl,
          right: spacing.xl,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          padding: spacing.sm,
          borderRadius: radius.pill,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.line,
          shadowColor: colors.ink,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon="calendar-outline" label="Today" />
        </TabTrigger>
        <TabTrigger name="routines" href="/routines" asChild>
          <TabButton icon="albums-outline" label="Routines" />
        </TabTrigger>
        <TabTrigger name="library" href="/library" asChild>
          <TabButton icon="barbell-outline" label="Library" />
        </TabTrigger>
        <TabTrigger name="progress" href="/progress" asChild>
          <TabButton icon="stats-chart-outline" label="Progress" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

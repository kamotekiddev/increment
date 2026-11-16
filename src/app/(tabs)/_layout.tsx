import { router } from "expo-router";
import { TabList, TabSlot, TabTrigger, Tabs } from "expo-router/ui";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabButton } from "@/components/TabButton";
import { minTouch, radius, spacing, useColors } from "@/theme";
import { InProgressBar } from "@/workout/InProgressBar";
import { useInProgressOnFocus, useNow } from "@/workout/inProgressQueries";

/** Tab list height before it is measured: a tab button plus its padding and 1 pt border either side. */
const TAB_LIST_HEIGHT = minTouch + spacing.sm * 2 + 2;

export default function TabsLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const workout = useInProgressOnFocus();
  const now = useNow(workout !== null);
  const tabBottom = Math.max(insets.bottom, spacing.lg);
  const [tabHeight, setTabHeight] = useState(TAB_LIST_HEIGHT);
  return (
    <Tabs>
      <TabSlot />
      {workout ? (
        <View
          style={{
            position: "absolute",
            bottom: tabBottom + tabHeight + spacing.sm,
            left: spacing.xl,
            right: spacing.xl,
          }}
        >
          <InProgressBar
            workout={workout}
            now={now}
            onPress={() => router.push({ pathname: "/workout/[id]", params: { id: String(workout.id) } })}
          />
        </View>
      ) : null}
      <TabList
        onLayout={(e) => setTabHeight(e.nativeEvent.layout.height)}
        style={{
          position: "absolute",
          bottom: tabBottom,
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

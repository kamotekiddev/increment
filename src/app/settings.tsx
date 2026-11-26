import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { RoundButton, ScreenHeader } from "@/components";
import { DeveloperCard } from "@/settings/DeveloperCard";
import { ProCard } from "@/settings/ProCard";
import { ReminderCard } from "@/settings/ReminderCard";
import { UnitCard } from "@/settings/UnitCard";
import { WorkoutCard } from "@/settings/WorkoutCard";
import { YourDataRow } from "@/settings/YourDataRow";
import { spacing, useColors } from "@/theme";

export default function SettingsScreen() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader left={<RoundButton icon="chevron-back" label="Back" onPress={() => router.back()} />} title="Settings" />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <ProCard />
        <UnitCard />
        <WorkoutCard />
        <ReminderCard />
        <YourDataRow />
        {__DEV__ ? <DeveloperCard /> : null}
      </ScrollView>
    </View>
  );
}

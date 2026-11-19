import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Card, RoundButton, Text } from "@/components";
import { ScreenHeader } from "@/routines/ScreenHeader";
import { JUMP_KEYS, useJumps, useUnit, type JumpKey } from "@/settings";
import { JumpRow } from "@/settings/JumpRow";
import { fontSize, radius, spacing, useColors } from "@/theme";

const ROWS: Record<JumpKey, { name: string; example: string }> = {
  barbell: { name: "Barbell", example: "Bench press, squat" },
  dumbbell: { name: "Dumbbell", example: "Lateral raise, curl" },
  machine: { name: "Machine", example: "Leg press, chest press" },
  cable: { name: "Cable", example: "Pushdown, cable row" },
  bodyweight: { name: "Bodyweight, added weight", example: "Weighted pull-ups, dips" },
};

/** Weight jumps: the smallest weight a lifter can add, one per equipment. A change saves at once. */
export default function WeightJumpsScreen() {
  const colors = useColors();
  const { unit } = useUnit();
  const { jumps, setJump } = useJumps();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader left={<RoundButton icon="chevron-back" label="Back" onPress={() => router.back()} />} title="Weight jumps" />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md, gap: spacing.md + 2 }}>
        <Text tone="muted" style={{ fontSize: fontSize.body, lineHeight: 21, paddingHorizontal: spacing.xs }}>
          How much Increment adds when you’re ready to go up. Each exercise uses its equipment’s jump.
        </Text>
        <Card style={{ borderRadius: radius.card, paddingVertical: 0, paddingLeft: spacing.md + 2, paddingRight: spacing.md }}>
          {JUMP_KEYS.map((key, i) => (
            <JumpRow
              key={key}
              jump={key}
              name={ROWS[key].name}
              example={ROWS[key].example}
              kg={jumps[key]}
              unit={unit}
              onChange={(kg) => setJump(key, kg)}
              first={i === 0}
            />
          ))}
        </Card>
        <View
          style={{
            flexDirection: "row",
            gap: spacing.md - 2,
            alignItems: "flex-start",
            backgroundColor: colors.accentTint,
            borderRadius: radius.md + 2,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md + 2,
          }}
        >
          <Ionicons name="information-circle-outline" size={17} color={colors.accent} style={{ marginTop: 1 }} />
          <Text tone="soft" style={{ flex: 1, fontSize: fontSize.small, lineHeight: 19 }}>
            Switch to lb in Settings and the jumps switch too.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

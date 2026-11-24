import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { Text } from "@/components";
import { radius, size, spacing, useColors } from "@/theme";

import { ExercisePreviewCard } from "./ExercisePreviewCard";
import type { NextPreview } from "./nextPreview";
import type { TodayState } from "./todayState";
import { restBannerText } from "./todayText";

type Rest = Extract<TodayState, { kind: "rest" }>;

/** The rest-day body: the Recover banner, the Next row and a card of the Next Routine's first exercises. */
export function RestDay({ state, preview }: { state: Rest; preview: NextPreview | undefined }) {
  const colors = useColors();
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.lg,
          padding: spacing.xl,
          borderRadius: radius.card,
          backgroundColor: colors.accentTint,
        }}
      >
        <View
          style={{
            width: size.bannerCircle,
            height: size.bannerCircle,
            borderRadius: radius.pill,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.accent,
          }}
        >
          <Ionicons name="moon" size={size.icon} color={colors.onAccent} />
        </View>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="title">Recover today</Text>
          <Text tone="soft">{restBannerText(state.week.planned, state.week.done)}</Text>
        </View>
      </View>

      {state.next ? (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md }}>
            <Text variant="title" numberOfLines={1} style={{ flex: 1 }}>
              {`Next: ${state.next.routineName}`}
            </Text>
            <Text tone="muted">{state.next.weekday}</Text>
          </View>

          <ExercisePreviewCard preview={preview} />
        </>
      ) : null}
    </>
  );
}

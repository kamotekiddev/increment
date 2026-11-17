import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

import { Text } from "@/components";
import { equipmentIcon } from "@/library/exerciseMeta";
import { fontFamily, radius, size, spacing, useColors } from "@/theme";

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

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md }}>
        <Text variant="title" numberOfLines={1} style={{ flex: 1 }}>
          {`Next: ${state.next.routineName}`}
        </Text>
        <Text tone="muted">{state.next.weekday}</Text>
      </View>

      <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.card, backgroundColor: colors.card }}>
        {preview === undefined ? null : preview.rows.length === 0 ? (
          <Text tone="muted">No exercises yet</Text>
        ) : (
          <>
            {preview.rows.map((row, i) => (
              <View key={`${i}-${row.name}`} style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <View
                  style={{
                    width: size.smallTile,
                    height: size.smallTile,
                    borderRadius: radius.sm,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.accentTint,
                  }}
                >
                  <MaterialCommunityIcons name={equipmentIcon(row.equipment)} size={size.icon} color={colors.accent} />
                </View>
                <Text variant="label" numberOfLines={1} style={{ flex: 1 }}>
                  {row.name}
                </Text>
                <Text tone="muted" style={{ fontFamily: fontFamily.semibold }}>
                  {row.targetText}
                </Text>
              </View>
            ))}
            {preview.more > 0 ? <Text tone="muted">{`+ ${preview.more} more`}</Text> : null}
          </>
        )}
      </View>
    </>
  );
}

import { View } from "react-native";
import { useStore } from "zustand";

import { Card, Text } from "@/components";
import { proStore } from "@/pro";
import { fontFamily, fontSize, lineHeight, radius, spacing } from "@/theme";

import { PRO_SOURCE_OPTIONS } from "./proSettings";
import { Segmented } from "./Segmented";

/**
 * The Developer card, last in Settings and drawn only on dev builds. "Pro source" picks where `isPro` comes
 * from: the store's answer, or forced Pro or Free. It sets the Pro store's dev source in memory only, so it
 * resets to Store on every launch and never writes the database. A switch to Pro shows Pro unlocked through
 * the Pro store's usual "switched on" event.
 */
export function DeveloperCard() {
  const source = useStore(proStore, (s) => s.source);
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.snug }}>
        Developer
      </Text>
      <Card style={{ borderRadius: radius.card, gap: spacing.md - 2 }}>
        <Text style={{ fontSize: fontSize.body, fontFamily: fontFamily.medium }}>Pro source</Text>
        <Segmented
          options={PRO_SOURCE_OPTIONS}
          value={source}
          onChange={(next) => proStore.getState().setSource(next)}
          size="wide"
          track="sunk"
          accessibilityLabel="Pro source"
        />
        <Text variant="caption" tone="muted" style={{ lineHeight: lineHeight.detail }}>
          Dev builds only. Resets to Store on every launch and saves nothing.
        </Text>
      </Card>
    </View>
  );
}

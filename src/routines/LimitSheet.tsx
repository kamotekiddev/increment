import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { View } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { PAYWALL_PATH } from "@/pro/proRoutes";
import { fontSize, radius, size, spacing, useColors } from "@/theme";

import { LimitMeter } from "./LimitMeter";
import { LIMIT_SHEET_BENEFITS, LIMIT_SHEET_BODY, limitSheetTitle } from "./limitSheetText";
import { FREE_ROUTINE_LIMIT } from "./routineLimit";

/** How long the sheet gets to slide away before the Paywall opens, so the two never overlap. */
const SHEET_CLOSE_MS = 350;

export interface LimitSheetProps {
  visible: boolean;
  onDismiss: () => void;
  /** Where the lifter lands after buying. Omit when the sheet is already on that screen. */
  backTo?: "/(tabs)/routines";
}

/**
 * The free routine limit pop-up. It pitches Pro: See Pro closes it and opens the Paywall, Not now just closes it.
 * Nothing is remembered: after buying, the lifter is back on `backTo` (or where they were) and taps + again.
 */
export function LimitSheet({ visible, onDismiss, backTo }: LimitSheetProps) {
  const colors = useColors();

  function seePro() {
    onDismiss();
    setTimeout(() => {
      if (backTo) router.dismissTo(backTo);
      router.push(PAYWALL_PATH);
    }, SHEET_CLOSE_MS);
  }

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={{ alignItems: "center", gap: spacing.md, paddingTop: spacing.md }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.row,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.accentTint,
          }}
        >
          <Ionicons name="lock-closed-outline" size={30} color={colors.accent} />
        </View>
        <Text variant="title" style={{ fontSize: fontSize.titleLg, textAlign: "center" }}>
          {limitSheetTitle()}
        </Text>
        <Text tone="muted" style={{ textAlign: "center" }}>
          {LIMIT_SHEET_BODY}
        </Text>
        <View style={{ width: 110, paddingVertical: spacing.xs }}>
          <LimitMeter used={FREE_ROUTINE_LIMIT} total={FREE_ROUTINE_LIMIT} height={6} gap={5} />
        </View>
      </View>
      <View style={{ gap: 10, padding: spacing.lg, borderRadius: radius.inset, backgroundColor: colors.card }}>
        {LIMIT_SHEET_BENEFITS.map((benefit) => (
          <View key={benefit} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="checkmark" size={size.check} color={colors.accent} />
            <Text tone="soft" style={{ flex: 1, fontSize: fontSize.label }}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ gap: spacing.xs }}>
        <Button label="See Pro" large onPress={seePro} />
        <Button label="Not now" variant="secondary" large onPress={onDismiss} />
      </View>
    </BottomSheet>
  );
}

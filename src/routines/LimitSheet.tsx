import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { fontSize, radius, spacing, useColors } from "@/theme";

import { LimitMeter } from "./LimitMeter";
import { FREE_ROUTINE_LIMIT } from "./routineLimit";

export interface LimitSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

/** The free routine limit pop-up. No upgrade button until the paywall exists (Phase 3). */
export function LimitSheet({ visible, onDismiss }: LimitSheetProps) {
  const colors = useColors();
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
          You’ve used your {FREE_ROUTINE_LIMIT} free routines
        </Text>
        <Text tone="muted" style={{ textAlign: "center" }}>
          Delete one to make room for a new one.
        </Text>
        <View style={{ width: 110, paddingVertical: spacing.xs }}>
          <LimitMeter used={FREE_ROUTINE_LIMIT} total={FREE_ROUTINE_LIMIT} height={6} gap={5} />
        </View>
      </View>
      <Button label="Got it" large onPress={onDismiss} />
    </BottomSheet>
  );
}

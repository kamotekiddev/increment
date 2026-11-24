import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, View, type ViewStyle } from "react-native";

import { Text } from "@/components";
import { useIsPro } from "@/pro";
import { fontFamily, fontSize, opacity, pro, radius, size, spacing, useColors } from "@/theme";

import { proCardState } from "./proSettings";

/**
 * The Increment Pro card at the top of Settings. A free lifter sees "Unlock ›", which opens the Paywall;
 * a Pro lifter sees "Unlocked ✓", which can't be tapped. It reads the one Pro gate, so the dev source
 * moves it too.
 */
export function ProCard() {
  const colors = useColors();
  const isPro = useIsPro();
  const state = proCardState(isPro);

  const rowStyle: ViewStyle = {
    height: size.pickerRow,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.card,
  };

  const content = (
    <>
      <View
        style={{
          width: pro.cardIcon,
          height: pro.cardIcon,
          borderRadius: radius.pill,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="star-outline" size={pro.cardIconGlyph} color={colors.onAccent} />
      </View>
      <Text style={{ flex: 1, fontSize: fontSize.body, fontFamily: fontFamily.semibold }}>Increment Pro</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.snug }}>
        <Text
          style={{
            fontSize: fontSize.label,
            fontFamily: state.tappable ? fontFamily.semibold : fontFamily.medium,
            color: state.tappable ? colors.accent : colors.inkMuted,
          }}
        >
          {state.label}
        </Text>
        {state.trailing === "chevron" ? (
          <Ionicons name="chevron-forward" size={size.check} color={colors.iconFaint} />
        ) : (
          <Ionicons name="checkmark" size={size.check} color={colors.accent} />
        )}
      </View>
    </>
  );

  if (!state.tappable) {
    return (
      <View accessible accessibilityLabel={`Increment Pro, ${state.label}`} style={rowStyle}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Increment Pro, ${state.label}`}
      onPress={() => router.push("/paywall")}
      style={({ pressed }) => [rowStyle, { opacity: pressed ? opacity.pressed : 1 }]}
    >
      {content}
    </Pressable>
  );
}

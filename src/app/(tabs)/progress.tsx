import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components";
import { fontSize, minTouch, opacity, radius, size, spacing, textStyle, useColors } from "@/theme";

/** The Progress tab: only the title row and the History pill until charts and records arrive (features 5 and 6). */
export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.xl, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="heading" accessibilityRole="header" style={textStyle.screenTitle}>
          Progress
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/history")}
          hitSlop={(minTouch - size.chip) / 2}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            height: size.chip,
            paddingHorizontal: 14,
            borderRadius: radius.pill,
            backgroundColor: colors.card,
            opacity: pressed ? opacity.pressed : 1,
          })}
        >
          <MaterialCommunityIcons name="history" size={16} color={colors.ink} />
          <Text variant="label" style={{ fontSize: fontSize.small }}>
            History
          </Text>
        </Pressable>
      </View>
      <Text tone="muted">Your records will appear here.</Text>
    </View>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, opacity, pro, radius, size, spacing, useColors } from "@/theme";

/** The Your data row of Settings: opens the Your data screen (stats, Create backup). */
export function YourDataRow() {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Your data"
      onPress={() => router.push("/your-data")}
      style={({ pressed }) => ({
        height: size.pickerRow,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingLeft: spacing.md,
        paddingRight: spacing.lg,
        backgroundColor: colors.card,
        borderRadius: radius.card,
        opacity: pressed ? opacity.pressed : 1,
      })}
    >
      <View
        style={{
          width: pro.cardIcon,
          height: pro.cardIcon,
          borderRadius: radius.pill,
          backgroundColor: colors.sunk,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="server-outline" size={pro.cardIconGlyph} color={colors.ink} />
      </View>
      <Text style={{ flex: 1, fontSize: fontSize.body, fontFamily: fontFamily.semibold }}>Your data</Text>
      <Ionicons name="chevron-forward" size={size.check} color={colors.iconFaint} />
    </Pressable>
  );
}

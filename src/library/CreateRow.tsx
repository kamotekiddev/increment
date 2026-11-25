import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Pill, Text } from "@/components";
import { fontFamily, fontSize, opacity, radius, spacing, useColors } from "@/theme";

import { createRowLabel } from "./browseState";
import { useSaveButtonKind } from "./useSaveButtonKind";

/**
 * The no-match "Create “{search}”" row under the empty card. Opens for everyone; a free lifter sees the
 * grey Pro tag, because Save is Unlock Pro on the screen it opens.
 */
export function CreateRow({ name, onPress }: { name: string; onPress: () => void }) {
  const colors = useColors();
  const showProTag = useSaveButtonKind() === "unlock";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={createRowLabel(name)}
      onPress={onPress}
      style={({ pressed }) => ({
        marginHorizontal: spacing.xl,
        marginTop: spacing.md,
        padding: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        borderRadius: radius.card,
        backgroundColor: colors.accentTint,
        opacity: pressed ? opacity.pressed : 1,
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: radius.inset,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accent,
        }}
      >
        <Ionicons name="add" size={22} color={colors.onAccent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <Text variant="label" numberOfLines={1} style={{ flexShrink: 1, fontSize: fontSize.body, fontFamily: fontFamily.semibold }}>
            {createRowLabel(name)}
          </Text>
          {showProTag ? <Pill label="Pro" tone="neutral" /> : null}
        </View>
        <Text variant="caption" tone="soft">
          Add it as your own exercise
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.accent} />
    </Pressable>
  );
}

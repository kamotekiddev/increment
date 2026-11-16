import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { Button, Text } from "@/components";
import { fontSize, radius, size, spacing, useColors } from "@/theme";

/** The dashed "No exercises yet" card with its Add exercises button. */
export function EmptyExercises({ onAdd, disabled = false }: { onAdd: () => void; disabled?: boolean }) {
  const colors = useColors();
  return (
    <View
      style={{
        alignItems: "center",
        gap: 10,
        paddingVertical: 28,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.card,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: colors.lineStrong,
      }}
    >
      <View
        style={{
          width: 56,
          height: size.control,
          borderRadius: radius.inset,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accentTint,
        }}
      >
        <Ionicons name="barbell-outline" size={28} color={colors.accent} />
      </View>
      <Text variant="title" style={{ fontSize: fontSize.action, lineHeight: 22 }}>
        No exercises yet
      </Text>
      <Text tone="muted" style={{ fontSize: fontSize.meta, lineHeight: 19, textAlign: "center" }}>
        Pick from the library to build this routine.
      </Text>
      <View style={{ paddingTop: spacing.xs }}>
        <Button label="Add exercises" disabled={disabled} onPress={onAdd} />
      </View>
    </View>
  );
}

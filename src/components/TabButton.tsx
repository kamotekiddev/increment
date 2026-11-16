import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View, type PressableProps } from "react-native";

import { minTouch, spacing, useColors } from "@/theme";
import { Text } from "./Text";

type IconName = keyof typeof Ionicons.glyphMap;

/** TabTrigger (asChild) injects press handlers and `isFocused` at runtime. */
export interface TabButtonProps extends PressableProps {
  icon: IconName;
  label: string;
  isFocused?: boolean;
}

/** One tab in the floating bar. The active tab is an accent pill. */
export function TabButton({ icon, label, isFocused, ...props }: TabButtonProps) {
  const colors = useColors();
  return (
    <Pressable {...props} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: !!isFocused }}>
      <View
        style={{
          height: minTouch,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.xs,
          paddingHorizontal: isFocused ? spacing.lg : spacing.md,
          // Half the height, not 999: Android drew a huge radius as a square.
          borderRadius: minTouch / 2,
          overflow: "hidden",
          backgroundColor: isFocused ? colors.accent : "transparent",
        }}
      >
        <Ionicons name={icon} size={20} color={isFocused ? colors.onAccent : colors.iconFaint} />
        {isFocused ? (
          <Text variant="label" tone="onAccent">
            {label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

import { Button, Column, Host, Text } from "@expo/ui";
import { useState } from "react";
import { View } from "react-native";

import { fontFamily, fontSize, radius, spacing, useColors } from "@/theme";

/** Spike: can Expo UI match the design system (accent pill button, Sora text)? Replaced by the Today tab. */
export default function Spike() {
  const colors = useColors();
  const [taps, setTaps] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: spacing.xl }}>
      <Host matchContents>
        <Column spacing={spacing.lg} alignment="center">
          <Text
            textStyle={{
              color: colors.ink,
              fontFamily: fontFamily.extrabold,
              fontSize: fontSize.numeral,
              letterSpacing: -1,
            }}
          >
            62.5 kg
          </Text>
          <Text
            textStyle={{ color: colors.inkMuted, fontFamily: fontFamily.regular, fontSize: fontSize.body }}
          >
            Hit 8 on every set and it becomes 65 kg
          </Text>
          <Button
            onPress={() => setTaps((n) => n + 1)}
            style={{
              backgroundColor: colors.accent,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.xxl,
              paddingVertical: spacing.md,
              height: 52,
            }}
          >
            <Text
              textStyle={{
                color: colors.onAccent,
                fontFamily: fontFamily.semibold,
                fontSize: fontSize.label,
              }}
            >
              {taps === 0 ? "Start workout" : `Tapped ${taps}`}
            </Text>
          </Button>
        </Column>
      </Host>
    </View>
  );
}

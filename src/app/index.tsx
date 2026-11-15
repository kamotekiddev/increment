import { Button, Host, Text } from "@expo/ui";
import * as Font from "expo-font";
import { useState } from "react";
import { Pressable, Text as RNText, View } from "react-native";

import { fontFamily, fontSize, radius, spacing, useColors } from "@/theme";

/**
 * Spike (temporary, replaced by the Today tab): can Expo UI match the design system?
 * A = @expo/ui Text, B = React Native Text in Sora, C = @expo/ui Button (filled),
 * D = @expo/ui Button (text variant), E = React Native Pressable pill.
 */
export default function Spike() {
  const colors = useColors();
  const [taps, setTaps] = useState(0);
  const press = () => setTaps((n) => n + 1);
  const label = taps === 0 ? "Start workout" : `Tapped ${taps}`;

  const pill = {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  };
  const labelStyle = { color: colors.onAccent, fontFamily: fontFamily.semibold, fontSize: fontSize.label };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: spacing.xl, gap: spacing.lg }}>
      <RNText style={{ color: colors.inkMuted, fontFamily: fontFamily.regular, fontSize: fontSize.caption }}>
        Sora loaded: {String(Font.isLoaded(fontFamily.extrabold))}
      </RNText>

      <RNText style={{ color: colors.inkMuted, fontSize: fontSize.caption }}>A · @expo/ui Text</RNText>
      <Host matchContents>
        <Text textStyle={{ color: colors.ink, fontFamily: fontFamily.extrabold, fontSize: fontSize.numeral }}>
          62.5 kg
        </Text>
      </Host>

      <RNText style={{ color: colors.inkMuted, fontSize: fontSize.caption }}>B · React Native Text</RNText>
      <RNText style={{ color: colors.ink, fontFamily: fontFamily.extrabold, fontSize: fontSize.numeral }}>
        62.5 kg
      </RNText>

      <RNText style={{ color: colors.inkMuted, fontSize: fontSize.caption }}>C · @expo/ui Button, filled</RNText>
      <Host matchContents>
        <Button onPress={press} style={pill}>
          <Text textStyle={labelStyle}>{label}</Text>
        </Button>
      </Host>

      <RNText style={{ color: colors.inkMuted, fontSize: fontSize.caption }}>D · @expo/ui Button, text variant</RNText>
      <Host matchContents>
        <Button variant="text" onPress={press} style={pill}>
          <Text textStyle={labelStyle}>{label}</Text>
        </Button>
      </Host>

      <RNText style={{ color: colors.inkMuted, fontSize: fontSize.caption }}>E · React Native Pressable pill</RNText>
      <Pressable onPress={press} style={[pill, { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" }]}>
        <RNText style={labelStyle}>{label}</RNText>
      </Pressable>
    </View>
  );
}

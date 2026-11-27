import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components";
import { fontFamily, onboardingGutter, quickStart, spacing, welcomeHero } from "@/theme";

/** The big heading text styles of the onboarding screens. */
const TITLE_LOOKS = {
  welcome: { fontSize: welcomeHero.title, lineHeight: welcomeHero.titleLine, letterSpacing: welcomeHero.titleTracking },
  quickStart: { fontSize: quickStart.title, lineHeight: quickStart.titleLine, letterSpacing: quickStart.titleTracking },
} as const;

/** The heading of an onboarding screen. */
export function OnboardingTitle({ look, children }: { look: keyof typeof TITLE_LOOKS; children: string }) {
  return (
    <Text accessibilityRole="header" style={{ ...TITLE_LOOKS[look], fontFamily: fontFamily.bold }}>
      {children}
    </Text>
  );
}

/** The buttons pinned to the bottom of an onboarding screen, clear of the home indicator. */
export function OnboardingFooter({ gap, children }: { gap: number; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: "absolute", left: onboardingGutter, right: onboardingGutter, bottom: Math.max(insets.bottom, spacing.xl), gap }}>
      {children}
    </View>
  );
}

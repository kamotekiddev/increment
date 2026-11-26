import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useNavigation } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AUTO_BACKUP_PATH } from "@/backup/backupPro";
import { Button, Text } from "@/components";
import { fontFamily, fontSize, lineHeight, minTouch, opacity, pro, radius, size, spacing, textStyle, useColors } from "@/theme";

import { proScreensOnTop } from "./proRoutes";

/** What Pro includes, as listed on Pro unlocked. */
const INCLUDED = ["Unlimited routines", "Charts and records", "Automatic backups", "Custom exercises and export"];

/** One faint ring behind the hero's check. */
function Ring({ diameter, width, ringOpacity }: { diameter: number; width: number; ringOpacity: number }) {
  const colors = useColors();
  return (
    <View
      aria-hidden
      style={{
        position: "absolute",
        width: diameter,
        height: diameter,
        borderRadius: radius.pill,
        borderWidth: width,
        borderColor: colors.onAccent,
        opacity: ringOpacity,
      }}
    />
  );
}

function Hero() {
  const colors = useColors();
  return (
    <View
      style={{
        height: size.hero,
        borderRadius: radius.hero,
        backgroundColor: colors.accent,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
      }}
    >
      <Ring diameter={pro.outerRing} width={pro.outerRingWidth} ringOpacity={pro.outerRingOpacity} />
      <Ring diameter={pro.innerRing} width={pro.innerRingWidth} ringOpacity={pro.innerRingOpacity} />
      <View
        style={{
          width: size.heroTile,
          height: size.heroTile,
          borderRadius: radius.pill,
          backgroundColor: colors.onAccent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="checkmark" size={pro.heroCheck} color={colors.accent} />
      </View>
      <Text tone="onAccent" style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.small, opacity: opacity.onAccentSoft }}>
        Lifetime access
      </Text>
    </View>
  );
}

/**
 * Pro unlocked: shown once each time Pro switches on. Start using Pro dismisses it together with the
 * Paywall under it, if any, and returns to the screen the Paywall was opened from.
 */
export function ProUnlockedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  function leave() {
    const routes = navigation.getState()?.routes ?? [];
    const count = Math.max(1, proScreensOnTop(routes.map((r) => r.name)));
    if (router.canDismiss()) router.dismiss(count);
    else router.replace("/");
  }

  function startUsingPro() {
    leave();
  }

  /** Closes Pro unlocked (and the Paywall under it) like Start using Pro, then opens Automatic backups. */
  function turnOnAutomaticBackups() {
    leave();
    router.push(AUTO_BACKUP_PATH);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.lg + spacing.xs,
          paddingBottom: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <Hero />
        <View style={{ gap: spacing.snug, paddingHorizontal: 2 }}>
          <Text accessibilityRole="header" style={{ fontFamily: fontFamily.bold, ...textStyle.screenTitle }}>
            Pro unlocked
          </Text>
          <Text tone="muted" style={{ fontSize: fontSize.body, lineHeight: lineHeight.body }}>
            Thanks for supporting Increment. All of this is yours now, forever.
          </Text>
        </View>
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: 2 }}>
          {INCLUDED.map((item, i) => (
            <View
              key={item}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                minHeight: minTouch,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.line,
              }}
            >
              <View
                style={{
                  width: pro.itemCheck,
                  height: pro.itemCheck,
                  borderRadius: radius.pill,
                  backgroundColor: colors.accentTint,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="checkmark" size={pro.itemCheckGlyph} color={colors.accent} />
              </View>
              <Text style={{ flex: 1, fontFamily: fontFamily.medium, fontSize: fontSize.label }}>{item}</Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Turn on automatic backups"
          onPress={turnOnAutomaticBackups}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            backgroundColor: colors.accentTint,
            borderRadius: radius.row,
            padding: spacing.md + 2,
          }}
        >
          <View
            style={{
              width: size.tile,
              height: size.tile,
              borderRadius: radius.tile,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="time-outline" size={size.icon} color={colors.onAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.label }}>Turn on automatic backups</Text>
            <Text tone="muted" style={{ fontSize: fontSize.small }}>
              Recommended first step. Takes 10 seconds.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={size.icon} color={colors.accent} />
        </Pressable>
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg + spacing.xs, paddingTop: spacing.md, paddingBottom: insets.bottom + spacing.lg }}>
        <Button label="Start using Pro" large onPress={startUsingPro} />
      </View>
    </View>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import { BackHandler, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components";
import { fontFamily, fontSize, radius, spacing, useColors } from "@/theme";
import { useUnit } from "@/settings";
import { loadText, offerHeading, targetText } from "@/workout";
import { answerOffer, loadOffers } from "@/workout/summaryQueries";

/**
 * One Offer, full screen. The workout's Offers are read when the screen opens; `step` is this
 * Offer's place in the list. Each tap saves its answer at once and replaces this screen with the
 * next Offer, or with the summary after the last. Answers are final, and back does nothing.
 */
export default function OfferScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id, step } = useLocalSearchParams<{ id: string; step: string }>();
  const { unit } = useUnit();
  const workoutId = Number(id);
  const index = Number(step ?? 0);
  const offers = useMemo(() => loadOffers(workoutId, unit), [workoutId, unit]);
  const offer = offers[index];
  const answered = useRef(false);

  // The Android back button does nothing here. Go up and Stay are the only way forward.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }, []),
  );

  if (!offer) return <Redirect href={{ pathname: "/workout/summary/[id]", params: { id: String(workoutId) } }} />;

  function answer(accepted: boolean) {
    if (answered.current) return;
    answered.current = true;
    answerOffer(offer.workoutExerciseId, accepted, offer.stepped, unit);
    if (index + 1 < offers.length) {
      router.replace({ pathname: "/workout/offer/[id]", params: { id: String(workoutId), step: String(index + 1) } });
    } else {
      router.replace({ pathname: "/workout/summary/[id]", params: { id: String(workoutId) } });
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + spacing.lg,
      }}
    >
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={{ gap: spacing.lg }}>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={`Offer ${index + 1} of ${offers.length}`}
          style={{ flexDirection: "row", gap: 6 }}
        >
          {offers.map((o, i) => (
            <View
              key={o.workoutExerciseId}
              style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i <= index ? colors.accent : colors.lineStrong }}
            />
          ))}
        </View>
        <View style={{ gap: 2 }}>
          <Text tone="muted" style={{ fontFamily: fontFamily.medium, fontSize: fontSize.label }}>
            {offerHeading(offer.current, offer.stepped)}
          </Text>
          <Text tone="accent" style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.small }}>
            {index + 1} of {offers.length}
          </Text>
        </View>
        <Text accessibilityRole="header" style={{ fontFamily: fontFamily.bold, fontSize: fontSize.display, letterSpacing: -1 }}>
          {offer.name}
        </Text>
        <View
          style={{
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            backgroundColor: colors.accentTint,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
          }}
        >
          <Ionicons name="checkmark" size={14} color={colors.accent} />
          <Text variant="caption" tone="accent" style={{ fontFamily: fontFamily.semibold }}>
            Clean {offer.streak} of {offer.streak}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: "center", gap: spacing.md }}>
        <View style={{ backgroundColor: colors.accentTint, borderRadius: radius.card, padding: spacing.xl, gap: 6 }}>
          <Text tone="accent" style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.small }}>
            Next time
          </Text>
          <Text tone="muted" style={{ fontFamily: fontFamily.medium, fontSize: fontSize.title }}>
            {targetText(offer.current, unit)}
          </Text>
          <Ionicons name="arrow-down" size={26} color={colors.accent} />
          <Text tone="accent" style={{ fontFamily: fontFamily.bold, fontSize: 42, lineHeight: 46, letterSpacing: -1.5 }}>
            {targetText(offer.stepped, unit)}
          </Text>
        </View>
        <Text tone="muted" style={{ fontSize: fontSize.small, paddingHorizontal: spacing.xs }}>
          Stay keeps {loadText(offer.current, unit)}. The offer comes back after your next clean workout.
        </Text>
      </View>

      <View style={{ gap: spacing.sm + 2 }}>
        <Button label={`Go up to ${loadText(offer.stepped, unit)}`} large onPress={() => answer(true)} />
        <Button label={`Stay at ${loadText(offer.current, unit)}`} variant="outlined" large onPress={() => answer(false)} />
      </View>
    </View>
  );
}

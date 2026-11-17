import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, Pill, Text } from "@/components";
import { fontFamily, fontSize, lineHeight, opacity, radius, spacing, useColors } from "@/theme";
import { formatWeight } from "@/units";
import type { SummaryCard, SummaryHeader } from "@/workout";
import { targetText } from "@/workout";
import { useSummary } from "@/workout/summaryQueries";

const outcomeLabel: Record<SummaryCard["outcome"], string> = {
  clean: "Clean",
  hold: "Held",
  miss: "Missed",
  baseline: "Baseline",
  deload: "Deload",
};

/** One big number with its small unit under a label, in the header card. */
function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text tone="onAccent" style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.screen, letterSpacing: -0.7 }}>
        {value}
        {unit ? <Text tone="onAccent" style={{ fontFamily: fontFamily.medium, fontSize: fontSize.small, opacity: opacity.pressed }}>{unit}</Text> : null}
      </Text>
      <Text variant="caption" tone="onAccent" style={{ opacity: opacity.pressed }}>
        {label}
      </Text>
    </View>
  );
}

function HeaderCard({ title, header }: { title: string; header: SummaryHeader }) {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.accent, borderRadius: radius.card, padding: spacing.xl, gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <Text tone="onAccent" style={{ fontFamily: fontFamily.medium, fontSize: fontSize.label, opacity: opacity.pressed }}>
          Workout complete
        </Text>
        <Text
          accessibilityRole="header"
          tone="onAccent"
          style={{ fontFamily: fontFamily.bold, fontSize: fontSize.heading, letterSpacing: -0.8 }}
        >
          {title}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <Stat value={String(header.durationMinutes)} unit="m" label="Duration" />
        <Stat value={String(header.sets)} label="Sets" />
        {header.showTotalReps ? (
          <Stat value={String(header.totalReps)} label="Total reps" />
        ) : (
          <Stat value={formatWeight(header.volumeKg, "kg")} unit="kg" label="Volume" />
        )}
      </View>
    </View>
  );
}

function ExerciseCard({ card, onAnswer }: { card: SummaryCard; onAnswer: (accepted: boolean) => void }) {
  return (
    <Card style={{ borderRadius: radius.card, gap: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <Text variant="label" style={{ flex: 1, fontSize: fontSize.body }}>
          {card.name}
        </Text>
        <Pill label={outcomeLabel[card.outcome]} tone={card.outcome === "clean" ? "progress" : "neutral"} />
      </View>
      <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.title }}>
        {card.line}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="caption" tone="muted" style={{ fontFamily: fontFamily.medium }}>
          Next time
        </Text>
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.lead, letterSpacing: -0.3 }}>
          {card.next ? targetText(card.next) : "No Target yet"}
        </Text>
      </View>
      {card.offer ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="caption" tone="muted" style={{ fontFamily: fontFamily.medium }}>
            Offer: move up to {targetText(card.offer.target)} next time?
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Button
              label="Accept"
              variant={card.offer.accepted ? "primary" : "secondary"}
              accessibilityState={{ selected: card.offer.accepted }}
              onPress={() => onAnswer(true)}
            />
            <Button
              label="Decline"
              variant={card.offer.accepted ? "secondary" : "primary"}
              accessibilityState={{ selected: !card.offer.accepted }}
              onPress={() => onAnswer(false)}
            />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

export default function WorkoutSummaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loaded, answer } = useSummary(Number(id));

  /** Returns to where the workout started (the root when there is nowhere to go back to). */
  function done() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      {loaded ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingTop: insets.top + spacing.lg,
            paddingBottom: spacing.xl,
            gap: spacing.md,
          }}
        >
          <HeaderCard title={loaded.title ?? "Workout"} header={loaded.summary.header} />
          {loaded.summary.cards.map((card) => (
            <ExerciseCard key={card.id} card={card} onAnswer={(accepted) => answer(card.id, accepted)} />
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, padding: spacing.xl, paddingTop: insets.top + spacing.xl }}>
          <Text tone="muted">Workout not found.</Text>
        </View>
      )}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: insets.bottom + spacing.lg }}>
        <Button label="Done" large onPress={done} />
      </View>
    </View>
  );
}

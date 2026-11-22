import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { View } from "react-native";

import { Button, Card, PromptSheet, Text } from "@/components";
import { fontFamily, fontSize, radius, spacing, useColors } from "@/theme";
import type { Unit } from "@/units";
import { useInProgressOnFocus } from "@/workout/inProgressQueries";

import { UnitSegmented } from "./UnitSegmented";
import { useUnit } from "./useUnit";
import { unitSwitchText } from "./unitSwitchText";

/**
 * The Units card of Settings: a Kilograms / Pounds control and a note. Tapping the other unit opens a confirmation sheet; the unit is saved only when the lifter confirms. The step a
 * weight goes up by is set per routine exercise, not here.
 */
export function UnitCard() {
  const colors = useColors();
  const { unit, setUnit } = useUnit();
  const inProgress = useInProgressOnFocus();
  const [pending, setPending] = useState<Unit | null>(null);
  // Keep the last text while the sheet slides out, so it doesn't go blank.
  const [shown, setShown] = useState<Unit>(unit === "kg" ? "lb" : "kg");
  const text = unitSwitchText(unit, shown, inProgress !== null);
  const ask = (next: Unit) => {
    if (next === unit) return;
    setShown(next);
    setPending(next);
  };
  const close = () => setPending(null);
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: 6 }}>
        Units
      </Text>
      <Card style={{ borderRadius: radius.card, gap: spacing.md - 2 }}>
        <UnitSegmented unit={unit} onChange={ask} size="wide" track="sunk" />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Ionicons name="information-circle-outline" size={15} color={colors.inkMuted} style={{ marginTop: 1 }} />
          <Text variant="caption" tone="muted" style={{ flex: 1, lineHeight: 18 }}>
            History, records and charts convert for display. What you logged never changes.
          </Text>
        </View>
      </Card>
      <PromptSheet visible={pending !== null} onDismiss={close} icon="swap-horizontal-outline" tone="accent" title={text.title} body={text.body}>
        <Button
          label={text.confirm}
          large
          onPress={() => {
            setUnit(shown);
            close();
          }}
        />
        <Button label={text.cancel} variant="secondary" stretch onPress={close} />
      </PromptSheet>
    </View>
  );
}

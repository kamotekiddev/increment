import { View } from "react-native";

import { Pill, Text } from "@/components";
import { fontFamily, fontSize, lineHeight, radius, spacing, useColors } from "@/theme";

import type { RecordName } from "@/records/recordsQueries";

import type { PastExerciseCard } from "./historyQueries";

export interface PastExerciseRowProps {
  card: PastExerciseCard;
  /** The Records this exercise set in the workout, one pill each. */
  records: RecordName[];
  /** Every row but the first draws a divider above. */
  first: boolean;
}

/** One exercise of a Past workout: its name and Target, a Deload pill and a pill per Record, and a chip per done Working set. */
export function PastExerciseRow({ card, records, first }: PastExerciseRowProps) {
  const colors = useColors();
  return (
    <View
      style={{
        gap: spacing.sm,
        paddingVertical: 14,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: colors.line,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: spacing.sm }}>
          <Text variant="label" style={{ lineHeight: lineHeight.label }}>
            {card.name}
          </Text>
          {card.target !== null && (
            <Text tone="muted" style={{ fontSize: fontSize.caption }}>
              {card.target}
            </Text>
          )}
        </View>
        {(card.deload || records.length > 0) && (
          <View style={{ flexShrink: 1, maxWidth: "55%", flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 6 }}>
            {card.deload && <Pill label="Deload" tone="neutral" />}
            {records.map((record) => (
              <Pill key={record} label={record} />
            ))}
          </View>
        )}
      </View>
      {card.chips.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {card.chips.map((chip, index) => (
            <View
              key={index}
              style={{ paddingVertical: spacing.xs, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.sunk }}
            >
              <Text variant="caption" tone="soft" style={{ fontFamily: fontFamily.medium, lineHeight: lineHeight.caption }}>
                {chip}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

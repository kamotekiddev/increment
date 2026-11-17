import { View } from "react-native";

import { Text } from "@/components";
import { spacing } from "@/theme";

import { ExercisePreviewCard } from "./ExercisePreviewCard";
import type { NextPreview } from "./nextPreview";
import type { TodayCard } from "./todayState";
import { exerciseCountText, previewTitle } from "./todayText";

/** Under the deck: "Today: <Routine>" with its exercise count, then the Routine's first exercises. Read-only. */
export function DeckPreview({ card, preview }: { card: TodayCard; preview: NextPreview | undefined }) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md }}>
        <Text variant="title" numberOfLines={1} style={{ flex: 1 }}>
          {previewTitle(card.name)}
        </Text>
        <Text tone="muted">{exerciseCountText(card.exerciseCount)}</Text>
      </View>
      <ExercisePreviewCard preview={preview} />
    </View>
  );
}

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

import { Text } from "@/components";
import { equipmentIcon } from "@/library/exerciseMeta";
import { fontFamily, radius, size, spacing, useColors } from "@/theme";

import type { NextPreview } from "./nextPreview";

/** A white card of a Routine's first exercises with each Target and "+ N more", or "No exercises yet". Empty until the preview is read. */
export function ExercisePreviewCard({ preview }: { preview: NextPreview | undefined }) {
  const colors = useColors();
  return (
    <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.card, backgroundColor: colors.card }}>
      {preview === undefined ? null : preview.rows.length === 0 ? (
        <Text tone="muted">No exercises yet</Text>
      ) : (
        <>
          {preview.rows.map((row, i) => (
            <View key={`${i}-${row.name}`} style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <View
                style={{
                  width: size.smallTile,
                  height: size.smallTile,
                  borderRadius: radius.sm,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.accentTint,
                }}
              >
                <MaterialCommunityIcons name={equipmentIcon(row.equipment)} size={size.icon} color={colors.accent} />
              </View>
              <Text variant="label" numberOfLines={1} style={{ flex: 1 }}>
                {row.name}
              </Text>
              <Text tone="muted" style={{ fontFamily: fontFamily.semibold }}>
                {row.targetText}
              </Text>
            </View>
          ))}
          {preview.more > 0 ? <Text tone="muted">{`+ ${preview.more} more`}</Text> : null}
        </>
      )}
    </View>
  );
}

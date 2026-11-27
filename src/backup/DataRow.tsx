import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";

import { Pill, Text } from "@/components";
import { fontFamily, fontSize, lineHeight, opacity, radius, size, spacing, useColors } from "@/theme";

interface Props {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  /** One muted line under the title. */
  subtitle: string;
  onPress: () => void;
  /** A grey Pro tag before the chevron (a free lifter's locked row). */
  proTag?: boolean;
  /** The red destructive look (Delete all data): red title, red-tint tile, no chevron. */
  danger?: boolean;
  /** A hairline above the row, for the second row of a list card. */
  divider?: boolean;
  accessibilityLabel?: string;
}

/** One row of Your data: a 40 pt icon tile, a title with one muted line, and a chevron. Every row on the screen uses it. */
export function DataRow({ icon, title, subtitle, onPress, proTag = false, danger = false, divider = false, accessibilityLabel }: Props) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: size.row,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: colors.line,
        opacity: pressed ? opacity.pressed : 1,
      })}
    >
      <View style={{ width: size.tile, height: size.tile, borderRadius: radius.tile, backgroundColor: danger ? colors.dangerTint : colors.sunk, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={size.icon} color={danger ? colors.danger : colors.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSize.body, fontFamily: fontFamily.semibold, color: danger ? colors.danger : colors.ink }}>{title}</Text>
        <Text tone="muted" style={{ fontSize: fontSize.caption, lineHeight: lineHeight.detail }}>
          {subtitle}
        </Text>
      </View>
      {/* The Pill aligns itself to the top of a row, so the wrapper is what the row centers. */}
      {proTag ? (
        <View>
          <Pill label="Pro" tone="neutral" />
        </View>
      ) : null}
      {danger ? null : <Ionicons name="chevron-forward" size={size.check} color={colors.iconFaint} />}
    </Pressable>
  );
}

/** The small muted heading above a group of Your data rows. */
export function SectionLabel({ children }: { children: string }) {
  return (
    <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.snug, paddingTop: spacing.sm }}>
      {children}
    </Text>
  );
}

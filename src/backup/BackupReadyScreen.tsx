import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, RoundButton, Text } from "@/components";
import { fontFamily, fontSize, lineHeight, opacity, radius, size, spacing, useColors } from "@/theme";

import { readLastBackup, writeLastBackup } from "./backupQueries";
import { deleteCachedFile, shareBackupFile } from "./backupShare";
import { fileSizeText, lastBackupAfterShare } from "./backupText";
import { useReadyBackup } from "./readyStore";

const NEW_PHONE_STEPS = [
  "Install Increment and tap Restore from a backup",
  "Choose this file from Files, Drive or your messages",
  "Tap Restore purchase on the paywall to unlock Pro again",
];

/**
 * Backup ready: the file just built, its counts and the "On your new phone" steps. Save or share file opens the share
 * sheet; Last backup moves only when the sheet reports the share finished, a cancel changes nothing.
 */
export function BackupReadyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const ready = useReadyBackup((s) => s.ready);
  const [busy, setBusy] = useState(false);

  function close() {
    if (ready) deleteCachedFile(ready.file.uri);
    router.back();
    useReadyBackup.getState().set(null);
  }

  async function onShare() {
    if (!ready || busy) return;
    setBusy(true);
    try {
      const result = await shareBackupFile(ready.file);
      const previous = readLastBackup();
      const next = lastBackupAfterShare(result, Date.now(), previous);
      if (next !== null && next !== previous) writeLastBackup(next);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;
  const { backup, file } = ready;
  const rows: [string, string][] = [
    ["Routines", String(backup.counts.routines)],
    ["Workouts", String(backup.counts.workouts)],
    ["Sets", String(backup.counts.sets)],
    ["Records", String(backup.counts.records)],
    ["Settings", backup.settingsText],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ marginTop: insets.top + spacing.sm, paddingHorizontal: spacing.xl, alignItems: "flex-end" }}>
        <RoundButton icon="close" label="Close" onPress={close} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: size.control * 3, gap: spacing.lg }}>
        <View style={{ width: size.control, height: size.control, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="checkmark" size={size.icon + 6} color={colors.onAccent} />
        </View>
        <View style={{ gap: spacing.xs }}>
          <Text variant="heading" accessibilityRole="header">
            Backup ready
          </Text>
          <Text tone="muted" style={{ fontSize: fontSize.body, lineHeight: lineHeight.body }}>
            Save it somewhere you can reach from your new phone.
          </Text>
        </View>
        <View style={{ backgroundColor: colors.card, borderRadius: radius.card, paddingHorizontal: spacing.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, height: size.row }}>
            <View style={{ width: size.tile + 4, height: size.tile + 4, borderRadius: radius.tile, backgroundColor: colors.sunk, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="document-outline" size={size.icon + 2} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: fontSize.label, fontFamily: fontFamily.semibold }}>
                {backup.fileName.replace(/\.increment$/, "")}
              </Text>
              <Text tone="muted" style={{ fontSize: fontSize.caption }}>
                .increment file · {fileSizeText(file.bytes)}
              </Text>
            </View>
          </View>
          {rows.map(([label, value]) => (
            <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: size.tile + 2, borderTopWidth: 1, borderTopColor: colors.line }}>
              <Text tone="soft" style={{ fontSize: fontSize.label }}>
                {label}
              </Text>
              <Text style={{ fontSize: fontSize.label, fontFamily: fontFamily.semibold }}>{value}</Text>
            </View>
          ))}
        </View>
        <View style={{ gap: spacing.md }}>
          <Text variant="label">On your new phone</Text>
          {NEW_PHONE_STEPS.map((step, i) => (
            <View key={step} style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <View style={{ width: size.check + 10, height: size.check + 10, borderRadius: radius.pill, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
                <Text tone="accent" style={{ fontSize: fontSize.caption, fontFamily: fontFamily.bold }}>
                  {i + 1}
                </Text>
              </View>
              <Text tone="soft" style={{ flex: 1, fontSize: fontSize.label, lineHeight: lineHeight.label }}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ position: "absolute", left: spacing.xl, right: spacing.xl, bottom: spacing.xxl, alignItems: "center", gap: spacing.snug }}>
        <Button label="Save or share file" icon="share-outline" large disabled={busy} onPress={onShare} />
        <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => ({ height: size.tile, justifyContent: "center", opacity: pressed ? opacity.pressed : 1 })}>
          <Text tone="muted" style={{ fontSize: fontSize.label, fontFamily: fontFamily.medium }}>
            Done
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

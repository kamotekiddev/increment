import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { Button, Card, RoundButton, ScreenHeader, Text } from "@/components";
import { db } from "@/db/client";
import { refreshReminders } from "@/reminders";
import { reminderStore, unitStore, workoutStore } from "@/settings";
import { fontFamily, fontSize, lineHeight, opacity, radius, size, spacing, useColors } from "@/theme";

import { backupCounts } from "./backupFile";
import { fileSizeText, settingsSummary } from "./backupText";
import { MissingLibraryExerciseError, restoreBackup } from "./restoreBackup";
import { usePickedBackup } from "./restoreStore";

const MISSING_LIBRARY_MESSAGE = "This backup uses exercises this version doesn't have. Update the app to restore it.";

/**
 * Restore a backup: what the picked file holds and the warning that restoring replaces the training data on this
 * phone. Restore this backup runs the one-transaction replace, then re-plans reminders (never asking for permission).
 */
export function RestorePreviewScreen() {
  const colors = useColors();
  const picked = usePickedBackup((s) => s.picked);
  const [busy, setBusy] = useState(false);

  function close() {
    router.back();
    usePickedBackup.getState().set(null);
  }

  async function onRestore() {
    if (!picked || busy) return;
    setBusy(true);
    try {
      const result = restoreBackup(db, picked.data);
      if (result === "workout-in-progress") {
        Alert.alert("Workout in progress", "Finish or discard your workout first.");
        return;
      }
      // The settings stores cache the old row; reload them so the restored values show and are never written back over it.
      unitStore.getState().load();
      workoutStore.getState().load();
      reminderStore.getState().load();
      void refreshReminders();
      close();
      Alert.alert("Backup restored", "Your routines, workouts, custom exercises and settings are back.");
    } catch (e) {
      if (e instanceof MissingLibraryExerciseError) {
        Alert.alert("Couldn’t restore the backup", MISSING_LIBRARY_MESSAGE);
      } else {
        Alert.alert("Couldn’t restore the backup", "Your data is unchanged. Try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!picked) return null;
  const counts = backupCounts(picked.data);
  const s = picked.data.userSettings;
  const rows: [string, string][] = [
    ["Routines", String(counts.routines)],
    ["Workouts", String(counts.workouts)],
    ["Sets", String(counts.sets)],
    ["Custom exercises", String(counts.customExercises)],
    ["Settings", s ? settingsSummary(s.unit, s.defaultRestS) : "Not in this file"],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader left={<RoundButton icon="chevron-back" label="Back" onPress={close} />} title="Restore a backup" />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: size.control * 3, gap: spacing.lg }}>
        <Text tone="muted" style={{ fontSize: fontSize.body, lineHeight: lineHeight.body, paddingHorizontal: spacing.xs }}>
          Check what is inside before you restore it.
        </Text>
        <View style={{ backgroundColor: colors.card, borderRadius: radius.card, paddingHorizontal: spacing.lg, borderWidth: 2, borderColor: colors.accent }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, height: size.row }}>
            <View style={{ width: size.tile + 4, height: size.tile + 4, borderRadius: radius.tile, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="document-outline" size={size.icon + 2} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: fontSize.label, fontFamily: fontFamily.semibold }}>
                {picked.name}
              </Text>
              <Text tone="muted" style={{ fontSize: fontSize.caption }}>
                .increment file{picked.bytes !== null ? ` · ${fileSizeText(picked.bytes)}` : ""}
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
        <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => ({ height: size.tile + 4, alignItems: "center", justifyContent: "center", opacity: pressed ? opacity.pressed : 1 })}>
          <Text tone="accent" style={{ fontSize: fontSize.label, fontFamily: fontFamily.semibold }}>
            Choose a different file
          </Text>
        </Pressable>
        <Card style={{ borderRadius: radius.lg, flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" }}>
          <Ionicons name="warning-outline" size={size.check + 1} color={colors.danger} />
          <Text tone="soft" style={{ flex: 1, fontSize: fontSize.small, lineHeight: lineHeight.small }}>
            Restoring replaces the training data on this phone: your routines, workouts, custom exercises and settings. It can’t be undone. Your Pro purchase isn’t touched.
          </Text>
        </Card>
      </ScrollView>
      <View style={{ position: "absolute", left: spacing.xl, right: spacing.xl, bottom: spacing.xxl }}>
        <Button label="Restore this backup" large disabled={busy} onPress={onRestore} />
      </View>
    </View>
  );
}

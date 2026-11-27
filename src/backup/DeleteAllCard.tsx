import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, View } from "react-native";

import { BottomSheet, Button, Card, Input, Pill, Text } from "@/components";
import { db } from "@/db/client";
import { clearStaleExports } from "@/export/reportFile";
import { routines } from "@/db/schema";
import { refreshReminders } from "@/reminders";
import { reminderStore, unitStore, workoutStore } from "@/settings";
import { fontFamily, fontSize, lineHeight, opacity, radius, size, spacing, useColors } from "@/theme";

import type { YourDataStats } from "./backupQueries";
import { deleteAllData, deleteConfirmed, deleteSheetBackupShortcut } from "./deleteAllData";
import { DataRow } from "./DataRow";
import { hasWorkoutInProgress } from "./restoreBackup";

interface Props {
  isPro: boolean;
  stats: YourDataStats;
  /** Starts the Backup flow (Backup ready), which returns to Your data when closed. */
  onCreateBackup: () => void;
  /** Called after a successful delete so Your data reads its numbers again. */
  onDeleted: () => void;
}

/**
 * The red Delete all data link on Your data and its confirm sheet. Free for everyone. With a Workout in progress it
 * only says to finish or discard it (checked before any typing). The sheet shows the counts, the Pro-only
 * "Create a backup first" row, the DELETE field and the red Delete everything button.
 */
export function DeleteAllCard({ isPro, stats, onCreateBackup, onDeleted }: Props) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [routineCount, setRoutineCount] = useState(0);
  const [deleted, setDeleted] = useState(false);

  // The "deleted" note is only true until the lifter leaves and comes back (a Restore or a new workout makes it stale).
  useFocusEffect(useCallback(() => setDeleted(false), []));

  function onOpen() {
    if (hasWorkoutInProgress(db)) {
      Alert.alert("Workout in progress", "Finish or discard your workout first.");
      return;
    }
    setRoutineCount(db.select({ id: routines.id }).from(routines).all().length);
    setTyped("");
    setDeleted(false);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setTyped("");
  }

  function onBackupFirst() {
    close();
    onCreateBackup();
  }

  function onDelete() {
    if (!deleteConfirmed(typed)) return;
    try {
      const result = deleteAllData(db);
      if (result === "workout-in-progress") {
        close();
        Alert.alert("Workout in progress", "Finish or discard your workout first.");
        return;
      }
    } catch {
      Alert.alert("Couldn’t delete your data", "Nothing was deleted. Try again in a moment.");
      return;
    }
    // The delete is committed. Whatever the refresh does, the sheet closes and the state says it was deleted.
    try {
      // The settings stores cache the old row; reload them so the defaults show and are never written back over it.
      unitStore.getState().load();
      workoutStore.getState().load();
      reminderStore.getState().load();
      void refreshReminders().catch(() => {}); // reminders are now off, so this cancels every planned one
      clearStaleExports(); // an exported CSV or PDF still in the cache holds the history that was just deleted
    } catch {
      // Stale stores fix themselves on the next load; the data is gone either way.
    } finally {
      close();
      setDeleted(true);
      try {
        onDeleted();
      } catch {
        // Your data reads its numbers again on the next focus.
      }
    }
  }

  const counts: [number, string][] = [
    [stats.workouts, "workouts"],
    [stats.sets, "sets"],
    [routineCount, "routines"],
    [stats.records, "records"],
  ];

  return (
    <>
      {deleted ? (
        <Text tone="muted" style={{ textAlign: "center", fontSize: fontSize.small }}>
          All your data was deleted.
        </Text>
      ) : null}
      <Card style={{ borderRadius: radius.card, paddingVertical: 0, marginTop: spacing.sm }}>
        <DataRow danger icon="trash-outline" title="Delete all data" subtitle="Removes everything from this phone" onPress={onOpen} />
      </Card>
      <BottomSheet visible={open} onDismiss={close}>
        <View style={{ alignItems: "center", gap: spacing.sm }}>
          <View style={{ width: size.emptyIcon, height: size.emptyIcon, borderRadius: radius.pill, backgroundColor: colors.dangerTint, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="trash-outline" size={size.icon + 6} color={colors.danger} />
          </View>
          <Text variant="heading" style={{ textAlign: "center" }}>
            Delete all data?
          </Text>
          <Text tone="muted" style={{ textAlign: "center", fontSize: fontSize.body, lineHeight: lineHeight.body }}>
            This removes {counts.map(([n, label]) => `${n} ${label}`).join(", ")}, your custom exercises and resets your settings. It can’t be undone. Your Pro purchase isn’t affected.
          </Text>
        </View>
        {deleteSheetBackupShortcut(isPro) ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a backup first"
            onPress={onBackupFirst}
            style={({ pressed }) => ({ minHeight: size.pickerRow, flexDirection: "row", alignItems: "center", gap: spacing.md, opacity: pressed ? opacity.pressed : 1 })}
          >
            <Ionicons name="share-outline" size={size.icon + 2} color={colors.ink} />
            <Text style={{ flex: 1, fontSize: fontSize.body, fontFamily: fontFamily.semibold }}>Create a backup first</Text>
            <View>
              <Pill label="Pro" tone="neutral" />
            </View>
          </Pressable>
        ) : null}
        <Input value={typed} onChangeText={setTyped} placeholder="Type DELETE to confirm" autoCapitalize="characters" autoCorrect={false} accessibilityLabel="Type DELETE to confirm" />
        <Button label="Delete everything" variant="danger" large disabled={!deleteConfirmed(typed)} onPress={onDelete} />
        <Button label="Cancel" variant="secondary" stretch onPress={close} />
      </BottomSheet>
    </>
  );
}

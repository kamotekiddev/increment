import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, RoundButton, Text } from "@/components";
import { fontFamily, fontSize, lineHeight, opacity, radius, size, spacing, useColors } from "@/theme";

import { contentFingerprint } from "./autoBackupText";
import { writeLastBackupHash } from "./autoBackupSettings";
import { readLastBackup, writeLastBackup } from "./backupQueries";
import { deleteCachedFile, saveBackupToFolder, shareBackupFile } from "./backupShare";
import { fileSizeText, lastBackupAfterFolderSave, lastBackupAfterShareOn } from "./backupText";
import { useReadyBackup } from "./readyStore";

const NEW_PHONE_STEPS = [
  "Install Increment and tap Restore from a backup",
  "Choose this file from Files, Drive or your messages",
  "Tap Restore purchase on the paywall to unlock Pro again",
];

/**
 * Backup ready: the file just built, its counts and the "On your new phone" steps. On iOS, Save or share file opens the
 * share sheet and Last backup moves only when the sheet reports the share finished. On Android the share sheet has no
 * "Save to device" and can't report an outcome, so Save to a folder is the main button (the only one that moves Last
 * backup) and Share is secondary. A cancelled pick or share changes nothing.
 */
export function BackupReadyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const ready = useReadyBackup((s) => s.ready);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAndroid = Platform.OS === "android";

  function close() {
    if (ready) deleteCachedFile(ready.file.uri);
    router.back();
    useReadyBackup.getState().set(null);
  }

  async function onShare() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await shareBackupFile(ready.file);
      storeLastBackup(lastBackupAfterShareOn(Platform.OS, result, Date.now(), readLastBackup()));
      // iOS reports a finished share; Android can't, so its Share button never confirms or closes.
      if (result === "shared" && !isAndroid) finish("Backup shared", "Your backup file was shared.");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveToFolder() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await saveBackupToFolder(ready.backup.fileName, ready.backup.text);
      if (result === "failed") setError("Couldn't save the backup there. Try another folder, or use Share.");
      storeLastBackup(lastBackupAfterFolderSave(result, Date.now(), readLastBackup()));
      if (result === "saved") finish("Backup saved", "Your backup is in the folder you chose.");
    } finally {
      setBusy(false);
    }
  }

  /** The backup is safe: close Backup ready, then confirm over the Your data screen. */
  function finish(title: string, message: string) {
    close();
    Alert.alert(title, message);
  }

  /** A backup that counts moves Last backup and stores the content fingerprint, so "changed" is judged from it. */
  function storeLastBackup(next: number | null) {
    if (next === null || next === readLastBackup() || !ready) return;
    writeLastBackup(next);
    writeLastBackupHash(contentFingerprint(ready.backup.text));
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
        {error ? (
          <Text tone="muted" accessibilityRole="alert" style={{ fontSize: fontSize.label, textAlign: "center" }}>
            {error}
          </Text>
        ) : null}
        {isAndroid ? (
          <>
            <Button label="Save to a folder" icon="folder-open-outline" large disabled={busy} onPress={onSaveToFolder} />
            <Button label="Share" icon="share-outline" variant="outlined" stretch disabled={busy} onPress={onShare} />
          </>
        ) : (
          <Button label="Save or share file" icon="share-outline" large disabled={busy} onPress={onShare} />
        )}
        <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => ({ height: size.tile, justifyContent: "center", opacity: pressed ? opacity.pressed : 1 })}>
          <Text tone="muted" style={{ fontSize: fontSize.label, fontFamily: fontFamily.medium }}>
            Done
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

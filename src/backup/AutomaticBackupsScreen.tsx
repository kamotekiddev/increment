import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";

import { BottomSheet, Button, Card, RoundButton, ScreenHeader, SettingsSwitch, Text } from "@/components";
import { useIsPro } from "@/pro";
import { fontFamily, fontSize, lineHeight, minTouch, opacity, radius, spacing, useColors } from "@/theme";

import { folderLabel, KEEP_OPTIONS, type Keep } from "./autoBackupText";
import { openAutoBackupFolder, pickAutoBackupFolder, runAutoBackup } from "./autoBackupFolder";
import { FREQUENCY_OPTIONS, type Frequency } from "./autoBackupDue";
import { readAutoBackupFailing, readAutoBackupSettings, writeAutoBackupFailing, writeAutoBackupFrequency, writeAutoBackupKeep, writeAutoBackupOn, type AutoBackupSettings } from "./autoBackupSettings";
import { recordAutoBackupResult } from "./autoBackupRun";
import { readLastBackup } from "./backupQueries";
import { lastBackupLabel } from "./backupText";

const IOS_FOLDER_LABEL = "On this iPhone › Increment";

/**
 * Automatic backups (Pro): the switch, Last backup with Back up now, and Where to save (Folder, Keep). On Android the
 * first turn-on opens the folder picker (backing out leaves it off); on iOS it turns on at once. Turning on and Back up
 * now each write a backup right away. How often picks when the app writes by itself (see `autoBackupTrigger.ts`).
 */
export function AutomaticBackupsScreen() {
  const colors = useColors();
  const isPro = useIsPro();
  const [settings, setSettings] = useState<AutoBackupSettings>(readAutoBackupSettings);
  const [lastBackupAt, setLastBackupAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(readAutoBackupFailing);
  const [keepOpen, setKeepOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSettings(readAutoBackupSettings());
      setLastBackupAt(readLastBackup());
      setFailed(readAutoBackupFailing());
    }, []),
  );

  // The screen is for Pro only; a lifter who lost Pro while it was open goes back to Your data.
  useEffect(() => {
    if (!isPro && router.canGoBack()) router.back();
  }, [isPro]);

  const reload = () => {
    setSettings(readAutoBackupSettings());
    setLastBackupAt(readLastBackup());
    setFailed(readAutoBackupFailing());
  };

  /**
   * Opens the Android folder picker. A new folder clears the failure flag (the old failure was about the old folder); a
   * failed pick (not a back-out) says so plainly. Returns true when a folder was picked.
   */
  async function pickFolder(): Promise<boolean> {
    const result = await pickAutoBackupFolder();
    if (result === "picked") writeAutoBackupFailing(false);
    else if (result === "failed") Alert.alert("Couldn't use that folder", "Pick another folder and try again.");
    return result === "picked";
  }

  /** Android with no usable folder opens the picker first. Returns false when the lifter backed out or it failed. */
  async function ensureFolder(): Promise<boolean> {
    if (Platform.OS !== "android" || openAutoBackupFolder() !== null) return true;
    return pickFolder();
  }

  async function writeNow(): Promise<void> {
    setBusy(true);
    try {
      recordAutoBackupResult(runAutoBackup(Date.now()), false);
    } finally {
      setBusy(false);
      reload();
    }
  }

  async function onToggle(next: boolean) {
    if (busy) return;
    if (!next) {
      writeAutoBackupOn(false);
      writeAutoBackupFailing(false);
      reload();
      return;
    }
    setBusy(true);
    const ready = await ensureFolder();
    if (!ready) {
      setBusy(false);
      reload();
      return;
    }
    writeAutoBackupOn(true);
    await writeNow();
  }

  async function onBackUpNow() {
    if (busy) return;
    setBusy(true);
    if (!(await ensureFolder())) {
      setBusy(false);
      reload();
      return;
    }
    await writeNow();
  }

  async function onChangeFolder() {
    if (busy || Platform.OS !== "android") return;
    setBusy(true);
    await pickFolder();
    setBusy(false);
    reload();
  }

  function chooseFrequency(frequency: Frequency) {
    writeAutoBackupFrequency(frequency);
    reload();
  }

  function chooseKeep(keep: Keep) {
    writeAutoBackupKeep(keep);
    setKeepOpen(false);
    reload();
  }

  const folderText = Platform.OS === "ios" ? IOS_FOLDER_LABEL : settings.folder ? folderLabel(settings.folder) : "Choose a folder";
  const statusText = failed ? `${lastBackupLabel(lastBackupAt)} · Couldn't save the latest backup` : lastBackupLabel(lastBackupAt);

  const row = (label: string, value: string, onPress?: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({ minHeight: minTouch + spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, opacity: pressed ? opacity.pressed : 1 })}
    >
      <Text style={{ fontFamily: fontFamily.semibold }}>{label}</Text>
      <Text tone="muted" numberOfLines={1} style={{ flex: 1, textAlign: "right", fontSize: fontSize.small }}>
        {value}
      </Text>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.iconFaint} /> : null}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader left={<RoundButton icon="chevron-back" label="Back" onPress={() => router.back()} />} title="Automatic backups" />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <Card style={{ borderRadius: radius.card }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: fontSize.lead, fontFamily: fontFamily.semibold }}>Automatic backups</Text>
              <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.small }}>
                Saves a backup file by itself and keeps the latest ones.
              </Text>
            </View>
            <SettingsSwitch value={settings.on} onValueChange={onToggle} accessibilityLabel="Automatic backups" />
          </View>
        </Card>

        <Card style={{ borderRadius: radius.card, gap: spacing.md }}>
          <View style={{ gap: 2 }}>
            <Text style={{ fontFamily: fontFamily.semibold }}>Last backup</Text>
            <Text tone={failed ? "danger" : "muted"} style={{ fontSize: fontSize.small, lineHeight: lineHeight.small }}>
              {statusText}
            </Text>
          </View>
          <Button label={busy ? "Backing up…" : "Back up now"} icon="cloud-upload-outline" disabled={busy} onPress={onBackUpNow} />
        </Card>

        <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.snug }}>
          How often
        </Text>
        <Card style={{ borderRadius: radius.card }}>
          {FREQUENCY_OPTIONS.map((option, i) => {
            const on = option.value === settings.frequency;
            return (
              <View key={option.value}>
                {i > 0 ? <View style={{ height: 1, backgroundColor: colors.line }} /> : null}
                <Pressable
                  accessibilityRole="radio"
                  accessibilityLabel={`${option.label}, ${option.caption}`}
                  accessibilityState={{ selected: on }}
                  onPress={() => chooseFrequency(option.value)}
                  style={({ pressed }) => ({ minHeight: minTouch + spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, opacity: pressed ? opacity.pressed : 1 })}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: fontFamily.semibold }}>{option.label}</Text>
                    <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.small }}>
                      {option.caption}
                    </Text>
                  </View>
                  <Ionicons name={on ? "radio-button-on" : "radio-button-off"} size={24} color={on ? colors.accent : colors.iconFaint} />
                </Pressable>
              </View>
            );
          })}
        </Card>

        <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.snug }}>
          Where to save
        </Text>
        <Card style={{ borderRadius: radius.card }}>
          {row("Folder", folderText, Platform.OS === "android" ? onChangeFolder : undefined)}
          <View style={{ height: 1, backgroundColor: colors.line }} />
          {row("Keep", `Last ${settings.keep}`, () => setKeepOpen(true))}
        </Card>
      </ScrollView>

      <BottomSheet visible={keepOpen} onDismiss={() => setKeepOpen(false)}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">Keep</Text>
          <Text tone="muted" style={{ fontSize: fontSize.small }}>
            How many automatic backups stay in the folder. Older ones are deleted. Your own backups are never touched.
          </Text>
        </View>
        <View style={{ gap: spacing.sm }}>
          {KEEP_OPTIONS.map((k) => {
            const on = k === settings.keep;
            return (
              <Pressable
                key={k}
                accessibilityRole="button"
                accessibilityLabel={`Last ${k}`}
                accessibilityState={{ selected: on }}
                onPress={() => chooseKeep(k)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  minHeight: minTouch + spacing.lg,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.row,
                  backgroundColor: on ? colors.accentTint : colors.card,
                  opacity: pressed ? opacity.pressed : 1,
                })}
              >
                <Text style={{ flex: 1, fontFamily: fontFamily.semibold }}>Last {k}</Text>
                {on ? <Ionicons name="checkmark-circle" size={24} color={colors.accent} /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

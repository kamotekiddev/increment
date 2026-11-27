import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { Button, Card, Pill, RoundButton, ScreenHeader, Text } from "@/components";
import { useIsPro } from "@/pro";
import { useUnit } from "@/settings";
import { fontFamily, fontSize, lineHeight, opacity, radius, size, spacing, useColors } from "@/theme";

import { autoBackupRow, createBackupButton } from "./backupPro";
import { createBackup, readLastBackup, yourDataStats, type YourDataStats } from "./backupQueries";
import { writeBackupFile } from "./backupShare";
import { storedLine } from "./backupText";
import { DeleteAllCard } from "./DeleteAllCard";
import { RestoreCard } from "./RestoreCard";
import { useReadyBackup } from "./readyStore";

/**
 * Your data, opened from Settings: what is stored on this phone and the Backup card. A Pro lifter creates a backup
 * (opens Backup ready); a free lifter sees the locked button. Rows for features 5, 7 and 8 are added when built.
 */
export function YourDataScreen() {
  const colors = useColors();
  const isPro = useIsPro();
  const createBackupBtn = createBackupButton(isPro);
  const autoRow = autoBackupRow(isPro);
  const { unit } = useUnit();
  const [stats, setStats] = useState<YourDataStats>({ workouts: 0, sets: 0, records: 0 });
  const [lastBackupAt, setLastBackupAt] = useState<number | null>(null);

  const load = useCallback(() => {
    setStats(yourDataStats(unit));
    setLastBackupAt(readLastBackup());
  }, [unit]);
  // Read again each time the screen shows, so Last backup moves after Backup ready closes.
  useFocusEffect(load);

  function onCreateBackup() {
    try {
      const backup = createBackup(Date.now(), Constants.expoConfig?.version ?? "1.0.0");
      const file = writeBackupFile(backup.fileName, backup.text);
      useReadyBackup.getState().set({ backup, file });
      router.push("/backup-ready");
    } catch {
      Alert.alert("Couldn't create the backup", "Your data is unchanged. Try again in a moment.");
    }
  }

  const figures: { value: number; label: string }[] = [
    { value: stats.workouts, label: "workouts" },
    { value: stats.sets, label: "sets" },
    { value: stats.records, label: "records" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader left={<RoundButton icon="chevron-back" label="Back" onPress={() => router.back()} />} title="Your data" />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <Card style={{ borderRadius: radius.card, gap: spacing.md }}>
          <View style={{ flexDirection: "row" }}>
            {figures.map((f) => (
              <View key={f.label} style={{ flex: 1, gap: spacing.xs }}>
                <Text style={{ fontSize: fontSize.screen, lineHeight: lineHeight.title, fontFamily: fontFamily.semibold }}>{f.value}</Text>
                <Text tone="muted" style={{ fontSize: fontSize.caption }}>
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Ionicons name="phone-portrait-outline" size={size.check} color={colors.inkMuted} />
            <Text tone="muted" style={{ flex: 1, fontSize: fontSize.small, lineHeight: lineHeight.subtitle }}>
              {storedLine(lastBackupAt)}
            </Text>
          </View>
        </Card>

        <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.snug }}>
          Move to a new phone
        </Text>
        <Card style={{ borderRadius: radius.card, gap: spacing.md }}>
          <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "flex-start" }}>
            <View style={{ width: size.tile + 4, height: size.tile + 4, borderRadius: radius.tile, backgroundColor: colors.sunk, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="document-outline" size={size.icon + 2} color={colors.ink} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: fontSize.lead, fontFamily: fontFamily.semibold }}>Backup file</Text>
              <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.small }}>
                Your routines, workouts, records and settings in one file. Save it, then open it on your new phone.
              </Text>
            </View>
          </View>
          <Button
            label={createBackupBtn.label}
            icon={createBackupBtn.icon}
            large
            onPress={() => (createBackupBtn.paywall ? router.push(createBackupBtn.paywall) : onCreateBackup())}
          />
        </Card>
        <Card style={{ borderRadius: radius.card, paddingVertical: 0 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Automatic backups"
            onPress={() => router.push(autoRow.path)}
            style={({ pressed }) => ({ minHeight: size.pickerRow, flexDirection: "row", alignItems: "center", gap: spacing.md, opacity: pressed ? opacity.pressed : 1 })}
          >
            <Ionicons name="sync-outline" size={size.icon + 2} color={colors.ink} />
            <Text style={{ flex: 1, fontSize: fontSize.body, fontFamily: fontFamily.semibold }}>Automatic backups</Text>
            {autoRow.showProTag ? <Pill label="Pro" tone="neutral" /> : null}
            <Ionicons name="chevron-forward" size={size.check} color={colors.iconFaint} />
          </Pressable>
        </Card>
        <RestoreCard />
        <DeleteAllCard isPro={isPro} stats={stats} onCreateBackup={onCreateBackup} onDeleted={load} />
      </ScrollView>
    </View>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

import { Button, Card, RoundButton, ScreenHeader, Text } from "@/components";
import { exportRow } from "@/export/exportPro";
import { useIsPro } from "@/pro";
import { useUnit } from "@/settings";
import { fontFamily, fontSize, lineHeight, radius, size, spacing, useColors } from "@/theme";

import { FREQUENCY_OPTIONS } from "./autoBackupDue";
import { readAutoBackupSettings, type AutoBackupSettings } from "./autoBackupSettings";
import { autoBackupRow, createBackupButton } from "./backupPro";
import { createBackup, readLastBackup, yourDataStats, type YourDataStats } from "./backupQueries";
import { writeBackupFile } from "./backupShare";
import { autoBackupSummary, backedUpLabel } from "./backupText";
import { DataRow, SectionLabel } from "./DataRow";
import { DeleteAllCard } from "./DeleteAllCard";
import { RestoreRow } from "./RestoreCard";
import { useReadyBackup } from "./readyStore";

/**
 * Your data, opened from Settings. Top to bottom: what is stored on this phone and when it was last backed up; Back up
 * (Create backup, Automatic backups); Restore and export; Delete all data. A free lifter sees the Create backup button
 * and the Automatic backups and Export rows locked, opening the Paywall.
 */
export function YourDataScreen() {
  const colors = useColors();
  const isPro = useIsPro();
  const createBackupBtn = createBackupButton(isPro);
  const autoRow = autoBackupRow(isPro);
  const exportEntry = exportRow(isPro);
  const { unit } = useUnit();
  const [stats, setStats] = useState<YourDataStats>({ workouts: 0, sets: 0, records: 0 });
  const [backedUp, setBackedUp] = useState<{ at: number | null; label: string }>({ at: null, label: "No backup yet" });
  const [auto, setAuto] = useState<AutoBackupSettings>(() => readAutoBackupSettings());

  const load = useCallback(() => {
    setStats(yourDataStats(unit));
    const at = readLastBackup();
    setBackedUp({ at, label: backedUpLabel(at, Date.now()) });
    setAuto(readAutoBackupSettings());
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
  const frequencyLabel = FREQUENCY_OPTIONS.find((o) => o.value === auto.frequency)?.label ?? "";
  const hasBackup = backedUp.at !== null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader left={<RoundButton icon="chevron-back" label="Back" onPress={() => router.back()} />} title="Your data" />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.line }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <Ionicons name="phone-portrait-outline" size={size.check} color={colors.inkMuted} />
              <Text tone="muted" style={{ fontSize: fontSize.caption, lineHeight: lineHeight.subtitle }}>
                Only on this phone
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radius.pill,
                backgroundColor: hasBackup ? colors.accentTint : colors.sunk,
              }}
            >
              {hasBackup ? <Ionicons name="checkmark" size={size.check - 2} color={colors.accent} /> : null}
              <Text style={{ fontSize: fontSize.caption, lineHeight: lineHeight.caption, fontFamily: fontFamily.semibold, color: hasBackup ? colors.accent : colors.inkMuted }}>
                {backedUp.label}
              </Text>
            </View>
          </View>
        </Card>

        <SectionLabel>Back up</SectionLabel>
        <Card style={{ borderRadius: radius.card, paddingVertical: 0 }}>
          <View style={{ paddingVertical: spacing.lg, gap: spacing.md }}>
            <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
              <View style={{ width: size.tile, height: size.tile, borderRadius: radius.tile, backgroundColor: colors.sunk, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="document-outline" size={size.icon} color={colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSize.body, fontFamily: fontFamily.semibold }}>Backup file</Text>
                <Text tone="muted" style={{ fontSize: fontSize.caption, lineHeight: lineHeight.detail }}>
                  Everything in one file, for a new phone.
                </Text>
              </View>
            </View>
            <Button
              label={createBackupBtn.label}
              icon={createBackupBtn.icon}
              large
              onPress={() => (createBackupBtn.paywall ? router.push(createBackupBtn.paywall) : onCreateBackup())}
            />
          </View>
          <DataRow
            divider
            icon="sync-outline"
            title="Automatic backups"
            subtitle={isPro ? autoBackupSummary(auto.on, frequencyLabel, auto.keep) : "Backs up by itself"}
            proTag={autoRow.showProTag}
            onPress={() => router.push(autoRow.path)}
          />
        </Card>

        <SectionLabel>Restore and export</SectionLabel>
        <Card style={{ borderRadius: radius.card, paddingVertical: 0 }}>
          <RestoreRow />
          <DataRow
            divider
            icon="grid-outline"
            title="Export your progress"
            subtitle="Spreadsheet or PDF report"
            proTag={exportEntry.showProTag}
            onPress={() => router.push(exportEntry.path)}
          />
        </Card>

        <DeleteAllCard isPro={isPro} stats={stats} onCreateBackup={onCreateBackup} onDeleted={load} />
      </ScrollView>
    </View>
  );
}

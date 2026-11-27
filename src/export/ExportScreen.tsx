import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

import { deleteCachedFile, shareFile, writeBackupFile } from "@/backup/backupShare";
import { Button, Card, RoundButton, ScreenHeader, Text } from "@/components";
import { Segmented } from "@/settings/Segmented";
import { fontFamily, fontSize, lineHeight, radius, size, spacing, useColors } from "@/theme";

import { buildExport, csvText, EXPORT_RANGES, exportFileName, previewLines, type ExportRange } from "./exportBuild";

/**
 * Export progress (Pro): Spreadsheet ticked, a Time range, the Preview and "Export N sets", which hands the CSV to the
 * share sheet. The PDF report joins the Format picker in a later ticket.
 */
export function ExportScreen() {
  const colors = useColors();
  const [range, setRange] = useState<ExportRange>("all");
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());
  const build = useMemo(() => buildExport(range, now), [range, now]);
  const preview = previewLines(build.rows);
  const empty = build.setCount === 0;

  async function onExport() {
    if (busy || empty) return;
    setBusy(true);
    let uri: string | null = null;
    try {
      const file = writeBackupFile(exportFileName(new Date()), csvText(build.rows));
      uri = file.uri;
      const result = await shareFile(file, "text/csv", "Save or share export");
      if (result === "failed") Alert.alert("Couldn't share the export", "Your data is unchanged. Try again in a moment.");
    } catch {
      Alert.alert("Couldn't create the export", "Your data is unchanged. Try again in a moment.");
    } finally {
      if (uri) deleteCachedFile(uri);
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader left={<RoundButton icon="chevron-back" label="Back" onPress={() => router.back()} />} title="Export progress" />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: size.control * 3, gap: spacing.lg }}>
        <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.snug }}>
          Format
        </Text>
        <Card style={{ borderRadius: radius.card, paddingVertical: 0 }}>
          <View accessibilityRole="radio" accessibilityState={{ selected: true }} accessibilityLabel="Spreadsheet" style={{ minHeight: size.pickerRow, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <Ionicons name="grid-outline" size={size.icon + 2} color={colors.ink} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.body, fontFamily: fontFamily.semibold }}>Spreadsheet</Text>
              <Text tone="muted" style={{ fontSize: fontSize.small }}>
                CSV, every done set
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={size.icon + 2} color={colors.accent} />
          </View>
        </Card>

        <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.snug }}>
          Time range
        </Text>
        <Segmented options={EXPORT_RANGES} value={range} onChange={setRange} size="wide" track="card" accessibilityLabel="Time range" />

        <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.snug }}>
          Preview
        </Text>
        <Card style={{ borderRadius: radius.card, gap: spacing.sm }}>
          {empty ? (
            <Text tone="muted" style={{ fontSize: fontSize.small }}>
              No sets in this range.
            </Text>
          ) : (
            preview.map((line, i) => (
              <Text key={i} numberOfLines={1} style={{ fontSize: fontSize.small, lineHeight: lineHeight.small }}>
                {line}
              </Text>
            ))
          )}
        </Card>
        <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.small, paddingHorizontal: spacing.snug }}>
          This is a copy for reading, not a backup. It cannot be restored into Increment.
        </Text>
      </ScrollView>
      <View style={{ position: "absolute", left: spacing.xl, right: spacing.xl, bottom: spacing.xxl, alignItems: "center", gap: spacing.snug }}>
        {empty ? (
          <Text tone="muted" accessibilityRole="alert" style={{ fontSize: fontSize.label }}>
            No sets in this range.
          </Text>
        ) : null}
        <Button label={`Export ${build.setCount} ${build.setCount === 1 ? "set" : "sets"}`} icon="share-outline" large disabled={empty || busy} onPress={onExport} />
      </View>
    </View>
  );
}

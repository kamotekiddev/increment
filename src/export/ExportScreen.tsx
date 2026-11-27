import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { shareFile, writeBackupFile } from "@/backup/backupShare";
import { Button, Card, RoundButton, ScreenHeader, Text } from "@/components";
import { useUnit } from "@/settings";
import { Segmented } from "@/settings/Segmented";
import { fontFamily, fontSize, lineHeight, radius, size, spacing, useColors } from "@/theme";

import { buildExport, csvText, EXPORT_RANGES, exportFileName, previewLines, type ExportRange } from "./exportBuild";
import { buildReport, reportFileName, reportHtml, reportSummary } from "./reportBuild";
import { clearStaleExports, writeReportFile } from "./reportFile";

type Format = "csv" | "pdf";

const FORMATS: { value: Format; label: string; detail: string; icon: "grid-outline" | "document-text-outline" }[] = [
  { value: "csv", label: "Spreadsheet", detail: "CSV, every done set", icon: "grid-outline" },
  { value: "pdf", label: "PDF report", detail: "Totals, records and a chart per exercise", icon: "document-text-outline" },
];

/**
 * Export progress (Pro): Spreadsheet ticked (or the PDF report), a Time range, the Preview and "Export N sets", which
 * hands the file to the share sheet. Both formats read the same sets, so the count is the same.
 */
export function ExportScreen() {
  const colors = useColors();
  const { unit } = useUnit();
  const [format, setFormat] = useState<Format>("csv");
  const [range, setRange] = useState<ExportRange>("all");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  // A screen left open across midnight (or the app in the background) would keep a stale window and count.
  useFocusEffect(useCallback(() => setNow(Date.now()), []));
  const build = useMemo(() => buildExport(range, now), [range, now]);
  const report = useMemo(() => (format === "pdf" ? buildReport(range, now, unit, build.rows) : null), [format, range, now, unit, build]);
  const preview = format === "pdf" && report ? [reportSummary(report)] : previewLines(build.rows);
  const empty = build.setCount === 0;

  async function onExport() {
    if (busy || empty) return;
    setBusy(true);
    try {
      clearStaleExports();
      // Build again from the clock at the moment of export, so the content and the file name's date always agree.
      const at = Date.now();
      const today = new Date(at);
      const fresh = buildExport(range, at);
      const file =
        format === "pdf"
          ? await writeReportFile(reportFileName(today), reportHtml(buildReport(range, at, unit, fresh.rows), unit, today))
          : writeBackupFile(exportFileName(today), csvText(fresh.rows));
      const result = await shareFile(file, format === "pdf" ? "application/pdf" : "text/csv", "Save or share export");
      if (result === "failed") Alert.alert("Couldn't share the export", "Your data is unchanged. Try again in a moment.");
    } catch {
      Alert.alert("Couldn't create the export", "Your data is unchanged. Try again in a moment.");
    } finally {
      // The file stays in the cache until the next export (clearStaleExports): a receiving app may read it after the sheet closes.
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
          {FORMATS.map((f) => {
            const on = f.value === format;
            return (
              <Pressable
                key={f.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={f.label}
                onPress={() => setFormat(f.value)}
                style={{ minHeight: size.pickerRow, flexDirection: "row", alignItems: "center", gap: spacing.md }}
              >
                <Ionicons name={f.icon} size={size.icon + 2} color={colors.ink} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fontSize.body, fontFamily: fontFamily.semibold }}>{f.label}</Text>
                  <Text tone="muted" style={{ fontSize: fontSize.small }}>
                    {f.detail}
                  </Text>
                </View>
                <Ionicons name={on ? "checkmark-circle" : "ellipse-outline"} size={size.icon + 2} color={on ? colors.accent : colors.iconFaint} />
              </Pressable>
            );
          })}
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

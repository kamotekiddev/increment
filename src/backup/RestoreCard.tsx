import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { db } from "@/db/client";
import { fontSize, lineHeight, radius, size, spacing, useColors } from "@/theme";

import { parseBackup } from "./backupFile";
import { deleteCachedFile } from "./backupShare";
import { DataRow } from "./DataRow";
import { hasWorkoutInProgress } from "./restoreBackup";
import { usePickedBackup } from "./restoreStore";

interface Notice {
  title: string;
  message: string;
  icon: "time-outline" | "warning-outline" | "document-outline";
}

const BLOCKED: Notice = { title: "Workout in progress", message: "Finish or discard your workout first.", icon: "time-outline" };

/**
 * The Restore from a backup row on Your data (one row of its "Restore and export" card): open for everyone, no Pro check. Picks a file, checks all of it
 * (`parseBackup`) and opens the preview; a workout in progress, a newer version or an invalid file shows its sheet
 * and nothing changes.
 */
export function RestoreRow() {
  const colors = useColors();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  async function onPress() {
    if (busy) return;
    if (hasWorkoutInProgress(db)) {
      setNotice(BLOCKED);
      return;
    }
    setBusy(true);
    try {
      // The `.increment` extension has no MIME type, so any file is offered and the contents decide.
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      let text: string;
      try {
        text = await new File(asset.uri).text();
      } catch {
        deleteCachedFile(asset.uri);
        setNotice({ title: "Can’t restore this file", message: "This file couldn’t be read.", icon: "document-outline" });
        return;
      }
      deleteCachedFile(asset.uri);
      const parsed = parseBackup(text);
      if (!parsed.ok) {
        setNotice({
          title: parsed.reason === "newer_version" ? "Can’t restore this backup" : "Can’t restore this file",
          message: parsed.message,
          icon: parsed.reason === "newer_version" ? "warning-outline" : "document-outline",
        });
        return;
      }
      usePickedBackup.getState().set({ name: asset.name.replace(/\.increment$/, ""), bytes: asset.size ?? null, data: parsed.data });
      router.push("/restore-preview");
    } catch {
      setNotice({ title: "Can’t restore this file", message: "This file couldn’t be opened.", icon: "document-outline" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DataRow icon="download-outline" title="Restore from a backup" subtitle="Free for everyone" onPress={onPress} />
      <BottomSheet visible={notice !== null} onDismiss={() => setNotice(null)}>
        {notice && (
          <>
            <View style={{ alignItems: "center", gap: spacing.sm }}>
              <View style={{ width: size.emptyIcon, height: size.emptyIcon, borderRadius: radius.pill, backgroundColor: colors.dangerTint, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={notice.icon} size={size.icon + 6} color={colors.danger} />
              </View>
              <Text variant="heading" style={{ textAlign: "center" }}>
                {notice.title}
              </Text>
              <Text tone="muted" style={{ textAlign: "center", fontSize: fontSize.body, lineHeight: lineHeight.body }}>
                {notice.message}
              </Text>
            </View>
            <Button label="OK" large onPress={() => setNotice(null)} />
          </>
        )}
      </BottomSheet>
    </>
  );
}

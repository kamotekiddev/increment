import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

import { Card, Text } from "@/components";
import { requestForReminders } from "@/notifications";
import { refreshReminders, remindersDaysNote } from "@/reminders";
import { useRoutines } from "@/routines/routineQueries";
import { fontFamily, fontSize, opacity, radius, size, spacing, useColors } from "@/theme";

import { formatReminderTime } from "./reminderTime";
import { ReminderTimeSheet } from "./ReminderTimeSheet";
import { useReminderTime, useRemindersOn } from "./useReminderSettings";

/**
 * The Reminders card of Settings: the Training day reminders switch and, while it is on, the Time row
 * (opens the Reminder time sheet) and the days note. The switch turns on only once notifications are allowed.
 */
export function ReminderCard() {
  const colors = useColors();
  const { remindersOn, setRemindersOn } = useRemindersOn();
  const { reminderTimeMin, setReminderTime } = useReminderTime();
  const routines = useRoutines();
  const [sheetOpen, setSheetOpen] = useState(false);

  const onToggle = async (on: boolean) => {
    if (on && !(await requestForReminders())) return;
    setRemindersOn(on);
    void refreshReminders();
  };

  const days = remindersDaysNote(routines ?? []);

  const rowStyle = {
    height: size.settingsRow,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 2,
  } as const;
  const divider = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line } as const;
  const labelStyle = { flex: 1, fontSize: fontSize.body, fontFamily: fontFamily.medium } as const;

  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: 6 }}>
        Reminders
      </Text>
      <Card style={{ borderRadius: radius.card, paddingVertical: 0 }}>
        <View style={rowStyle}>
          <Text style={labelStyle}>Training day reminders</Text>
          <Switch
            accessibilityLabel="Training day reminders"
            value={remindersOn}
            onValueChange={onToggle}
            trackColor={{ false: colors.sunk, true: colors.accent }}
            thumbColor={colors.onAccent}
          />
        </View>
        {remindersOn ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Time ${formatReminderTime(reminderTimeMin)}`}
              onPress={() => setSheetOpen(true)}
              style={({ pressed }) => [rowStyle, divider, { opacity: pressed ? opacity.pressed : 1 }]}
            >
              <Text style={labelStyle}>Time</Text>
              <Text variant="label" style={{ fontSize: fontSize.body }}>
                {formatReminderTime(reminderTimeMin)}
              </Text>
              <Ionicons name="chevron-forward" size={size.check} color={colors.iconFaint} />
            </Pressable>
            <View style={[{ flexDirection: "row", gap: spacing.sm, paddingTop: spacing.md, paddingBottom: 14 }, divider]}>
              <Ionicons name="calendar-outline" size={15} color={colors.inkMuted} style={{ marginTop: 2 }} />
              <Text tone="muted" style={{ flex: 1, fontSize: fontSize.small, lineHeight: 19 }}>
                {days ? (
                  <>
                    <Text style={{ fontSize: fontSize.small, fontFamily: fontFamily.semibold }}>{days}</Text>
                    {" · from your Routines’ days"}
                  </>
                ) : (
                  "No training days yet. Set days on a Routine."
                )}
              </Text>
            </View>
          </>
        ) : null}
      </Card>
      <ReminderTimeSheet
        visible={sheetOpen}
        minutes={reminderTimeMin}
        onDismiss={() => setSheetOpen(false)}
        onSave={(minutes) => {
          setSheetOpen(false);
          setReminderTime(minutes);
          void refreshReminders();
        }}
      />
    </View>
  );
}

import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { useState } from "react";
import { View } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { fontSize, spacing } from "@/theme";

import { dateAtMinutes, minutesOfDate } from "./reminderTime";

export interface ReminderTimeSheetProps {
  visible: boolean;
  /** The saved time in minutes after midnight, shown when the sheet opens. */
  minutes: number;
  /** Save: the picked time. Cancel and swipe-down only call `onDismiss`. */
  onSave: (minutes: number) => void;
  onDismiss: () => void;
}

/** The Reminder time sheet: the phone's own hour:minute picker, Save and Cancel. Nothing is written until Save. */
export function ReminderTimeSheet({ visible, minutes, onSave, onDismiss }: ReminderTimeSheetProps) {
  // What the lifter picked since the sheet opened; null until they move the picker, so it opens on the saved time.
  const [picked, setPicked] = useState<Date | null>(null);
  const draft = picked ?? dateAtMinutes(minutes);
  const close = () => {
    setPicked(null);
    onDismiss();
  };

  return (
    <BottomSheet visible={visible} onDismiss={close}>
      <View style={{ alignItems: "center", gap: spacing.snug, paddingTop: spacing.md }}>
        <Text variant="title" style={{ fontSize: fontSize.titleLg }}>
          Reminder time
        </Text>
        <Text tone="muted" style={{ textAlign: "center" }}>
          The same time on every training day.
        </Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <DateTimePicker
          mode="time"
          display="spinner"
          presentation="inline"
          value={draft}
          onValueChange={(_event, date) => setPicked(date)}
        />
      </View>
      <Button label="Save" large onPress={() => {
          setPicked(null);
          onSave(minutesOfDate(draft));
        }} />
      <Button label="Cancel" variant="secondary" stretch onPress={close} />
    </BottomSheet>
  );
}

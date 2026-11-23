import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  View,
  type ViewStyle,
} from "react-native";

import { Card, Text } from "@/components";
import {
  isPermissionGranted,
  notificationsOffNote,
  requestForReminders,
} from "@/notifications";
import { refreshReminders, remindersDaysNote } from "@/reminders";
import { useRoutines } from "@/routines/routineQueries";
import {
  fontFamily,
  fontSize,
  lineHeight,
  noteRow,
  opacity,
  radius,
  size,
  spacing,
  useColors,
} from "@/theme";

import { formatReminderTime } from "./reminderTime";
import { ReminderTimeSheet } from "./ReminderTimeSheet";
import { useReminderTime, useRemindersOn } from "./useReminderSettings";

/** A note under a Reminders row: a small icon and its text, on a divider. */
function NoteRow({
  icon,
  iconColor,
  style,
  children,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  style: ViewStyle;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          gap: spacing.sm,
          paddingTop: spacing.md,
          paddingBottom: noteRow.paddingBottom,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={noteRow.icon} color={iconColor} style={{ marginTop: noteRow.iconTop }} />
      {children}
    </View>
  );
}

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

  // Screen state only: the last read of the OS permission, and whether the switch was just refused.
  const [granted, setGranted] = useState<boolean | null>(null);
  const [askedDenied, setAskedDenied] = useState(false);

  const wasBlocked = useRef(false);

  // Reads the permission on open and on every return to the foreground. Once it flips to allowed,
  // reminders schedule again without touching the switch.
  useEffect(() => {
    let live = true;
    const read = () => {
      void isPermissionGranted().then((now) => {
        if (!live) return;
        if (now && wasBlocked.current) void refreshReminders();
        wasBlocked.current = !now;
        setGranted(now);
      });
    };
    read();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") read();
    });
    return () => {
      live = false;
      sub.remove();
    };
  }, []);

  const onToggle = async (on: boolean) => {
    if (on && !(await requestForReminders())) {
      wasBlocked.current = true;
      setGranted(false);
      setAskedDenied(true);
      return;
    }
    if (on) {
      wasBlocked.current = false;
      setGranted(true);
    }
    setAskedDenied(false);
    setRemindersOn(on);
    void refreshReminders();
  };

  const offNote = notificationsOffNote({ remindersOn, granted, askedDenied });

  const days = remindersDaysNote(routines ?? []);

  const rowStyle = {
    height: size.settingsRow,
    flexDirection: "row",
    alignItems: "center",
    gap: noteRow.rowGap,
  } as const;
  const divider = {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  } as const;
  const labelStyle = {
    flex: 1,
    fontSize: fontSize.body,
    fontFamily: fontFamily.medium,
  } as const;

  return (
    <View style={{ gap: spacing.sm }}>
      <Text
        variant="caption"
        tone="muted"
        style={{
          fontSize: fontSize.small,
          fontFamily: fontFamily.medium,
          paddingHorizontal: spacing.snug,
        }}
      >
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
              style={({ pressed }) => [
                rowStyle,
                divider,
                { opacity: pressed ? opacity.pressed : 1 },
              ]}
            >
              <Text style={labelStyle}>Time</Text>
              <Text variant="label" style={{ fontSize: fontSize.body }}>
                {formatReminderTime(reminderTimeMin)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={size.check}
                color={colors.iconFaint}
              />
            </Pressable>
            {offNote ? null : (
              <NoteRow icon="calendar-outline" iconColor={colors.inkMuted} style={divider}>
                <Text
                  tone="muted"
                  style={{ flex: 1, fontSize: fontSize.small, lineHeight: lineHeight.small }}
                >
                  {days ? (
                    <>
                      <Text
                        style={{
                          fontSize: fontSize.small,
                          fontFamily: fontFamily.semibold,
                        }}
                      >
                        {days}
                      </Text>
                      {" · from your Routines’ days"}
                    </>
                  ) : (
                    "No training days yet. Set days on a Routine."
                  )}
                </Text>
              </NoteRow>
            )}
          </>
        ) : null}
        {offNote ? (
          <NoteRow icon="notifications-off-outline" iconColor={colors.warn} style={divider}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text
                style={{
                  fontSize: fontSize.small,
                  lineHeight: lineHeight.small,
                  fontFamily: fontFamily.semibold,
                }}
              >
                Notifications are off for Increment.
              </Text>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open settings"
                onPress={() => void Linking.openSettings()}
                hitSlop={spacing.sm}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: pressed ? opacity.pressed : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: fontSize.small,
                    lineHeight: lineHeight.small,
                    fontFamily: fontFamily.semibold,
                    color: colors.accent,
                  }}
                >
                  Open settings
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={noteRow.icon}
                  color={colors.accent}
                />
              </Pressable>
            </View>
          </NoteRow>
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

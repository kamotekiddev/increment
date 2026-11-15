import { Redirect } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { BottomSheet, Button, Card, Input, Pill, Text } from "@/components";
import { spacing, useColors } from "@/theme";

/** Developer-only: every base component in one place. Not reachable in release builds. */
export default function Gallery() {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.xxl * 2, gap: spacing.lg }}
    >
      <Text variant="heading">Gallery</Text>

      <Text variant="caption" tone="muted">Text</Text>
      <Text variant="numeral">62.5 kg</Text>
      <Text variant="title">Bench press</Text>
      <Text>Hit 8 on every set and it becomes 65 kg</Text>
      <Text tone="muted" variant="caption">Caption in muted</Text>
      <Text tone="danger" variant="label">Delete all data</Text>

      <Text variant="caption" tone="muted">Button</Text>
      <Button label="Start workout" onPress={() => setOpen(true)} />
      <Button label="Skip" variant="secondary" onPress={() => {}} />
      <Button label="Disabled" disabled onPress={() => {}} />

      <Text variant="caption" tone="muted">Pill</Text>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <Pill label="New record" />
        <Pill label="→ 65 kg" />
        <Pill label="Weight first" tone="neutral" />
      </View>

      <Text variant="caption" tone="muted">Card</Text>
      <Card>
        <Text variant="label">Push day</Text>
        <Text tone="muted" variant="caption">5 exercises</Text>
      </Card>

      <Text variant="caption" tone="muted">Input</Text>
      <Input placeholder="Weight" keyboardType="decimal-pad" value={value} onChangeText={setValue} />

      <Text variant="caption" tone="muted">Bottom sheet (tap Start workout)</Text>
      <BottomSheet visible={open} onDismiss={() => setOpen(false)}>
        <Text variant="title">Limit reached</Text>
        <Text tone="muted">Free includes 3 routines. Unlock Pro for more.</Text>
        <Button label="Close" onPress={() => setOpen(false)} />
      </BottomSheet>
    </ScrollView>
  );
}

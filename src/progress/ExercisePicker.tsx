import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { BottomSheet, Input, Text } from "@/components";
import { equipmentIcon } from "@/library/exerciseMeta";
import { fontFamily, minTouch, opacity, radius, size, spacing, useColors } from "@/theme";

import { filterPicker, showsSearch } from "./pickerFilter";
import { pickStore } from "./pickStore";
import { pickerExercises, type PickerExercise } from "./progressQueries";

/** Tallest the list grows inside the sheet before it scrolls. */
const LIST_MAX_HEIGHT = 420;

function EquipmentTile({ equipment }: { equipment: string }) {
  const colors = useColors();
  return (
    <View style={{ width: size.tile, height: size.tile, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.sunk }}>
      <MaterialCommunityIcons name={equipmentIcon(equipment)} size={size.icon} color={colors.ink} />
    </View>
  );
}

/**
 * The exercise pill under the Progress title. Tapping it opens a bottom sheet with every exercise Progress can
 * show (search above 8); tapping a row remembers the pick and closes the sheet.
 */
export function ExercisePicker({ exerciseId, name, equipment }: { exerciseId: number; name: string; equipment: string }) {
  const colors = useColors();
  const [list, setList] = useState<PickerExercise[] | null>(null);
  const [query, setQuery] = useState("");

  const open = () => {
    setQuery("");
    setList(pickerExercises());
  };
  const close = () => setList(null);
  const choose = (id: number) => {
    pickStore.getState().pick(id);
    close();
  };
  const shown = list ? filterPicker(list, query) : [];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Exercise: ${name}`}
        onPress={open}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          height: 60,
          paddingLeft: 10,
          paddingRight: 18,
          borderRadius: radius.pill,
          backgroundColor: colors.card,
          opacity: pressed ? opacity.pressed : 1,
        })}
      >
        <EquipmentTile equipment={equipment} />
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: fontFamily.semibold }}>
          {name}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.iconFaint} />
      </Pressable>
      <BottomSheet visible={list !== null} onDismiss={close}>
        <Text variant="title">Choose exercise</Text>
        {list && showsSearch(list) ? (
          <Input value={query} onChangeText={setQuery} placeholder="Search exercises" autoCorrect={false} clearButtonMode="while-editing" />
        ) : null}
        <ScrollView style={{ maxHeight: LIST_MAX_HEIGHT }} keyboardShouldPersistTaps="handled">
          {shown.map((e) => (
            <Pressable
              key={e.exerciseId}
              accessibilityRole="button"
              accessibilityState={{ selected: e.exerciseId === exerciseId }}
              onPress={() => choose(e.exerciseId)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                minHeight: minTouch,
                paddingVertical: spacing.sm,
                opacity: pressed ? opacity.pressed : 1,
              })}
            >
              <EquipmentTile equipment={e.equipment} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: fontFamily.semibold }}>
                  {e.name}
                </Text>
                <Text tone="muted" variant="caption">
                  {e.lastDoneLabel ?? "Not done yet"}
                </Text>
              </View>
              {e.exerciseId === exerciseId ? <Ionicons name="checkmark" size={22} color={colors.accent} /> : null}
            </Pressable>
          ))}
          {list && shown.length === 0 ? <Text tone="muted">No exercises match.</Text> : null}
        </ScrollView>
      </BottomSheet>
    </>
  );
}

import { useEffect, useState } from "react";
import { Animated, Platform, Pressable, Switch, View } from "react-native";

import { size, useColors } from "@/theme";

type SettingsSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

const TRAVEL = size.switchTrackWidth - size.switchThumb - size.switchInset * 2;

/** Android's own switch is a Material one; this draws the iOS look (pill track, white round thumb) so the app matches on both. */
function AndroidSwitch({ value, onValueChange, accessibilityLabel }: SettingsSwitchProps) {
  const colors = useColors();
  const [position] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(position, { toValue: value ? 1 : 0, duration: 160, useNativeDriver: true }).start();
  }, [value, position]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={{
        width: size.switchTrackWidth,
        height: size.switchTrackHeight,
        borderRadius: size.switchTrackHeight / 2,
        backgroundColor: value ? colors.accent : colors.sunk,
        justifyContent: "center",
        paddingHorizontal: size.switchInset,
      }}
    >
      <Animated.View
        style={{
          width: size.switchThumb,
          height: size.switchThumb,
          borderRadius: size.switchThumb / 2,
          backgroundColor: colors.onAccent,
          elevation: 2,
          transform: [{ translateX: position.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] }) }],
        }}
      />
    </Pressable>
  );
}

/**
 * The on/off switch of a Settings row. iOS uses the native switch, which is drawn at the top of its layout
 * box, so it is wrapped in a box that stretches to the row's height and centres it. Android draws the iOS look.
 */
export function SettingsSwitch(props: SettingsSwitchProps) {
  const colors = useColors();
  return (
    <View style={{ alignSelf: "stretch", justifyContent: "center" }}>
      {Platform.OS === "android" ? (
        <AndroidSwitch {...props} />
      ) : (
        <Switch
          accessibilityLabel={props.accessibilityLabel}
          value={props.value}
          onValueChange={props.onValueChange}
          trackColor={{ false: colors.sunk, true: colors.accent }}
          thumbColor={colors.onAccent}
        />
      )}
    </View>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RoundButton, Text } from "@/components";
import {
  fontFamily,
  fontSize,
  lineHeight,
  minTouch,
  opacity,
  pro,
  radius,
  size,
  spacing,
  textStyle,
  useColors,
} from "@/theme";

import {
  boughtPendingAfter,
  paywallState,
  productAfterReload,
  restoreOutcome,
  restoreResult,
  type PaywallButton as PaywallButtonState,
  type PaywallProduct,
} from "./paywallState";
import { buyPro, fetchProProduct, proStore, useProPending } from "./usePro";

/** A table cell's value: included, not included, or a short text ("Unlimited", "2"). */
type Cell = true | false | string;

/** The Free/Pro table, top to bottom, as drawn on the canvas. */
const ROWS: { feature: string; free: Cell; pro: Cell }[] = [
  { feature: "Exercise library", free: true, pro: true },
  { feature: "Log workouts", free: "Unlimited", pro: "Unlimited" },
  { feature: "Move to a new phone", free: false, pro: true },
  { feature: "Automatic backups", free: false, pro: true },
  { feature: "Routines", free: "2", pro: "Unlimited" },
  { feature: "Charts and records", free: false, pro: true },
  { feature: "Custom exercises", free: false, pro: true },
  { feature: "Export to CSV or PDF", free: false, pro: true },
];

function CellValue({ value, inPro }: { value: Cell; inPro: boolean }) {
  const colors = useColors();
  if (value === true) {
    return (
      <Ionicons
        name="checkmark"
        size={size.check}
        color={inPro ? colors.accent : colors.inkMuted}
        accessibilityLabel="Included"
      />
    );
  }
  if (value === false) {
    return (
      <Text accessibilityLabel="Not included" style={{ color: colors.iconFaint, fontSize: fontSize.lead }}>
        –
      </Text>
    );
  }
  return (
    <Text
      tone={inPro ? "accent" : "soft"}
      style={{
        fontFamily: inPro ? fontFamily.semibold : fontFamily.medium,
        fontSize: fontSize.caption,
        lineHeight: lineHeight.caption,
        textAlign: "center",
      }}
    >
      {value}
    </Text>
  );
}

/** The 9-row Free/Pro table, with the Pro column on the accent tint. */
function ProTable() {
  const colors = useColors();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.card,
        paddingTop: spacing.snug,
        paddingRight: spacing.md,
        paddingBottom: spacing.md,
        paddingLeft: spacing.lg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", height: pro.tableRow }}>
        <Text tone="muted" style={{ flex: 1, fontFamily: fontFamily.medium, fontSize: fontSize.caption }}>
          What you get
        </Text>
        <Text tone="muted" style={{ width: pro.freeColumn, textAlign: "center", fontFamily: fontFamily.semibold, fontSize: fontSize.small }}>
          Free
        </Text>
        <View
          style={{
            width: pro.proColumn,
            height: pro.tableRow,
            backgroundColor: colors.accentTint,
            borderTopLeftRadius: radius.md,
            borderTopRightRadius: radius.md,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
            <Text tone="onAccent" style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.caption }}>
              Pro
            </Text>
          </View>
        </View>
      </View>
      {ROWS.map((row, i) => {
        const last = i === ROWS.length - 1;
        return (
          <View key={row.feature} style={{ flexDirection: "row", minHeight: pro.tableRow }}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                paddingVertical: spacing.sm,
                paddingRight: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: colors.line,
              }}
            >
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.meta, lineHeight: lineHeight.subtitle }}>{row.feature}</Text>
            </View>
            <View
              style={{ width: pro.freeColumn, alignItems: "center", justifyContent: "center", borderTopWidth: 1, borderTopColor: colors.line }}
            >
              <CellValue value={row.free} inPro={false} />
            </View>
            <View
              style={{
                width: pro.proColumn,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.accentTint,
                borderTopWidth: 1,
                borderTopColor: colors.accentTintLine,
                borderBottomLeftRadius: last ? radius.md : 0,
                borderBottomRightRadius: last ? radius.md : 0,
              }}
            >
              <CellValue value={row.pro} inPro />
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** The Unlock Pro button: accent, or the pale pending look with a clock. Disabled accent dims; pending doesn't. */
function UnlockButton({ state, onPress }: { state: PaywallButtonState; onPress: () => void }) {
  const colors = useColors();
  const pending = state.look === "pending";
  const ink = pending ? colors.accent : colors.onAccent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={state.label}
      accessibilityState={{ disabled: !state.enabled, busy: state.spinner }}
      disabled={!state.enabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignSelf: "stretch",
        height: size.control,
        borderRadius: radius.pill,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        backgroundColor: pending ? colors.accentTint : colors.accent,
        opacity: !state.enabled && !pending ? opacity.disabled : pressed ? opacity.pressed : 1,
      })}
    >
      {state.spinner ? <ActivityIndicator size="small" color={ink} /> : null}
      {pending ? <Ionicons name="time-outline" size={size.icon} color={ink} /> : null}
      <Text style={{ color: ink, fontFamily: fontFamily.semibold, fontSize: fontSize.action }}>{state.label}</Text>
    </Pressable>
  );
}

/**
 * The Paywall: the Free/Pro table and the one-time purchase. It fetches the store's price on open and on
 * each return to the foreground. Once Pro switches on, Pro unlocked takes its place (`useProUnlockedScreen`).
 */
export function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<PaywallProduct>({ kind: "loading" });
  const [inFlight, setInFlight] = useState(false);
  const [restoring, setRestoring] = useState(false);
  // iOS reports Ask to Buy only through the buy itself; the store's own pending flag never sees it.
  const [boughtPending, setBoughtPending] = useState(false);
  const storePending = useProPending();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const load = () =>
      void fetchProProduct().then((next) => {
        // A reload that fails keeps a price already shown.
        if (mounted.current) setProduct((previous) => productAfterReload(previous, next));
      });
    load();
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") return;
      load();
      // A declined Ask to Buy only shows as nothing owned: ask, and let the answer end "Payment pending".
      void proStore
        .getState()
        .refresh()
        .then((answer) => {
          if (mounted.current) setBoughtPending((current) => boughtPendingAfter(current, answer));
        });
    });
    return () => {
      mounted.current = false;
      sub.remove();
    };
  }, []);

  const state = paywallState({ product, pending: storePending || boughtPending, inFlight });

  async function unlock() {
    setInFlight(true);
    const result = await buyPro();
    if (result.kind === "purchased" || result.kind === "pending") {
      // Asking the store again switches Pro on (and Pro unlocked replaces this screen) or reports pending.
      await proStore.getState().refresh();
    }
    if (!mounted.current) return;
    setInFlight(false);
    // On Android the store's pending flag covers it, so the button returns to normal if the payment is cancelled.
    if (result.kind === "pending" && Platform.OS === "ios") setBoughtPending(true);
    if (result.kind === "error") {
      Alert.alert("Purchase didn't go through", "You weren't charged. Try again in a moment.", [{ text: "OK" }]);
    }
  }

  /**
   * Restore purchase: the same check as at launch. Found switches Pro on, and Pro unlocked replaces this
   * screen; pending sets the store's pending flag, which gives the Payment pending state. Nothing found
   * and no answer get one alert.
   */
  async function restore() {
    setRestoring(true);
    const answer = await proStore.getState().refresh();
    if (!mounted.current) return;
    setRestoring(false);
    setBoughtPending((current) => boughtPendingAfter(current, answer));
    const result = restoreResult(restoreOutcome(answer), Platform.OS);
    if (result.kind === "alert") Alert.alert(result.title, result.body, [{ text: "OK" }]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg + spacing.xs,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.lg,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: size.round }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={restoring ? "Checking…" : "Restore purchase"}
            accessibilityState={{ disabled: restoring, busy: restoring }}
            disabled={restoring}
            onPress={() => void restore()}
            style={({ pressed }) => ({
              minHeight: minTouch,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              paddingHorizontal: spacing.xs,
              opacity: pressed ? opacity.pressed : 1,
            })}
          >
            {restoring ? <ActivityIndicator size="small" color={colors.iconFaint} /> : null}
            <Text
              tone="muted"
              style={[{ fontFamily: fontFamily.medium, fontSize: fontSize.label }, restoring && { color: colors.iconFaint }]}
            >
              {restoring ? "Checking…" : "Restore purchase"}
            </Text>
          </Pressable>
          <RoundButton icon="close" label="Close" onPress={() => router.back()} />
        </View>
        <View style={{ gap: spacing.xs, paddingTop: spacing.md, paddingHorizontal: spacing.xs }}>
          <Text accessibilityRole="header" style={{ fontFamily: fontFamily.bold, ...textStyle.screenTitle }}>
            Increment Pro
          </Text>
          <Text tone="muted" style={{ fontSize: fontSize.body, lineHeight: lineHeight.body }}>
            Pay once and keep it forever.
          </Text>
        </View>
        <ProTable />
        <View style={{ alignItems: "center", gap: spacing.sm }}>
          <UnlockButton state={state} onPress={() => void unlock()} />
          <Text
            tone={state.lineStrong ? "soft" : "muted"}
            style={{
              fontFamily: state.lineStrong ? fontFamily.medium : fontFamily.regular,
              fontSize: fontSize.caption,
              lineHeight: lineHeight.detail,
              textAlign: "center",
            }}
          >
            {state.line}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

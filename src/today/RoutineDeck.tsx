import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AccessibilityInfo, Animated, PanResponder, View } from "react-native";

import { Text } from "@/components";
import { deck, radius, size, spacing, useColors } from "@/theme";

import { RoutineHeroCard } from "./RoutineHeroCard";
import type { TodayCard } from "./todayState";

/**
 * The Today cards. One card is a plain card. Two or more form a deck: the top card plus up to two
 * layers underneath. Drag the top card sideways and the next one rises, grows and fills with colour;
 * past a threshold (or a flick) the top card flies off to the back. Screen readers get a "next
 * routine" action instead of the swipe.
 */
export function RoutineDeck({ cards, onStart }: { cards: TodayCard[]; onStart: (card: TodayCard) => void }) {
  if (cards.length === 1) return <RoutineHeroCard card={cards[0]} onStart={() => onStart(cards[0])} />;
  return <Deck cards={cards} onStart={onStart} />;
}

function Deck({ cards, onStart }: { cards: TodayCard[]; onStart: (card: TodayCard) => void }) {
  const colors = useColors();
  const [x] = useState(() => new Animated.Value(0));
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const n = cards.length;
  const top = index % n;

  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (live) setReduceMotion(on);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      live = false;
      sub.remove();
    };
  }, []);

  // x resets here, in the same frame the new top card is drawn, so the revealed content never
  // drops to opacity 0 for a frame between the fly-off ending and the swap.
  useLayoutEffect(() => {
    x.setValue(0);
  }, [top, x]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > deck.panStart && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: Animated.event([null, { dx: x }], { useNativeDriver: false }),
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > deck.swipeDistance || Math.abs(g.vx) > deck.flickVelocity) {
            Animated.timing(x, {
              toValue: Math.sign(g.dx || g.vx) * deck.flyDistance,
              duration: reduceMotion ? 0 : deck.flyDuration,
              useNativeDriver: false,
            }).start(() => setIndex((i) => (i + 1) % n));
          } else {
            Animated.spring(x, { toValue: 0, useNativeDriver: false }).start();
          }
        },
      }),
    [x, n, reduceMotion],
  );

  const order = cards.map((_, i) => cards[(top + i) % n]);
  const rotate = x.interpolate({
    inputRange: [-deck.tiltDistance, 0, deck.tiltDistance],
    outputRange: [`-${deck.tilt}deg`, "0deg", `${deck.tilt}deg`],
  });
  // 0 at rest, 1 once the top card is dragged revealDistance either way: how far the deck has opened.
  const p = x.interpolate({ inputRange: [-deck.revealDistance, 0, deck.revealDistance], outputRange: [1, 0, 1], extrapolate: "clamp" });
  const next = () => setIndex((i) => (i + 1) % n);

  return (
    <View style={{ gap: spacing.md }}>
      <View
        accessibilityActions={[{ name: "next", label: "Next routine" }]}
        onAccessibilityAction={next}
        style={{ height: deck.cardHeight + deck.offset * 2 }}
      >
        {order
          .map((card, depth) => ({ card, depth }))
          .reverse()
          .map(({ card, depth }) => {
            const base = { position: "absolute" as const, left: 0, right: 0, top: 0, height: deck.cardHeight };
            if (depth === 0) {
              return (
                <Animated.View key={card.routineId} {...pan.panHandlers} style={[base, { transform: [{ translateX: x }, { rotate }] }]}>
                  <Animated.View style={{ flex: 1, opacity: 1 }}>
                    <RoutineHeroCard card={card} onStart={() => onStart(card)} fill />
                  </Animated.View>
                </Animated.View>
              );
            }
            const slotNow = Math.min(depth, 2);
            // Each layer moves up one slot as the top card is dragged away.
            const slot = p.interpolate({ inputRange: [0, 1], outputRange: [slotNow, slotNow - 1] });
            const offsetY = slot.interpolate({ inputRange: [0, 1, 2], outputRange: [0, deck.offset, deck.offset * 2] });
            const scale = slot.interpolate({ inputRange: [0, 1, 2], outputRange: [...deck.scales] });
            const tint = slot.interpolate({ inputRange: [0, 1, 2], outputRange: [colors.accent, colors.accentLayer1, colors.accentLayer2] });
            return (
              <Animated.View
                key={card.routineId}
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[base, { top: offsetY, transform: [{ scale }], backgroundColor: tint, borderRadius: radius.card }]}
              >
                {depth === 1 ? (
                  <Animated.View style={{ flex: 1, opacity: p }}>
                    <RoutineHeroCard card={card} onStart={() => onStart(card)} fill />
                  </Animated.View>
                ) : null}
              </Animated.View>
            );
          })}
      </View>
      <View
        accessible
        accessibilityLabel={`Routine ${top + 1} of ${n}, ${cards[top].name}`}
        accessibilityActions={[{ name: "next", label: "Next routine" }]}
        onAccessibilityAction={next}
        style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing.sm }}
      >
        {cards.map((card, i) => (
          <View
            key={card.routineId}
            style={{
              width: i === top ? deck.dotActiveWidth : size.dot,
              height: size.dot,
              borderRadius: radius.pill,
              backgroundColor: i === top ? colors.accent : colors.lineStrong,
            }}
          />
        ))}
        <Text variant="caption" tone="muted">{`${top + 1} of ${n} · swipe`}</Text>
      </View>
    </View>
  );
}

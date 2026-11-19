/** Design tokens from docs/design-system.md. Components read these; no hard-coded colors or sizes. */

export const lightColors = {
  bg: "#F4F4F2",
  card: "#FFFFFF",
  sunk: "#EFEFEC",
  line: "#E6E6E3",
  ink: "#111113",
  inkSoft: "#3A3A3F",
  inkMuted: "#6B6B70",
  iconFaint: "#85858B",
  /** Dashed outlines of empty states. */
  lineStrong: "#C9C9CC",
  accent: "#5B3DF5",
  /** Progress pills and highlights (alias: pr). */
  accentTint: "#EFEAFF",
  /** Second and third card of the Today deck: lighter than the accent, one step each. */
  accentLayer1: "#9D8BF9",
  accentLayer2: "#CEC5FC",
  onAccent: "#FFFFFF",
  danger: "#C62828",
  /** Soft red behind a destructive icon (delete and remove sheets). */
  dangerTint: "#FDECEC",
} as const;

export type Colors = { [K in keyof typeof lightColors]: string };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 16, lg: 24, tile: 14, inset: 20, row: 22, card: 26, pill: 999 } as const;

/** Sora weights. Names match what useFonts registers. */
export const fontFamily = {
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semibold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
  extrabold: "Sora_800ExtraBold",
} as const;

export const fontSize = {
  caption: 12,
  small: 13,
  meta: 13.5,
  label: 14,
  body: 15,
  lead: 16,
  action: 17,
  input: 18,
  title: 20,
  titleLg: 22,
  screen: 24,
  heading: 28,
  display: 32,
  numeral: 40,
} as const;

/** Fixed heights and widths of controls and rows, in points. */
export const size = {
  round: 48,
  control: 56,
  row: 66,
  pickerRow: 62,
  day: 46,
  tile: 40,
  icon: 20,
  check: 16,
  dot: 6,
  heroTile: 64,
  heroIcon: 32,
  bannerCircle: 44,
  smallTile: 32,
  /** A Settings list row (Smallest weight jump). */
  settingsRow: 54,
  /** The round − / + of a Weight jumps row; hitSlop takes its touch target to `minTouch`. */
  stepper: 36,
  /** The least width of a Jump value between − and +, so the row does not shift as the value changes. */
  jumpValue: 62,
} as const;

/** Border widths. */
export const borderWidth = { outline: 2 } as const;

/** The Today routine deck: sizes in points, drag distances and scales. */
export const deck = {
  cardHeight: 200,
  /** Each card underneath sits this far lower than the one above. */
  offset: 14,
  /** Scale of the second and third card (the top card is 1). */
  scales: [1, 0.95, 0.9],
  /** A drag past this, or a quick flick, sends the top card away. */
  swipeDistance: 70,
  flickVelocity: 0.6,
  /** A drag must be this far sideways before the deck takes the gesture, so Start still taps. */
  panStart: 8,
  /** Drag distance at which the next card is fully revealed. */
  revealDistance: 150,
  /** Where a flung card flies to, and how long it takes (ms). */
  flyDistance: 420,
  flyDuration: 160,
  /** Tilt in degrees at `tiltDistance` of drag. */
  tilt: 6,
  tiltDistance: 200,
  /** Page dots: the current one is a wider pill. */
  dotActiveWidth: 18,
} as const;

/** Minimum touch target, in points. */
export const minTouch = 44;

/** Opacity for interactive states. One disabled value everywhere. */
export const opacity = { pressed: 0.85, disabled: 0.4, onAccentSoft: 0.85 } as const;

/** Line heights for text that sets its own size. */
export const lineHeight = {
  /** A note or caption at `fontSize.small`. */
  small: 19,
  /** A paragraph at `fontSize.body`. */
  body: 21,
  title: 24,
  screen: 38,
} as const;

/** Letter spacing for text that sets its own tracking. */
export const letterSpacing = {
  /** A weight shown as a value (a Jump between − and +): numbers use tight tracking. */
  value: -0.3,
} as const;

/** Shared text styles for headings that set their own size, line height and tracking. */
export const textStyle = {
  /** Big screen heading on a tab (Today, Routines). */
  screenTitle: { fontSize: fontSize.display, lineHeight: lineHeight.screen, letterSpacing: -1 },
  /** Title of a row or card. */
  rowTitle: { fontSize: fontSize.input, lineHeight: lineHeight.title, letterSpacing: -0.4 },
} as const;

/** The rest panel pinned to the bottom of the live workout: ring size and stroke in points, top corner radius. */
export const restPanel = { ring: 96, stroke: 6, corner: 32, time: 24, timeLine: 28, label: 11 } as const;

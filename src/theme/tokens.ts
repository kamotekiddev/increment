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
  /** A divider drawn on the accent tint (the Pro column of the Paywall table). */
  accentTintLine: "#E2DAFF",
  /** Second and third card of the Today deck: lighter than the accent, one step each. */
  accentLayer1: "#9D8BF9",
  accentLayer2: "#CEC5FC",
  onAccent: "#FFFFFF",
  danger: "#C62828",
  /** Soft red behind a destructive icon (delete and remove sheets). */
  dangerTint: "#FDECEC",
  /** Caution mark: the notifications-off note in Settings. */
  warn: "#B4541A",
} as const;

export type Colors = { [K in keyof typeof lightColors]: string };

export const spacing = {
  xs: 4,
  /** Between xs and sm: a small label inset, a title-to-subtitle gap. */
  snug: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = { sm: 10, md: 16, lg: 24, tile: 14, tileLg: 16, inset: 20, row: 22, card: 26, hero: 30, pill: 999 } as const;

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
  libraryRow: 70,
  tileLg: 46,
  chip: 40,
  search: 54,
  searchCompact: 50,
  emptyIcon: 60,
  hero: 190,
  stepNumber: 26,
  /** A Settings list row (Default rest, Show previous set). */
  settingsRow: 54,
  /** The round − / + of a Settings row (Default rest); hitSlop takes its touch target to `minTouch`. */
  stepper: 36,
  /** The least width of a value between − and + (Default rest), so the row does not shift as the value changes. */
  stepperValue: 62,
  /** A History row (one finished Workout). */
  historyRow: 64,
  /** A radio circle at the end of a picker row (the Overload rule panel's rule types), and its selected dot. */
  radio: 22,
  radioDot: 8,
  /** The iOS-style Settings switch drawn on Android: track, thumb and the gap between thumb and track edge. */
  switchTrackWidth: 51,
  switchTrackHeight: 31,
  switchThumb: 27,
  switchInset: 2,
} as const;

/** A note row inside a Settings card (the Reminders days note, the notifications-off note). */
export const noteRow = {
  icon: 15,
  /** Nudges the icon down to the first text line. */
  iconTop: 2,
  paddingBottom: 14,
  /** A Settings row's gap between its label, value and chevron. */
  rowGap: 10,
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
export const opacity = { pressed: 0.85, disabled: 0.4, locked: 0.5, onAccentSoft: 0.85 } as const;

/** Line heights for text that sets its own size. */
export const lineHeight = {
  /** A chip's text at `fontSize.caption` (a Past workout set chip). */
  caption: 16,
  /** A detail line at `fontSize.caption` (a History row's `5 exercises · 48 min`). */
  detail: 17,
  /** A muted subtitle or section title at `fontSize.small` (a header's subtitle, a History month). */
  subtitle: 18,
  /** A note or caption at `fontSize.small`. */
  small: 19,
  /** A row's main line at `fontSize.label` (a History date, a Past workout exercise name). */
  label: 20,
  /** A paragraph at `fontSize.body`. */
  body: 21,
  /** An empty state's heading at `fontSize.action`. */
  action: 22,
  title: 24,
  /** A bottom sheet's title at `fontSize.title` (`textStyle.sheetTitle`). */
  sheetTitle: 26,
  /** The large title of an in-page screen header at `fontSize.screen`. */
  screenHeader: 30,
  screen: 38,
} as const;

/** Letter spacing for text that sets its own tracking. */
export const letterSpacing = {
  /** A weight shown as a value (a value between − and +): numbers use tight tracking. */
  value: -0.3,
} as const;

/** Shared text styles for headings that set their own size, line height and tracking. */
export const textStyle = {
  /** Big screen heading on a tab (Today, Routines). */
  screenTitle: { fontSize: fontSize.display, lineHeight: lineHeight.screen, letterSpacing: -1 },
  /** Title of a row or card. */
  rowTitle: { fontSize: fontSize.input, lineHeight: lineHeight.title, letterSpacing: -0.4 },
  /** Title of a bottom sheet at the `title` text size (the Exercise setup sheet, the Overload rule panel). */
  sheetTitle: { lineHeight: lineHeight.sheetTitle, letterSpacing: -0.4 },
} as const;

/** The Paywall's Free/Pro table and the Pro unlocked hero, in points. */
export const pro = {
  /** Widths of the Free and Pro columns; the feature column takes the rest. */
  freeColumn: 70,
  proColumn: 84,
  /** The least height of a table row, and its header row. */
  tableRow: 40,
  /** The Pro unlocked hero's two faint rings: diameter, stroke width and opacity. */
  outerRing: 300,
  outerRingWidth: 30,
  outerRingOpacity: 0.07,
  innerRing: 180,
  innerRingWidth: 22,
  innerRingOpacity: 0.1,
  /** The check inside the hero's white circle. */
  heroCheck: 30,
  /** A small round check before an included item (Pro unlocked's list), and its glyph. */
  itemCheck: 26,
  itemCheckGlyph: 14,
  /** The accent circle at the start of Settings' Increment Pro card, and the star inside it. */
  cardIcon: 38,
  cardIconGlyph: 18,
} as const;

/** The rest panel pinned to the bottom of the live workout: ring size and stroke in points, top corner radius. */
export const restPanel = { ring: 96, stroke: 6, corner: 32, time: 24, timeLine: 28, label: 11 } as const;

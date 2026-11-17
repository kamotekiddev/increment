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

/** Fixed heights and widths of the routine screens' controls and rows, in points. */
export const size = { round: 48, control: 56, row: 66, pickerRow: 62, day: 46, tile: 40, icon: 20, check: 16, dot: 6 } as const;

/** Minimum touch target, in points. */
export const minTouch = 44;

/** Opacity for interactive states. One disabled value everywhere. */
export const opacity = { pressed: 0.85, disabled: 0.4 } as const;

/** Line heights for text that sets its own size. */
export const lineHeight = { title: 24, screen: 38 } as const;

/** Shared text styles for headings that set their own size, line height and tracking. */
export const textStyle = {
  /** Big screen heading on a tab (Today, Routines). */
  screenTitle: { fontSize: fontSize.display, lineHeight: lineHeight.screen, letterSpacing: -1 },
  /** Title of a row or card. */
  rowTitle: { fontSize: fontSize.input, lineHeight: lineHeight.title, letterSpacing: -0.4 },
} as const;

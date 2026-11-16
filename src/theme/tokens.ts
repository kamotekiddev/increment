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
  accent: "#5B3DF5",
  /** Progress pills and highlights (alias: pr). */
  accentTint: "#EFEAFF",
  onAccent: "#FFFFFF",
  danger: "#C62828",
} as const;

export type Colors = { [K in keyof typeof lightColors]: string };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

/** Sora weights. Names match what useFonts registers. */
export const fontFamily = {
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semibold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
  extrabold: "Sora_800ExtraBold",
} as const;

export const fontSize = { caption: 12, body: 15, label: 14, title: 20, heading: 28, numeral: 40 } as const;

/** Minimum touch target, in points. */
export const minTouch = 44;

/** Opacity for interactive states. One disabled value everywhere. */
export const opacity = { pressed: 0.85, disabled: 0.4 } as const;

/** Line heights for text that sets its own size. */
export const lineHeight = { title: 24 } as const;

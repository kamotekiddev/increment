import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { fontFamily, fontSize, useColors, type Colors } from "@/theme";

export type TextVariant = "body" | "label" | "caption" | "title" | "heading" | "numeral";
export type TextTone = "ink" | "soft" | "muted" | "accent" | "danger" | "onAccent";

const variants: Record<TextVariant, { family: string; size: number; letterSpacing?: number }> = {
  body: { family: fontFamily.regular, size: fontSize.body },
  label: { family: fontFamily.semibold, size: fontSize.label },
  caption: { family: fontFamily.regular, size: fontSize.caption },
  title: { family: fontFamily.bold, size: fontSize.title },
  heading: { family: fontFamily.extrabold, size: fontSize.heading, letterSpacing: -0.5 },
  // Large numbers (weights, reps): heavy weight, tight tracking.
  numeral: { family: fontFamily.extrabold, size: fontSize.numeral, letterSpacing: -1 },
};

const tones: Record<TextTone, keyof Colors> = {
  ink: "ink",
  soft: "inkSoft",
  muted: "inkMuted",
  accent: "accent",
  danger: "danger",
  onAccent: "onAccent",
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function Text({ variant = "body", tone = "ink", style, ...rest }: TextProps) {
  const colors = useColors();
  const v = variants[variant];
  return (
    <RNText
      {...rest}
      style={[{ color: colors[tones[tone]], fontFamily: v.family, fontSize: v.size, letterSpacing: v.letterSpacing }, style]}
    />
  );
}

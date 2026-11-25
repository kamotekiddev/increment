/** Pure: Pro sees Save exercise; everyone else sees Unlock Pro in its place. */
export function saveButtonKind(isPro: boolean): "save" | "unlock" {
  return isPro ? "save" : "unlock";
}

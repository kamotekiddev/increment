/** The chips, in the design's order: the big pushing and pulling groups first, then the smaller ones. */
export const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

const GROUP_BY_MUSCLE: Record<string, MuscleGroup> = {
  chest: "Chest",
  lats: "Back",
  "middle back": "Back",
  "lower back": "Back",
  traps: "Back",
  shoulders: "Shoulders",
  biceps: "Arms",
  triceps: "Arms",
  forearms: "Arms",
  quadriceps: "Legs",
  hamstrings: "Legs",
  glutes: "Legs",
  calves: "Legs",
  adductors: "Legs",
  abductors: "Legs",
  abdominals: "Core",
};

/** Pure: the broad groups for a list of muscles, each once, in the order first met. Unknown muscles are skipped. */
export function muscleGroupsOf(muscles: readonly string[]): MuscleGroup[] {
  const groups: MuscleGroup[] = [];
  for (const muscle of muscles) {
    const group = GROUP_BY_MUSCLE[muscle];
    if (group && !groups.includes(group)) groups.push(group);
  }
  return groups;
}

/** "ez bar" -> "Ez Bar". */
export function capitalise(label: string): string {
  return label.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

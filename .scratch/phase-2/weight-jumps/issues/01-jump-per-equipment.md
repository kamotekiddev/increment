# 01: Jump per equipment in Targets

**What to build:** The Jump settings in `user_settings` and the lookup from an exercise's equipment to its Jump, wired into every place that works out a Target. Nothing new on screen yet; Targets step by the default Jump of their equipment (dumbbell exercises now step by 2 kg).

**Blocked by:** None (can start immediately)

**Status:** built

- [x] Jump columns on the `user_settings` row, in kg: Barbell 2.5, Dumbbell 2, Machine 5, Cable 2.5, Bodyweight added weight 2.5. One migration (0005). One Jump per equipment for both units: in the other unit it shows as the nearest rung of that unit's ladder (5 kg is 10 lb), and an untouched Jump is the current unit's default (5, 5, 10, 5, 5 lb in lb)
- [x] One hook (like `useUnit()`) returns the Jumps and a setter; screens re-render on change
- [x] A pure function maps equipment to a Jump key: barbell and ez bar → Barbell; dumbbell and kettlebell → Dumbbell; machine → Machine; cable → Cable; bodyweight → Bodyweight added weight
- [x] Every `nextTarget` caller (Offer, summary, Today preview, live workout) passes the exercise's Jump; `JUMP_KG` and `src/workout/jump.ts` are removed
- [x] Jest: the mapping for all 7 equipment values; a step up and a drop with each default; 135 lb with a 5 lb Jump (2.268 kg) shows 140 lb
- [x] Database test: save a Barbell Jump of 5 kg, switch the unit 10 times, it reads back as exactly 5 kg and shows 10 lb in lb and 5 kg in kg
- [x] Type check, lint and tests pass

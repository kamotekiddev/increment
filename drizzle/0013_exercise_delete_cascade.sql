-- Deleting an exercise deletes its routine exercises, workout exercises and sets (ADR 0005): the three exercise_id
-- references become ON DELETE CASCADE, by table rebuild. Every row and index is kept. Foreign keys stay off until the
-- app switches them on after migrations (a mid-file ON would cascade-delete sets when workout_exercises is dropped).
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_routine_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`position` integer NOT NULL,
	`sets` integer NOT NULL,
	`rep_min` integer NOT NULL,
	`rep_max` integer NOT NULL,
	`rest_s` integer NOT NULL,
	`rule` text NOT NULL,
	`step_kg` real,
	`step_lb` real,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_routine_exercises`("id", "routine_id", "exercise_id", "position", "sets", "rep_min", "rep_max", "rest_s", "rule", "step_kg", "step_lb") SELECT "id", "routine_id", "exercise_id", "position", "sets", "rep_min", "rep_max", "rest_s", "rule", "step_kg", "step_lb" FROM `routine_exercises`;--> statement-breakpoint
DROP TABLE `routine_exercises`;--> statement-breakpoint
ALTER TABLE `__new_routine_exercises` RENAME TO `routine_exercises`;--> statement-breakpoint
CREATE INDEX `routine_exercises_routine_idx` ON `routine_exercises` (`routine_id`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `routine_exercises_routine_exercise_uniq` ON `routine_exercises` (`routine_id`,`exercise_id`);--> statement-breakpoint
CREATE TABLE `__new_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_exercise_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`idx` integer NOT NULL,
	`weight` real NOT NULL,
	`weight_unit` text NOT NULL,
	`reps` integer NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`is_warmup` integer DEFAULT false NOT NULL,
	`edited` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`workout_exercise_id`) REFERENCES `workout_exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sets`("id", "workout_exercise_id", "exercise_id", "idx", "weight", "weight_unit", "reps", "done", "is_warmup", "edited") SELECT "id", "workout_exercise_id", "exercise_id", "idx", "weight", "weight_unit", "reps", "done", "is_warmup", "edited" FROM `sets`;--> statement-breakpoint
DROP TABLE `sets`;--> statement-breakpoint
ALTER TABLE `__new_sets` RENAME TO `sets`;--> statement-breakpoint
CREATE INDEX `sets_exercise_idx` ON `sets` (`exercise_id`);--> statement-breakpoint
CREATE INDEX `sets_workout_exercise_idx` ON `sets` (`workout_exercise_id`);--> statement-breakpoint
CREATE TABLE `__new_workout_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`position` integer NOT NULL,
	`target_weight_kg` real,
	`target_reps` integer,
	`target_unit` text,
	`progress_accepted` integer DEFAULT false NOT NULL,
	`accepted_target_weight_kg` real,
	`accepted_target_reps` integer,
	`accepted_target_unit` text,
	`is_deload` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workout_exercises`("id", "workout_id", "exercise_id", "position", "target_weight_kg", "target_reps", "target_unit", "progress_accepted", "accepted_target_weight_kg", "accepted_target_reps", "accepted_target_unit", "is_deload") SELECT "id", "workout_id", "exercise_id", "position", "target_weight_kg", "target_reps", "target_unit", "progress_accepted", "accepted_target_weight_kg", "accepted_target_reps", "accepted_target_unit", "is_deload" FROM `workout_exercises`;--> statement-breakpoint
DROP TABLE `workout_exercises`;--> statement-breakpoint
ALTER TABLE `__new_workout_exercises` RENAME TO `workout_exercises`;--> statement-breakpoint
CREATE UNIQUE INDEX `workout_exercises_unique` ON `workout_exercises` (`workout_id`,`exercise_id`,`position`);
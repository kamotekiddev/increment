ALTER TABLE `sets` ADD `edited` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `workouts` ADD `last_edited_at` integer;--> statement-breakpoint
ALTER TABLE `workouts` ADD `rest_ends_at` integer;--> statement-breakpoint
ALTER TABLE `workouts` ADD `rest_total_ms` integer;--> statement-breakpoint
ALTER TABLE `workouts` ADD `rest_exercise_index` integer;--> statement-breakpoint
ALTER TABLE `workouts` ADD `rest_set_index` integer;
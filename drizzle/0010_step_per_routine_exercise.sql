-- A step per routine exercise, one per unit, each in its own unit; NULL is the 2.5 kg / 5 lb default.
-- The per-equipment Jumps are dropped without copying (owner decision 2026-11-21: the app is not released).
ALTER TABLE `routine_exercises` ADD `step_kg` real;--> statement-breakpoint
ALTER TABLE `routine_exercises` ADD `step_lb` real;--> statement-breakpoint
ALTER TABLE `user_settings` DROP COLUMN `jump_barbell_kg`;--> statement-breakpoint
ALTER TABLE `user_settings` DROP COLUMN `jump_dumbbell_kg`;--> statement-breakpoint
ALTER TABLE `user_settings` DROP COLUMN `jump_machine_kg`;--> statement-breakpoint
ALTER TABLE `user_settings` DROP COLUMN `jump_cable_kg`;--> statement-breakpoint
ALTER TABLE `user_settings` DROP COLUMN `jump_bodyweight_kg`;
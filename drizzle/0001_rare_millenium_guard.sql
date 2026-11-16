PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	`date` text NOT NULL,
	`feeling` integer,
	`notes` text,
	`in_progress` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "routine_id", "started_at", "finished_at", "date", "feeling", "notes", "in_progress") SELECT "id", "routine_id", "started_at", "finished_at", "date", "feeling", "notes", "in_progress" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `workouts_date_idx` ON `workouts` (`date`);
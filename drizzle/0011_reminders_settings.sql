ALTER TABLE `user_settings` ADD `reminders_on` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `reminder_time_min` integer DEFAULT 1080 NOT NULL;
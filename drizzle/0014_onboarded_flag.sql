ALTER TABLE `user_settings` ADD `onboarded` integer DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE `user_settings` SET `onboarded` = 1;
--> statement-breakpoint
INSERT INTO `user_settings` (`id`, `onboarded`) SELECT 1, 1 WHERE NOT EXISTS (SELECT 1 FROM `user_settings`) AND (EXISTS (SELECT 1 FROM `routines`) OR EXISTS (SELECT 1 FROM `workouts`));

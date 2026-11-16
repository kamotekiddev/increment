DELETE FROM `routine_exercises` WHERE `id` NOT IN (SELECT MIN(`id`) FROM `routine_exercises` GROUP BY `routine_id`, `exercise_id`);--> statement-breakpoint
UPDATE `routine_exercises` SET `position` = (SELECT COUNT(*) FROM `routine_exercises` AS `r2` WHERE `r2`.`routine_id` = `routine_exercises`.`routine_id` AND (`r2`.`position` < `routine_exercises`.`position` OR (`r2`.`position` = `routine_exercises`.`position` AND `r2`.`id` < `routine_exercises`.`id`)));--> statement-breakpoint
CREATE UNIQUE INDEX `routine_exercises_routine_exercise_uniq` ON `routine_exercises` (`routine_id`,`exercise_id`);

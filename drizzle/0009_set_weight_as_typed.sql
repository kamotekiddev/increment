-- A set now stores the number the lifter typed and its unit (ADR 0003), instead of kg.
-- The one conversion outside src/units: it inverts exactly what the app wrote (kg = lb × 0.45359237),
-- rounded to 6 decimals so 135 lb comes back as 135, not 135.00000000000003.
ALTER TABLE `sets` RENAME COLUMN `weight_kg` TO `weight`;--> statement-breakpoint
ALTER TABLE `sets` RENAME COLUMN `entered_unit` TO `weight_unit`;--> statement-breakpoint
-- A set not yet checked had a placeholder unit (kg) and a weight shown and typed in the lifter's unit.
UPDATE `sets` SET `weight_unit` = COALESCE((SELECT `unit` FROM `user_settings` WHERE `id` = 1), 'kg') WHERE `done` = 0;--> statement-breakpoint
UPDATE `sets` SET `weight` = ROUND(`weight` / 0.45359237, 6) WHERE `weight_unit` = 'lb';

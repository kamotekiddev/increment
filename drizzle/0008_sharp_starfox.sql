ALTER TABLE `user_settings` ADD `default_rest_s` integer DEFAULT 90 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `show_previous_set` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `keep_screen_awake` integer DEFAULT true NOT NULL;
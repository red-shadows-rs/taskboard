CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`status` text DEFAULT 'planning' NOT NULL,
	`team_members` text DEFAULT '[]' NOT NULL,
	`color` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`order` integer
);
--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE TABLE `sections` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text NOT NULL,
	`order` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sections_project_idx` ON `sections` (`project_id`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text NOT NULL,
	`description_en` text NOT NULL,
	`description_ar` text NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`assigned_to` text DEFAULT '[]' NOT NULL,
	`due_date` text NOT NULL,
	`priority` text DEFAULT 'low' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`order` integer,
	`attachments` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`completed_at` text,
	`assignee_prices` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tasks_section_idx` ON `tasks` (`section_id`);--> statement-breakpoint
CREATE INDEX `tasks_status_idx` ON `tasks` (`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`order` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_uq` ON `users` (`email`);
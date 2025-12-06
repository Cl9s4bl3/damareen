CREATE TABLE `dungeon_normal_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dungeon_id` int NOT NULL,
	`normal_card_id` int NOT NULL,
	`card_order` int NOT NULL,
	CONSTRAINT `dungeon_normal_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dungeon_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`normal_cards_count` int NOT NULL,
	`vezer_cards_count` int NOT NULL,
	`reward_type` varchar(20) NOT NULL,
	`reward_description` text NOT NULL,
	CONSTRAINT `dungeon_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dungeon_vezer_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dungeon_id` int NOT NULL,
	`vezer_card_id` int NOT NULL,
	`card_order` int NOT NULL,
	CONSTRAINT `dungeon_vezer_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dungeons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`world_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type_id` int NOT NULL,
	`description` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `dungeons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `normal_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`world_id` int NOT NULL,
	`name` varchar(16) NOT NULL,
	`damage` int NOT NULL,
	`health` int NOT NULL,
	`type` varchar(10) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `normal_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vezer_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`world_id` int NOT NULL,
	`base_card_id` int NOT NULL,
	`name` varchar(16) NOT NULL,
	`boost_type` varchar(20) NOT NULL,
	`damage` int NOT NULL,
	`health` int NOT NULL,
	`type` varchar(10) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vezer_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `worlds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `worlds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dungeon_normal_cards` ADD CONSTRAINT `dungeon_normal_cards_dungeon_id_dungeons_id_fk` FOREIGN KEY (`dungeon_id`) REFERENCES `dungeons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dungeon_normal_cards` ADD CONSTRAINT `dungeon_normal_cards_normal_card_id_normal_cards_id_fk` FOREIGN KEY (`normal_card_id`) REFERENCES `normal_cards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dungeon_vezer_cards` ADD CONSTRAINT `dungeon_vezer_cards_dungeon_id_dungeons_id_fk` FOREIGN KEY (`dungeon_id`) REFERENCES `dungeons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dungeon_vezer_cards` ADD CONSTRAINT `dungeon_vezer_cards_vezer_card_id_vezer_cards_id_fk` FOREIGN KEY (`vezer_card_id`) REFERENCES `vezer_cards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dungeons` ADD CONSTRAINT `dungeons_world_id_worlds_id_fk` FOREIGN KEY (`world_id`) REFERENCES `worlds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dungeons` ADD CONSTRAINT `dungeons_type_id_dungeon_types_id_fk` FOREIGN KEY (`type_id`) REFERENCES `dungeon_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dungeons` ADD CONSTRAINT `dungeons_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `normal_cards` ADD CONSTRAINT `normal_cards_world_id_worlds_id_fk` FOREIGN KEY (`world_id`) REFERENCES `worlds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vezer_cards` ADD CONSTRAINT `vezer_cards_world_id_worlds_id_fk` FOREIGN KEY (`world_id`) REFERENCES `worlds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vezer_cards` ADD CONSTRAINT `vezer_cards_base_card_id_normal_cards_id_fk` FOREIGN KEY (`base_card_id`) REFERENCES `normal_cards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `worlds` ADD CONSTRAINT `worlds_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dnc_dungeon_idx` ON `dungeon_normal_cards` (`dungeon_id`);--> statement-breakpoint
CREATE INDEX `dnc_card_idx` ON `dungeon_normal_cards` (`normal_card_id`);--> statement-breakpoint
CREATE INDEX `unique_dungeon_card` ON `dungeon_normal_cards` (`dungeon_id`,`normal_card_id`);--> statement-breakpoint
CREATE INDEX `dvc_dungeon_idx` ON `dungeon_vezer_cards` (`dungeon_id`);--> statement-breakpoint
CREATE INDEX `dvc_card_idx` ON `dungeon_vezer_cards` (`vezer_card_id`);--> statement-breakpoint
CREATE INDEX `unique_dungeon_vezer_card` ON `dungeon_vezer_cards` (`dungeon_id`,`vezer_card_id`);--> statement-breakpoint
CREATE INDEX `dungeon_world_idx` ON `dungeons` (`world_id`);--> statement-breakpoint
CREATE INDEX `dungeon_name_idx` ON `dungeons` (`name`);--> statement-breakpoint
CREATE INDEX `world_idx` ON `normal_cards` (`world_id`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `normal_cards` (`name`);--> statement-breakpoint
CREATE INDEX `vezer_world_idx` ON `vezer_cards` (`world_id`);--> statement-breakpoint
CREATE INDEX `base_card_idx` ON `vezer_cards` (`base_card_id`);--> statement-breakpoint
CREATE INDEX `vezer_name_idx` ON `vezer_cards` (`name`);
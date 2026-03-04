CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`offer_id` text NOT NULL,
	`from` text NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_offer_idx` ON `messages` (`offer_id`);--> statement-breakpoint
CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`seller_id` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`payout_chain` text NOT NULL,
	`payout_addr` text NOT NULL,
	`amount_m` integer NOT NULL,
	`price_usd_cents` integer NOT NULL,
	`seller_token` text NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `offers_seller_idx` ON `offers` (`seller_id`);--> statement-breakpoint
CREATE INDEX `offers_payout_addr_idx` ON `offers` (`payout_addr`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`handle` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'seller' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_handle_uq` ON `users` (`handle`);
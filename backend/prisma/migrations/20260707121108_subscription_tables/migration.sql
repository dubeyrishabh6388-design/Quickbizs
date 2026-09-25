-- AlterTable
ALTER TABLE `businesses` ADD COLUMN `max_customers` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `max_products` INTEGER NOT NULL DEFAULT 100,
    ADD COLUMN `max_users` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `subscription_expires_at` DATETIME(3) NULL;

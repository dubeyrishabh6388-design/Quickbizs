-- AlterTable
ALTER TABLE `businesses` ADD COLUMN `logo` VARCHAR(255) NULL,
    ADD COLUMN `phone` VARCHAR(50) NULL,
    ADD COLUMN `email` VARCHAR(150) NULL,
    ADD COLUMN `owner_name` VARCHAR(100) NULL,
    ADD COLUMN `gst_number` VARCHAR(50) NULL,
    ADD COLUMN `address` VARCHAR(255) NULL,
    ADD COLUMN `latitude` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `longitude` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `business_type` VARCHAR(50) NULL DEFAULT 'Kirana',
    ADD COLUMN `opening_hours` VARCHAR(100) NULL DEFAULT '07:00-21:00',
    ADD COLUMN `pickup_availability` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `is_open` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `pickup_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `pickup_time_slots` VARCHAR(255) NULL DEFAULT '15m,30m,1h,2h',
    ADD COLUMN `max_active_orders` INTEGER NOT NULL DEFAULT 20,
    ADD COLUMN `order_prep_time` INTEGER NOT NULL DEFAULT 15,
    ADD COLUMN `notification_preferences` VARCHAR(255) NULL DEFAULT 'push,sms',
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `businesses_phone_key` ON `businesses`(`phone`);

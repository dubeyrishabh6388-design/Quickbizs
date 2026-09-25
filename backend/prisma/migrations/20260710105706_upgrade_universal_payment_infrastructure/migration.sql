/*
  Warnings:

  - You are about to drop the column `notes` on the `payment_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `paid_at` on the `payment_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `reference_number` on the `payment_transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `payment_transactions` DROP COLUMN `notes`,
    DROP COLUMN `paid_at`,
    DROP COLUMN `reference_number`,
    ADD COLUMN `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
    ADD COLUMN `gateway_signature` VARCHAR(255) NULL,
    ADD COLUMN `purchase_id` VARCHAR(50) NULL,
    ADD COLUMN `remarks` VARCHAR(255) NULL,
    ADD COLUMN `subscription_id` VARCHAR(50) NULL,
    ADD COLUMN `supplier_id` VARCHAR(50) NULL,
    ADD COLUMN `user_id` VARCHAR(50) NULL;

-- CreateTable
CREATE TABLE `payment_orders` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
    `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    `gateway_order_id` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payment_orders_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_logs` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `transaction_id` VARCHAR(50) NULL,
    `level` VARCHAR(20) NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_logs_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

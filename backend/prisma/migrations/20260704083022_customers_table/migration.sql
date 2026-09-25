-- CreateTable
CREATE TABLE `customers` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `customer_code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `mobile` VARCHAR(50) NOT NULL,
    `email` VARCHAR(150) NULL,
    `address` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `pin_code` VARCHAR(20) NULL,
    `gst_number` VARCHAR(50) NULL,
    `credit_limit` DOUBLE NOT NULL DEFAULT 10000,
    `pending_amount` DOUBLE NOT NULL DEFAULT 0,
    `reward_points` INTEGER NOT NULL DEFAULT 0,
    `last_purchase_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_by` VARCHAR(50) NULL,
    `updated_by` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `customers_business_id_idx`(`business_id`),
    INDEX `customers_mobile_idx`(`mobile`),
    INDEX `customers_customer_code_idx`(`customer_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

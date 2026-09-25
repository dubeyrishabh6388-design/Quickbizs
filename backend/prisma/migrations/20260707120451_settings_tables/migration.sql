-- CreateTable
CREATE TABLE `business_settings` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `company_name` VARCHAR(100) NOT NULL,
    `gst_number` VARCHAR(50) NULL,
    `pan_number` VARCHAR(50) NULL,
    `address` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `invoice_prefix` VARCHAR(20) NOT NULL DEFAULT 'INV',
    `invoice_footer` VARCHAR(255) NULL,
    `gst_enabled` BOOLEAN NOT NULL DEFAULT true,
    `discount_enabled` BOOLEAN NOT NULL DEFAULT true,
    `round_off_enabled` BOOLEAN NOT NULL DEFAULT true,
    `timezone` VARCHAR(50) NULL,
    `currency` VARCHAR(50) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `business_settings_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `business_settings` ADD CONSTRAINT `business_settings_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

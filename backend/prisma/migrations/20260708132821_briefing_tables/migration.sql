-- CreateTable
CREATE TABLE `daily_business_briefings` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `briefing_date` DATETIME(3) NOT NULL,
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `shown_to` VARCHAR(50) NULL,
    `viewed_at` DATETIME(3) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Generated',
    `data` LONGTEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `daily_business_briefings_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `daily_business_briefings` ADD CONSTRAINT `daily_business_briefings_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_business_briefings` ADD CONSTRAINT `daily_business_briefings_shown_to_fkey` FOREIGN KEY (`shown_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

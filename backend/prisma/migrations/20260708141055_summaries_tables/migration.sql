-- CreateTable
CREATE TABLE `daily_business_summaries` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `summary_date` DATETIME(3) NOT NULL,
    `morning_generated` BOOLEAN NOT NULL DEFAULT false,
    `midday_generated` BOOLEAN NOT NULL DEFAULT false,
    `closing_generated` BOOLEAN NOT NULL DEFAULT false,
    `health_score` INTEGER NOT NULL DEFAULT 100,
    `sales_score` INTEGER NOT NULL DEFAULT 100,
    `profit_score` INTEGER NOT NULL DEFAULT 100,
    `inventory_score` INTEGER NOT NULL DEFAULT 100,
    `customer_score` INTEGER NOT NULL DEFAULT 100,
    `finance_score` INTEGER NOT NULL DEFAULT 100,
    `summary_json` LONGTEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `daily_business_summaries_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `daily_business_summaries` ADD CONSTRAINT `daily_business_summaries_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

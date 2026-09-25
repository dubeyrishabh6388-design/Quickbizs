-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `ip_address` VARCHAR(50) NULL,
    `device` VARCHAR(150) NULL,
    `action` VARCHAR(100) NOT NULL,
    `old_value` VARCHAR(500) NULL,
    `new_value` VARCHAR(500) NULL,
    `module` VARCHAR(50) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `reason` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backup_histories` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `filename` VARCHAR(150) NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `backup_histories_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backup_histories` ADD CONSTRAINT `backup_histories_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

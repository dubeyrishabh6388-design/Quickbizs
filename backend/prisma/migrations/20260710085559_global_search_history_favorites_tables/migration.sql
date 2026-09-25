-- CreateTable
CREATE TABLE `search_history` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `search_text` VARCHAR(150) NOT NULL,
    `search_module` VARCHAR(55) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `search_history_business_id_idx`(`business_id`),
    INDEX `search_history_user_id_idx`(`user_id`),
    INDEX `search_history_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `search_favorites` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `target_module` VARCHAR(50) NOT NULL,
    `target_id` VARCHAR(50) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `subtitle` VARCHAR(150) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `search_favorites_business_id_idx`(`business_id`),
    INDEX `search_favorites_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

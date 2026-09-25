-- CreateTable
CREATE TABLE `automation_rules` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `trigger` VARCHAR(50) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_rules_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `automation_conditions` (
    `id` VARCHAR(50) NOT NULL,
    `rule_id` VARCHAR(50) NOT NULL,
    `field` VARCHAR(50) NOT NULL,
    `operator` VARCHAR(30) NOT NULL,
    `value` VARCHAR(150) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `automation_conditions_rule_id_idx`(`rule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `automation_actions` (
    `id` VARCHAR(50) NOT NULL,
    `rule_id` VARCHAR(50) NOT NULL,
    `action_type` VARCHAR(50) NOT NULL,
    `action_params` LONGTEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `automation_actions_rule_id_idx`(`rule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `automation_history` (
    `id` VARCHAR(50) NOT NULL,
    `rule_id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `trigger_event` VARCHAR(55) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `duration` VARCHAR(20) NOT NULL,
    `outcome` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `automation_history_rule_id_idx`(`rule_id`),
    INDEX `automation_history_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `automation_rules` ADD CONSTRAINT `automation_rules_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `automation_conditions` ADD CONSTRAINT `automation_conditions_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `automation_rules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `automation_actions` ADD CONSTRAINT `automation_actions_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `automation_rules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `automation_history` ADD CONSTRAINT `automation_history_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `automation_rules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

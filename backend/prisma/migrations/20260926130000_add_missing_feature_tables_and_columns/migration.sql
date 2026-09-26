-- AlterTable: add missing columns to products
ALTER TABLE `products`
    ADD COLUMN `brand` VARCHAR(100) NULL,
    ADD COLUMN `category_id` VARCHAR(50) NULL,
    ADD COLUMN `custom_fields` TEXT NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `keywords` VARCHAR(500) NULL,
    ADD COLUMN `product_status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    ADD COLUMN `sku` VARCHAR(100) NULL,
    ADD COLUMN `sub_category` VARCHAR(100) NULL,
    ADD COLUMN `tax` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `unit` VARCHAR(50) NULL,
    ADD COLUMN `unit_type` VARCHAR(50) NULL;

-- AlterTable: add missing column to orders
ALTER TABLE `orders`
    ADD COLUMN `pwa_customer_id` VARCHAR(50) NULL;

-- AlterTable: sessions
ALTER TABLE `sessions`
    ADD COLUMN `customer_id` VARCHAR(50) NULL,
    MODIFY `user_id` VARCHAR(50) NULL;

-- AlterTable: inventories
ALTER TABLE `inventories`
    ADD COLUMN `batch_number` VARCHAR(50) NULL,
    ADD COLUMN `expiry_date` DATETIME(3) NULL,
    ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'IN_STOCK';

-- CreateTable: otps
CREATE TABLE IF NOT EXISTS `otps` (
    `id` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `otps_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: business_preferences
CREATE TABLE IF NOT EXISTS `business_preferences` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `business_type` VARCHAR(100) NOT NULL,
    `business_size` VARCHAR(50) NOT NULL,
    `sell_online` BOOLEAN NOT NULL DEFAULT false,
    `visible_modules` TEXT NOT NULL,
    `dashboard_layout` TEXT NOT NULL,
    `product_attributes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `business_preferences_business_id_key`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: product_categories
CREATE TABLE IF NOT EXISTS `product_categories` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `parent_id` VARCHAR(50) NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_categories_parent_id_fkey`(`parent_id`),
    UNIQUE INDEX `product_categories_business_id_name_key`(`business_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: product_units
CREATE TABLE IF NOT EXISTS `product_units` (
    `id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `product_type` VARCHAR(50) NOT NULL DEFAULT 'FixedQuantity',
    `default_unit` VARCHAR(20) NOT NULL DEFAULT 'pcs',
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `product_units_product_id_key`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: weight_presets
CREATE TABLE IF NOT EXISTS `weight_presets` (
    `id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `label` VARCHAR(20) NOT NULL,
    `value_in_kg` DOUBLE NOT NULL,
    `sales_count` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `weight_presets_product_id_label_key`(`product_id`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: quantity_presets
CREATE TABLE IF NOT EXISTS `quantity_presets` (
    `id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `label` VARCHAR(20) NOT NULL,
    `value` DOUBLE NOT NULL,
    `sales_count` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quantity_presets_product_id_label_key`(`product_id`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: pwa_customers
CREATE TABLE IF NOT EXISTS `pwa_customers` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `email` VARCHAR(150) NULL,
    `password_hash` VARCHAR(255) NULL,
    `profile_photo` VARCHAR(255) NULL,
    `dob` DATETIME(3) NULL,
    `preferred_language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `avatar` VARCHAR(255) NULL,
    `reward_points` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `pwa_customers_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: pwa_customer_trust_scores
CREATE TABLE IF NOT EXISTS `pwa_customer_trust_scores` (
    `id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 100,
    `active_orders_count` INTEGER NOT NULL DEFAULT 0,
    `restricted_status` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pwa_customer_trust_scores_customer_id_key`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: pwa_customer_addresses
CREATE TABLE IF NOT EXISTS `pwa_customer_addresses` (
    `id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NOT NULL,
    `address_type` VARCHAR(50) NOT NULL,
    `address_line_1` VARCHAR(255) NOT NULL,
    `address_line_2` VARCHAR(255) NULL,
    `landmark` VARCHAR(150) NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `pincode` VARCHAR(20) NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pwa_customer_addresses_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: pwa_favourite_shops
CREATE TABLE IF NOT EXISTS `pwa_favourite_shops` (
    `id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pwa_favourite_shops_business_id_fkey`(`business_id`),
    UNIQUE INDEX `pwa_favourite_shops_customer_id_business_id_key`(`customer_id`, `business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: pickup_orders
CREATE TABLE IF NOT EXISTS `pickup_orders` (
    `id` VARCHAR(50) NOT NULL,
    `order_number` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NOT NULL,
    `pickup_pin` VARCHAR(100) NOT NULL,
    `order_status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    `payment_method` VARCHAR(50) NOT NULL DEFAULT 'UPI',
    `payment_status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    `scheduled_pickup_time` DATETIME(3) NOT NULL,
    `order_notes` VARCHAR(255) NULL,
    `total_amount` DOUBLE NOT NULL,
    `total_items` INTEGER NOT NULL,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pickup_orders_order_number_key`(`order_number`),
    INDEX `pickup_orders_business_id_idx`(`business_id`),
    INDEX `pickup_orders_customer_id_idx`(`customer_id`),
    INDEX `pickup_orders_order_number_idx`(`order_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: pickup_order_items
CREATE TABLE IF NOT EXISTS `pickup_order_items` (
    `id` VARCHAR(50) NOT NULL,
    `order_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `product_name` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `line_total` DOUBLE NOT NULL,
    `packing_status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    `replacement_status` VARCHAR(50) NOT NULL DEFAULT 'NONE',
    `remarks` VARCHAR(255) NULL,

    INDEX `pickup_order_items_order_id_idx`(`order_id`),
    INDEX `pickup_order_items_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: counter_preferences
CREATE TABLE IF NOT EXISTS `counter_preferences` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `rush_mode` BOOLEAN NOT NULL DEFAULT false,
    `selling_mode` VARCHAR(50) NOT NULL DEFAULT 'Retail Store',
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `counter_preferences_business_id_key`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: queue_sessions
CREATE TABLE IF NOT EXISTS `queue_sessions` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `queue_number` INTEGER NOT NULL,
    `customer_name` VARCHAR(100) NULL,
    `mobile` VARCHAR(50) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Waiting',
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `queue_sessions_business_id_fkey`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: queue_items
CREATE TABLE IF NOT EXISTS `queue_items` (
    `id` VARCHAR(50) NOT NULL,
    `queue_session_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `product_name` VARCHAR(150) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,

    INDEX `queue_items_queue_session_id_fkey`(`queue_session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: recovery_tasks
CREATE TABLE IF NOT EXISTS `recovery_tasks` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
    `priority` VARCHAR(20) NOT NULL DEFAULT 'Medium',
    `amount` DOUBLE NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `recovery_tasks_business_id_idx`(`business_id`),
    INDEX `recovery_tasks_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: recovery_reminders
CREATE TABLE IF NOT EXISTS `recovery_reminders` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `task_id` VARCHAR(50) NOT NULL,
    `reminder_type` VARCHAR(55) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Sent',
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,

    INDEX `recovery_reminders_business_id_idx`(`business_id`),
    INDEX `recovery_reminders_task_id_idx`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Indexes
CREATE INDEX `orders_pwa_customer_id_idx` ON `orders`(`pwa_customer_id`);
CREATE UNIQUE INDEX `products_sku_key` ON `products`(`sku`);
CREATE INDEX `products_category_id_fkey` ON `products`(`category_id`);
CREATE INDEX `sessions_customer_id_idx` ON `sessions`(`customer_id`);

-- Add Foreign Keys
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `business_preferences` ADD CONSTRAINT `business_preferences_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `product_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `product_units` ADD CONSTRAINT `product_units_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `weight_presets` ADD CONSTRAINT `weight_presets_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `quantity_presets` ADD CONSTRAINT `quantity_presets_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `orders` ADD CONSTRAINT `orders_pwa_customer_id_fkey` FOREIGN KEY (`pwa_customer_id`) REFERENCES `pwa_customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `pickup_orders` ADD CONSTRAINT `pickup_orders_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `pickup_orders` ADD CONSTRAINT `pickup_orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `pickup_order_items` ADD CONSTRAINT `pickup_order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `pickup_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `pwa_customer_trust_scores` ADD CONSTRAINT `pwa_customer_trust_scores_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `pwa_customer_addresses` ADD CONSTRAINT `pwa_customer_addresses_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `pwa_favourite_shops` ADD CONSTRAINT `pwa_favourite_shops_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `pwa_favourite_shops` ADD CONSTRAINT `pwa_favourite_shops_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `counter_preferences` ADD CONSTRAINT `counter_preferences_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `queue_sessions` ADD CONSTRAINT `queue_sessions_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `queue_items` ADD CONSTRAINT `queue_items_queue_session_id_fkey` FOREIGN KEY (`queue_session_id`) REFERENCES `queue_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `recovery_tasks` ADD CONSTRAINT `recovery_tasks_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `recovery_tasks` ADD CONSTRAINT `recovery_tasks_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `recovery_reminders` ADD CONSTRAINT `recovery_reminders_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `recovery_reminders` ADD CONSTRAINT `recovery_reminders_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `recovery_tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `payment_transactions` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NULL,
    `invoice_id` VARCHAR(50) NULL,
    `gateway` VARCHAR(50) NOT NULL,
    `gateway_payment_id` VARCHAR(100) NULL,
    `gateway_order_id` VARCHAR(100) NULL,
    `amount` DOUBLE NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `reference_number` VARCHAR(100) NULL,
    `notes` VARCHAR(255) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payment_transactions_business_id_idx`(`business_id`),
    INDEX `payment_transactions_customer_id_idx`(`customer_id`),
    INDEX `payment_transactions_invoice_id_idx`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_links` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `link_type` VARCHAR(30) NOT NULL,
    `url` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_links_business_id_idx`(`business_id`),
    INDEX `payment_links_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_refunds` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `transaction_id` VARCHAR(50) NOT NULL,
    `refund_id` VARCHAR(100) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_refunds_business_id_idx`(`business_id`),
    INDEX `payment_refunds_transaction_id_idx`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_webhooks` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `event_id` VARCHAR(100) NOT NULL,
    `gateway` VARCHAR(50) NOT NULL,
    `payload` TEXT NOT NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payment_webhooks_event_id_key`(`event_id`),
    INDEX `payment_webhooks_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_reconciliation` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `transaction_id` VARCHAR(50) NOT NULL,
    `matched` BOOLEAN NOT NULL DEFAULT false,
    `difference` DOUBLE NOT NULL DEFAULT 0,
    `reconciliation_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_reconciliation_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

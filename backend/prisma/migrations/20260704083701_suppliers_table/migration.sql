-- CreateTable
CREATE TABLE `suppliers` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `supplier_code` VARCHAR(50) NOT NULL,
    `company_name` VARCHAR(100) NOT NULL,
    `contact_person` VARCHAR(100) NOT NULL,
    `mobile` VARCHAR(50) NOT NULL,
    `email` VARCHAR(150) NULL,
    `gst_number` VARCHAR(50) NULL,
    `pan_number` VARCHAR(50) NULL,
    `address` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `pin_code` VARCHAR(20) NULL,
    `payment_terms` VARCHAR(100) NULL,
    `credit_limit` DOUBLE NOT NULL DEFAULT 100000,
    `outstanding_amount` DOUBLE NOT NULL DEFAULT 0,
    `last_purchase_date` DATETIME(3) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `notes` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_by` VARCHAR(50) NULL,
    `updated_by` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `suppliers_gst_number_key`(`gst_number`),
    INDEX `suppliers_business_id_idx`(`business_id`),
    INDEX `suppliers_mobile_idx`(`mobile`),
    INDEX `suppliers_supplier_code_idx`(`supplier_code`),
    INDEX `suppliers_company_name_idx`(`company_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `suppliers` ADD CONSTRAINT `suppliers_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ==============================================================================
-- Migration: Add Serial/IMEI, Multi-Batch, and Sales Return Tracking
-- Description: Purely additive schema extension for QuickBizs
-- Safety: Preserves all existing tables, columns, and data
-- ==============================================================================

-- 1. Alter existing tables with additive columns
ALTER TABLE `products` 
    ADD COLUMN `tracking_mode` ENUM('NONE', 'SERIAL', 'BATCH') NOT NULL DEFAULT 'NONE',
    ADD COLUMN `is_expiry_mandatory` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `inventories` 
    ADD COLUMN `untracked_quantity` INTEGER NOT NULL DEFAULT 0;

-- 2. Create Product Serials Table
CREATE TABLE `product_serials` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `purchase_item_id` VARCHAR(50) NULL,
    `serial_number` VARCHAR(100) NOT NULL,
    `imei1` VARCHAR(50) NULL,
    `imei2` VARCHAR(50) NULL,
    `status` ENUM('IN_STOCK', 'RESERVED', 'SOLD', 'RETURNED_RESTOCKED', 'DEFECTIVE', 'WRITTEN_OFF') NOT NULL DEFAULT 'IN_STOCK',
    `cost_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_serials_business_id_product_id_status_idx`(`business_id`, `product_id`, `status`),
    INDEX `product_serials_purchase_item_id_idx`(`purchase_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Create Device Identifier Registry Table (Hard Uniqueness for Serials and IMEIs)
CREATE TABLE `device_identifiers` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `serial_id` VARCHAR(50) NOT NULL,
    `identifier_type` ENUM('SERIAL_NUMBER', 'IMEI1', 'IMEI2', 'MAC_ADDRESS') NOT NULL,
    `identifier_value` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `device_identifiers_serial_id_idx`(`serial_id`),
    UNIQUE INDEX `device_identifiers_business_id_identifier_value_key`(`business_id`, `identifier_value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Create Immutable Serial Sale History Table (1-to-N Sale and Warranty Traceability)
CREATE TABLE `serial_sale_histories` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `serial_id` VARCHAR(50) NOT NULL,
    `order_item_id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NULL,
    `sold_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sale_price` DECIMAL(12, 2) NOT NULL,
    `warranty_start_date` DATETIME(3) NULL,
    `warranty_end_date` DATETIME(3) NULL,
    `status` ENUM('COMPLETED', 'RETURNED_RESTOCKED', 'RETURNED_DEFECTIVE', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `returned_at` DATETIME(3) NULL,
    `inspection_notes` VARCHAR(255) NULL,

    INDEX `serial_sale_histories_business_id_serial_id_idx`(`business_id`, `serial_id`),
    INDEX `serial_sale_histories_order_item_id_idx`(`order_item_id`),
    INDEX `serial_sale_histories_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Create Product Batches Table
CREATE TABLE `product_batches` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `purchase_item_id` VARCHAR(50) NULL,
    `batch_number` VARCHAR(100) NOT NULL,
    `manufacturing_date` DATETIME(3) NULL,
    `expiry_date` DATETIME(3) NULL,
    `initial_quantity` INTEGER NOT NULL,
    `available_quantity` INTEGER NOT NULL,
    `reserved_quantity` INTEGER NOT NULL DEFAULT 0,
    `quarantined_quantity` INTEGER NOT NULL DEFAULT 0,
    `cost_price` DECIMAL(12, 2) NOT NULL,
    `mrp` DECIMAL(12, 2) NULL,
    `sale_price` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('ACTIVE', 'NEAR_EXPIRY', 'EXPIRED', 'QUARANTINED', 'DEPLETED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_batches_business_id_product_id_status_expiry_date_idx`(`business_id`, `product_id`, `status`, `expiry_date`),
    UNIQUE INDEX `product_batches_business_id_product_id_batch_number_key`(`business_id`, `product_id`, `batch_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. Create Append-Only Batch Movement Ledger Table
CREATE TABLE `batch_movements` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `batch_id` VARCHAR(50) NOT NULL,
    `movement_type` ENUM('OPENING_BALANCE', 'PURCHASE_RECEIPT', 'SALE_ALLOCATION', 'SALE_VOID', 'CUSTOMER_RETURN', 'SUPPLIER_RTV', 'DAMAGE_WRITEOFF', 'QUARANTINE_HOLD', 'QUARANTINE_RELEASE', 'INVENTORY_AUDIT_ADJUSTMENT') NOT NULL,
    `quantity_delta` INTEGER NOT NULL,
    `balance_after` INTEGER NOT NULL,
    `reference_type` VARCHAR(50) NOT NULL,
    `reference_id` VARCHAR(50) NOT NULL,
    `performed_by` VARCHAR(100) NULL,
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `batch_movements_business_id_batch_id_created_at_idx`(`business_id`, `batch_id`, `created_at`),
    INDEX `batch_movements_reference_type_reference_id_idx`(`reference_type`, `reference_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 7. Create Order Item Batch Allocation Table
CREATE TABLE `order_item_batches` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `order_item_id` VARCHAR(50) NOT NULL,
    `batch_id` VARCHAR(50) NOT NULL,
    `quantity_allocated` INTEGER NOT NULL,
    `quantity_returned` INTEGER NOT NULL DEFAULT 0,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `cost_price` DECIMAL(12, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_item_batches_order_item_id_idx`(`order_item_id`),
    INDEX `order_item_batches_batch_id_idx`(`batch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 8. Create Canonical Sales Returns Table
CREATE TABLE `sales_returns` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `return_number` VARCHAR(50) NOT NULL,
    `order_id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NULL,
    `refund_amount` DECIMAL(12, 2) NOT NULL,
    `refund_method` VARCHAR(50) NOT NULL,
    `reason` VARCHAR(255) NULL,
    `received_by` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sales_returns_business_id_return_number_key`(`business_id`, `return_number`),
    INDEX `sales_returns_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 9. Create Return Item Batch Records Table
CREATE TABLE `return_item_batches` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `sales_return_id` VARCHAR(50) NOT NULL,
    `order_item_batch_id` VARCHAR(50) NOT NULL,
    `return_quantity` INTEGER NOT NULL,
    `disposition` VARCHAR(50) NOT NULL DEFAULT 'RESTOCKED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `return_item_batches_sales_return_id_idx`(`sales_return_id`),
    INDEX `return_item_batches_order_item_batch_id_idx`(`order_item_batch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 10. Create Return Item Serial Records Table
CREATE TABLE `return_item_serials` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `sales_return_id` VARCHAR(50) NOT NULL,
    `serial_id` VARCHAR(50) NOT NULL,
    `disposition` VARCHAR(50) NOT NULL DEFAULT 'RESTOCKED',
    `inspection_notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `return_item_serials_sales_return_id_idx`(`sales_return_id`),
    INDEX `return_item_serials_serial_id_idx`(`serial_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 11. Create Serial Audit Log Table
CREATE TABLE `serial_audit_logs` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `serial_id` VARCHAR(50) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `previous_status` ENUM('IN_STOCK', 'RESERVED', 'SOLD', 'RETURNED_RESTOCKED', 'DEFECTIVE', 'WRITTEN_OFF') NULL,
    `new_status` ENUM('IN_STOCK', 'RESERVED', 'SOLD', 'RETURNED_RESTOCKED', 'DEFECTIVE', 'WRITTEN_OFF') NOT NULL,
    `reference_type` VARCHAR(50) NOT NULL,
    `reference_id` VARCHAR(50) NOT NULL,
    `performed_by` VARCHAR(100) NULL,
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `serial_audit_logs_serial_id_idx`(`serial_id`),
    INDEX `serial_audit_logs_business_id_created_at_idx`(`business_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 12. Create Purchase Returns Table (Resolving Legacy Defect)
CREATE TABLE `purchase_returns` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `purchase_order_id` VARCHAR(50) NOT NULL,
    `return_number` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `return_qty` INTEGER NOT NULL,
    `reason` VARCHAR(255) NULL,
    `returned_by` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `purchase_returns_business_id_idx`(`business_id`),
    INDEX `purchase_returns_purchase_order_id_idx`(`purchase_order_id`),
    INDEX `purchase_returns_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 13. Add Foreign Key Constraints with Restrict Rules (Zero Cascades on Financials)
ALTER TABLE `product_serials` 
    ADD CONSTRAINT `product_serials_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `product_serials_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `product_serials_purchase_item_id_fkey` FOREIGN KEY (`purchase_item_id`) REFERENCES `purchase_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `device_identifiers`
    ADD CONSTRAINT `device_identifiers_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `device_identifiers_serial_id_fkey` FOREIGN KEY (`serial_id`) REFERENCES `product_serials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `serial_sale_histories`
    ADD CONSTRAINT `serial_sale_histories_serial_id_fkey` FOREIGN KEY (`serial_id`) REFERENCES `product_serials`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `serial_sale_histories_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `product_batches`
    ADD CONSTRAINT `product_batches_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `product_batches_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `product_batches_purchase_item_id_fkey` FOREIGN KEY (`purchase_item_id`) REFERENCES `purchase_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `batch_movements`
    ADD CONSTRAINT `batch_movements_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `product_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `order_item_batches`
    ADD CONSTRAINT `order_item_batches_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `order_item_batches_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `product_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `sales_returns`
    ADD CONSTRAINT `sales_returns_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `sales_returns_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `return_item_batches`
    ADD CONSTRAINT `return_item_batches_sales_return_id_fkey` FOREIGN KEY (`sales_return_id`) REFERENCES `sales_returns`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `return_item_batches_order_item_batch_id_fkey` FOREIGN KEY (`order_item_batch_id`) REFERENCES `order_item_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `return_item_serials`
    ADD CONSTRAINT `return_item_serials_sales_return_id_fkey` FOREIGN KEY (`sales_return_id`) REFERENCES `sales_returns`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `return_item_serials_serial_id_fkey` FOREIGN KEY (`serial_id`) REFERENCES `product_serials`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `serial_audit_logs`
    ADD CONSTRAINT `serial_audit_logs_serial_id_fkey` FOREIGN KEY (`serial_id`) REFERENCES `product_serials`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `purchase_returns`
    ADD CONSTRAINT `purchase_returns_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `purchase_returns_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `purchase_returns_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

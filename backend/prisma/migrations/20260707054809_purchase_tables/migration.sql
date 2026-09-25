-- CreateTable
CREATE TABLE `purchase_orders` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `po_number` VARCHAR(50) NOT NULL,
    `supplier_id` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Draft',
    `order_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expected_delivery` DATETIME(3) NULL,
    `subtotal` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL,
    `gst` DOUBLE NOT NULL,
    `transport_cost` DOUBLE NOT NULL DEFAULT 0,
    `grand_total` DOUBLE NOT NULL,
    `remarks` VARCHAR(255) NULL,
    `created_by` VARCHAR(100) NULL,
    `approved_by` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `purchase_orders_supplier_id_idx`(`supplier_id`),
    UNIQUE INDEX `purchase_orders_business_id_po_number_key`(`business_id`, `po_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_items` (
    `id` VARCHAR(50) NOT NULL,
    `purchase_order_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `ordered_quantity` INTEGER NOT NULL,
    `received_quantity` INTEGER NOT NULL DEFAULT 0,
    `remaining_quantity` INTEGER NOT NULL,
    `purchase_price` DOUBLE NOT NULL,
    `gst` DOUBLE NOT NULL DEFAULT 0,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `batch_number` VARCHAR(50) NULL,
    `expiry_date` DATETIME(3) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',

    INDEX `purchase_items_purchase_order_id_idx`(`purchase_order_id`),
    INDEX `purchase_items_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goods_receipts` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `purchase_order_id` VARCHAR(50) NOT NULL,
    `grn_number` VARCHAR(50) NOT NULL,
    `received_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `received_by` VARCHAR(100) NOT NULL,
    `remarks` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `goods_receipts_purchase_order_id_idx`(`purchase_order_id`),
    UNIQUE INDEX `goods_receipts_business_id_grn_number_key`(`business_id`, `grn_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goods_receipt_items` (
    `id` VARCHAR(50) NOT NULL,
    `goods_receipt_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `received_qty` INTEGER NOT NULL,
    `damaged_qty` INTEGER NOT NULL DEFAULT 0,
    `rejected_qty` INTEGER NOT NULL DEFAULT 0,
    `missing_qty` INTEGER NOT NULL DEFAULT 0,
    `batch_number` VARCHAR(50) NULL,
    `expiry_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `goods_receipt_items_goods_receipt_id_idx`(`goods_receipt_id`),
    INDEX `goods_receipt_items_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_returns` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `purchase_order_id` VARCHAR(50) NOT NULL,
    `return_number` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `return_qty` INTEGER NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `returned_by` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `purchase_returns_purchase_order_id_idx`(`purchase_order_id`),
    INDEX `purchase_returns_product_id_idx`(`product_id`),
    UNIQUE INDEX `purchase_returns_business_id_return_number_key`(`business_id`, `return_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_payments` (
    `id` VARCHAR(50) NOT NULL,
    `business_id` VARCHAR(50) NOT NULL,
    `purchase_order_id` VARCHAR(50) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `reference_number` VARCHAR(100) NULL,
    `paid_by` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `purchase_payments_purchase_order_id_idx`(`purchase_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_items` ADD CONSTRAINT `purchase_items_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_receipts` ADD CONSTRAINT `goods_receipts_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_receipts` ADD CONSTRAINT `goods_receipts_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_receipt_items` ADD CONSTRAINT `goods_receipt_items_goods_receipt_id_fkey` FOREIGN KEY (`goods_receipt_id`) REFERENCES `goods_receipts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_returns` ADD CONSTRAINT `purchase_returns_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_returns` ADD CONSTRAINT `purchase_returns_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_payments` ADD CONSTRAINT `purchase_payments_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_payments` ADD CONSTRAINT `purchase_payments_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

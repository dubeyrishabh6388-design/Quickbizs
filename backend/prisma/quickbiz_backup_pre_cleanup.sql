-- QuickBizs Database Backup Pre-Cleanup
-- Generated on 2026-09-17T06:43:14.491Z

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `approval_history`;
CREATE TABLE `approval_history` (
  `id` varchar(50) NOT NULL,
  `task_id` varchar(50) NOT NULL,
  `level` int(11) NOT NULL,
  `approver_email` varchar(100) NOT NULL,
  `action` varchar(20) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `approval_history_task_id_idx` (`task_id`),
  CONSTRAINT `approval_history_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `approvals`;
CREATE TABLE `approvals` (
  `id` varchar(50) NOT NULL,
  `task_id` varchar(50) NOT NULL,
  `level` int(11) NOT NULL DEFAULT 1,
  `approver_role` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `approvals_task_id_idx` (`task_id`),
  CONSTRAINT `approvals_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `attendances`;
CREATE TABLE `attendances` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `check_in` datetime(3) DEFAULT NULL,
  `check_out` datetime(3) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `overtime_hours` double NOT NULL DEFAULT 0,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `attendances_employee_id_idx` (`employee_id`),
  KEY `attendances_date_idx` (`date`),
  KEY `attendances_business_id_fkey` (`business_id`),
  CONSTRAINT `attendances_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `attendances_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `attendances` (`id`, `business_id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `overtime_hours`, `remarks`, `created_at`) VALUES ('213a15d8-c77a-4dab-b6ca-59c30b5e5cb5', 'fresh-choice', 'e3', '2026-07-29 13:07:12', '2026-07-29 13:07:17', NULL, 'Present', 0, NULL, '2026-07-29 13:07:12');
INSERT INTO `attendances` (`id`, `business_id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `overtime_hours`, `remarks`, `created_at`) VALUES ('34eedb8c-bc27-48ee-b4c6-ea6ab1d6cdb1', 'fresh-choice', 'e3', '2026-08-08 01:12:30', '2026-08-08 01:12:30', NULL, 'Present', 0, NULL, '2026-08-08 01:12:30');
INSERT INTO `attendances` (`id`, `business_id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `overtime_hours`, `remarks`, `created_at`) VALUES ('9e6526a9-0854-4c97-8479-41c59125afb7', 'fresh-choice', 'e3', '2026-07-27 07:41:43', '2026-07-26 22:15:00', NULL, 'Present', 0, NULL, '2026-07-27 07:41:43');
INSERT INTO `attendances` (`id`, `business_id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `overtime_hours`, `remarks`, `created_at`) VALUES ('d2ce4469-d8d7-4bdc-9352-f9718e57f639', 'fresh-choice', 'e1', '2026-07-27 07:41:43', '2026-07-26 22:00:00', NULL, 'Present', 0, NULL, '2026-07-27 07:41:43');
INSERT INTO `attendances` (`id`, `business_id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `overtime_hours`, `remarks`, `created_at`) VALUES ('d900ffa9-46e4-464e-8955-bb703a435dcc', 'fresh-choice', 'e3', '2026-08-02 11:33:33', '2026-08-02 11:33:33', NULL, 'Present', 0, NULL, '2026-08-02 11:33:33');
INSERT INTO `attendances` (`id`, `business_id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `overtime_hours`, `remarks`, `created_at`) VALUES ('fb30ad70-d34d-440b-a1fd-8a5524fc2fc8', 'fresh-choice', 'e2', '2026-08-02 11:33:35', '2026-08-02 11:33:35', NULL, 'Present', 0, NULL, '2026-08-02 11:33:35');

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `business_id` varchar(50) NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `device` varchar(150) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `old_value` varchar(500) DEFAULT NULL,
  `new_value` varchar(500) DEFAULT NULL,
  `module` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_business_id_idx` (`business_id`),
  KEY `audit_logs_user_id_fkey` (`user_id`),
  CONSTRAINT `audit_logs_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `auto_setup_templates`;
CREATE TABLE `auto_setup_templates` (
  `id` varchar(50) NOT NULL,
  `business_type` varchar(100) NOT NULL,
  `categories` text NOT NULL,
  `default_unit` varchar(20) NOT NULL DEFAULT 'pcs',
  `tax_rules` text NOT NULL,
  `payment_modes` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auto_setup_templates_business_type_key` (`business_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `automation_actions`;
CREATE TABLE `automation_actions` (
  `id` varchar(50) NOT NULL,
  `rule_id` varchar(50) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `action_params` longtext DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `automation_actions_rule_id_idx` (`rule_id`),
  CONSTRAINT `automation_actions_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `automation_rules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `automation_conditions`;
CREATE TABLE `automation_conditions` (
  `id` varchar(50) NOT NULL,
  `rule_id` varchar(50) NOT NULL,
  `field` varchar(50) NOT NULL,
  `operator` varchar(30) NOT NULL,
  `value` varchar(150) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `automation_conditions_rule_id_idx` (`rule_id`),
  CONSTRAINT `automation_conditions_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `automation_rules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `automation_history`;
CREATE TABLE `automation_history` (
  `id` varchar(50) NOT NULL,
  `rule_id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `trigger_event` varchar(55) NOT NULL,
  `status` varchar(20) NOT NULL,
  `duration` varchar(20) NOT NULL,
  `outcome` varchar(255) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `automation_history_rule_id_idx` (`rule_id`),
  KEY `automation_history_business_id_idx` (`business_id`),
  CONSTRAINT `automation_history_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `automation_rules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `automation_logs`;
CREATE TABLE `automation_logs` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `time` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `trigger` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  `result` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `duration` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `automation_logs_business_id_idx` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `automation_logs` (`id`, `business_id`, `time`, `trigger`, `action`, `result`, `status`, `duration`) VALUES ('07d23465-10aa-490d-9873-fa0c4569409a', 'fresh-choice', '2026-09-06 00:57:05', 'Invoice Generation', 'Create POS Checkout Transaction Ledger', 'Created sales invoice of ₹287 (Invoice: INV-110)', 'Success', '4ms');
INSERT INTO `automation_logs` (`id`, `business_id`, `time`, `trigger`, `action`, `result`, `status`, `duration`) VALUES ('7ff1678c-c961-4d22-8a38-8b9d53338b63', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '2026-07-27 09:03:42', 'Product Catalog Addition', 'Expand Store Inventory', 'Added product "Amul milk" with initial stock 45', 'Success', '3ms');
INSERT INTO `automation_logs` (`id`, `business_id`, `time`, `trigger`, `action`, `result`, `status`, `duration`) VALUES ('9af99edb-d348-456b-87b8-eda9676a9bd3', 'fresh-choice', '2026-09-06 00:57:30', 'Invoice Generation', 'Create POS Checkout Transaction Ledger', 'Created sales invoice of ₹224 (Invoice: INV-111)', 'Success', '4ms');
INSERT INTO `automation_logs` (`id`, `business_id`, `time`, `trigger`, `action`, `result`, `status`, `duration`) VALUES ('b4778d04-09cc-4a1f-90ee-4486dbd9d4c4', 'fresh-choice', '2026-08-23 10:33:26', 'Invoice Generation', 'Create POS Checkout Transaction Ledger', 'Created sales invoice of ₹98 (Invoice: INV-109)', 'Success', '4ms');
INSERT INTO `automation_logs` (`id`, `business_id`, `time`, `trigger`, `action`, `result`, `status`, `duration`) VALUES ('b567ae8a-c429-4e90-886d-04ca97802d3e', 'fresh-choice', '2026-08-08 01:08:24', 'Invoice Generation', 'Create POS Checkout Transaction Ledger', 'Created sales invoice of ₹113 (Invoice: INV-107)', 'Success', '4ms');
INSERT INTO `automation_logs` (`id`, `business_id`, `time`, `trigger`, `action`, `result`, `status`, `duration`) VALUES ('bf36354a-7897-4f8d-a7a3-cef39ad00bbf', 'fresh-choice', '2026-07-29 13:05:10', 'Invoice Generation', 'Create POS Checkout Transaction Ledger', 'Created sales invoice of ₹50 (Invoice: INV-102)', 'Success', '4ms');
INSERT INTO `automation_logs` (`id`, `business_id`, `time`, `trigger`, `action`, `result`, `status`, `duration`) VALUES ('e906fa05-8135-4a16-a594-e6e0b6078941', 'fresh-choice', '2026-08-02 11:20:58', 'Invoice Generation', 'Create POS Checkout Transaction Ledger', 'Created sales invoice of ₹176 (Invoice: INV-105)', 'Success', '4ms');
INSERT INTO `automation_logs` (`id`, `business_id`, `time`, `trigger`, `action`, `result`, `status`, `duration`) VALUES ('ee217be2-2db0-4828-bc9e-8fccacabfbff', 'fresh-choice', '2026-07-29 13:07:02', 'Supplier Profile Update', 'Update Supplier Audit Ledger', 'Modified details for supplier "Amul Milk Dairy" (SUP-0002)', 'Success', '2ms');

DROP TABLE IF EXISTS `automation_rules`;
CREATE TABLE `automation_rules` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `trigger` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `automation_rules_business_id_idx` (`business_id`),
  CONSTRAINT `automation_rules_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `backup_histories`;
CREATE TABLE `backup_histories` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `filename` varchar(150) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL,
  `status` varchar(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `backup_histories_business_id_idx` (`business_id`),
  CONSTRAINT `backup_histories_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `bank_accounts`;
CREATE TABLE `bank_accounts` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_number` varchar(100) NOT NULL,
  `ifsc_code` varchar(50) NOT NULL,
  `balance` double NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bank_accounts_business_id_account_number_key` (`business_id`,`account_number`),
  CONSTRAINT `bank_accounts_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bank_accounts` (`id`, `business_id`, `bank_name`, `account_number`, `ifsc_code`, `balance`, `created_at`, `updated_at`) VALUES ('d9b71191-4a55-45f6-b5ea-3d7ff7c93301', 'fresh-choice', 'State Bank of India', '30001234567', 'SBIN0001234', 50000, '2026-07-27 07:41:43', '2026-07-27 07:41:43');

DROP TABLE IF EXISTS `bank_transactions`;
CREATE TABLE `bank_transactions` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `bank_account_id` varchar(50) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `amount` double NOT NULL,
  `running_balance` double NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `bank_transactions_business_id_idx` (`business_id`),
  KEY `bank_transactions_bank_account_id_idx` (`bank_account_id`),
  CONSTRAINT `bank_transactions_bank_account_id_fkey` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bank_transactions_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `business_categories`;
CREATE TABLE `business_categories` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_categories_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `business_features`;
CREATE TABLE `business_features` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `gst_required` tinyint(1) NOT NULL DEFAULT 0,
  `barcode_required` tinyint(1) NOT NULL DEFAULT 0,
  `inventory_tracking` tinyint(1) NOT NULL DEFAULT 1,
  `credit_ledger` tinyint(1) NOT NULL DEFAULT 1,
  `purchase_management` tinyint(1) NOT NULL DEFAULT 1,
  `employee_management` tinyint(1) NOT NULL DEFAULT 1,
  `home_delivery` tinyint(1) NOT NULL DEFAULT 0,
  `multi_branch` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_features_business_id_key` (`business_id`),
  CONSTRAINT `business_features_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `business_preferences`;
CREATE TABLE `business_preferences` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `business_type` varchar(100) NOT NULL,
  `business_size` varchar(50) NOT NULL,
  `sell_online` tinyint(1) NOT NULL DEFAULT 0,
  `visible_modules` text NOT NULL,
  `dashboard_layout` text NOT NULL,
  `product_attributes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_preferences_business_id_key` (`business_id`),
  CONSTRAINT `business_preferences_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `business_settings`;
CREATE TABLE `business_settings` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `gst_number` varchar(50) DEFAULT NULL,
  `pan_number` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `invoice_prefix` varchar(20) NOT NULL DEFAULT 'INV',
  `invoice_footer` varchar(255) DEFAULT NULL,
  `gst_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `discount_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `round_off_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `timezone` varchar(50) DEFAULT NULL,
  `currency` varchar(50) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `business_settings_business_id_idx` (`business_id`),
  CONSTRAINT `business_settings_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `business_settings` (`id`, `business_id`, `company_name`, `gst_number`, `pan_number`, `address`, `phone`, `invoice_prefix`, `invoice_footer`, `gst_enabled`, `discount_enabled`, `round_off_enabled`, `timezone`, `currency`, `updated_at`) VALUES ('6d766965-98c6-4ac1-8e3e-a94b424d6dc8', 'fresh-choice', 'Fresh Choice Supermarket', '27AAAAA1111A1Z1', 'ABCDE1234F', 'Sector 15, Noida, Uttar Pradesh, 201301', '+91 98765 43210', 'INV', 'Thank you for shopping at Fresh Choice! Please visit again.', 1, 1, 1, 'Asia/Kolkata', 'INR', '2026-07-27 07:41:42');

DROP TABLE IF EXISTS `business_templates`;
CREATE TABLE `business_templates` (
  `id` varchar(50) NOT NULL,
  `category_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `enabled_modules` text NOT NULL,
  `default_categories` text NOT NULL,
  `dashboard_widgets` text NOT NULL,
  `custom_attributes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `business_templates_category_id_fkey` (`category_id`),
  CONSTRAINT `business_templates_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `business_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `businesses`;
CREATE TABLE `businesses` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `plan` varchar(50) NOT NULL DEFAULT 'Basic',
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `max_users` int(11) NOT NULL DEFAULT 5,
  `max_products` int(11) NOT NULL DEFAULT 100,
  `max_customers` int(11) NOT NULL DEFAULT 50,
  `subscription_expires_at` datetime(3) DEFAULT NULL,
  `registered_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `owner_name` varchar(100) DEFAULT NULL,
  `gst_number` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` double DEFAULT 0,
  `longitude` double DEFAULT 0,
  `business_type` varchar(50) DEFAULT 'Kirana',
  `opening_hours` varchar(100) DEFAULT '07:00-21:00',
  `pickup_availability` tinyint(1) NOT NULL DEFAULT 1,
  `is_open` tinyint(1) NOT NULL DEFAULT 1,
  `pickup_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `pickup_time_slots` varchar(255) DEFAULT '15m,30m,1h,2h',
  `max_active_orders` int(11) NOT NULL DEFAULT 20,
  `order_prep_time` int(11) NOT NULL DEFAULT 15,
  `notification_preferences` varchar(255) DEFAULT 'push,sms',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `businesses_phone_key` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `businesses` (`id`, `name`, `plan`, `status`, `max_users`, `max_products`, `max_customers`, `subscription_expires_at`, `registered_date`, `created_at`, `updated_at`, `logo`, `phone`, `email`, `owner_name`, `gst_number`, `address`, `latitude`, `longitude`, `business_type`, `opening_hours`, `pickup_availability`, `is_open`, `pickup_enabled`, `pickup_time_slots`, `max_active_orders`, `order_prep_time`, `notification_preferences`, `is_deleted`, `deleted_at`) VALUES ('c2242090-51ea-4b6b-82f0-68eb36768d0b', 'Mahaveer Dairy', 'Basic', 'Active', 5, 100, 50, NULL, '2026-07-27 09:03:18', '2026-07-27 09:03:18', '2026-07-27 09:03:18', NULL, '+916378248689', 'mahaveer@gmail.com', 'Rishi Dubey', NULL, 'JB nagar chakala Andheri East Mumbai 400097', 0, 0, 'Kirana', '07:00-21:00', 1, 1, 1, '15m,30m,1h,2h', 20, 15, 'push,sms', 0, NULL);
INSERT INTO `businesses` (`id`, `name`, `plan`, `status`, `max_users`, `max_products`, `max_customers`, `subscription_expires_at`, `registered_date`, `created_at`, `updated_at`, `logo`, `phone`, `email`, `owner_name`, `gst_number`, `address`, `latitude`, `longitude`, `business_type`, `opening_hours`, `pickup_availability`, `is_open`, `pickup_enabled`, `pickup_time_slots`, `max_active_orders`, `order_prep_time`, `notification_preferences`, `is_deleted`, `deleted_at`) VALUES ('fresh-choice', 'Fresh Choice Supermarket', 'Premium', 'Active', 5, 100, 50, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42', '2026-07-27 07:41:42', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 'Kirana', '07:00-21:00', 1, 1, 1, '15m,30m,1h,2h', 20, 15, 'push,sms', 0, NULL);

DROP TABLE IF EXISTS `cash_ledgers`;
CREATE TABLE `cash_ledgers` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `amount` double NOT NULL,
  `running_balance` double NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `cash_ledgers_business_id_idx` (`business_id`),
  CONSTRAINT `cash_ledgers_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cash_shortcuts`;
CREATE TABLE `cash_shortcuts` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `amount` double NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cash_shortcuts_business_id_fkey` (`business_id`),
  CONSTRAINT `cash_shortcuts_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `checkout_queue`;
CREATE TABLE `checkout_queue` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `cart_name` varchar(100) NOT NULL,
  `items` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `checkout_queue_business_id_fkey` (`business_id`),
  CONSTRAINT `checkout_queue_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `counter_combos`;
CREATE TABLE `counter_combos` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` double NOT NULL,
  `product_ids` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `counter_combos_business_id_fkey` (`business_id`),
  CONSTRAINT `counter_combos_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `counter_heatmap`;
CREATE TABLE `counter_heatmap` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `hour` int(11) NOT NULL,
  `sales_count` int(11) NOT NULL DEFAULT 0,
  `revenue` double NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `counter_heatmap_business_id_hour_key` (`business_id`,`hour`),
  CONSTRAINT `counter_heatmap_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `counter_patterns`;
CREATE TABLE `counter_patterns` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `time_block` varchar(50) NOT NULL,
  `day_of_week` varchar(20) NOT NULL,
  `sales_count` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `counter_patterns_business_id_product_id_time_block_day_of_we_key` (`business_id`,`product_id`,`time_block`,`day_of_week`),
  KEY `counter_patterns_product_id_fkey` (`product_id`),
  CONSTRAINT `counter_patterns_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `counter_patterns_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `counter_preferences`;
CREATE TABLE `counter_preferences` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `rush_mode` tinyint(1) NOT NULL DEFAULT 0,
  `selling_mode` varchar(50) NOT NULL DEFAULT 'Retail Store',
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `counter_preferences_business_id_key` (`business_id`),
  CONSTRAINT `counter_preferences_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `counter_sales`;
CREATE TABLE `counter_sales` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `total_amount` double NOT NULL,
  `items` text NOT NULL,
  `offline_id` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `counter_sales_business_id_fkey` (`business_id`),
  CONSTRAINT `counter_sales_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `counter_sales` (`id`, `business_id`, `payment_method`, `total_amount`, `items`, `offline_id`, `created_at`) VALUES ('3e420aa5-d45a-4b5d-93c0-1fac25a50bf9', 'fresh-choice', 'Cash', 45, '[{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1},{"productId":"p-pn-100","name":"🧀 Paneer (100g)","price":40,"quantity":1}]', NULL, '2026-07-29 13:06:11');
INSERT INTO `counter_sales` (`id`, `business_id`, `payment_method`, `total_amount`, `items`, `offline_id`, `created_at`) VALUES ('46de1eee-89e4-42ca-924d-bb3d4dd3665d', 'fresh-choice', 'Cash', 255, '[{"productId":"p-dm-50","name":"🍫 Dairy Milk (₹50)","price":50,"quantity":1},{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1},{"productId":"p-pn-500","name":"🧀 Paneer (500g)","price":200,"quantity":1}]', NULL, '2026-08-08 01:09:27');
INSERT INTO `counter_sales` (`id`, `business_id`, `payment_method`, `total_amount`, `items`, `offline_id`, `created_at`) VALUES ('553896d4-eb13-4972-9bd8-21fa1cf38d84', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'Cash', 60, '[{"productId":"p1-1L","name":"🥛 Amul Milk (1L)","price":60,"quantity":1}]', NULL, '2026-07-31 23:38:59');
INSERT INTO `counter_sales` (`id`, `business_id`, `payment_method`, `total_amount`, `items`, `offline_id`, `created_at`) VALUES ('7df0c928-fb0f-4b8e-bff1-aff4ca4676b5', 'fresh-choice', 'Cash', 45, '[{"productId":"p-pn-100","name":"🧀 Paneer (100g)","price":40,"quantity":1},{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1}]', NULL, '2026-08-02 11:17:53');
INSERT INTO `counter_sales` (`id`, `business_id`, `payment_method`, `total_amount`, `items`, `offline_id`, `created_at`) VALUES ('b694d43b-84b4-41d0-92d7-8213c9a9a690', 'fresh-choice', 'Cash', 45, '[{"productId":"p-pn-100","name":"🧀 Paneer (100g)","price":40,"quantity":1},{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1}]', NULL, '2026-07-29 13:03:10');
INSERT INTO `counter_sales` (`id`, `business_id`, `payment_method`, `total_amount`, `items`, `offline_id`, `created_at`) VALUES ('ec4d662f-b34f-4690-a266-fe5786d1e0fe', 'fresh-choice', 'Cash', 135, '[{"productId":"p-dm-10","name":"🍫 Dairy Milk (₹10)","price":10,"quantity":1},{"productId":"p-dm-20","name":"🍫 Dairy Milk (₹20)","price":20,"quantity":1},{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1},{"productId":"p-pn-250","name":"🧀 Paneer (250g)","price":100,"quantity":1}]', NULL, '2026-08-08 01:06:58');

DROP TABLE IF EXISTS `counter_sessions`;
CREATE TABLE `counter_sessions` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `opened_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `closed_at` datetime(3) DEFAULT NULL,
  `opening_balance` double NOT NULL DEFAULT 0,
  `closing_balance` double DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Open',
  PRIMARY KEY (`id`),
  KEY `counter_sessions_business_id_fkey` (`business_id`),
  CONSTRAINT `counter_sessions_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `counter_suggestions`;
CREATE TABLE `counter_suggestions` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` varchar(255) NOT NULL,
  `is_dismissed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `counter_suggestions_business_id_fkey` (`business_id`),
  CONSTRAINT `counter_suggestions_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `counter_templates`;
CREATE TABLE `counter_templates` (
  `id` varchar(50) NOT NULL,
  `business_type` varchar(100) NOT NULL,
  `layout_type` varchar(50) NOT NULL,
  `counter_tiles` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `counter_templates_business_type_key` (`business_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customer_complaints`;
CREATE TABLE `customer_complaints` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Open',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `customer_complaints_business_id_idx` (`business_id`),
  KEY `customer_complaints_customer_id_idx` (`customer_id`),
  CONSTRAINT `customer_complaints_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customer_coupons`;
CREATE TABLE `customer_coupons` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount` double NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `customer_coupons_business_id_idx` (`business_id`),
  KEY `customer_coupons_customer_id_idx` (`customer_id`),
  CONSTRAINT `customer_coupons_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customer_credit_history`;
CREATE TABLE `customer_credit_history` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `score` int(11) NOT NULL,
  `risk_level` varchar(20) NOT NULL,
  `limit` double NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `customer_credit_history_business_id_idx` (`business_id`),
  KEY `customer_credit_history_customer_id_idx` (`customer_id`),
  CONSTRAINT `customer_credit_history_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customer_ledgers`;
CREATE TABLE `customer_ledgers` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `reference_number` varchar(100) NOT NULL,
  `amount` double NOT NULL,
  `running_balance` double NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `customer_ledgers_business_id_idx` (`business_id`),
  KEY `customer_ledgers_customer_id_idx` (`customer_id`),
  CONSTRAINT `customer_ledgers_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `customer_ledgers_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `customer_ledgers` (`id`, `business_id`, `customer_id`, `transaction_type`, `reference_number`, `amount`, `running_balance`, `description`, `created_at`) VALUES ('6d445056-cca0-45d5-a83a-9ca604cb1e76', 'fresh-choice', 'c3', 'Payment', 'RCV-7b8ce914', 1250, 0, 'Cleared via Recovery Center task settlement.', '2026-07-29 13:04:51');

DROP TABLE IF EXISTS `customer_notes`;
CREATE TABLE `customer_notes` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `note_text` text NOT NULL,
  `author` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `customer_notes_business_id_idx` (`business_id`),
  KEY `customer_notes_customer_id_idx` (`customer_id`),
  CONSTRAINT `customer_notes_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customer_payments`;
CREATE TABLE `customer_payments` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `amount` double NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `received_by` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `customer_payments_business_id_idx` (`business_id`),
  KEY `customer_payments_customer_id_idx` (`customer_id`),
  CONSTRAINT `customer_payments_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customer_reminders`;
CREATE TABLE `customer_reminders` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `due_at` datetime(3) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `created_by` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `customer_reminders_business_id_idx` (`business_id`),
  KEY `customer_reminders_customer_id_idx` (`customer_id`),
  CONSTRAINT `customer_reminders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customer_tags`;
CREATE TABLE `customer_tags` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `tag_name` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `customer_tags_business_id_idx` (`business_id`),
  KEY `customer_tags_customer_id_idx` (`customer_id`),
  CONSTRAINT `customer_tags_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customer_transactions`;
CREATE TABLE `customer_transactions` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `amount` double NOT NULL,
  `running_balance` double NOT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `customer_transactions_business_id_idx` (`business_id`),
  KEY `customer_transactions_customer_id_idx` (`customer_id`),
  CONSTRAINT `customer_transactions_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pin_code` varchar(20) DEFAULT NULL,
  `gst_number` varchar(50) DEFAULT NULL,
  `credit_limit` double NOT NULL DEFAULT 10000,
  `pending_amount` double NOT NULL DEFAULT 0,
  `reward_points` int(11) NOT NULL DEFAULT 0,
  `last_purchase_at` datetime(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `membership_level` varchar(20) NOT NULL DEFAULT 'Bronze',
  `referred_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customers_business_id_idx` (`business_id`),
  KEY `customers_mobile_idx` (`mobile`),
  KEY `customers_customer_code_idx` (`customer_code`),
  CONSTRAINT `customers_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `customers` (`id`, `business_id`, `customer_code`, `name`, `mobile`, `email`, `address`, `city`, `state`, `pin_code`, `gst_number`, `credit_limit`, `pending_amount`, `reward_points`, `last_purchase_at`, `is_active`, `is_deleted`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `membership_level`, `referred_by`) VALUES ('c1', 'fresh-choice', 'CUST-0001', 'Ramesh Kumar', '+91 98765 43210', 'ramesh@example.com', 'Sector 15', 'Noida', 'Uttar Pradesh', '201301', NULL, 10000, 500, 0, NULL, 1, 0, NULL, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42', NULL, 'Bronze', NULL);
INSERT INTO `customers` (`id`, `business_id`, `customer_code`, `name`, `mobile`, `email`, `address`, `city`, `state`, `pin_code`, `gst_number`, `credit_limit`, `pending_amount`, `reward_points`, `last_purchase_at`, `is_active`, `is_deleted`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `membership_level`, `referred_by`) VALUES ('c2', 'fresh-choice', 'CUST-0002', 'Sunita Sharma', '+91 98123 45678', 'sunita@example.com', 'Malviya Nagar', 'New Delhi', 'Delhi', '110017', NULL, 10000, 0, 0, NULL, 1, 0, NULL, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42', NULL, 'Bronze', NULL);
INSERT INTO `customers` (`id`, `business_id`, `customer_code`, `name`, `mobile`, `email`, `address`, `city`, `state`, `pin_code`, `gst_number`, `credit_limit`, `pending_amount`, `reward_points`, `last_purchase_at`, `is_active`, `is_deleted`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `membership_level`, `referred_by`) VALUES ('c3', 'fresh-choice', 'CUST-0003', 'Amit Patel', '+91 99988 87776', 'amit@example.com', 'Satellite Area', 'Ahmedabad', 'Gujarat', '380015', NULL, 10000, 0, 0, NULL, 1, 0, NULL, NULL, '2026-07-27 07:41:42', '2026-07-29 13:04:51', NULL, 'Bronze', NULL);
INSERT INTO `customers` (`id`, `business_id`, `customer_code`, `name`, `mobile`, `email`, `address`, `city`, `state`, `pin_code`, `gst_number`, `credit_limit`, `pending_amount`, `reward_points`, `last_purchase_at`, `is_active`, `is_deleted`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `membership_level`, `referred_by`) VALUES ('c4', 'fresh-choice', 'CUST-0004', 'Priya Singh', '+91 97776 65544', 'priya@example.com', 'Gomti Nagar', 'Lucknow', 'Uttar Pradesh', '226010', NULL, 10000, 0, 0, NULL, 1, 0, NULL, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42', NULL, 'Bronze', NULL);

DROP TABLE IF EXISTS `daily_business_briefings`;
CREATE TABLE `daily_business_briefings` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `briefing_date` datetime(3) NOT NULL,
  `generated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `shown_to` varchar(50) DEFAULT NULL,
  `viewed_at` datetime(3) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Generated',
  `data` longtext NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `daily_business_briefings_business_id_idx` (`business_id`),
  KEY `daily_business_briefings_shown_to_fkey` (`shown_to`),
  CONSTRAINT `daily_business_briefings_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_business_briefings_shown_to_fkey` FOREIGN KEY (`shown_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `daily_business_summaries`;
CREATE TABLE `daily_business_summaries` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `summary_date` datetime(3) NOT NULL,
  `morning_generated` tinyint(1) NOT NULL DEFAULT 0,
  `midday_generated` tinyint(1) NOT NULL DEFAULT 0,
  `closing_generated` tinyint(1) NOT NULL DEFAULT 0,
  `health_score` int(11) NOT NULL DEFAULT 100,
  `sales_score` int(11) NOT NULL DEFAULT 100,
  `profit_score` int(11) NOT NULL DEFAULT 100,
  `inventory_score` int(11) NOT NULL DEFAULT 100,
  `customer_score` int(11) NOT NULL DEFAULT 100,
  `finance_score` int(11) NOT NULL DEFAULT 100,
  `summary_json` longtext NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `daily_business_summaries_business_id_idx` (`business_id`),
  CONSTRAINT `daily_business_summaries_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('0ac19c07-f06d-46fe-b345-00b89dbcae11', 'fresh-choice', '2026-07-26 13:00:00', 0, 0, 0, 81, 65, 75, 90, 85, 90, '{"morning":{"header":{"businessName":"Fresh Choice Supermarket","currentFY":"2026-27","todayDate":"7/27/2026","currentTime":"8:00:21 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":1750,"supplierPayments":13500,"attendance":{"present":2,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[{"name":"Amul Paneer (200g)"},{"name":"Tata Salt (1kg)"},{"name":"Good Day Cookies"}],"expiringSoon":[],"lowStock":[{"name":"Amul Milk (1L)","stock":5,"minStock":15,"recommendedQty":30,"supplier":"Amul Milk Dairy"},{"name":"Premium Sugar (1kg)","stock":7,"minStock":12,"recommendedQty":24,"supplier":"Kirana Wholesale"},{"name":"Amul Paneer (200g)","stock":0,"minStock":8,"recommendedQty":16,"supplier":"Amul Milk Dairy"}],"negativeMargin":[],"inactiveCustomersCount":4,"supplierPaymentsDue":[{"name":"Kirana Wholesale","dues":12000},{"name":"Amul Milk Dairy","dues":1500}]},"priorities":["Restock Amul Milk (1L) (Order 30 units from Amul Milk Dairy)","Restock Premium Sugar (1kg) (Order 24 units from Kirana Wholesale)","Restock Amul Paneer (200g) (Order 16 units from Amul Milk Dairy)","Collect outstanding dues ₹500 from Ramesh Kumar","Settle payment due of ₹12000 to Kirana Wholesale","Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":3,"cashBalance":0,"attendance":{"present":2,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Amul Milk (1L) stock is running low."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":8150,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":1750},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Ramesh Kumar","topEmployee":"Aarti","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":3,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Follow-up with customer Amit Patel for dues ₹1250","Pay due ₹1500 to supplier Amul Milk Dairy","Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-07-27 09:00:21');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('2b1b8448-3ed3-46cf-9ec6-181074b27007', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '2026-08-07 13:00:00', 0, 0, 0, 79, 65, 75, 90, 85, 80, '{"morning":{"header":{"businessName":"Mahaveer Dairy","currentFY":"2026-27","todayDate":"8/8/2026","currentTime":"2:00:24 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":0,"supplierPayments":0,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[],"expiringSoon":[],"lowStock":[],"negativeMargin":[],"inactiveCustomersCount":0,"supplierPaymentsDue":[]},"priorities":["Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":0,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Inventory stock levels are healthy."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":0},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Rahul Traders","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":0,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-07 13:05:42');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('72d10232-7473-407e-a3dc-3ceb014c12aa', 'fresh-choice', '2026-08-05 13:00:00', 0, 0, 0, 81, 65, 75, 90, 85, 90, '{"morning":{"header":{"businessName":"Fresh Choice Supermarket","currentFY":"2026-27","todayDate":"8/6/2026","currentTime":"8:00:33 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":500,"supplierPayments":12300,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[{"name":"Amul Paneer (200g)"},{"name":"Tata Salt (1kg)"},{"name":"Good Day Cookies"}],"expiringSoon":[],"lowStock":[{"name":"Amul Milk (1L)","stock":8,"minStock":15,"recommendedQty":30,"supplier":"Amul Milk Dairy"},{"name":"Premium Sugar (1kg)","stock":7,"minStock":12,"recommendedQty":24,"supplier":"Kirana Wholesale"},{"name":"Amul Paneer (200g)","stock":0,"minStock":8,"recommendedQty":16,"supplier":"Amul Milk Dairy"}],"negativeMargin":[],"inactiveCustomersCount":4,"supplierPaymentsDue":[{"name":"Kirana Wholesale","dues":12000},{"name":"Amul Milk Dairy","dues":300}]},"priorities":["Restock Amul Milk (1L) (Order 30 units from Amul Milk Dairy)","Restock Premium Sugar (1kg) (Order 24 units from Kirana Wholesale)","Restock Amul Paneer (200g) (Order 16 units from Amul Milk Dairy)","Collect outstanding dues ₹500 from Ramesh Kumar","Settle payment due of ₹12000 to Kirana Wholesale","Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":3,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Amul Milk (1L) stock is running low."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":500},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Ramesh Kumar","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":3,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Pay due ₹300 to supplier Amul Milk Dairy","Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-06 09:00:33');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('72f7519f-3baf-4c87-9830-469fcf5ddd0d', 'fresh-choice', '2026-08-09 13:00:00', 0, 0, 0, 81, 65, 75, 90, 85, 90, '{"morning":{"header":{"businessName":"Fresh Choice Supermarket","currentFY":"2026-27","todayDate":"8/10/2026","currentTime":"8:00:54 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":500,"supplierPayments":12300,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[{"name":"Amul Paneer (200g)"},{"name":"Tata Salt (1kg)"},{"name":"Good Day Cookies"}],"expiringSoon":[],"lowStock":[{"name":"Amul Milk (1L)","stock":7,"minStock":15,"recommendedQty":30,"supplier":"Amul Milk Dairy"},{"name":"Premium Sugar (1kg)","stock":12,"minStock":12,"recommendedQty":24,"supplier":"Kirana Wholesale"},{"name":"Amul Paneer (200g)","stock":0,"minStock":8,"recommendedQty":16,"supplier":"Amul Milk Dairy"}],"negativeMargin":[],"inactiveCustomersCount":4,"supplierPaymentsDue":[{"name":"Kirana Wholesale","dues":12000},{"name":"Amul Milk Dairy","dues":300}]},"priorities":["Restock Amul Milk (1L) (Order 30 units from Amul Milk Dairy)","Restock Premium Sugar (1kg) (Order 24 units from Kirana Wholesale)","Restock Amul Paneer (200g) (Order 16 units from Amul Milk Dairy)","Collect outstanding dues ₹500 from Ramesh Kumar","Settle payment due of ₹12000 to Kirana Wholesale","Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":3,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Amul Milk (1L) stock is running low."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":500},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Ramesh Kumar","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":3,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Pay due ₹300 to supplier Amul Milk Dairy","Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-10 09:00:54');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('8bbc76d4-be11-4bd7-bda0-dab5c78a8b05', 'fresh-choice', '2026-08-06 13:00:00', 0, 0, 0, 81, 65, 75, 90, 85, 90, '{"morning":{"header":{"businessName":"Fresh Choice Supermarket","currentFY":"2026-27","todayDate":"8/7/2026","currentTime":"8:00:54 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":500,"supplierPayments":12300,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[{"name":"Amul Paneer (200g)"},{"name":"Tata Salt (1kg)"},{"name":"Good Day Cookies"}],"expiringSoon":[],"lowStock":[{"name":"Amul Milk (1L)","stock":8,"minStock":15,"recommendedQty":30,"supplier":"Amul Milk Dairy"},{"name":"Premium Sugar (1kg)","stock":7,"minStock":12,"recommendedQty":24,"supplier":"Kirana Wholesale"},{"name":"Amul Paneer (200g)","stock":0,"minStock":8,"recommendedQty":16,"supplier":"Amul Milk Dairy"}],"negativeMargin":[],"inactiveCustomersCount":4,"supplierPaymentsDue":[{"name":"Kirana Wholesale","dues":12000},{"name":"Amul Milk Dairy","dues":300}]},"priorities":["Restock Amul Milk (1L) (Order 30 units from Amul Milk Dairy)","Restock Premium Sugar (1kg) (Order 24 units from Kirana Wholesale)","Restock Amul Paneer (200g) (Order 16 units from Amul Milk Dairy)","Collect outstanding dues ₹500 from Ramesh Kumar","Settle payment due of ₹12000 to Kirana Wholesale","Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":3,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Amul Milk (1L) stock is running low."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":500},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Ramesh Kumar","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":3,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Pay due ₹300 to supplier Amul Milk Dairy","Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-07 03:00:24');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('8c8377ad-ce7f-4078-86f3-a1d042d8aa55', 'fresh-choice', '2026-08-07 13:00:00', 0, 0, 0, 81, 65, 75, 90, 85, 90, '{"morning":{"header":{"businessName":"Fresh Choice Supermarket","currentFY":"2026-27","todayDate":"8/8/2026","currentTime":"2:00:24 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":500,"supplierPayments":12300,"attendance":{"present":1,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[{"name":"Amul Paneer (200g)"},{"name":"Tata Salt (1kg)"},{"name":"Good Day Cookies"}],"expiringSoon":[],"lowStock":[{"name":"Amul Milk (1L)","stock":7,"minStock":15,"recommendedQty":30,"supplier":"Amul Milk Dairy"},{"name":"Premium Sugar (1kg)","stock":12,"minStock":12,"recommendedQty":24,"supplier":"Kirana Wholesale"},{"name":"Amul Paneer (200g)","stock":0,"minStock":8,"recommendedQty":16,"supplier":"Amul Milk Dairy"}],"negativeMargin":[],"inactiveCustomersCount":4,"supplierPaymentsDue":[{"name":"Kirana Wholesale","dues":12000},{"name":"Amul Milk Dairy","dues":300}]},"priorities":["Restock Amul Milk (1L) (Order 30 units from Amul Milk Dairy)","Restock Premium Sugar (1kg) (Order 24 units from Kirana Wholesale)","Restock Amul Paneer (200g) (Order 16 units from Amul Milk Dairy)","Collect outstanding dues ₹500 from Ramesh Kumar","Settle payment due of ₹12000 to Kirana Wholesale","Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":503,"targetSales":10000,"targetCompletion":5,"currentProfit":135,"currentOrders":3,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"N/A","lowStockCount":3,"cashBalance":0,"attendance":{"present":1,"absent":0},"insights":["You have completed 5% of today\'s target.","Sales are trending higher than yesterday.","N/A is selling fast today.","Amul Milk (1L) stock is running low."]},"closing":{"summary":{"sales":503,"profit":135,"expenses":0,"purchases":0,"bills":3,"cashCollection":503,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":500},"winners":{"topProduct":"N/A","topCategory":"Dairy","topCustomer":"Ramesh Kumar","topEmployee":"Aarti","highestProfitProduct":"N/A"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":3,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Pay due ₹300 to supplier Amul Milk Dairy","Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-07 13:05:42');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('8f9e3ad9-2a0d-44f7-84c1-85835db2a2cc', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '2026-07-29 13:00:00', 0, 0, 0, 79, 65, 75, 90, 85, 80, '{"morning":{"header":{"businessName":"Mahaveer Dairy","currentFY":"2026-27","todayDate":"7/30/2026","currentTime":"12:05:36 AM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":0,"supplierPayments":0,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[],"expiringSoon":[],"lowStock":[],"negativeMargin":[],"inactiveCustomersCount":0,"supplierPaymentsDue":[]},"priorities":["Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":0,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Inventory stock levels are healthy."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":0},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Rahul Traders","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":0,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-07-29 13:05:36');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('8fa40717-6461-4cfe-8248-892f861e8b06', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '2026-08-02 13:00:00', 0, 0, 0, 79, 65, 75, 90, 85, 80, '{"morning":{"header":{"businessName":"Mahaveer Dairy","currentFY":"2026-27","todayDate":"8/3/2026","currentTime":"8:00:58 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":0,"supplierPayments":0,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[],"expiringSoon":[],"lowStock":[],"negativeMargin":[],"inactiveCustomersCount":0,"supplierPaymentsDue":[]},"priorities":["Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":0,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Inventory stock levels are healthy."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":0},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Rahul Traders","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":0,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-03 03:00:29');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('916603e5-cbfd-4498-88f9-d3f225351043', 'fresh-choice', '2026-07-29 13:00:00', 0, 0, 0, 81, 65, 75, 90, 85, 90, '{"morning":{"header":{"businessName":"Fresh Choice Supermarket","currentFY":"2026-27","todayDate":"7/30/2026","currentTime":"12:05:36 AM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":500,"supplierPayments":13500,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[{"name":"Amul Paneer (200g)"},{"name":"Tata Salt (1kg)"},{"name":"Good Day Cookies"}],"expiringSoon":[],"lowStock":[{"name":"Amul Milk (1L)","stock":5,"minStock":15,"recommendedQty":30,"supplier":"Amul Milk Dairy"},{"name":"Premium Sugar (1kg)","stock":7,"minStock":12,"recommendedQty":24,"supplier":"Kirana Wholesale"},{"name":"Amul Paneer (200g)","stock":0,"minStock":8,"recommendedQty":16,"supplier":"Amul Milk Dairy"}],"negativeMargin":[],"inactiveCustomersCount":4,"supplierPaymentsDue":[{"name":"Kirana Wholesale","dues":12000},{"name":"Amul Milk Dairy","dues":1500}]},"priorities":["Restock Amul Milk (1L) (Order 30 units from Amul Milk Dairy)","Restock Premium Sugar (1kg) (Order 24 units from Kirana Wholesale)","Restock Amul Paneer (200g) (Order 16 units from Amul Milk Dairy)","Collect outstanding dues ₹500 from Ramesh Kumar","Settle payment due of ₹12000 to Kirana Wholesale","Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":95,"targetSales":10000,"targetCompletion":1,"currentProfit":23.5,"currentOrders":2,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"N/A","lowStockCount":3,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 1% of today\'s target.","Sales are trending higher than yesterday.","N/A is selling fast today.","Amul Milk (1L) stock is running low."]},"closing":{"summary":{"sales":95,"profit":23.5,"expenses":0,"purchases":0,"bills":2,"cashCollection":95,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":500},"winners":{"topProduct":"N/A","topCategory":"Dairy","topCustomer":"Ramesh Kumar","topEmployee":"Sunil Verma","highestProfitProduct":"N/A"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":3,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Pay due ₹1500 to supplier Amul Milk Dairy","Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-07-29 13:05:36');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('953d82a7-1eeb-4837-b923-eb9cbf919fd5', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '2026-08-09 13:00:00', 0, 0, 0, 79, 65, 75, 90, 85, 80, '{"morning":{"header":{"businessName":"Mahaveer Dairy","currentFY":"2026-27","todayDate":"8/10/2026","currentTime":"8:00:54 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":0,"supplierPayments":0,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[],"expiringSoon":[],"lowStock":[],"negativeMargin":[],"inactiveCustomersCount":0,"supplierPaymentsDue":[]},"priorities":["Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":0,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Inventory stock levels are healthy."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":0},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Rahul Traders","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":0,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-10 09:00:54');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('976ec00e-c8ee-4513-9805-7766eb2f74b4', 'fresh-choice', '2026-08-02 13:00:00', 0, 0, 0, 81, 65, 75, 90, 85, 90, '{"morning":{"header":{"businessName":"Fresh Choice Supermarket","currentFY":"2026-27","todayDate":"8/3/2026","currentTime":"8:00:58 PM"},"yesterdaySummary":{"sales":221,"profit":45.5,"expenses":0,"purchases":0,"orders":2,"avgBillValue":110.5,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":221,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":500,"supplierPayments":12300,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[{"name":"Product","qty":1,"revenue":5,"category":"General"},{"name":"Product","qty":1,"revenue":40,"category":"General"},{"name":"Tata Salt (1kg)","qty":1,"revenue":29.4,"category":"Groceries"},{"name":"Taj Mahal Tea (250g)","qty":1,"revenue":126,"category":"Groceries"},{"name":"Good Day Cookies","qty":1,"revenue":21,"category":"Snacks"}],"highestProfitProduct":"Product","highestRevenueCategory":"General","mostSoldBrand":"Product"},"problemArea":{"zeroSales":[{"name":"Amul Paneer (200g)"},{"name":"Tata Salt (1kg)"},{"name":"Good Day Cookies"}],"expiringSoon":[],"lowStock":[{"name":"Amul Milk (1L)","stock":8,"minStock":15,"recommendedQty":30,"supplier":"Amul Milk Dairy"},{"name":"Premium Sugar (1kg)","stock":7,"minStock":12,"recommendedQty":24,"supplier":"Kirana Wholesale"},{"name":"Amul Paneer (200g)","stock":0,"minStock":8,"recommendedQty":16,"supplier":"Amul Milk Dairy"}],"negativeMargin":[],"inactiveCustomersCount":4,"supplierPaymentsDue":[{"name":"Kirana Wholesale","dues":12000},{"name":"Amul Milk Dairy","dues":300}]},"priorities":["Restock Amul Milk (1L) (Order 30 units from Amul Milk Dairy)","Restock Premium Sugar (1kg) (Order 24 units from Kirana Wholesale)","Restock Amul Paneer (200g) (Order 16 units from Amul Milk Dairy)","Collect outstanding dues ₹500 from Ramesh Kumar","Settle payment due of ₹12000 to Kirana Wholesale","Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":3,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Amul Milk (1L) stock is running low."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":500},"winners":{"topProduct":"Amul Gold Milk","topCategory":"General","topCustomer":"Ramesh Kumar","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":3,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Pay due ₹300 to supplier Amul Milk Dairy","Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-03 03:00:29');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('9f9bb768-d58c-4491-9171-c4d6699b8342', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '2026-08-06 13:00:00', 0, 0, 0, 79, 65, 75, 90, 85, 80, '{"morning":{"header":{"businessName":"Mahaveer Dairy","currentFY":"2026-27","todayDate":"8/7/2026","currentTime":"8:00:54 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":0,"supplierPayments":0,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[],"expiringSoon":[],"lowStock":[],"negativeMargin":[],"inactiveCustomersCount":0,"supplierPaymentsDue":[]},"priorities":["Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":0,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Inventory stock levels are healthy."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":0},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Rahul Traders","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":0,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-07 03:00:24');
INSERT INTO `daily_business_summaries` (`id`, `business_id`, `summary_date`, `morning_generated`, `midday_generated`, `closing_generated`, `health_score`, `sales_score`, `profit_score`, `inventory_score`, `customer_score`, `finance_score`, `summary_json`, `created_at`) VALUES ('fe87a49f-f91d-44cb-a6e7-072ea2d6c3e5', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '2026-08-05 13:00:00', 0, 0, 0, 79, 65, 75, 90, 85, 80, '{"morning":{"header":{"businessName":"Mahaveer Dairy","currentFY":"2026-27","todayDate":"8/6/2026","currentTime":"8:00:33 PM"},"yesterdaySummary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"orders":0,"avgBillValue":0,"newCustomers":0,"repeatCustomers":0,"totalCustomers":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0},"todayStatus":{"openingCash":5000,"pendingOrders":0,"pendingPurchaseOrders":0,"pendingPayments":0,"supplierPayments":0,"attendance":{"present":0,"absent":0}},"bestProducts":{"topSelling":[],"highestProfitProduct":"Amul Gold Milk","highestRevenueCategory":"Dairy","mostSoldBrand":"Amul"},"problemArea":{"zeroSales":[],"expiringSoon":[],"lowStock":[],"negativeMargin":[],"inactiveCustomersCount":0,"supplierPaymentsDue":[]},"priorities":["Verify register morning opening cash box","Confirm helper shift tasks schedules"]},"midday":{"currentSales":0,"targetSales":10000,"targetCompletion":0,"currentProfit":0,"currentOrders":0,"busyHours":"11:00 AM - 1:00 PM","slowHours":"2:00 PM - 4:00 PM","bestProductToday":"Amul Gold Milk","lowStockCount":0,"cashBalance":0,"attendance":{"present":0,"absent":0},"insights":["You have completed 0% of today\'s target.","Sales are lower than yesterday.","Amul Gold Milk is selling fast today.","Inventory stock levels are healthy."]},"closing":{"summary":{"sales":0,"profit":0,"expenses":0,"purchases":0,"bills":0,"cashCollection":0,"upiCollection":0,"cardCollection":0,"creditSales":0,"outstandingCollection":0},"winners":{"topProduct":"Amul Gold Milk","topCategory":"Dairy","topCustomer":"Rahul Traders","topEmployee":"Sunil Verma","highestProfitProduct":"Amul Gold Milk"},"attentionRequired":{"pendingPaymentsCount":0,"pendingPurchasesCount":0,"lowStockCount":0,"negativeProfitProducts":[],"openTasksCount":0},"tomorrowPlan":["Audit safety stock thresholds parameters","Hold bi-weekly cashier reconciliation meeting"]}}', '2026-08-06 09:00:33');

DROP TABLE IF EXISTS `daily_closings`;
CREATE TABLE `daily_closings` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `closing_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `cash_sales` double NOT NULL,
  `upi_sales` double NOT NULL,
  `card_sales` double NOT NULL,
  `wallet_sales` double NOT NULL,
  `credit_sales` double NOT NULL,
  `expenses` double NOT NULL,
  `net_cash` double NOT NULL,
  `expected_cash` double NOT NULL,
  `actual_cash` double NOT NULL,
  `difference` double NOT NULL,
  `confirmed_by` varchar(100) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `daily_closings_business_id_closing_date_key` (`business_id`,`closing_date`),
  CONSTRAINT `daily_closings_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `daily_missions`;
CREATE TABLE `daily_missions` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `priority` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `category` varchar(50) NOT NULL,
  `value` double DEFAULT NULL,
  `target_id` varchar(50) DEFAULT NULL,
  `due_date` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `daily_missions_business_id_idx` (`business_id`),
  CONSTRAINT `daily_missions_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `dashboard_templates`;
CREATE TABLE `dashboard_templates` (
  `id` varchar(50) NOT NULL,
  `business_type` varchar(100) NOT NULL,
  `widgets` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dashboard_templates_business_type_key` (`business_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `employee_tasks`;
CREATE TABLE `employee_tasks` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'Medium',
  `status` varchar(50) NOT NULL DEFAULT 'Todo',
  `due_date` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `employee_tasks_employee_id_idx` (`employee_id`),
  KEY `employee_tasks_business_id_fkey` (`business_id`),
  CONSTRAINT `employee_tasks_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `employee_tasks_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `employee_code` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `dob` datetime(3) DEFAULT NULL,
  `joining_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `designation` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `salary` double NOT NULL DEFAULT 15000,
  `employment_type` varchar(50) NOT NULL DEFAULT 'Full-Time',
  `manager_id` varchar(50) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `profile_photo` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `emergency_contact` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employees_business_id_employee_code_key` (`business_id`,`employee_code`),
  KEY `employees_mobile_idx` (`mobile`),
  CONSTRAINT `employees_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `employees` (`id`, `business_id`, `employee_code`, `first_name`, `last_name`, `mobile`, `email`, `gender`, `dob`, `joining_date`, `designation`, `department`, `salary`, `employment_type`, `manager_id`, `status`, `profile_photo`, `address`, `emergency_contact`, `created_at`, `updated_at`, `deleted_at`) VALUES ('e1', 'fresh-choice', 'EMP-001', 'Sunil', 'Verma', '+91 98765 00001', NULL, NULL, NULL, '2026-07-27 07:41:43', 'Cashier / Billing', NULL, 12000, 'Full-Time', NULL, 'Active', NULL, NULL, NULL, '2026-07-27 07:41:43', '2026-07-27 07:41:43', NULL);
INSERT INTO `employees` (`id`, `business_id`, `employee_code`, `first_name`, `last_name`, `mobile`, `email`, `gender`, `dob`, `joining_date`, `designation`, `department`, `salary`, `employment_type`, `manager_id`, `status`, `profile_photo`, `address`, `emergency_contact`, `created_at`, `updated_at`, `deleted_at`) VALUES ('e2', 'fresh-choice', 'EMP-002', 'Rohit', 'Singh', '+91 98765 00002', NULL, NULL, NULL, '2026-07-27 07:41:43', 'Helper / Delivery', NULL, 8000, 'Full-Time', NULL, 'Active', NULL, NULL, NULL, '2026-07-27 07:41:43', '2026-07-27 07:41:43', NULL);
INSERT INTO `employees` (`id`, `business_id`, `employee_code`, `first_name`, `last_name`, `mobile`, `email`, `gender`, `dob`, `joining_date`, `designation`, `department`, `salary`, `employment_type`, `manager_id`, `status`, `profile_photo`, `address`, `emergency_contact`, `created_at`, `updated_at`, `deleted_at`) VALUES ('e3', 'fresh-choice', 'EMP-003', 'Aarti', 'Sharma', '+91 98765 00003', NULL, NULL, NULL, '2026-07-27 07:41:43', 'Accountant', NULL, 18000, 'Full-Time', NULL, 'Active', NULL, NULL, NULL, '2026-07-27 07:41:43', '2026-07-27 07:41:43', NULL);

DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` double NOT NULL,
  `category` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Approved',
  `logged_by` varchar(100) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expenses_business_id_idx` (`business_id`),
  CONSTRAINT `expenses_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `expenses` (`id`, `business_id`, `description`, `amount`, `category`, `status`, `logged_by`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('a9d8d32e-27aa-4c8f-82dd-1ed6460cdd0c', 'fresh-choice', 'Store Shop Rent (July)', 8000, 'Rent', 'Approved', 'owner@quickbizs.com', NULL, '2026-07-27 07:41:43', '2026-07-27 07:41:43', NULL);
INSERT INTO `expenses` (`id`, `business_id`, `description`, `amount`, `category`, `status`, `logged_by`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('ce0ede2d-662a-411f-b2d6-e6ef05a49174', 'fresh-choice', 'Chai & Samosas for Staff', 150, 'Tea/Snacks', 'Approved', 'owner@quickbizs.com', NULL, '2026-07-27 07:41:43', '2026-07-27 07:41:43', NULL);

DROP TABLE IF EXISTS `goods_receipt_items`;
CREATE TABLE `goods_receipt_items` (
  `id` varchar(50) NOT NULL,
  `goods_receipt_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `received_qty` int(11) NOT NULL,
  `damaged_qty` int(11) NOT NULL DEFAULT 0,
  `rejected_qty` int(11) NOT NULL DEFAULT 0,
  `missing_qty` int(11) NOT NULL DEFAULT 0,
  `batch_number` varchar(50) DEFAULT NULL,
  `expiry_date` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `goods_receipt_items_goods_receipt_id_idx` (`goods_receipt_id`),
  KEY `goods_receipt_items_product_id_idx` (`product_id`),
  CONSTRAINT `goods_receipt_items_goods_receipt_id_fkey` FOREIGN KEY (`goods_receipt_id`) REFERENCES `goods_receipts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `goods_receipts`;
CREATE TABLE `goods_receipts` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `purchase_order_id` varchar(50) NOT NULL,
  `grn_number` varchar(50) NOT NULL,
  `received_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `received_by` varchar(100) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `goods_receipts_business_id_grn_number_key` (`business_id`,`grn_number`),
  KEY `goods_receipts_purchase_order_id_idx` (`purchase_order_id`),
  CONSTRAINT `goods_receipts_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `goods_receipts_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `inventories`;
CREATE TABLE `inventories` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `available_quantity` int(11) NOT NULL DEFAULT 0,
  `reserved_quantity` int(11) NOT NULL DEFAULT 0,
  `damaged_quantity` int(11) NOT NULL DEFAULT 0,
  `minimum_stock` int(11) NOT NULL DEFAULT 10,
  `maximum_stock` int(11) NOT NULL DEFAULT 100,
  `reorder_level` int(11) NOT NULL DEFAULT 15,
  `warehouse_id` varchar(50) DEFAULT NULL,
  `last_updated` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `batch_number` varchar(50) DEFAULT NULL,
  `expiry_date` datetime(3) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'IN_STOCK',
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventories_business_id_product_id_key` (`business_id`,`product_id`),
  KEY `inventories_product_id_idx` (`product_id`),
  KEY `inventories_warehouse_id_idx` (`warehouse_id`),
  CONSTRAINT `inventories_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventories_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventories_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `inventories` (`id`, `business_id`, `product_id`, `available_quantity`, `reserved_quantity`, `damaged_quantity`, `minimum_stock`, `maximum_stock`, `reorder_level`, `warehouse_id`, `last_updated`, `created_at`, `updated_at`, `deleted_at`, `batch_number`, `expiry_date`, `status`) VALUES ('51d28268-8853-42cb-a2c2-0cfa57c5c531', 'fresh-choice', 'p5', 0, 0, 0, 8, 100, 13, 'wh-main', '2026-09-06 00:40:46', '2026-07-27 07:41:42', '2026-09-06 00:40:46', NULL, NULL, NULL, 'OUT_OF_STOCK');
INSERT INTO `inventories` (`id`, `business_id`, `product_id`, `available_quantity`, `reserved_quantity`, `damaged_quantity`, `minimum_stock`, `maximum_stock`, `reorder_level`, `warehouse_id`, `last_updated`, `created_at`, `updated_at`, `deleted_at`, `batch_number`, `expiry_date`, `status`) VALUES ('7baf59fb-6a14-406f-8433-a4fb26166d57', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '83ba80ee-019b-47cf-84e0-1b2084a59972', 38, 1, 0, 5, 100, 10, 'wh-main', '2026-08-08 01:16:10', '2026-07-27 09:03:42', '2026-08-08 01:16:10', NULL, NULL, NULL, 'IN_STOCK');
INSERT INTO `inventories` (`id`, `business_id`, `product_id`, `available_quantity`, `reserved_quantity`, `damaged_quantity`, `minimum_stock`, `maximum_stock`, `reorder_level`, `warehouse_id`, `last_updated`, `created_at`, `updated_at`, `deleted_at`, `batch_number`, `expiry_date`, `status`) VALUES ('7e582f09-0d5e-4f52-b3aa-089706fa6aed', 'fresh-choice', 'p6', 9, 0, 0, 10, 100, 15, 'wh-main', '2026-09-06 00:57:30', '2026-07-27 07:41:42', '2026-09-06 00:57:30', NULL, NULL, NULL, 'IN_STOCK');
INSERT INTO `inventories` (`id`, `business_id`, `product_id`, `available_quantity`, `reserved_quantity`, `damaged_quantity`, `minimum_stock`, `maximum_stock`, `reorder_level`, `warehouse_id`, `last_updated`, `created_at`, `updated_at`, `deleted_at`, `batch_number`, `expiry_date`, `status`) VALUES ('8c21cfec-22be-4f32-92cd-080fad990948', 'fresh-choice', 'p2', 18, 0, 0, 10, 100, 15, 'wh-main', '2026-09-06 00:57:30', '2026-07-27 07:41:42', '2026-09-06 00:57:30', NULL, NULL, NULL, 'IN_STOCK');
INSERT INTO `inventories` (`id`, `business_id`, `product_id`, `available_quantity`, `reserved_quantity`, `damaged_quantity`, `minimum_stock`, `maximum_stock`, `reorder_level`, `warehouse_id`, `last_updated`, `created_at`, `updated_at`, `deleted_at`, `batch_number`, `expiry_date`, `status`) VALUES ('a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'fresh-choice', 'p3', 9, 0, 0, 12, 100, 17, 'wh-main', '2026-09-06 00:57:30', '2026-07-27 07:41:42', '2026-09-06 00:57:30', NULL, NULL, NULL, 'LOW_STOCK');
INSERT INTO `inventories` (`id`, `business_id`, `product_id`, `available_quantity`, `reserved_quantity`, `damaged_quantity`, `minimum_stock`, `maximum_stock`, `reorder_level`, `warehouse_id`, `last_updated`, `created_at`, `updated_at`, `deleted_at`, `batch_number`, `expiry_date`, `status`) VALUES ('a983467f-32b1-47ef-8701-dd2c09e439f8', 'fresh-choice', 'p4', 51, 0, 0, 15, 100, 20, 'wh-main', '2026-09-06 00:40:46', '2026-07-27 07:41:42', '2026-09-06 00:40:46', NULL, NULL, NULL, 'IN_STOCK');
INSERT INTO `inventories` (`id`, `business_id`, `product_id`, `available_quantity`, `reserved_quantity`, `damaged_quantity`, `minimum_stock`, `maximum_stock`, `reorder_level`, `warehouse_id`, `last_updated`, `created_at`, `updated_at`, `deleted_at`, `batch_number`, `expiry_date`, `status`) VALUES ('c66f0144-1491-4850-a5c8-424c6fec6074', 'fresh-choice', 'p7', 12, 0, 0, 12, 100, 17, 'wh-main', '2026-09-17 00:56:59', '2026-07-27 07:41:42', '2026-09-17 00:56:59', NULL, NULL, NULL, 'LOW_STOCK');
INSERT INTO `inventories` (`id`, `business_id`, `product_id`, `available_quantity`, `reserved_quantity`, `damaged_quantity`, `minimum_stock`, `maximum_stock`, `reorder_level`, `warehouse_id`, `last_updated`, `created_at`, `updated_at`, `deleted_at`, `batch_number`, `expiry_date`, `status`) VALUES ('d089fd98-5376-412c-8973-5b38d008efd1', 'fresh-choice', 'p1', 6, 0, 0, 15, 100, 20, 'wh-main', '2026-09-06 00:57:05', '2026-07-27 07:41:42', '2026-09-06 00:57:05', NULL, NULL, NULL, 'LOW_STOCK');

DROP TABLE IF EXISTS `inventory_transactions`;
CREATE TABLE `inventory_transactions` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `inventory_id` varchar(50) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `balance_after` int(11) NOT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `inventory_transactions_business_id_idx` (`business_id`),
  KEY `inventory_transactions_product_id_idx` (`product_id`),
  KEY `inventory_transactions_inventory_id_idx` (`inventory_id`),
  CONSTRAINT `inventory_transactions_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('0e7a0324-0080-4b17-8101-4a6f854e8430', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '83ba80ee-019b-47cf-84e0-1b2084a59972', '7baf59fb-6a14-406f-8433-a4fb26166d57', 'PICKUP_RESERVATION', 2, 43, '41372a49-a745-4158-be87-13a4a6c3e677', 'Order Checkout Reservation', 'Rishi Dubey', '2026-07-29 13:21:36');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('12e41733-a8e2-4c77-b403-1dc0be3f1282', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '83ba80ee-019b-47cf-84e0-1b2084a59972', '7baf59fb-6a14-406f-8433-a4fb26166d57', 'SALE', 1, 42, 'b143de14-0f7c-4148-a7bc-c41532c95506', 'Pickup Order Collected', 'merchant', '2026-07-31 23:36:24');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('156e4be8-e2cf-49a7-9644-a8868091a048', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '83ba80ee-019b-47cf-84e0-1b2084a59972', '7baf59fb-6a14-406f-8433-a4fb26166d57', 'PICKUP_RESERVATION', 1, 42, 'b143de14-0f7c-4148-a7bc-c41532c95506', 'Order Checkout Reservation', 'Rishabh Dubey', '2026-07-31 23:36:04');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('301e3dd4-6e89-44fb-8a5a-e7d0dbbc0d3d', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'ADJUSTMENT', 1, 8, NULL, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:07');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('3123d8bc-f3d5-40ac-869a-ca9592391d15', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '83ba80ee-019b-47cf-84e0-1b2084a59972', '7baf59fb-6a14-406f-8433-a4fb26166d57', 'SALE', 2, 43, '41372a49-a745-4158-be87-13a4a6c3e677', 'Pickup Order Collected', 'merchant', '2026-07-29 13:28:06');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('3695520c-d490-4493-9b98-2da34e370de1', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'ADJUSTMENT', 1, 13, NULL, 'Manual Stock Adjustment', 'System', '2026-09-17 00:56:58');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('60942534-53c1-4b66-adfa-98d201cf61f8', 'fresh-choice', 'p2', '8c21cfec-22be-4f32-92cd-080fad990948', 'PICKUP_RESERVATION', 1, 21, '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'Order Checkout Reservation', 'Rishabh Dubey', '2026-07-27 07:50:55');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('60d3e675-36bd-4c4f-8c71-51bf74b2fc03', 'fresh-choice', 'p1', 'd089fd98-5376-412c-8973-5b38d008efd1', 'ADJUSTMENT', 1, 7, NULL, 'Manual Stock Adjustment', 'System', '2026-07-29 13:06:29');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('64983daa-1948-4db9-87f0-ce665980bf92', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'ADJUSTMENT', 1, 10, NULL, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:08');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('6e287c59-43bb-444f-820c-f998d4b7dc27', 'fresh-choice', 'p4', 'a983467f-32b1-47ef-8701-dd2c09e439f8', 'PICKUP_RESERVATION', 1, 51, '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'Order Checkout Reservation', 'Rishabh Dubey', '2026-07-27 07:50:55');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('6ec8f520-a384-4c7a-b01e-a04813801263', 'fresh-choice', 'p5', '51d28268-8853-42cb-a2c2-0cfa57c5c531', 'PICKUP_RESERVATION', 3, 0, '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'Order Checkout Reservation', 'Rishabh Dubey', '2026-07-27 07:50:55');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('7ba4ae1c-11bd-4e39-a808-6b0aac15dd13', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'PICKUP_RESERVATION', 1, 7, '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'Order Checkout Reservation', 'Rishabh Dubey', '2026-07-27 07:50:55');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('8120b3f3-deee-471a-85b8-a2f48ef69cf6', 'fresh-choice', 'p1', 'd089fd98-5376-412c-8973-5b38d008efd1', 'ADJUSTMENT', 1, 6, NULL, 'Manual Stock Adjustment', 'System', '2026-07-29 13:06:27');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('8185cf22-5562-40b2-85da-8a758abd13bf', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'ADJUSTMENT', 1, 12, NULL, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:08');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('8d68ea69-9c34-4f7e-beec-661c47bf6740', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'SALE', 1, 11, '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'Pickup Order Collected', 'merchant', '2026-09-06 00:40:46');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('93a2008c-d38a-47a0-907b-550131e49509', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '83ba80ee-019b-47cf-84e0-1b2084a59972', '7baf59fb-6a14-406f-8433-a4fb26166d57', 'SALE', 3, 38, '3b9550a0-3672-41bf-af20-a883986d1921', 'Pickup Order Collected', 'merchant', '2026-08-08 01:16:10');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('baf29137-dc9d-48c9-8d2e-d95543159f0b', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '83ba80ee-019b-47cf-84e0-1b2084a59972', '7baf59fb-6a14-406f-8433-a4fb26166d57', 'PICKUP_RESERVATION', 1, 41, 'a517fb60-30fa-4755-9142-9f036b9d964d', 'Order Checkout Reservation', 'Rishabh Dubey', '2026-08-02 11:38:52');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('bff8fe47-7016-4198-b6c5-e83958b29f42', 'fresh-choice', 'p1', 'd089fd98-5376-412c-8973-5b38d008efd1', 'ADJUSTMENT', 1, 8, NULL, 'Manual Stock Adjustment', 'System', '2026-07-29 13:06:29');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('c27c3c37-433d-4eec-a3df-65ae6b2bdbf2', 'fresh-choice', 'p4', 'a983467f-32b1-47ef-8701-dd2c09e439f8', 'SALE', 1, 51, '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'Pickup Order Collected', 'merchant', '2026-09-06 00:40:46');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('c6222b67-d00d-4bb9-af3c-7e5a73fe98eb', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '83ba80ee-019b-47cf-84e0-1b2084a59972', '7baf59fb-6a14-406f-8433-a4fb26166d57', 'PICKUP_RESERVATION', 3, 38, '3b9550a0-3672-41bf-af20-a883986d1921', 'Order Checkout Reservation', 'Rishabh Dubey', '2026-08-08 01:15:13');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('c730a38d-3dcc-4b47-9335-888fc32a0f3d', 'fresh-choice', 'p5', '51d28268-8853-42cb-a2c2-0cfa57c5c531', 'SALE', 3, 0, '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'Pickup Order Collected', 'merchant', '2026-09-06 00:40:46');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('c94cb987-2fc7-4323-aa77-7babfe1152b4', 'fresh-choice', 'p2', '8c21cfec-22be-4f32-92cd-080fad990948', 'SALE', 1, 20, '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'Pickup Order Collected', 'merchant', '2026-09-06 00:40:46');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('d34ff1c2-046b-4fe2-8468-cdb9ec631b58', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'ADJUSTMENT', 1, 12, NULL, 'Manual Stock Adjustment', 'System', '2026-09-17 00:56:59');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('db721c4b-1cc9-4bbb-9f12-1694f3c92be6', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'ADJUSTMENT', 1, 11, NULL, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:08');
INSERT INTO `inventory_transactions` (`id`, `business_id`, `product_id`, `inventory_id`, `transaction_type`, `quantity`, `balance_after`, `reference_id`, `reason`, `created_by`, `created_at`) VALUES ('e7003188-4c48-4233-b63b-1887e3dbec44', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'ADJUSTMENT', 1, 9, NULL, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:07');

DROP TABLE IF EXISTS `invoice_sequences`;
CREATE TABLE `invoice_sequences` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `prefix` varchar(20) NOT NULL DEFAULT 'INV',
  `next_value` int(11) NOT NULL DEFAULT 101,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_sequences_business_id_prefix_key` (`business_id`,`prefix`),
  CONSTRAINT `invoice_sequences_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `invoice_sequences` (`id`, `business_id`, `prefix`, `next_value`, `created_at`, `updated_at`) VALUES ('5df688b1-ea88-4c61-80d8-45bca72297cc', 'fresh-choice', 'INV', 112, '2026-07-27 07:41:43', '2026-09-06 00:57:30');
INSERT INTO `invoice_sequences` (`id`, `business_id`, `prefix`, `next_value`, `created_at`, `updated_at`) VALUES ('72b8c5db-0d9d-4492-a1e5-b8f462dce647', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'INV', 1002, '2026-07-31 23:38:59', '2026-07-31 23:38:59');

DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `leave_type` varchar(50) NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `reason` varchar(255) NOT NULL,
  `approved_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `leave_requests_employee_id_idx` (`employee_id`),
  KEY `leave_requests_business_id_fkey` (`business_id`),
  CONSTRAINT `leave_requests_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `leave_requests_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `mission_centers`;
CREATE TABLE `mission_centers` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `sales_score` double NOT NULL DEFAULT 0,
  `profit_score` double NOT NULL DEFAULT 0,
  `recovery_score` double NOT NULL DEFAULT 0,
  `inventory_score` double NOT NULL DEFAULT 0,
  `customer_score` double NOT NULL DEFAULT 0,
  `employee_score` double NOT NULL DEFAULT 0,
  `overall_score` double NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mission_centers_business_id_idx` (`business_id`),
  CONSTRAINT `mission_centers_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `mission_logs`;
CREATE TABLE `mission_logs` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `mission_id` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `performed_by` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `mission_logs_business_id_idx` (`business_id`),
  CONSTRAINT `mission_logs_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notification_settings`;
CREATE TABLE `notification_settings` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `role` varchar(50) NOT NULL,
  `low_stock` tinyint(1) NOT NULL DEFAULT 1,
  `expense` tinyint(1) NOT NULL DEFAULT 1,
  `purchase` tinyint(1) NOT NULL DEFAULT 1,
  `attendance` tinyint(1) NOT NULL DEFAULT 1,
  `approval` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_settings_business_id_role_key` (`business_id`,`role`),
  CONSTRAINT `notification_settings_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `message` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'Medium',
  `module` varchar(50) NOT NULL DEFAULT 'System',
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `notifications_business_id_idx` (`business_id`),
  KEY `notifications_user_id_idx` (`user_id`),
  KEY `notifications_is_read_idx` (`is_read`),
  KEY `notifications_created_at_idx` (`created_at`),
  CONSTRAINT `notifications_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('0adbd8f6-ef48-4555-a3eb-d1fde182d483', 'fresh-choice', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-01 11:18:38', '2026-08-01 11:18:38');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('17e81e98-f9c9-4a22-a5fb-6591f0035e7d', 'fresh-choice', NULL, 'Low Stock: Premium Sugar (1kg)', 'Premium Sugar (1kg) has dropped below the minimum threshold (Stock: 7 / Min: 12).', 'Warning', 'High', 'Inventory', 'Product', 'p3', 0, NULL, '2026-07-27 08:04:56', '2026-07-27 08:04:56');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('21f2ef76-84dd-4cd5-934c-be194ce817f2', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-02 11:08:49', '2026-08-02 11:08:49');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('24e7134e-1715-4d05-9db7-3a77ba6155b5', 'fresh-choice', NULL, 'Employee Check-In', 'Employee check-in logged for ID: e3. Status: Present.', 'Information', 'Low', 'Employees', 'Employee', 'e3', 0, NULL, '2026-08-08 01:12:30', '2026-08-08 01:12:30');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('24f9fde0-5c83-4ed6-bb65-ddf211161433', 'fresh-choice', NULL, 'Low Stock: Tata Salt (1kg)', 'Tata Salt (1kg) has dropped below the minimum threshold (Stock: 9 / Min: 10).', 'Warning', 'High', 'Inventory', 'Product', 'p6', 0, NULL, '2026-09-17 00:47:46', '2026-09-17 00:47:46');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('2915b2d1-8ea7-4c6f-aee9-3962fdd24ff1', 'fresh-choice', NULL, 'Invoice Created', 'Checkout successful. Invoice #INV-110 for ₹287 generated.', 'Success', 'Medium', 'Billing', 'Order', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 0, NULL, '2026-09-06 00:57:05', '2026-09-06 00:57:05');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('2f502a6b-e99b-43e7-bbf5-ea157d6f3256', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-25 09:14:56', '2026-08-25 09:14:56');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('2f5a3ce1-4e9d-4f63-9fe2-7c739068bdf8', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by 1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p3', 0, NULL, '2026-08-08 01:10:08', '2026-08-08 01:10:08');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('32039539-109e-4f62-be00-9391022ce279', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-10 09:08:54', '2026-08-10 09:08:54');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('336a41c1-b429-48d1-a0bf-4a5019e8960a', 'fresh-choice', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-06 09:07:37', '2026-08-06 09:07:37');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('379c20a1-bf8d-421e-9cd9-7790aee71ea4', 'fresh-choice', NULL, 'Invoice Created', 'Checkout successful. Invoice #INV-102 for ₹50 generated.', 'Success', 'Medium', 'Billing', 'Order', 'f78011ec-8d7d-4e34-80ae-3b986dbd5a99', 0, NULL, '2026-07-29 13:05:10', '2026-07-29 13:05:10');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('3d096221-775d-4b3b-a18a-04222694078a', 'fresh-choice', NULL, 'Outstanding payment pending', 'Rs. 1,250 is due from customer Ramesh Kumar.', 'Info', 'Medium', 'Billing', NULL, NULL, 0, NULL, '2026-07-27 07:41:43', '2026-07-27 07:41:43');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('4312e9f3-e98e-4db9-a458-cf947991012c', 'fresh-choice', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-23 10:54:16', '2026-08-23 10:54:16');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('44f11bcd-1afd-4e60-bf41-063caad50361', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by 1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p1', 0, NULL, '2026-07-29 13:06:29', '2026-07-29 13:06:29');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('488e4985-4c3f-412c-bf26-4624a9f1a589', 'fresh-choice', NULL, 'Invoice Created', 'Checkout successful. Invoice #INV-109 for ₹98 generated.', 'Success', 'Medium', 'Billing', 'Order', '65d8b20d-3cab-4590-84ee-c193b88aff54', 0, NULL, '2026-08-23 10:33:26', '2026-08-23 10:33:26');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('506c9560-5a8f-457f-a4a3-b91040b8d1f6', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by 1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p3', 0, NULL, '2026-08-08 01:10:08', '2026-08-08 01:10:08');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('552af160-59ca-43c3-8879-895574a794d4', 'fresh-choice', NULL, 'Invoice Created', 'Checkout successful. Invoice #INV-107 for ₹113 generated.', 'Success', 'Medium', 'Billing', 'Order', '440a3145-9a10-4b5b-866c-c31477550d6e', 0, NULL, '2026-08-08 01:08:24', '2026-08-08 01:08:24');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('58f139a9-78ab-41f5-a75f-a57ff2d683a6', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-01 11:18:38', '2026-08-01 11:18:38');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('5c067c38-770b-47e6-b2de-d3ffba8765d2', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by 1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p3', 0, NULL, '2026-08-08 01:10:07', '2026-08-08 01:10:07');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('5da0219a-4f4a-4917-a97c-db1ea54ab3cf', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by 1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p1', 0, NULL, '2026-07-29 13:06:27', '2026-07-29 13:06:27');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('6bedcb3e-e26b-4b0c-8f46-fe5247d37c47', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by -1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p7', 0, NULL, '2026-09-17 00:56:59', '2026-09-17 00:56:59');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('6ce3db19-1300-4caa-8cdc-36cb52907122', 'fresh-choice', NULL, 'Low Stock: Amul Milk (1L)', 'Amul Milk (1L) has dropped below the minimum threshold (Stock: 5 / Min: 15).', 'Warning', 'High', 'Inventory', 'Product', 'p1', 0, NULL, '2026-07-27 08:04:56', '2026-07-27 08:04:56');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('7314b474-0589-4fd4-8e3b-b261119b8cf1', 'fresh-choice', NULL, 'Employee Check-In', 'Employee check-in logged for ID: e2. Status: Present.', 'Information', 'Low', 'Employees', 'Employee', 'e2', 0, NULL, '2026-08-02 11:33:35', '2026-08-02 11:33:35');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('7ae732bd-ff30-4ecd-b49a-79a837275cd5', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by 1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p3', 0, NULL, '2026-08-08 01:10:07', '2026-08-08 01:10:07');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('7d1d3470-96fd-4191-97c0-779b6c4930ae', 'fresh-choice', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-07 09:09:53', '2026-08-07 09:09:53');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('801f516e-9488-4cb0-aa39-03ad0a29324c', 'fresh-choice', NULL, 'Low Stock: Amul Paneer (200g)', 'Amul Paneer (200g) has dropped below the minimum threshold (Stock: 0 / Min: 8).', 'Critical', 'Critical', 'Inventory', 'Product', 'p5', 0, NULL, '2026-07-27 08:04:56', '2026-07-27 08:04:56');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('82be0a10-7016-4a39-b10f-873984cd4d00', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-07 09:09:53', '2026-08-07 09:09:53');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('8fefe5bd-61c2-4baf-9d91-fa24d32b78da', 'fresh-choice', NULL, 'Invoice Created', 'Checkout successful. Invoice #INV-105 for ₹176 generated.', 'Success', 'Medium', 'Billing', 'Order', '9d11fa21-9e91-48c8-8d1f-336c06568f86', 0, NULL, '2026-08-02 11:20:58', '2026-08-02 11:20:58');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('966291f0-8729-483f-b392-bab52515720b', 'fresh-choice', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-08 09:24:03', '2026-08-08 09:24:03');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('96cda75c-127a-4f6b-a987-2d51117dbfea', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-23 10:54:16', '2026-08-23 10:54:16');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('a001cee0-bf95-4255-bc4d-5b58192901da', 'fresh-choice', NULL, 'Payment Received', 'Payment received for Invoice #INV-109 via Cash.', 'Success', 'Low', 'Billing', 'Order', NULL, 0, NULL, '2026-08-23 10:33:26', '2026-08-23 10:33:26');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('a3fae337-4305-4adf-aff0-a46600e754da', 'fresh-choice', NULL, 'Payment Received', 'Payment received for Invoice #INV-102 via Cash.', 'Success', 'Low', 'Billing', 'Order', NULL, 0, NULL, '2026-07-29 13:05:10', '2026-07-29 13:05:10');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('a806cb33-7923-49a4-be7a-abb6b412cb71', 'fresh-choice', NULL, 'Payment Received', 'Payment received for Invoice #INV-111 via Cash.', 'Success', 'Low', 'Billing', 'Order', NULL, 0, NULL, '2026-09-06 00:57:30', '2026-09-06 00:57:30');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('ae1aab60-8fed-409a-a08f-abddee715b91', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-08 09:24:03', '2026-08-08 09:24:03');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('ae31ac13-1bf4-44a3-b4c5-8367f9d1cf37', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by 1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p1', 0, NULL, '2026-07-29 13:06:29', '2026-07-29 13:06:29');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('b545aae8-68cb-4679-8546-6f43d91a7e83', 'fresh-choice', NULL, 'Payment Received', 'Payment received for Invoice #INV-105 via Cash.', 'Success', 'Low', 'Billing', 'Order', NULL, 0, NULL, '2026-08-02 11:20:58', '2026-08-02 11:20:58');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('bcd61363-37d0-4b32-8277-9c5fcbca6219', 'fresh-choice', NULL, 'Employee Check-In', 'Employee check-in logged for ID: e3. Status: Present.', 'Information', 'Low', 'Employees', 'Employee', 'e3', 0, NULL, '2026-08-02 11:33:33', '2026-08-02 11:33:33');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('cf7cd3b0-6845-4b42-83e0-b8820c1587b8', 'fresh-choice', NULL, 'Payment Received', 'Payment received for Invoice #INV-110 via Cash.', 'Success', 'Low', 'Billing', 'Order', NULL, 0, NULL, '2026-09-06 00:57:05', '2026-09-06 00:57:05');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('d590aec3-cafe-4b23-94f7-89e6a652c29c', 'fresh-choice', NULL, 'Payment Received', 'Payment received for Invoice #INV-107 via Cash.', 'Success', 'Low', 'Billing', 'Order', NULL, 0, NULL, '2026-08-08 01:08:24', '2026-08-08 01:08:24');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('d6180853-c890-4ee8-a7b5-351a80a71b6b', 'fresh-choice', NULL, 'Employee Check-In', 'Employee check-in logged for ID: e3. Status: Present.', 'Information', 'Low', 'Employees', 'Employee', 'e3', 0, NULL, '2026-07-29 13:07:17', '2026-07-29 13:07:17');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('dedda8f0-9034-4557-9b44-3d95e09a4b70', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by 1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p3', 0, NULL, '2026-08-08 01:10:08', '2026-08-08 01:10:08');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('dfecacf3-b4c2-4dd5-8f1e-b0f3c06327b1', 'fresh-choice', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-25 09:14:57', '2026-08-25 09:14:57');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('e456ca4c-9cff-450f-a4c5-b724b83d7391', 'fresh-choice', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-02 11:08:49', '2026-08-02 11:08:49');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('ee534308-a9c1-4208-a7d1-b29ec626c9a2', 'fresh-choice', NULL, 'Stock Adjustment', 'Inventory stock level for Product adjusted by 1 units. Reason: Manual Stock Adjustment.', 'Warning', 'Medium', 'Inventory', 'Product', 'p7', 0, NULL, '2026-09-17 00:56:58', '2026-09-17 00:56:58');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('f179ddc2-b3bf-4606-9a0a-a02d3fec0dd9', 'fresh-choice', NULL, 'Low Stock: Amul Milk (1L)', 'Shelf stock level has fallen below warning safety limit.', 'Warning', 'High', 'Inventory', NULL, NULL, 0, NULL, '2026-07-27 07:41:43', '2026-07-27 07:41:43');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('f2819fb6-ad11-4883-abf6-6314202a4f25', 'fresh-choice', NULL, 'Invoice Created', 'Checkout successful. Invoice #INV-111 for ₹224 generated.', 'Success', 'Medium', 'Billing', 'Order', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 0, NULL, '2026-09-06 00:57:30', '2026-09-06 00:57:30');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('f9771e9d-ae36-4bcc-9929-884cfa52c1b3', 'fresh-choice', NULL, 'Low Stock: Good Day Cookies', 'Good Day Cookies has dropped below the minimum threshold (Stock: 12 / Min: 12).', 'Warning', 'High', 'Inventory', 'Product', 'p7', 0, NULL, '2026-09-17 00:47:46', '2026-09-17 00:47:46');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('fb512bbe-9478-4c10-bb49-b570c821478a', 'fresh-choice', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-10 09:08:54', '2026-08-10 09:08:54');
INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `title`, `message`, `type`, `priority`, `module`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES ('fd306e11-c7ed-4713-ab7e-c01f8e1d196d', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', NULL, 'Daily Closing Pending', 'Today\'s daily billing ledger register closing is outstanding. Please reconcile cash box drawer.', 'Reminder', 'High', 'Finance', NULL, NULL, 0, NULL, '2026-08-06 09:07:37', '2026-08-06 09:07:37');

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` varchar(50) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` double NOT NULL,
  `discount` double NOT NULL,
  `gst` double NOT NULL,
  `total` double NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_idx` (`order_id`),
  KEY `order_items_product_id_idx` (`product_id`),
  CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('0202d4e6-8769-4eea-be94-b1c494345993', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'p7', 'Good Day Cookies', '8901234567896', 1, 20, 0, 5, 21, '2026-09-06 00:57:30');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('054d4a60-ecd1-4bad-87a2-6baf00243e86', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'p7', 'Good Day Cookies', '8901234567896', 1, 20, 0, 5, 21, '2026-09-06 00:57:05');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('0c893d5d-3009-4df7-bdd9-31ac4bd0a41c', 'd60db32e-ee45-43d5-af5d-bfe6256aacc4', 'p-pn-100', '🧀 Paneer (100g)', NULL, 1, 40, 0, 18, 40, '2026-07-29 13:03:10');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('0eafacd9-2887-4aff-bf5c-5e3fa00b8206', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'p3', 'Premium Sugar (1kg)', '8901234567892', 1, 45, 0, 5, 47.25, '2026-09-06 00:57:30');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('110135be-5cae-45e2-acaa-569e597a1deb', '9d11fa21-9e91-48c8-8d1f-336c06568f86', 'p6', 'Tata Salt (1kg)', '8901234567895', 1, 28, 0, 5, 29.4, '2026-08-02 11:20:57');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('133e6a27-6b77-4f4e-8b78-71a0d388186c', '9d11fa21-9e91-48c8-8d1f-336c06568f86', 'p2', 'Taj Mahal Tea (250g)', '8901234567891', 1, 120, 0, 5, 126, '2026-08-02 11:20:57');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('1ef886fb-926d-472e-9ed5-53946c8760eb', 'd60db32e-ee45-43d5-af5d-bfe6256aacc4', 'p-dm-5', '🍫 Dairy Milk (₹5)', NULL, 1, 5, 0, 18, 5, '2026-07-29 13:03:10');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('1fe63b60-e65d-4aa0-bb44-c29451d69389', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'p6', 'Tata Salt (1kg)', '8901234567895', 1, 28, 0, 5, 29.4, '2026-09-06 00:57:05');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('21d71c06-c429-4983-a64f-04b77996d1c6', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'p3', 'Premium Sugar (1kg)', '8901234567892', 1, 45, 0, 5, 47.25, '2026-09-06 00:57:05');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('236eeb04-4803-4bf4-85ed-db432c7d5f5f', '440a3145-9a10-4b5b-866c-c31477550d6e', 'p6', 'Tata Salt (1kg)', '8901234567895', 1, 28, 0, 5, 29.4, '2026-08-08 01:08:24');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('2939bc6e-5b6b-4cc8-b862-be6ee4cd3a82', 'f4bc4716-add4-43bf-8843-6e18e59e3f67', 'p-dm-50', '🍫 Dairy Milk (₹50)', NULL, 1, 50, 0, 18, 50, '2026-08-08 01:09:27');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('334d429f-cfaf-4f50-9216-363a5e1fc520', 'f78011ec-8d7d-4e34-80ae-3b986dbd5a99', 'p6', 'Tata Salt (1kg)', '8901234567895', 1, 28, 0, 5, 29.4, '2026-07-29 13:05:10');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('33eb5bc3-ef33-410a-b41a-44decb226893', '9d11fa21-9e91-48c8-8d1f-336c06568f86', 'p7', 'Good Day Cookies', '8901234567896', 1, 20, 0, 5, 21, '2026-08-02 11:20:57');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('3c5e1fd6-aee3-40f7-bdb0-1f586e2cccfa', '49d8f755-81d3-4576-8166-27549eb4ec0d', 'p-pn-100', '🧀 Paneer (100g)', NULL, 1, 40, 0, 18, 40, '2026-07-29 13:06:11');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('4193149b-9aeb-4c01-8564-c48c99987fc7', 'fb6d561b-84f9-4f2c-a87a-ada827d6ced9', 'p-dm-20', '🍫 Dairy Milk (₹20)', NULL, 1, 20, 0, 18, 20, '2026-08-08 01:06:58');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('41b92c25-fe69-4b8f-91f1-6519d5ac095b', 'bf429037-cb30-4d20-9bd4-98fa8ef80d8c', 'p-dm-5', '🍫 Dairy Milk (₹5)', NULL, 1, 5, 0, 18, 5, '2026-08-02 11:17:53');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('45822c87-64a8-49ca-b348-5872a1876e50', '440a3145-9a10-4b5b-866c-c31477550d6e', 'p7', 'Good Day Cookies', '8901234567896', 1, 20, 0, 5, 21, '2026-08-08 01:08:24');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('48dad6b8-bd92-461c-8f7c-bc5b5f6673fb', '65d8b20d-3cab-4590-84ee-c193b88aff54', 'p3', 'Premium Sugar (1kg)', '8901234567892', 1, 45, 0, 5, 47.25, '2026-08-23 10:33:26');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('4cbf08be-9eba-47ef-9fcf-c42e71b1bac9', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'p6', 'Tata Salt (1kg)', '8901234567895', 1, 28, 0, 5, 29.4, '2026-09-06 00:57:30');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('567fadac-bfb0-496b-ab1a-3fa6b2a291d3', 'f4bc4716-add4-43bf-8843-6e18e59e3f67', 'p-pn-500', '🧀 Paneer (500g)', NULL, 1, 200, 0, 18, 200, '2026-08-08 01:09:27');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('6b5cd24b-462e-45a3-b0d6-33a581721cb6', '440a3145-9a10-4b5b-866c-c31477550d6e', 'p1', 'Amul Milk (1L)', '8901234567890', 1, 60, 0, 5, 63, '2026-08-08 01:08:24');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('70f1f843-da76-4642-8b43-83ac63dab956', 'f4bc4716-add4-43bf-8843-6e18e59e3f67', 'p-dm-5', '🍫 Dairy Milk (₹5)', NULL, 1, 5, 0, 18, 5, '2026-08-08 01:09:27');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('87352c9f-e708-42cb-b433-16b76c887b9d', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'p2', 'Taj Mahal Tea (250g)', '8901234567891', 1, 120, 0, 5, 126, '2026-09-06 00:57:30');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('92787c19-e3b4-4771-8af6-d6d1147250e0', 'bf429037-cb30-4d20-9bd4-98fa8ef80d8c', 'p-pn-100', '🧀 Paneer (100g)', NULL, 1, 40, 0, 18, 40, '2026-08-02 11:17:53');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('94d35de9-16f1-4cab-bb49-a7450851f3cb', 'fb6d561b-84f9-4f2c-a87a-ada827d6ced9', 'p-dm-5', '🍫 Dairy Milk (₹5)', NULL, 1, 5, 0, 18, 5, '2026-08-08 01:06:58');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('9714c3ec-dcb0-4f50-a9b3-c4c73ba0734c', '65d8b20d-3cab-4590-84ee-c193b88aff54', 'p6', 'Tata Salt (1kg)', '8901234567895', 1, 28, 0, 5, 29.4, '2026-08-23 10:33:26');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('98fa6210-e479-4e3e-93a5-2d66f313c083', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'p2', 'Taj Mahal Tea (250g)', '8901234567891', 1, 120, 0, 5, 126, '2026-09-06 00:57:05');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('9a2f9b62-6111-4932-8e6b-9016cf630402', 'fb6d561b-84f9-4f2c-a87a-ada827d6ced9', 'p-pn-250', '🧀 Paneer (250g)', NULL, 1, 100, 0, 18, 100, '2026-08-08 01:06:58');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('9bb29627-dfbf-47db-9a0a-74350478a781', 'ab5e4b57-b058-415a-827f-bf63f8dcf1b7', 'p1-1L', '🥛 Amul Milk (1L)', NULL, 1, 60, 0, 18, 60, '2026-07-31 23:38:59');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('a42a6999-e047-43a8-abfe-d9b28d041583', '65d8b20d-3cab-4590-84ee-c193b88aff54', 'p7', 'Good Day Cookies', '8901234567896', 1, 20, 0, 5, 21, '2026-08-23 10:33:26');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('d4a752f2-8917-468f-8bcd-7efe82ad699b', '49d8f755-81d3-4576-8166-27549eb4ec0d', 'p-dm-5', '🍫 Dairy Milk (₹5)', NULL, 1, 5, 0, 18, 5, '2026-07-29 13:06:11');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('e5fb9aed-ea64-4ee3-8843-0a8aee96b3be', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'p1', 'Amul Milk (1L)', '8901234567890', 1, 60, 0, 5, 63, '2026-09-06 00:57:05');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('eb11019a-efca-46b9-bba8-4551f7b34167', 'fb6d561b-84f9-4f2c-a87a-ada827d6ced9', 'p-dm-10', '🍫 Dairy Milk (₹10)', NULL, 1, 10, 0, 18, 10, '2026-08-08 01:06:58');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `barcode`, `quantity`, `unit_price`, `discount`, `gst`, `total`, `created_at`) VALUES ('f94fe197-ac01-4e64-9e37-176c9ff3f45a', 'f78011ec-8d7d-4e34-80ae-3b986dbd5a99', 'p7', 'Good Day Cookies', '8901234567896', 1, 20, 0, 5, 21, '2026-07-29 13:05:10');

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `customer_id` varchar(50) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `subtotal` double NOT NULL,
  `discount` double NOT NULL,
  `gst_amount` double NOT NULL,
  `taxable_amount` double NOT NULL,
  `round_off` double NOT NULL,
  `grand_total` double NOT NULL,
  `payment_status` varchar(50) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `order_status` varchar(50) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `pwa_customer_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_business_id_invoice_number_key` (`business_id`,`invoice_number`),
  KEY `orders_customer_id_idx` (`customer_id`),
  KEY `orders_created_at_idx` (`created_at`),
  KEY `orders_pwa_customer_id_fkey` (`pwa_customer_id`),
  CONSTRAINT `orders_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_pwa_customer_id_fkey` FOREIGN KEY (`pwa_customer_id`) REFERENCES `pwa_customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'fresh-choice', 'INV-110', NULL, NULL, 273, 0, 13.65, 273, 0.35000000000002274, 287, 'Paid', 'Cash', 'Completed', NULL, '2026-09-06 00:57:05', '2026-09-06 00:57:05', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('440a3145-9a10-4b5b-866c-c31477550d6e', 'fresh-choice', 'INV-107', NULL, NULL, 108, 0, 5.4, 108, -0.4000000000000057, 113, 'Paid', 'Cash', 'Completed', NULL, '2026-08-08 01:08:24', '2026-08-08 01:08:24', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('49d8f755-81d3-4576-8166-27549eb4ec0d', 'fresh-choice', 'INV-103', NULL, NULL, 38.13559322033898, 0, 6.864406779661017, 38.13559322033898, 0, 45, 'Paid', 'Cash', 'Completed', 'Generated via Instant Checkout Engine.', '2026-07-29 13:06:11', '2026-07-29 13:06:11', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('65d8b20d-3cab-4590-84ee-c193b88aff54', 'fresh-choice', 'INV-109', NULL, NULL, 93, 0, 4.65, 93, 0.3499999999999943, 98, 'Paid', 'Cash', 'Completed', NULL, '2026-08-23 10:33:26', '2026-08-23 10:33:26', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('9d11fa21-9e91-48c8-8d1f-336c06568f86', 'fresh-choice', 'INV-105', NULL, NULL, 168, 0, 8.4, 168, -0.4000000000000057, 176, 'Paid', 'Cash', 'Completed', NULL, '2026-08-02 11:20:57', '2026-08-02 11:20:57', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('ab5e4b57-b058-415a-827f-bf63f8dcf1b7', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'INV-1001', NULL, NULL, 50.847457627118644, 0, 9.152542372881356, 50.847457627118644, 0, 60, 'Paid', 'Cash', 'Completed', 'Generated via Instant Checkout Engine.', '2026-07-31 23:38:59', '2026-07-31 23:38:59', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('bf429037-cb30-4d20-9bd4-98fa8ef80d8c', 'fresh-choice', 'INV-104', NULL, NULL, 38.13559322033898, 0, 6.864406779661017, 38.13559322033898, 0, 45, 'Paid', 'Cash', 'Completed', 'Generated via Instant Checkout Engine.', '2026-08-02 11:17:53', '2026-08-02 11:17:53', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'fresh-choice', 'INV-111', NULL, NULL, 213, 0, 10.65, 213, 0.3499999999999943, 224, 'Paid', 'Cash', 'Completed', NULL, '2026-09-06 00:57:30', '2026-09-06 00:57:30', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('d60db32e-ee45-43d5-af5d-bfe6256aacc4', 'fresh-choice', 'INV-101', NULL, NULL, 38.13559322033898, 0, 6.864406779661017, 38.13559322033898, 0, 45, 'Paid', 'Cash', 'Completed', 'Generated via Instant Checkout Engine.', '2026-07-29 13:03:10', '2026-07-29 13:03:10', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('f4bc4716-add4-43bf-8843-6e18e59e3f67', 'fresh-choice', 'INV-108', NULL, NULL, 216.10169491525426, 0, 38.89830508474574, 216.10169491525426, 0, 255, 'Paid', 'Cash', 'Completed', 'Generated via Instant Checkout Engine.', '2026-08-08 01:09:27', '2026-08-08 01:09:27', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('f78011ec-8d7d-4e34-80ae-3b986dbd5a99', 'fresh-choice', 'INV-102', NULL, NULL, 48, 0, 2.4000000000000004, 48, -0.3999999999999986, 50, 'Paid', 'Cash', 'Completed', NULL, '2026-07-29 13:05:10', '2026-07-29 13:05:10', NULL, NULL);
INSERT INTO `orders` (`id`, `business_id`, `invoice_number`, `customer_id`, `employee_id`, `subtotal`, `discount`, `gst_amount`, `taxable_amount`, `round_off`, `grand_total`, `payment_status`, `payment_method`, `order_status`, `notes`, `created_at`, `updated_at`, `deleted_at`, `pwa_customer_id`) VALUES ('fb6d561b-84f9-4f2c-a87a-ada827d6ced9', 'fresh-choice', 'INV-106', NULL, NULL, 114.40677966101696, 0, 20.593220338983045, 114.40677966101696, 0, 135, 'Paid', 'Cash', 'Completed', 'Generated via Instant Checkout Engine.', '2026-08-08 01:06:58', '2026-08-08 01:06:58', NULL, NULL);

DROP TABLE IF EXISTS `otps`;
CREATE TABLE `otps` (
  `id` varchar(50) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `code` varchar(10) NOT NULL,
  `type` varchar(20) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `otps_phone_idx` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_links`;
CREATE TABLE `payment_links` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `amount` double NOT NULL,
  `link_type` varchar(30) NOT NULL,
  `url` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `payment_links_business_id_idx` (`business_id`),
  KEY `payment_links_customer_id_idx` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_logs`;
CREATE TABLE `payment_logs` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `transaction_id` varchar(50) DEFAULT NULL,
  `level` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `payment_logs_business_id_idx` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_orders`;
CREATE TABLE `payment_orders` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `amount` double NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `gateway_order_id` varchar(100) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_orders_business_id_idx` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_preferences`;
CREATE TABLE `payment_preferences` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `default_payment` varchar(50) NOT NULL DEFAULT 'Mixed',
  `enable_sounds` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_preferences_business_id_key` (`business_id`),
  CONSTRAINT `payment_preferences_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_reconciliation`;
CREATE TABLE `payment_reconciliation` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `transaction_id` varchar(50) NOT NULL,
  `matched` tinyint(1) NOT NULL DEFAULT 0,
  `difference` double NOT NULL DEFAULT 0,
  `reconciliation_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `payment_reconciliation_business_id_idx` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_refunds`;
CREATE TABLE `payment_refunds` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `transaction_id` varchar(50) NOT NULL,
  `refund_id` varchar(100) NOT NULL,
  `amount` double NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `payment_refunds_business_id_idx` (`business_id`),
  KEY `payment_refunds_transaction_id_idx` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `customer_id` varchar(50) DEFAULT NULL,
  `supplier_id` varchar(50) DEFAULT NULL,
  `invoice_id` varchar(50) DEFAULT NULL,
  `purchase_id` varchar(50) DEFAULT NULL,
  `subscription_id` varchar(50) DEFAULT NULL,
  `gateway` varchar(50) NOT NULL,
  `gateway_order_id` varchar(100) DEFAULT NULL,
  `gateway_payment_id` varchar(100) DEFAULT NULL,
  `gateway_signature` varchar(255) DEFAULT NULL,
  `amount` double NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `status` varchar(20) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_transactions_business_id_idx` (`business_id`),
  KEY `payment_transactions_customer_id_idx` (`customer_id`),
  KEY `payment_transactions_invoice_id_idx` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_webhooks`;
CREATE TABLE `payment_webhooks` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `event_id` varchar(100) NOT NULL,
  `gateway` varchar(50) NOT NULL,
  `payload` text NOT NULL,
  `processed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_webhooks_event_id_key` (`event_id`),
  KEY `payment_webhooks_business_id_idx` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` varchar(50) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `amount` double NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `payments_order_id_idx` (`order_id`),
  CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('031cc354-da28-487c-b9b2-10834499b814', '49d8f755-81d3-4576-8166-27549eb4ec0d', 'Cash', 45, 'IC-3e420aa5', 'Success', '2026-07-29 13:06:11');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('06e76f32-462c-425a-bc6e-82f3d00c5234', 'ab5e4b57-b058-415a-827f-bf63f8dcf1b7', 'Cash', 60, 'IC-553896d4', 'Success', '2026-07-31 23:38:59');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('14248979-f4ab-41ed-bebd-bb9486a16330', 'f4bc4716-add4-43bf-8843-6e18e59e3f67', 'Cash', 255, 'IC-46de1eee', 'Success', '2026-08-08 01:09:27');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('1973b034-d92c-4b2d-9579-16243e0451e6', 'd60db32e-ee45-43d5-af5d-bfe6256aacc4', 'Cash', 45, 'IC-b694d43b', 'Success', '2026-07-29 13:03:10');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('26d352d5-26cf-44e9-b82e-bc3d9ac69766', 'bf429037-cb30-4d20-9bd4-98fa8ef80d8c', 'Cash', 45, 'IC-7df0c928', 'Success', '2026-08-02 11:17:53');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('9298be48-7926-4c24-8ca5-63c4e62d4b19', 'f78011ec-8d7d-4e34-80ae-3b986dbd5a99', 'Cash', 50, NULL, 'Success', '2026-07-29 13:05:10');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('9dd8e373-a27c-4110-83dd-75d459829186', '9d11fa21-9e91-48c8-8d1f-336c06568f86', 'Cash', 176, NULL, 'Success', '2026-08-02 11:20:57');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('a54f09da-9e4b-4f90-96e3-dd04bb8a4c14', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'Cash', 287, NULL, 'Success', '2026-09-06 00:57:05');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('bbb8fd2f-2bad-4947-91ad-a1559996fcb3', '65d8b20d-3cab-4590-84ee-c193b88aff54', 'Cash', 98, NULL, 'Success', '2026-08-23 10:33:26');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('cbb494ac-f935-4bd1-861f-3885f799c660', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'Cash', 224, NULL, 'Success', '2026-09-06 00:57:30');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('ea4afe9a-c664-437f-997f-77fb967871c3', '440a3145-9a10-4b5b-866c-c31477550d6e', 'Cash', 113, NULL, 'Success', '2026-08-08 01:08:24');
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `reference_number`, `status`, `created_at`) VALUES ('f97e31a5-2a87-4275-839e-5a1e2edafd48', 'fb6d561b-84f9-4f2c-a87a-ada827d6ced9', 'Cash', 135, 'IC-ec4d662f', 'Success', '2026-08-08 01:06:58');

DROP TABLE IF EXISTS `peak_hour_templates`;
CREATE TABLE `peak_hour_templates` (
  `id` varchar(50) NOT NULL,
  `business_type` varchar(100) NOT NULL,
  `start_hour` int(11) NOT NULL,
  `end_hour` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `peak_hour_templates_business_type_start_hour_end_hour_key` (`business_type`,`start_hour`,`end_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `peak_hours`;
CREATE TABLE `peak_hours` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `hour` int(11) NOT NULL,
  `order_count` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `peak_hours_business_id_hour_key` (`business_id`,`hour`),
  CONSTRAINT `peak_hours_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `peak_hours` (`id`, `business_id`, `hour`, `order_count`, `updated_at`) VALUES ('565cf61f-aef5-48a3-aa6e-42f555e130f4', 'fresh-choice', 0, 2, '2026-07-29 13:06:11');
INSERT INTO `peak_hours` (`id`, `business_id`, `hour`, `order_count`, `updated_at`) VALUES ('6de8b28d-1f64-4a97-beb4-5ec08e3f7bb1', 'fresh-choice', 12, 2, '2026-08-08 01:09:27');
INSERT INTO `peak_hours` (`id`, `business_id`, `hour`, `order_count`, `updated_at`) VALUES ('b0ea3aa2-5180-47d1-8974-214dbb545176', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 10, 1, '2026-07-31 23:38:59');
INSERT INTO `peak_hours` (`id`, `business_id`, `hour`, `order_count`, `updated_at`) VALUES ('e320b91a-9830-44a6-b5f0-c558d6b8c207', 'fresh-choice', 22, 1, '2026-08-02 11:17:53');

DROP TABLE IF EXISTS `peak_sales_hours`;
CREATE TABLE `peak_sales_hours` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `hour` int(11) NOT NULL,
  `sales_count` int(11) NOT NULL DEFAULT 0,
  `revenue` double NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `peak_sales_hours_business_id_hour_key` (`business_id`,`hour`),
  CONSTRAINT `peak_sales_hours_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pickup_order_items`;
CREATE TABLE `pickup_order_items` (
  `id` varchar(50) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` double NOT NULL,
  `line_total` double NOT NULL,
  `packing_status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `replacement_status` varchar(50) NOT NULL DEFAULT 'NONE',
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pickup_order_items_order_id_idx` (`order_id`),
  KEY `pickup_order_items_product_id_idx` (`product_id`),
  CONSTRAINT `pickup_order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `pickup_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pickup_order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pickup_order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`, `packing_status`, `replacement_status`, `remarks`) VALUES ('3954c140-dbae-4ec4-9806-47bd79c96a8f', '41372a49-a745-4158-be87-13a4a6c3e677', '83ba80ee-019b-47cf-84e0-1b2084a59972', 'Amul milk', 2, 60, 120, 'PACKED', 'NONE', NULL);
INSERT INTO `pickup_order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`, `packing_status`, `replacement_status`, `remarks`) VALUES ('71c072ab-f83b-40f7-9f32-52ea52ad1b26', '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'p3', 'Premium Sugar (1kg)', 1, 45, 45, 'PENDING', 'NONE', NULL);
INSERT INTO `pickup_order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`, `packing_status`, `replacement_status`, `remarks`) VALUES ('84a876c7-adf5-47d5-85ab-11b63523fb7b', '3b9550a0-3672-41bf-af20-a883986d1921', '83ba80ee-019b-47cf-84e0-1b2084a59972', 'Amul milk', 3, 60, 180, 'PENDING', 'NONE', NULL);
INSERT INTO `pickup_order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`, `packing_status`, `replacement_status`, `remarks`) VALUES ('b05b793a-1f6a-40dd-80bc-88ceffb9968f', '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'p2', 'Taj Mahal Tea (250g)', 1, 120, 120, 'PENDING', 'NONE', NULL);
INSERT INTO `pickup_order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`, `packing_status`, `replacement_status`, `remarks`) VALUES ('c77c3653-f076-4e7b-a6ef-2bd307ac1e65', '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'p4', 'Parle-G Biscuits (Pack of 10)', 1, 10, 10, 'PENDING', 'NONE', NULL);
INSERT INTO `pickup_order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`, `packing_status`, `replacement_status`, `remarks`) VALUES ('c93b184f-0749-4f72-ad84-7f375413e81f', '83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'p5', 'Amul Paneer (200g)', 3, 85, 255, 'PENDING', 'NONE', NULL);
INSERT INTO `pickup_order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`, `packing_status`, `replacement_status`, `remarks`) VALUES ('e46b10d3-80e8-4adc-9dbb-b8a8c384c36f', 'a517fb60-30fa-4755-9142-9f036b9d964d', '83ba80ee-019b-47cf-84e0-1b2084a59972', 'Amul milk', 1, 60, 60, 'PENDING', 'NONE', NULL);
INSERT INTO `pickup_order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`, `packing_status`, `replacement_status`, `remarks`) VALUES ('e4b64f51-d1e2-4068-8f8b-210f3cc44cc1', 'b143de14-0f7c-4148-a7bc-c41532c95506', '83ba80ee-019b-47cf-84e0-1b2084a59972', 'Amul milk', 1, 60, 60, 'PENDING', 'NONE', NULL);

DROP TABLE IF EXISTS `pickup_orders`;
CREATE TABLE `pickup_orders` (
  `id` varchar(50) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `pickup_pin` varchar(100) NOT NULL,
  `order_status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `payment_method` varchar(50) NOT NULL DEFAULT 'UPI',
  `payment_status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `scheduled_pickup_time` datetime(3) NOT NULL,
  `order_notes` varchar(255) DEFAULT NULL,
  `total_amount` double NOT NULL,
  `total_items` int(11) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pickup_orders_order_number_key` (`order_number`),
  KEY `pickup_orders_business_id_idx` (`business_id`),
  KEY `pickup_orders_customer_id_idx` (`customer_id`),
  KEY `pickup_orders_order_number_idx` (`order_number`),
  CONSTRAINT `pickup_orders_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pickup_orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pickup_orders` (`id`, `order_number`, `business_id`, `customer_id`, `pickup_pin`, `order_status`, `payment_method`, `payment_status`, `scheduled_pickup_time`, `order_notes`, `total_amount`, `total_items`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES ('3b9550a0-3672-41bf-af20-a883986d1921', 'PKUP-1786171513166', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '7c2448be-60ae-4c73-9ccf-65272bb4191a', '9165', 'COLLECTED', 'COD', 'Paid', '2026-08-08 01:45:13', 'Customer self pickup', 180, 3, 'Rishabh Dubey', NULL, '2026-08-08 01:15:13', '2026-08-08 01:16:10');
INSERT INTO `pickup_orders` (`id`, `order_number`, `business_id`, `customer_id`, `pickup_pin`, `order_status`, `payment_method`, `payment_status`, `scheduled_pickup_time`, `order_notes`, `total_amount`, `total_items`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES ('41372a49-a745-4158-be87-13a4a6c3e677', 'PKUP-1785351096182', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'ffe4e334-cc0c-4d78-ba0a-015159d67ca6', '4512', 'COLLECTED', 'COD', 'Paid', '2026-07-29 13:51:36', 'Customer self pickup', 120, 2, 'Rishi Dubey', NULL, '2026-07-29 13:21:36', '2026-07-29 13:28:06');
INSERT INTO `pickup_orders` (`id`, `order_number`, `business_id`, `customer_id`, `pickup_pin`, `order_status`, `payment_method`, `payment_status`, `scheduled_pickup_time`, `order_notes`, `total_amount`, `total_items`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES ('83cf9839-03e6-4b70-b6f1-93ae8a2ea563', 'PKUP-1785158455070', 'fresh-choice', 'acc6b1af-731b-4959-9ed5-44ba7b94ef00', '7889', 'COLLECTED', 'COD', 'Paid', '2026-07-27 08:20:54', 'Customer self pickup', 430, 6, 'Rishabh Dubey', NULL, '2026-07-27 07:50:55', '2026-09-06 00:40:46');
INSERT INTO `pickup_orders` (`id`, `order_number`, `business_id`, `customer_id`, `pickup_pin`, `order_status`, `payment_method`, `payment_status`, `scheduled_pickup_time`, `order_notes`, `total_amount`, `total_items`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES ('a517fb60-30fa-4755-9142-9f036b9d964d', 'PKUP-1785690532868', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '7c2448be-60ae-4c73-9ccf-65272bb4191a', '2886', 'PENDING', 'COD', 'PENDING', '2026-08-02 12:08:52', 'Customer self pickup', 60, 1, 'Rishabh Dubey', NULL, '2026-08-02 11:38:52', '2026-08-02 11:38:52');
INSERT INTO `pickup_orders` (`id`, `order_number`, `business_id`, `customer_id`, `pickup_pin`, `order_status`, `payment_method`, `payment_status`, `scheduled_pickup_time`, `order_notes`, `total_amount`, `total_items`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES ('b143de14-0f7c-4148-a7bc-c41532c95506', 'PKUP-1785560764415', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '7c2448be-60ae-4c73-9ccf-65272bb4191a', '9206', 'COLLECTED', 'COD', 'Paid', '2026-08-01 00:06:04', 'Customer self pickup', 60, 1, 'Rishabh Dubey', NULL, '2026-07-31 23:36:04', '2026-07-31 23:36:24');

DROP TABLE IF EXISTS `product_attributes`;
CREATE TABLE `product_attributes` (
  `id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `key` varchar(50) NOT NULL,
  `value` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_attributes_product_id_idx` (`product_id`),
  KEY `product_attributes_key_idx` (`key`),
  CONSTRAINT `product_attributes_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `parent_id` varchar(50) DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_categories_business_id_name_key` (`business_id`,`name`),
  KEY `product_categories_parent_id_fkey` (`parent_id`),
  CONSTRAINT `product_categories_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `product_categories` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `url` varchar(500) NOT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_fkey` (`product_id`),
  CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `product_templates`;
CREATE TABLE `product_templates` (
  `id` varchar(50) NOT NULL,
  `business_type` varchar(100) NOT NULL,
  `fields` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_templates_business_type_key` (`business_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `product_templates` (`id`, `business_type`, `fields`, `created_at`) VALUES ('b8a4c1c2-aa4d-4346-a036-67bbd702b294', 'Grocery Store', '[]', '2026-07-27 07:45:03');

DROP TABLE IF EXISTS `product_units`;
CREATE TABLE `product_units` (
  `id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_type` varchar(50) NOT NULL DEFAULT 'FixedQuantity',
  `default_unit` varchar(20) NOT NULL DEFAULT 'pcs',
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_units_product_id_key` (`product_id`),
  CONSTRAINT `product_units_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `price` double NOT NULL,
  `cost_price` double NOT NULL,
  `stock` int(11) NOT NULL,
  `min_stock` int(11) NOT NULL,
  `supplier_name` varchar(100) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `custom_fields` text DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `sub_category` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `unit_type` varchar(50) DEFAULT NULL,
  `tax` double NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `keywords` varchar(500) DEFAULT NULL,
  `product_status` varchar(50) NOT NULL DEFAULT 'Active',
  `category_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_barcode_key` (`barcode`),
  UNIQUE KEY `products_sku_key` (`sku`),
  KEY `products_business_id_idx` (`business_id`),
  KEY `products_category_id_fkey` (`category_id`),
  CONSTRAINT `products_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`id`, `business_id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock`, `supplier_name`, `barcode`, `custom_fields`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`, `sku`, `sub_category`, `brand`, `unit`, `unit_type`, `tax`, `description`, `keywords`, `product_status`, `category_id`) VALUES ('83ba80ee-019b-47cf-84e0-1b2084a59972', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'Amul milk', 'General', 60, 48, 38, 5, 'General Supplier', NULL, NULL, 0, NULL, '2026-07-27 09:03:42', '2026-08-08 01:15:13', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'Active', NULL);
INSERT INTO `products` (`id`, `business_id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock`, `supplier_name`, `barcode`, `custom_fields`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`, `sku`, `sub_category`, `brand`, `unit`, `unit_type`, `tax`, `description`, `keywords`, `product_status`, `category_id`) VALUES ('p1', 'fresh-choice', 'Amul Milk (1L)', 'Dairy', 60, 52, 6, 15, 'Amul Milk Dairy', '8901234567890', NULL, 0, NULL, '2026-07-27 07:41:42', '2026-09-06 00:57:05', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'Active', NULL);
INSERT INTO `products` (`id`, `business_id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock`, `supplier_name`, `barcode`, `custom_fields`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`, `sku`, `sub_category`, `brand`, `unit`, `unit_type`, `tax`, `description`, `keywords`, `product_status`, `category_id`) VALUES ('p2', 'fresh-choice', 'Taj Mahal Tea (250g)', 'Groceries', 120, 98, 18, 10, 'Kirana Wholesale', '8901234567891', NULL, 0, NULL, '2026-07-27 07:41:42', '2026-09-06 00:57:30', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'Active', NULL);
INSERT INTO `products` (`id`, `business_id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock`, `supplier_name`, `barcode`, `custom_fields`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`, `sku`, `sub_category`, `brand`, `unit`, `unit_type`, `tax`, `description`, `keywords`, `product_status`, `category_id`) VALUES ('p3', 'fresh-choice', 'Premium Sugar (1kg)', 'Groceries', 45, 38, 9, 12, 'Kirana Wholesale', '8901234567892', NULL, 0, NULL, '2026-07-27 07:41:42', '2026-09-06 00:57:30', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'Active', NULL);
INSERT INTO `products` (`id`, `business_id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock`, `supplier_name`, `barcode`, `custom_fields`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`, `sku`, `sub_category`, `brand`, `unit`, `unit_type`, `tax`, `description`, `keywords`, `product_status`, `category_id`) VALUES ('p4', 'fresh-choice', 'Parle-G Biscuits (Pack of 10)', 'Snacks', 10, 8, 51, 15, 'Kirana Wholesale', '8901234567893', NULL, 0, NULL, '2026-07-27 07:41:42', '2026-07-27 07:50:55', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'Active', NULL);
INSERT INTO `products` (`id`, `business_id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock`, `supplier_name`, `barcode`, `custom_fields`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`, `sku`, `sub_category`, `brand`, `unit`, `unit_type`, `tax`, `description`, `keywords`, `product_status`, `category_id`) VALUES ('p5', 'fresh-choice', 'Amul Paneer (200g)', 'Dairy', 85, 70, 0, 8, 'Amul Milk Dairy', '8901234567894', NULL, 0, NULL, '2026-07-27 07:41:42', '2026-07-27 07:50:55', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'Active', NULL);
INSERT INTO `products` (`id`, `business_id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock`, `supplier_name`, `barcode`, `custom_fields`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`, `sku`, `sub_category`, `brand`, `unit`, `unit_type`, `tax`, `description`, `keywords`, `product_status`, `category_id`) VALUES ('p6', 'fresh-choice', 'Tata Salt (1kg)', 'Groceries', 28, 22, 9, 10, 'Kirana Wholesale', '8901234567895', NULL, 0, NULL, '2026-07-27 07:41:42', '2026-09-06 00:57:30', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'Active', NULL);
INSERT INTO `products` (`id`, `business_id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock`, `supplier_name`, `barcode`, `custom_fields`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`, `sku`, `sub_category`, `brand`, `unit`, `unit_type`, `tax`, `description`, `keywords`, `product_status`, `category_id`) VALUES ('p7', 'fresh-choice', 'Good Day Cookies', 'Snacks', 20, 16, 12, 12, 'Kirana Wholesale', '8901234567896', NULL, 0, NULL, '2026-07-27 07:41:42', '2026-09-17 00:56:59', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'Active', NULL);

DROP TABLE IF EXISTS `purchase_items`;
CREATE TABLE `purchase_items` (
  `id` varchar(50) NOT NULL,
  `purchase_order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `ordered_quantity` int(11) NOT NULL,
  `received_quantity` int(11) NOT NULL DEFAULT 0,
  `remaining_quantity` int(11) NOT NULL,
  `purchase_price` double NOT NULL,
  `gst` double NOT NULL DEFAULT 0,
  `discount` double NOT NULL DEFAULT 0,
  `batch_number` varchar(50) DEFAULT NULL,
  `expiry_date` datetime(3) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `purchase_items_purchase_order_id_idx` (`purchase_order_id`),
  KEY `purchase_items_product_id_idx` (`product_id`),
  CONSTRAINT `purchase_items_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE `purchase_orders` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `po_number` varchar(50) NOT NULL,
  `supplier_id` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Draft',
  `order_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expected_delivery` datetime(3) DEFAULT NULL,
  `subtotal` double NOT NULL,
  `discount` double NOT NULL,
  `gst` double NOT NULL,
  `transport_cost` double NOT NULL DEFAULT 0,
  `grand_total` double NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `approved_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_orders_business_id_po_number_key` (`business_id`,`po_number`),
  KEY `purchase_orders_supplier_id_idx` (`supplier_id`),
  CONSTRAINT `purchase_orders_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `purchase_payments`;
CREATE TABLE `purchase_payments` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `purchase_order_id` varchar(50) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `amount` double NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `paid_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `purchase_payments_purchase_order_id_idx` (`purchase_order_id`),
  KEY `purchase_payments_business_id_fkey` (`business_id`),
  CONSTRAINT `purchase_payments_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_payments_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `purchase_returns`;
CREATE TABLE `purchase_returns` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `purchase_order_id` varchar(50) NOT NULL,
  `return_number` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `return_qty` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `returned_by` varchar(100) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_returns_business_id_return_number_key` (`business_id`,`return_number`),
  KEY `purchase_returns_purchase_order_id_idx` (`purchase_order_id`),
  KEY `purchase_returns_product_id_idx` (`product_id`),
  CONSTRAINT `purchase_returns_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_returns_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pwa_customer_addresses`;
CREATE TABLE `pwa_customer_addresses` (
  `id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `address_type` varchar(50) NOT NULL,
  `address_line_1` varchar(255) NOT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `landmark` varchar(150) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(20) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pwa_customer_addresses_customer_id_idx` (`customer_id`),
  CONSTRAINT `pwa_customer_addresses_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pwa_customer_trust_scores`;
CREATE TABLE `pwa_customer_trust_scores` (
  `id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `score` int(11) NOT NULL DEFAULT 100,
  `active_orders_count` int(11) NOT NULL DEFAULT 0,
  `restricted_status` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pwa_customer_trust_scores_customer_id_key` (`customer_id`),
  CONSTRAINT `pwa_customer_trust_scores_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pwa_customer_trust_scores` (`id`, `customer_id`, `score`, `active_orders_count`, `restricted_status`, `updated_at`) VALUES ('65d9d523-c06b-4d0b-9aa8-f9907ae4ed9f', 'ffe4e334-cc0c-4d78-ba0a-015159d67ca6', 100, 0, 0, '2026-07-29 13:28:06');
INSERT INTO `pwa_customer_trust_scores` (`id`, `customer_id`, `score`, `active_orders_count`, `restricted_status`, `updated_at`) VALUES ('83fa46a9-0a69-4087-a87f-aabb9979f5f8', 'acc6b1af-731b-4959-9ed5-44ba7b94ef00', 100, 0, 0, '2026-09-06 00:40:46');
INSERT INTO `pwa_customer_trust_scores` (`id`, `customer_id`, `score`, `active_orders_count`, `restricted_status`, `updated_at`) VALUES ('ca954593-f297-48a4-9403-c2876ceac331', '7c2448be-60ae-4c73-9ccf-65272bb4191a', 100, 1, 0, '2026-08-08 01:16:10');
INSERT INTO `pwa_customer_trust_scores` (`id`, `customer_id`, `score`, `active_orders_count`, `restricted_status`, `updated_at`) VALUES ('e152a076-87b4-4dad-a7c3-7e32e85dd05e', '8bbe9b43-a7af-4f07-91ac-e4e0e4721351', 100, 0, 0, '2026-07-27 07:53:58');

DROP TABLE IF EXISTS `pwa_customers`;
CREATE TABLE `pwa_customers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `dob` datetime(3) DEFAULT NULL,
  `preferred_language` varchar(10) NOT NULL DEFAULT 'en',
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pwa_customers_phone_key` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pwa_customers` (`id`, `name`, `phone`, `email`, `password_hash`, `profile_photo`, `dob`, `preferred_language`, `status`, `is_deleted`, `created_at`, `updated_at`) VALUES ('7c2448be-60ae-4c73-9ccf-65272bb4191a', 'Rishabh Dubey', '+916388248689', 'dubeyrishabh63288@gmail.com', '$2b$10$cUI/2bQMC/zUFpfyQUSazeTRxt/y8xZRzykeNDU9TbzePtcfx5k9q', NULL, NULL, 'en', 'Active', 0, '2026-07-27 07:46:04', '2026-07-27 07:46:04');
INSERT INTO `pwa_customers` (`id`, `name`, `phone`, `email`, `password_hash`, `profile_photo`, `dob`, `preferred_language`, `status`, `is_deleted`, `created_at`, `updated_at`) VALUES ('8bbe9b43-a7af-4f07-91ac-e4e0e4721351', 'Owner Customer', '+919999999999', 'owner@quickbizs.com', '$2b$10$z8Yt6IX0VDAlrCNQfkFFI.QEzB.lSQKCC48w2Hqz5Ikbdgm3J2gZ.', NULL, NULL, 'en', 'Active', 0, '2026-07-27 07:53:58', '2026-07-27 07:53:58');
INSERT INTO `pwa_customers` (`id`, `name`, `phone`, `email`, `password_hash`, `profile_photo`, `dob`, `preferred_language`, `status`, `is_deleted`, `created_at`, `updated_at`) VALUES ('acc6b1af-731b-4959-9ed5-44ba7b94ef00', 'Rishabh Dubey', '+916388248699', 'dubeyrishabh632388@gmail.com', '$2b$10$8bdlUPVE63IIIFRQ9hFbIewQDak5GHKoqsYiqKXGVBqHKWzzeWBHu', NULL, NULL, 'en', 'Active', 0, '2026-07-27 07:50:41', '2026-07-27 07:50:41');
INSERT INTO `pwa_customers` (`id`, `name`, `phone`, `email`, `password_hash`, `profile_photo`, `dob`, `preferred_language`, `status`, `is_deleted`, `created_at`, `updated_at`) VALUES ('ffe4e334-cc0c-4d78-ba0a-015159d67ca6', 'Rishi Dubey', '+916388247789', 'rishikesh@gmail.com', '$2b$10$spVbCvMx9d88FWcB8MJLKu9P76rK0BKgAKeQgnqFXYbBZRadbYTMG', NULL, NULL, 'en', 'Active', 0, '2026-07-29 13:12:28', '2026-07-29 13:12:28');

DROP TABLE IF EXISTS `pwa_favourite_shops`;
CREATE TABLE `pwa_favourite_shops` (
  `id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `pwa_favourite_shops_customer_id_business_id_key` (`customer_id`,`business_id`),
  KEY `pwa_favourite_shops_business_id_fkey` (`business_id`),
  CONSTRAINT `pwa_favourite_shops_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pwa_favourite_shops_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `quantity_presets`;
CREATE TABLE `quantity_presets` (
  `id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `label` varchar(20) NOT NULL,
  `value` double NOT NULL,
  `sales_count` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quantity_presets_product_id_label_key` (`product_id`,`label`),
  CONSTRAINT `quantity_presets_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `queue_history`;
CREATE TABLE `queue_history` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `queue_id` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `total_amount` double NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `queue_history_business_id_fkey` (`business_id`),
  CONSTRAINT `queue_history_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `queue_history` (`id`, `business_id`, `queue_id`, `action`, `total_amount`, `created_at`) VALUES ('0c813596-5a80-45e3-95c5-84d095f8dd4e', 'fresh-choice', '87929aee-c0d5-4ac9-9920-4a60cf479f60', 'Cancelled', 535, '2026-09-17 00:56:41');
INSERT INTO `queue_history` (`id`, `business_id`, `queue_id`, `action`, `total_amount`, `created_at`) VALUES ('4997ddbe-7627-42cf-81c8-6d596bd05b61', 'fresh-choice', '83d90bee-9470-461f-bcf7-19ea33f75e03', 'Completed', 255, '2026-08-08 01:09:27');
INSERT INTO `queue_history` (`id`, `business_id`, `queue_id`, `action`, `total_amount`, `created_at`) VALUES ('742da99d-ffa7-4129-8cb7-722a6cb24f02', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'ba0d81da-41e8-4be6-a10a-b7210641bbd4', 'Completed', 60, '2026-07-31 23:38:59');
INSERT INTO `queue_history` (`id`, `business_id`, `queue_id`, `action`, `total_amount`, `created_at`) VALUES ('7abd6f5c-5f08-409b-b543-eb77358e0936', 'fresh-choice', '9deef30a-2d28-4518-a08c-fc737f18b2cd', 'Completed', 45, '2026-08-02 11:17:53');
INSERT INTO `queue_history` (`id`, `business_id`, `queue_id`, `action`, `total_amount`, `created_at`) VALUES ('8fb559ea-b48a-4b6e-858b-d115b09129bb', 'fresh-choice', '688776f0-9ce2-4e30-84b0-f36972f96188', 'Completed', 45, '2026-07-29 13:06:11');
INSERT INTO `queue_history` (`id`, `business_id`, `queue_id`, `action`, `total_amount`, `created_at`) VALUES ('a0c21dd6-ac1e-4ddc-88be-6da72e992be1', 'fresh-choice', '6538187c-a06d-438b-9408-f3362e3bff7e', 'Completed', 45, '2026-07-29 13:03:10');
INSERT INTO `queue_history` (`id`, `business_id`, `queue_id`, `action`, `total_amount`, `created_at`) VALUES ('de6b8b7a-bcc2-4662-8f53-b41e982e28a2', 'fresh-choice', 'e298fe75-2576-426f-baec-f542dc2a0418', 'Completed', 135, '2026-08-08 01:06:58');

DROP TABLE IF EXISTS `queue_items`;
CREATE TABLE `queue_items` (
  `id` varchar(50) NOT NULL,
  `queue_session_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `queue_items_queue_session_id_fkey` (`queue_session_id`),
  CONSTRAINT `queue_items_queue_session_id_fkey` FOREIGN KEY (`queue_session_id`) REFERENCES `queue_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('0d906af9-aaba-47cd-90e9-ed3633d8744b', 'ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'p-dm-50', '🍫 Dairy Milk (₹50)', 1, 50);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('0e66340e-973a-4779-82f8-6c2649088588', '87929aee-c0d5-4ac9-9920-4a60cf479f60', 'p-pn-100', '🧀 Paneer (100g)', 1, 40);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('125d1254-eb88-421f-8984-1b4021d8f311', '87929aee-c0d5-4ac9-9920-4a60cf479f60', 'p-dm-50', '🍫 Dairy Milk (₹50)', 1, 50);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('46c5096e-37ad-45c4-88ae-b3c921e8e1b0', 'ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'p2', 'Taj Mahal Tea (250g)', 1, 120);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('67114102-5dd0-49b8-bc3f-1ad322d606c7', 'ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'p1', 'Amul Milk (1L)', 1, 60);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('67d2fa25-e88e-4161-b50a-b0383ff10c51', 'ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'p-dm-10', '🍫 Dairy Milk (₹10)', 1, 10);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('6b2ba9f5-886a-4210-a5ac-d04b5913db22', 'ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'p-pn-100', '🧀 Paneer (100g)', 1, 40);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('6bf3d6f2-5bf6-4a68-9128-d19b9f7d7851', '87929aee-c0d5-4ac9-9920-4a60cf479f60', 'p-pn-500', '🧀 Paneer (500g)', 1, 200);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('6bfe2df4-d647-46e4-bff3-1d8e9e97ad08', '87929aee-c0d5-4ac9-9920-4a60cf479f60', 'p-pn-250', '🧀 Paneer (250g)', 2, 100);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('6ee63a35-492b-4784-8ef5-9d02d1bc2282', 'ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'p-pn-250', '🧀 Paneer (250g)', 2, 100);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('9905d4fe-48bc-458b-a7ed-9abf42eb33a0', 'ba0d81da-41e8-4be6-a10a-b7210641bbd4', 'p1-1L', '🥛 Amul Milk (1L)', 1, 60);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('9ca6a768-2df7-4fba-b66e-c31b5dd7fb64', 'ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'p-pn-500', '🧀 Paneer (500g)', 1, 200);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('a9144a2e-c01b-44ff-bec2-8520afb7baf6', '87929aee-c0d5-4ac9-9920-4a60cf479f60', 'p-dm-5', '🍫 Dairy Milk (₹5)', 3, 5);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('d815f74f-507e-4d6c-a514-817d2fd4a063', 'ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'p-dm-20', '🍫 Dairy Milk (₹20)', 1, 20);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('e817b815-3fa0-4854-bfe5-3e46a2c1db55', '87929aee-c0d5-4ac9-9920-4a60cf479f60', 'p-dm-10', '🍫 Dairy Milk (₹10)', 1, 10);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('e8a87a0f-18d9-4c32-9a6e-0ca1eb7f9f35', 'ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'p-dm-5', '🍫 Dairy Milk (₹5)', 3, 5);
INSERT INTO `queue_items` (`id`, `queue_session_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES ('f8a14de6-cf45-41f4-8142-c6850e8027a6', '87929aee-c0d5-4ac9-9920-4a60cf479f60', 'p-dm-20', '🍫 Dairy Milk (₹20)', 1, 20);

DROP TABLE IF EXISTS `queue_preferences`;
CREATE TABLE `queue_preferences` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `auto_cleanup_min` int(11) NOT NULL DEFAULT 30,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `queue_preferences_business_id_key` (`business_id`),
  CONSTRAINT `queue_preferences_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `queue_sessions`;
CREATE TABLE `queue_sessions` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `queue_number` int(11) NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Waiting',
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `queue_sessions_business_id_fkey` (`business_id`),
  CONSTRAINT `queue_sessions_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `queue_sessions` (`id`, `business_id`, `queue_number`, `customer_name`, `mobile`, `status`, `is_pinned`, `created_at`, `updated_at`) VALUES ('87929aee-c0d5-4ac9-9920-4a60cf479f60', 'fresh-choice', 1, 'Queue #1', NULL, 'Cancelled', 0, '2026-08-23 10:33:37', '2026-09-17 00:56:41');
INSERT INTO `queue_sessions` (`id`, `business_id`, `queue_number`, `customer_name`, `mobile`, `status`, `is_pinned`, `created_at`, `updated_at`) VALUES ('ba0d81da-41e8-4be6-a10a-b7210641bbd4', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 1, 'Queue #1', NULL, 'Completed', 0, '2026-07-31 23:38:57', '2026-07-31 23:38:59');
INSERT INTO `queue_sessions` (`id`, `business_id`, `queue_number`, `customer_name`, `mobile`, `status`, `is_pinned`, `created_at`, `updated_at`) VALUES ('ffaf4a3a-53c7-456d-b977-ea6a4740a4b9', 'fresh-choice', 1, 'Queue #1', NULL, 'Waiting', 0, '2026-09-17 00:56:51', '2026-09-17 00:56:51');

DROP TABLE IF EXISTS `quick_buttons`;
CREATE TABLE `quick_buttons` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `time_block` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `price` double NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `quick_buttons_business_id_fkey` (`business_id`),
  CONSTRAINT `quick_buttons_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `recent_orders`;
CREATE TABLE `recent_orders` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `items_summary` varchar(255) NOT NULL,
  `items` text NOT NULL,
  `total_amount` double NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `recent_orders_business_id_fkey` (`business_id`),
  CONSTRAINT `recent_orders_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `recent_orders` (`id`, `business_id`, `items_summary`, `items`, `total_amount`, `created_at`) VALUES ('2922a0e1-d316-4c59-90b2-9c86b509b1ae', 'fresh-choice', '🍫 + 🍫 + 🧀', '[{"productId":"p-dm-50","name":"🍫 Dairy Milk (₹50)","price":50,"quantity":1},{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1},{"productId":"p-pn-500","name":"🧀 Paneer (500g)","price":200,"quantity":1}]', 255, '2026-08-08 01:09:27');
INSERT INTO `recent_orders` (`id`, `business_id`, `items_summary`, `items`, `total_amount`, `created_at`) VALUES ('5615b481-6303-47ab-8161-7755c62e72dc', 'fresh-choice', '🧀 + 🍫', '[{"productId":"p-pn-100","name":"🧀 Paneer (100g)","price":40,"quantity":1},{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1}]', 45, '2026-07-29 13:03:10');
INSERT INTO `recent_orders` (`id`, `business_id`, `items_summary`, `items`, `total_amount`, `created_at`) VALUES ('b221b38e-f1bd-47fc-840b-2849b07e26ef', 'fresh-choice', '🍫 + 🍫 + 🍫 + 🧀', '[{"productId":"p-dm-10","name":"🍫 Dairy Milk (₹10)","price":10,"quantity":1},{"productId":"p-dm-20","name":"🍫 Dairy Milk (₹20)","price":20,"quantity":1},{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1},{"productId":"p-pn-250","name":"🧀 Paneer (250g)","price":100,"quantity":1}]', 135, '2026-08-08 01:06:58');
INSERT INTO `recent_orders` (`id`, `business_id`, `items_summary`, `items`, `total_amount`, `created_at`) VALUES ('d05d21ef-5d20-485c-a249-e7c9516bac2e', 'fresh-choice', '🍫 + 🧀', '[{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1},{"productId":"p-pn-100","name":"🧀 Paneer (100g)","price":40,"quantity":1}]', 45, '2026-07-29 13:06:11');
INSERT INTO `recent_orders` (`id`, `business_id`, `items_summary`, `items`, `total_amount`, `created_at`) VALUES ('d14d3bec-4741-4e59-9266-c8d9a785d33f', 'fresh-choice', '🧀 + 🍫', '[{"productId":"p-pn-100","name":"🧀 Paneer (100g)","price":40,"quantity":1},{"productId":"p-dm-5","name":"🍫 Dairy Milk (₹5)","price":5,"quantity":1}]', 45, '2026-08-02 11:17:53');
INSERT INTO `recent_orders` (`id`, `business_id`, `items_summary`, `items`, `total_amount`, `created_at`) VALUES ('deae8365-c3cb-458b-880a-a1c003b943c4', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '🥛', '[{"productId":"p1-1L","name":"🥛 Amul Milk (1L)","price":60,"quantity":1}]', 60, '2026-07-31 23:38:59');

DROP TABLE IF EXISTS `recovery_reminders`;
CREATE TABLE `recovery_reminders` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `task_id` varchar(50) NOT NULL,
  `reminder_type` varchar(55) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Sent',
  `sent_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `recovery_reminders_business_id_idx` (`business_id`),
  KEY `recovery_reminders_task_id_idx` (`task_id`),
  CONSTRAINT `recovery_reminders_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `recovery_reminders_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `recovery_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `recovery_reminders` (`id`, `business_id`, `task_id`, `reminder_type`, `status`, `sent_at`, `notes`) VALUES ('ca4daa5f-964c-450a-a3f2-eac4998a4fe9', 'fresh-choice', '7b8ce914-85d8-4376-8d78-90fe71239c9f', 'WhatsApp', 'Sent', '2026-07-29 13:04:16', 'Sent reminder message on WhatsApp.');
INSERT INTO `recovery_reminders` (`id`, `business_id`, `task_id`, `reminder_type`, `status`, `sent_at`, `notes`) VALUES ('d0578f7b-0d41-4dc6-8955-351608c23171', 'fresh-choice', 'fd6d1f23-1840-44dd-92db-4d881fa46b28', 'Call', 'Sent', '2026-09-17 01:01:45', 'Called customer. Left message regarding outstanding payment.');

DROP TABLE IF EXISTS `recovery_tasks`;
CREATE TABLE `recovery_tasks` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `priority` varchar(20) NOT NULL DEFAULT 'Medium',
  `amount` double NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recovery_tasks_business_id_idx` (`business_id`),
  KEY `recovery_tasks_customer_id_idx` (`customer_id`),
  CONSTRAINT `recovery_tasks_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `recovery_tasks_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `recovery_tasks` (`id`, `business_id`, `customer_id`, `status`, `priority`, `amount`, `notes`, `created_at`, `updated_at`) VALUES ('7b8ce914-85d8-4376-8d78-90fe71239c9f', 'fresh-choice', 'c3', 'Recovered', 'Medium', 1250, 'Sent reminder message on WhatsApp.', '2026-07-29 13:04:05', '2026-07-29 13:04:51');
INSERT INTO `recovery_tasks` (`id`, `business_id`, `customer_id`, `status`, `priority`, `amount`, `notes`, `created_at`, `updated_at`) VALUES ('fd6d1f23-1840-44dd-92db-4d881fa46b28', 'fresh-choice', 'c1', 'InProgress', 'High', 500, 'Called customer. Left message regarding outstanding payment.', '2026-07-29 13:04:05', '2026-09-17 01:01:45');

DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `role_id` varchar(50) NOT NULL,
  `permission_id` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `role_permissions_permission_id_fkey` (`permission_id`),
  CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_business_id_name_key` (`business_id`,`name`),
  CONSTRAINT `roles_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('1510951a-3486-4a15-a053-9015e551cf96', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'Accountant', '2026-07-27 09:03:18', '2026-07-27 09:03:18');
INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('312afee4-d790-4c29-945e-0f207bc257b7', 'fresh-choice', 'Cashier', '2026-07-27 07:41:42', '2026-07-27 07:41:42');
INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('3a66ac31-b36c-4368-a2c9-9eaeb2fa0b10', 'fresh-choice', 'Accountant', '2026-07-27 07:41:42', '2026-07-27 07:41:42');
INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('529a614f-cbcf-4718-8b1f-3234842c76f1', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'Cashier', '2026-07-27 09:03:18', '2026-07-27 09:03:18');
INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('5bd2e1cb-6547-42bf-b443-fc2520588c44', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'SuperAdmin', '2026-07-27 09:03:18', '2026-07-27 09:03:18');
INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('92bd2378-d362-48b0-b5ba-51582ec778f7', 'fresh-choice', 'Owner', '2026-07-27 07:41:42', '2026-07-27 07:41:42');
INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('b8395e25-532c-4c54-b91d-ab00f1d93b0a', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'Owner', '2026-07-27 09:03:18', '2026-07-27 09:03:18');
INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('d2f8065e-db5b-4118-8bed-dd9c2148a3c6', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'Warehouse', '2026-07-27 09:03:18', '2026-07-27 09:03:18');
INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('daa327bb-2c48-46c0-b900-7ad2e5794364', 'fresh-choice', 'SuperAdmin', '2026-07-27 07:41:42', '2026-07-27 07:41:42');
INSERT INTO `roles` (`id`, `business_id`, `name`, `created_at`, `updated_at`) VALUES ('db72cc37-9ea9-42c9-b9fd-95c2eb6dd801', 'fresh-choice', 'Warehouse', '2026-07-27 07:41:42', '2026-07-27 07:41:42');

DROP TABLE IF EXISTS `search_favorites`;
CREATE TABLE `search_favorites` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `target_module` varchar(50) NOT NULL,
  `target_id` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `subtitle` varchar(150) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `search_favorites_business_id_idx` (`business_id`),
  KEY `search_favorites_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `search_history`;
CREATE TABLE `search_history` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `search_text` varchar(150) NOT NULL,
  `search_module` varchar(55) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `search_history_business_id_idx` (`business_id`),
  KEY `search_history_user_id_idx` (`user_id`),
  KEY `search_history_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `seasonal_patterns`;
CREATE TABLE `seasonal_patterns` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `season` varchar(50) NOT NULL,
  `multiplier` double NOT NULL DEFAULT 1,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `seasonal_patterns_business_id_product_id_season_key` (`business_id`,`product_id`,`season`),
  KEY `seasonal_patterns_product_id_fkey` (`product_id`),
  CONSTRAINT `seasonal_patterns_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `seasonal_patterns_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `token` varchar(500) NOT NULL,
  `refresh_token` varchar(500) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `is_revoked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `customer_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_idx` (`user_id`),
  KEY `sessions_customer_id_idx` (`customer_id`),
  CONSTRAINT `sessions_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `pwa_customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('060bbe13-06ff-4b3a-b1cc-eb1b074f4c64', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzI0NDhiZS02MGFlLTRjNzMtOWNjZi02NTI3MmJiNDE5MWEiLCJyb2xlIjoiQ3VzdG9tZXIiLCJpYXQiOjE3ODU1NjA3MDgsImV4cCI6MTc4NTY0NzEwOH0._jMXgQqDlNgrh_JKXKN75HHmAkhomr1CswT2RSrGjdk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzI0NDhiZS02MGFlLTRjNzMtOWNjZi02NTI3MmJiNDE5MWEiLCJpYXQiOjE3ODU1NjA3MDgsImV4cCI6MTc4NjE2NTUwOH0.bEpxRhiigYb4ti7hVCoFgyQSvzsp1QfwfvaMZmRQvEE', '2026-08-07 23:35:08', 0, '2026-07-31 23:35:08', '2026-07-31 23:35:08', '7c2448be-60ae-4c73-9ccf-65272bb4191a');
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('07b50d7d-b468-440f-b09c-fa2c2d3b1316', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZmU0ZTMzNC1jYzBjLTRkNzgtYmEwYS0wMTUxNTlkNjdjYTYiLCJyb2xlIjoiQ3VzdG9tZXIiLCJpYXQiOjE3ODUzNTA1NDgsImV4cCI6MTc4NTQzNjk0OH0.TTDqKhpTAo-QIeS_bcHyb4XtjYPl183cYWyYzNThFX4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZmU0ZTMzNC1jYzBjLTRkNzgtYmEwYS0wMTUxNTlkNjdjYTYiLCJpYXQiOjE3ODUzNTA1NDgsImV4cCI6MTc4NTk1NTM0OH0.b8y6VQGCAiC617zDt2C4hCLeulA_f0VUmdtEtTNfzyw', '2026-08-05 13:12:28', 0, '2026-07-29 13:12:28', '2026-07-29 13:12:28', 'ffe4e334-cc0c-4d78-ba0a-015159d67ca6');
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('08872cd5-fa48-49ab-951b-9172c869d97f', 'dcd223ad-226f-45da-94e0-d3b5934ddbf6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJidXNpbmVzc0lkIjoiYzIyNDIwOTAtNTFlYS00YjZiLTgyZjAtNjhlYjM2NzY4ZDBiIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg1NjkwNTY2LCJleHAiOjE3ODU3NzY5NjZ9.V90WCIHvxVMNeFuVoAwYuc-t68o4fWd09aE7tldEYXc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJpYXQiOjE3ODU2OTA1NjYsImV4cCI6MTc4NjI5NTM2Nn0.jAr-BoE9nsY4k1gm9cnwfhk0hM7K4TU8U_B9zmbojYM', '2026-08-09 11:39:26', 0, '2026-08-02 11:39:26', '2026-08-02 11:39:26', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('264365d1-03ca-4e16-a157-7cf4362ffc2c', '603d5725-e9cd-4ecf-967c-ca6e578e0824', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJidXNpbmVzc0lkIjoiZnJlc2gtY2hvaWNlIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg1MTU4NDc3LCJleHAiOjE3ODUyNDQ4Nzd9.xCojoHI0hQyiVGyHCuy_toIP7p_7MH7eglJ-DU3oSY8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJpYXQiOjE3ODUxNTg0NzcsImV4cCI6MTc4NTc2MzI3N30.zdcInWRiAlcyEvoYW6OZym4_QN4apodLZq-jkGymkaY', '2026-08-03 07:51:17', 0, '2026-07-27 07:51:17', '2026-07-27 07:51:17', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('4106a354-44af-402b-9d15-a115ea82d86e', '603d5725-e9cd-4ecf-967c-ca6e578e0824', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJidXNpbmVzc0lkIjoiZnJlc2gtY2hvaWNlIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg2MTcwOTI4LCJleHAiOjE3ODYyNTczMjh9.VYaBl4kPzKFs77qryG4jaqcYYWALwcQiASa9No7ryKY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJpYXQiOjE3ODYxNzA5MjgsImV4cCI6MTc4Njc3NTcyOH0.ponF6kFvMdxGstoEsGItysjcRa-59ulEJDp8xrMXyjg', '2026-08-15 01:05:28', 0, '2026-08-08 01:05:28', '2026-08-08 01:05:28', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('41549d90-12a9-49cf-abb8-82c9cd4d6c8c', '603d5725-e9cd-4ecf-967c-ca6e578e0824', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJidXNpbmVzc0lkIjoiZnJlc2gtY2hvaWNlIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg1MTU4MTAzLCJleHAiOjE3ODUyNDQ1MDN9.JNKJV1-_7Q_thRjNyU4ZWRTgXFea7V0ZfT4rlSuJ-EE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJpYXQiOjE3ODUxNTgxMDMsImV4cCI6MTc4NTc2MjkwM30.9I3BPiUnmeL5a-47T2kTX7--ghuKvm9-I7QUyjX__Fs', '2026-08-03 07:45:03', 0, '2026-07-27 07:45:03', '2026-07-27 07:45:03', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('4da8fe06-85d0-425e-8590-bc93534dd321', '603d5725-e9cd-4ecf-967c-ca6e578e0824', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJidXNpbmVzc0lkIjoiZnJlc2gtY2hvaWNlIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg1OTk5MzQ1LCJleHAiOjE3ODYwODU3NDV9.YkMZ5YktBcU8DIF3fIa8fo3N1DmpZDGXaS2i3pemdEM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJpYXQiOjE3ODU5OTkzNDUsImV4cCI6MTc4NjYwNDE0NX0.nPII1vqGCFASos-37bYz6fiRUHQfeV5STYF6eZF6P9w', '2026-08-13 01:25:45', 0, '2026-08-06 01:25:45', '2026-08-06 01:25:45', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('4dd3a7dd-5c2f-4761-acd0-0b667609b0e7', '603d5725-e9cd-4ecf-967c-ca6e578e0824', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJidXNpbmVzc0lkIjoiZnJlc2gtY2hvaWNlIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg5NjI1MTIxLCJleHAiOjE3ODk3MTE1MjF9.LgUHVHOwkECsqTQtY8NqqzWtrfNQjAfmHLSPsWNzQRM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJpYXQiOjE3ODk2MjUxMjEsImV4cCI6MTc5MDIyOTkyMX0.xRUed2RCI4hXq1djtJRWurrENl57Um3c8ETj_w6yybA', '2026-09-24 00:35:21', 0, '2026-09-17 00:35:21', '2026-09-17 00:35:21', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('552e97ad-ff2a-4b34-8684-d452bfb28179', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzI0NDhiZS02MGFlLTRjNzMtOWNjZi02NTI3MmJiNDE5MWEiLCJyb2xlIjoiQ3VzdG9tZXIiLCJpYXQiOjE3ODYxNzE0ODMsImV4cCI6MTc4NjI1Nzg4M30.Pj3XKBjMYq5u4TnX78GzJVB93ceAH6o0zjWS_qVsM9o', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzI0NDhiZS02MGFlLTRjNzMtOWNjZi02NTI3MmJiNDE5MWEiLCJpYXQiOjE3ODYxNzE0ODMsImV4cCI6MTc4Njc3NjI4M30.SujJfO7TLu1ddNHAacWJVj5fqIo10uLmuOHJbLLclDA', '2026-08-15 01:14:43', 0, '2026-08-08 01:14:43', '2026-08-08 01:14:43', '7c2448be-60ae-4c73-9ccf-65272bb4191a');
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('5e2e3472-a1ba-4d53-a5d5-6691d29384cf', 'dcd223ad-226f-45da-94e0-d3b5934ddbf6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJidXNpbmVzc0lkIjoiYzIyNDIwOTAtNTFlYS00YjZiLTgyZjAtNjhlYjM2NzY4ZDBiIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg1MzUxMTQ0LCJleHAiOjE3ODU0Mzc1NDR9.dczmUzaqD5P-95dtJTF0eBTkCWCaezPjESEYs7oWXAM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJpYXQiOjE3ODUzNTExNDQsImV4cCI6MTc4NTk1NTk0NH0.JfmonPnb-pVzo9XCJX6ccDTWpsIbmd8MbrZni1wHqps', '2026-08-05 13:22:24', 0, '2026-07-29 13:22:24', '2026-07-29 13:22:24', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('70d77d07-7afc-45ed-a6f9-7cef9df07244', 'dcd223ad-226f-45da-94e0-d3b5934ddbf6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJidXNpbmVzc0lkIjoiYzIyNDIwOTAtNTFlYS00YjZiLTgyZjAtNjhlYjM2NzY4ZDBiIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg2MTcxNTMzLCJleHAiOjE3ODYyNTc5MzN9.VcMcdalxdKjm0-bwDxaw4IAt4h3YGp8b9fzerxx8czE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJpYXQiOjE3ODYxNzE1MzMsImV4cCI6MTc4Njc3NjMzM30.2evl10L5ZwR5vfNfc6A2E_GooA71QXOsyzpu3hAMwPA', '2026-08-15 01:15:33', 0, '2026-08-08 01:15:33', '2026-08-08 01:15:33', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('8bcb11f3-103c-49e8-9795-bfcc33bd2ffa', 'dcd223ad-226f-45da-94e0-d3b5934ddbf6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJidXNpbmVzc0lkIjoiYzIyNDIwOTAtNTFlYS00YjZiLTgyZjAtNjhlYjM2NzY4ZDBiIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg1NTYwNzQ5LCJleHAiOjE3ODU2NDcxNDl9.Qr_KENeUBNN3Eo7moPFgSN83mNdQByKScHm9E_AEAsM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJpYXQiOjE3ODU1NjA3NDksImV4cCI6MTc4NjE2NTU0OX0.usRMaa1HA8Ho110-1LIETZBz25B8GNUHbI91PCD8L_I', '2026-08-07 23:35:49', 0, '2026-07-31 23:35:49', '2026-07-31 23:35:49', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('a285be17-d1bc-4503-b965-fed2ea0555f7', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhY2M2YjFhZi03MzFiLTQ5NTktOWVkNS00NGJhN2I5NGVmMDAiLCJyb2xlIjoiQ3VzdG9tZXIiLCJpYXQiOjE3ODUxNTg0NDEsImV4cCI6MTc4NTI0NDg0MX0.xE2adtUkTb4FM2usikkTJSkS2kpNz9uwXAgZtoFNpZU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhY2M2YjFhZi03MzFiLTQ5NTktOWVkNS00NGJhN2I5NGVmMDAiLCJpYXQiOjE3ODUxNTg0NDEsImV4cCI6MTc4NTc2MzI0MX0.R4ZoopPUHCtjrIc4-NK1c-ZT2a9wYSYeRB74jKFe3qw', '2026-08-03 07:50:41', 0, '2026-07-27 07:50:41', '2026-07-27 07:50:41', 'acc6b1af-731b-4959-9ed5-44ba7b94ef00');
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('b578e09e-6a6e-451d-a83b-5fd9d827df71', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzI0NDhiZS02MGFlLTRjNzMtOWNjZi02NTI3MmJiNDE5MWEiLCJyb2xlIjoiQ3VzdG9tZXIiLCJpYXQiOjE3ODU2OTA1MDMsImV4cCI6MTc4NTc3NjkwM30.3zrlNhoOyKvTn7wkqfcPSe2xcHvzOHWyv9UFvZokg6k', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzI0NDhiZS02MGFlLTRjNzMtOWNjZi02NTI3MmJiNDE5MWEiLCJpYXQiOjE3ODU2OTA1MDMsImV4cCI6MTc4NjI5NTMwM30.4hNk3OP-BEpPBBiG-3dQqM-34yiyHCW3pTes-u34Rlg', '2026-08-09 11:38:23', 0, '2026-08-02 11:38:23', '2026-08-02 11:38:23', '7c2448be-60ae-4c73-9ccf-65272bb4191a');
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('b75e2556-21c1-4828-b60c-79cc2adc4cf8', '603d5725-e9cd-4ecf-967c-ca6e578e0824', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJidXNpbmVzc0lkIjoiZnJlc2gtY2hvaWNlIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg4Njc0Nzk5LCJleHAiOjE3ODg3NjExOTl9.Y-mOYYGuxwjdboik_Bd_cN9he0IShD-u6pBp5XtMk08', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJpYXQiOjE3ODg2NzQ3OTksImV4cCI6MTc4OTI3OTU5OX0.HAkjEYudNuneuc9tbEMpxbiooeW24pBkfeNh7Kgpi_c', '2026-09-13 00:36:39', 0, '2026-09-06 00:36:39', '2026-09-06 00:36:39', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('c8be21e5-7cff-4cd2-b556-7522b124b3a1', 'dcd223ad-226f-45da-94e0-d3b5934ddbf6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJidXNpbmVzc0lkIjoiYzIyNDIwOTAtNTFlYS00YjZiLTgyZjAtNjhlYjM2NzY4ZDBiIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg1MTYyNzk4LCJleHAiOjE3ODUyNDkxOTh9.8AirECbwJKyMZVauMgpf8vhKkzaAe6fqwQLtPndFM9o', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2QyMjNhZC0yMjZmLTQ1ZGEtOTRlMC1kM2I1OTM0ZGRiZjYiLCJpYXQiOjE3ODUxNjI3OTgsImV4cCI6MTc4NTc2NzU5OH0.hp46KgiECokx9bAR-VIXWOoTPMenlNeCLqPpnlHWW0s', '2026-08-03 09:03:18', 0, '2026-07-27 09:03:18', '2026-07-27 09:03:18', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('ef39a5cd-9fd8-4f79-98c3-af8df1b038d8', '603d5725-e9cd-4ecf-967c-ca6e578e0824', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJidXNpbmVzc0lkIjoiZnJlc2gtY2hvaWNlIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg1MzQ5ODYyLCJleHAiOjE3ODU0MzYyNjJ9.o3uDGO9SGw4VfKF29wXxE65Y2IRx84GgJaT_PAsB9h8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJpYXQiOjE3ODUzNDk4NjIsImV4cCI6MTc4NTk1NDY2Mn0.WSeqU875XEHtJFm2EIbozJ65jsTDZg_z2KpseLo6Dds', '2026-08-05 13:01:02', 0, '2026-07-29 13:01:02', '2026-07-29 13:01:02', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('f11717fa-87dd-4db1-9f9c-37c680e2032e', '603d5725-e9cd-4ecf-967c-ca6e578e0824', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJidXNpbmVzc0lkIjoiZnJlc2gtY2hvaWNlIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg3NTAwOTUyLCJleHAiOjE3ODc1ODczNTJ9.9cHtltt1BILOToqXb8RHZaifWXzSrpCojya6fLiGi6Y', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJpYXQiOjE3ODc1MDA5NTIsImV4cCI6MTc4ODEwNTc1Mn0.iRtKghm6D7310blQNcKSNvh24LPV_HiO2LzmP5VbxgE', '2026-08-30 10:32:32', 0, '2026-08-23 10:32:33', '2026-08-23 10:32:33', NULL);
INSERT INTO `sessions` (`id`, `user_id`, `token`, `refresh_token`, `expires_at`, `is_revoked`, `created_at`, `updated_at`, `customer_id`) VALUES ('f97f7ff9-3576-496e-be81-2fc2d36dea41', '603d5725-e9cd-4ecf-967c-ca6e578e0824', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJidXNpbmVzc0lkIjoiZnJlc2gtY2hvaWNlIiwicm9sZSI6Ik93bmVyIiwiaWF0IjoxNzg1Njg5MTgxLCJleHAiOjE3ODU3NzU1ODF9.rqE7UOFyvb40-wrJcxEcpDs5eJ1ATlhIqQF5ilbObi8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDNkNTcyNS1lOWNkLTRlY2YtOTY3Yy1jYTZlNTc4ZTA4MjQiLCJpYXQiOjE3ODU2ODkxODEsImV4cCI6MTc4NjI5Mzk4MX0.LHlTZ49d_GT4VXSYpOtfA35BPlMuPARmiL1o_N5mygE', '2026-08-09 11:16:21', 0, '2026-08-02 11:16:21', '2026-08-02 11:16:21', NULL);

DROP TABLE IF EXISTS `stock_adjustments`;
CREATE TABLE `stock_adjustments` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `adjusted_qty` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `adjusted_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `stock_adjustments_business_id_idx` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('177001b8-b998-49a9-8251-eb7ccd377dff', 'fresh-choice', 'p7', -1, 'Manual Stock Adjustment', 'System', '2026-09-17 00:56:59');
INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('1f4dc589-3136-4b0b-a521-af677c1c83ec', 'fresh-choice', 'p1', 1, 'Manual Stock Adjustment', 'System', '2026-07-29 13:06:29');
INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('288ead77-dbbe-48de-84ff-1e676a43e163', 'fresh-choice', 'p7', 1, 'Manual Stock Adjustment', 'System', '2026-09-17 00:56:58');
INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('3e8bd977-3ae7-4c99-8584-d28d8d120187', 'fresh-choice', 'p3', 1, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:07');
INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('671afeed-888c-452a-b523-e3f79403e4c8', 'fresh-choice', 'p3', 1, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:08');
INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('9a5559b7-2e71-47fa-ad0d-cff85b3e69fe', 'fresh-choice', 'p3', 1, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:08');
INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('9f5026c4-f04d-417e-8fb5-aac561966cc1', 'fresh-choice', 'p3', 1, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:08');
INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('e856f4b5-1ba8-419f-b276-cc4738319cd2', 'fresh-choice', 'p1', 1, 'Manual Stock Adjustment', 'System', '2026-07-29 13:06:29');
INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('f4a043fd-e266-4f4e-9476-ff91b572fff5', 'fresh-choice', 'p1', 1, 'Manual Stock Adjustment', 'System', '2026-07-29 13:06:27');
INSERT INTO `stock_adjustments` (`id`, `business_id`, `product_id`, `adjusted_qty`, `reason`, `adjusted_by`, `created_at`) VALUES ('fcf93ec7-39fa-4372-b2cd-f1700d014c58', 'fresh-choice', 'p3', 1, 'Manual Stock Adjustment', 'System', '2026-08-08 01:10:07');

DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `inventory_id` varchar(50) NOT NULL,
  `reference_type` varchar(50) NOT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `movement_type` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `opening_stock` int(11) NOT NULL,
  `closing_stock` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `stock_movements_business_id_idx` (`business_id`),
  KEY `stock_movements_product_id_idx` (`product_id`),
  KEY `stock_movements_inventory_id_idx` (`inventory_id`),
  CONSTRAINT `stock_movements_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('0baebc88-d5f1-459b-ad15-6ce7ee5a0d05', 'fresh-choice', 'p1', 'd089fd98-5376-412c-8973-5b38d008efd1', 'Sale', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'OUT', 1, 7, 6, 'Sales Invoice checkout: INV-110', NULL, 'Cashier', '2026-09-06 00:57:05');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('0d8f866d-2301-4cc0-9894-94f5412f311d', 'fresh-choice', 'p2', '8c21cfec-22be-4f32-92cd-080fad990948', 'Sale', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'OUT', 1, 19, 18, 'Sales Invoice checkout: INV-111', NULL, 'Cashier', '2026-09-06 00:57:30');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('14a2ebb3-7d1c-4efd-baac-55b655b455a0', 'fresh-choice', 'p6', '7e582f09-0d5e-4f52-b3aa-089706fa6aed', 'Sale', '9d11fa21-9e91-48c8-8d1f-336c06568f86', 'OUT', 1, 14, 13, 'Sales Invoice checkout: INV-105', NULL, 'Cashier', '2026-08-02 11:20:58');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('1850aa20-a3a4-4f95-be20-74919b2cb7e5', 'fresh-choice', 'p6', '7e582f09-0d5e-4f52-b3aa-089706fa6aed', 'Sale', '440a3145-9a10-4b5b-866c-c31477550d6e', 'OUT', 1, 13, 12, 'Sales Invoice checkout: INV-107', NULL, 'Cashier', '2026-08-08 01:08:24');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('18a10381-26b9-4bd9-ba48-83a5a9ddbc71', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'Sale', 'f78011ec-8d7d-4e34-80ae-3b986dbd5a99', 'OUT', 1, 18, 17, 'Sales Invoice checkout: INV-102', NULL, 'Cashier', '2026-07-29 13:05:10');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('23c1450e-4344-40f1-b8d0-6bcad2d2628f', 'fresh-choice', 'p1', 'd089fd98-5376-412c-8973-5b38d008efd1', 'Adjustment', NULL, 'IN', 1, 6, 7, 'Manual Stock Adjustment', NULL, 'System', '2026-07-29 13:06:29');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('2e5179fe-2f63-477f-bb6a-07e5be68e921', 'fresh-choice', 'p6', '7e582f09-0d5e-4f52-b3aa-089706fa6aed', 'Sale', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'OUT', 1, 11, 10, 'Sales Invoice checkout: INV-110', NULL, 'Cashier', '2026-09-06 00:57:05');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('393cfeb7-e544-4880-90f4-9ec6080e007b', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'Adjustment', NULL, 'IN', 1, 10, 11, 'Manual Stock Adjustment', NULL, 'System', '2026-08-08 01:10:08');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('3de99907-405e-41a7-b17b-ca86b5f48da7', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'Sale', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'OUT', 1, 14, 13, 'Sales Invoice checkout: INV-110', NULL, 'Cashier', '2026-09-06 00:57:05');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('416e2349-b4fd-4062-8f6c-93e63a9b83e3', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'Sale', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'OUT', 1, 13, 12, 'Sales Invoice checkout: INV-111', NULL, 'Cashier', '2026-09-06 00:57:30');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('4408197f-efe6-44ac-8fe6-e3b0ae278d41', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'Sale', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'OUT', 1, 10, 9, 'Sales Invoice checkout: INV-111', NULL, 'Cashier', '2026-09-06 00:57:30');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('456e6311-3161-4fc9-b48b-97884c592159', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'Adjustment', NULL, 'IN', 1, 11, 12, 'Manual Stock Adjustment', NULL, 'System', '2026-08-08 01:10:08');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('4692d855-5d21-4b49-8733-1919a735b5a3', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'Sale', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'OUT', 1, 11, 10, 'Sales Invoice checkout: INV-110', NULL, 'Cashier', '2026-09-06 00:57:05');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('5425be90-cab4-46ae-80da-ff57c3b8916b', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'Opening Stock', NULL, 'IN', 18, 0, 18, 'Initial ledger entry during systems setup', NULL, 'owner@quickbizs.com', '2026-07-27 07:41:42');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('5a6f3c91-3b86-45ef-8be3-bd72d0b143a4', 'fresh-choice', 'p4', 'a983467f-32b1-47ef-8701-dd2c09e439f8', 'Opening Stock', NULL, 'IN', 52, 0, 52, 'Initial ledger entry during systems setup', NULL, 'owner@quickbizs.com', '2026-07-27 07:41:42');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('5e79223b-c101-4150-af61-ad43b6161500', 'fresh-choice', 'p1', 'd089fd98-5376-412c-8973-5b38d008efd1', 'Sale', '440a3145-9a10-4b5b-866c-c31477550d6e', 'OUT', 1, 8, 7, 'Sales Invoice checkout: INV-107', NULL, 'Cashier', '2026-08-08 01:08:24');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('6005ec90-1de7-48d1-8b08-99a195312f07', 'fresh-choice', 'p5', '51d28268-8853-42cb-a2c2-0cfa57c5c531', 'Opening Stock', NULL, 'IN', 3, 0, 3, 'Initial ledger entry during systems setup', NULL, 'owner@quickbizs.com', '2026-07-27 07:41:42');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('61476bd9-ca0a-40a1-867a-948bf3a42418', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'Opening Stock', NULL, 'IN', 8, 0, 8, 'Initial ledger entry during systems setup', NULL, 'owner@quickbizs.com', '2026-07-27 07:41:42');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('66975fb5-0cd3-41f2-8289-fb8fbd73f9a9', 'fresh-choice', 'p2', '8c21cfec-22be-4f32-92cd-080fad990948', 'Sale', '31bb628a-99fa-477b-ab78-0a77ef1c11d4', 'OUT', 1, 20, 19, 'Sales Invoice checkout: INV-110', NULL, 'Cashier', '2026-09-06 00:57:05');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('696b0884-ddd2-4cc5-ac5d-69c561c312df', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'Adjustment', NULL, 'IN', 1, 7, 8, 'Manual Stock Adjustment', NULL, 'System', '2026-08-08 01:10:07');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('719010a5-8f09-4fc9-90db-b8f774d9e6cd', 'fresh-choice', 'p2', '8c21cfec-22be-4f32-92cd-080fad990948', 'Sale', '9d11fa21-9e91-48c8-8d1f-336c06568f86', 'OUT', 1, 21, 20, 'Sales Invoice checkout: INV-105', NULL, 'Cashier', '2026-08-02 11:20:58');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('747380b9-965d-458d-93bb-3f826cc305ea', 'fresh-choice', 'p6', '7e582f09-0d5e-4f52-b3aa-089706fa6aed', 'Sale', 'f78011ec-8d7d-4e34-80ae-3b986dbd5a99', 'OUT', 1, 15, 14, 'Sales Invoice checkout: INV-102', NULL, 'Cashier', '2026-07-29 13:05:10');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('77154cd8-3c80-403b-81b0-95053e54233c', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'Adjustment', NULL, 'IN', 1, 12, 13, 'Manual Stock Adjustment', NULL, 'System', '2026-09-17 00:56:58');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('82a18ea8-04c0-404c-809a-3da5d2da327a', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'Adjustment', NULL, 'IN', 1, 8, 9, 'Manual Stock Adjustment', NULL, 'System', '2026-08-08 01:10:07');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('885ab3f2-5711-4c81-845d-34aa39f34d7f', 'fresh-choice', 'p2', '8c21cfec-22be-4f32-92cd-080fad990948', 'Opening Stock', NULL, 'IN', 22, 0, 22, 'Initial ledger entry during systems setup', NULL, 'owner@quickbizs.com', '2026-07-27 07:41:42');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('a98333d3-0c96-410e-bbae-ac15dd7917b1', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', '83ba80ee-019b-47cf-84e0-1b2084a59972', '7baf59fb-6a14-406f-8433-a4fb26166d57', 'Opening Stock', NULL, 'IN', 45, 0, 45, 'Initial ledger entry during product creation', NULL, 'owner@quickbizs.com', '2026-07-27 09:03:42');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('aec8de94-e6f0-45d8-b471-01d47bdf69ee', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'Sale', '65d8b20d-3cab-4590-84ee-c193b88aff54', 'OUT', 1, 12, 11, 'Sales Invoice checkout: INV-109', NULL, 'Cashier', '2026-08-23 10:33:26');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('aff2ad82-b2d3-48a2-ba70-7107abf9ab8e', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'Sale', '440a3145-9a10-4b5b-866c-c31477550d6e', 'OUT', 1, 16, 15, 'Sales Invoice checkout: INV-107', NULL, 'Cashier', '2026-08-08 01:08:24');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('b7a38cf6-d993-4f7f-8bf3-2e43b68fe6e6', 'fresh-choice', 'p3', 'a598c9a3-fdaa-4849-af73-96dbe1ef1940', 'Adjustment', NULL, 'IN', 1, 9, 10, 'Manual Stock Adjustment', NULL, 'System', '2026-08-08 01:10:08');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('bbd4d544-c1fe-4982-900e-119295fb1e7d', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'Sale', '9d11fa21-9e91-48c8-8d1f-336c06568f86', 'OUT', 1, 17, 16, 'Sales Invoice checkout: INV-105', NULL, 'Cashier', '2026-08-02 11:20:58');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('bc1c3a1a-99ab-4d8d-9e26-6144aaae13d0', 'fresh-choice', 'p6', '7e582f09-0d5e-4f52-b3aa-089706fa6aed', 'Sale', '65d8b20d-3cab-4590-84ee-c193b88aff54', 'OUT', 1, 12, 11, 'Sales Invoice checkout: INV-109', NULL, 'Cashier', '2026-08-23 10:33:26');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('bd5f236a-2daf-4a12-9338-2883b5e9f708', 'fresh-choice', 'p1', 'd089fd98-5376-412c-8973-5b38d008efd1', 'Opening Stock', NULL, 'IN', 5, 0, 5, 'Initial ledger entry during systems setup', NULL, 'owner@quickbizs.com', '2026-07-27 07:41:42');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('c1ffca30-ea29-4813-a6dc-128d4e90e159', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'Adjustment', NULL, 'OUT', 1, 13, 12, 'Manual Stock Adjustment', NULL, 'System', '2026-09-17 00:56:59');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('d1ac6271-19ce-4f84-b94e-22d295523d18', 'fresh-choice', 'p7', 'c66f0144-1491-4850-a5c8-424c6fec6074', 'Sale', '65d8b20d-3cab-4590-84ee-c193b88aff54', 'OUT', 1, 15, 14, 'Sales Invoice checkout: INV-109', NULL, 'Cashier', '2026-08-23 10:33:26');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('d728414e-836a-485a-b7c6-29605771b61b', 'fresh-choice', 'p6', '7e582f09-0d5e-4f52-b3aa-089706fa6aed', 'Opening Stock', NULL, 'IN', 15, 0, 15, 'Initial ledger entry during systems setup', NULL, 'owner@quickbizs.com', '2026-07-27 07:41:42');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('dc6302b0-34b1-4c48-96f0-7f851fcdfe93', 'fresh-choice', 'p1', 'd089fd98-5376-412c-8973-5b38d008efd1', 'Adjustment', NULL, 'IN', 1, 7, 8, 'Manual Stock Adjustment', NULL, 'System', '2026-07-29 13:06:29');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('e0163850-9ee7-4287-8333-16e6e6ba799c', 'fresh-choice', 'p1', 'd089fd98-5376-412c-8973-5b38d008efd1', 'Adjustment', NULL, 'IN', 1, 5, 6, 'Manual Stock Adjustment', NULL, 'System', '2026-07-29 13:06:27');
INSERT INTO `stock_movements` (`id`, `business_id`, `product_id`, `inventory_id`, `reference_type`, `reference_id`, `movement_type`, `quantity`, `opening_stock`, `closing_stock`, `reason`, `remarks`, `created_by`, `created_at`) VALUES ('e8d82786-4108-4804-b07c-d986a4d1c86f', 'fresh-choice', 'p6', '7e582f09-0d5e-4f52-b3aa-089706fa6aed', 'Sale', 'ca4a896b-7ec2-4d9d-ba56-63140b2ef187', 'OUT', 1, 10, 9, 'Sales Invoice checkout: INV-111', NULL, 'Cashier', '2026-09-06 00:57:30');

DROP TABLE IF EXISTS `stock_transfers`;
CREATE TABLE `stock_transfers` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `from_location` varchar(100) NOT NULL,
  `to_location` varchar(100) NOT NULL,
  `transferred_qty` int(11) NOT NULL,
  `transferred_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `stock_transfers_business_id_idx` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `supplier_ledgers`;
CREATE TABLE `supplier_ledgers` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `supplier_id` varchar(50) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `reference_number` varchar(100) NOT NULL,
  `amount` double NOT NULL,
  `running_balance` double NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `supplier_ledgers_business_id_idx` (`business_id`),
  KEY `supplier_ledgers_supplier_id_idx` (`supplier_id`),
  CONSTRAINT `supplier_ledgers_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `supplier_ledgers_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `supplier_code` varchar(50) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `gst_number` varchar(50) DEFAULT NULL,
  `pan_number` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pin_code` varchar(20) DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `credit_limit` double NOT NULL DEFAULT 100000,
  `outstanding_amount` double NOT NULL DEFAULT 0,
  `last_purchase_date` datetime(3) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `notes` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `suppliers_gst_number_key` (`gst_number`),
  KEY `suppliers_business_id_idx` (`business_id`),
  KEY `suppliers_mobile_idx` (`mobile`),
  KEY `suppliers_supplier_code_idx` (`supplier_code`),
  KEY `suppliers_company_name_idx` (`company_name`),
  CONSTRAINT `suppliers_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `suppliers` (`id`, `business_id`, `supplier_code`, `company_name`, `contact_person`, `mobile`, `email`, `gst_number`, `pan_number`, `address`, `city`, `state`, `pin_code`, `payment_terms`, `credit_limit`, `outstanding_amount`, `last_purchase_date`, `status`, `notes`, `is_active`, `is_deleted`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES ('s1', 'fresh-choice', 'SUP-0001', 'Kirana Wholesale', 'Sanjay Shah', '+91 91122 33445', 'sanjay@kirana.com', '27AAAAA1111A1Z1', NULL, NULL, NULL, NULL, NULL, NULL, 100000, 12000, NULL, 'Active', NULL, 1, 0, NULL, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42', NULL);
INSERT INTO `suppliers` (`id`, `business_id`, `supplier_code`, `company_name`, `contact_person`, `mobile`, `email`, `gst_number`, `pan_number`, `address`, `city`, `state`, `pin_code`, `payment_terms`, `credit_limit`, `outstanding_amount`, `last_purchase_date`, `status`, `notes`, `is_active`, `is_deleted`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES ('s2', 'fresh-choice', 'SUP-0002', 'Amul Milk Dairy', 'Verghese Kurien', '+91 92233 44556', 'contact@amul.com', '24AAAAA2222A2Z2', NULL, NULL, NULL, NULL, NULL, NULL, 100000, 300, NULL, 'Active', NULL, 1, 0, NULL, NULL, '2026-07-27 07:41:42', '2026-07-29 13:07:02', NULL);
INSERT INTO `suppliers` (`id`, `business_id`, `supplier_code`, `company_name`, `contact_person`, `mobile`, `email`, `gst_number`, `pan_number`, `address`, `city`, `state`, `pin_code`, `payment_terms`, `credit_limit`, `outstanding_amount`, `last_purchase_date`, `status`, `notes`, `is_active`, `is_deleted`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES ('s3', 'fresh-choice', 'SUP-0003', 'Sunrise Electronics', 'Rajiv Mehta', '+91 93344 55667', 'rajiv@sunrise.com', '07AAAAA3333A3Z3', NULL, NULL, NULL, NULL, NULL, NULL, 100000, 0, NULL, 'Active', NULL, 1, 0, NULL, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42', NULL);

DROP TABLE IF EXISTS `task_comments`;
CREATE TABLE `task_comments` (
  `id` varchar(50) NOT NULL,
  `task_id` varchar(50) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `comment` varchar(255) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `task_comments_task_id_idx` (`task_id`),
  CONSTRAINT `task_comments_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` varchar(255) NOT NULL,
  `task_type` varchar(50) NOT NULL,
  `priority` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `assigned_by` varchar(100) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `due_date` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_business_id_idx` (`business_id`),
  KEY `tasks_status_idx` (`status`),
  KEY `tasks_assigned_to_idx` (`assigned_to`),
  CONSTRAINT `tasks_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `template_sections`;
CREATE TABLE `template_sections` (
  `id` varchar(50) NOT NULL,
  `template_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `fields` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `template_sections_template_id_idx` (`template_id`),
  CONSTRAINT `template_sections_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `product_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `template_sections` (`id`, `template_id`, `name`, `order`, `fields`) VALUES ('0f147baa-ad49-4103-9fca-2f28cb710ab6', 'b8a4c1c2-aa4d-4346-a036-67bbd702b294', 'Pricing', 2, '[{"name":"costPrice","label":"Purchase Price (₹)","type":"number","required":true,"placeholder":"e.g. 140"},{"name":"price","label":"Selling Price (₹)","type":"number","required":true,"placeholder":"e.g. 175"}]');
INSERT INTO `template_sections` (`id`, `template_id`, `name`, `order`, `fields`) VALUES ('63ac3bb5-5f5e-47d0-b9bf-b683b5aead87', 'b8a4c1c2-aa4d-4346-a036-67bbd702b294', 'Supplier Details', 4, '[{"name":"supplierName","label":"Supplier Partner","type":"select","required":true,"options":["Kirana Wholesale","Metro Cash & Carry","Local Distributor"]}]');
INSERT INTO `template_sections` (`id`, `template_id`, `name`, `order`, `fields`) VALUES ('77e74b05-c322-4eb4-85fe-a9e5e4d973d0', 'b8a4c1c2-aa4d-4346-a036-67bbd702b294', 'Inventory', 3, '[{"name":"stock","label":"Initial Shelf Stock","type":"number","required":true,"placeholder":"e.g. 20"},{"name":"minStock","label":"Minimum Safety Level","type":"number","required":true,"placeholder":"e.g. 5"}]');
INSERT INTO `template_sections` (`id`, `template_id`, `name`, `order`, `fields`) VALUES ('ff1664d1-8ade-425c-bf6d-ba6b6e4df65d', 'b8a4c1c2-aa4d-4346-a036-67bbd702b294', 'Basic Details', 1, '[{"name":"name","label":"Product Name","type":"text","required":true,"placeholder":"e.g. Fortune Mustard Oil (1L)"},{"name":"category","label":"Category","type":"select","required":true,"options":["Dairy","Snacks","Beverages","Household","Grocery"]},{"name":"barcode","label":"Barcode","type":"text","required":false,"placeholder":"Scan or enter barcode"},{"name":"unit","label":"Unit","type":"select","required":true,"options":["Kg","Gram","Litre","ml","Packet","Piece"]}]');

DROP TABLE IF EXISTS `unit_preferences`;
CREATE TABLE `unit_preferences` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `use_metric` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_preferences_business_id_key` (`business_id`),
  CONSTRAINT `unit_preferences_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` varchar(50) NOT NULL,
  `role_id` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `user_roles_role_id_fkey` (`role_id`),
  CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_roles` (`user_id`, `role_id`, `created_at`) VALUES ('2c46b3fa-57b8-4e91-b251-f002f6d89216', 'db72cc37-9ea9-42c9-b9fd-95c2eb6dd801', '2026-07-27 07:41:42');
INSERT INTO `user_roles` (`user_id`, `role_id`, `created_at`) VALUES ('603d5725-e9cd-4ecf-967c-ca6e578e0824', '92bd2378-d362-48b0-b5ba-51582ec778f7', '2026-07-27 07:41:42');
INSERT INTO `user_roles` (`user_id`, `role_id`, `created_at`) VALUES ('aa8f4eb0-a4a2-42e7-bb71-1d439623e3fd', 'daa327bb-2c48-46c0-b900-7ad2e5794364', '2026-07-27 07:41:42');
INSERT INTO `user_roles` (`user_id`, `role_id`, `created_at`) VALUES ('c3f87e99-833e-422e-a411-5a82a69e5695', '312afee4-d790-4c29-945e-0f207bc257b7', '2026-07-27 07:41:42');
INSERT INTO `user_roles` (`user_id`, `role_id`, `created_at`) VALUES ('dcd223ad-226f-45da-94e0-d3b5934ddbf6', 'b8395e25-532c-4c54-b91d-ab00f1d93b0a', '2026-07-27 09:03:18');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_business_id_idx` (`business_id`),
  CONSTRAINT `users_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `business_id`, `name`, `email`, `password_hash`, `phone`, `is_active`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`) VALUES ('2c46b3fa-57b8-4e91-b251-f002f6d89216', 'fresh-choice', 'Warehouse Staff', 'warehouse@quickbizs.com', '$2b$10$LGDbdS3pZGmhO/AWKp5LeeaEAne35vPPS8bG0RR8ZzE0BO3mm5y9e', NULL, 1, 0, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42');
INSERT INTO `users` (`id`, `business_id`, `name`, `email`, `password_hash`, `phone`, `is_active`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`) VALUES ('603d5725-e9cd-4ecf-967c-ca6e578e0824', 'fresh-choice', 'Owner Account', 'owner@quickbizs.com', '$2b$10$LGDbdS3pZGmhO/AWKp5LeeaEAne35vPPS8bG0RR8ZzE0BO3mm5y9e', NULL, 1, 0, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42');
INSERT INTO `users` (`id`, `business_id`, `name`, `email`, `password_hash`, `phone`, `is_active`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`) VALUES ('aa8f4eb0-a4a2-42e7-bb71-1d439623e3fd', 'fresh-choice', 'SaaS Admin', 'superadmin@quickbizs.com', '$2b$10$LGDbdS3pZGmhO/AWKp5LeeaEAne35vPPS8bG0RR8ZzE0BO3mm5y9e', NULL, 1, 0, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42');
INSERT INTO `users` (`id`, `business_id`, `name`, `email`, `password_hash`, `phone`, `is_active`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`) VALUES ('c3f87e99-833e-422e-a411-5a82a69e5695', 'fresh-choice', 'Cashier Terminal', 'cashier@quickbizs.com', '$2b$10$LGDbdS3pZGmhO/AWKp5LeeaEAne35vPPS8bG0RR8ZzE0BO3mm5y9e', NULL, 1, 0, NULL, '2026-07-27 07:41:42', '2026-07-27 07:41:42');
INSERT INTO `users` (`id`, `business_id`, `name`, `email`, `password_hash`, `phone`, `is_active`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`) VALUES ('dcd223ad-226f-45da-94e0-d3b5934ddbf6', 'c2242090-51ea-4b6b-82f0-68eb36768d0b', 'Rishi Dubey', 'mahaveer@gmail.com', '$2b$10$iB0nmG6cBDMvhSMooxFraupLDlwnhF5WPP7dbZAaGFTUIVOVHWurC', '+916378248689', 1, 0, NULL, '2026-07-27 09:03:18', '2026-07-27 09:03:18');

DROP TABLE IF EXISTS `variant_options`;
CREATE TABLE `variant_options` (
  `id` varchar(50) NOT NULL,
  `variant_type_id` varchar(50) NOT NULL,
  `value` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `variant_options_variant_type_id_idx` (`variant_type_id`),
  CONSTRAINT `variant_options_variant_type_id_fkey` FOREIGN KEY (`variant_type_id`) REFERENCES `variant_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `variant_types`;
CREATE TABLE `variant_types` (
  `id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `variant_types_product_id_idx` (`product_id`),
  CONSTRAINT `variant_types_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `warehouses`;
CREATE TABLE `warehouses` (
  `id` varchar(50) NOT NULL,
  `business_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `warehouses_business_id_idx` (`business_id`),
  CONSTRAINT `warehouses_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `warehouses` (`id`, `business_id`, `name`, `code`, `address`, `city`, `state`, `created_at`, `updated_at`) VALUES ('wh-main', 'fresh-choice', 'Main Warehouse Noida', 'WH-MAIN', 'Sector 62', 'Noida', 'Uttar Pradesh', '2026-07-27 07:41:42', '2026-07-27 07:41:42');

DROP TABLE IF EXISTS `weight_presets`;
CREATE TABLE `weight_presets` (
  `id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `label` varchar(20) NOT NULL,
  `value_in_kg` double NOT NULL,
  `sales_count` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `weight_presets_product_id_label_key` (`product_id`,`label`),
  CONSTRAINT `weight_presets_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

/*
  Warnings:

  - You are about to drop the column `role_target` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `role_target`,
    ADD COLUMN `module` VARCHAR(50) NOT NULL DEFAULT 'System',
    ADD COLUMN `priority` VARCHAR(20) NOT NULL DEFAULT 'Medium',
    ADD COLUMN `read_at` DATETIME(3) NULL,
    ADD COLUMN `reference_id` VARCHAR(50) NULL,
    ADD COLUMN `reference_type` VARCHAR(50) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `user_id` VARCHAR(50) NULL;

-- CreateIndex
CREATE INDEX `notifications_user_id_idx` ON `notifications`(`user_id`);

-- CreateIndex
CREATE INDEX `notifications_is_read_idx` ON `notifications`(`is_read`);

-- CreateIndex
CREATE INDEX `notifications_created_at_idx` ON `notifications`(`created_at`);

import { prisma } from "../config/prisma";
import { normalizeIdentifier } from "../utils/identifierUtils";

export class TrackingService {
  /**
   * Looks up a serial unit or IMEI across a business tenant.
   * Checks the normalized DeviceIdentifier table for instant O(1) resolution.
   */
  async lookupSerial(businessId: string, identifierValue: string) {
    const normalized = normalizeIdentifier(identifierValue);
    if (!normalized) return null;

    const identifierRecord = await prisma.deviceIdentifier.findUnique({
      where: {
        businessId_identifierValue: {
          businessId,
          identifierValue: normalized,
        },
      },
      include: {
        serial: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                trackingMode: true,
              },
            },
            saleHistory: {
              orderBy: { soldAt: "desc" },
              take: 5,
            },
          },
        },
      },
    });

    if (!identifierRecord) return null;
    return identifierRecord.serial;
  }

  /**
   * Returns active batches for a product sorted by First-Expired-First-Out (FEFO).
   * Filters out expired lots and lots with zero available stock.
   */
  async getFEFOBatches(businessId: string, productId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.productBatch.findMany({
      where: {
        businessId,
        productId,
        availableQuantity: { gt: 0 },
        status: { in: ["ACTIVE", "NEAR_EXPIRY"] },
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: today } },
        ],
      },
      orderBy: [
        { expiryDate: "asc" },
        { createdAt: "asc" },
      ],
    });
  }

  /**
   * Reconciles opening stock when migrating a product to SERIAL or BATCH tracking mode.
   * Guarantees transactional consistency between aggregate Inventory and unit records.
   */
  async reconcileOpeningStock(
    businessId: string,
    params: {
      productId: string;
      newTrackingMode: "SERIAL" | "BATCH";
      serials?: { serialNumber: string; imei1?: string; imei2?: string; costPrice?: number }[];
      batches?: { batchNumber: string; expiryDate?: Date; quantity: number; costPrice: number; salePrice: number; mrp?: number }[];
      performedBy?: string;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findFirst({
        where: { id: params.productId, businessId },
        include: { inventories: true },
      });

      if (!product) {
        throw new Error("Product record not found.");
      }

      const inventory = product.inventories[0];
      if (!inventory) {
        throw new Error("Inventory record not found for product.");
      }

      if (params.newTrackingMode === "SERIAL") {
        if (!params.serials || params.serials.length === 0) {
          throw new Error("At least one serial unit must be provided.");
        }

        const serialCount = params.serials.length;

        for (const item of params.serials) {
          const normSerial = normalizeIdentifier(item.serialNumber);
          const normImei1 = item.imei1 ? normalizeIdentifier(item.imei1) : null;
          const normImei2 = item.imei2 ? normalizeIdentifier(item.imei2) : null;

          // Create ProductSerial
          const serial = await tx.productSerial.create({
            data: {
              businessId,
              productId: params.productId,
              serialNumber: normSerial,
              imei1: normImei1,
              imei2: normImei2,
              status: "IN_STOCK",
              costPrice: item.costPrice || product.costPrice,
            },
          });

          // Register in DeviceIdentifier
          await tx.deviceIdentifier.create({
            data: {
              businessId,
              serialId: serial.id,
              identifierType: "SERIAL_NUMBER",
              identifierValue: normSerial,
            },
          });

          if (normImei1) {
            await tx.deviceIdentifier.create({
              data: {
                businessId,
                serialId: serial.id,
                identifierType: "IMEI1",
                identifierValue: normImei1,
              },
            });
          }

          if (normImei2) {
            await tx.deviceIdentifier.create({
              data: {
                businessId,
                serialId: serial.id,
                identifierType: "IMEI2",
                identifierValue: normImei2,
              },
            });
          }

          // Audit Log
          await tx.serialAuditLog.create({
            data: {
              businessId,
              serialId: serial.id,
              action: "OPENING_BALANCE",
              newStatus: "IN_STOCK",
              referenceType: "InventoryReconciliation",
              referenceId: inventory.id,
              performedBy: params.performedBy || "Admin",
              notes: "Initial serialized opening stock onboarding",
            },
          });
        }

        // Update Inventory & Product to match verified serialized count
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            availableQuantity: serialCount,
            untrackedQuantity: 0,
            lastUpdated: new Date(),
          },
        });

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: serialCount,
            trackingMode: "SERIAL",
          },
        });

        return { success: true, count: serialCount, trackingMode: "SERIAL" };
      }

      if (params.newTrackingMode === "BATCH") {
        if (!params.batches || params.batches.length === 0) {
          throw new Error("At least one batch lot must be provided.");
        }

        let totalBatchQuantity = 0;

        for (const lot of params.batches) {
          totalBatchQuantity += lot.quantity;

          const batch = await tx.productBatch.create({
            data: {
              businessId,
              productId: params.productId,
              batchNumber: lot.batchNumber.trim().toUpperCase(),
              expiryDate: lot.expiryDate ? new Date(lot.expiryDate) : null,
              initialQuantity: lot.quantity,
              availableQuantity: lot.quantity,
              costPrice: lot.costPrice || product.costPrice,
              salePrice: lot.salePrice || product.price,
              mrp: lot.mrp || product.price,
              status: "ACTIVE",
            },
          });

          // Append to BatchMovement ledger
          await tx.batchMovement.create({
            data: {
              businessId,
              batchId: batch.id,
              movementType: "OPENING_BALANCE",
              quantityDelta: lot.quantity,
              balanceAfter: lot.quantity,
              referenceType: "InventoryReconciliation",
              referenceId: inventory.id,
              performedBy: params.performedBy || "Admin",
              notes: "Initial multi-batch opening balance onboarding",
            },
          });
        }

        // Update Inventory & Product
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            availableQuantity: totalBatchQuantity,
            untrackedQuantity: 0,
            lastUpdated: new Date(),
          },
        });

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: totalBatchQuantity,
            trackingMode: "BATCH",
          },
        });

        return { success: true, count: totalBatchQuantity, trackingMode: "BATCH" };
      }

      throw new Error("Unsupported tracking mode.");
    });
  }
}

export const trackingService = new TrackingService();

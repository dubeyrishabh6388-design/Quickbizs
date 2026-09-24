import { prisma } from "../config/prisma";

export class QuantityEngine {
  async getUnitConfig(productId: string) {
    let config = await prisma.productUnit.findUnique({
      where: { productId },
    });

    if (!config) {
      // Auto-detect based on product category name or name
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      const category = (prod?.category || "").toLowerCase();
      const name = (prod?.name || "").toLowerCase();

      let type = "FixedQuantity";
      let unit = "pcs";

      if (category.includes("milk") || category.includes("lassi") || category.includes("drink") || name.includes("curd")) {
        type = "VolumeBased";
        unit = "L";
      } else if (category.includes("paneer") || category.includes("sweet") || category.includes("fruit") || category.includes("flour") || name.includes("ghee")) {
        type = "WeightBased";
        unit = "kg";
      } else if (category.includes("pipe") || category.includes("wire") || name.includes("wire")) {
        type = "LengthBased";
        unit = "m";
      }

      config = await prisma.productUnit.create({
        data: {
          productId,
          productType: type,
          defaultUnit: unit,
        },
      });
    }

    return config;
  }

  async getPresets(productId: string) {
    const config = await this.getUnitConfig(productId);
    const type = config.productType;

    if (type === "WeightBased") {
      let presets = await prisma.weightPreset.findMany({
        where: { productId },
        orderBy: { salesCount: "desc" },
      });

      if (presets.length === 0) {
        // Seed default weight presets
        const defaults = [
          { label: "100g", val: 0.1 },
          { label: "250g", val: 0.25 },
          { label: "500g", val: 0.5 },
          { label: "1kg", val: 1.0 },
          { label: "2kg", val: 2.0 },
        ];

        for (const d of defaults) {
          await prisma.weightPreset.create({
            data: { productId, label: d.label, valueInKg: d.val },
          });
        }

        presets = await prisma.weightPreset.findMany({
          where: { productId },
          orderBy: { salesCount: "desc" },
        });
      }

      return { type, presets };
    } else if (type === "VolumeBased") {
      let presets = await prisma.weightPreset.findMany({
        where: { productId },
        orderBy: { salesCount: "desc" },
      });

      if (presets.length === 0) {
        // Seed default volume presets (ml/L stored in valueInKg field for schema compatibility)
        const defaults = [
          { label: "500ml", val: 0.5 },
          { label: "1L", val: 1.0 },
          { label: "2L", val: 2.0 },
          { label: "5L", val: 5.0 },
        ];

        for (const d of defaults) {
          await prisma.weightPreset.create({
            data: { productId, label: d.label, valueInKg: d.val },
          });
        }

        presets = await prisma.weightPreset.findMany({
          where: { productId },
          orderBy: { salesCount: "desc" },
        });
      }

      return { type, presets };
    } else {
      let presets = await prisma.quantityPreset.findMany({
        where: { productId },
        orderBy: { salesCount: "desc" },
      });

      if (presets.length === 0) {
        // Seed default quantity/length presets
        const defaults = [
          { label: "×1", val: 1.0 },
          { label: "×2", val: 2.0 },
          { label: "×5", val: 5.0 },
          { label: "×10", val: 10.0 },
        ];

        for (const d of defaults) {
          await prisma.quantityPreset.create({
            data: { productId, label: d.label, value: d.val },
          });
        }

        presets = await prisma.quantityPreset.findMany({
          where: { productId },
          orderBy: { salesCount: "desc" },
        });
      }

      return { type, presets };
    }
  }

  async recordPresetUsage(productId: string, label: string, type: string) {
    if (type === "WeightBased" || type === "VolumeBased") {
      await prisma.weightPreset.updateMany({
        where: { productId, label },
        data: { salesCount: { increment: 1 } },
      });
    } else {
      await prisma.quantityPreset.updateMany({
        where: { productId, label },
        data: { salesCount: { increment: 1 } },
      });
    }
  }
}

import { prisma } from "../config/prisma";

export class ProductAttributeService {
  async saveAttributes(productId: string, attributes: Record<string, string>): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: {
        customFields: JSON.stringify(attributes),
      },
    });
  }

  async getAttributes(productId: string): Promise<Record<string, string>> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { customFields: true },
    });

    if (!product || !product.customFields) return {};
    try {
      return JSON.parse(product.customFields);
    } catch {
      return {};
    }
  }
}
export const productAttributeService = new ProductAttributeService();

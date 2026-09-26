import { ProductRepository } from "../repositories/productRepository";
import { prisma } from "../config/prisma";
import { productAttributeService } from "./productAttributeService";

const productRepository = new ProductRepository();

export class ProductService {
  async getProducts(params: {
    businessId: string;
    search?: string;
    category?: string;
    brand?: string;
    sku?: string;
    barcode?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [products, total] = await Promise.all([
      productRepository.findMany({
        businessId: params.businessId,
        search: params.search,
        category: params.category,
        brand: params.brand,
        sku: params.sku,
        barcode: params.barcode,
        skip,
        take,
      }),
      productRepository.count({
        businessId: params.businessId,
        search: params.search,
        category: params.category,
        brand: params.brand,
        sku: params.sku,
        barcode: params.barcode,
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getProductById(businessId: string, id: string) {
    const product = await productRepository.findById(businessId, id);
    if (!product) {
      const err: any = new Error("Product card not found.");
      err.statusCode = 404;
      err.problem = "Search index query failed.";
      err.reason = "No product details match the requested identifier.";
      err.solution = "Please double check the ID or scan a different barcode.";
      throw err;
    }
    return product;
  }

  async createProduct(
    businessId: string,
    data: {
      name: string;
      category: string;
      price: number;
      costPrice: number;
      stock: number;
      minStock: number;
      supplierName: string;
      barcode?: string;
      customFields?: string;
      // Extended fields
      sku?: string;
      subCategory?: string;
      brand?: string;
      unit?: string;
      unitType?: string;
      tax?: number;
      description?: string;
      keywords?: string;
      productStatus?: string;
      categoryId?: string;
      images?: Array<{ url: string; thumbnail?: string; orderIndex?: number }>;
    }
  ) {
    // 1. Validation (Step 6: Product Validation)
    if (!data.name) {
      const err: any = new Error("Product name is required.");
      err.statusCode = 400;
      throw err;
    }

    if (data.price < 0 || data.costPrice < 0) {
      const err: any = new Error("Pricing cannot be negative.");
      err.statusCode = 400;
      err.problem = "Pricing limits validation failed.";
      err.reason = "Sales price and cost price must be non-negative numbers.";
      throw err;
    }

    if (data.stock < 0 || data.minStock < 0) {
      const err: any = new Error("Invalid inventory counts.");
      err.statusCode = 400;
      err.problem = "Stock limits validation failed.";
      err.reason = "Stock levels cannot be negative numbers.";
      throw err;
    }

    // Check SaaS plan limit validation
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      const err: any = new Error("Business ownership validation failed.");
      err.statusCode = 400;
      throw err;
    }

    const currentProductsCount = await prisma.product.count({
      where: { businessId, isDeleted: false },
    });
    if (currentProductsCount >= business.maxProducts) {
      const err: any = new Error("Subscription limit reached.");
      err.statusCode = 400;
      err.problem = "SaaS Limit Validation Failed.";
      err.reason = `Your business has reached the maximum allowed limit of ${business.maxProducts} products.`;
      throw err;
    }

    const cleanData = {
      ...data,
      barcode: data.barcode && data.barcode.trim() !== "" ? data.barcode.trim() : undefined,
      sku: data.sku && data.sku.trim() !== "" ? data.sku.trim() : undefined,
      categoryId: data.categoryId && data.categoryId.trim() !== "" ? data.categoryId.trim() : undefined,
    };

    // Check Barcode duplicate
    if (cleanData.barcode) {
      const existing = await productRepository.findByBarcode(businessId, cleanData.barcode);
      if (existing) {
        const err: any = new Error("Product barcode already exists.");
        err.statusCode = 400;
        err.problem = "Duplicate barcode registration.";
        throw err;
      }
    }

    // Check SKU duplicate
    if (cleanData.sku) {
      const existing = await productRepository.findBySku(businessId, cleanData.sku);
      if (existing) {
        const err: any = new Error("Product SKU already exists.");
        err.statusCode = 400;
        err.problem = "Duplicate SKU registration.";
        throw err;
      }
    }

    // Validate images payload format (Step 5: Product Images)
    if (data.images) {
      if (!Array.isArray(data.images)) {
        const err: any = new Error("Images must be an array.");
        err.statusCode = 400;
        throw err;
      }
      for (const img of data.images) {
        if (!img.url || typeof img.url !== "string" || !img.url.startsWith("http")) {
          const err: any = new Error("Invalid image URL format.");
          err.statusCode = 400;
          throw err;
        }
      }
    }

    const product = await productRepository.create(businessId, cleanData);

    if (data.customFields) {
      try {
        const parsed = JSON.parse(data.customFields);
        await productAttributeService.saveAttributes(product.id, parsed);
      } catch (err) {
        console.error("Failed to parse custom attributes in createProduct:", err);
      }
    }

    // Create corresponding Inventory card
    const inventory = await prisma.inventory.create({
      data: {
        businessId,
        productId: product.id,
        availableQuantity: data.stock,
        minimumStock: data.minStock,
        maximumStock: 100,
        reorderLevel: data.minStock + 5,
      },
    });

    // Create initial Stock Movement record
    await prisma.stockMovement.create({
      data: {
        businessId,
        productId: product.id,
        inventoryId: inventory.id,
        referenceType: "Opening Stock",
        movementType: "IN",
        quantity: data.stock,
        openingStock: 0,
        closingStock: data.stock,
        reason: "Initial ledger entry during product creation",
        createdBy: "owner@quickbizs.com",
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "PRODUCT_CREATED",
        module: "Inventory",
        status: "Success",
        reason: `Added product "${product.name}" with initial stock ${product.stock}`,
      },
    });

    return product;
  }

  async updateProduct(
    businessId: string,
    id: string,
    data: {
      name?: string;
      category?: string;
      price?: number;
      costPrice?: number;
      stock?: number;
      minStock?: number;
      supplierName?: string;
      barcode?: string;
      customFields?: string;
      // Extended fields
      sku?: string;
      subCategory?: string;
      brand?: string;
      unit?: string;
      unitType?: string;
      tax?: number;
      description?: string;
      keywords?: string;
      productStatus?: string;
      categoryId?: string;
      images?: Array<{ url: string; thumbnail?: string; orderIndex?: number }>;
    }
  ) {
    const existing = await productRepository.findById(businessId, id);
    if (!existing) {
      const err: any = new Error("Product card not found.");
      err.statusCode = 404;
      throw err;
    }

    // Validation checks
    if (data.price !== undefined && data.price < 0) {
      const err: any = new Error("Pricing must be non-negative.");
      err.statusCode = 400;
      throw err;
    }

    if (data.stock !== undefined && data.stock < 0) {
      const err: any = new Error("Stock count cannot be negative.");
      err.statusCode = 400;
      throw err;
    }

    // Check Barcode duplicate
    if (data.barcode && data.barcode !== existing.barcode) {
      const isDuplicate = await productRepository.findByBarcode(businessId, data.barcode);
      if (isDuplicate) {
        const err: any = new Error("Product barcode already exists.");
        err.statusCode = 400;
        throw err;
      }
    }

    // Check SKU duplicate
    if (data.sku && data.sku !== existing.sku) {
      const isDuplicate = await productRepository.findBySku(businessId, data.sku);
      if (isDuplicate) {
        const err: any = new Error("Product SKU already exists.");
        err.statusCode = 400;
        throw err;
      }
    }

    // Validate images
    if (data.images) {
      if (!Array.isArray(data.images)) {
        const err: any = new Error("Images must be an array.");
        err.statusCode = 400;
        throw err;
      }
      for (const img of data.images) {
        if (!img.url || typeof img.url !== "string" || !img.url.startsWith("http")) {
          const err: any = new Error("Invalid image URL format.");
          err.statusCode = 400;
          throw err;
        }
      }
    }

    const updated = await productRepository.update(businessId, id, data);

    if (data.customFields) {
      try {
        const parsed = JSON.parse(data.customFields);
        await productAttributeService.saveAttributes(id, parsed);
      } catch (err) {
        console.error("Failed to parse custom attributes in updateProduct:", err);
      }
    }

    // Log update
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "PRODUCT_UPDATED",
        module: "Inventory",
        status: "Success",
        reason: `Modified details for product "${updated?.name}"`,
      },
    });

    return updated;
  }

  async deleteProduct(businessId: string, id: string) {
    const existing = await productRepository.findById(businessId, id);
    if (!existing) {
      const err: any = new Error("Product card not found.");
      err.statusCode = 404;
      throw err;
    }

    await productRepository.delete(businessId, id);

    // Log deletion
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "PRODUCT_DELETED",
        module: "Inventory",
        status: "Success",
        reason: `Soft deleted product "${existing.name}"`,
      },
    });

    return { success: true, message: "Product archived successfully." };
  }

  async restoreProduct(businessId: string, id: string) {
    const product = await productRepository.restore(businessId, id);
    if (!product) {
      const err: any = new Error("Product not found or failed to restore.");
      err.statusCode = 404;
      throw err;
    }
    return product;
  }

  async bulkUpdateProducts(businessId: string, ids: string[], data: any) {
    if (!Array.isArray(ids) || ids.length === 0) {
      const err: any = new Error("Invalid or empty list of product IDs.");
      err.statusCode = 400;
      throw err;
    }

    // Validate parameters to prevent injection or invalid fields
    const validFields = ["brand", "category", "price", "unit", "productStatus"];
    const updateData: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (validFields.includes(key)) {
        updateData[key] = val;
      }
    }

    if (Object.keys(updateData).length === 0) {
      const err: any = new Error("No valid fields provided for bulk update.");
      err.statusCode = 400;
      throw err;
    }

    return productRepository.bulkUpdate(businessId, ids, updateData);
  }

  // --- Category Service Operations ---
  async getCategories(businessId: string) {
    return productRepository.findCategories(businessId);
  }

  async createCategory(
    businessId: string,
    data: {
      name: string;
      parentId?: string;
      orderIndex?: number;
    }
  ) {
    if (!data.name) {
      const err: any = new Error("Category name is required.");
      err.statusCode = 400;
      throw err;
    }

    // Check duplicates
    const existing = await productRepository.findCategoryByName(businessId, data.name);
    if (existing) {
      const err: any = new Error("Category name already exists in this store.");
      err.statusCode = 409;
      throw err;
    }

    // Check parent category exists
    if (data.parentId) {
      const parent = await productRepository.findCategoryById(data.parentId);
      if (!parent || parent.businessId !== businessId) {
        const err: any = new Error("Parent category not found.");
        err.statusCode = 400;
        throw err;
      }
    }

    return productRepository.createCategory({
      businessId,
      name: data.name,
      parentId: data.parentId,
      orderIndex: data.orderIndex || 0,
    });
  }

  async updateCategory(
    businessId: string,
    id: string,
    data: {
      name?: string;
      parentId?: string;
      orderIndex?: number;
    }
  ) {
    const existing = await productRepository.findCategoryById(id);
    if (!existing || existing.businessId !== businessId) {
      const err: any = new Error("Category not found.");
      err.statusCode = 404;
      throw err;
    }

    if (data.parentId) {
      if (data.parentId === id) {
        const err: any = new Error("Category cannot be its own parent.");
        err.statusCode = 400;
        throw err;
      }
      const parent = await productRepository.findCategoryById(data.parentId);
      if (!parent || parent.businessId !== businessId) {
        const err: any = new Error("Parent category not found.");
        err.statusCode = 400;
        throw err;
      }
    }

    return productRepository.updateCategory(id, data);
  }

  async deleteCategory(businessId: string, id: string) {
    const existing = await productRepository.findCategoryById(id);
    if (!existing || existing.businessId !== businessId) {
      const err: any = new Error("Category not found.");
      err.statusCode = 404;
      throw err;
    }

    // Guard: Prevent deletion if children exist
    if (existing.children && existing.children.length > 0) {
      const err: any = new Error("Cannot delete category containing child categories.");
      err.statusCode = 400;
      throw err;
    }

    await productRepository.deleteCategory(id);
    return { success: true, message: "Category deleted successfully." };
  }
}

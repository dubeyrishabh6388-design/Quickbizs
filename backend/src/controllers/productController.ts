import { Response, NextFunction } from "express";
import { ProductService } from "../services/productService";
import { AuthenticatedRequest } from "../middlewares/auth";

const productService = new ProductService();

export class ProductController {
  async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let businessId = req.user!.tenantId as string;
      if (!businessId && req.query.businessId) {
        businessId = String(req.query.businessId);
      }
      const { search, category, brand, sku, barcode, page, limit } = req.query;

      const result = await productService.getProducts({
        businessId,
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
        brand: brand ? String(brand) : undefined,
        sku: sku ? String(sku) : undefined,
        barcode: barcode ? String(barcode) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 50,
      });

      res.json({
        success: true,
        message: "Products catalog retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;

      const result = await productService.getProductById(businessId, id);

      res.json({
        success: true,
        message: "Product detail retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const {
        name,
        category,
        price,
        costPrice,
        stock,
        minStock,
        supplierName,
        barcode,
        customFields,
        sku,
        subCategory,
        brand,
        unit,
        unitType,
        tax,
        description,
        keywords,
        productStatus,
        categoryId,
        images,
      } = req.body;

      if (!name || !category || price === undefined || costPrice === undefined || stock === undefined || minStock === undefined || !supplierName) {
        const err: any = new Error("Required product parameters missing.");
        err.statusCode = 400;
        err.problem = "Input validation failed.";
        err.reason = "Product name, category, price, costPrice, stock, minStock, and supplierName are mandatory.";
        throw err;
      }

      const result = await productService.createProduct(businessId, {
        name,
        category,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
        stock: parseInt(stock, 10),
        minStock: parseInt(minStock, 10),
        supplierName,
        barcode: barcode || undefined,
        customFields: customFields || undefined,
        sku: sku || undefined,
        subCategory: subCategory || undefined,
        brand: brand || undefined,
        unit: unit || undefined,
        unitType: unitType || undefined,
        tax: tax !== undefined ? parseFloat(tax) : 0,
        description: description || undefined,
        keywords: keywords || undefined,
        productStatus: productStatus || undefined,
        categoryId: categoryId || undefined,
        images: images || undefined,
      });

      res.status(201).json({
        success: true,
        message: "Product card created successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;

      const result = await productService.updateProduct(businessId, id, req.body);

      res.json({
        success: true,
        message: "Product card details updated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;

      const result = await productService.deleteProduct(businessId, id);

      res.json({
        success: true,
        message: "Product soft deleted and archived successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;

      const result = await productService.restoreProduct(businessId, id);

      res.json({
        success: true,
        message: "Product restored successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { ids, data } = req.body;

      await productService.bulkUpdateProducts(businessId, ids, data);

      res.json({
        success: true,
        message: "Products updated in bulk successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Category Handlers ---
  async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const categories = await productService.getCategories(businessId);

      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { name, parentId, orderIndex } = req.body;

      const category = await productService.createCategory(businessId, {
        name,
        parentId,
        orderIndex,
      });

      res.status(201).json({
        success: true,
        message: "Category created successfully.",
        data: category,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;
      const { name, parentId, orderIndex } = req.body;

      const category = await productService.updateCategory(businessId, id, {
        name,
        parentId,
        orderIndex,
      });

      res.json({
        success: true,
        message: "Category updated successfully.",
        data: category,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;

      const result = await productService.deleteCategory(businessId, id);

      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

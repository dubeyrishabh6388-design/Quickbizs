import fs from "fs";
import path from "path";
import { prisma } from "../config/prisma";

export interface BusinessCategoryItem {
  id: string;
  label: string;
  desc: string;
  icon: string;
  defaultCategories: string[];
  isCustom?: boolean;
  storeCount?: number;
}

const dataFilePath = path.join(__dirname, "../data/businessCategories.json");

export class BusinessCategoryService {
  private loadRawCategories(): BusinessCategoryItem[] {
    try {
      if (fs.existsSync(dataFilePath)) {
        const content = fs.readFileSync(dataFilePath, "utf8");
        return JSON.parse(content);
      }
    } catch (err) {
      console.error("Error reading businessCategories.json:", err);
    }
    return [];
  }

  private saveRawCategories(items: BusinessCategoryItem[]): void {
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(items, null, 2), "utf8");
    } catch (err) {
      console.error("Error writing businessCategories.json:", err);
    }
  }

  async getAllCategories(search?: string): Promise<BusinessCategoryItem[]> {
    const items = this.loadRawCategories();

    // Query store counts from DB
    const storeCounts = await prisma.business.groupBy({
      by: ["businessType"],
      _count: { id: true },
      where: { isDeleted: false },
    });

    const countMap = new Map<string, number>();
    for (const sc of storeCounts) {
      if (sc.businessType) {
        countMap.set(sc.businessType.toLowerCase(), sc._count.id);
      }
    }

    let enriched = items.map((cat) => {
      // Find matching count by id or label
      const count =
        countMap.get(cat.id.toLowerCase()) ||
        countMap.get(cat.label.toLowerCase()) ||
        0;
      return {
        ...cat,
        storeCount: count,
      };
    });

    if (search && search.trim()) {
      const q = search.toLowerCase();
      enriched = enriched.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    return enriched;
  }

  async addCategory(data: {
    label: string;
    desc: string;
    icon?: string;
    defaultCategories?: string[];
  }): Promise<BusinessCategoryItem> {
    const items = this.loadRawCategories();

    const labelClean = data.label.trim();
    if (!labelClean) {
      const err: any = new Error("Category title is required.");
      err.statusCode = 400;
      throw err;
    }

    // Check duplicate
    const exists = items.some(
      (c) => c.label.toLowerCase() === labelClean.toLowerCase()
    );
    if (exists) {
      const err: any = new Error(`Category "${labelClean}" already exists.`);
      err.statusCode = 400;
      throw err;
    }

    const id = labelClean.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();

    const newCategory: BusinessCategoryItem = {
      id,
      label: labelClean,
      desc: data.desc?.trim() || "Retail & Trade Category",
      icon: data.icon || "Store",
      defaultCategories:
        data.defaultCategories && data.defaultCategories.length > 0
          ? data.defaultCategories
          : ["General Items", "Fast Moving", "Featured Items"],
      isCustom: true,
      storeCount: 0,
    };

    items.push(newCategory);
    this.saveRawCategories(items);

    return newCategory;
  }

  async updateCategory(
    id: string,
    data: {
      label?: string;
      desc?: string;
      icon?: string;
      defaultCategories?: string[];
    }
  ): Promise<BusinessCategoryItem> {
    const items = this.loadRawCategories();
    const index = items.findIndex(
      (c) => c.id === id || c.label.toLowerCase() === id.toLowerCase()
    );

    if (index === -1) {
      const err: any = new Error("Business category not found.");
      err.statusCode = 404;
      throw err;
    }

    const existing = items[index];
    if (data.label) existing.label = data.label.trim();
    if (data.desc) existing.desc = data.desc.trim();
    if (data.icon) existing.icon = data.icon;
    if (data.defaultCategories) existing.defaultCategories = data.defaultCategories;

    items[index] = existing;
    this.saveRawCategories(items);

    return existing;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    let items = this.loadRawCategories();
    const target = items.find(
      (c) => c.id === id || c.label.toLowerCase() === id.toLowerCase()
    );

    if (!target) {
      const err: any = new Error("Business category not found.");
      err.statusCode = 404;
      throw err;
    }

    items = items.filter((c) => c.id !== target.id);
    this.saveRawCategories(items);

    return {
      success: true,
      message: `Business Category "${target.label}" removed.`,
    };
  }
}

export const businessCategoryService = new BusinessCategoryService();

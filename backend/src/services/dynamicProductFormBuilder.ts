import { prisma } from "../config/prisma";
import { dynamicProductTemplateService, DynamicFormConfig } from "./dynamicProductTemplateService";

export class BusinessTemplateResolver {
  async resolveType(businessId: string): Promise<string> {
    const preference = await prisma.businessPreference.findUnique({
      where: { businessId }
    });
    return preference ? preference.businessType : "Grocery Store";
  }
}
export const businessTemplateResolver = new BusinessTemplateResolver();

// Memory cache dictionary for dynamic layouts (<100ms load time)
const formLayoutCache: Record<string, DynamicFormConfig> = {};

export class DynamicProductFormBuilder {
  async buildForm(businessId: string): Promise<DynamicFormConfig> {
    const businessType = await businessTemplateResolver.resolveType(businessId);
    
    // Check in-memory cache for ultra-fast resolves (<100ms)
    if (formLayoutCache[businessType]) {
      return formLayoutCache[businessType];
    }

    const layout = await dynamicProductTemplateService.getTemplate(businessType);
    
    // Store cache
    formLayoutCache[businessType] = layout;
    return layout;
  }

  clearCache(businessType: string) {
    delete formLayoutCache[businessType];
  }
}
export const dynamicProductFormBuilder = new DynamicProductFormBuilder();

import { prisma } from "../config/prisma";

export class SettingsRepository {
  async findSettings(businessId: string) {
    let settings = await prisma.businessSetting.findFirst({
      where: { businessId },
    });

    if (!settings) {
      settings = await prisma.businessSetting.create({
        data: {
          businessId,
          companyName: "QuickBizs Retail",
          invoicePrefix: "INV",
          gstEnabled: true,
          discountEnabled: true,
          roundOffEnabled: true,
        },
      });
    }

    return settings;
  }

  async updateSettings(businessId: string, data: any) {
    const existing = await this.findSettings(businessId);

    return prisma.businessSetting.update({
      where: { id: existing.id },
      data: {
        companyName: data.companyName !== undefined ? data.companyName : existing.companyName,
        gstNumber: data.gstNumber !== undefined ? data.gstNumber : existing.gstNumber,
        panNumber: data.panNumber !== undefined ? data.panNumber : existing.panNumber,
        address: data.address !== undefined ? data.address : existing.address,
        phone: data.phone !== undefined ? data.phone : existing.phone,
        invoicePrefix: data.invoicePrefix !== undefined ? data.invoicePrefix : existing.invoicePrefix,
        invoiceFooter: data.invoiceFooter !== undefined ? data.invoiceFooter : existing.invoiceFooter,
        gstEnabled: data.gstEnabled !== undefined ? data.gstEnabled : existing.gstEnabled,
        discountEnabled: data.discountEnabled !== undefined ? data.discountEnabled : existing.discountEnabled,
        roundOffEnabled: data.roundOffEnabled !== undefined ? data.roundOffEnabled : existing.roundOffEnabled,
        timezone: data.timezone !== undefined ? data.timezone : existing.timezone,
        currency: data.currency !== undefined ? data.currency : existing.currency,
      },
    });
  }
}

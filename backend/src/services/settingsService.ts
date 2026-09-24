import { SettingsRepository } from "../repositories/settingsRepository";

const settingsRepository = new SettingsRepository();

export class SettingsService {
  async getSettings(businessId: string) {
    return settingsRepository.findSettings(businessId);
  }

  async updateSettings(businessId: string, data: any) {
    // 1. Perform configuration constraints checks (Step 12: Validation)
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      const err: any = new Error("Invalid email format.");
      err.statusCode = 400;
      throw err;
    }
    if (data.phone && !/^\+?[0-9\s\-()]{7,20}$/.test(data.phone)) {
      const err: any = new Error("Invalid phone number format.");
      err.statusCode = 400;
      throw err;
    }
    if (data.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstNumber)) {
      const err: any = new Error("Invalid GST registration number format.");
      err.statusCode = 400;
      throw err;
    }

    return settingsRepository.updateSettings(businessId, data);
  }
}

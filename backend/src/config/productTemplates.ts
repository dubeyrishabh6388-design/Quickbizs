export interface ProductFieldSpec {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "boolean";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface DynamicProductSchema {
  businessType: string;
  categories: string[];
  units?: string[];
  fields: ProductFieldSpec[];
}

export const PRODUCT_SCHEMAS: Record<string, DynamicProductSchema> = {
  "Grocery Store": {
    businessType: "Grocery Store",
    categories: ["Dairy", "Snacks", "Grocery", "Drinks", "Household", "Personal Care"],
    units: ["Kg", "Gram", "Litre", "ml", "Packet", "Piece"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Nestle" },
      { name: "unit", label: "Unit Type", type: "select", required: true, options: ["Kg", "Gram", "Litre", "ml", "Packet", "Piece"] }
    ]
  },
  "Clothing Store": {
    businessType: "Clothing Store",
    categories: ["Men", "Women", "Kids", "Accessories"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Levi's" },
      { name: "size", label: "Size", type: "select", required: true, options: ["XS", "S", "M", "L", "XL", "XXL"] },
      { name: "color", label: "Color", type: "select", required: true, options: ["Black", "White", "Red", "Blue", "Green"] },
      { name: "fabric", label: "Fabric", type: "text", required: false, placeholder: "e.g. 100% Cotton" },
      { name: "gender", label: "Gender Type", type: "select", required: true, options: ["Men", "Women", "Kids", "Unisex"] },
      { name: "season", label: "Seasonality", type: "text", required: false, placeholder: "e.g. Summer 2026" },
      { name: "sku", label: "SKU Identifier", type: "text", required: true, placeholder: "e.g. AP-TSH-01" }
    ]
  },
  "Pharmacy": {
    businessType: "Pharmacy",
    categories: ["Tablet", "Syrup", "Injection", "Cream", "Capsule"],
    fields: [
      { name: "genericName", label: "Generic Name", type: "text", required: true, placeholder: "e.g. Paracetamol" },
      { name: "company", label: "Manufacture Company", type: "text", required: true, placeholder: "e.g. Cipla" },
      { name: "batchNumber", label: "Batch Number", type: "text", required: true, placeholder: "e.g. BT-908" },
      { name: "expiryDate", label: "Expiry Date", type: "date", required: true },
      { name: "mfgDate", label: "Manufacture Date", type: "date", required: false },
      { name: "prescriptionRequired", label: "Prescription Check?", type: "boolean", required: true },
      { name: "dosage", label: "Dosage / Strength", type: "text", required: true, placeholder: "e.g. 500mg" },
      { name: "composition", label: "Chemical Composition", type: "text", required: false, placeholder: "e.g. Active Salicylic" }
    ]
  },
  "Electronics Store": {
    businessType: "Electronics Store",
    categories: ["Mobile Devices", "Laptops", "Accessories", "Appliances"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Sony" },
      { name: "modelNumber", label: "Model Number", type: "text", required: true, placeholder: "e.g. WH-1000XM4" },
      { name: "warranty", label: "Warranty Period", type: "text", required: true, placeholder: "e.g. 1 Year Domestic" },
      { name: "serialNumber", label: "Serial Number", type: "text", required: true, placeholder: "e.g. SN-8902" },
      { name: "voltage", label: "Voltage Input", type: "text", required: false, placeholder: "e.g. 220V AC" },
      { name: "color", label: "Color", type: "text", required: false, placeholder: "e.g. Space Gray" }
    ]
  },
  "Mobile Shop": {
    businessType: "Mobile Shop",
    categories: ["Smartphones", "Chargers", "Headphones", "Cases"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Apple" },
      { name: "modelNumber", label: "Model Name", type: "text", required: true, placeholder: "e.g. iPhone 15 Pro" },
      { name: "imei", label: "IMEI Serial Code", type: "text", required: true, placeholder: "e.g. 359082..." },
      { name: "ram", label: "RAM Capacity", type: "select", required: true, options: ["4GB", "6GB", "8GB", "12GB", "16GB"] },
      { name: "storage", label: "Storage Size", type: "select", required: true, options: ["64GB", "128GB", "256GB", "512GB", "1TB"] },
      { name: "processor", label: "Chipset Processor", type: "text", required: false, placeholder: "e.g. A17 Pro Bionic" },
      { name: "warranty", label: "Warranty Status", type: "text", required: true, placeholder: "e.g. 12 Months Brand" },
      { name: "color", label: "Color Option", type: "text", required: false, placeholder: "e.g. Titanium" }
    ]
  },
  "Furniture Store": {
    businessType: "Furniture Store",
    categories: ["Living Room", "Bedroom", "Office", "Outdoor"],
    fields: [
      { name: "material", label: "Wood / Fabric Material", type: "text", required: true, placeholder: "e.g. Teak Wood" },
      { name: "dimensions", label: "Dimensions (LxWxH)", type: "text", required: true, placeholder: "e.g. 6x3x4 feet" },
      { name: "weight", label: "Product Weight", type: "text", required: false, placeholder: "e.g. 45 Kg" },
      { name: "finish", label: "Gloss Finish Coating", type: "text", required: false, placeholder: "e.g. Matte Walnut" },
      { name: "color", label: "Color Theme", type: "text", required: false, placeholder: "e.g. Mahogany" }
    ]
  },
  "Restaurant": {
    businessType: "Restaurant",
    categories: ["Starters", "Mains", "Desserts", "Beverages"],
    fields: [
      { name: "prepTime", label: "Prep Time (Mins)", type: "number", required: true, placeholder: "e.g. 15" },
      { name: "foodType", label: "Veg / Non-Veg", type: "select", required: true, options: ["Veg", "Non-Veg", "Eggitarian"] },
      { name: "spiceLevel", label: "Spice Severity", type: "select", required: true, options: ["Mild", "Medium", "Hot", "Extra Hot"] }
    ]
  },
  "Jewellery Shop": {
    businessType: "Jewellery Shop",
    categories: ["Gold", "Silver", "Diamond", "Platinum"],
    fields: [
      { name: "metalType", label: "Metal Base Type", type: "select", required: true, options: ["Gold", "Silver", "Platinum", "White Gold"] },
      { name: "weight", label: "Net Weight (Grams)", type: "number", required: true, placeholder: "e.g. 8.5" },
      { name: "purity", label: "Metal Purity Carat", type: "select", required: true, options: ["18K", "22K", "24K", "925 Silver"] },
      { name: "stoneType", label: "Stone Studded Type", type: "text", required: false, placeholder: "e.g. Solitaire Diamond" },
      { name: "hallmark", label: "Hallmark Number (HUID)", type: "text", required: true, placeholder: "e.g. HUID-8902" }
    ]
  },
  "Hardware Store": {
    businessType: "Hardware Store",
    categories: ["Tools", "Fasteners", "Paints", "Electricals"],
    fields: [
      { name: "brand", label: "Brand Partner", type: "text", required: true, placeholder: "e.g. Bosch" },
      { name: "weight", label: "Unit Weight", type: "text", required: false, placeholder: "e.g. 2.4 Kg" },
      { name: "size", label: "Spec Size / Width", type: "text", required: true, placeholder: "e.g. M12 / 10mm" },
      { name: "material", label: "Steel Material Grade", type: "text", required: false, placeholder: "e.g. Stainless Steel 304" },
      { name: "sku", label: "SKU Serial", type: "text", required: false, placeholder: "e.g. HW-M12-10" }
    ]
  },
  "Cosmetics Shop": {
    businessType: "Cosmetics Shop",
    categories: ["Makeup", "Skin Care", "Hair Care", "Fragrances"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. L'Oreal" },
      { name: "shade", label: "Shade Code / Name", type: "text", required: false, placeholder: "e.g. Ruby Red 04" },
      { name: "skinType", label: "Skin Condition Suit", type: "select", required: true, options: ["All Types", "Dry Skin", "Oily Skin", "Sensitive"] },
      { name: "expiryDate", label: "Best Before Expiry", type: "date", required: true }
    ]
  },
  "Custom Business": {
    businessType: "Custom Business",
    categories: ["General Items", "Misc Goods"],
    fields: [
      { name: "brand", label: "Brand Name", type: "text", required: false, placeholder: "e.g. Generic" }
    ]
  }
};

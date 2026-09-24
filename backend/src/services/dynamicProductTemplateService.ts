export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "boolean";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormSection {
  name: string;
  order: number;
  fields: FormField[];
}

export interface DynamicFormConfig {
  businessType: string;
  sections: FormSection[];
}

export const PRESET_TEMPLATES: Record<string, DynamicFormConfig> = {
  "Grocery Store": {
    businessType: "Grocery Store",
    sections: [
      {
        name: "Basic Details",
        order: 1,
        fields: [
          { name: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. Fortune Mustard Oil (1L)" },
          { name: "category", label: "Category", type: "select", required: true, options: ["Dairy", "Snacks", "Beverages", "Household", "Grocery"] },
          { name: "barcode", label: "Barcode", type: "text", required: false, placeholder: "Scan or enter barcode" },
          { name: "unit", label: "Unit", type: "select", required: true, options: ["Kg", "Gram", "Litre", "ml", "Packet", "Piece"] }
        ]
      },
      {
        name: "Pricing",
        order: 2,
        fields: [
          { name: "costPrice", label: "Purchase Price (₹)", type: "number", required: true, placeholder: "e.g. 140" },
          { name: "price", label: "Selling Price (₹)", type: "number", required: true, placeholder: "e.g. 175" }
        ]
      },
      {
        name: "Inventory",
        order: 3,
        fields: [
          { name: "stock", label: "Initial Shelf Stock", type: "number", required: true, placeholder: "e.g. 20" },
          { name: "minStock", label: "Minimum Safety Level", type: "number", required: true, placeholder: "e.g. 5" }
        ]
      },
      {
        name: "Supplier Details",
        order: 4,
        fields: [
          { name: "supplierName", label: "Supplier Partner", type: "select", required: true, options: ["Kirana Wholesale", "Metro Cash & Carry", "Local Distributor"] }
        ]
      }
    ]
  },
  "Clothing Store": {
    businessType: "Clothing Store",
    sections: [
      {
        name: "SECTION 1: Basic Product",
        order: 1,
        fields: [
          { name: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. Classic Denim Jacket" },
          { name: "brand", label: "Brand Name", type: "text", required: true, placeholder: "e.g. Levi's" },
          { name: "collectionName", label: "Collection Name", type: "text", required: false, placeholder: "e.g. Summer 2026" },
          { name: "category", label: "Category", type: "select", required: true, options: ["Men", "Women", "Kids", "Accessories"] }
        ]
      },
      {
        name: "SECTION 2: Variants",
        order: 2,
        fields: [
          { name: "sizes", label: "Sizes Available", type: "select", required: true, options: ["XS", "S", "M", "L", "XL", "XXL"] },
          { name: "colors", label: "Colors", type: "select", required: true, options: ["Black", "White", "Blue", "Red", "Green", "Custom color"] },
          { name: "fabric", label: "Fabric Material", type: "select", required: true, options: ["Cotton", "Denim", "Silk", "Polyester"] }
        ]
      },
      {
        name: "SECTION 3: Pricing",
        order: 3,
        fields: [
          { name: "costPrice", label: "Cost Price (₹)", type: "number", required: true, placeholder: "e.g. 800" },
          { name: "price", label: "Selling Price (₹)", type: "number", required: true, placeholder: "e.g. 1499" },
          { name: "discount", label: "Standard Discount (%)", type: "number", required: false, placeholder: "e.g. 10" },
          { name: "gst", label: "Tax rate (GST %)", type: "number", required: false, placeholder: "e.g. 12" }
        ]
      },
      {
        name: "SECTION 4: Inventory",
        order: 4,
        fields: [
          { name: "stock", label: "Available Quantity", type: "number", required: true, placeholder: "e.g. 50" },
          { name: "sku", label: "SKU code", type: "text", required: true, placeholder: "e.g. AP-TSH-01" },
          { name: "barcode", label: "Barcode EAN", type: "text", required: false, placeholder: "e.g. 890127..." }
        ]
      },
      {
        name: "SECTION 5: Media",
        order: 5,
        fields: [
          { name: "images", label: "Product Images Link", type: "text", required: false, placeholder: "e.g. https://..." },
          { name: "thumbnail", label: "Thumbnail Image", type: "text", required: false, placeholder: "e.g. https://..." }
        ]
      },
      {
        name: "SECTION 6: Seasonal",
        order: 6,
        fields: [
          { name: "season", label: "Season Category", type: "select", required: false, options: ["Summer", "Winter", "Festival Collection"] }
        ]
      }
    ]
  },
  "Pharmacy": {
    businessType: "Pharmacy",
    sections: [
      {
        name: "SECTION 1: Medicine Info",
        order: 1,
        fields: [
          { name: "name", label: "Medicine Name", type: "text", required: true, placeholder: "e.g. Crocin Active" },
          { name: "genericName", label: "Generic Name", type: "text", required: true, placeholder: "e.g. Paracetamol 650mg" },
          { name: "company", label: "Company Name", type: "text", required: true, placeholder: "e.g. GSK Pharma" },
          { name: "prescriptionRequired", label: "Prescription Required?", type: "boolean", required: true },
          { name: "category", label: "Category Form", type: "select", required: true, options: ["Tablet", "Syrup", "Injection", "Cream", "Capsule"] }
        ]
      },
      {
        name: "SECTION 2: Batch & Dates",
        order: 2,
        fields: [
          { name: "batchNumber", label: "Batch Number", type: "text", required: true, placeholder: "e.g. B-CR90" },
          { name: "mfgDate", label: "Manufacturing Date", type: "date", required: false },
          { name: "expiryDate", label: "Expiry Date", type: "date", required: true }
        ]
      },
      {
        name: "SECTION 3: Dosage & Storage",
        order: 3,
        fields: [
          { name: "dosage", label: "Dosage Strength", type: "text", required: true, placeholder: "e.g. Once daily after meals" },
          { name: "storageType", label: "Storage Condition", type: "select", required: true, options: ["Cold Storage (2-8 C)", "Room Temp (15-25 C)", "Dry Protected Area"] }
        ]
      },
      {
        name: "SECTION 4: Pricing",
        order: 4,
        fields: [
          { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 15" },
          { name: "price", label: "Selling Price (MRP ₹)", type: "number", required: true, placeholder: "e.g. 29.5" }
        ]
      },
      {
        name: "SECTION 5: Inventory",
        order: 5,
        fields: [
          { name: "stock", label: "Available Stock (Qty)", type: "number", required: true, placeholder: "e.g. 100" },
          { name: "minStock", label: "Reorder Trigger Level", type: "number", required: true, placeholder: "e.g. 20" }
        ]
      }
    ]
  },
  "Electronics Store": {
    businessType: "Electronics Store",
    sections: [
      {
        name: "SECTION 1: Product Specifications",
        order: 1,
        fields: [
          { name: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. Bravia OLED TV" },
          { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Sony" },
          { name: "modelNumber", label: "Model Number", type: "text", required: true, placeholder: "e.g. KD-55A8H" },
          { name: "category", label: "Category", type: "select", required: true, options: ["Television", "Audio", "Home Appliances"] }
        ]
      },
      {
        name: "SECTION 2: Identifiers & Power",
        order: 2,
        fields: [
          { name: "imei", label: "IMEI (Mobiles only)", type: "text", required: false, placeholder: "Enter IMEI if mobile" },
          { name: "serialNumber", label: "Serial Number", type: "text", required: true, placeholder: "e.g. SN-9801..." },
          { name: "color", label: "Color Theme", type: "text", required: false, placeholder: "e.g. Midnight Black" },
          { name: "voltage", label: "Voltage Spec", type: "text", required: false, placeholder: "e.g. 220V AC" }
        ]
      },
      {
        name: "SECTION 3: Pricing & Warranty",
        order: 3,
        fields: [
          { name: "costPrice", label: "Cost Price (₹)", type: "number", required: true, placeholder: "e.g. 45000" },
          { name: "price", label: "Selling Price (₹)", type: "number", required: true, placeholder: "e.g. 59999" },
          { name: "warranty", label: "Warranty Period", type: "text", required: true, placeholder: "e.g. 1 Year Brand Warranty" }
        ]
      },
      {
        name: "SECTION 4: Inventory",
        order: 4,
        fields: [
          { name: "stock", label: "Available Quantity", type: "number", required: true, placeholder: "e.g. 10" },
          { name: "minStock", label: "Reorder Qty Level", type: "number", required: true, placeholder: "e.g. 2" }
        ]
      }
    ]
  },
  "Furniture Store": {
    businessType: "Furniture Store",
    sections: [
      {
        name: "SECTION 1: Design Details",
        order: 1,
        fields: [
          { name: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. King Size Teak Bed" },
          { name: "material", label: "Material used", type: "text", required: true, placeholder: "e.g. Teak Wood / Fabric" },
          { name: "dimensions", label: "Dimensions (LxWxH)", type: "text", required: true, placeholder: "e.g. 78 x 72 x 36 inches" },
          { name: "weight", label: "Total Weight (Kg)", type: "text", required: false, placeholder: "e.g. 60" },
          { name: "finish", label: "Gloss Finish", type: "text", required: false, placeholder: "e.g. Honey Oak Finish" },
          { name: "assemblyRequired", label: "Assembly Required?", type: "boolean", required: true },
          { name: "category", label: "Furniture Category", type: "select", required: true, options: ["Beds", "Sofas", "Dining Tables", "Chairs"] }
        ]
      },
      {
        name: "SECTION 2: Pricing & Stock",
        order: 2,
        fields: [
          { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 12000" },
          { name: "price", label: "Selling Price (₹)", type: "number", required: true, placeholder: "e.g. 19999" },
          { name: "stock", label: "Available Qty", type: "number", required: true, placeholder: "e.g. 5" },
          { name: "minStock", label: "Min Stock Level", type: "number", required: true, placeholder: "e.g. 1" }
        ]
      }
    ]
  }
};

export class DynamicProductTemplateService {
  async getTemplate(businessType: string): Promise<DynamicFormConfig> {
    return PRESET_TEMPLATES[businessType] || PRESET_TEMPLATES["Grocery Store"];
  }
}
export const dynamicProductTemplateService = new DynamicProductTemplateService();

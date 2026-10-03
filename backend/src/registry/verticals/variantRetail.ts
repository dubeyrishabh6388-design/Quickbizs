import { VerticalDefinition } from "../types";

export const CLOTHING_VERTICAL: VerticalDefinition = {
  id: "CLOTHING",
  businessType: "Clothing Store",
  displayName: "Clothing & Fashion Apparel",
  aliases: ["clothing", "clothing store", "garments", "apparel", "fashion", "boutique", "textiles"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Men's Formal",
    "Men's Casual",
    "Women's Ethnic",
    "Women's Western",
    "Kids & Infants",
    "Winter Wear",
    "Fashion Accessories"
  ],
  units: ["Piece", "Set", "Pair", "Bundle"],
  fields: [
    { name: "name", label: "Garment Name", type: "text", required: true, placeholder: "e.g. Slim Fit Cotton Formal Shirt", section: "Garment Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Raymond, Levi's, Zara, Peter England", section: "Garment Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Men's Formal", "Men's Casual", "Women's Ethnic", "Women's Western", "Kids & Infants", "Winter Wear", "Fashion Accessories"], section: "Garment Details", sectionOrder: 1, order: 3 },
    { name: "size", label: "Size", type: "select", required: true, options: ["XS", "S", "M", "L", "XL", "XXL", "38", "40", "42", "44", "Free Size"], section: "Garment Details", sectionOrder: 1, order: 4 },
    { name: "color", label: "Color", type: "text", required: true, placeholder: "e.g. Navy Blue, White, Black, Maroon", section: "Garment Details", sectionOrder: 1, order: 5 },
    { name: "fabric", label: "Fabric Material", type: "text", required: false, placeholder: "e.g. 100% Giza Cotton, Linen, Silk", section: "Garment Details", sectionOrder: 1, order: 6 },
    { name: "gender", label: "Gender Target", type: "select", required: false, options: ["Men", "Women", "Kids", "Unisex"], section: "Garment Details", sectionOrder: 1, order: 7 },
    { name: "sku", label: "Style SKU", type: "text", required: false, placeholder: "e.g. SH-SLM-BLU-40", section: "Garment Details", sectionOrder: 1, order: 8 },
    { name: "rack", label: "Section / Hanger Rack", type: "text", required: false, placeholder: "e.g. Rack M-01", section: "Garment Details", sectionOrder: 1, order: 9 },
    { name: "costPrice", label: "Cost Price (₹)", type: "number", required: true, placeholder: "e.g. 650", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Selling Price / MRP (₹)", type: "number", required: true, placeholder: "e.g. 1499", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Wholesale / Boutique Price (₹)", type: "number", required: false, placeholder: "e.g. 1050", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Available Quantity", type: "number", required: true, placeholder: "e.g. 20", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Reorder Trigger Level", type: "number", required: true, placeholder: "e.g. 4", section: "Pricing & Stock", sectionOrder: 2, order: 5 }
  ],
  searchableFields: ["brand", "size", "color", "fabric", "sku", "name", "barcode", "rack"],
  priceTiers: [
    { key: "wholesalePrice", label: "Boutique / Reseller Rate", tierAliases: ["wholesale", "boutique", "reseller", "bulk"] }
  ],
  customerTypes: [
    { key: "Retail Shopper", label: "Retail Shopper", defaultPriceTier: "retailPrice" },
    { key: "Boutique Reseller", label: "Boutique / Reseller Partner", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Boutique Reseller Balances", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Boutique Reseller", "Retail Shopper"],
    lowStockFieldMap: { brand: "brand", size: "size", color: "color", rack: "rack" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["rack"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    defaultUnit: "Piece"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "apparel_size_velocity", title: "Sales Velocity by Size & Color", groupingKeys: ["size", "color"], description: "Garment Fit Breakdown" }
  ],
  labels: {
    product: "Garment",
    products: "Apparel",
    code: "SKU / Barcode",
    location: "Rack"
  },
  helpText: {
    size: "Standard sizing tag (S/M/L or chest number)"
  }
};

export const FOOTWEAR_VERTICAL: VerticalDefinition = {
  id: "FOOTWEAR",
  businessType: "Footwear Shop",
  displayName: "Footwear & Shoes",
  aliases: ["footwear", "footwear shop", "shoes", "shoe store", "sandals", "slippers"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Men's Formal Shoes",
    "Men's Sports Shoes",
    "Men's Casual & Loafers",
    "Women's Heels & Flats",
    "Kids & School Shoes",
    "Slippers & Flipflops"
  ],
  units: ["Pair", "Box", "Piece"],
  fields: [
    { name: "name", label: "Shoe Name", type: "text", required: true, placeholder: "e.g. Leather Oxford Formal Shoes", section: "Footwear Specs", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Bata, Nike, Sparx, Woodland, Red Chief", section: "Footwear Specs", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Men's Formal Shoes", "Men's Sports Shoes", "Men's Casual & Loafers", "Women's Heels & Flats", "Kids & School Shoes", "Slippers & Flipflops"], section: "Footwear Specs", sectionOrder: 1, order: 3 },
    { name: "shoeSize", label: "Size (UK/IND)", type: "select", required: true, options: ["6", "7", "8", "9", "10", "11", "12", "Kids 1", "Kids 2", "Kids 3", "Kids 4"], section: "Footwear Specs", sectionOrder: 1, order: 4 },
    { name: "color", label: "Color", type: "text", required: true, placeholder: "e.g. Black, Brown, Tan, White", section: "Footwear Specs", sectionOrder: 1, order: 5 },
    { name: "gender", label: "Gender Target", type: "select", required: false, options: ["Men", "Women", "Kids", "Unisex"], section: "Footwear Specs", sectionOrder: 1, order: 6 },
    { name: "rack", label: "Shoe Rack / Wall", type: "text", required: false, placeholder: "e.g. Wall A - Row 3", section: "Footwear Specs", sectionOrder: 1, order: 7 },
    { name: "costPrice", label: "Cost Price (₹)", type: "number", required: true, placeholder: "e.g. 800", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Price / MRP (₹)", type: "number", required: true, placeholder: "e.g. 1799", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Dealer / Bulk Shoe Rate (₹)", type: "number", required: false, placeholder: "e.g. 1250", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Pairs Available", type: "number", required: true, placeholder: "e.g. 15", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Min Stock Level", type: "number", required: true, placeholder: "e.g. 3", section: "Pricing & Stock", sectionOrder: 2, order: 5 }
  ],
  searchableFields: ["brand", "shoeSize", "color", "name", "barcode", "rack"],
  priceTiers: [
    { key: "wholesalePrice", label: "Dealer / Bulk Shoe Rate", tierAliases: ["wholesale", "dealer", "bulk"] }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "Retail Customer", defaultPriceTier: "retailPrice" },
    { key: "Sub-Dealer", label: "Sub-Dealer / Vendor", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Sub-Dealer Credit Balances", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Sub-Dealer", "Retail Customer"],
    lowStockFieldMap: { brand: "brand", size: "shoeSize", color: "color", rack: "rack" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["rack"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    defaultUnit: "Pair"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "shoe_size_sales", title: "Shoe Size Popularity Distribution", groupingKeys: ["shoeSize"], description: "Size Curve Inventory Analytics" }
  ],
  labels: {
    product: "Shoe Pair",
    products: "Footwear",
    code: "Article Code",
    location: "Rack"
  },
  helpText: {
    shoeSize: "Standard Indian/UK shoe size grading"
  }
};

export const MOBILE_VERTICAL: VerticalDefinition = {
  id: "MOBILE",
  businessType: "Mobile Shop",
  displayName: "Mobile Phones & Gadgets",
  aliases: ["mobile", "mobile shop", "smartphones", "cell phones", "mobile accessories"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "5G Smartphones",
    "Budget & Feature Phones",
    "Tablets & iPads",
    "Earbuds & Audio",
    "Smartwatches & Bands",
    "Chargers & Power Banks",
    "Screen Protection & Covers"
  ],
  units: ["Piece", "Box", "Unit"],
  fields: [
    { name: "name", label: "Device Name", type: "text", required: true, placeholder: "e.g. OnePlus 12 5G (Flowy Emerald)", section: "Device Specs", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Apple, Samsung, OnePlus, Vivo, Xiaomi", section: "Device Specs", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["5G Smartphones", "Budget & Feature Phones", "Tablets & iPads", "Earbuds & Audio", "Smartwatches & Bands", "Chargers & Power Banks", "Screen Protection & Covers"], section: "Device Specs", sectionOrder: 1, order: 3 },
    { name: "modelName", label: "Model Number", type: "text", required: true, placeholder: "e.g. CPH2573", section: "Device Specs", sectionOrder: 1, order: 4 },
    { name: "imei1", label: "IMEI 1 / Serial", type: "text", required: false, placeholder: "e.g. 863920058291024", section: "Device Specs", sectionOrder: 1, order: 5 },
    { name: "imei2", label: "IMEI 2", type: "text", required: false, placeholder: "e.g. 863920058291032", section: "Device Specs", sectionOrder: 1, order: 6 },
    { name: "ram", label: "RAM", type: "select", required: false, options: ["4GB", "6GB", "8GB", "12GB", "16GB"], section: "Device Specs", sectionOrder: 1, order: 7 },
    { name: "storage", label: "Storage", type: "select", required: false, options: ["64GB", "128GB", "256GB", "512GB", "1TB"], section: "Device Specs", sectionOrder: 1, order: 8 },
    { name: "color", label: "Device Color", type: "text", required: false, placeholder: "e.g. Emerald Green, Titanium Black", section: "Device Specs", sectionOrder: 1, order: 9 },
    { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 52000", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Selling Price / MOP (₹)", type: "number", required: true, placeholder: "e.g. 59999", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "dealerPrice", label: "Dealer / B2B Rate (₹)", type: "number", required: false, placeholder: "e.g. 55000", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Inventory Stock", type: "number", required: true, placeholder: "e.g. 5", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Reorder Trigger", type: "number", required: true, placeholder: "e.g. 1", section: "Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "warranty", label: "Brand Warranty", type: "text", required: false, placeholder: "e.g. 1 Year Domestic Brand Warranty", section: "Pricing & Stock", sectionOrder: 2, order: 6 }
  ],
  searchableFields: ["brand", "modelName", "imei1", "imei2", "ram", "storage", "name", "barcode"],
  priceTiers: [
    { key: "dealerPrice", label: "Dealer / Reseller Rate", tierAliases: ["dealer", "reseller", "partner", "wholesale"] }
  ],
  customerTypes: [
    { key: "Direct Consumer", label: "End Consumer", defaultPriceTier: "retailPrice" },
    { key: "Retail Partner", label: "Sub-Dealer / Retail Partner", defaultPriceTier: "dealerPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Partner & Customer Receivables", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Retail Partner", "Direct Consumer"],
    lowStockFieldMap: { brand: "brand", model: "modelName", storage: "storage" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: false,
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    requireBatchOrSerial: true,
    defaultUnit: "Piece"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "imei_sales_ledger", title: "IMEI / Serial Device Sales Log", groupingKeys: ["brand", "modelName"], description: "Auditable Smartphone Dispatches" }
  ],
  labels: {
    product: "Handset",
    products: "Devices",
    code: "IMEI / Serial"
  },
  helpText: {
    imei1: "15-digit primary electronic serial identifier"
  }
};

export const ELECTRONICS_VERTICAL: VerticalDefinition = {
  id: "ELECTRONICS",
  businessType: "Electronics Store",
  displayName: "Consumer Electronics & Appliances",
  aliases: ["electronics", "electronics store", "appliances", "home electronics", "gadgets"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Televisions & Home Audio",
    "Refrigerators & Freezers",
    "Air Conditioners",
    "Washing Machines",
    "Kitchen & Small Appliances",
    "Inverters & Battery Systems"
  ],
  units: ["Unit", "Piece", "Set", "Box"],
  fields: [
    { name: "name", label: "Appliance Name", type: "text", required: true, placeholder: "e.g. 55-inch 4K OLED Smart TV", section: "Appliance Specs", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Sony, Samsung, LG, Daikin, Whirlpool", section: "Appliance Specs", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Televisions & Home Audio", "Refrigerators & Freezers", "Air Conditioners", "Washing Machines", "Kitchen & Small Appliances", "Inverters & Battery Systems"], section: "Appliance Specs", sectionOrder: 1, order: 3 },
    { name: "modelNumber", label: "Model Number", type: "text", required: true, placeholder: "e.g. KD-55A80L", section: "Appliance Specs", sectionOrder: 1, order: 4 },
    { name: "serialNumber", label: "Serial Number", type: "text", required: false, placeholder: "e.g. SN-8902-LG", section: "Appliance Specs", sectionOrder: 1, order: 5 },
    { name: "starRating", label: "Energy Star Rating", type: "select", required: false, options: ["5 Star", "4 Star", "3 Star", "Inverter Grade"], section: "Appliance Specs", sectionOrder: 1, order: 6 },
    { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 85000", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Selling Price (₹)", type: "number", required: true, placeholder: "e.g. 104990", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "dealerPrice", label: "Sub-Dealer Rate (₹)", type: "number", required: false, placeholder: "e.g. 92000", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "technicianPrice", label: "Technician / Installer Rate (₹)", type: "number", required: false, placeholder: "e.g. 95000", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "stock", label: "Showroom Units", type: "number", required: true, placeholder: "e.g. 3", section: "Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "minStock", label: "Min Stock Alert", type: "number", required: true, placeholder: "e.g. 1", section: "Pricing & Stock", sectionOrder: 2, order: 6 },
    { name: "warranty", label: "Warranty Period", type: "text", required: false, placeholder: "e.g. 3 Years Comprehensive + 10 Years Panel", section: "Pricing & Stock", sectionOrder: 2, order: 7 }
  ],
  searchableFields: ["brand", "modelNumber", "serialNumber", "name", "barcode"],
  priceTiers: [
    { key: "dealerPrice", label: "Sub-Dealer Price", tierAliases: ["dealer", "wholesale"] },
    { key: "technicianPrice", label: "Technician / Installer Rate", tierAliases: ["technician", "installer"], fallbackKey: "dealerPrice" }
  ],
  customerTypes: [
    { key: "Home Owner", label: "Retail Consumer", defaultPriceTier: "retailPrice" },
    { key: "Certified Technician", label: "AC / Appliance Technician", defaultPriceTier: "technicianPrice", creditAllowed: true },
    { key: "Sub-Dealer", label: "Sub-Dealer Partner", defaultPriceTier: "dealerPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Dealer & Technician Dues", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Sub-Dealer", "Certified Technician", "Home Owner"],
    lowStockFieldMap: { brand: "brand", model: "modelNumber" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: false,
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    requireBatchOrSerial: true,
    defaultUnit: "Unit"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "appliance_brand_share", title: "Appliance Brand Turnover", groupingKeys: ["brand"], description: "White Goods Brand Performance" }
  ],
  labels: {
    product: "Appliance",
    products: "White Goods",
    code: "Model Number",
    secondaryCode: "Serial Number"
  },
  helpText: {
    modelNumber: "Manufacturer appliance model identifier"
  }
};

export const FURNITURE_VERTICAL: VerticalDefinition = {
  id: "FURNITURE",
  businessType: "Furniture Store",
  displayName: "Furniture & Interior Decor",
  aliases: ["furniture", "furniture store", "home decor", "woodwork", "interior"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Living Room Sofas & Recliners",
    "Beds & Mattresses",
    "Dining Table Sets",
    "Office Chairs & Workstations",
    "Wardrobes & Almirahs",
    "Outdoor & Balcony Sets"
  ],
  units: ["Piece", "Set", "Unit"],
  fields: [
    { name: "name", label: "Furniture Item", type: "text", required: true, placeholder: "e.g. 6-Seater Solid Teak Dining Table", section: "Furniture Specs", sectionOrder: 1, order: 1 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Living Room Sofas & Recliners", "Beds & Mattresses", "Dining Table Sets", "Office Chairs & Workstations", "Wardrobes & Almirahs", "Outdoor & Balcony Sets"], section: "Furniture Specs", sectionOrder: 1, order: 2 },
    { name: "material", label: "Material Composition", type: "text", required: true, placeholder: "e.g. Solid Teak Wood, Sheesham, Engineered Ply", section: "Furniture Specs", sectionOrder: 1, order: 3 },
    { name: "dimensions", label: "Dimensions (LxWxH)", type: "text", required: false, placeholder: "e.g. 72 x 36 x 30 inches", section: "Furniture Specs", sectionOrder: 1, order: 4 },
    { name: "finish", label: "Color Polish Finish", type: "text", required: false, placeholder: "e.g. Walnut Matte, Natural Oak, Teak Gloss", section: "Furniture Specs", sectionOrder: 1, order: 5 },
    { name: "costPrice", label: "Carpentry Cost (₹)", type: "number", required: true, placeholder: "e.g. 18000", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Showroom Retail Price (₹)", type: "number", required: true, placeholder: "e.g. 34999", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "interiorDesignerPrice", label: "Architect / Designer Rate (₹)", type: "number", required: false, placeholder: "e.g. 26500", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Showroom Stock", type: "number", required: true, placeholder: "e.g. 2", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Min Stock Level", type: "number", required: true, placeholder: "e.g. 1", section: "Pricing & Stock", sectionOrder: 2, order: 5 }
  ],
  searchableFields: ["material", "dimensions", "name", "finish"],
  priceTiers: [
    { key: "interiorDesignerPrice", label: "Architect / Interior Designer Rate", tierAliases: ["designer", "architect", "contractor", "wholesale"] }
  ],
  customerTypes: [
    { key: "Home Owner", label: "Home Buyer", defaultPriceTier: "retailPrice" },
    { key: "Interior Designer", label: "Architect / Interior Designer", defaultPriceTier: "interiorDesignerPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Architect & Designer Receivables", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Interior Designer", "Home Owner"],
    lowStockFieldMap: { material: "material" },
    brandValuationEnabled: false
  },
  inventoryBehavior: {
    trackLocations: false,
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    defaultUnit: "Piece"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "furniture_materials", title: "Furniture Volume by Wood Material", groupingKeys: ["material"], description: "Woodwork Margin Analytics" }
  ],
  labels: {
    product: "Furniture Piece",
    products: "Furniture Articles",
    code: "Model / Design Code"
  },
  helpText: {
    material: "Core structural material (Teak, Sheesham, Metal, Foam)"
  }
};

export const OPTICAL_VERTICAL: VerticalDefinition = {
  id: "OPTICAL",
  businessType: "Optical Store",
  displayName: "Optical & Eyewear",
  aliases: ["optical", "optical store", "optician", "eyewear", "glasses", "sunglasses", "opticals"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Prescription Frames",
    "Ophthalmic Optical Lenses",
    "Designer Sunglasses",
    "Contact Lenses",
    "Lens Solutions & Cases"
  ],
  units: ["Piece", "Pair", "Box", "Bottle"],
  fields: [
    { name: "name", label: "Frame / Lens Name", type: "text", required: true, placeholder: "e.g. Titanium Aviator Frame Matte Black", section: "Optical Specs", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Ray-Ban, Oakley, Titan Eye+, Lenskart, Crizal", section: "Optical Specs", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Prescription Frames", "Ophthalmic Optical Lenses", "Designer Sunglasses", "Contact Lenses", "Lens Solutions & Cases"], section: "Optical Specs", sectionOrder: 1, order: 3 },
    { name: "frameModel", label: "Model Number", type: "text", required: false, placeholder: "e.g. RB-3025", section: "Optical Specs", sectionOrder: 1, order: 4 },
    { name: "lensPower", label: "Power / Spherical Grade", type: "text", required: false, placeholder: "e.g. -2.50 D / Blue Cut", section: "Optical Specs", sectionOrder: 1, order: 5 },
    { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 1200", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Price (₹)", type: "number", required: true, placeholder: "e.g. 3500", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "optometristPrice", label: "Clinic / Optometrist Rate (₹)", type: "number", required: false, placeholder: "e.g. 2400", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Available Stock", type: "number", required: true, placeholder: "e.g. 10", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Min Stock Alert", type: "number", required: true, placeholder: "e.g. 2", section: "Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "rack", label: "Frame Case Tray", type: "text", required: false, placeholder: "e.g. Tray 04-B", section: "Pricing & Stock", sectionOrder: 2, order: 6 }
  ],
  searchableFields: ["frameModel", "brand", "name", "rack"],
  priceTiers: [
    { key: "optometristPrice", label: "Doctor / Optometrist Price", tierAliases: ["optometrist", "clinic", "doctor", "wholesale"] }
  ],
  customerTypes: [
    { key: "Walk-in Patient", label: "Patient / Walk-in", defaultPriceTier: "retailPrice" },
    { key: "Clinic Partner", label: "Eye Hospital / Optometrist Partner", defaultPriceTier: "optometristPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Hospital & Clinic Receivables", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Clinic Partner", "Walk-in Patient"],
    lowStockFieldMap: { brand: "brand", model: "frameModel", rack: "rack" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["rack"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    defaultUnit: "Piece"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "optical_brands", title: "Eyewear Brand Share", groupingKeys: ["brand"], description: "Frame & Lens Volume Analysis" }
  ],
  labels: {
    product: "Frame / Lens",
    products: "Eyewear",
    code: "Model No",
    location: "Tray"
  },
  helpText: {
    frameModel: "Manufacturer frame or lens code"
  }
};

export const JEWELLERY_VERTICAL: VerticalDefinition = {
  id: "JEWELLERY",
  businessType: "Jewellery Shop",
  displayName: "Jewellery & Precious Metals",
  aliases: ["jewellery", "jewellery shop", "jewelry", "gold", "silver", "diamond", "gems", "bullion"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "22K Gold Ornaments",
    "18K Diamond Jewelry",
    "925 Sterling Silver Articles",
    "Gold & Silver Bullion Coins",
    "Platinum Bands & Rings",
    "Precious Gemstones"
  ],
  units: ["Gram", "Carat", "Piece", "Tola", "Kg"],
  fields: [
    { name: "name", label: "Ornament Name", type: "text", required: true, placeholder: "e.g. 22K Gold Antique Choker Necklace", section: "Jewellery Specs", sectionOrder: 1, order: 1 },
    { name: "category", label: "Category", type: "select", required: true, options: ["22K Gold Ornaments", "18K Diamond Jewelry", "925 Sterling Silver Articles", "Gold & Silver Bullion Coins", "Platinum Bands & Rings", "Precious Gemstones"], section: "Jewellery Specs", sectionOrder: 1, order: 2 },
    { name: "metalType", label: "Precious Metal", type: "select", required: true, options: ["Gold", "Silver", "Diamond", "Platinum", "Rose Gold"], section: "Jewellery Specs", sectionOrder: 1, order: 3 },
    { name: "purityCarat", label: "Purity Grade", type: "select", required: true, options: ["24K (99.9%)", "22K (91.6% BIS)", "18K (75.0%)", "14K (58.5%)", "925 Silver"], section: "Jewellery Specs", sectionOrder: 1, order: 4 },
    { name: "grossWeightGrams", label: "Gross Weight (Grams)", type: "number", required: true, placeholder: "e.g. 24.500", section: "Jewellery Specs", sectionOrder: 1, order: 5 },
    { name: "netWeightGrams", label: "Net Metal Weight (Grams)", type: "number", required: true, placeholder: "e.g. 22.800", section: "Jewellery Specs", sectionOrder: 1, order: 6 },
    { name: "hallmarkHUID", label: "BIS Hallmark HUID Code", type: "text", required: true, placeholder: "e.g. HUID-982143", section: "Jewellery Specs", sectionOrder: 1, order: 7 },
    { name: "makingChargesPerGram", label: "Making Charges per Gram (₹)", type: "number", required: false, placeholder: "e.g. 450", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "costPrice", label: "Metal Inward Value (₹)", type: "number", required: true, placeholder: "e.g. 150000", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "price", label: "Estimated Retail Tag (₹)", type: "number", required: true, placeholder: "e.g. 175000", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "wholesalePrice", label: "Bullion / Karigar Trade Rate (₹)", type: "number", required: false, placeholder: "e.g. 158000", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "stock", label: "Vault Stock (Pieces)", type: "number", required: true, placeholder: "e.g. 1", section: "Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "minStock", label: "Min Stock Alert", type: "number", required: true, placeholder: "e.g. 1", section: "Pricing & Stock", sectionOrder: 2, order: 6 }
  ],
  searchableFields: ["hallmarkHUID", "metalType", "purityCarat", "name"],
  priceTiers: [
    { key: "wholesalePrice", label: "Bullion / Trade Partner Rate", tierAliases: ["bullion", "karigar", "goldsmith", "wholesale"] }
  ],
  customerTypes: [
    { key: "Retail Buyer", label: "Retail Family Buyer", defaultPriceTier: "retailPrice" },
    { key: "Karigar / Trade Partner", label: "Goldsmith / Karigar Trade", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Karigar & Trade Account Dues", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Karigar / Trade Partner", "Retail Buyer"],
    lowStockFieldMap: { metalType: "metalType", hallmark: "hallmarkHUID" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["vaultTray"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    requireBatchOrSerial: true,
    defaultUnit: "Gram"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "metal_weight_report", title: "Metal Inward & Outward Weight (Grams)", groupingKeys: ["metalType", "purityCarat"], description: "Physical Gold & Silver Balance" }
  ],
  labels: {
    product: "Ornament",
    products: "Jewellery Articles",
    code: "HUID Number"
  },
  helpText: {
    hallmarkHUID: "6-character alphanumeric BIS unique identification mark"
  }
};

export const PHARMACY_VERTICAL: VerticalDefinition = {
  id: "PHARMACY",
  businessType: "Pharmacy",
  displayName: "Pharmacy & Healthcare",
  aliases: ["pharmacy", "medical store", "pharmacy shop", "chemist", "drug store", "healthcare"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Tablets & Capsules",
    "Syrups & Suspensions",
    "Injections & IV Fluids",
    "Ointments & Creams",
    "Surgicals & Medical Devices",
    "OTC Wellness & Baby Care"
  ],
  units: ["Strip", "Bottle", "Piece", "Vial", "Tube", "Box"],
  fields: [
    { name: "name", label: "Medicine Brand Name", type: "text", required: true, placeholder: "e.g. Augmentin 625 Duo Tablet", section: "Drug Specs", sectionOrder: 1, order: 1 },
    { name: "genericName", label: "Salt / Generic Composition", type: "text", required: true, placeholder: "e.g. Amoxicillin & Potassium Clavulanate", section: "Drug Specs", sectionOrder: 1, order: 2 },
    { name: "company", label: "Manufacturing Company", type: "text", required: true, placeholder: "e.g. GSK, Cipla, Sun Pharma, Abbott", section: "Drug Specs", sectionOrder: 1, order: 3 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Tablets & Capsules", "Syrups & Suspensions", "Injections & IV Fluids", "Ointments & Creams", "Surgicals & Medical Devices", "OTC Wellness & Baby Care"], section: "Drug Specs", sectionOrder: 1, order: 4 },
    { name: "batchNumber", label: "Batch Number", type: "text", required: true, placeholder: "e.g. BT-9081", section: "Drug Specs", sectionOrder: 1, order: 5 },
    { name: "expiryDate", label: "Expiry Date (MM/YYYY)", type: "text", required: true, placeholder: "e.g. 12/2027", section: "Drug Specs", sectionOrder: 1, order: 6 },
    { name: "dosage", label: "Dosage / Strength", type: "text", required: false, placeholder: "e.g. 625mg, 500mg, 10ml", section: "Drug Specs", sectionOrder: 1, order: 7 },
    { name: "rack", label: "Medicine Rack / Shelf", type: "text", required: false, placeholder: "e.g. Rack M-12", section: "Drug Specs", sectionOrder: 1, order: 8 },
    { name: "costPrice", label: "Purchase Price / PTS (₹)", type: "number", required: true, placeholder: "e.g. 145", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "MRP (₹)", type: "number", required: true, placeholder: "e.g. 205", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Doctor / Clinic Price (₹)", type: "number", required: false, placeholder: "e.g. 175", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Strips / Units in Stock", type: "number", required: true, placeholder: "e.g. 40", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Min Stock Alert", type: "number", required: true, placeholder: "e.g. 10", section: "Pricing & Stock", sectionOrder: 2, order: 5 }
  ],
  searchableFields: ["genericName", "company", "batchNumber", "name", "rack"],
  priceTiers: [
    { key: "wholesalePrice", label: "Hospital / Doctor Price", tierAliases: ["hospital", "doctor", "clinic", "wholesale"] }
  ],
  customerTypes: [
    { key: "Patient", label: "Retail Patient", defaultPriceTier: "retailPrice" },
    { key: "Doctor / Clinic", label: "Doctor / Clinic Partner", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Doctor & Clinic Receivables", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Doctor / Clinic", "Patient"],
    lowStockFieldMap: { generic: "genericName", batch: "batchNumber", rack: "rack" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["rack"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    requireBatchOrSerial: true,
    defaultUnit: "Strip"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "batch_expiry_report", title: "Batch Wise Stock & Expiry", groupingKeys: ["batchNumber"], description: "Pharmaceutical Regulatory Tracking" }
  ],
  labels: {
    product: "Medicine",
    products: "Medicines",
    code: "Batch Number",
    location: "Rack"
  },
  helpText: {
    batchNumber: "Manufacturer batch code for drug control traceability"
  }
};

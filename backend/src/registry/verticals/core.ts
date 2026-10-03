import { VerticalDefinition } from "../types";

export const AUTO_PARTS_VERTICAL: VerticalDefinition = {
  id: "AUTO_PARTS",
  businessType: "Automobile Shop",
  displayName: "Auto Parts",
  depthLevel: "LEVEL 4 — DOMAIN SPECIALIZED",
  creditRules: {
    defaultCreditLimit: 50000,
    creditAllowedByDefault: true,
    maxOverdueDays: 45,
    hardStopOnExceed: true,
  },
  aliases: ["auto parts", "automobile", "automobile shop", "auto parts & trade", "auto spares", "auto"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Engine Parts",
    "Brake & Clutch",
    "Suspension & Steering",
    "Electrical & Lighting",
    "Filters & Lubricants",
    "Body & Accessories"
  ],
  units: ["Piece", "Set", "Pair", "Litre", "Kit", "Box"],
  fields: [
    { name: "name", label: "Part Name", type: "text", required: true, placeholder: "e.g. Front Brake Pad Set", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 1 },
    { name: "partNumber", label: "Part Number", type: "text", required: true, placeholder: "e.g. 48820-0K030", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 2 },
    { name: "oemNumber", label: "OEM Number", type: "text", required: false, placeholder: "e.g. OEM-TY-8921", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 3 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Bosch, Denso, Minda, Lucas TVS", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 4 },
    { name: "vehicleMake", label: "Vehicle Make", type: "text", required: true, placeholder: "e.g. Maruti Suzuki, Toyota, Hyundai, Tata", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 5 },
    { name: "vehicleModel", label: "Vehicle Model", type: "text", required: true, placeholder: "e.g. Swift, Innova Crysta, City, Scorpio", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 6 },
    { name: "variant", label: "Variant", type: "text", required: false, placeholder: "e.g. Petrol, Diesel, 2.4 VX, ZXi", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 7 },
    { name: "compatibility", label: "Cross Compatibility", type: "text", required: false, placeholder: "e.g. Also fits Fortuner 2016-2022", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 8 },
    { name: "category", label: "Component Category", type: "select", required: true, options: ["Engine Parts", "Brake & Clutch", "Suspension & Steering", "Electrical & Lighting", "Filters & Lubricants", "Body & Accessories"], section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 9 },
    { name: "rack", label: "Rack", type: "text", required: false, placeholder: "e.g. Rack A-12", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 10 },
    { name: "bin", label: "Bin", type: "text", required: false, placeholder: "e.g. Bin 4", section: "SECTION 1: Part Specifications", sectionOrder: 1, order: 11 },
    { name: "costPrice", label: "Purchase Price (₹)", type: "number", required: true, placeholder: "e.g. 850", section: "SECTION 2: Pricing & Inventory", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Price (₹)", type: "number", required: true, placeholder: "e.g. 1200", section: "SECTION 2: Pricing & Inventory", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 1050", section: "SECTION 2: Pricing & Inventory", sectionOrder: 2, order: 3 },
    { name: "mechanicPrice", label: "Mechanic Price (₹)", type: "number", required: false, placeholder: "e.g. 1100", section: "SECTION 2: Pricing & Inventory", sectionOrder: 2, order: 4 },
    { name: "stock", label: "Available Stock", type: "number", required: true, placeholder: "e.g. 15", section: "SECTION 2: Pricing & Inventory", sectionOrder: 2, order: 5 },
    { name: "minStock", label: "Reorder Level", type: "number", required: true, placeholder: "e.g. 3", section: "SECTION 2: Pricing & Inventory", sectionOrder: 2, order: 6 },
    { name: "warranty", label: "Warranty Period", type: "text", required: false, placeholder: "e.g. 6 Months / 10,000 KM", section: "SECTION 2: Pricing & Inventory", sectionOrder: 2, order: 7 }
  ],
  searchableFields: ["partNumber", "oemNumber", "vehicleModel", "vehicleMake", "brand", "rack", "bin"],
  priceTiers: [
    { key: "wholesalePrice", label: "Wholesale Price", tierAliases: ["wholesale", "dealer"] },
    { key: "mechanicPrice", label: "Mechanic Price", tierAliases: ["mechanic", "workshop"], fallbackKey: "wholesalePrice" }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "Retail Customer", defaultPriceTier: "retailPrice" },
    { key: "Mechanic", label: "Mechanic", defaultPriceTier: "mechanicPrice", creditAllowed: true },
    { key: "Workshop", label: "Workshop", defaultPriceTier: "mechanicPrice", creditAllowed: true },
    { key: "Dealer", label: "Dealer / Wholesale", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts", "pendingPurchases"],
    cards: [
      { id: "customer_due_breakdown", title: "Customer Dues (Mechanic / Workshop / Retail)", type: "breakdown", gridWidth: "half" },
      { id: "low_stock_parts", title: "Low Stock Parts with Rack & Bin Locations", type: "table", gridWidth: "full" },
      { id: "fast_moving_parts", title: "Fast Moving Parts & Cross Compatibility", type: "table", gridWidth: "half" }
    ],
    customerDueKeys: ["Mechanic", "Workshop", "Retail"],
    lowStockFieldMap: {
      partNumber: "partNumber",
      oemNumber: "oemNumber",
      vehicleModel: "vehicleModel",
      rack: "rack",
      bin: "bin",
      brand: "brand"
    },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["rack", "bin"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    requireBatchOrSerial: false,
    defaultUnit: "Piece"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"],
    supportsVehicleTagging: true
  },
  reportDefinitions: [
    { id: "part_sales", title: "Part Movement & Profitability", groupingKeys: ["partNumber", "brand"], description: "Sales by Part and Vehicle Model" }
  ],
  labels: {
    product: "Part",
    products: "Parts",
    code: "Part Number",
    secondaryCode: "OEM Number",
    location: "Rack / Bin"
  },
  helpText: {
    partNumber: "Unique OEM or manufacturer part code for quick counter search",
    vehicleModel: "Compatible vehicle model and years"
  }
};

export const ELECTRICAL_VERTICAL: VerticalDefinition = {
  id: "ELECTRICAL",
  businessType: "Electrical Store",
  displayName: "Electrical",
  depthLevel: "LEVEL 3 — PRODUCTION READY",
  creditRules: {
    defaultCreditLimit: 30000,
    creditAllowedByDefault: true,
    maxOverdueDays: 30,
    hardStopOnExceed: true,
  },
  aliases: ["electrical", "electrical store", "electricals", "lighting", "wires & cables"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Lighting & Bulbs",
    "Cables & Wires",
    "Switches & Sockets",
    "Circuit Breakers & MCBs",
    "Fans & Appliances",
    "Pipes & Fittings"
  ],
  units: ["Piece", "Meter", "Roll", "Coil", "Box", "Set"],
  fields: [
    { name: "name", label: "Item Name", type: "text", required: true, placeholder: "e.g. LED Batten 20W White", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Havells, Polycab, Philips, Anchor, Legrand", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 2 },
    { name: "productType", label: "Product Type", type: "text", required: false, placeholder: "e.g. LED Batten, Modular Switch, Wire, MCB", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 3 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Lighting & Bulbs", "Cables & Wires", "Switches & Sockets", "Circuit Breakers & MCBs", "Fans & Appliances", "Pipes & Fittings"], section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 4 },
    { name: "wattage", label: "Wattage (W)", type: "text", required: false, placeholder: "e.g. 9W, 12W, 18W, 20W, 1000W", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 5 },
    { name: "voltage", label: "Voltage (V)", type: "text", required: false, placeholder: "e.g. 220V-240V AC, 12V DC", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 6 },
    { name: "wireGauge", label: "Wire Gauge", type: "text", required: false, placeholder: "e.g. 1.0 sq mm, 1.5 sq mm, 2.5 sq mm, 4.0 sq mm", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 7 },
    { name: "colour", label: "Colour", type: "text", required: false, placeholder: "e.g. Cool Daylight, Warm White, Red, Black, White", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 8 },
    { name: "capType", label: "Cap Type", type: "text", required: false, placeholder: "e.g. B22, E27, E14", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 9 },
    { name: "size", label: "Size", type: "text", required: false, placeholder: "e.g. 1 Meter, 2 Module, 4 Module", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 10 },
    { name: "packSize", label: "Pack Size", type: "number", required: false, placeholder: "e.g. 10, 20", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 11 },
    { name: "rack", label: "Rack Location", type: "text", required: false, placeholder: "e.g. Rack E-03", section: "SECTION 1: Electrical Specifications", sectionOrder: 1, order: 12 },
    { name: "costPrice", label: "Purchase Price (₹)", type: "number", required: true, placeholder: "e.g. 220", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Price (₹)", type: "number", required: true, placeholder: "e.g. 350", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 280", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "contractorPrice", label: "Contractor Price (₹)", type: "number", required: false, placeholder: "e.g. 300", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "electricianPrice", label: "Electrician Price (₹)", type: "number", required: false, placeholder: "e.g. 310", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "stock", label: "Available Stock", type: "number", required: true, placeholder: "e.g. 40", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 6 },
    { name: "minStock", label: "Min Stock Level", type: "number", required: true, placeholder: "e.g. 10", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 7 },
    { name: "warranty", label: "Warranty Period", type: "text", required: false, placeholder: "e.g. 1 Year, 2 Years Replacement", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 8 }
  ],
  searchableFields: ["brand", "wattage", "voltage", "wireGauge", "colour", "capType", "size", "productType", "rack"],
  priceTiers: [
    { key: "wholesalePrice", label: "Wholesale Price", tierAliases: ["wholesale"] },
    { key: "contractorPrice", label: "Contractor Price", tierAliases: ["contractor"], fallbackKey: "wholesalePrice" },
    { key: "electricianPrice", label: "Electrician Price", tierAliases: ["electrician"], fallbackKey: "wholesalePrice" }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "Retail Customer", defaultPriceTier: "retailPrice" },
    { key: "Electrician", label: "Electrician", defaultPriceTier: "electricianPrice", creditAllowed: true },
    { key: "Contractor", label: "Contractor", defaultPriceTier: "contractorPrice", creditAllowed: true },
    { key: "Wholesale", label: "Wholesale Buyer", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts", "topBrands"],
    cards: [
      { id: "customer_due_breakdown", title: "Contractor & Electrician Credit Dues", type: "breakdown", gridWidth: "half" },
      { id: "top_brands", title: "Top Brand Distribution & Inventory Valuation", type: "chart", gridWidth: "half" }
    ],
    customerDueKeys: ["Contractor", "Electrician", "Retail"],
    lowStockFieldMap: {
      brand: "brand",
      wattage: "wattage",
      voltage: "voltage",
      size: "size",
      rack: "rack"
    },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["rack"],
    allowPackConversion: true,
    defaultPackSizeField: "packSize"
  },
  purchaseBehavior: {
    supportsPackConversion: true,
    defaultUnit: "Piece"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "brand_analytics", title: "Brand Revenue Breakdown", groupingKeys: ["brand"], description: "Sales by Electrical Manufacturer" }
  ],
  labels: {
    product: "Item",
    products: "Electrical Goods",
    code: "SKU / Model",
    location: "Rack"
  },
  helpText: {
    wattage: "Rated power consumption in Watts",
    voltage: "Operating voltage requirement (AC/DC)"
  }
};

export const HARDWARE_VERTICAL: VerticalDefinition = {
  id: "HARDWARE",
  businessType: "Hardware Store",
  displayName: "Hardware",
  depthLevel: "LEVEL 3 — PRODUCTION READY",
  creditRules: {
    defaultCreditLimit: 40000,
    creditAllowedByDefault: true,
    maxOverdueDays: 30,
    hardStopOnExceed: true,
  },
  aliases: ["hardware", "hardware store", "fasteners", "industrial hardware", "tools & hardware", "tools"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Hand Tools",
    "Power Tools",
    "Fasteners & Screws",
    "Paints & Solvents",
    "Plumbing & Pipes",
    "Sanitaryware"
  ],
  units: ["Piece", "Kg", "Box", "Packet", "Meter", "Set"],
  fields: [
    { name: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. Stainless Steel Hex Bolt M12", section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Bosch, Stanley, Godrej, Asian Paints", section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Hand Tools", "Power Tools", "Fasteners & Screws", "Paints & Solvents", "Plumbing & Pipes", "Sanitaryware"], section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 3 },
    { name: "material", label: "Material", type: "text", required: false, placeholder: "e.g. Stainless Steel 304, Brass, Mild Steel", section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 4 },
    { name: "size", label: "Size", type: "text", required: true, placeholder: "e.g. 10mm, 2 inch, M12", section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 5 },
    { name: "diameter", label: "Diameter", type: "text", required: false, placeholder: "e.g. 8mm, 1/2 inch", section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 6 },
    { name: "specification", label: "Specification", type: "text", required: false, placeholder: "e.g. Grade 8.8, Fully Threaded, DIN 933", section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 7 },
    { name: "weight", label: "Weight", type: "text", required: false, placeholder: "e.g. 250g, 1.2 Kg", section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 8 },
    { name: "unit", label: "Unit", type: "select", required: false, options: ["Piece", "Kg", "Box", "Packet", "Meter", "Set"], section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 9 },
    { name: "packSize", label: "Pack Size", type: "number", required: false, placeholder: "e.g. 50, 100", section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 10 },
    { name: "rack", label: "Rack Location", type: "text", required: false, placeholder: "e.g. Rack H-05", section: "SECTION 1: Hardware Specifications", sectionOrder: 1, order: 11 },
    { name: "costPrice", label: "Purchase Price (₹)", type: "number", required: true, placeholder: "e.g. 40", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Price (₹)", type: "number", required: true, placeholder: "e.g. 60", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 48", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "contractorPrice", label: "Contractor Price (₹)", type: "number", required: false, placeholder: "e.g. 52", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "stock", label: "Available Stock", type: "number", required: true, placeholder: "e.g. 200", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "minStock", label: "Min Stock Level", type: "number", required: true, placeholder: "e.g. 20", section: "SECTION 2: Pricing & Stock", sectionOrder: 2, order: 6 }
  ],
  searchableFields: ["brand", "material", "size", "diameter", "specification", "rack", "sku"],
  priceTiers: [
    { key: "wholesalePrice", label: "Wholesale Price", tierAliases: ["wholesale"] },
    { key: "contractorPrice", label: "Contractor Price", tierAliases: ["contractor", "fabricator"], fallbackKey: "wholesalePrice" }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "Retail Customer", defaultPriceTier: "retailPrice" },
    { key: "Contractor", label: "Contractor", defaultPriceTier: "contractorPrice", creditAllowed: true },
    { key: "Fabricator", label: "Fabricator", defaultPriceTier: "contractorPrice", creditAllowed: true },
    { key: "Wholesale", label: "Wholesale Buyer", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Contractor & Fabricator Dues", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Contractor", "Fabricator", "Retail"],
    lowStockFieldMap: {
      brand: "brand",
      size: "size",
      material: "material",
      rack: "rack"
    },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["rack"],
    allowPackConversion: true,
    defaultPackSizeField: "packSize"
  },
  purchaseBehavior: {
    supportsPackConversion: true,
    defaultUnit: "Piece"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "fastener_movement", title: "Fastener & Size Velocity", groupingKeys: ["size", "specification"], description: "Sales by Material and Dimensions" }
  ],
  labels: {
    product: "Item",
    products: "Hardware & Tools",
    code: "SKU / Specification",
    location: "Rack / Bin"
  },
  helpText: {
    specification: "Standard industrial specification (e.g. DIN 933, Grade 8.8)",
    packSize: "Quantity per boxed pack for automatic stock conversion on receipt"
  }
};

export const GENERIC_RETAIL_VERTICAL: VerticalDefinition = {
  id: "GENERIC_RETAIL",
  businessType: "General Retail",
  displayName: "Retail",
  aliases: ["general retail", "custom business", "supermarket", "retail store", "provisions"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: ["General Items", "Fast Moving", "Staples", "Packaged Goods"],
  units: ["Piece", "Box", "Kg", "Packet", "Litre"],
  fields: [
    { name: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. Standard Product", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand Name", type: "text", required: false, placeholder: "e.g. Generic", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["General Items", "Fast Moving", "Staples", "Packaged Goods"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "costPrice", label: "Cost Price (₹)", type: "number", required: true, placeholder: "e.g. 50", section: "Pricing", sectionOrder: 2, order: 1 },
    { name: "price", label: "Selling Price (₹)", type: "number", required: true, placeholder: "e.g. 75", section: "Pricing", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 60", section: "Pricing", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Initial Stock", type: "number", required: true, placeholder: "e.g. 20", section: "Inventory", sectionOrder: 3, order: 1 },
    { name: "minStock", label: "Minimum Stock", type: "number", required: true, placeholder: "e.g. 5", section: "Inventory", sectionOrder: 3, order: 2 }
  ],
  searchableFields: ["brand", "name", "barcode", "sku"],
  priceTiers: [
    { key: "wholesalePrice", label: "Wholesale Price", tierAliases: ["wholesale"] }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "Retail Customer", defaultPriceTier: "retailPrice" },
    { key: "Wholesale", label: "Wholesale Buyer", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue"],
    cards: [],
    customerDueKeys: ["Retail"],
    lowStockFieldMap: { brand: "brand" },
    brandValuationEnabled: true
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
  reportDefinitions: [],
  labels: {
    product: "Product",
    products: "Products",
    code: "Barcode / SKU"
  },
  helpText: {}
};

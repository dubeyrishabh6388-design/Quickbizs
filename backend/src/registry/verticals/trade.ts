import { VerticalDefinition } from "../types";

/**
 * PHASE 5C: TRADE & DISTRIBUTION VERTICALS
 * 1. Wholesale
 * 2. Distributor
 * 3. FMCG Distributor
 * 4. Dealer
 * 5. Plumbing
 * 6. Sanitary
 * 7. Tools
 * 8. Building Material
 * 9. Timber
 */

// 1. WHOLESALE
export const WHOLESALE_VERTICAL: VerticalDefinition = {
  id: "WHOLESALE",
  businessType: "Wholesale Trader",
  displayName: "Wholesale & Bulk Trade",
  aliases: ["wholesale", "wholesale trader", "bulk trader", "stockist", "wholesaler"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Fast Moving Goods",
    "Packaged Commodities",
    "Bulk Hardware",
    "Commercial Supplies",
    "Institutional Packs"
  ],
  units: ["Carton", "Box", "Piece", "Bag", "Dozen", "Kg", "Litre", "Metric Ton"],
  fields: [
    { name: "name", label: "Item / Commodity Name", type: "text", required: true, placeholder: "e.g. Premium Basmati Rice 25kg Bag", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand / Mill", type: "text", required: true, placeholder: "e.g. Daawat, Fortune, Ambika", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Product Category", type: "select", required: true, options: ["Fast Moving Goods", "Packaged Commodities", "Bulk Hardware", "Commercial Supplies", "Institutional Packs"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "unit", label: "Primary Unit", type: "select", required: true, options: ["Carton", "Box", "Piece", "Bag", "Dozen", "Kg", "Litre", "Metric Ton"], section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "packSize", label: "Pack / Case Size (Units per Box)", type: "number", required: false, placeholder: "e.g. 24", section: "Packaging & Units", sectionOrder: 2, order: 1 },
    { name: "moq", label: "Min Order Quantity (MOQ)", type: "number", required: false, placeholder: "e.g. 5", section: "Packaging & Units", sectionOrder: 2, order: 2 },
    { name: "hsn", label: "HSN / SAC Code", type: "text", required: false, placeholder: "e.g. 10063020", section: "Taxation", sectionOrder: 3, order: 1 },
    { name: "costPrice", label: "Purchase Price / Cost (₹)", type: "number", required: true, placeholder: "e.g. 1800", section: "Pricing & Stock", sectionOrder: 4, order: 1 },
    { name: "price", label: "Retail / Standard Price (₹)", type: "number", required: true, placeholder: "e.g. 2400", section: "Pricing & Stock", sectionOrder: 4, order: 2 },
    { name: "wholesalePrice", label: "Wholesale Rate (₹)", type: "number", required: true, placeholder: "e.g. 2100", section: "Pricing & Stock", sectionOrder: 4, order: 3 },
    { name: "dealerPrice", label: "Sub-Dealer Rate (₹)", type: "number", required: false, placeholder: "e.g. 1950", section: "Pricing & Stock", sectionOrder: 4, order: 4 },
    { name: "stock", label: "Current Warehouse Stock", type: "number", required: true, placeholder: "e.g. 400", section: "Pricing & Stock", sectionOrder: 4, order: 5 },
    { name: "minStock", label: "Reorder Trigger Level", type: "number", required: true, placeholder: "e.g. 50", section: "Pricing & Stock", sectionOrder: 4, order: 6 },
    { name: "warehouseLocation", label: "Warehouse Bay / Zone", type: "text", required: false, placeholder: "e.g. Bay 4 - Pallet 12", section: "Warehouse", sectionOrder: 5, order: 1 }
  ],
  searchableFields: ["brand", "name", "hsn", "sku", "barcode"],
  priceTiers: [
    { key: "wholesalePrice", label: "Wholesale Rate", tierAliases: ["wholesale", "wholesaler", "bulk"] },
    { key: "dealerPrice", label: "Sub-Dealer Rate", tierAliases: ["dealer", "subdealer", "distributor"] }
  ],
  customerTypes: [
    { key: "Wholesale Buyer", label: "Wholesale Trader", defaultPriceTier: "wholesalePrice", creditAllowed: true },
    { key: "Sub-Dealer", label: "Authorized Sub-Dealer", defaultPriceTier: "dealerPrice", creditAllowed: true },
    { key: "Retail Customer", label: "Walk-in Retailer", defaultPriceTier: "retailPrice", creditAllowed: false }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Trade Credit & Ledger Receivables", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Wholesale Buyer", "Sub-Dealer", "Retail Customer"],
    lowStockFieldMap: { brand: "brand", size: "packSize" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["warehouseLocation"],
    allowPackConversion: true,
    defaultPackSizeField: "packSize"
  },
  purchaseBehavior: {
    supportsPackConversion: true,
    defaultUnit: "Carton"
  },
  salesBehavior: {
    defaultPriceTier: "wholesalePrice",
    allowedPaymentMethods: ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CREDIT"]
  },
  reportDefinitions: [
    { id: "trade_sales_summary", title: "Wholesale Sales by Party Tier", groupingKeys: ["customerType", "brand"], description: "Daily turnover broken down by Wholesalers vs Sub-Dealers vs Retailers" },
    { id: "outstanding_aging_summary", title: "Credit Ledger Aging Summary", groupingKeys: ["customerName", "dueDays"], description: "Age-wise credit exposure report" }
  ],
  labels: {
    inventoryTitle: "Warehouse Stock & Pallet Management",
    partNumberLabel: "SKU / Trade Code",
    vehicleCompatibilityLabel: "Trade Sector",
    customerDueLabel: "Outstanding Receivables (B2B Credit)",
    supplierDueLabel: "Manufacturer Payables"
  },
  helpText: {
    stock: "Enter total stock in primary base units (e.g. cartons or bags).",
    rack: "Designate warehouse zone, bay, and pallet position."
  }
};

// 2. DISTRIBUTOR
export const DISTRIBUTOR_VERTICAL: VerticalDefinition = {
  id: "DISTRIBUTOR",
  businessType: "Distributor",
  displayName: "Authorized Distributor",
  aliases: ["distributor", "authorized distributor", "c&f agent", "channel partner", "distribution agency"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Primary Channel Stock",
    "Promotional Stock",
    "Commercial Inventory",
    "Direct Shipments"
  ],
  units: ["Carton", "Case", "Box", "Piece", "Crate", "Pallet"],
  fields: [
    { name: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. Parle-G Gold 80g Carton (96 pcs)", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Principal Manufacturer", type: "text", required: true, placeholder: "e.g. Parle Products, HUL, ITC", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Product Category", type: "select", required: true, options: ["Primary Channel Stock", "Promotional Stock", "Commercial Inventory", "Direct Shipments"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "unit", label: "Order Unit", type: "select", required: true, options: ["Carton", "Case", "Box", "Piece", "Crate", "Pallet"], section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "packSize", label: "Units per Case / Carton", type: "number", required: true, placeholder: "e.g. 96", section: "Logistics", sectionOrder: 2, order: 1 },
    { name: "moq", label: "Minimum Dispatch Order", type: "number", required: false, placeholder: "e.g. 2", section: "Logistics", sectionOrder: 2, order: 2 },
    { name: "hsn", label: "HSN Code", type: "text", required: false, placeholder: "e.g. 19053100", section: "Taxation", sectionOrder: 3, order: 1 },
    { name: "costPrice", label: "Landing Cost (From Company) (₹)", type: "number", required: true, placeholder: "e.g. 720", section: "Pricing & Stock", sectionOrder: 4, order: 1 },
    { name: "price", label: "MRP / Consumer Price (₹)", type: "number", required: true, placeholder: "e.g. 960", section: "Pricing & Stock", sectionOrder: 4, order: 2 },
    { name: "wholesalePrice", label: "Retailer Margin Price (₹)", type: "number", required: true, placeholder: "e.g. 810", section: "Pricing & Stock", sectionOrder: 4, order: 3 },
    { name: "dealerPrice", label: "Wholesaler / Sub-Stockist Price (₹)", type: "number", required: false, placeholder: "e.g. 760", section: "Pricing & Stock", sectionOrder: 4, order: 4 },
    { name: "stock", label: "Available Cases", type: "number", required: true, placeholder: "e.g. 150", section: "Pricing & Stock", sectionOrder: 4, order: 5 },
    { name: "minStock", label: "Buffer Stock Threshold", type: "number", required: true, placeholder: "e.g. 25", section: "Pricing & Stock", sectionOrder: 4, order: 6 },
    { name: "dispatchRoute", label: "Delivery Beat / Route", type: "text", required: false, placeholder: "e.g. North Route - Mon/Thu", section: "Logistics", sectionOrder: 2, order: 3 }
  ],
  searchableFields: ["brand", "name", "hsn", "sku"],
  priceTiers: [
    { key: "wholesalePrice", label: "Retailer Supply Rate", tierAliases: ["retailer", "shopkeeper"] },
    { key: "dealerPrice", label: "Sub-Stockist / Wholesaler Rate", tierAliases: ["dealer", "substockist", "wholesaler", "bulk"] }
  ],
  customerTypes: [
    { key: "Retailer", label: "Registered Retail Store", defaultPriceTier: "wholesalePrice", creditAllowed: true },
    { key: "Sub-Stockist", label: "Sub-Stockist / Wholesaler", defaultPriceTier: "dealerPrice", creditAllowed: true },
    { key: "Institutional", label: "Institutional / Canteen", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Route Outstanding Ledger", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Retailer", "Sub-Stockist", "Institutional"],
    lowStockFieldMap: { brand: "brand", size: "packSize" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: false,
    allowPackConversion: true,
    defaultPackSizeField: "packSize"
  },
  purchaseBehavior: {
    supportsPackConversion: true,
    defaultUnit: "Carton"
  },
  salesBehavior: {
    defaultPriceTier: "wholesalePrice",
    allowedPaymentMethods: ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CREDIT"]
  },
  reportDefinitions: [
    { id: "beat_sales_summary", title: "Beat & Route Sales Performance", groupingKeys: ["dispatchRoute", "customerType"], description: "Daily delivery beat order execution and collections" }
  ],
  labels: {
    inventoryTitle: "Distribution Stock & Inventory",
    customerDueLabel: "Route & Market Outstandings",
    supplierDueLabel: "Company Invoices Payable"
  },
  helpText: {
    costPrice: "Enter landing cost after primary invoice trade discounts and schemes."
  }
};

// 3. FMCG_DISTRIBUTOR
export const FMCG_DISTRIBUTOR_VERTICAL: VerticalDefinition = {
  id: "FMCG_DISTRIBUTOR",
  businessType: "FMCG Distributor",
  displayName: "FMCG Super Stockist & Distributor",
  aliases: ["fmcg distributor", "fmcg distribution", "super stockist", "cpg distributor", "packaged goods distributor"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Biscuits & Confectionery",
    "Soaps & Detergents",
    "Edible Oils & Foods",
    "Oral Care & Hygiene",
    "Packaged Beverages"
  ],
  units: ["Case", "Carton", "Shrink Pack", "Box", "Tin", "Piece"],
  fields: [
    { name: "name", label: "SKU Name", type: "text", required: true, placeholder: "e.g. Lifebuoy Total 125g Pack of 4x12", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Company / FMCG Brand", type: "text", required: true, placeholder: "e.g. Hindustan Unilever, Marico, Britannia", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Biscuits & Confectionery", "Soaps & Detergents", "Edible Oils & Foods", "Oral Care & Hygiene", "Packaged Beverages"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "unit", label: "Dispatch Unit", type: "select", required: true, options: ["Case", "Carton", "Shrink Pack", "Box", "Tin", "Piece"], section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "packSize", label: "Inner Units per Case", type: "number", required: true, placeholder: "e.g. 48", section: "Packaging", sectionOrder: 2, order: 1 },
    { name: "moq", label: "Minimum Order Cases", type: "number", required: false, placeholder: "e.g. 1", section: "Packaging", sectionOrder: 2, order: 2 },
    { name: "schemeDetails", label: "Scheme / Trade Promo", type: "text", required: false, placeholder: "e.g. Buy 10 Cases Get 1 Case Free (10+1)", section: "Trade Schemes", sectionOrder: 3, order: 1 },
    { name: "costPrice", label: "Distributor Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 1420", section: "Pricing & Stock", sectionOrder: 4, order: 1 },
    { name: "price", label: "Total MRP per Case (₹)", type: "number", required: true, placeholder: "e.g. 1920", section: "Pricing & Stock", sectionOrder: 4, order: 2 },
    { name: "wholesalePrice", label: "Retailer Billing Rate (₹)", type: "number", required: true, placeholder: "e.g. 1600", section: "Pricing & Stock", sectionOrder: 4, order: 3 },
    { name: "dealerPrice", label: "Wholesaler Rate (₹)", type: "number", required: false, placeholder: "e.g. 1510", section: "Pricing & Stock", sectionOrder: 4, order: 4 },
    { name: "stock", label: "Stock in Cases", type: "number", required: true, placeholder: "e.g. 250", section: "Pricing & Stock", sectionOrder: 4, order: 5 },
    { name: "minStock", label: "Safety Stock Limit", type: "number", required: true, placeholder: "e.g. 30", section: "Pricing & Stock", sectionOrder: 4, order: 6 },
    { name: "hsn", label: "HSN Code", type: "text", required: false, placeholder: "e.g. 34011110", section: "Taxation", sectionOrder: 5, order: 1 }
  ],
  searchableFields: ["brand", "name", "hsn", "sku"],
  priceTiers: [
    { key: "wholesalePrice", label: "Retailer Margin Price", tierAliases: ["retailer", "kirana"] },
    { key: "dealerPrice", label: "Super Market / Wholesale Rate", tierAliases: ["dealer", "wholesaler", "supermarket"] }
  ],
  customerTypes: [
    { key: "Kirana Retailer", label: "General Store / Kirana", defaultPriceTier: "wholesalePrice", creditAllowed: true },
    { key: "Wholesale Trader", label: "Mandi / Wholesale Trader", defaultPriceTier: "dealerPrice", creditAllowed: true },
    { key: "Modern Trade", label: "Modern Trade / Supermarket", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Market Credit Outstandings", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Kirana Retailer", "Wholesale Trader", "Modern Trade"],
    lowStockFieldMap: { brand: "brand", size: "packSize" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: false,
    allowPackConversion: true,
    defaultPackSizeField: "packSize"
  },
  purchaseBehavior: {
    supportsPackConversion: true,
    defaultUnit: "Case"
  },
  salesBehavior: {
    defaultPriceTier: "wholesalePrice",
    allowedPaymentMethods: ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CREDIT"]
  },
  reportDefinitions: [
    { id: "fmcg_scheme_summary", title: "Scheme & Trade Discount Summary", groupingKeys: ["brand", "schemeDetails"], description: "Promotional discount performance by manufacturer" }
  ],
  labels: {
    inventoryTitle: "FMCG Inventory (Cases)",
    customerDueLabel: "Kirana Outstanding Balances",
    supplierDueLabel: "Company Billing Due"
  },
  helpText: {
    packSize: "Inner consumer units contained in one master case."
  }
};

// 4. DEALER
export const DEALER_VERTICAL: VerticalDefinition = {
  id: "DEALER",
  businessType: "Authorized Dealer",
  displayName: "Authorized Dealer & Dealership",
  aliases: ["dealer", "authorized dealer", "franchise dealer", "oem dealer", "brand store"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Primary Equipment & Machinery",
    "Accessories & Fitments",
    "Consumables & Parts",
    "Authorized Add-ons"
  ],
  units: ["Piece", "Set", "Unit", "Kit", "Box"],
  fields: [
    { name: "name", label: "Product / Model Name", type: "text", required: true, placeholder: "e.g. Industrial Inverter 10kVA 3-Phase", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "OEM Brand", type: "text", required: true, placeholder: "e.g. Luminous, Microtek, Exide, Kirloskar", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Primary Equipment & Machinery", "Accessories & Fitments", "Consumables & Parts", "Authorized Add-ons"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "modelNumber", label: "OEM Model / Series", type: "text", required: true, placeholder: "e.g. PRO-INV-10K3P", section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "unit", label: "Unit", type: "select", required: true, options: ["Piece", "Set", "Unit", "Kit", "Box"], section: "Basic Details", sectionOrder: 1, order: 5 },
    { name: "warranty", label: "Dealer Warranty Period", type: "text", required: false, placeholder: "e.g. 3 Years Onsite", section: "Warranty & Support", sectionOrder: 2, order: 1 },
    { name: "costPrice", label: "Dealer Purchase Price (₹)", type: "number", required: true, placeholder: "e.g. 48000", section: "Pricing & Stock", sectionOrder: 3, order: 1 },
    { name: "price", label: "Customer List Price / MRP (₹)", type: "number", required: true, placeholder: "e.g. 62000", section: "Pricing & Stock", sectionOrder: 3, order: 2 },
    { name: "wholesalePrice", label: "Institutional / Contractor Price (₹)", type: "number", required: false, placeholder: "e.g. 54000", section: "Pricing & Stock", sectionOrder: 3, order: 3 },
    { name: "dealerPrice", label: "Sub-Dealer Pass Rate (₹)", type: "number", required: false, placeholder: "e.g. 51000", section: "Pricing & Stock", sectionOrder: 3, order: 4 },
    { name: "stock", label: "Current Stock", type: "number", required: true, placeholder: "e.g. 8", section: "Pricing & Stock", sectionOrder: 3, order: 5 },
    { name: "minStock", label: "Reorder Trigger Level", type: "number", required: true, placeholder: "e.g. 2", section: "Pricing & Stock", sectionOrder: 3, order: 6 },
    { name: "serialNumberRequired", label: "Track Serial Number", type: "boolean", required: false, section: "Warranty & Support", sectionOrder: 2, order: 2 }
  ],
  searchableFields: ["brand", "name", "modelNumber", "sku"],
  priceTiers: [
    { key: "wholesalePrice", label: "Contractor Rate", tierAliases: ["contractor", "institutional", "commercial"] },
    { key: "dealerPrice", label: "Sub-Dealer Rate", tierAliases: ["dealer", "subdealer", "associate"] }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "End Customer", defaultPriceTier: "retailPrice" },
    { key: "Contractor", label: "Project Contractor", defaultPriceTier: "wholesalePrice", creditAllowed: true },
    { key: "Sub-Dealer", label: "Secondary Dealer / Retailer", defaultPriceTier: "dealerPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Dealer Account Receivables", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Contractor", "Sub-Dealer", "Retail Customer"],
    lowStockFieldMap: { brand: "brand", size: "modelNumber" },
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
    allowedPaymentMethods: ["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE", "CREDIT"]
  },
  reportDefinitions: [
    { id: "dealer_sales_summary", title: "Dealership Sales by Tier", groupingKeys: ["customerType", "brand"], description: "Monthly turnover broken down by direct retail vs contractor/subdealer" }
  ],
  labels: {
    inventoryTitle: "Dealership Showroom Stock",
    customerDueLabel: "Client & Contractor Receivables",
    supplierDueLabel: "OEM Principal Due"
  },
  helpText: {
    modelNumber: "Enter manufacturer model number or part identification code."
  }
};

// 5. PLUMBING
export const PLUMBING_VERTICAL: VerticalDefinition = {
  id: "PLUMBING",
  businessType: "Plumbing Supplies",
  displayName: "Plumbing Pipes & Fittings",
  aliases: ["plumbing", "plumber store", "pipes and fittings", "cpvc store", "plumbing supplies"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "CPVC Pipes & Fittings",
    "UPVC Pipes & Fittings",
    "SWR Drainage Systems",
    "Valves & Cocks",
    "Solvents & Adhesives",
    "Plumbing Tools"
  ],
  units: ["Piece", "Length", "Bundle", "Box", "Kg", "Meter", "Feet"],
  fields: [
    { name: "name", label: "Item Name", type: "text", required: true, placeholder: "e.g. CPVC Elbow 90 Degree 1 Inch", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Astral, Ashirvad, Finolex, Supreme", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["CPVC Pipes & Fittings", "UPVC Pipes & Fittings", "SWR Drainage Systems", "Valves & Cocks", "Solvents & Adhesives", "Plumbing Tools"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "diameter", label: "Pipe / Fitting Diameter", type: "text", required: true, placeholder: "e.g. 1 inch, 25mm, 3/4 inch, 4 inch", section: "Technical Specifications", sectionOrder: 2, order: 1 },
    { name: "pressureClass", label: "Pressure Rating / Class", type: "text", required: false, placeholder: "e.g. SDR 11, Schedule 40, Schedule 80, 10 kgf/cm²", section: "Technical Specifications", sectionOrder: 2, order: 2 },
    { name: "material", label: "Pipe Material", type: "select", required: true, options: ["CPVC", "UPVC", "PVC", "GI Galvanized", "Brass", "PPR", "Cast Iron"], section: "Technical Specifications", sectionOrder: 2, order: 3 },
    { name: "unit", label: "Unit of Measurement", type: "select", required: true, options: ["Piece", "Length", "Bundle", "Box", "Kg", "Meter", "Feet"], section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "packSize", label: "Standard Box / Bundle Quantity", type: "number", required: false, placeholder: "e.g. 50 pcs per box or 10 pipes per bundle", section: "Packaging", sectionOrder: 3, order: 1 },
    { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 24", section: "Pricing & Stock", sectionOrder: 4, order: 1 },
    { name: "price", label: "Retail Price (₹)", type: "number", required: true, placeholder: "e.g. 38", section: "Pricing & Stock", sectionOrder: 4, order: 2 },
    { name: "wholesalePrice", label: "Contractor / Bulk Rate (₹)", type: "number", required: false, placeholder: "e.g. 29", section: "Pricing & Stock", sectionOrder: 4, order: 3 },
    { name: "plumberPrice", label: "Plumber Discount Rate (₹)", type: "number", required: false, placeholder: "e.g. 31", section: "Pricing & Stock", sectionOrder: 4, order: 4 },
    { name: "stock", label: "Stock Quantity", type: "number", required: true, placeholder: "e.g. 300", section: "Pricing & Stock", sectionOrder: 4, order: 5 },
    { name: "minStock", label: "Minimum Stock Alert", type: "number", required: true, placeholder: "e.g. 50", section: "Pricing & Stock", sectionOrder: 4, order: 6 },
    { name: "rack", label: "Pipe Rack / Bin Location", type: "text", required: false, placeholder: "e.g. Pipe Rack B - Slot 3", section: "Storage", sectionOrder: 5, order: 1 }
  ],
  searchableFields: ["brand", "name", "diameter", "material", "sku", "barcode"],
  priceTiers: [
    { key: "wholesalePrice", label: "Contractor Rate", tierAliases: ["contractor", "builder", "bulk"] },
    { key: "plumberPrice", label: "Plumber Rate", tierAliases: ["plumber", "installer", "trade"] }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "Direct Retail", defaultPriceTier: "retailPrice" },
    { key: "Plumber", label: "Registered Plumber", defaultPriceTier: "plumberPrice", creditAllowed: true },
    { key: "Building Contractor", label: "Building Contractor", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Plumber & Builder Ledger Due", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Plumber", "Building Contractor", "Retail Customer"],
    lowStockFieldMap: { brand: "brand", size: "diameter" },
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
    allowedPaymentMethods: ["CASH", "UPI", "CARD", "CREDIT"]
  },
  reportDefinitions: [
    { id: "plumbing_sales_summary", title: "Plumbing Sales by Contractor / Plumber", groupingKeys: ["customerType", "material"], description: "Turnover analysis by pipe material type and trade buyers" }
  ],
  labels: {
    inventoryTitle: "Plumbing & Piping Inventory",
    partNumberLabel: "Item / Fitting Code",
    customerDueLabel: "Plumber & Contractor Dues",
    supplierDueLabel: "Pipe Manufacturer Dues"
  },
  helpText: {
    diameter: "Enter nominal pipe or fitting bore size (e.g. 1/2\", 3/4\", 1\", 2\")."
  }
};

// 6. SANITARY
export const SANITARY_VERTICAL: VerticalDefinition = {
  id: "SANITARY",
  businessType: "Sanitaryware & Bath",
  displayName: "Sanitaryware & Bath Fittings",
  aliases: ["sanitary", "sanitaryware", "bath fittings", "bathroom store", "tiles and sanitary", "faucets store"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Water Closets & Commodes",
    "Wash Basins & Vanities",
    "Faucets & Taps",
    "Showers & Diverters",
    "Bath Accessories",
    "Flushing Systems & Cisterns"
  ],
  units: ["Piece", "Set", "Box", "Kit", "Unit"],
  fields: [
    { name: "name", label: "Product Description", type: "text", required: true, placeholder: "e.g. Single Piece Wall Hung Commode with Soft Close", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Jaquar, Kohler, Hindware, Cera, Parryware", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Water Closets & Commodes", "Wash Basins & Vanities", "Faucets & Taps", "Showers & Diverters", "Bath Accessories", "Flushing Systems & Cisterns"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "modelNumber", label: "Catalogue / Model No.", type: "text", required: false, placeholder: "e.g. CAT-JQR-29001", section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "finish", label: "Color / Surface Finish", type: "text", required: false, placeholder: "e.g. Glossy White, Matt Black, Chrome Plated, Rose Gold", section: "Design & Specs", sectionOrder: 2, order: 1 },
    { name: "mountingType", label: "Mounting / Installation Type", type: "select", required: false, options: ["Wall Hung", "Floor Mounted", "Table Top", "Countertop", "Concealed"], section: "Design & Specs", sectionOrder: 2, order: 2 },
    { name: "warranty", label: "Manufacturer Warranty", type: "text", required: false, placeholder: "e.g. 10 Years Ceramic / 5 Years Fitting", section: "Design & Specs", sectionOrder: 2, order: 3 },
    { name: "unit", label: "Unit", type: "select", required: true, options: ["Piece", "Set", "Box", "Kit", "Unit"], section: "Basic Details", sectionOrder: 1, order: 5 },
    { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 4800", section: "Pricing & Stock", sectionOrder: 3, order: 1 },
    { name: "price", label: "Showroom MRP / Retail (₹)", type: "number", required: true, placeholder: "e.g. 7800", section: "Pricing & Stock", sectionOrder: 3, order: 2 },
    { name: "wholesalePrice", label: "Builder / Architect Price (₹)", type: "number", required: false, placeholder: "e.g. 5900", section: "Pricing & Stock", sectionOrder: 3, order: 3 },
    { name: "plumberPrice", label: "Contractor / Plumber Rate (₹)", type: "number", required: false, placeholder: "e.g. 6200", section: "Pricing & Stock", sectionOrder: 3, order: 4 },
    { name: "stock", label: "Display / Warehouse Stock", type: "number", required: true, placeholder: "e.g. 15", section: "Pricing & Stock", sectionOrder: 3, order: 5 },
    { name: "minStock", label: "Minimum Stock Alert", type: "number", required: true, placeholder: "e.g. 3", section: "Pricing & Stock", sectionOrder: 3, order: 6 },
    { name: "warehouseRack", label: "Warehouse Section", type: "text", required: false, placeholder: "e.g. Ceramic Bay 2 - Level 1", section: "Warehouse", sectionOrder: 4, order: 1 }
  ],
  searchableFields: ["brand", "name", "modelNumber", "finish", "sku", "barcode"],
  priceTiers: [
    { key: "wholesalePrice", label: "Architect / Builder Price", tierAliases: ["builder", "architect", "developer"] },
    { key: "plumberPrice", label: "Plumber / Contractor Rate", tierAliases: ["plumber", "contractor", "installer"] }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "Walk-in Homeowner", defaultPriceTier: "retailPrice" },
    { key: "Architect", label: "Architect / Interior Designer", defaultPriceTier: "wholesalePrice", creditAllowed: true },
    { key: "Builder", label: "Real Estate Builder / Contractor", defaultPriceTier: "wholesalePrice", creditAllowed: true },
    { key: "Plumber", label: "Sanitary Technician / Plumber", defaultPriceTier: "plumberPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Project & Builder Outstandings", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Architect", "Builder", "Plumber", "Retail Customer"],
    lowStockFieldMap: { brand: "brand", size: "modelNumber" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["warehouseRack"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    defaultUnit: "Piece"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE", "CREDIT"]
  },
  reportDefinitions: [
    { id: "sanitary_project_summary", title: "Project & Architect Billing Summary", groupingKeys: ["customerType", "brand"], description: "Billing analysis by design partner and manufacturer brand" }
  ],
  labels: {
    inventoryTitle: "Sanitaryware Showroom & Stock",
    customerDueLabel: "Builder / Client Outstanding Ledger",
    supplierDueLabel: "Sanitary Brands Due"
  },
  helpText: {
    finish: "Specify ceramic finish, electroplated color, or PVD coating."
  }
};

// 7. TOOLS
export const TOOLS_VERTICAL: VerticalDefinition = {
  id: "TOOLS",
  businessType: "Industrial Tools & Machinery",
  displayName: "Power Tools & Hand Tools",
  aliases: ["tools", "power tools", "hand tools", "industrial tools", "machinery store", "workshop tools"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Power Tools",
    "Hand Tools",
    "Cutting & Grinding Discs",
    "Drill Bits & Fasteners",
    "Measuring & Leveling",
    "Safety & PPE Equipment"
  ],
  units: ["Piece", "Set", "Box", "Pack", "Kit", "Unit"],
  fields: [
    { name: "name", label: "Tool Name & Specification", type: "text", required: true, placeholder: "e.g. Heavy Duty 4-Inch Angle Grinder 850W", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Bosch, Makita, DeWalt, Stanley, Taparia", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Power Tools", "Hand Tools", "Cutting & Grinding Discs", "Drill Bits & Fasteners", "Measuring & Leveling", "Safety & PPE Equipment"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "modelNumber", label: "Model / Item Code", type: "text", required: true, placeholder: "e.g. GWS 850 / DWE4010", section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "powerRating", label: "Power Rating / Wattage", type: "text", required: false, placeholder: "e.g. 850W, 18V Cordless, 1200 RPM", section: "Specifications", sectionOrder: 2, order: 1 },
    { name: "warranty", label: "Tool Warranty", type: "text", required: false, placeholder: "e.g. 1 Year Official Manufacturer Warranty", section: "Specifications", sectionOrder: 2, order: 2 },
    { name: "unit", label: "Unit", type: "select", required: true, options: ["Piece", "Set", "Box", "Pack", "Kit", "Unit"], section: "Basic Details", sectionOrder: 1, order: 5 },
    { name: "packSize", label: "Box Quantity (for Bits/Blades)", type: "number", required: false, placeholder: "e.g. 25 discs per box", section: "Packaging", sectionOrder: 3, order: 1 },
    { name: "costPrice", label: "Purchase Price (₹)", type: "number", required: true, placeholder: "e.g. 2200", section: "Pricing & Stock", sectionOrder: 4, order: 1 },
    { name: "price", label: "Retail / Counter Price (₹)", type: "number", required: true, placeholder: "e.g. 3100", section: "Pricing & Stock", sectionOrder: 4, order: 2 },
    { name: "wholesalePrice", label: "Contractor / Workshop Rate (₹)", type: "number", required: false, placeholder: "e.g. 2650", section: "Pricing & Stock", sectionOrder: 4, order: 3 },
    { name: "mechanicPrice", label: "Technician / Tradesperson Rate (₹)", type: "number", required: false, placeholder: "e.g. 2800", section: "Pricing & Stock", sectionOrder: 4, order: 4 },
    { name: "stock", label: "Current Stock", type: "number", required: true, placeholder: "e.g. 20", section: "Pricing & Stock", sectionOrder: 4, order: 5 },
    { name: "minStock", label: "Reorder Trigger Level", type: "number", required: true, placeholder: "e.g. 4", section: "Pricing & Stock", sectionOrder: 4, order: 6 },
    { name: "rack", label: "Tool Wall / Shelf Location", type: "text", required: false, placeholder: "e.g. Power Tool Rack A1", section: "Storage", sectionOrder: 5, order: 1 }
  ],
  searchableFields: ["brand", "name", "modelNumber", "sku", "barcode"],
  priceTiers: [
    { key: "wholesalePrice", label: "Contractor Rate", tierAliases: ["contractor", "industrial", "bulk"] },
    { key: "mechanicPrice", label: "Tradesperson Rate", tierAliases: ["tradesperson", "mechanic", "technician", "carpenter", "fabricator"] }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "DIY / Walk-in Customer", defaultPriceTier: "retailPrice" },
    { key: "Tradesperson", label: "Fabricator / Carpenter / Mechanic", defaultPriceTier: "mechanicPrice", creditAllowed: true },
    { key: "Industrial Contractor", label: "Industrial & Site Contractor", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Contractor & Workshop Dues", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Industrial Contractor", "Tradesperson", "Retail Customer"],
    lowStockFieldMap: { brand: "brand", size: "modelNumber" },
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
    allowedPaymentMethods: ["CASH", "UPI", "CARD", "CREDIT"]
  },
  reportDefinitions: [
    { id: "tool_sales_summary", title: "Power Tool vs Consumables Breakdown", groupingKeys: ["category", "brand"], description: "Sales split between high-value tools and repeat consumables" }
  ],
  labels: {
    inventoryTitle: "Tool Stock & Equipment Inventory",
    partNumberLabel: "Model Number",
    customerDueLabel: "Workshop & Contractor Ledger",
    supplierDueLabel: "Tool Distributor Due"
  },
  helpText: {
    modelNumber: "Enter manufacturer model designation (e.g. GWS 850)."
  }
};

// 8. BUILDING_MATERIAL
export const BUILDING_MATERIAL_VERTICAL: VerticalDefinition = {
  id: "BUILDING_MATERIAL",
  businessType: "Building Materials & Cement",
  displayName: "Building Materials, Cement & Steel",
  aliases: ["building material", "cement store", "tmt steel", "sand and aggregate", "building supplies", "construction materials"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Cement (OPC & PPC)",
    "TMT Steel Rebars",
    "Red Bricks & AAC Blocks",
    "Sand & Aggregates",
    "Waterproofing & Construction Chemicals",
    "Roofing Sheets & Wire Mesh"
  ],
  units: ["Bag", "Metric Ton", "Kg", "Piece", "Brass", "Truck Load", "Square Feet"],
  fields: [
    { name: "name", label: "Material Name", type: "text", required: true, placeholder: "e.g. UltraTech Cement PPC 50kg Bag", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Manufacturer / Brand", type: "text", required: true, placeholder: "e.g. UltraTech, Ambuja, Tata Tiscon, JSW Steel", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Cement (OPC & PPC)", "TMT Steel Rebars", "Red Bricks & AAC Blocks", "Sand & Aggregates", "Waterproofing & Construction Chemicals", "Roofing Sheets & Wire Mesh"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "grade", label: "Grade / Specification", type: "text", required: false, placeholder: "e.g. Fe 550D, Grade 53 OPC, PPC Super", section: "Specification", sectionOrder: 2, order: 1 },
    { name: "diameterSize", label: "Bar Diameter / Block Size", type: "text", required: false, placeholder: "e.g. 12mm, 16mm, 8mm, 9x4x3 inch, 600x200x150 mm", section: "Specification", sectionOrder: 2, order: 2 },
    { name: "unit", label: "Billing Unit", type: "select", required: true, options: ["Bag", "Metric Ton", "Kg", "Piece", "Brass", "Truck Load", "Square Feet"], section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 330", section: "Pricing & Stock", sectionOrder: 3, order: 1 },
    { name: "price", label: "Retail / Counter Rate (₹)", type: "number", required: true, placeholder: "e.g. 380", section: "Pricing & Stock", sectionOrder: 3, order: 2 },
    { name: "wholesalePrice", label: "Builder / Contractor Rate (₹)", type: "number", required: true, placeholder: "e.g. 350", section: "Pricing & Stock", sectionOrder: 3, order: 3 },
    { name: "dealerPrice", label: "Sub-Dealer Rate (₹)", type: "number", required: false, placeholder: "e.g. 340", section: "Pricing & Stock", sectionOrder: 3, order: 4 },
    { name: "stock", label: "Yard Stock Quantity", type: "number", required: true, placeholder: "e.g. 1200", section: "Pricing & Stock", sectionOrder: 3, order: 5 },
    { name: "minStock", label: "Minimum Safe Stock Level", type: "number", required: true, placeholder: "e.g. 200", section: "Pricing & Stock", sectionOrder: 3, order: 6 },
    { name: "yardLocation", label: "Stock Yard / Shed Location", type: "text", required: false, placeholder: "e.g. Shed 1 - Covered Cement Bay", section: "Yard Logistics", sectionOrder: 4, order: 1 }
  ],
  searchableFields: ["brand", "name", "grade", "diameterSize", "sku"],
  priceTiers: [
    { key: "wholesalePrice", label: "Builder / Contractor Rate", tierAliases: ["builder", "contractor", "site"] },
    { key: "dealerPrice", label: "Sub-Dealer Rate", tierAliases: ["dealer", "subdealer", "reseller"] }
  ],
  customerTypes: [
    { key: "Direct Home Builder", label: "Individual Home Builder", defaultPriceTier: "retailPrice" },
    { key: "Civil Contractor", label: "Registered Civil Contractor", defaultPriceTier: "wholesalePrice", creditAllowed: true },
    { key: "Real Estate Developer", label: "Real Estate Developer", defaultPriceTier: "wholesalePrice", creditAllowed: true },
    { key: "Sub-Dealer", label: "Village / Town Sub-Dealer", defaultPriceTier: "dealerPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Site Credit & Contractor Receivables", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Civil Contractor", "Real Estate Developer", "Sub-Dealer", "Direct Home Builder"],
    lowStockFieldMap: { brand: "brand", size: "diameterSize" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["yardLocation"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    defaultUnit: "Bag"
  },
  salesBehavior: {
    defaultPriceTier: "wholesalePrice",
    allowedPaymentMethods: ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CREDIT"]
  },
  reportDefinitions: [
    { id: "building_dispatch_summary", title: "Site Dispatch & Contractor Deliveries", groupingKeys: ["customerName", "category"], description: "Daily dispatch volumes by construction site and material type" }
  ],
  labels: {
    inventoryTitle: "Yard Stock & Material Inventory",
    customerDueLabel: "Contractor & Site Outstandings",
    supplierDueLabel: "Cement & Steel Mill Due"
  },
  helpText: {
    stock: "Enter inventory in primary billing units (bags for cement, MT or kg for steel)."
  }
};

// 9. TIMBER
export const TIMBER_VERTICAL: VerticalDefinition = {
  id: "TIMBER",
  businessType: "Timber & Plywood",
  displayName: "Timber, Plywood & Laminates",
  aliases: ["timber", "plywood", "saw mill", "wood store", "laminates and veneer", "timber merchant"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Plywood (Commercial & Marine MR/BWR)",
    "Blockboard & Flush Doors",
    "Decorative Laminates & Sunmica",
    "Natural Teak & Hardwood Logs",
    "Veneers & Edge Banding",
    "Wood Adhesives & Hardware"
  ],
  units: ["Sheet", "Cubic Feet (CFT)", "Piece", "Square Feet", "Kilogram", "Meter"],
  fields: [
    { name: "name", label: "Timber / Board Description", type: "text", required: true, placeholder: "e.g. Marine Grade BWR Plywood 710 19mm 8x4", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand / Sawmill", type: "text", required: true, placeholder: "e.g. Century Ply, Greenply, Kitply, Austin, Teak", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Plywood (Commercial & Marine MR/BWR)", "Blockboard & Flush Doors", "Decorative Laminates & Sunmica", "Natural Teak & Hardwood Logs", "Veneers & Edge Banding", "Wood Adhesives & Hardware"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "woodSpecies", label: "Wood Species / Core Material", type: "text", required: false, placeholder: "e.g. Burma Teak, Gurjan, Pine, Poplar, Red Meranti", section: "Timber Specs", sectionOrder: 2, order: 1 },
    { name: "thickness", label: "Board / Sheet Thickness", type: "text", required: true, placeholder: "e.g. 6mm, 9mm, 12mm, 16mm, 19mm, 25mm, 1mm", section: "Timber Specs", sectionOrder: 2, order: 2 },
    { name: "dimensions", label: "Standard Sheet Dimensions", type: "text", required: false, placeholder: "e.g. 8x4 Feet, 7x4 Feet, 7x3 Feet", section: "Timber Specs", sectionOrder: 2, order: 3 },
    { name: "unit", label: "Billing Unit", type: "select", required: true, options: ["Sheet", "Cubic Feet (CFT)", "Piece", "Square Feet", "Kilogram", "Meter"], section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 1950", section: "Pricing & Stock", sectionOrder: 3, order: 1 },
    { name: "price", label: "Retail / Counter Rate (₹)", type: "number", required: true, placeholder: "e.g. 2650", section: "Pricing & Stock", sectionOrder: 3, order: 2 },
    { name: "wholesalePrice", label: "Contractor Rate (₹)", type: "number", required: false, placeholder: "e.g. 2250", section: "Pricing & Stock", sectionOrder: 3, order: 3 },
    { name: "carpenterPrice", label: "Carpenter / Fabricator Rate (₹)", type: "number", required: false, placeholder: "e.g. 2350", section: "Pricing & Stock", sectionOrder: 3, order: 4 },
    { name: "stock", label: "Current Stock", type: "number", required: true, placeholder: "e.g. 120", section: "Pricing & Stock", sectionOrder: 3, order: 5 },
    { name: "minStock", label: "Reorder Minimum Stock", type: "number", required: true, placeholder: "e.g. 20", section: "Pricing & Stock", sectionOrder: 3, order: 6 },
    { name: "stackLocation", label: "Godown Stack Location", type: "text", required: false, placeholder: "e.g. Godown 2 - Rack Plywood 19mm", section: "Godown Storage", sectionOrder: 4, order: 1 }
  ],
  searchableFields: ["brand", "name", "woodSpecies", "thickness", "dimensions", "sku"],
  priceTiers: [
    { key: "wholesalePrice", label: "Interior Contractor Rate", tierAliases: ["contractor", "interior", "bulk"] },
    { key: "carpenterPrice", label: "Carpenter Rate", tierAliases: ["carpenter", "artisan", "fabricator"] }
  ],
  customerTypes: [
    { key: "Retail Customer", label: "Homeowner", defaultPriceTier: "retailPrice" },
    { key: "Carpenter", label: "Registered Carpenter", defaultPriceTier: "carpenterPrice", creditAllowed: true },
    { key: "Interior Contractor", label: "Interior Designer / Contractor", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Carpenter & Contractor Ledger", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Carpenter", "Interior Contractor", "Retail Customer"],
    lowStockFieldMap: { brand: "brand", size: "thickness" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["stackLocation"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    defaultUnit: "Sheet"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE", "CREDIT"]
  },
  reportDefinitions: [
    { id: "timber_thickness_summary", title: "Timber & Plywood Thickness Turnover", groupingKeys: ["thickness", "brand"], description: "Stock turnover and sales metrics across various sheet calipers" }
  ],
  labels: {
    inventoryTitle: "Timber & Plywood Godown Stock",
    customerDueLabel: "Interior & Carpenter Dues",
    supplierDueLabel: "Sawmill & Ply Mill Due"
  },
  helpText: {
    dimensions: "Standard sheet sizing, typically 8x4 feet (32 sq ft)."
  }
};

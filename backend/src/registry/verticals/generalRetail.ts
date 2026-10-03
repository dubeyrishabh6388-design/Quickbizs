import { VerticalDefinition } from "../types";

export const GROCERY_VERTICAL: VerticalDefinition = {
  id: "GROCERY",
  businessType: "Grocery Store",
  displayName: "Grocery & Kirana",
  aliases: ["grocery", "grocery store", "kirana", "supermarket", "provisions", "fmcg store"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Dairy & Eggs",
    "Staples & Grains",
    "Snacks & Namkeen",
    "Beverages & Drinks",
    "Spices & Edible Oils",
    "Household & Cleaning",
    "Personal Care"
  ],
  units: ["Kg", "Gram", "Litre", "ml", "Packet", "Piece", "Box"],
  fields: [
    { name: "name", label: "Item Name", type: "text", required: true, placeholder: "e.g. Aashirvaad Sharbati Atta 5kg", section: "Basic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. ITC, Tata, Nestle, Fortune", section: "Basic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Dairy & Eggs", "Staples & Grains", "Snacks & Namkeen", "Beverages & Drinks", "Spices & Edible Oils", "Household & Cleaning", "Personal Care"], section: "Basic Details", sectionOrder: 1, order: 3 },
    { name: "unit", label: "Unit", type: "select", required: true, options: ["Kg", "Gram", "Litre", "ml", "Packet", "Piece", "Box"], section: "Basic Details", sectionOrder: 1, order: 4 },
    { name: "weight", label: "Net Weight / Volume", type: "text", required: false, placeholder: "e.g. 500g, 1L, 5kg", section: "Basic Details", sectionOrder: 1, order: 5 },
    { name: "costPrice", label: "Purchase Price (₹)", type: "number", required: true, placeholder: "e.g. 210", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Selling Price / MRP (₹)", type: "number", required: true, placeholder: "e.g. 245", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Wholesale / Khata Price (₹)", type: "number", required: false, placeholder: "e.g. 230", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Shelf Stock", type: "number", required: true, placeholder: "e.g. 50", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Reorder Threshold", type: "number", required: true, placeholder: "e.g. 10", section: "Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "rack", label: "Aisle / Shelf Location", type: "text", required: false, placeholder: "e.g. Aisle 2 - Top Shelf", section: "Inventory", sectionOrder: 3, order: 1 }
  ],
  searchableFields: ["brand", "name", "barcode", "sku", "weight"],
  priceTiers: [
    { key: "wholesalePrice", label: "Wholesale / Khata Rate", tierAliases: ["wholesale", "khata", "bulk"] }
  ],
  customerTypes: [
    { key: "Walk-in Customer", label: "Walk-in Retail", defaultPriceTier: "retailPrice" },
    { key: "Khata Member", label: "Monthly Khata (Credit)", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Khata & Account Receivables", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Khata Member", "Walk-in Customer"],
    lowStockFieldMap: { brand: "brand", size: "weight" },
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
    { id: "grocery_velocity", title: "Fast Moving Kirana Lines", groupingKeys: ["brand", "category"], description: "Daily FMCG Volume Report" }
  ],
  labels: {
    product: "Item",
    products: "Grocery Items",
    code: "Barcode / EAN"
  },
  helpText: {
    barcode: "Scan product retail barcode for rapid POS addition"
  }
};

export const DAIRY_VERTICAL: VerticalDefinition = {
  id: "DAIRY",
  businessType: "Dairy Shop",
  displayName: "Dairy & Milk Booth",
  aliases: ["dairy", "dairy shop", "milk booth", "milk parlour", "dairy parlour"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Fresh Milk",
    "Curd & Buttermilk",
    "Paneer & Tofu",
    "Ghee & Butter",
    "Sweets & Desserts",
    "Bread & Eggs"
  ],
  units: ["Litre", "ml", "Kg", "Gram", "Pouch", "Piece"],
  fields: [
    { name: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. Full Cream Milk 500ml", section: "Dairy Specs", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand / Dairy Co-op", type: "text", required: true, placeholder: "e.g. Amul, Mother Dairy, Nandini, Saras", section: "Dairy Specs", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Fresh Milk", "Curd & Buttermilk", "Paneer & Tofu", "Ghee & Butter", "Sweets & Desserts", "Bread & Eggs"], section: "Dairy Specs", sectionOrder: 1, order: 3 },
    { name: "fatContent", label: "Fat Percentage (%)", type: "text", required: false, placeholder: "e.g. 6.0% (Full Cream), 3.0% (Toned)", section: "Dairy Specs", sectionOrder: 1, order: 4 },
    { name: "shiftTime", label: "Delivery Shift", type: "select", required: false, options: ["Morning Shift", "Evening Shift", "All Day"], section: "Dairy Specs", sectionOrder: 1, order: 5 },
    { name: "costPrice", label: "Procurement Cost (₹)", type: "number", required: true, placeholder: "e.g. 30", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Rate (₹)", type: "number", required: true, placeholder: "e.g. 34", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "catererPrice", label: "Caterer / Hotel Rate (₹)", type: "number", required: false, placeholder: "e.g. 31", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Crater / Pouch Stock", type: "number", required: true, placeholder: "e.g. 100", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Safety Alert Level", type: "number", required: true, placeholder: "e.g. 20", section: "Pricing & Stock", sectionOrder: 2, order: 5 }
  ],
  searchableFields: ["brand", "name", "fatContent"],
  priceTiers: [
    { key: "catererPrice", label: "Hotel / Caterer Price", tierAliases: ["hotel", "caterer", "commercial", "wholesale"] }
  ],
  customerTypes: [
    { key: "Daily Subscriber", label: "Daily Token / Card Holder", defaultPriceTier: "retailPrice" },
    { key: "Hotel / Caterer", label: "Commercial / Tea Stall Partner", defaultPriceTier: "catererPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Caterer & Daily Consumer Balances", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Hotel / Caterer", "Daily Subscriber"],
    lowStockFieldMap: { brand: "brand", fatContent: "fatContent" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: false,
    allowPackConversion: true,
    defaultPackSizeField: "packSize"
  },
  purchaseBehavior: {
    supportsPackConversion: true,
    defaultUnit: "Pouch"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "dairy_shifts", title: "Morning vs Evening Milk Volume", groupingKeys: ["shiftTime"], description: "Shift Performance Analysis" }
  ],
  labels: {
    product: "Milk/Dairy Item",
    products: "Dairy Crates",
    code: "Item Code"
  },
  helpText: {
    fatContent: "State fat and SNF percentages for standardized co-op milk grading"
  }
};

export const BAKERY_VERTICAL: VerticalDefinition = {
  id: "BAKERY",
  businessType: "Bakery",
  displayName: "Bakery & Confectionery",
  aliases: ["bakery", "bakery store", "pastry shop", "patisserie", "confectionery"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Fresh Breads & Buns",
    "Birthday & Custom Cakes",
    "Pastries & Desserts",
    "Cookies & Biscuits",
    "Puffs & Savouries",
    "Chocolates & Gifts"
  ],
  units: ["Piece", "Kg", "Pound", "Box", "Pack"],
  fields: [
    { name: "name", label: "Item Name", type: "text", required: true, placeholder: "e.g. Dutch Truffle Chocolate Cake (1 Kg)", section: "Bakery Details", sectionOrder: 1, order: 1 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Fresh Breads & Buns", "Birthday & Custom Cakes", "Pastries & Desserts", "Cookies & Biscuits", "Puffs & Savouries", "Chocolates & Gifts"], section: "Bakery Details", sectionOrder: 1, order: 2 },
    { name: "eggOrEggless", label: "Egg / Eggless", type: "select", required: true, options: ["100% Eggless", "Contains Egg"], section: "Bakery Details", sectionOrder: 1, order: 3 },
    { name: "flavor", label: "Flavor Profile", type: "text", required: false, placeholder: "e.g. Belgian Chocolate, Red Velvet, Vanilla", section: "Bakery Details", sectionOrder: 1, order: 4 },
    { name: "weightPounds", label: "Weight (Kg / Lb)", type: "text", required: false, placeholder: "e.g. 500g, 1 Kg, 2 Lb", section: "Bakery Details", sectionOrder: 1, order: 5 },
    { name: "costPrice", label: "Kitchen Production Cost (₹)", type: "number", required: true, placeholder: "e.g. 250", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Selling Price (₹)", type: "number", required: true, placeholder: "e.g. 600", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "eventPrice", label: "Event / Bulk Rate (₹)", type: "number", required: false, placeholder: "e.g. 480", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Display Counter Stock", type: "number", required: true, placeholder: "e.g. 10", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Bake Trigger Level", type: "number", required: true, placeholder: "e.g. 2", section: "Pricing & Stock", sectionOrder: 2, order: 5 }
  ],
  searchableFields: ["flavor", "name", "eggOrEggless"],
  priceTiers: [
    { key: "eventPrice", label: "Event & Party Rate", tierAliases: ["event", "corporate", "party", "wholesale"] }
  ],
  customerTypes: [
    { key: "Retail Walk-in", label: "Walk-in Guest", defaultPriceTier: "retailPrice" },
    { key: "Event Planner", label: "Party / Wedding Planner", defaultPriceTier: "eventPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Party & Event Client Receivables", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Event Planner", "Retail Walk-in"],
    lowStockFieldMap: { flavor: "flavor" },
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
    { id: "bakery_flavor_sales", title: "Cake Flavors & Fast Movers", groupingKeys: ["flavor"], description: "Dessert Popularity Metrics" }
  ],
  labels: {
    product: "Baked Good",
    products: "Baked Goods",
    code: "SKU / Code"
  },
  helpText: {
    eggOrEggless: "Prominently displays dietary green/brown indicator at billing"
  }
};

export const SWEET_SHOP_VERTICAL: VerticalDefinition = {
  id: "SWEET_SHOP",
  businessType: "Sweet Shop",
  displayName: "Sweets & Farsan (Mithai)",
  aliases: ["sweet shop", "sweets", "mithai", "mithai shop", "farsan", "halwai"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Desi Ghee Sweets",
    "Milk & Mawa Sweets",
    "Kaju & Dryfruit Sweets",
    "Bengali Syrupy Sweets",
    "Namkeen & Farsan",
    "Festival Gift Hampers"
  ],
  units: ["Kg", "Gram", "Box", "Piece"],
  fields: [
    { name: "name", label: "Mithai Name", type: "text", required: true, placeholder: "e.g. Kaju Katli (Royal Grade)", section: "Sweets Details", sectionOrder: 1, order: 1 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Desi Ghee Sweets", "Milk & Mawa Sweets", "Kaju & Dryfruit Sweets", "Bengali Syrupy Sweets", "Namkeen & Farsan", "Festival Gift Hampers"], section: "Sweets Details", sectionOrder: 1, order: 2 },
    { name: "shelfLifeDays", label: "Shelf Life (Days)", type: "number", required: false, placeholder: "e.g. 7", section: "Sweets Details", sectionOrder: 1, order: 3 },
    { name: "costPrice", label: "Kitchen Cost per Kg (₹)", type: "number", required: true, placeholder: "e.g. 450", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Rate per Kg (₹)", type: "number", required: true, placeholder: "e.g. 880", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Wedding / Corporate Rate (₹)", type: "number", required: false, placeholder: "e.g. 750", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Batch Quantity (Kg)", type: "number", required: true, placeholder: "e.g. 25", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Re-boil Threshold", type: "number", required: true, placeholder: "e.g. 5", section: "Pricing & Stock", sectionOrder: 2, order: 5 }
  ],
  searchableFields: ["name", "category"],
  priceTiers: [
    { key: "wholesalePrice", label: "Wedding & Corporate Gift Rate", tierAliases: ["wedding", "corporate", "wholesale", "bulk"] }
  ],
  customerTypes: [
    { key: "Walk-in Buyer", label: "Walk-in Retail", defaultPriceTier: "retailPrice" },
    { key: "Corporate Client", label: "Corporate Gifting Account", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Corporate & Wedding Due Balances", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Corporate Client", "Walk-in Buyer"],
    lowStockFieldMap: {},
    brandValuationEnabled: false
  },
  inventoryBehavior: {
    trackLocations: false,
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    defaultUnit: "Kg"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "mithai_weight_report", title: "Kg Volume Sold by Category", groupingKeys: ["category"], description: "Mithai Kitchen Output" }
  ],
  labels: {
    product: "Mithai",
    products: "Sweets",
    code: "Batch Code"
  },
  helpText: {
    shelfLifeDays: "Used for fresh stock rotation and daily display guidance"
  }
};

export const STATIONERY_VERTICAL: VerticalDefinition = {
  id: "STATIONERY",
  businessType: "Stationery Store",
  displayName: "Stationery & School Supplies",
  aliases: ["stationery", "stationery store", "school supplies", "office supplies"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Notebooks & Registers",
    "Writing Pens & Pencils",
    "Art & Craft Material",
    "Office Files & Folders",
    "Desk Organizers & Glues",
    "Copier Paper Reams"
  ],
  units: ["Piece", "Pack", "Box", "Dozen", "Ream", "Set"],
  fields: [
    { name: "name", label: "Item Name", type: "text", required: true, placeholder: "e.g. Classmate Long Notebook 172 Pgs", section: "Product Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Classmate, Camlin, Reynolds, JK Copier", section: "Product Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Notebooks & Registers", "Writing Pens & Pencils", "Art & Craft Material", "Office Files & Folders", "Desk Organizers & Glues", "Copier Paper Reams"], section: "Product Details", sectionOrder: 1, order: 3 },
    { name: "gsm", label: "Paper GSM", type: "text", required: false, placeholder: "e.g. 70 GSM, 75 GSM, 80 GSM", section: "Product Details", sectionOrder: 1, order: 4 },
    { name: "costPrice", label: "Cost Price (₹)", type: "number", required: true, placeholder: "e.g. 35", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Price (₹)", type: "number", required: true, placeholder: "e.g. 50", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "School / Institution Rate (₹)", type: "number", required: false, placeholder: "e.g. 40", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Available Stock", type: "number", required: true, placeholder: "e.g. 100", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Min Stock Alert", type: "number", required: true, placeholder: "e.g. 20", section: "Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "rack", label: "Shelf / Rack", type: "text", required: false, placeholder: "e.g. Rack S-01", section: "Pricing & Stock", sectionOrder: 2, order: 6 }
  ],
  searchableFields: ["brand", "gsm", "name", "barcode"],
  priceTiers: [
    { key: "wholesalePrice", label: "School / Institution Rate", tierAliases: ["school", "institution", "college", "wholesale"] }
  ],
  customerTypes: [
    { key: "Student / Walk-in", label: "Student / Walk-in", defaultPriceTier: "retailPrice" },
    { key: "School / College", label: "School / Corporate Account", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "School & Institution Balances", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["School / College", "Student / Walk-in"],
    lowStockFieldMap: { brand: "brand", rack: "rack" },
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
    { id: "stationery_brands", title: "Stationery Brand Sales", groupingKeys: ["brand"], description: "Brand Turnover in Store" }
  ],
  labels: {
    product: "Item",
    products: "Stationery Goods",
    code: "Barcode / Item Code",
    location: "Rack"
  },
  helpText: {
    gsm: "Paper weight thickness rating"
  }
};

export const BOOKSTORE_VERTICAL: VerticalDefinition = {
  id: "BOOKSTORE",
  businessType: "Book Store",
  displayName: "Books & Publications",
  aliases: ["book store", "bookstore", "books", "publications", "library store"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "School & Academic",
    "Competitive Exams",
    "Fiction & Novels",
    "Self-Help & Business",
    "Children & Comics",
    "Stationery & Maps"
  ],
  units: ["Copy", "Set", "Book", "Bundle"],
  fields: [
    { name: "name", label: "Book Title", type: "text", required: true, placeholder: "e.g. NCERT Mathematics Class 10", section: "Book Details", sectionOrder: 1, order: 1 },
    { name: "isbn", label: "ISBN Code", type: "text", required: false, placeholder: "e.g. 978-93-5292-123-4", section: "Book Details", sectionOrder: 1, order: 2 },
    { name: "author", label: "Author / Editor", type: "text", required: false, placeholder: "e.g. R.D. Sharma", section: "Book Details", sectionOrder: 1, order: 3 },
    { name: "publisher", label: "Publisher", type: "text", required: true, placeholder: "e.g. NCERT, S. Chand, Pearson, Penguin", section: "Book Details", sectionOrder: 1, order: 4 },
    { name: "edition", label: "Edition Year", type: "text", required: false, placeholder: "e.g. 2026 Latest Edition", section: "Book Details", sectionOrder: 1, order: 5 },
    { name: "category", label: "Category", type: "select", required: true, options: ["School & Academic", "Competitive Exams", "Fiction & Novels", "Self-Help & Business", "Children & Comics", "Stationery & Maps"], section: "Book Details", sectionOrder: 1, order: 6 },
    { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 140", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Cover Price / MRP (₹)", type: "number", required: true, placeholder: "e.g. 200", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "libraryPrice", label: "Library / School Discount Rate (₹)", type: "number", required: false, placeholder: "e.g. 165", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Copies in Stock", type: "number", required: true, placeholder: "e.g. 30", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Min Stock Level", type: "number", required: true, placeholder: "e.g. 5", section: "Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "rack", label: "Book Rack / Shelf", type: "text", required: false, placeholder: "e.g. Shelf B-4", section: "Pricing & Stock", sectionOrder: 2, order: 6 }
  ],
  searchableFields: ["isbn", "author", "publisher", "name", "rack"],
  priceTiers: [
    { key: "libraryPrice", label: "Library & School Bulk Discount", tierAliases: ["library", "school", "institution", "wholesale"] }
  ],
  customerTypes: [
    { key: "Reader / Student", label: "Student / Walk-in Reader", defaultPriceTier: "retailPrice" },
    { key: "Library / Academy", label: "Library / Coaching Institute", defaultPriceTier: "libraryPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Institutional & Library Dues", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Library / Academy", "Reader / Student"],
    lowStockFieldMap: { author: "author", rack: "rack" },
    brandValuationEnabled: true
  },
  inventoryBehavior: {
    trackLocations: true,
    locationFields: ["rack"],
    allowPackConversion: false
  },
  purchaseBehavior: {
    supportsPackConversion: false,
    defaultUnit: "Copy"
  },
  salesBehavior: {
    defaultPriceTier: "retailPrice",
    allowedPaymentMethods: ["Cash", "UPI", "Card", "Credit", "Split"]
  },
  reportDefinitions: [
    { id: "publisher_sales", title: "Sales by Publisher", groupingKeys: ["publisher"], description: "Publisher Royalty & Margin Analytics" }
  ],
  labels: {
    product: "Book",
    products: "Books",
    code: "ISBN",
    location: "Shelf"
  },
  helpText: {
    isbn: "13-digit International Standard Book Number barcode"
  }
};

export const COSMETICS_VERTICAL: VerticalDefinition = {
  id: "COSMETICS",
  businessType: "Cosmetics Shop",
  displayName: "Cosmetics & Beauty Care",
  aliases: ["cosmetics", "cosmetics shop", "beauty care", "makeup", "skin care", "salon supplies"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Skincare & Serums",
    "Makeup & Foundation",
    "Lipsticks & Shades",
    "Haircare & Colors",
    "Fragrances & Deos",
    "Salon Tools & Waxes"
  ],
  units: ["Piece", "Bottle", "Tube", "Jar", "Pack", "Set"],
  fields: [
    { name: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. Maybelline SuperStay Matte Ink", section: "Cosmetic Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. L'Oreal, Maybelline, Lakme, Sugar, Nykaa", section: "Cosmetic Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Skincare & Serums", "Makeup & Foundation", "Lipsticks & Shades", "Haircare & Colors", "Fragrances & Deos", "Salon Tools & Waxes"], section: "Cosmetic Details", sectionOrder: 1, order: 3 },
    { name: "shade", label: "Shade Code / Name", type: "text", required: false, placeholder: "e.g. Ruby Red 115, Warm Nude 220", section: "Cosmetic Details", sectionOrder: 1, order: 4 },
    { name: "skinType", label: "Skin Type Suitability", type: "select", required: false, options: ["All Skin Types", "Oily Skin", "Dry Skin", "Sensitive"], section: "Cosmetic Details", sectionOrder: 1, order: 5 },
    { name: "costPrice", label: "Cost Price (₹)", type: "number", required: true, placeholder: "e.g. 420", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Retail Price (₹)", type: "number", required: true, placeholder: "e.g. 699", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "salonPrice", label: "Salon Professional Rate (₹)", type: "number", required: false, placeholder: "e.g. 520", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Units Available", type: "number", required: true, placeholder: "e.g. 24", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Min Stock Alert", type: "number", required: true, placeholder: "e.g. 4", section: "Pricing & Stock", sectionOrder: 2, order: 5 },
    { name: "rack", label: "Display Rack", type: "text", required: false, placeholder: "e.g. Rack C-02", section: "Pricing & Stock", sectionOrder: 2, order: 6 }
  ],
  searchableFields: ["brand", "shade", "name", "barcode", "rack"],
  priceTiers: [
    { key: "salonPrice", label: "Salon Professional Price", tierAliases: ["salon", "parlour", "wholesale", "beautician"] }
  ],
  customerTypes: [
    { key: "Retail Consumer", label: "Retail Consumer", defaultPriceTier: "retailPrice" },
    { key: "Beauty Parlour", label: "Beauty Parlour / Salon Owner", defaultPriceTier: "salonPrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue", "lowStockParts"],
    cards: [
      { id: "customer_due_breakdown", title: "Salon Partner Balances", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Beauty Parlour", "Retail Consumer"],
    lowStockFieldMap: { brand: "brand", shade: "shade", rack: "rack" },
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
    { id: "cosmetic_shades", title: "Top Selling Shades & Brands", groupingKeys: ["brand", "shade"], description: "Color Cosmetic Velocity" }
  ],
  labels: {
    product: "Product",
    products: "Beauty Products",
    code: "Barcode / SKU",
    location: "Rack"
  },
  helpText: {
    shade: "Color swatch code for quick verification"
  }
};

export const PAAN_CONVENIENCE_VERTICAL: VerticalDefinition = {
  id: "PAAN_CONVENIENCE",
  businessType: "Paan & Convenience",
  displayName: "Paan, Kiosk & Convenience",
  aliases: ["paan", "paan shop", "kiosk", "convenience", "confectionery kiosk", "tobacco"],
  enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
  defaultCategories: [
    "Fresh Paan & Betel",
    "Mouth Fresheners & Mints",
    "Cold Drinks & Juices",
    "Chocolates & Candies",
    "Snacks & Wafers",
    "Cigarettes & Tobaccos"
  ],
  units: ["Piece", "Packet", "Box", "Tin", "Bottle"],
  fields: [
    { name: "name", label: "Item Name", type: "text", required: true, placeholder: "e.g. Meetha Paan Special", section: "Item Details", sectionOrder: 1, order: 1 },
    { name: "brand", label: "Brand", type: "text", required: false, placeholder: "e.g. Cadbury, Coca Cola, Baba, Rajnigandha", section: "Item Details", sectionOrder: 1, order: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: ["Fresh Paan & Betel", "Mouth Fresheners & Mints", "Cold Drinks & Juices", "Chocolates & Candies", "Snacks & Wafers", "Cigarettes & Tobaccos"], section: "Item Details", sectionOrder: 1, order: 3 },
    { name: "costPrice", label: "Purchase Cost (₹)", type: "number", required: true, placeholder: "e.g. 15", section: "Pricing & Stock", sectionOrder: 2, order: 1 },
    { name: "price", label: "Selling Price / MRP (₹)", type: "number", required: true, placeholder: "e.g. 25", section: "Pricing & Stock", sectionOrder: 2, order: 2 },
    { name: "wholesalePrice", label: "Carton Bulk Price (₹)", type: "number", required: false, placeholder: "e.g. 20", section: "Pricing & Stock", sectionOrder: 2, order: 3 },
    { name: "stock", label: "Stock Available", type: "number", required: true, placeholder: "e.g. 50", section: "Pricing & Stock", sectionOrder: 2, order: 4 },
    { name: "minStock", label: "Min Stock Alert", type: "number", required: true, placeholder: "e.g. 10", section: "Pricing & Stock", sectionOrder: 2, order: 5 }
  ],
  searchableFields: ["brand", "name", "category"],
  priceTiers: [
    { key: "wholesalePrice", label: "Carton / Bulk Rate", tierAliases: ["carton", "box", "wholesale"] }
  ],
  customerTypes: [
    { key: "Walk-in Guest", label: "Walk-in Customer", defaultPriceTier: "retailPrice" },
    { key: "Local Merchant", label: "Neighboring Merchant", defaultPriceTier: "wholesalePrice", creditAllowed: true }
  ],
  dashboard: {
    metrics: ["todaySales", "todayPurchases", "customerDue", "supplierDue"],
    cards: [
      { id: "customer_due_breakdown", title: "Local Merchant Khata Balances", type: "breakdown", gridWidth: "half" }
    ],
    customerDueKeys: ["Local Merchant", "Walk-in Guest"],
    lowStockFieldMap: { brand: "brand" },
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
    allowedPaymentMethods: ["Cash", "UPI", "Credit"]
  },
  reportDefinitions: [
    { id: "paan_top_categories", title: "Top Selling Categories", groupingKeys: ["category"], description: "Kiosk Velocity Analysis" }
  ],
  labels: {
    product: "Item",
    products: "Kiosk Items",
    code: "Barcode"
  },
  helpText: {}
};

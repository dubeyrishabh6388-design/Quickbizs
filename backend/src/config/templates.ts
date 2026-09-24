export interface BusinessTemplateSpec {
  name: string;
  enabledModules: string[];
  defaultCategories: string[];
  dashboardWidgets: string[];
  customAttributes?: { name: string; type: string; required?: boolean }[];
}

export const BUSINESS_TEMPLATES: Record<string, BusinessTemplateSpec> = {
  "Grocery Store": {
    name: "Grocery Store",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "tasks", "ai", "settings"],
    defaultCategories: ["Dairy", "Snacks", "Grocery", "Drinks", "Household"],
    dashboardWidgets: ["Today's Sales", "Low Stock", "Credit Customers", "Top Products"]
  },
  "Clothing Store": {
    name: "Clothing Store",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "reports", "tasks", "ai", "settings"],
    defaultCategories: ["Men", "Women", "Kids", "Accessories"],
    dashboardWidgets: ["Top Brands", "Seasonal Trends", "Size Analytics"],
    customAttributes: [
      { name: "Size", type: "string" },
      { name: "Color", type: "string" },
      { name: "Fabric", type: "string" }
    ]
  },
  "Pharmacy": {
    name: "Pharmacy",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "reports", "tasks", "ai", "settings"],
    defaultCategories: ["Antibiotics", "OTC Medicines", "Surgical Goods", "Wellness Supplies"],
    dashboardWidgets: ["Today's Sales", "Low Stock", "Near Expiry Medicines"],
    customAttributes: [
      { name: "Batch Number", type: "string" },
      { name: "Expiry Date", type: "date" }
    ]
  },
  "Restaurant": {
    name: "Restaurant",
    enabledModules: ["dashboard", "billing", "reports", "staff", "tasks", "ai", "settings"],
    defaultCategories: ["Starters", "Mains", "Desserts", "Beverages"],
    dashboardWidgets: ["Orders", "Tables", "Kitchen Queue"]
  },
  "Electronics Store": {
    name: "Electronics Store",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "tasks", "ai", "settings"],
    defaultCategories: ["Mobile Devices", "Laptops", "Accessories", "Appliances"],
    dashboardWidgets: ["Today's Sales", "Serial Analytics", "High Value Sales"],
    customAttributes: [
      { name: "Warranty", type: "string" },
      { name: "Serial Number", type: "string" }
    ]
  },
  "Mobile Shop": {
    name: "Mobile Shop",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
    defaultCategories: ["Smartphones", "Chargers", "Headphones", "Cases"],
    dashboardWidgets: ["Today's Sales", "IMEI Logs", "Top Products"],
    customAttributes: [
      { name: "IMEI", type: "string" },
      { name: "Warranty", type: "string" }
    ]
  },
  "Footwear Shop": {
    name: "Footwear Shop",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "reports", "settings"],
    defaultCategories: ["Sports Shoes", "Formal Shoes", "Sandals", "Slippers"],
    dashboardWidgets: ["Today's Sales", "Low Stock", "Size Distribution"],
    customAttributes: [
      { name: "Size", type: "string" },
      { name: "Color", type: "string" }
    ]
  },
  "Pharmacy Shop": {
    name: "Pharmacy Shop",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "reports", "settings"],
    defaultCategories: ["Cardiac", "Diabetic", "Vitamins", "Skin Care"],
    dashboardWidgets: ["Today's Sales", "Low Stock", "Expiry Tracking"],
    customAttributes: [
      { name: "Batch Number", type: "string" },
      { name: "Expiry Date", type: "date" }
    ]
  },
  "Medical Store": {
    name: "Medical Store",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "reports", "settings"],
    defaultCategories: ["Medicines", "Baby Care", "Personal Care", "Devices"],
    dashboardWidgets: ["Today's Sales", "Expiry Tracking", "Top Products"],
    customAttributes: [
      { name: "Batch Number", type: "string" },
      { name: "Expiry Date", type: "date" }
    ]
  },
  "Bakery": {
    name: "Bakery",
    enabledModules: ["dashboard", "billing", "inventory", "reports", "settings"],
    defaultCategories: ["Cakes", "Breads", "Pastries", "Cookies"],
    dashboardWidgets: ["Today's Sales", "Fresh Stock Alert", "Top Products"]
  },
  "Hardware Store": {
    name: "Hardware Store",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
    defaultCategories: ["Tools", "Fasteners", "Paints", "Electricals"],
    dashboardWidgets: ["Today's Sales", "Low Stock Alerts", "Supplier Bills"]
  },
  "Furniture Store": {
    name: "Furniture Store",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
    defaultCategories: ["Living Room", "Bedroom", "Office", "Outdoor"],
    dashboardWidgets: ["Today's Sales", "High Value Leads", "Delivery Queue"],
    customAttributes: [
      { name: "Dimensions", type: "string" },
      { name: "Material", type: "string" }
    ]
  },
  "Cosmetics Shop": {
    name: "Cosmetics Shop",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "reports", "settings"],
    defaultCategories: ["Makeup", "Skin Care", "Hair Care", "Fragrances"],
    dashboardWidgets: ["Today's Sales", "Top Brands", "Low Stock"]
  },
  "Jewellery Shop": {
    name: "Jewellery Shop",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "reports", "settings"],
    defaultCategories: ["Gold", "Silver", "Diamond", "Platinum"],
    dashboardWidgets: ["Today's Sales", "Metal Rates", "Top Items"],
    customAttributes: [
      { name: "Purity", type: "string" },
      { name: "Weight", type: "string" }
    ]
  },
  "Sports Shop": {
    name: "Sports Shop",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "reports", "settings"],
    defaultCategories: ["Fitness", "Outdoor Sports", "Indoors", "Sports Wear"],
    dashboardWidgets: ["Today's Sales", "Low Stock", "Top Brands"]
  },
  "Book Store": {
    name: "Book Store",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "reports", "settings"],
    defaultCategories: ["Fiction", "Academic", "Self-Help", "Stationery"],
    dashboardWidgets: ["Today's Sales", "Top Authors", "Low Stock Alert"],
    customAttributes: [
      { name: "Author", type: "string" },
      { name: "ISBN", type: "string" }
    ]
  },
  "Supermarket": {
    name: "Supermarket",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
    defaultCategories: ["Packaged Foods", "Groceries", "Beverages", "Cleaners", "Personal Care"],
    dashboardWidgets: ["Today's Sales", "Low Stock", "Supplier Orders", "Top Products"]
  },
  "Automobile Shop": {
    name: "Automobile Shop",
    enabledModules: ["dashboard", "billing", "inventory", "suppliers", "reports", "settings"],
    defaultCategories: ["Spare Parts", "Lubricants", "Accessories", "Tires"],
    dashboardWidgets: ["Today's Sales", "Supplier Bills", "Top Items"],
    customAttributes: [
      { name: "Part Number", type: "string" },
      { name: "Model Match", type: "string" }
    ]
  },
  "Wholesale Business": {
    name: "Wholesale Business",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
    defaultCategories: ["Bulk Goods", "Raw Materials", "Secondary Packets"],
    dashboardWidgets: ["Bulk Deals Value", "Supplier Dues", "Customer Ledger Balances"]
  },
  "Service Business": {
    name: "Service Business",
    enabledModules: ["dashboard", "billing", "customers", "reports", "staff", "settings"],
    defaultCategories: ["Consulting", "Maintenance", "Custom Services"],
    dashboardWidgets: ["Appointments Value", "Employee Shift Hours", "Monthly Revenue"]
  },
  "Custom Business": {
    name: "Custom Business",
    enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
    defaultCategories: ["General Items", "Misc Goods"],
    dashboardWidgets: ["Today's Sales", "Low Stock", "Top Products"]
  }
};

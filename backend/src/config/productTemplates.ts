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
  sections?: { name: string; fields: ProductFieldSpec[] }[];
  verticalId?: string;
  displayName?: string;
  depthLevel?: string;
  priceTiers?: any[];
  customerTypes?: any[];
  creditRules?: any;
  searchableFields?: string[];
  inventoryBehavior?: any;
  labels?: Record<string, string>;
  helpText?: Record<string, string>;
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
    categories: ["Hand Tools", "Power Tools", "Fasteners & Screws", "Paints & Solvents", "Plumbing & Pipes", "Sanitaryware"],
    units: ["Piece", "Kg", "Box", "Packet", "Meter", "Set"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Bosch, Stanley, Godrej" },
      { name: "material", label: "Material", type: "text", required: false, placeholder: "e.g. Stainless Steel 304, Brass, Mild Steel" },
      { name: "size", label: "Size", type: "text", required: true, placeholder: "e.g. 10mm, 2 inch, M12" },
      { name: "diameter", label: "Diameter", type: "text", required: false, placeholder: "e.g. 8mm, 1/2 inch" },
      { name: "specification", label: "Specification", type: "text", required: false, placeholder: "e.g. Grade 8.8, Fully Threaded" },
      { name: "weight", label: "Weight", type: "text", required: false, placeholder: "e.g. 250g, 1.2 Kg" },
      { name: "unit", label: "Unit", type: "select", required: false, options: ["Piece", "Kg", "Box", "Packet", "Meter", "Set"] },
      { name: "packSize", label: "Pack Size", type: "number", required: false, placeholder: "e.g. 50, 100" },
      { name: "rack", label: "Rack Location", type: "text", required: false, placeholder: "e.g. Rack H-05, Shelf 2" },
      { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 45" },
      { name: "contractorPrice", label: "Contractor Price (₹)", type: "number", required: false, placeholder: "e.g. 48" },
      { name: "sku", label: "SKU Identifier", type: "text", required: false, placeholder: "e.g. HW-BOLT-M12" }
    ]
  },
  "Automobile Shop": {
    businessType: "Automobile Shop",
    categories: ["Engine Parts", "Brake & Clutch", "Suspension & Steering", "Electrical & Lighting", "Filters & Lubricants", "Body & Accessories"],
    units: ["Piece", "Set", "Pair", "Litre", "Kit", "Box"],
    fields: [
      { name: "partNumber", label: "Part Number", type: "text", required: true, placeholder: "e.g. 48820-0K030" },
      { name: "oemNumber", label: "OEM Number", type: "text", required: false, placeholder: "e.g. OEM-TY-8921" },
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Bosch, Denso, Minda, Lucas TVS" },
      { name: "vehicleMake", label: "Vehicle Make", type: "text", required: true, placeholder: "e.g. Maruti Suzuki, Toyota, Hyundai, Tata" },
      { name: "vehicleModel", label: "Vehicle Model", type: "text", required: true, placeholder: "e.g. Swift, Innova Crysta, City, Scorpio" },
      { name: "variant", label: "Variant", type: "text", required: false, placeholder: "e.g. Petrol, Diesel, 2.4 VX, ZXi" },
      { name: "compatibility", label: "Cross Compatibility", type: "text", required: false, placeholder: "e.g. Also fits Fortuner 2016-2022" },
      { name: "rack", label: "Rack", type: "text", required: false, placeholder: "e.g. Rack A-12" },
      { name: "bin", label: "Bin", type: "text", required: false, placeholder: "e.g. Bin 4" },
      { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 1100" },
      { name: "mechanicPrice", label: "Mechanic Price (₹)", type: "number", required: false, placeholder: "e.g. 1150" },
      { name: "warranty", label: "Warranty Period", type: "text", required: false, placeholder: "e.g. 6 Months / 10,000 KM" }
    ]
  },
  "Electrical Store": {
    businessType: "Electrical Store",
    categories: ["Lighting & Bulbs", "Cables & Wires", "Switches & Sockets", "Circuit Breakers & MCBs", "Fans & Appliances", "Pipes & Fittings"],
    units: ["Piece", "Meter", "Roll", "Coil", "Box", "Set"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Havells, Polycab, Philips, Anchor, Legrand" },
      { name: "productType", label: "Product Type", type: "text", required: false, placeholder: "e.g. LED Batten, Modular Switch, 3-Pin Plug, MCB" },
      { name: "wattage", label: "Wattage (W)", type: "text", required: false, placeholder: "e.g. 9W, 12W, 18W, 20W, 1000W" },
      { name: "voltage", label: "Voltage (V)", type: "text", required: false, placeholder: "e.g. 220V-240V AC, 12V DC" },
      { name: "wireGauge", label: "Wire Gauge", type: "text", required: false, placeholder: "e.g. 1.0 sq mm, 1.5 sq mm, 2.5 sq mm, 4.0 sq mm" },
      { name: "colour", label: "Colour", type: "text", required: false, placeholder: "e.g. Warm White, Cool Daylight, Red, Black, White" },
      { name: "capType", label: "Cap Type", type: "text", required: false, placeholder: "e.g. B22, E27, E14" },
      { name: "size", label: "Size", type: "text", required: false, placeholder: "e.g. 1 Meter, 2 Module, 4 Module" },
      { name: "packSize", label: "Pack Size", type: "number", required: false, placeholder: "e.g. 10, 20" },
      { name: "warranty", label: "Warranty", type: "text", required: false, placeholder: "e.g. 1 Year, 2 Years Replacement" },
      { name: "rack", label: "Rack Location", type: "text", required: false, placeholder: "e.g. Rack E-03" },
      { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 260" },
      { name: "contractorPrice", label: "Contractor Price (₹)", type: "number", required: false, placeholder: "e.g. 280" },
      { name: "electricianPrice", label: "Electrician Price (₹)", type: "number", required: false, placeholder: "e.g. 290" }
    ]
  },
  "Auto Parts": {
    businessType: "Auto Parts",
    categories: ["Engine Parts", "Brake & Clutch", "Suspension & Steering", "Electrical & Lighting", "Filters & Lubricants", "Body & Accessories"],
    units: ["Piece", "Set", "Pair", "Litre", "Kit", "Box"],
    fields: [
      { name: "partNumber", label: "Part Number", type: "text", required: true, placeholder: "e.g. 48820-0K030" },
      { name: "oemNumber", label: "OEM Number", type: "text", required: false, placeholder: "e.g. OEM-TY-8921" },
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Bosch, Denso, Minda, Lucas TVS" },
      { name: "vehicleMake", label: "Vehicle Make", type: "text", required: true, placeholder: "e.g. Maruti Suzuki, Toyota, Hyundai, Tata" },
      { name: "vehicleModel", label: "Vehicle Model", type: "text", required: true, placeholder: "e.g. Swift, Innova Crysta, City, Scorpio" },
      { name: "variant", label: "Variant", type: "text", required: false, placeholder: "e.g. Petrol, Diesel, 2.4 VX, ZXi" },
      { name: "compatibility", label: "Cross Compatibility", type: "text", required: false, placeholder: "e.g. Also fits Fortuner 2016-2022" },
      { name: "rack", label: "Rack", type: "text", required: false, placeholder: "e.g. Rack A-12" },
      { name: "bin", label: "Bin", type: "text", required: false, placeholder: "e.g. Bin 4" },
      { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 1100" },
      { name: "mechanicPrice", label: "Mechanic Price (₹)", type: "number", required: false, placeholder: "e.g. 1150" },
      { name: "warranty", label: "Warranty Period", type: "text", required: false, placeholder: "e.g. 6 Months / 10,000 KM" }
    ]
  },
  "Electrical": {
    businessType: "Electrical",
    categories: ["Lighting & Bulbs", "Cables & Wires", "Switches & Sockets", "Circuit Breakers & MCBs", "Fans & Appliances", "Pipes & Fittings"],
    units: ["Piece", "Meter", "Roll", "Coil", "Box", "Set"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Havells, Polycab, Philips, Anchor, Legrand" },
      { name: "productType", label: "Product Type", type: "text", required: false, placeholder: "e.g. LED Batten, Modular Switch, 3-Pin Plug, MCB" },
      { name: "wattage", label: "Wattage (W)", type: "text", required: false, placeholder: "e.g. 9W, 12W, 18W, 20W, 1000W" },
      { name: "voltage", label: "Voltage (V)", type: "text", required: false, placeholder: "e.g. 220V-240V AC, 12V DC" },
      { name: "wireGauge", label: "Wire Gauge", type: "text", required: false, placeholder: "e.g. 1.0 sq mm, 1.5 sq mm, 2.5 sq mm, 4.0 sq mm" },
      { name: "colour", label: "Colour", type: "text", required: false, placeholder: "e.g. Cool Daylight, Warm White, Red, Black, White" },
      { name: "capType", label: "Cap Type", type: "text", required: false, placeholder: "e.g. B22, E27, E14" },
      { name: "size", label: "Size", type: "text", required: false, placeholder: "e.g. 1 Meter, 2 Module, 4 Module" },
      { name: "packSize", label: "Pack Size", type: "number", required: false, placeholder: "e.g. 10, 20" },
      { name: "warranty", label: "Warranty", type: "text", required: false, placeholder: "e.g. 1 Year, 2 Years Replacement" },
      { name: "rack", label: "Rack Location", type: "text", required: false, placeholder: "e.g. Rack E-03" },
      { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 260" },
      { name: "contractorPrice", label: "Contractor Price (₹)", type: "number", required: false, placeholder: "e.g. 280" },
      { name: "electricianPrice", label: "Electrician Price (₹)", type: "number", required: false, placeholder: "e.g. 290" }
    ]
  },
  "Hardware": {
    businessType: "Hardware",
    categories: ["Hand Tools", "Power Tools", "Fasteners & Screws", "Paints & Solvents", "Plumbing & Pipes", "Sanitaryware"],
    units: ["Piece", "Kg", "Box", "Packet", "Meter", "Set"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Bosch, Stanley, Godrej" },
      { name: "material", label: "Material", type: "text", required: false, placeholder: "e.g. Stainless Steel 304, Brass, Mild Steel" },
      { name: "size", label: "Size", type: "text", required: true, placeholder: "e.g. 10mm, 2 inch, M12" },
      { name: "diameter", label: "Diameter", type: "text", required: false, placeholder: "e.g. 8mm, 1/2 inch" },
      { name: "specification", label: "Specification", type: "text", required: false, placeholder: "e.g. Grade 8.8, Fully Threaded" },
      { name: "weight", label: "Weight", type: "text", required: false, placeholder: "e.g. 250g, 1.2 Kg" },
      { name: "unit", label: "Unit", type: "select", required: false, options: ["Piece", "Kg", "Box", "Packet", "Meter", "Set"] },
      { name: "packSize", label: "Pack Size", type: "number", required: false, placeholder: "e.g. 50, 100" },
      { name: "rack", label: "Rack Location", type: "text", required: false, placeholder: "e.g. Rack H-05, Shelf 2" },
      { name: "wholesalePrice", label: "Wholesale Price (₹)", type: "number", required: false, placeholder: "e.g. 45" },
      { name: "contractorPrice", label: "Contractor Price (₹)", type: "number", required: false, placeholder: "e.g. 48" },
      { name: "sku", label: "SKU Identifier", type: "text", required: false, placeholder: "e.g. HW-BOLT-M12" }
    ]
  },
  "Wholesale Business": {
    businessType: "Wholesale Business",
    categories: ["Bulk Commodities", "FMCG Cartons", "Master Packs", "Industrial Supplies", "Raw Materials"],
    units: ["Box", "Carton", "Bag", "Quintal", "Barrel", "Case", "Piece"],
    fields: [
      { name: "brand", label: "Brand / Manufacturer", type: "text", required: false, placeholder: "e.g. ITC, Tata, Generic" },
      { name: "moq", label: "Min Order Quantity (MOQ)", type: "number", required: true, placeholder: "e.g. 10" },
      { name: "packSize", label: "Units Per Carton/Pack", type: "number", required: true, placeholder: "e.g. 24" },
      { name: "wholesalePrice", label: "Wholesale Rate (Bulk)", type: "number", required: false, placeholder: "e.g. 850" },
      { name: "hsnCode", label: "HSN / SAC Code", type: "text", required: false, placeholder: "e.g. 8481.80" }
    ]
  },
  "Footwear Shop": {
    businessType: "Footwear Shop",
    categories: ["Sports Shoes", "Formal Shoes", "Casual Shoes", "Sandals & Slippers", "Kids Footwear"],
    units: ["Pair", "Box", "Piece"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Nike, Bata, Sparx" },
      { name: "size", label: "Size (UK/IND)", type: "select", required: true, options: ["6", "7", "8", "9", "10", "11", "12", "Kids 2", "Kids 3", "Kids 4"] },
      { name: "color", label: "Color", type: "select", required: true, options: ["Black", "Brown", "White", "Navy Blue", "Grey", "Red"] },
      { name: "gender", label: "Target Gender", type: "select", required: true, options: ["Men", "Women", "Unisex", "Kids"] }
    ]
  },
  "Cosmetics Shop": {
    businessType: "Cosmetics Shop",
    categories: ["Makeup", "Skin Care", "Hair Care", "Fragrances"],
    units: ["Piece", "Bottle", "Box", "Set"],
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. L'Oreal" },
      { name: "shade", label: "Shade Code / Name", type: "text", required: false, placeholder: "e.g. Ruby Red 04" },
      { name: "skinType", label: "Skin Condition Suit", type: "select", required: true, options: ["All Types", "Dry Skin", "Oily Skin", "Sensitive"] },
      { name: "expiryDate", label: "Best Before Expiry", type: "date", required: true }
    ]
  },
  "Custom Business": {
    businessType: "Custom Business",
    categories: ["General Items", "Fast Moving", "Misc Goods"],
    units: ["Piece", "Box", "Packet", "Kg", "Litre", "Set"],
    fields: [
      { name: "brand", label: "Brand Name", type: "text", required: false, placeholder: "e.g. Generic" }
    ]
  }
};

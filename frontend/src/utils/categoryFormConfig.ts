/**
 * Category-Aware Form Configuration & Dynamic Placeholders Engine
 * 
 * Provides industry-accurate field labels, realistic placeholders, suppliers,
 * price ranges, and tracking mode defaults for all 29 QuickBizs business verticals.
 */

export interface CategoryFormSpec {
  verticalId: string;
  businessType: string;
  displayName: string;
  nameLabel: string;
  namePlaceholder: string;
  categoryLabel: string;
  supplierLabel: string;
  supplierPlaceholder: string;
  barcodePlaceholder: string;
  costPriceLabel: string;
  costPricePlaceholder: string;
  priceLabel: string;
  pricePlaceholder: string;
  stockLabel: string;
  stockPlaceholder: string;
  minStockLabel: string;
  minStockPlaceholder: string;
  batchLabel: string;
  batchPlaceholder: string;
  serialLabel: string;
  serialPlaceholder: string;
  defaultTrackingMode: "NONE" | "SERIAL" | "BATCH";
  searchPlaceholder: string;
  quickAddPlaceholder: string;
}

export const CATEGORY_FORM_CONFIGS: Record<string, CategoryFormSpec> = {
  // ==========================================
  // 1. HEALTHCARE & MEDICINE
  // ==========================================
  PHARMACY: {
    verticalId: "PHARMACY",
    businessType: "Pharmacy",
    displayName: "Pharmacy & Medical",
    nameLabel: "Medicine Brand Name",
    namePlaceholder: "e.g. Augmentin 625 Duo Tablet, Dolo 650, Azithral 500",
    categoryLabel: "Drug Category",
    supplierLabel: "Preferred Pharma Stockist / Distributor",
    supplierPlaceholder: "e.g. Cipla, Sun Pharma, Abbott, Zydus Distributor",
    barcodePlaceholder: "Scan medicine barcode or strip EAN / GTIN...",
    costPriceLabel: "Purchase Price / PTS (₹)",
    costPricePlaceholder: "145",
    priceLabel: "Retail Price / MRP (₹)",
    pricePlaceholder: "205",
    stockLabel: "Strips / Units in Stock",
    stockPlaceholder: "40",
    minStockLabel: "Min Stock Alert",
    minStockPlaceholder: "10",
    batchLabel: "Medicine Batch Number",
    batchPlaceholder: "e.g. BT-9081, LOT-7731",
    serialLabel: "Serial / DataMatrix",
    serialPlaceholder: "Scan 2D DataMatrix or unit code...",
    defaultTrackingMode: "BATCH",
    searchPlaceholder: "Search by medicine name, salt composition, batch or company...",
    quickAddPlaceholder: "e.g. Augmentin 625 Duo, Dolo 650 Tablet, Paracetamol",
  },

  // ==========================================
  // 2. ELECTRONICS & MOBILE
  // ==========================================
  MOBILE: {
    verticalId: "MOBILE",
    businessType: "Mobile Store",
    displayName: "Mobile Phones & Gadgets",
    nameLabel: "Device / Phone Model",
    namePlaceholder: "e.g. iPhone 15 Pro Max (256GB), Samsung Galaxy S24 Ultra",
    categoryLabel: "Gadget Category",
    supplierLabel: "Authorized Device Distributor / Brand Partner",
    supplierPlaceholder: "e.g. Apple / Samsung Authorized Distributor, Redington",
    barcodePlaceholder: "Scan retail box barcode or UPC...",
    costPriceLabel: "Dealer Landing Cost / DBP (₹)",
    costPricePlaceholder: "68000",
    priceLabel: "Retail Price / MOP (₹)",
    pricePlaceholder: "79900",
    stockLabel: "Handsets / Units in Stock",
    stockPlaceholder: "6",
    minStockLabel: "Min Handsets Alert",
    minStockPlaceholder: "2",
    batchLabel: "Shipment Lot",
    batchPlaceholder: "e.g. LOT-MOB-INDIA-01",
    serialLabel: "Device IMEI / Serial Registry",
    serialPlaceholder: "Scan or enter 15-digit IMEI 1 / IMEI 2...",
    defaultTrackingMode: "SERIAL",
    searchPlaceholder: "Search by phone model, brand, IMEI or serial number...",
    quickAddPlaceholder: "e.g. OnePlus 12 5G (16/512GB), 65W Fast Charger",
  },

  ELECTRONICS: {
    verticalId: "ELECTRONICS",
    businessType: "Electronics Store",
    displayName: "Electronics & Appliances",
    nameLabel: "Appliance / Item Name",
    namePlaceholder: "e.g. 55-inch 4K OLED Smart TV, Inverter Split AC 1.5T",
    categoryLabel: "Appliance Category",
    supplierLabel: "Authorized Electronics C&F / Distributor",
    supplierPlaceholder: "e.g. Sony, Samsung, LG, Voltas Authorized C&F",
    barcodePlaceholder: "Scan appliance carton barcode / EAN...",
    costPriceLabel: "Dealer Billing Price (₹)",
    costPricePlaceholder: "34000",
    priceLabel: "Retail Selling Price / MRP (₹)",
    pricePlaceholder: "42990",
    stockLabel: "Appliance Units in Stock",
    stockPlaceholder: "5",
    minStockLabel: "Reorder Threshold",
    minStockPlaceholder: "1",
    batchLabel: "Manufacturing Lot",
    batchPlaceholder: "e.g. LOT-MFG-2026",
    serialLabel: "Appliance Serial Number (S/N)",
    serialPlaceholder: "Scan or enter Unit Serial Number (S/N)...",
    defaultTrackingMode: "SERIAL",
    searchPlaceholder: "Search by appliance name, brand, model or serial number...",
    quickAddPlaceholder: "e.g. 55-inch OLED TV, Inverter AC 1.5 Ton",
  },

  // ==========================================
  // 3. AUTOMOTIVE & SPARES
  // ==========================================
  AUTO_PARTS: {
    verticalId: "AUTO_PARTS",
    businessType: "Automobile Shop",
    displayName: "Auto Parts & Trade",
    nameLabel: "Part Name",
    namePlaceholder: "e.g. Front Brake Pad Set, Engine Oil 5W-30, Oil Filter",
    categoryLabel: "Component Category",
    supplierLabel: "Auto Spares Distributor / OEM Agency",
    supplierPlaceholder: "e.g. Bosch Authorized Distributor, Minda Logistics",
    barcodePlaceholder: "Scan part barcode or OEM box label...",
    costPriceLabel: "Purchase Price (₹)",
    costPricePlaceholder: "850",
    priceLabel: "Retail Selling Price (₹)",
    pricePlaceholder: "1200",
    stockLabel: "Available Stock",
    stockPlaceholder: "15",
    minStockLabel: "Reorder Level",
    minStockPlaceholder: "3",
    batchLabel: "Manufacturer Batch No.",
    batchPlaceholder: "e.g. LOT-BP-2026, B-48820",
    serialLabel: "Part Serial Number",
    serialPlaceholder: "Scan or enter Part Serial / Barcode...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by part number, OEM number, vehicle model or brand...",
    quickAddPlaceholder: "e.g. Front Brake Pad Set, Engine Oil 5W-30 3.5L",
  },

  // ==========================================
  // 4. GROCERY & FMCG RETAIL
  // ==========================================
  GROCERY: {
    verticalId: "GROCERY",
    businessType: "Grocery Store",
    displayName: "Grocery & Kirana",
    nameLabel: "Item / FMCG Name",
    namePlaceholder: "e.g. Aashirvaad Sharbati Atta 5kg, Fortune Sunflower Oil 1L",
    categoryLabel: "Grocery Category",
    supplierLabel: "FMCG Wholesale Distributor",
    supplierPlaceholder: "e.g. ITC Ltd, HUL, Nestle, Adani Wilmar Stockist",
    barcodePlaceholder: "Scan retail packet barcode (EAN-13)...",
    costPriceLabel: "Wholesale / Inward Cost (₹)",
    costPricePlaceholder: "180",
    priceLabel: "Consumer Selling Price / MRP (₹)",
    pricePlaceholder: "215",
    stockLabel: "Packets / Kg in Stock",
    stockPlaceholder: "50",
    minStockLabel: "Min Stock Alert",
    minStockPlaceholder: "10",
    batchLabel: "Packaging Batch / Lot",
    batchPlaceholder: "e.g. PACK-0926, LOT-FLOUR",
    serialLabel: "SKU Identifier",
    serialPlaceholder: "Scan or enter Barcode SKU...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by item name, brand, weight or barcode...",
    quickAddPlaceholder: "e.g. Fortune Sunflower Oil 1L, Basmati Rice 5kg",
  },

  DAIRY: {
    verticalId: "DAIRY",
    businessType: "Dairy Store",
    displayName: "Dairy & Milk Parlour",
    nameLabel: "Dairy Product Name",
    namePlaceholder: "e.g. Amul Gold Full Cream Milk 500ml, Fresh Malai Paneer 200g",
    categoryLabel: "Dairy Category",
    supplierLabel: "Dairy Cooperative / Milk Union",
    supplierPlaceholder: "e.g. Amul Milk Union, Mother Dairy Cooperative",
    barcodePlaceholder: "Scan pouch or crate barcode...",
    costPriceLabel: "Inward Rate (₹)",
    costPricePlaceholder: "30",
    priceLabel: "Selling Rate / MRP (₹)",
    pricePlaceholder: "34",
    stockLabel: "Pouches / Kg in Stock",
    stockPlaceholder: "100",
    minStockLabel: "Daily Reorder Threshold",
    minStockPlaceholder: "15",
    batchLabel: "Morning / Evening Dispatch Lot",
    batchPlaceholder: "e.g. AMUL-MORN-LOT2",
    serialLabel: "Crate Barcode",
    serialPlaceholder: "Scan crate code...",
    defaultTrackingMode: "BATCH",
    searchPlaceholder: "Search by milk type, fat percentage, pouch or dairy brand...",
    quickAddPlaceholder: "e.g. Full Cream Milk 500ml, Fresh Paneer 200g",
  },

  BAKERY: {
    verticalId: "BAKERY",
    businessType: "Bakery Store",
    displayName: "Bakery & Confectionery",
    nameLabel: "Bakery Item Name",
    namePlaceholder: "e.g. Dutch Truffle Chocolate Cake 1kg, Brown Bread 400g",
    categoryLabel: "Bakery Category",
    supplierLabel: "Bakery Raw Material Supplier",
    supplierPlaceholder: "e.g. Flour & Yeast Wholesaler, Dairy Farm Agency",
    barcodePlaceholder: "Scan bakery tag barcode...",
    costPriceLabel: "Cost of Production (₹)",
    costPricePlaceholder: "280",
    priceLabel: "Retail Selling Price (₹)",
    pricePlaceholder: "550",
    stockLabel: "Fresh Pieces in Stock",
    stockPlaceholder: "20",
    minStockLabel: "Min Shelf Stock",
    minStockPlaceholder: "4",
    batchLabel: "Bake Lot / Batch ID",
    batchPlaceholder: "e.g. BAKE-BATCH-08",
    serialLabel: "Item Barcode",
    serialPlaceholder: "Scan or enter Barcode...",
    defaultTrackingMode: "BATCH",
    searchPlaceholder: "Search by pastry, cake flavor, eggless tag or bread...",
    quickAddPlaceholder: "e.g. Chocolate Truffle Cake, Multigrain Loaf 400g",
  },

  SWEET_SHOP: {
    verticalId: "SWEET_SHOP",
    businessType: "Sweet Shop",
    displayName: "Sweet & Mithai Shop",
    nameLabel: "Mithai / Sweet Name",
    namePlaceholder: "e.g. Kaju Katli (Royal Grade), Desi Ghee Gulab Jamun",
    categoryLabel: "Mithai Category",
    supplierLabel: "Dryfruits & Pure Ghee Supplier",
    supplierPlaceholder: "e.g. Pure Desi Ghee & Dryfruit Wholesaler",
    barcodePlaceholder: "Scan gift box barcode...",
    costPriceLabel: "Raw / Production Cost (₹)",
    costPricePlaceholder: "450",
    priceLabel: "Retail Rate per Kg / Box (₹)",
    pricePlaceholder: "850",
    stockLabel: "Kg / Gift Boxes in Stock",
    stockPlaceholder: "25",
    minStockLabel: "Min Display Stock",
    minStockPlaceholder: "5",
    batchLabel: "Fresh Prep Batch No.",
    batchPlaceholder: "e.g. LOT-MITHAI-14",
    serialLabel: "Box Barcode",
    serialPlaceholder: "Scan or enter Box Barcode...",
    defaultTrackingMode: "BATCH",
    searchPlaceholder: "Search by sweet name, dryfruit grade, box size or namkeen...",
    quickAddPlaceholder: "e.g. Kaju Katli 500g, Motichoor Ladoo 1kg",
  },

  // ==========================================
  // 5. APPAREL, FOOTWEAR & BEAUTY
  // ==========================================
  CLOTHING: {
    verticalId: "CLOTHING",
    businessType: "Clothing Store",
    displayName: "Clothing & Fashion",
    nameLabel: "Garment Name",
    namePlaceholder: "e.g. Slim Fit Cotton Formal Shirt, Denim Jeans 32",
    categoryLabel: "Apparel Category",
    supplierLabel: "Textile Mill / Garment Wholesaler",
    supplierPlaceholder: "e.g. Raymond Mills, Arvind Textiles, Surat Wholesaler",
    barcodePlaceholder: "Scan clothing hangtag barcode / RFID...",
    costPriceLabel: "Wholesale Landing Cost (₹)",
    costPricePlaceholder: "450",
    priceLabel: "Retail Tag MRP (₹)",
    pricePlaceholder: "999",
    stockLabel: "Garments in Stock",
    stockPlaceholder: "30",
    minStockLabel: "Min Size Alert",
    minStockPlaceholder: "5",
    batchLabel: "Season / Production Lot",
    batchPlaceholder: "e.g. LOT-SUMMER-2026",
    serialLabel: "Hangtag Barcode",
    serialPlaceholder: "Scan garment tag barcode / RFID...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by garment name, size, colour, fabric or SKU...",
    quickAddPlaceholder: "e.g. White Oxford Shirt L, Slim Fit Chinos 32",
  },

  FOOTWEAR: {
    verticalId: "FOOTWEAR",
    businessType: "Footwear Store",
    displayName: "Footwear & Shoes",
    nameLabel: "Footwear / Shoe Name",
    namePlaceholder: "e.g. Leather Oxford Formal Shoes UK-9, Running Sneakers",
    categoryLabel: "Footwear Category",
    supplierLabel: "Footwear Brand Agency / Wholesaler",
    supplierPlaceholder: "e.g. Bata India Ltd, Relaxo Footwears Agency",
    barcodePlaceholder: "Scan shoe box barcode...",
    costPriceLabel: "Purchase Price (₹)",
    costPricePlaceholder: "600",
    priceLabel: "Shoe Box MRP (₹)",
    pricePlaceholder: "1299",
    stockLabel: "Pairs in Stock",
    stockPlaceholder: "25",
    minStockLabel: "Min Pair Alert",
    minStockPlaceholder: "4",
    batchLabel: "Shoe Production Batch",
    batchPlaceholder: "e.g. LOT-FW-2026",
    serialLabel: "Shoe Box SKU",
    serialPlaceholder: "Scan shoe box barcode / SKU...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by shoe name, size (UK/US), brand or sole type...",
    quickAddPlaceholder: "e.g. Formal Black Shoes UK-8, Mesh Sneakers UK-9",
  },

  COSMETICS: {
    verticalId: "COSMETICS",
    businessType: "Cosmetics Store",
    displayName: "Cosmetics & Beauty",
    nameLabel: "Beauty Product Name",
    namePlaceholder: "e.g. Matte Finish Liquid Foundation, Maybelline Mascara",
    categoryLabel: "Cosmetics Category",
    supplierLabel: "Master Beauty Brand Distributor",
    supplierPlaceholder: "e.g. L'Oreal, Lakme, Nykaa Master Distributor",
    barcodePlaceholder: "Scan cosmetic product barcode / EAN...",
    costPriceLabel: "Wholesale Cost (₹)",
    costPricePlaceholder: "320",
    priceLabel: "Retail MRP (₹)",
    pricePlaceholder: "499",
    stockLabel: "Units in Stock",
    stockPlaceholder: "40",
    minStockLabel: "Min Stock Level",
    minStockPlaceholder: "8",
    batchLabel: "Batch / Expiry Lot",
    batchPlaceholder: "e.g. EXP-LOT-0927",
    serialLabel: "Shade / Barcode Tag",
    serialPlaceholder: "Scan barcode / shade tag...",
    defaultTrackingMode: "BATCH",
    searchPlaceholder: "Search by product, shade, skin type, fragrance or brand...",
    quickAddPlaceholder: "e.g. Matte Lipstick 05 Red, Waterproof Eyeliner",
  },

  // ==========================================
  // 6. BOOKS, STATIONERY & CONVENIENCE
  // ==========================================
  BOOKSTORE: {
    verticalId: "BOOKSTORE",
    businessType: "Bookstore",
    displayName: "Bookstore & Publishing",
    nameLabel: "Book Title",
    namePlaceholder: "e.g. NCERT Mathematics Class 10, Atomic Habits",
    categoryLabel: "Book Category",
    supplierLabel: "Publisher / Book Distributor",
    supplierPlaceholder: "e.g. Oxford Press, NCERT Depot, Penguin Random House",
    barcodePlaceholder: "Scan 13-digit ISBN Barcode...",
    costPriceLabel: "Publisher Net Price (₹)",
    costPricePlaceholder: "250",
    priceLabel: "Printed Book MRP (₹)",
    pricePlaceholder: "399",
    stockLabel: "Copies in Stock",
    stockPlaceholder: "30",
    minStockLabel: "Reorder Threshold",
    minStockPlaceholder: "5",
    batchLabel: "Print Edition / Year",
    batchPlaceholder: "e.g. 1st Edition / 2026 Print",
    serialLabel: "ISBN Barcode",
    serialPlaceholder: "Scan ISBN Barcode (13 digits)...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by title, author, ISBN or publisher...",
    quickAddPlaceholder: "e.g. NCERT Science Class 10, Oxford English Dictionary",
  },

  STATIONERY: {
    verticalId: "STATIONERY",
    businessType: "Stationery Store",
    displayName: "Stationery & Office",
    nameLabel: "Stationery Item Name",
    namePlaceholder: "e.g. Classmate Long Notebook 172 Pgs, Reynolds Pen Box",
    categoryLabel: "Stationery Category",
    supplierLabel: "Stationery Brand Stockist",
    supplierPlaceholder: "e.g. ITC Classmate, Camlin, Doms Stockist",
    barcodePlaceholder: "Scan product barcode...",
    costPriceLabel: "Purchase Price (₹)",
    costPricePlaceholder: "40",
    priceLabel: "Retail MRP (₹)",
    pricePlaceholder: "65",
    stockLabel: "Units / Bundles in Stock",
    stockPlaceholder: "60",
    minStockLabel: "Min Stock Level",
    minStockPlaceholder: "12",
    batchLabel: "Manufacturer Lot",
    batchPlaceholder: "e.g. BATCH-ST-22",
    serialLabel: "Product Barcode",
    serialPlaceholder: "Scan or enter Barcode...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by item, notebook size, paper GSM, pen or brand...",
    quickAddPlaceholder: "e.g. A4 Paper Rim 500 Sheets, Blue Gel Pen Set",
  },

  PAAN_CONVENIENCE: {
    verticalId: "PAAN_CONVENIENCE",
    businessType: "Paan & Convenience",
    displayName: "Paan & Convenience",
    nameLabel: "Item Name",
    namePlaceholder: "e.g. Meetha Paan Special, Rajnigandha Silver Pearls",
    categoryLabel: "Convenience Category",
    supplierLabel: "Wholesale FMCG & Tobacco Wholesaler",
    supplierPlaceholder: "e.g. Wholesale FMCG & Tobacco Wholesaler",
    barcodePlaceholder: "Scan pouch / SKU barcode...",
    costPriceLabel: "Inward Cost (₹)",
    costPricePlaceholder: "15",
    priceLabel: "Selling Price (₹)",
    pricePlaceholder: "25",
    stockLabel: "Pieces in Stock",
    stockPlaceholder: "80",
    minStockLabel: "Low Stock Trigger",
    minStockPlaceholder: "15",
    batchLabel: "Supply Lot",
    batchPlaceholder: "e.g. LOT-PAAN-01",
    serialLabel: "Item Barcode",
    serialPlaceholder: "Scan barcode / SKU...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by paan type, mints, beverage, tobacco or snack...",
    quickAddPlaceholder: "e.g. Meetha Paan, Mint Drops, Cold Drink 250ml",
  },

  // ==========================================
  // 7. ELECTRICAL, HARDWARE & TOOLS
  // ==========================================
  ELECTRICAL: {
    verticalId: "ELECTRICAL",
    businessType: "Electrical Store",
    displayName: "Electrical & Lighting",
    nameLabel: "Electrical Item Name",
    namePlaceholder: "e.g. LED Batten 20W White, Polycab 1.5 sq mm Wire",
    categoryLabel: "Electrical Category",
    supplierLabel: "Electrical Brand Distributor",
    supplierPlaceholder: "e.g. Havells / Polycab Authorized Distributor",
    barcodePlaceholder: "Scan electrical item barcode / SKU...",
    costPriceLabel: "Purchase Price (₹)",
    costPricePlaceholder: "220",
    priceLabel: "Retail Price (₹)",
    pricePlaceholder: "350",
    stockLabel: "Available Stock",
    stockPlaceholder: "40",
    minStockLabel: "Min Stock Level",
    minStockPlaceholder: "10",
    batchLabel: "Wire Coil / Batch ID",
    batchPlaceholder: "e.g. BATCH-EL-04",
    serialLabel: "Serial / Warranty S/N",
    serialPlaceholder: "Scan or enter Serial / Warranty S/N...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by product, brand, wattage, wire gauge or voltage...",
    quickAddPlaceholder: "e.g. LED Batten 20W, Anchor Modular Switch 6A",
  },

  HARDWARE: {
    verticalId: "HARDWARE",
    businessType: "Hardware Store",
    displayName: "Hardware & Tools",
    nameLabel: "Hardware Product Name",
    namePlaceholder: "e.g. Stainless Steel Hex Bolt M12, Asian Paints Royale 4L",
    categoryLabel: "Hardware Category",
    supplierLabel: "Hardware Depot / Manufacturer",
    supplierPlaceholder: "e.g. Asian Paints Depot, Stanley Black & Decker",
    barcodePlaceholder: "Scan box barcode / SKU...",
    costPriceLabel: "Purchase Price (₹)",
    costPricePlaceholder: "45",
    priceLabel: "Retail Price (₹)",
    pricePlaceholder: "75",
    stockLabel: "Available Stock",
    stockPlaceholder: "100",
    minStockLabel: "Min Stock Alert",
    minStockPlaceholder: "20",
    batchLabel: "Hardware Lot No.",
    batchPlaceholder: "e.g. LOT-BOLT-2026",
    serialLabel: "Serial Number",
    serialPlaceholder: "Scan or enter Serial Number...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by product, size, material, finish or specification...",
    quickAddPlaceholder: "e.g. Hex Bolt M12, 4-inch Brass Door Hinge",
  },

  TOOLS: {
    verticalId: "TOOLS",
    businessType: "Industrial Tools & Machinery",
    displayName: "Power & Hand Tools",
    nameLabel: "Tool / Machinery Description",
    namePlaceholder: "e.g. Bosch 13mm Impact Drill GSB 550, 4-inch Angle Grinder",
    categoryLabel: "Tool Category",
    supplierLabel: "Power Tools Master Distributor",
    supplierPlaceholder: "e.g. Bosch Power Tools Division, Makita Supplier",
    barcodePlaceholder: "Scan tool carton barcode...",
    costPriceLabel: "Dealer Purchase Price (₹)",
    costPricePlaceholder: "2200",
    priceLabel: "Retail Price / MRP (₹)",
    pricePlaceholder: "3100",
    stockLabel: "Units in Stock",
    stockPlaceholder: "15",
    minStockLabel: "Min Shelf Units",
    minStockPlaceholder: "3",
    batchLabel: "Tool Batch / Shipment",
    batchPlaceholder: "e.g. BATCH-TOOL-55",
    serialLabel: "Tool Warranty Serial Number",
    serialPlaceholder: "Scan Tool Serial / S/N for Warranty...",
    defaultTrackingMode: "SERIAL",
    searchPlaceholder: "Search by tool name, model, power rating, chuck size or brand...",
    quickAddPlaceholder: "e.g. Impact Drill 13mm, Angle Grinder 850W",
  },

  // ==========================================
  // 8. PLUMBING, SANITARY & BUILDING
  // ==========================================
  PLUMBING: {
    verticalId: "PLUMBING",
    businessType: "Plumbing Supplies",
    displayName: "Plumbing & Piping",
    nameLabel: "Pipe / Plumbing Fitting",
    namePlaceholder: "e.g. Astral CPVC 1 Inch Pipe 3m, Brass Concealed Stop Valve",
    categoryLabel: "Plumbing Category",
    supplierLabel: "Pipes & Fittings Distributor",
    supplierPlaceholder: "e.g. Astral Pipes Agency, Supreme Industries Dealer",
    barcodePlaceholder: "Scan pipe / fitting barcode...",
    costPriceLabel: "Purchase Price (₹)",
    costPricePlaceholder: "180",
    priceLabel: "Retail Price (₹)",
    pricePlaceholder: "260",
    stockLabel: "Bundles / Pieces in Stock",
    stockPlaceholder: "50",
    minStockLabel: "Min Stock Alert",
    minStockPlaceholder: "10",
    batchLabel: "Extrusion Batch No.",
    batchPlaceholder: "e.g. LOT-PIPE-02",
    serialLabel: "Fitting SKU",
    serialPlaceholder: "Scan fitting barcode / SKU...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by pipe diameter, pressure rating, material (CPVC/UPVC)...",
    quickAddPlaceholder: "e.g. CPVC 1\" Elbow 90 Deg, Brass Ball Valve 1/2\"",
  },

  SANITARY: {
    verticalId: "SANITARY",
    businessType: "Sanitaryware & Bath",
    displayName: "Sanitaryware & Bath",
    nameLabel: "Sanitaryware Item Name",
    namePlaceholder: "e.g. Wall Hung Western Commode White, Ceramic Countertop Basin",
    categoryLabel: "Sanitary Category",
    supplierLabel: "Sanitaryware Wholesale Agency",
    supplierPlaceholder: "e.g. Cera / Jaquar Sanitation Wholesale Agency",
    barcodePlaceholder: "Scan sanitaryware carton barcode...",
    costPriceLabel: "Dealer Net Cost (₹)",
    costPricePlaceholder: "2400",
    priceLabel: "Showroom MRP (₹)",
    pricePlaceholder: "4200",
    stockLabel: "Pieces in Stock",
    stockPlaceholder: "12",
    minStockLabel: "Min Display Units",
    minStockPlaceholder: "2",
    batchLabel: "Ceramic Kiln Lot",
    batchPlaceholder: "e.g. LOT-CERAMIC-01",
    serialLabel: "Product Serial / Barcode",
    serialPlaceholder: "Scan box barcode / serial...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by commode, faucet, washbasin, shower or brand...",
    quickAddPlaceholder: "e.g. Wall Hung Commode, Stainless Steel Basin Mixer",
  },

  BUILDING_MATERIAL: {
    verticalId: "BUILDING_MATERIAL",
    businessType: "Building Materials & Cement",
    displayName: "Building Materials & Cement",
    nameLabel: "Building Material Name",
    namePlaceholder: "e.g. UltraTech Cement PPC 50kg Bag, Tata Tiscon TMT 12mm",
    categoryLabel: "Material Category",
    supplierLabel: "Cement / Steel Stockist",
    supplierPlaceholder: "e.g. UltraTech Depot, Tata Tiscon Stockist",
    barcodePlaceholder: "Scan batch / weighbridge tag...",
    costPriceLabel: "Factory / Depot Cost (₹)",
    costPricePlaceholder: "340",
    priceLabel: "Dealer Retail Price (₹)",
    pricePlaceholder: "385",
    stockLabel: "Bags / Tonnes in Yard",
    stockPlaceholder: "500",
    minStockLabel: "Truckload Reorder Level",
    minStockPlaceholder: "100",
    batchLabel: "Mill Dispatch Week / Lot",
    batchPlaceholder: "e.g. MILL-WEEK-42",
    serialLabel: "Weighbridge Tag",
    serialPlaceholder: "Scan batch / weighbridge tag...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by cement grade, steel diameter (8-25mm), brand...",
    quickAddPlaceholder: "e.g. UltraTech Cement 50kg, TMT Bar 12mm 1 Ton",
  },

  TIMBER: {
    verticalId: "TIMBER",
    businessType: "Timber & Plywood",
    displayName: "Timber & Plywood",
    nameLabel: "Timber / Board Description",
    namePlaceholder: "e.g. Marine Grade BWR Plywood 710 19mm 8x4, Flush Door",
    categoryLabel: "Timber Category",
    supplierLabel: "Plywood Depot / Sawmill Partner",
    supplierPlaceholder: "e.g. Century Ply / Greenply Authorized Depot",
    barcodePlaceholder: "Scan sheet grade barcode / stamp...",
    costPriceLabel: "Mill Wholesale Rate (₹)",
    costPricePlaceholder: "1800",
    priceLabel: "Retail Price per Sheet (₹)",
    pricePlaceholder: "2450",
    stockLabel: "Sheets / Doors in Godown",
    stockPlaceholder: "80",
    minStockLabel: "Min Godown Stock",
    minStockPlaceholder: "15",
    batchLabel: "Hot Press Lot No.",
    batchPlaceholder: "e.g. PRESS-LOT-710",
    serialLabel: "Sheet Stamp Barcode",
    serialPlaceholder: "Scan sheet grade barcode / stamp...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by ply grade (MR/BWR/BWP), thickness (6-19mm), size...",
    quickAddPlaceholder: "e.g. Plywood 19mm 8x4 BWR, Teak Flush Door 32x80",
  },

  // ==========================================
  // 9. TRADE, WHOLESALE & DISTRIBUTION
  // ==========================================
  WHOLESALE: {
    verticalId: "WHOLESALE",
    businessType: "Wholesale Trader",
    displayName: "Wholesale & Bulk Trade",
    nameLabel: "Wholesale Commodity / Item",
    namePlaceholder: "e.g. Basmati Rice Master Bag 25kg, Refined Sugar Carton",
    categoryLabel: "Wholesale Category",
    supplierLabel: "Primary Manufacturer / Grain Mill",
    supplierPlaceholder: "e.g. Primary Grain Mill, FMCG Manufacturer Direct",
    barcodePlaceholder: "Scan master shipper / pallet barcode...",
    costPriceLabel: "Landing Rate / Unit (₹)",
    costPricePlaceholder: "1200",
    priceLabel: "Wholesale Selling Rate (₹)",
    pricePlaceholder: "1380",
    stockLabel: "Master Bags / Bags in Stock",
    stockPlaceholder: "200",
    minStockLabel: "Pallet Reorder Threshold",
    minStockPlaceholder: "30",
    batchLabel: "Milling / Harvest Lot",
    batchPlaceholder: "e.g. LOT-MILL-2026",
    serialLabel: "Pallet Barcode",
    serialPlaceholder: "Scan pallet / master carton barcode...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by commodity name, brand, master pack size or MOQ...",
    quickAddPlaceholder: "e.g. Basmati Rice 25kg Bag, Mustard Oil Tin 15L",
  },

  DISTRIBUTOR: {
    verticalId: "DISTRIBUTOR",
    businessType: "Distributor",
    displayName: "Authorized Distributor",
    nameLabel: "Channel Product SKU",
    namePlaceholder: "e.g. Brand Master Pack 12x1L Units, Carton Outer",
    categoryLabel: "Channel Category",
    supplierLabel: "FMCG Principal Company / C&F Depot",
    supplierPlaceholder: "e.g. FMCG Principal Company / C&F Depot",
    barcodePlaceholder: "Scan carton outer barcode...",
    costPriceLabel: "Primary Depot Billing Rate (₹)",
    costPricePlaceholder: "840",
    priceLabel: "Secondary Distributor Rate (₹)",
    pricePlaceholder: "960",
    stockLabel: "Cases in Warehouse",
    stockPlaceholder: "150",
    minStockLabel: "Min Safety Stock",
    minStockPlaceholder: "25",
    batchLabel: "Depot Dispatch Lot",
    batchPlaceholder: "e.g. LOT-DIST-09",
    serialLabel: "Carton Outer Barcode",
    serialPlaceholder: "Scan case code / carton barcode...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by SKU, master pack size, dealer discount or case...",
    quickAddPlaceholder: "e.g. Case 24x500ml Bottled Water, Carton Biscuits",
  },

  FMCG_DISTRIBUTOR: {
    verticalId: "FMCG_DISTRIBUTOR",
    businessType: "FMCG Distributor",
    displayName: "FMCG Super Stockist",
    nameLabel: "Packaged CPG Line Item",
    namePlaceholder: "e.g. Master Shipper Carton (48 Units x 200g Soap)",
    categoryLabel: "CPG Category",
    supplierLabel: "Principal FMCG Plant / Central Mother Hub",
    supplierPlaceholder: "e.g. Principal FMCG Plant / Central Mother Hub",
    barcodePlaceholder: "Scan outer shipper SSCC / GS1 barcode...",
    costPriceLabel: "Primary Inward Rate (₹)",
    costPricePlaceholder: "1440",
    priceLabel: "Retailer Supply Rate (₹)",
    pricePlaceholder: "1680",
    stockLabel: "Shipper Cartons in Stock",
    stockPlaceholder: "300",
    minStockLabel: "Buffer Threshold",
    minStockPlaceholder: "50",
    batchLabel: "Plant Production Lot",
    batchPlaceholder: "e.g. BATCH-FMCG-90",
    serialLabel: "Shipper SSCC / Barcode",
    serialPlaceholder: "Scan outer shipper SSCC / GS1...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by brand line, shipper carton, units per case or MOQ...",
    quickAddPlaceholder: "e.g. Shipper Carton 48x Soaps, Case Detergent 10x1kg",
  },

  DEALER: {
    verticalId: "DEALER",
    businessType: "Authorized Dealer",
    displayName: "Dealership & Franchise",
    nameLabel: "Machinery / Equipment Unit",
    namePlaceholder: "e.g. Agricultural Pump Set 5HP, Silent Generator 3kVA",
    categoryLabel: "Dealership Category",
    supplierLabel: "OEM Factory / Regional Mother Stockyard",
    supplierPlaceholder: "e.g. OEM Factory / Regional Mother Stockyard",
    barcodePlaceholder: "Scan machine serial / chassis tag...",
    costPriceLabel: "Dealer Inward Landing Cost (₹)",
    costPricePlaceholder: "28000",
    priceLabel: "Ex-Showroom Retail Price (₹)",
    pricePlaceholder: "34500",
    stockLabel: "Units on Floor",
    stockPlaceholder: "8",
    minStockLabel: "Floor Display Min Stock",
    minStockPlaceholder: "2",
    batchLabel: "OEM Assembly Batch",
    batchPlaceholder: "e.g. OEM-MFG-BATCH-3",
    serialLabel: "Chassis / Engine / S/N",
    serialPlaceholder: "Scan or enter Engine / Chassis / S/N...",
    defaultTrackingMode: "SERIAL",
    searchPlaceholder: "Search by machinery model, power output, chassis or serial...",
    quickAddPlaceholder: "e.g. 5HP Submersible Pump, 3kVA Inverter Generator",
  },

  // ==========================================
  // 10. LUXURY & SPECIALTY RETAIL
  // ==========================================
  JEWELLERY: {
    verticalId: "JEWELLERY",
    businessType: "Jewellery Store",
    displayName: "Jewellery & Gold",
    nameLabel: "Ornament / Jewellery Name",
    namePlaceholder: "e.g. 22K Gold Antique Choker Necklace, Solitaire Diamond Ring",
    categoryLabel: "Ornament Category",
    supplierLabel: "Bullion Refiner / Hallmark Merchant",
    supplierPlaceholder: "e.g. Certified Bullion Refiner / Hallmark Merchant",
    barcodePlaceholder: "Scan jewelry tag barcode / HUID...",
    costPriceLabel: "Making & Metal Inward Cost (₹)",
    costPricePlaceholder: "45000",
    priceLabel: "Tag Retail Price (₹)",
    pricePlaceholder: "54000",
    stockLabel: "Pieces in Stock",
    stockPlaceholder: "3",
    minStockLabel: "Vault Min Stock",
    minStockPlaceholder: "1",
    batchLabel: "Hallmark Batch / Lot",
    batchPlaceholder: "e.g. HUID-22K-916-A1",
    serialLabel: "HUID / Unique Hallmark Tag",
    serialPlaceholder: "Scan HUID / Hallmarking Tag...",
    defaultTrackingMode: "SERIAL",
    searchPlaceholder: "Search by ornament name, karat purity (22K/18K), HUID or stones...",
    quickAddPlaceholder: "e.g. 22K Gold Bangle 12g, 925 Silver Anklet",
  },

  OPTICAL: {
    verticalId: "OPTICAL",
    businessType: "Optical Store",
    displayName: "Optical & Eyewear",
    nameLabel: "Frame / Eyewear Name",
    namePlaceholder: "e.g. Titanium Aviator Frame Matte Black, Crizal Anti-Glare Lens",
    categoryLabel: "Eyewear Category",
    supplierLabel: "Optical Brand Distributor",
    supplierPlaceholder: "e.g. Ray-Ban, Essilor, Titan Eye+ Distributor",
    barcodePlaceholder: "Scan frame tag barcode...",
    costPriceLabel: "Wholesale Cost (₹)",
    costPricePlaceholder: "650",
    priceLabel: "Retail MRP (₹)",
    pricePlaceholder: "1800",
    stockLabel: "Pieces in Stock",
    stockPlaceholder: "20",
    minStockLabel: "Min Frame Alert",
    minStockPlaceholder: "3",
    batchLabel: "Lens Coating Batch",
    batchPlaceholder: "e.g. LOT-LENS-04",
    serialLabel: "Frame Barcode / S/N",
    serialPlaceholder: "Scan frame barcode / serial...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by frame model, lens power, anti-glare coating or brand...",
    quickAddPlaceholder: "e.g. Wayfarer Sunglasses Polarized, Blue Cut Lens",
  },

  FURNITURE: {
    verticalId: "FURNITURE",
    businessType: "Furniture Store",
    displayName: "Furniture & Decor",
    nameLabel: "Furniture Item Name",
    namePlaceholder: "e.g. 6-Seater Solid Teak Dining Table, Ergonomic Mesh Chair",
    categoryLabel: "Furniture Category",
    supplierLabel: "Modular Furniture Manufacturer / Workshop",
    supplierPlaceholder: "e.g. Timber Craft Works, Modular Furniture Manufacturer",
    barcodePlaceholder: "Scan piece barcode / batch tag...",
    costPriceLabel: "Workshop / Inward Cost (₹)",
    costPricePlaceholder: "12000",
    priceLabel: "Showroom Price (₹)",
    pricePlaceholder: "18500",
    stockLabel: "Sets / Units in Stock",
    stockPlaceholder: "4",
    minStockLabel: "Min Display Stock",
    minStockPlaceholder: "1",
    batchLabel: "Craft Batch No.",
    batchPlaceholder: "e.g. LOT-WOOD-03",
    serialLabel: "Piece Barcode",
    serialPlaceholder: "Scan piece barcode / batch tag...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search by furniture type, wood material (Teak/Sheesham), dimensions...",
    quickAddPlaceholder: "e.g. Ergonomic Office Chair, Queen Size Bed with Storage",
  },

  // ==========================================
  // 11. GENERIC RETAIL / CUSTOM BUSINESS
  // ==========================================
  GENERIC_RETAIL: {
    verticalId: "GENERIC_RETAIL",
    businessType: "Custom Business",
    displayName: "General Retail",
    nameLabel: "Product Name",
    namePlaceholder: "e.g. Standard Product, Packaged SKU",
    categoryLabel: "Category",
    supplierLabel: "Preferred Supplier",
    supplierPlaceholder: "e.g. Authorized Distributor / Manufacturer",
    barcodePlaceholder: "Scan or enter barcode / SKU...",
    costPriceLabel: "Cost Price (₹)",
    costPricePlaceholder: "800",
    priceLabel: "Retail Price / MRP (₹)",
    pricePlaceholder: "1000",
    stockLabel: "Opening Stock",
    stockPlaceholder: "50",
    minStockLabel: "Reorder Threshold",
    minStockPlaceholder: "5",
    batchLabel: "Manufacturer Batch No.",
    batchPlaceholder: "e.g. B-2026-X99",
    serialLabel: "Serial / IMEI Number",
    serialPlaceholder: "Scan or type IMEI / Serial Number...",
    defaultTrackingMode: "NONE",
    searchPlaceholder: "Search product by name, brand, SKU or barcode...",
    quickAddPlaceholder: "e.g. Standard Retail Item",
  },
};

/**
 * Normalizes input string to resolve exact CategoryFormSpec.
 */
export function getCategoryFormConfig(verticalOrBusinessType?: any): CategoryFormSpec {
  if (!verticalOrBusinessType) {
    return CATEGORY_FORM_CONFIGS.GENERIC_RETAIL;
  }

  // 1. Direct ID or verticalId match
  const rawId = String(
    verticalOrBusinessType.verticalId ||
    verticalOrBusinessType.id ||
    verticalOrBusinessType.businessType ||
    verticalOrBusinessType
  ).trim();

  const upperId = rawId.toUpperCase();
  if (CATEGORY_FORM_CONFIGS[upperId]) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS[upperId], verticalOrBusinessType);
  }

  // 2. Normalize common businessType strings & aliases
  const lower = rawId.toLowerCase();

  // Pharmacy / Chemist / Medical
  if (lower.includes("pharm") || lower.includes("medic") || lower.includes("chemist") || lower.includes("drug")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.PHARMACY, verticalOrBusinessType);
  }

  // Mobile / Smartphone
  if (lower.includes("mobile") || lower.includes("phone") || lower.includes("handset")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.MOBILE, verticalOrBusinessType);
  }

  // Electronics & Appliances
  if (lower.includes("electr") && (lower.includes("appliance") || lower.includes("device") || lower.includes("tv"))) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.ELECTRONICS, verticalOrBusinessType);
  }

  // Auto Parts / Automobile
  if (lower.includes("auto") || lower.includes("car") || lower.includes("motor") || lower.includes("spare")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.AUTO_PARTS, verticalOrBusinessType);
  }

  // Dairy & Milk
  if (lower.includes("dairy") || lower.includes("milk") || lower.includes("paneer")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.DAIRY, verticalOrBusinessType);
  }

  // Bakery & Confectionery
  if (lower.includes("baker") || lower.includes("cake") || lower.includes("pastry")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.BAKERY, verticalOrBusinessType);
  }

  // Sweet Shop & Mithai
  if (lower.includes("sweet") || lower.includes("mithai")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.SWEET_SHOP, verticalOrBusinessType);
  }

  // Clothing & Fashion
  if (lower.includes("cloth") || lower.includes("apparel") || lower.includes("fashion") || lower.includes("garment")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.CLOTHING, verticalOrBusinessType);
  }

  // Footwear & Shoes
  if (lower.includes("footwear") || lower.includes("shoe") || lower.includes("sandal")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.FOOTWEAR, verticalOrBusinessType);
  }

  // Bookstore & Books
  if (lower.includes("book") || lower.includes("publish")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.BOOKSTORE, verticalOrBusinessType);
  }

  // Stationery
  if (lower.includes("stationer") || lower.includes("pen") || lower.includes("notebook")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.STATIONERY, verticalOrBusinessType);
  }

  // Cosmetics & Beauty
  if (lower.includes("cosmetic") || lower.includes("beauty") || lower.includes("makeup")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.COSMETICS, verticalOrBusinessType);
  }

  // Paan & Convenience
  if (lower.includes("paan") || lower.includes("convenience") || lower.includes("kiosk")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.PAAN_CONVENIENCE, verticalOrBusinessType);
  }

  // Electrical Store
  if (lower.includes("electr") || lower.includes("lighting") || lower.includes("wiring")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.ELECTRICAL, verticalOrBusinessType);
  }

  // Hardware Store
  if (lower.includes("hardw") || lower.includes("fastener") || lower.includes("paint")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.HARDWARE, verticalOrBusinessType);
  }

  // Tools & Machinery
  if (lower.includes("tool") || lower.includes("machin")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.TOOLS, verticalOrBusinessType);
  }

  // Plumbing Supplies
  if (lower.includes("plumb") || lower.includes("pipe") || lower.includes("fitting")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.PLUMBING, verticalOrBusinessType);
  }

  // Sanitaryware & Bath
  if (lower.includes("sanitar") || lower.includes("bath") || lower.includes("commode")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.SANITARY, verticalOrBusinessType);
  }

  // Building Material & Cement
  if (lower.includes("cement") || lower.includes("building") || lower.includes("concrete") || lower.includes("steel")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.BUILDING_MATERIAL, verticalOrBusinessType);
  }

  // Timber & Plywood
  if (lower.includes("timber") || lower.includes("plywood") || lower.includes("wood")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.TIMBER, verticalOrBusinessType);
  }

  // FMCG Distributor
  if (lower.includes("fmcg") && lower.includes("distrib")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.FMCG_DISTRIBUTOR, verticalOrBusinessType);
  }

  // Wholesale Trader
  if (lower.includes("wholesale") || lower.includes("bulk")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.WHOLESALE, verticalOrBusinessType);
  }

  // Authorized Distributor
  if (lower.includes("distrib")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.DISTRIBUTOR, verticalOrBusinessType);
  }

  // Dealership & Franchise
  if (lower.includes("dealer") || lower.includes("franchise")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.DEALER, verticalOrBusinessType);
  }

  // Jewellery Store
  if (lower.includes("jewel") || lower.includes("gold") || lower.includes("diamond")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.JEWELLERY, verticalOrBusinessType);
  }

  // Optical Store
  if (lower.includes("optic") || lower.includes("eyewear") || lower.includes("glasses")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.OPTICAL, verticalOrBusinessType);
  }

  // Furniture Store
  if (lower.includes("furnitur") || lower.includes("sofa") || lower.includes("chair")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.FURNITURE, verticalOrBusinessType);
  }

  // Grocery & Kirana
  if (lower.includes("grocer") || lower.includes("kirana") || lower.includes("supermarket") || lower.includes("provision")) {
    return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.GROCERY, verticalOrBusinessType);
  }

  // Fallback to Generic
  return applyCustomFieldOverrides(CATEGORY_FORM_CONFIGS.GENERIC_RETAIL, verticalOrBusinessType);
}

/**
 * If the vertical object has explicit field definitions for core fields,
 * merge their labels and placeholders over the static defaults.
 */
function applyCustomFieldOverrides(base: CategoryFormSpec, verticalObj: any): CategoryFormSpec {
  if (!verticalObj || typeof verticalObj !== "object" || !Array.isArray(verticalObj.fields)) {
    return base;
  }

  const spec = { ...base };

  const nameField = verticalObj.fields.find((f: any) => f.name === "name");
  if (nameField) {
    if (nameField.label) spec.nameLabel = nameField.label;
    if (nameField.placeholder) spec.namePlaceholder = nameField.placeholder;
  }

  const priceField = verticalObj.fields.find((f: any) => f.name === "price");
  if (priceField) {
    if (priceField.label) spec.priceLabel = priceField.label;
    if (priceField.placeholder) spec.pricePlaceholder = priceField.placeholder;
  }

  const costField = verticalObj.fields.find((f: any) => f.name === "costPrice");
  if (costField) {
    if (costField.label) spec.costPriceLabel = costField.label;
    if (costField.placeholder) spec.costPricePlaceholder = costField.placeholder;
  }

  const stockField = verticalObj.fields.find((f: any) => f.name === "stock");
  if (stockField) {
    if (stockField.label) spec.stockLabel = stockField.label;
    if (stockField.placeholder) spec.stockPlaceholder = stockField.placeholder;
  }

  const minStockField = verticalObj.fields.find((f: any) => f.name === "minStock");
  if (minStockField) {
    if (minStockField.label) spec.minStockLabel = minStockField.label;
    if (minStockField.placeholder) spec.minStockPlaceholder = minStockField.placeholder;
  }

  const batchField = verticalObj.fields.find((f: any) => f.name === "batchNumber");
  if (batchField) {
    if (batchField.label) spec.batchLabel = batchField.label;
    if (batchField.placeholder) spec.batchPlaceholder = batchField.placeholder;
  }

  return spec;
}

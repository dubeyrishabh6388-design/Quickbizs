export type Language = "en" | "hi";

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    close: string;
    actions: string;
    back: string;
    confirm: string;
    status: string;
    total: string;
    amount: string;
    date: string;
    time: string;
    loading: string;
    success: string;
    error: string;
    all: string;
    today: string;
    yesterday: string;
    thisWeek: string;
    thisMonth: string;
    allTime: string;
    yes: string;
    no: string;
    viewAll: string;
    download: string;
    print: string;
    share: string;
    required: string;
    optional: string;
    items: string;
    qty: string;
    price: string;
    unit: string;
    notes: string;
    description: string;
    category: string;
    phone: string;
    name: string;
    address: string;
    reset: string;
    active: string;
    disabled: string;
    pending: string;
    approved: string;
    rejected: string;
    completed: string;
    paid: string;
    unpaid: string;
    credit: string;
    cash: string;
    upi: string;
  };
  nav: {
    dashboard: string;
    incomingOrders: string;
    billing: string;
    counter: string;
    inventory: string;
    customers: string;
    recovery: string;
    suppliers: string;
    expenses: string;
    staff: string;
    reports: string;
    ai: string;
    settings: string;
    superadmin: string;
  };
  roles: {
    owner: string;
    manager: string;
    cashier: string;
    accountant: string;
    warehouse: string;
    employee: string;
    superadmin: string;
  };
  header: {
    searchPlaceholder: string;
    aiCopilot: string;
    lightMode: string;
    darkMode: string;
    switchRole: string;
    unlockCounter: string;
    lockCounter: string;
    notifications: string;
    language: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    todaySales: string;
    totalOrders: string;
    netProfit: string;
    lowStockAlerts: string;
    pendingUdhaar: string;
    fastActions: string;
    recentBills: string;
    topSellingItems: string;
    salesDropAlert: string;
    healthScore: string;
  };
  billing: {
    title: string;
    subtitle: string;
    searchProducts: string;
    allCategories: string;
    customerGroup: string;
    walkinCustomer: string;
    selectCustomer: string;
    addNewCustomer: string;
    cartEmpty: string;
    cartSummary: string;
    subtotal: string;
    groupDiscount: string;
    gstTax: string;
    roundOff: string;
    grandTotal: string;
    paymentMode: string;
    completeBill: string;
    instantBill: string;
    invoiceReceipt: string;
    printThermal: string;
    sendWhatsapp: string;
    splitPayment: string;
    cashAmount: string;
    upiAmount: string;
  };
  counter: {
    title: string;
    subtitle: string;
    rushMode: string;
    fastTerminal: string;
    exactCash: string;
    changeDue: string;
    clearCart: string;
    holdBill: string;
    queueOrders: string;
    touchPresets: string;
  };
  inventory: {
    title: string;
    subtitle: string;
    totalProducts: string;
    inStock: string;
    lowStock: string;
    outOfStock: string;
    addProduct: string;
    productName: string;
    barcode: string;
    sellingPrice: string;
    costPrice: string;
    stockQty: string;
    minStockThreshold: string;
    supplierName: string;
    importExport: string;
  };
  customers: {
    title: string;
    subtitle: string;
    totalCustomers: string;
    totalPendingDues: string;
    advancedPaid: string;
    settleDues: string;
    sendWhatsappReminder: string;
    addCustomer: string;
    customerHistory: string;
    phoneLabel: string;
    duesHistory: string;
  };
  recovery: {
    title: string;
    subtitle: string;
    totalDebt: string;
    highRiskDebt: string;
    recoveredToday: string;
    callCustomer: string;
    sendUrgentReminder: string;
    debtCollectionRate: string;
  };
  suppliers: {
    title: string;
    subtitle: string;
    totalSuppliers: string;
    totalPayables: string;
    createPO: string;
    settlePayment: string;
    restockCatalog: string;
    contactPerson: string;
  };
  expenses: {
    title: string;
    subtitle: string;
    totalExpenses: string;
    todayExpenses: string;
    thisMonth: string;
    pendingApproval: string;
    logNewExpense: string;
    categoryBreakdown: string;
    teaSnacks: string;
    electricity: string;
    rent: string;
    salary: string;
    other: string;
    approveExpense: string;
    deleteExpense: string;
    loggedBy: string;
  };
  staff: {
    title: string;
    subtitle: string;
    staffMembers: string;
    presentToday: string;
    absentToday: string;
    lateToday: string;
    markAttendance: string;
    monthlyMusterRoll: string;
    attendancePercent: string;
    exportCsv: string;
  };
  reports: {
    title: string;
    subtitle: string;
    grossSales: string;
    storeExpenses: string;
    estimatedNetProfit: string;
    grossMargin: string;
    paymentSplit: string;
    topMovingProducts: string;
    posLedger: string;
    digitalPickups: string;
    aiAudit: string;
  };
  settings: {
    title: string;
    subtitle: string;
    storeProfile: string;
    billingPickups: string;
    staffRoles: string;
    securitySystem: string;
    shopName: string;
    contactPhone: string;
    openingHours: string;
    storeAddress: string;
    invoicePrefix: string;
    receiptFooter: string;
    gstSetup: string;
    calculateGst: string;
    gstRate: string;
    gstinNumber: string;
    digitalPickups: string;
    operatingModel: string;
    soloMerchant: string;
    multiStaff: string;
    ownerPin: string;
    changePassword: string;
    backupDatabase: string;
    signout: string;
    saveChanges: string;
    languageTitle: string;
    languageDesc: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      filter: "Filter",
      close: "Close",
      actions: "Actions",
      back: "Back",
      confirm: "Confirm",
      status: "Status",
      total: "Total",
      amount: "Amount",
      date: "Date",
      time: "Time",
      loading: "Loading...",
      success: "Success",
      error: "Error",
      all: "All",
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      thisMonth: "This Month",
      allTime: "All Time",
      yes: "Yes",
      no: "No",
      viewAll: "View All",
      download: "Download",
      print: "Print",
      share: "Share",
      required: "Required",
      optional: "Optional",
      items: "Items",
      qty: "Qty",
      price: "Price",
      unit: "Unit",
      notes: "Notes",
      description: "Description",
      category: "Category",
      phone: "Phone",
      name: "Name",
      address: "Address",
      reset: "Reset",
      active: "Active",
      disabled: "Disabled",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      completed: "Completed",
      paid: "Paid",
      unpaid: "Unpaid",
      credit: "Credit (Udhaar)",
      cash: "Cash",
      upi: "UPI",
    },
    nav: {
      dashboard: "Dashboard",
      incomingOrders: "Incoming Orders",
      billing: "Billing / POS",
      counter: "Counter Mode",
      inventory: "Inventory",
      customers: "Customers & Khata",
      recovery: "Udhaar & Recovery",
      suppliers: "Suppliers",
      expenses: "Expenses",
      staff: "Staff Attendance",
      reports: "Business Reports",
      ai: "AI Assistant",
      settings: "Store Settings",
      superadmin: "Admin Console",
    },
    roles: {
      owner: "Business Owner",
      manager: "Store Manager",
      cashier: "Cashier Terminal",
      accountant: "Store Accountant",
      warehouse: "Warehouse Staff",
      employee: "Staff Employee",
      superadmin: "SaaS Super Admin",
    },
    header: {
      searchPlaceholder: "Search products, customers, bills... (Ctrl+K)",
      aiCopilot: "AI Copilot",
      lightMode: "Switch to Light Mode",
      darkMode: "Switch to Dark Mode",
      switchRole: "Switch Persona",
      unlockCounter: "Unlock Confidential Terminal",
      lockCounter: "Lock Counter",
      notifications: "Notifications",
      language: "Language",
    },
    dashboard: {
      title: "Store Performance & Daily Sales Cockpit",
      subtitle: "Real-time revenue, customer dues, inventory health & quick shortcuts",
      todaySales: "Today's Gross Sales",
      totalOrders: "Bills Completed",
      netProfit: "Estimated Net Profit",
      lowStockAlerts: "Low Stock SKUs",
      pendingUdhaar: "Pending Khata Dues",
      fastActions: "Quick POS Actions",
      recentBills: "Today's Completed Bills",
      topSellingItems: "Top Selling Items Today",
      salesDropAlert: "Sales Drop Diagnostic",
      healthScore: "Store Health Score",
    },
    billing: {
      title: "Point of Sale (POS) Billing",
      subtitle: "Fast barcode checkout, automated pricing tiers & receipt print",
      searchProducts: "Scan barcode or search product name...",
      allCategories: "All Categories",
      customerGroup: "Customer Group",
      walkinCustomer: "Walk-in Customer",
      selectCustomer: "Select / Add Customer",
      addNewCustomer: "New Customer",
      cartEmpty: "Cart is currently empty",
      cartSummary: "Invoice Summary",
      subtotal: "Subtotal",
      groupDiscount: "Customer Discount",
      gstTax: "GST Tax",
      roundOff: "Round Off",
      grandTotal: "Grand Total",
      paymentMode: "Payment Method",
      completeBill: "Complete & Print Invoice",
      instantBill: "Instant Bill",
      invoiceReceipt: "Customer Receipt",
      printThermal: "Print Thermal Receipt",
      sendWhatsapp: "Send WhatsApp Receipt",
      splitPayment: "Split Cash + UPI",
      cashAmount: "Cash Amount (₹)",
      upiAmount: "UPI Amount (₹)",
    },
    counter: {
      title: "Express Counter Mode",
      subtitle: "Ultra high-speed 1-touch terminal for rush hours",
      rushMode: "Rush Hour Mode",
      fastTerminal: "Express Terminal",
      exactCash: "Exact Cash",
      changeDue: "Change to Return",
      clearCart: "Clear Order",
      holdBill: "Hold Order",
      queueOrders: "Parked Order Queues",
      touchPresets: "Quick Item Presets",
    },
    inventory: {
      title: "Inventory & Stock Management",
      subtitle: "Product catalog, barcode generation, low stock alerts & purchase restocking",
      totalProducts: "Total Products",
      inStock: "In Stock",
      lowStock: "Low Stock Alert",
      outOfStock: "Out of Stock",
      addProduct: "Add New Product",
      productName: "Product Name",
      barcode: "Barcode",
      sellingPrice: "Selling Price (₹)",
      costPrice: "Cost Price (₹)",
      stockQty: "Available Stock",
      minStockThreshold: "Min Stock Alert",
      supplierName: "Supplier",
      importExport: "Import / Export CSV",
    },
    customers: {
      title: "Customers & Khata Ledger",
      subtitle: "Manage customer profiles, credit limits, pending dues & collection reminders",
      totalCustomers: "Total Customers",
      totalPendingDues: "Total Outstanding Udhaar",
      advancedPaid: "Advance Payments",
      settleDues: "Collect Dues",
      sendWhatsappReminder: "Send WhatsApp Reminder",
      addCustomer: "Add New Customer",
      customerHistory: "Transaction & Credit History",
      phoneLabel: "Mobile Phone",
      duesHistory: "Pending Balance",
    },
    recovery: {
      title: "Udhaar & Debt Recovery Center",
      subtitle: "Automated debt recovery queue, high-risk flags & 1-tap WhatsApp collections",
      totalDebt: "Total Capital Trapped",
      highRiskDebt: "High-Risk Overdue (>30 Days)",
      recoveredToday: "Recovered Today",
      callCustomer: "Call Directly",
      sendUrgentReminder: "Send Urgent Reminder",
      debtCollectionRate: "Recovery Success Rate",
    },
    suppliers: {
      title: "Suppliers & Purchase Orders",
      subtitle: "Vendor directory, replenishment purchase orders, and payable bills ledger",
      totalSuppliers: "Active Suppliers",
      totalPayables: "Total Supplier Payables",
      createPO: "Create Purchase Order",
      settlePayment: "Pay Supplier",
      restockCatalog: "Restock Inventory",
      contactPerson: "Contact Person",
    },
    expenses: {
      title: "Store Expenses & Ledger",
      subtitle: "Record daily shop overheads, staff tea/snacks, electricity bills, rent & track total expenses",
      totalExpenses: "Total Expenses",
      todayExpenses: "Today's Expenses",
      thisMonth: "This Month's Outflow",
      pendingApproval: "Pending Approval",
      logNewExpense: "Log New Expense",
      categoryBreakdown: "Expense Category Breakdown",
      teaSnacks: "Tea / Snacks",
      electricity: "Electricity Bill",
      rent: "Shop Rent",
      salary: "Staff Salary",
      other: "Other Expense",
      approveExpense: "Approve",
      deleteExpense: "Delete",
      loggedBy: "Logged By",
    },
    staff: {
      title: "Staff & Attendance Operations",
      subtitle: "Employee muster roll, daily attendance register, shift status & monthly payroll",
      staffMembers: "Staff Members",
      presentToday: "Present Today",
      absentToday: "Absent Today",
      lateToday: "Late Marks",
      markAttendance: "Mark Attendance",
      monthlyMusterRoll: "Monthly Muster Roll",
      attendancePercent: "Attendance Rate",
      exportCsv: "Export CSV",
    },
    reports: {
      title: "Business & Financial Reports",
      subtitle: "Live store profitability, root-cause diagnosis, daily sales trends & pickup performance",
      grossSales: "Gross Sales",
      storeExpenses: "Store Expenses",
      estimatedNetProfit: "Estimated Net Profit",
      grossMargin: "Gross Margin",
      paymentSplit: "Payment Method Split",
      topMovingProducts: "Top Performing Items Today",
      posLedger: "POS Daily Ledger & P&L",
      digitalPickups: "Digital Pickups",
      aiAudit: "AI Store Audit",
    },
    settings: {
      title: "Store & System Settings",
      subtitle: "Store profile, bill receipt design, department access control & security keys",
      storeProfile: "Store Profile",
      billingPickups: "Billing & Pickups",
      staffRoles: "Staff & Roles (RBAC)",
      securitySystem: "Security & System",
      shopName: "Store / Business Name",
      contactPhone: "Contact Phone Number",
      openingHours: "Opening Hours",
      storeAddress: "Store Address",
      invoicePrefix: "Invoice Prefix Code",
      receiptFooter: "Receipt Footer Note",
      gstSetup: "Goods & Services Tax (GST) Setup",
      calculateGst: "Calculate GST on POS Invoices",
      gstRate: "GST Rate Percentage (%)",
      gstinNumber: "Store GSTIN Number (Tax ID)",
      digitalPickups: "Customer Digital Pickups",
      operatingModel: "Store Operating Model",
      soloMerchant: "Solo Shopkeeper",
      multiStaff: "Multi-Staff Counter",
      ownerPin: "4-Digit Owner Security PIN",
      changePassword: "Change Account Password",
      backupDatabase: "Store Database Backup",
      signout: "Sign Out of Store Account",
      saveChanges: "Save Changes",
      languageTitle: "Application Display Language",
      languageDesc: "Choose your preferred language across the entire application",
    },
  },
  hi: {
    common: {
      save: "सुरक्षित करें (Save)",
      cancel: "रद्द करें (Cancel)",
      delete: "हटाएं (Delete)",
      edit: "संपादित करें (Edit)",
      add: "जोड़ें (Add)",
      search: "खोजें (Search)",
      filter: "फ़िल्टर करें (Filter)",
      close: "बंद करें (Close)",
      actions: "कार्रवाई (Actions)",
      back: "पीछे जाएं (Back)",
      confirm: "पुष्टि करें (Confirm)",
      status: "स्थिति (Status)",
      total: "कुल (Total)",
      amount: "राशि (Amount)",
      date: "दिनांक (Date)",
      time: "समय (Time)",
      loading: "लोड हो रहा है...",
      success: "सफल",
      error: "त्रुटि",
      all: "सभी (All)",
      today: "आज (Today)",
      yesterday: "कल (Yesterday)",
      thisWeek: "इस सप्ताह",
      thisMonth: "इस महीने",
      allTime: "कुल समय (All Time)",
      yes: "हाँ",
      no: "नहीं",
      viewAll: "सभी देखें",
      download: "डाउनलोड करें",
      print: "प्रिंट करें",
      share: "साझा करें",
      required: "आवश्यक",
      optional: "वैकल्पिक",
      items: "वस्तुएं (Items)",
      qty: "मात्रा (Qty)",
      price: "कीमत (Price)",
      unit: "इकाई (Unit)",
      notes: "टिप्पणी (Notes)",
      description: "विवरण (Description)",
      category: "श्रेणी (Category)",
      phone: "फ़ोन नंबर",
      name: "नाम",
      address: "पता",
      reset: "रीसेट करें",
      active: "सक्रिय (Active)",
      disabled: "निष्क्रिय (Disabled)",
      pending: "लंबित (Pending)",
      approved: "स्वीकृत (Approved)",
      rejected: "अस्वीकृत (Rejected)",
      completed: "पूर्ण (Completed)",
      paid: "भुगतान हुआ (Paid)",
      unpaid: "अदत्त (Unpaid)",
      credit: "उधार (Credit)",
      cash: "नकद (Cash)",
      upi: "यूपीआई (UPI)",
    },
    nav: {
      dashboard: "डैशबोर्ड (Dashboard)",
      incomingOrders: "आने वाले ऑर्डर्स",
      billing: "बिलिंग / पीओएस (Billing)",
      counter: "काउंटर मोड (Counter)",
      inventory: "इन्वेंट्री / स्टॉक",
      customers: "ग्राहक और खाता (Khata)",
      recovery: "उधार वसूली (Recovery)",
      suppliers: "सप्लायर्स (Suppliers)",
      expenses: "दुकान खर्चे (Expenses)",
      staff: "स्टाफ उपस्थिति (Staff)",
      reports: "व्यापार रिपोर्ट्स (Reports)",
      ai: "एआई सहायक (AI Assistant)",
      settings: "स्टोर सेटिंग्स (Settings)",
      superadmin: "एडमिन कंसोल",
    },
    roles: {
      owner: "दुकान मालिक (Owner)",
      manager: "स्टोर मैनेजर (Manager)",
      cashier: "कैशियर काउंटर (Cashier)",
      accountant: "मुनीम / एकाउंटेंट (Accountant)",
      warehouse: "गोदाम स्टाफ (Warehouse)",
      employee: "कर्मचारी (Staff)",
      superadmin: "मास्टर एडमिन (SuperAdmin)",
    },
    header: {
      searchPlaceholder: "सामान, ग्राहक, बिल नंबर खोजें... (Ctrl+K)",
      aiCopilot: "एआई कॉपायलट",
      lightMode: "लाइट मोड चालू करें",
      darkMode: "डार्क मोड चालू करें",
      switchRole: "रोल बदलें",
      unlockCounter: "मालिक पिन से अनलॉक करें",
      lockCounter: "काउंटर लॉक करें",
      notifications: "सूचनाएं (Notifications)",
      language: "भाषा (Language)",
    },
    dashboard: {
      title: "दुकान बिक्री और व्यापार डैशबोर्ड",
      subtitle: "आज की कुल बिक्री, ग्राहक उधारी, स्टॉक की स्थिति और तेज शॉर्टकट्स",
      todaySales: "आज की कुल बिक्री (Sales)",
      totalOrders: "कुल कटे बिल (Bills)",
      netProfit: "अनुमानित शुद्ध लाभ (Net Profit)",
      lowStockAlerts: "खत्म होता सामान (Low Stock)",
      pendingUdhaar: "बाकी कुल उधारी (Udhaar)",
      fastActions: "तेज बिलिंग शॉर्टकट्स",
      recentBills: "आज के पूरे किए गए बिल",
      topSellingItems: "आज सबसे ज्यादा बिकने वाले सामान",
      salesDropAlert: "बिक्री में गिरावट का विश्लेषण",
      healthScore: "दुकान का स्वास्थ्य स्कोर",
    },
    billing: {
      title: "पीओएस बिलिंग काउंटर (Billing / POS)",
      subtitle: "बारकोड स्कैनिंग से तुरंत बिल बनाएं और रसीद प्रिंट करें",
      searchProducts: "बारकोड स्कैन करें या सामान का नाम लिखें...",
      allCategories: "सभी श्रेणियां",
      customerGroup: "ग्राहक वर्ग (Customer Group)",
      walkinCustomer: "नया / सामान्य ग्राहक (Walk-in)",
      selectCustomer: "ग्राहक चुनें / नया जोड़ें",
      addNewCustomer: "नया ग्राहक",
      cartEmpty: "बिल में अभी कोई सामान नहीं है",
      cartSummary: "बिल का सारांश (Summary)",
      subtotal: "उप-कुल (Subtotal)",
      groupDiscount: "ग्राहक छूट (Discount)",
      gstTax: "जीएसटी टैक्स (GST)",
      roundOff: "राउंड ऑफ (Round Off)",
      grandTotal: "कुल देय राशि (Grand Total)",
      paymentMode: "भुगतान का तरीका (Payment Mode)",
      completeBill: "बिल पूरा करें और प्रिंट निकालें",
      instantBill: "तुरंत बिल बनाएं",
      invoiceReceipt: "ग्राहक बिल रसीद",
      printThermal: "थर्मल प्रिंटर से रसीद निकालें",
      sendWhatsapp: "व्हाट्सएप पर बिल भेजें",
      splitPayment: "नकद + यूपीआई मिक्स पेमेंट",
      cashAmount: "नकद राशि (₹)",
      upiAmount: "यूपीआई राशि (₹)",
    },
    counter: {
      title: "सुपरफास्ट काउंटर मोड (Counter Mode)",
      subtitle: "दुकान पर भीड़ के समय 1-टच से 2 सेकंड में बिल बनाएं",
      rushMode: "भीड़ समय मोड (Rush Mode)",
      fastTerminal: "एक्सप्रेस काउंटर",
      exactCash: "पूरा नकद मिला",
      changeDue: "ग्राहक को छुट्टे लौटाएं",
      clearCart: "बिल खाली करें",
      holdBill: "बिल होल्ड करें",
      queueOrders: "रोके गए ऑर्डर्स",
      touchPresets: "तेज सामान शॉर्टकट्स",
    },
    inventory: {
      title: "इन्वेंट्री और स्टॉक प्रबंधन (Inventory)",
      subtitle: "दुकान का सारा सामान, बारकोड, खरीद रेट, बिक्री रेट और कम स्टॉक अलर्ट",
      totalProducts: "कुल उपलब्ध सामान",
      inStock: "स्टॉक में उपलब्ध",
      lowStock: "खत्म होने वाला सामान",
      outOfStock: "स्टॉक खत्म (Out of Stock)",
      addProduct: "नया सामान जोड़ें (Add Product)",
      productName: "सामान का नाम",
      barcode: "बारकोड नंबर",
      sellingPrice: "बिक्री रेट (₹)",
      costPrice: "खरीद रेट (₹)",
      stockQty: "उपलब्ध मात्रा (Stock)",
      minStockThreshold: "न्यूनतम चेतावनी सीमा",
      supplierName: "सप्लायर / सप्लायर कंपनी",
      importExport: "एक्सेल सीएसवी आयात / निर्यात",
    },
    customers: {
      title: "ग्राहक और उधारी खाता (Khata Ledger)",
      subtitle: "ग्राहकों का उधारी खाता, बाकी रकम और 1-क्लिक व्हाट्सएप तगादा संदेश",
      totalCustomers: "कुल पंजीकृत ग्राहक",
      totalPendingDues: "बाजार में फंसा कुल उधार",
      advancedPaid: "जमा एडवांस रकम",
      settleDues: "उधारी जमा करें (Settle)",
      sendWhatsappReminder: "व्हाट्सएप पर तगादा भेजें",
      addCustomer: "नया ग्राहक खाता खोलें",
      customerHistory: "लेन-देन और उधारी का इतिहास",
      phoneLabel: "मोबाइल नंबर",
      duesHistory: "बाकी बची उधारी",
    },
    recovery: {
      title: "उधार वसूली केंद्र (Recovery Center)",
      subtitle: "फंसी हुई उधारी की तेजी से वसूली और व्हाट्सएप ऑटो-तगादा",
      totalDebt: "कुल फंसी हुई रकम",
      highRiskDebt: "पुराना जोखिम भरा उधार (>30 दिन)",
      recoveredToday: "आज वसूल की गई रकम",
      callCustomer: "सीधे कॉल लगाएं",
      sendUrgentReminder: "तुरंत व्हाट्सएप तगादा भेजें",
      debtCollectionRate: "वसूली की सफलता दर",
    },
    suppliers: {
      title: "सप्लायर्स और माल खरीद (Suppliers)",
      subtitle: "थोक व्यापारी सूची, माल खरीद बिल और सप्लायर की बाकी रकम",
      totalSuppliers: "सक्रिय सप्लायर्स",
      totalPayables: "सप्लायर को कुल देनी बाकी रकम",
      createPO: "नया खरीद ऑर्डर बनाएं (PO)",
      settlePayment: "सप्लायर को पेमेंट करें",
      restockCatalog: "दुकान में नया माल भरें",
      contactPerson: "संपर्क व्यक्ति का नाम",
    },
    expenses: {
      title: "दुकान के खर्चे और लेजर (Expenses)",
      subtitle: "दुकान के रोजाना खर्चे दर्ज करें — चाय-नाश्ता, बिजली बिल, दुकान किराया, और स्टाफ पगार",
      totalExpenses: "अब तक का कुल खर्च",
      todayExpenses: "आज का खर्च (Today Outflow)",
      thisMonth: "इस महीने का कुल खर्च",
      pendingApproval: "मंजूरी बाकी खर्चे",
      logNewExpense: "नया खर्च दर्ज करें (Log Expense)",
      categoryBreakdown: "खर्चों का श्रेणीवार विवरण",
      teaSnacks: "चाय / नाश्ता (Tea/Snacks)",
      electricity: "बिजली का बिल (Electricity)",
      rent: "दुकान का किराया (Shop Rent)",
      salary: "स्टाफ वेतन / पगार (Salary)",
      other: "अन्य फुटकर खर्च (Other)",
      approveExpense: "मंजूर करें (Approve)",
      deleteExpense: "खर्च हटाएं (Delete)",
      loggedBy: "किसने खर्च दर्ज किया",
    },
    staff: {
      title: "स्टाफ और दैनिक हाजिरी (Staff Attendance)",
      subtitle: "कर्मचारियों का दैनिक हाजिरी रजिस्टर, अनुपस्थिति और मासिक वेतन हिसाब",
      staffMembers: "कुल कर्मचारी (Staff)",
      presentToday: "आज उपस्थित (Present)",
      absentToday: "आज गैरहाजिर (Absent)",
      lateToday: "देर से आए (Late)",
      markAttendance: "हाजिरी लगाएं (Check-in)",
      monthlyMusterRoll: "मासिक हाजिरी मस्टर रोल",
      attendancePercent: "उपस्थिति प्रतिशत",
      exportCsv: "मस्टर रोल डाउनलोड करें",
    },
    reports: {
      title: "वित्तीय रिपोर्ट्स और व्यापार विश्लेषण (Reports)",
      subtitle: "दुकान का मुनाफा, बिक्री का रुझान, नकद बनाम ऑनलाइन पेमेंट और डिजिटल पिकअप्स",
      grossSales: "कुल बिक्री (Gross Sales)",
      storeExpenses: "दुकान के खर्चे (Expenses)",
      estimatedNetProfit: "शुद्ध मुनाफा (Net Profit)",
      grossMargin: "ग्रॉस मार्जिन (Margin)",
      paymentSplit: "पेमेंट मोड विवरण (नकद / यूपीआई / उधार)",
      topMovingProducts: "आज सबसे ज्यादा बिके सामान",
      posLedger: "दैनिक बिलिंग लेजर और नफा-नुकसान",
      digitalPickups: "डिजिटल काउंटर पिकअप्स",
      aiAudit: "एआई दुकान संपूर्ण ऑडिट",
    },
    settings: {
      title: "दुकान एवं सिस्टम सेटिंग्स (Settings)",
      subtitle: "दुकान का नाम, बिल का फॉर्मेट, जीएसटी सेटअप, कर्मचारियों के अधिकार और पासवर्ड",
      storeProfile: "दुकान की जानकारी (Profile)",
      billingPickups: "बिलिंग और पिकअप्स (Billing)",
      staffRoles: "स्टाफ अधिकार (RBAC)",
      securitySystem: "सुरक्षा और डेटा बैकअप",
      shopName: "दुकान / व्यापार का नाम",
      contactPhone: "संपर्क मोबाइल नंबर",
      openingHours: "दुकान खुलने का समय",
      storeAddress: "दुकान का पूरा पता",
      invoicePrefix: "बिल नंबर कोड (Prefix)",
      receiptFooter: "बिल के नीचे की लाइन (Footer)",
      gstSetup: "जीएसटी (GST) टैक्स सेटअप",
      calculateGst: "बिल पर जीएसटी टैक्स जोड़ें",
      gstRate: "जीएसटी टैक्स की दर (%)",
      gstinNumber: "दुकान का जीएसटी नंबर (GSTIN)",
      digitalPickups: "ग्राहक डिजिटल पिकअप सेवा",
      operatingModel: "दुकान चलाने का तरीका (Model)",
      soloMerchant: "अकेले दुकान मालिक (Solo Shopkeeper)",
      multiStaff: "कैशियर व स्टाफ काउंटर (Multi-Staff)",
      ownerPin: "4-अंकों का गुप्त मालिक पिन (Security PIN)",
      changePassword: "लॉगिन पासवर्ड बदलें",
      backupDatabase: "दुकान का पूरा डेटा बैकअप लें",
      signout: "दुकान खाते से बाहर निकलें (Log Out)",
      saveChanges: "बदलाव सुरक्षित करें (Save Changes)",
      languageTitle: "एप्लिकेशन की भाषा (Language)",
      languageDesc: "पूरी एप्लिकेशन में अपनी पसंद की भाषा चुनें — 1 क्लिक में बदलें",
    },
  },
};

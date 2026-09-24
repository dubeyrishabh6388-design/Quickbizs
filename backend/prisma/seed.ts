import { prisma } from "../src/config/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding default business tenant, accounts, products, customers, suppliers, inventories, notifications, and settings...");

  // 0. Clean old tables
  await prisma.dailyBusinessSummary.deleteMany({});
  await prisma.dailyBusinessBriefing.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.backupHistory.deleteMany({});
  await prisma.notificationSetting.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.employeeTask.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.dailyClosing.deleteMany({});
  await prisma.bankTransaction.deleteMany({});
  await prisma.bankAccount.deleteMany({});
  await prisma.cashLedger.deleteMany({});
  await prisma.supplierLedger.deleteMany({});
  await prisma.customerLedger.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.purchasePayment.deleteMany({});
  await prisma.purchaseReturn.deleteMany({});
  await prisma.goodsReceiptItem.deleteMany({});
  await prisma.goodsReceipt.deleteMany({});
  await prisma.purchaseItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.invoiceSequence.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.stockTransfer.deleteMany({});
  await prisma.stockAdjustment.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.business.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  // 1. Create Business
  const business = await prisma.business.create({
    data: {
      id: "fresh-choice",
      name: "Fresh Choice Supermarket",
      plan: "Premium",
    },
  });

  // 2. Create Business Settings
  await prisma.businessSetting.create({
    data: {
      businessId: business.id,
      companyName: "Fresh Choice Supermarket",
      gstNumber: "27AAAAA1111A1Z1",
      panNumber: "ABCDE1234F",
      address: "Sector 15, Noida, Uttar Pradesh, 201301",
      phone: "+91 98765 43210",
      invoicePrefix: "INV",
      invoiceFooter: "Thank you for shopping at Fresh Choice! Please visit again.",
      gstEnabled: true,
      discountEnabled: true,
      roundOffEnabled: true,
      timezone: "Asia/Kolkata",
      currency: "INR",
    },
  });

  // 3. Create Roles
  const roles = ["Owner", "Cashier", "Accountant", "Warehouse", "SuperAdmin"];
  const createdRoles = await Promise.all(
    roles.map((r) =>
      prisma.role.create({
        data: {
          businessId: business.id,
          name: r,
        },
      })
    )
  );

  // 4. Create Users & Map Roles
  const usersToSeed = [
    { name: "Owner Account", email: "owner@quickbizs.com", role: "Owner" },
    { name: "Cashier Terminal", email: "cashier@quickbizs.com", role: "Cashier" },
    { name: "Warehouse Staff", email: "warehouse@quickbizs.com", role: "Warehouse" },
    { name: "SaaS Admin", email: "superadmin@quickbizs.com", role: "SuperAdmin" },
  ];

  for (const item of usersToSeed) {
    const user = await prisma.user.create({
      data: {
        businessId: business.id,
        name: item.name,
        email: item.email,
        passwordHash,
      },
    });

    const roleObj = createdRoles.find((r) => r.name === item.role)!;

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleObj.id,
      },
    });
  }

  // 5. Create Catalog Products
  const productsToSeed = [
    { id: "p1", name: "Amul Milk (1L)", category: "Dairy", price: 60, costPrice: 52, stock: 5, minStock: 15, supplierName: "Amul Milk Dairy", barcode: "8901234567890" },
    { id: "p2", name: "Taj Mahal Tea (250g)", category: "Groceries", price: 120, costPrice: 98, stock: 22, minStock: 10, supplierName: "Kirana Wholesale", barcode: "8901234567891" },
    { id: "p3", name: "Premium Sugar (1kg)", category: "Groceries", price: 45, costPrice: 38, stock: 8, minStock: 12, supplierName: "Kirana Wholesale", barcode: "8901234567892" },
    { id: "p4", name: "Parle-G Biscuits (Pack of 10)", category: "Snacks", price: 10, costPrice: 8, stock: 52, minStock: 15, supplierName: "Kirana Wholesale", barcode: "8901234567893" },
    { id: "p5", name: "Amul Paneer (200g)", category: "Dairy", price: 85, costPrice: 70, stock: 3, minStock: 8, supplierName: "Amul Milk Dairy", barcode: "8901234567894" },
    { id: "p6", name: "Tata Salt (1kg)", category: "Groceries", price: 28, costPrice: 22, stock: 15, minStock: 10, supplierName: "Kirana Wholesale", barcode: "8901234567895" },
    { id: "p7", name: "Good Day Cookies", category: "Snacks", price: 20, costPrice: 16, stock: 18, minStock: 12, supplierName: "Kirana Wholesale", barcode: "8901234567896" },
  ];

  for (const item of productsToSeed) {
    await prisma.product.create({
      data: {
        id: item.id,
        businessId: business.id,
        name: item.name,
        category: item.category,
        price: item.price,
        costPrice: item.costPrice,
        stock: item.stock,
        minStock: item.minStock,
        supplierName: item.supplierName,
        barcode: item.barcode,
      },
    });
  }

  // 6. Create Customers
  const customersToSeed = [
    { id: "c1", customerCode: "CUST-0001", name: "Ramesh Kumar", mobile: "+91 98765 43210", pendingAmount: 500, email: "ramesh@example.com", address: "Sector 15", city: "Noida", state: "Uttar Pradesh", pinCode: "201301" },
    { id: "c2", customerCode: "CUST-0002", name: "Sunita Sharma", mobile: "+91 98123 45678", pendingAmount: 0, email: "sunita@example.com", address: "Malviya Nagar", city: "New Delhi", state: "Delhi", pinCode: "110017" },
    { id: "c3", customerCode: "CUST-0003", name: "Amit Patel", mobile: "+91 99988 87776", pendingAmount: 1250, email: "amit@example.com", address: "Satellite Area", city: "Ahmedabad", state: "Gujarat", pinCode: "380015" },
    { id: "c4", customerCode: "CUST-0004", name: "Priya Singh", mobile: "+91 97776 65544", pendingAmount: 0, email: "priya@example.com", address: "Gomti Nagar", city: "Lucknow", state: "Uttar Pradesh", pinCode: "226010" },
  ];

  for (const item of customersToSeed) {
    await prisma.customer.create({
      data: {
        id: item.id,
        businessId: business.id,
        customerCode: item.customerCode,
        name: item.name,
        mobile: item.mobile,
        email: item.email,
        address: item.address,
        city: item.city,
        state: item.state,
        pinCode: item.pinCode,
        pendingAmount: item.pendingAmount,
        creditLimit: 10000,
        rewardPoints: 0,
      },
    });
  }

  // 7. Create Suppliers
  const suppliersToSeed = [
    { id: "s1", supplierCode: "SUP-0001", companyName: "Kirana Wholesale", contactPerson: "Sanjay Shah", mobile: "+91 91122 33445", outstandingAmount: 12000, email: "sanjay@kirana.com", gstNumber: "27AAAAA1111A1Z1" },
    { id: "s2", supplierCode: "SUP-0002", companyName: "Amul Milk Dairy", contactPerson: "Verghese Kurien", mobile: "+91 92233 44556", outstandingAmount: 1500, email: "contact@amul.com", gstNumber: "24AAAAA2222A2Z2" },
    { id: "s3", supplierCode: "SUP-0003", companyName: "Sunrise Electronics", contactPerson: "Rajiv Mehta", mobile: "+91 93344 55667", outstandingAmount: 0, email: "rajiv@sunrise.com", gstNumber: "07AAAAA3333A3Z3" },
  ];

  for (const item of suppliersToSeed) {
    await prisma.supplier.create({
      data: {
        id: item.id,
        businessId: business.id,
        supplierCode: item.supplierCode,
        companyName: item.companyName,
        contactPerson: item.contactPerson,
        mobile: item.mobile,
        email: item.email,
        gstNumber: item.gstNumber,
        outstandingAmount: item.outstandingAmount,
        creditLimit: 100000,
        status: "Active",
      },
    });
  }

  // 8. Create Warehouse
  const warehouse = await prisma.warehouse.create({
    data: {
      id: "wh-main",
      businessId: business.id,
      name: "Main Warehouse Noida",
      code: "WH-MAIN",
      address: "Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
    },
  });

  // 9. Create Inventories & Initial Stock Movements
  for (const item of productsToSeed) {
    const inventory = await prisma.inventory.create({
      data: {
        businessId: business.id,
        productId: item.id,
        availableQuantity: item.stock,
        reservedQuantity: 0,
        damagedQuantity: 0,
        minimumStock: item.minStock,
        maximumStock: 100,
        reorderLevel: item.minStock + 5,
        warehouseId: warehouse.id,
      },
    });

    await prisma.stockMovement.create({
      data: {
        businessId: business.id,
        productId: item.id,
        inventoryId: inventory.id,
        referenceType: "Opening Stock",
        movementType: "IN",
        quantity: item.stock,
        openingStock: 0,
        closingStock: item.stock,
        reason: "Initial ledger entry during systems setup",
        createdBy: "owner@quickbizs.com",
      },
    });
  }

  // 10. Create Invoice Sequence prefix
  await prisma.invoiceSequence.create({
    data: {
      businessId: business.id,
      prefix: "INV",
      nextValue: 101,
    },
  });

  // 11. Seed Bank Account
  const bankAcc = await prisma.bankAccount.create({
    data: {
      businessId: business.id,
      bankName: "State Bank of India",
      accountNumber: "30001234567",
      ifscCode: "SBIN0001234",
      balance: 50000,
    },
  });

  // 12. Seed Expenses
  await prisma.expense.create({
    data: {
      businessId: business.id,
      description: "Chai & Samosas for Staff",
      amount: 150,
      category: "Tea/Snacks",
      status: "Approved",
      loggedBy: "owner@quickbizs.com",
    },
  });

  await prisma.expense.create({
    data: {
      businessId: business.id,
      description: "Store Shop Rent (July)",
      amount: 8000,
      category: "Rent",
      status: "Approved",
      loggedBy: "owner@quickbizs.com",
    },
  });

  // 13. Seed Employees
  const emp1 = await prisma.employee.create({
    data: {
      id: "e1",
      businessId: business.id,
      employeeCode: "EMP-001",
      firstName: "Sunil",
      lastName: "Verma",
      designation: "Cashier / Billing",
      mobile: "+91 98765 00001",
      salary: 12000,
      status: "Active",
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      id: "e2",
      businessId: business.id,
      employeeCode: "EMP-002",
      firstName: "Rohit",
      lastName: "Singh",
      designation: "Helper / Delivery",
      mobile: "+91 98765 00002",
      salary: 8000,
      status: "Active",
    },
  });

  const emp3 = await prisma.employee.create({
    data: {
      id: "e3",
      businessId: business.id,
      employeeCode: "EMP-003",
      firstName: "Aarti",
      lastName: "Sharma",
      designation: "Accountant",
      mobile: "+91 98765 00003",
      salary: 18000,
      status: "Active",
    },
  });

  // 14. Seed Today's Attendance
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  await prisma.attendance.create({
    data: {
      businessId: business.id,
      employeeId: emp1.id,
      date: new Date(),
      checkIn: today,
      status: "Present",
    },
  });

  const todayLate = new Date();
  todayLate.setHours(9, 15, 0, 0);

  await prisma.attendance.create({
    data: {
      businessId: business.id,
      employeeId: emp3.id,
      date: new Date(),
      checkIn: todayLate,
      status: "Present",
    },
  });

  // 15. Seed Notifications
  await prisma.notification.create({
    data: {
      businessId: business.id,
      type: "Warning",
      title: "Low Stock: Amul Milk (1L)",
      message: "Shelf stock level has fallen below warning safety limit.",
      module: "Inventory",
      priority: "High",
    },
  });

  await prisma.notification.create({
    data: {
      businessId: business.id,
      type: "Info",
      title: "Outstanding payment pending",
      message: "Rs. 1,250 is due from customer Ramesh Kumar.",
      module: "Billing",
      priority: "Medium",
    },
  });

  console.log("Default business account, products, customers, suppliers, inventories, notifications, and settings seeded successfully!");
  console.log("-----------------------------------------");
  console.log("Email logins available (Password: password123):");
  console.log("- owner@quickbizs.com");
  console.log("- cashier@quickbizs.com");
  console.log("- warehouse@quickbizs.com");
  console.log("- superadmin@quickbizs.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

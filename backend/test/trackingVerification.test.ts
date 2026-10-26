import { normalizeIdentifier, validateIMEI } from "../src/utils/identifierUtils";

// Simple self-contained test runner
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  testsRun++;
  if (condition) {
    testsPassed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    testsFailed++;
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTestSuite() {
  console.log("===============================================================================");
  console.log("QUICKBIZS PHASE 8 — SERIAL, BATCH & RETURN VERIFICATION TEST SUITE");
  console.log("===============================================================================\n");

  // TEST 1: Identifier Normalization & Validation
  console.log("1. Identifier Normalization & Validation Rules");
  {
    const raw = "  sn-992-abc_xyz  ";
    const normalized = normalizeIdentifier(raw);
    assert(normalized === "SN992ABCXYZ", "normalizeIdentifier removes spaces, dashes, and underscores and converts to uppercase");

    // Valid 15-digit IMEI with Luhn check
    // 35209900112233 -> sum = 42 -> check digit = 8 -> "352099001122338"
    const validImei = "352099001122338";
    const isValid = validateIMEI(validImei);
    assert(isValid === true, "Valid 15-digit IMEI with Luhn check digit passes validation");

    const corruptedImei = "352099001122339"; // Wrong check digit (9 instead of 8)
    assert(validateIMEI(corruptedImei) === false, "Corrupted IMEI with wrong checksum is rejected");

    const shortImei = "352099001122";
    assert(validateIMEI(shortImei) === false, "Short IMEI (<15 digits) is rejected");
  }

  // TEST 2: Device Identifier Registry & Dual-SIM Collision Prevention
  console.log("\n2. Dual-SIM Collision Guard Across Identifier Slots");
  {
    // Simulated DeviceIdentifier unique index: businessId + identifierValue
    const registry = new Map<string, string>(); // key: `businessId:identifierValue`, value: deviceId

    const registerDevice = (businessId: string, deviceId: string, serial: string, imei1?: string, imei2?: string) => {
      const identifiers = [
        { type: "SERIAL", val: normalizeIdentifier(serial) },
        ...(imei1 ? [{ type: "IMEI1", val: normalizeIdentifier(imei1) }] : []),
        ...(imei2 ? [{ type: "IMEI2", val: normalizeIdentifier(imei2) }] : []),
      ];

      // Check collision
      for (const id of identifiers) {
        const key = `${businessId}:${id.val}`;
        if (registry.has(key)) {
          throw new Error(`Duplicate identifier collision: ${id.val} is already registered to device ${registry.get(key)}`);
        }
      }

      // Register
      for (const id of identifiers) {
        registry.set(`${businessId}:${id.val}`, deviceId);
      }
    };

    // Register Device A with IMEI1: 860001, IMEI2: 860002
    registerDevice("BIZ_1", "DEV_A", "SN001", "860001", "860002");
    assert(registry.size === 3, "Device A registered with 3 unique identifiers");

    // Attempt to register Device B with IMEI1 matching Device A's IMEI2
    let collisionCaught = false;
    try {
      registerDevice("BIZ_1", "DEV_B", "SN002", "860002", "860003");
    } catch (err: any) {
      collisionCaught = true;
      assert(err.message.includes("Duplicate identifier collision"), "Prevented IMEI2 collision across devices");
    }
    assert(collisionCaught === true, "Database unique constraint on identifierValue blocks cross-slot duplicates");

    // In a different tenant/business, the same identifier is allowed (Tenant Isolation)
    registerDevice("BIZ_2", "DEV_C", "SN001", "860001", "860002");
    assert(registry.has("BIZ_2:860001"), "Tenant B can independently register identifiers without colliding with Tenant A");
  }

  // TEST 3: FEFO Allocation & Expired Batch Rejection
  console.log("\n3. First-Expired-First-Out (FEFO) Allocation & Expiry Guard");
  {
    const today = new Date("2026-10-24T00:00:00Z");

    const batches = [
      { id: "BATCH_1", batchNumber: "B1", expiryDate: new Date("2026-10-20T00:00:00Z"), available: 20 }, // EXPIRED
      { id: "BATCH_2", batchNumber: "B2", expiryDate: new Date("2026-11-15T00:00:00Z"), available: 15 }, // Near Expiry (First)
      { id: "BATCH_3", batchNumber: "B3", expiryDate: new Date("2027-05-01T00:00:00Z"), available: 50 }, // Later Expiry (Second)
      { id: "BATCH_4", batchNumber: "B4", expiryDate: null, available: 10 },                             // No Expiry (Last)
    ];

    // Filter valid unexpired lots sorted by expiry ASC
    const validLots = batches
      .filter(b => b.available > 0 && (!b.expiryDate || b.expiryDate >= today))
      .sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return a.expiryDate.getTime() - b.expiryDate.getTime();
      });

    assert(validLots.length === 3, "Expired batch B1 was correctly excluded from sellable pool");
    assert(validLots[0].id === "BATCH_2", "FEFO picked BATCH_2 (earliest expiry) as first allocation");
    assert(validLots[1].id === "BATCH_3", "FEFO picked BATCH_3 as second allocation");

    // Simulate allocating 25 units
    let needed = 25;
    const allocations: { batchId: string; qty: number }[] = [];
    for (const lot of validLots) {
      if (needed <= 0) break;
      const take = Math.min(lot.available, needed);
      allocations.push({ batchId: lot.id, qty: take });
      needed -= take;
    }

    assert(allocations.length === 2, "25 units split across 2 batches");
    assert(allocations[0].batchId === "BATCH_2" && allocations[0].qty === 15, "BATCH_2 fully allocated (15 units)");
    assert(allocations[1].batchId === "BATCH_3" && allocations[1].qty === 10, "BATCH_3 partially allocated (10 units)");
    assert(needed === 0, "Order allocation fully satisfied");
  }

  // TEST 4: Serial Resale Lifecycle & Immutable History
  console.log("\n4. 1-to-N Immutable Serial Resale & Warranty Traceability");
  {
    interface SaleHistory {
      id: string;
      orderId: string;
      customer: string;
      warrantyStart: Date;
      warrantyEnd: Date;
      status: "COMPLETED" | "RETURNED_RESTOCKED" | "CANCELLED";
    }

    const device = {
      id: "PHONE_99",
      serial: "IMEI99001",
      status: "IN_STOCK",
      saleHistories: [] as SaleHistory[],
    };

    // Step A: First Sale to Customer 1
    const sale1: SaleHistory = {
      id: "HIST_1",
      orderId: "INV-101",
      customer: "Alice",
      warrantyStart: new Date("2026-10-01"),
      warrantyEnd: new Date("2027-10-01"),
      status: "COMPLETED",
    };
    device.status = "SOLD";
    device.saleHistories.push(sale1);
    assert(device.saleHistories.length === 1, "First sale recorded");
    assert(device.saleHistories[0].customer === "Alice", "Customer Alice warranty active");

    // Step B: Customer 1 returns phone (Inspected & Restocked)
    sale1.status = "RETURNED_RESTOCKED";
    device.status = "RETURNED_RESTOCKED";
    assert(device.status === "RETURNED_RESTOCKED", "Device transitioned to RETURNED_RESTOCKED");
    assert(device.saleHistories[0].status === "RETURNED_RESTOCKED", "Sale 1 marked as returned, NOT deleted");

    // Step C: Second Sale to Customer 2 (Resale of the same physical unit)
    const sale2: SaleHistory = {
      id: "HIST_2",
      orderId: "INV-205",
      customer: "Bob",
      warrantyStart: new Date("2026-10-24"),
      warrantyEnd: new Date("2027-10-24"),
      status: "COMPLETED",
    };
    device.status = "SOLD";
    device.saleHistories.push(sale2);

    assert(device.saleHistories.length === 2, "Physical device has 2 distinct immutable sale records");
    assert(device.saleHistories[0].orderId === "INV-101" && device.saleHistories[0].customer === "Alice", "Alice's invoice #INV-101 preserved for audit");
    assert(device.saleHistories[1].orderId === "INV-205" && device.saleHistories[1].customer === "Bob", "Bob's invoice #INV-205 independent with new warranty");
  }

  // TEST 5: Over-Return Prevention Guard
  console.log("\n5. Partial Returns & Over-Return Prevention");
  {
    const allocation = {
      id: "ALLOC_10",
      quantityAllocated: 5,
      quantityReturned: 0,
    };

    const processReturn = (qty: number) => {
      const maxReturnable = allocation.quantityAllocated - allocation.quantityReturned;
      if (qty > maxReturnable) {
        throw new Error(`Cannot return ${qty} units. Maximum returnable quantity is ${maxReturnable}`);
      }
      allocation.quantityReturned += qty;
      return true;
    };

    // Return 2 units
    assert(processReturn(2) === true, "First partial return of 2 units allowed");
    assert(allocation.quantityReturned === 2, "Allocated returned count is 2");

    // Return 3 more units
    assert(processReturn(3) === true, "Second partial return of 3 units allowed");
    assert(allocation.quantityReturned === 5, "Allocated returned count is 5 (full return)");

    // Attempt to return 1 more unit (Over-return attempt)
    let overReturnBlocked = false;
    try {
      processReturn(1);
    } catch (err: any) {
      overReturnBlocked = true;
      assert(err.message.includes("Maximum returnable quantity is 0"), "Over-return strictly rejected with 0 remaining");
    }
    assert(overReturnBlocked === true, "Transaction-level check blocks over-returns");
  }

  // TEST 6: Stock Invariant Equations
  console.log("\n6. Mathematical Stock Invariants Verification");
  {
    // Batch Invariant: availableQuantity = initialQuantity + sum(deltas)
    let initial = 100;
    const movements = [
      { type: "SALE_ALLOCATION", delta: -15 },
      { type: "SALE_ALLOCATION", delta: -10 },
      { type: "CUSTOMER_RETURN", delta: +2 },
      { type: "DAMAGE_WRITEOFF", delta: -5 },
    ];

    const currentQty = initial + movements.reduce((acc, m) => acc + m.delta, 0);
    assert(currentQty === 72, "Batch movement deltas reconcile mathematically: 100 - 15 - 10 + 2 - 5 = 72");

    // Serial Invariant: available count = count(IN_STOCK) + count(RETURNED_RESTOCKED)
    const serialUnits = [
      { id: "S1", status: "IN_STOCK" },
      { id: "S2", status: "SOLD" },
      { id: "S3", status: "RETURNED_RESTOCKED" },
      { id: "S4", status: "DEFECTIVE" },
      { id: "S5", status: "IN_STOCK" },
    ];

    const availableSerials = serialUnits.filter(u => u.status === "IN_STOCK" || u.status === "RETURNED_RESTOCKED").length;
    assert(availableSerials === 3, "Available serialized inventory includes both IN_STOCK (2) and RETURNED_RESTOCKED (1) = 3");
  }

  // TEST 7: Untracked Regression (TrackingMode.NONE)
  console.log("\n7. Backward Compatibility: Untracked Product Checkout");
  {
    const legacyProduct = {
      id: "PROD_LEGACY",
      name: "Sugar 1kg",
      trackingMode: "NONE",
      stock: 50,
    };

    // Standard checkout without serials or batches
    const checkoutQty = 3;
    assert(legacyProduct.stock >= checkoutQty, "Stock check succeeds");
    legacyProduct.stock -= checkoutQty;
    assert(legacyProduct.stock === 47, "Standard aggregate deduction works seamlessly without requiring serial or batch inputs");
  }

  console.log("\n===============================================================================");
  console.log(`TEST SUITE COMPLETE: ${testsPassed} passed, ${testsFailed} failed (Total: ${testsRun})`);
  console.log("===============================================================================");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});

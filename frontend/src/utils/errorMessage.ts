/**
 * Transforms any API error or technical database exception into a clear, understandable,
 * human-friendly message. Ensures technical terms (Prisma, database constraints, SQL, code lines)
 * are never shown to merchants, shopkeepers, or users.
 */
export function getUserFriendlyErrorMessage(err: any): string {
  if (!err) return "An unexpected error occurred. Please try again.";

  // Extract raw message from diverse error object signatures
  const rawMsg: string = 
    (typeof err === "string" ? err : "") ||
    err?.response?.data?.message || 
    err?.response?.data?.error?.problem ||
    err?.response?.data?.error?.reason ||
    err?.message || 
    "";

  const clean = rawMsg.toLowerCase();

  // 1. Mobile number unique constraint (Phone already registered)
  if (
    clean.includes("businesses_phone_key") ||
    clean.includes("pwa_customers_phone_key") ||
    clean.includes("users_phone_key") ||
    clean.includes("phone_key") ||
    clean.includes("duplicate_phone") ||
    ((clean.includes("phone") || clean.includes("mobile")) && 
      (clean.includes("unique") || clean.includes("already registered") || clean.includes("already exists") || clean.includes("duplicate") || clean.includes("constraint")))
  ) {
    return "This mobile number is already registered. Please sign in or use a different mobile number.";
  }

  // 2. Email unique constraint (Email already registered)
  if (
    clean.includes("users_email_key") ||
    clean.includes("pwa_customers_email_key") ||
    clean.includes("email_key") ||
    (clean.includes("email") && 
      (clean.includes("unique") || clean.includes("already registered") || clean.includes("already exists") || clean.includes("duplicate") || clean.includes("constraint")))
  ) {
    return "This email address is already registered. Please sign in or use a different email.";
  }

  // 3. Product Barcode / SKU
  if (clean.includes("barcode") && (clean.includes("unique") || clean.includes("duplicate") || clean.includes("already exists") || clean.includes("constraint"))) {
    return "A product with this barcode already exists in your inventory catalog.";
  }
  if (clean.includes("sku") && (clean.includes("unique") || clean.includes("duplicate") || clean.includes("already exists") || clean.includes("constraint"))) {
    return "A product with this SKU code already exists in your inventory catalog.";
  }

  // 4. GSTIN Uniqueness
  if (clean.includes("gst") && (clean.includes("unique") || clean.includes("duplicate") || clean.includes("already exists") || clean.includes("constraint"))) {
    return "A business or supplier with this GST number is already registered.";
  }

  // 5. Employee code
  if (clean.includes("employee") && (clean.includes("code") || clean.includes("employeecode")) && (clean.includes("unique") || clean.includes("duplicate") || clean.includes("exists"))) {
    return "An employee with this employee code already exists in your store.";
  }

  // 6. IMEI / Serial number
  if ((clean.includes("serial") || clean.includes("imei")) && (clean.includes("unique") || clean.includes("duplicate") || clean.includes("exists"))) {
    return "This IMEI or Serial number is already registered in stock.";
  }

  // 7. Batch number
  if (clean.includes("batch") && (clean.includes("unique") || clean.includes("duplicate") || clean.includes("exists"))) {
    return "This batch number already exists for this product.";
  }

  // 8. General unique constraint / duplicate key
  if (clean.includes("unique constraint") || clean.includes("p2002") || clean.includes("duplicate entry") || clean.includes("duplicate key")) {
    return "This record already exists. Duplicate entries are not allowed.";
  }

  // 9. Network / Connection errors
  if (clean.includes("network error") || clean.includes("econnrefused") || clean.includes("failed to fetch") || clean.includes("connection refused")) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // 10. Rate Limit (429)
  if (clean.includes("rate limit") || clean.includes("too many requests") || err?.response?.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  // 11. Authentication & Session errors
  if (clean.includes("invalid phone/email or password") || clean.includes("invalid credentials")) {
    return "Invalid mobile number/email or password. Please verify your credentials.";
  }
  if (clean.includes("passwords do not match")) {
    return "Passwords do not match. Please ensure both passwords are identical.";
  }
  if (clean.includes("jwt expired") || clean.includes("token expired")) {
    return "Your login session has expired. Please sign in again.";
  }

  // 12. Suppress any raw database / Prisma / SQL traces
  if (
    clean.includes("prisma.") ||
    clean.includes("invocation:") ||
    clean.includes("syntax error") ||
    clean.includes("typeerror") ||
    clean.includes("referenceerror") ||
    clean.includes("select ") ||
    clean.includes("insert into") ||
    clean.includes("table '") ||
    clean.includes("column '") ||
    clean.includes("at object.")
  ) {
    return "Something went wrong while processing your request. Please try again.";
  }

  // 13. If message is clean human text, return it directly
  if (rawMsg.trim().length > 0 && rawMsg.length < 250) {
    return rawMsg.trim();
  }

  return "An unexpected error occurred. Please try again.";
}

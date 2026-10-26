/**
 * Normalizes device and product identifiers (serials, IMEIs, barcodes).
 * Strips whitespace, hyphens, and underscores, and converts to uppercase.
 */
export function normalizeIdentifier(raw: string): string {
  if (!raw) return "";
  return raw.trim().toUpperCase().replace(/[\s\-_]/g, "");
}

/**
 * Validates a 15-digit IMEI number using the Luhn checksum algorithm (Mod 10).
 */
export function validateIMEI(raw: string): boolean {
  const imei = normalizeIdentifier(raw);
  if (!/^\d{15}$/.test(imei)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(imei[i], 10);
    if (i % 2 !== 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(imei[14], 10);
}

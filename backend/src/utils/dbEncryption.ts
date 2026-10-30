import crypto from "crypto";
import { env } from "../config/environment";

const SECRET_KEY_RAW =
  process.env.DB_ENCRYPTION_KEY ||
  env.payloadEncryptionKey ||
  "QuickBizs_Secure_AES256_Payload_Key_2026_Enterprise!";

// Derive 32-byte AES key using SHA-256
const AES_KEY = crypto.createHash("sha256").update(SECRET_KEY_RAW).digest();

// Derive deterministic 16-byte IV for searchable identity fields (email, phone, name)
const DETERMINISTIC_IV = crypto
  .createHmac("sha256", AES_KEY)
  .update("QuickBizs_PII_Deterministic_IV_Salt_v1")
  .digest()
  .subarray(0, 16);

const PREFIX = "enc:";

/**
 * Encrypts a sensitive database field (email, phone, name) using deterministic AES-256-CBC.
 * Produces consistent ciphertext for exact-match database queries (WHERE email = ?).
 */
export function encryptDbField(plainText: string | null | undefined): string | null | undefined {
  if (plainText === null || plainText === undefined) {
    return plainText;
  }
  const str = String(plainText).trim();
  if (!str) return str;

  // Already encrypted
  if (str.startsWith(PREFIX)) {
    return str;
  }

  try {
    const cipher = crypto.createCipheriv("aes-256-cbc", AES_KEY, DETERMINISTIC_IV);
    let encrypted = cipher.update(str, "utf8", "base64");
    encrypted += cipher.final("base64");
    return `${PREFIX}${encrypted}`;
  } catch (err) {
    console.error("[DbCrypto] Failed to encrypt database field:", err);
    return str; // Fallback to avoid data loss
  }
}

/**
 * Decrypts an encrypted database field. If the value is not encrypted (e.g. legacy data),
 * returns it as-is for backward compatibility.
 */
export function decryptDbField(cipherText: string | null | undefined): string | null | undefined {
  if (cipherText === null || cipherText === undefined) {
    return cipherText;
  }
  const str = String(cipherText);
  if (!str.startsWith(PREFIX)) {
    return str; // Plaintext legacy record
  }

  try {
    const rawCipher = str.slice(PREFIX.length);
    const decipher = crypto.createDecipheriv("aes-256-cbc", AES_KEY, DETERMINISTIC_IV);
    let decrypted = decipher.update(rawCipher, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("[DbCrypto] Failed to decrypt database field:", err);
    return str;
  }
}

/**
 * Checks whether a given string is in the encrypted format
 */
export function isDbFieldEncrypted(val: any): boolean {
  return typeof val === "string" && val.startsWith(PREFIX);
}

/**
 * Recursively traverses any data structure (object, array, primitive) and decrypts
 * any string field that starts with the 'enc:' prefix.
 */
export function deepDecryptDbFields<T = any>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    if (data.startsWith(PREFIX)) {
      return (decryptDbField(data) as unknown) as T;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return (data.map((item) => deepDecryptDbFields(item)) as unknown) as T;
  }

  if (typeof data === "object") {
    if (data instanceof Date || (typeof Buffer !== "undefined" && Buffer.isBuffer(data))) {
      return data;
    }

    const result: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      result[key] = deepDecryptDbFields((data as Record<string, any>)[key]);
    }
    return result as T;
  }

  return data;
}

import CryptoJS from "crypto-js";
import { env } from "../config/env";

const KEY = env.encryptionKey || "QuickBizs_Secure_AES256_Payload_Key_2026_Enterprise!";

export interface EncryptedPayloadWrapper {
  __encrypted: true;
  payload: string;
}

/**
 * Encrypt any JavaScript object or primitive into an AES-256 cipher string
 */
export function encryptData<T = any>(data: T): string {
  try {
    const rawString = typeof data === "string" ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(rawString, KEY).toString();
  } catch (error) {
    console.error("[Crypto] Encryption failed:", error);
    throw error;
  }
}

/**
 * Decrypt an AES-256 cipher string back into a parsed JavaScript object
 */
export function decryptData<T = any>(cipherText: string): T {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, KEY);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) {
      throw new Error("Decryption returned empty string (key mismatch or malformed cipher)");
    }
    try {
      return JSON.parse(decryptedStr) as T;
    } catch {
      return decryptedStr as unknown as T;
    }
  } catch (error) {
    console.error("[Crypto] Decryption failed:", error);
    throw error;
  }
}

/**
 * Check if data matches the encrypted envelope pattern
 */
export function isEncryptedEnvelope(body: any): body is EncryptedPayloadWrapper {
  return (
    body !== null &&
    typeof body === "object" &&
    body.__encrypted === true &&
    typeof body.payload === "string"
  );
}

import { env } from "../config/env";
import { encryptData, decryptData, isEncryptedEnvelope } from "./cryptoPayload";

/**
 * Global fetch interceptor ensuring that native window.fetch() calls
 * (e.g., in BusinessContext or standalone screens) automatically participate
 * in end-to-end payload encryption and transparent response decryption.
 */
export function setupFetchInterceptor() {
  if (typeof window === "undefined" || (window as any).__fetchInterceptorInstalled) {
    return;
  }
  (window as any).__fetchInterceptorInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url || "";

    const isApiCall = urlStr.includes("/api/") || urlStr.startsWith("/api");

    if (isApiCall && env.encryptionEnabled) {
      const options: RequestInit = init ? { ...init } : {};
      const headers = new Headers(
        options.headers || (typeof input === "object" && "headers" in input ? (input as Request).headers : undefined)
      );

      // Encrypt stringified JSON body if not already encrypted and not multipart
      if (
        options.body &&
        typeof options.body === "string" &&
        !headers.get("Content-Type")?.includes("multipart") &&
        headers.get("X-Skip-Encryption") !== "true"
      ) {
        try {
          const parsed = JSON.parse(options.body);
          if (!isEncryptedEnvelope(parsed)) {
            const cipher = encryptData(parsed);
            options.body = JSON.stringify({
              __encrypted: true,
              payload: cipher,
            });
            headers.set("X-Payload-Encrypted", "true");
            headers.set("Content-Type", "application/json");
          }
        } catch {
          // Non-JSON string, pass through unchanged
        }
      }

      options.headers = headers;

      const response = await originalFetch(input, options);

      // Intercept response.json() so calling code transparently receives decrypted object
      const originalJson = response.json.bind(response);
      response.json = async function () {
        const data = await originalJson();
        if (isEncryptedEnvelope(data)) {
          try {
            return decryptData(data.payload);
          } catch (err) {
            console.error("[Fetch Crypto] Failed to decrypt response payload:", err);
            return data;
          }
        }
        return data;
      };

      return response;
    }

    return originalFetch(input, init);
  };
}

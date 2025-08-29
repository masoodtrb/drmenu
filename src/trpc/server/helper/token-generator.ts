import * as crypto from "crypto";

/**
 * Generates a secure random token for OTP verification
 * @param length - Length of the token (default: 32)
 * @returns A secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generates a shorter token for URL-friendly usage
 * @param length - Length of the token (default: 16)
 * @returns A shorter secure token
 */
export function generateShortToken(length: number = 16): string {
  return crypto.randomBytes(length).toString("hex");
}

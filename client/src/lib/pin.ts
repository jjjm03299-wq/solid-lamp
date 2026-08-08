/**
 * MIDNIGHT VAULT — PIN forging core (see ideas.md)
 * Pure logic shared between the client UI and the Express API server.
 * Generates cryptographically safe 4-digit PINs and verifies attempts.
 */

export interface PinRecord {
  /** Unique credential id (short hex) */
  id: string;
  /** The forged 4-digit PIN */
  pin: string;
  /** ISO timestamp when the PIN was minted */
  createdAt: string;
  /** ISO timestamp when the PIN was destroyed (consumed) */
  destroyedAt?: string;
}

const PIN_MIN = 1000;
const PIN_MAX = 9999;
export const TOTAL_COMBINATIONS = PIN_MAX - PIN_MIN + 1; // 9000

export interface VerifyResult {
  valid: boolean;
  consumed: boolean;
}

/** Secure random integer in [min, max] using the Web Crypto API. */
function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = 4; // Uint32 gives 4,294,967,296 values
  const maxValid = Math.floor(4294967296 / range) * range; // rejection bound
  const buf = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= maxValid);
  return min + (value % range);
}

export function generatePin(): { id: string; pin: string; createdAt: string } {
  const pin = String(secureRandomInt(PIN_MIN, PIN_MAX));
  const id = crypto
    .getRandomValues(new Uint8Array(6))
    .reduce((acc, b) => acc + b.toString(16).padStart(2, "0"), "");
  return {
    id,
    pin,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Verifies an attempt against a generated PIN.
 * Returns a result and whether the attempt itself was validly formatted.
 */
export function verifyPin(
  record: PinRecord,
  attempt: string,
): { result: VerifyResult | null; formatted: boolean } {
  if (!/^\d{4}$/.test(attempt)) {
    return { result: null, formatted: false };
  }
  const match = attempt === record.pin;
  return {
    result: {
      valid: match,
      consumed: record.destroyedAt !== undefined,
    },
    formatted: true,
  };
}

/** Format a number as a 4-digit zero-padded string. */
export function formatPin(digits: string): string {
  return digits.padStart(4, "0").slice(-4);
}

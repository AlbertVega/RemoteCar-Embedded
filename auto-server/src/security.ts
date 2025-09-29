import crypto from "crypto";

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };

// ==================== HASH ====================
export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, SCRYPT_PARAMS.keylen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

// ==================== VERIFY ====================
export function verifyPassword(plain: string, encoded: string): boolean {
  const [scheme, saltHex, hashHex] = encoded.split(":");
  if (scheme !== "scrypt") return false;

  const hash = crypto.scryptSync(
    plain,
    Buffer.from(saltHex, "hex"),
    SCRYPT_PARAMS.keylen,
    {
      N: SCRYPT_PARAMS.N,
      r: SCRYPT_PARAMS.r,
      p: SCRYPT_PARAMS.p,
    }
  );

  return hash.toString("hex") === hashHex;
}

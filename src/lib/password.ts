import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

/**
 * Hash "señuelo" con formato válido (salt:key) pero que no corresponde a
 * ninguna contraseña real. Se usa en login cuando el correo no existe,
 * para que verifyPassword() siempre haga el mismo trabajo de scrypt y
 * el tiempo de respuesta no filtre si el correo está registrado.
 */
export const DUMMY_HASH_FOR_TIMING =
  "0000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const storedKey = Buffer.from(key, "hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return timingSafeEqual(storedKey, derivedKey);
}

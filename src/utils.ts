import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { hash, compare } from "bcryptjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashPassword(password: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return await compare(password, hashedPassword);
}

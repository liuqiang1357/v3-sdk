import bigInt, { BigInteger } from "big-integer";

const BI_CACHE: Record<string,Record<string, BigInteger>> = {}

export function bigIntCached(number: string, radix: number = 10) {
  if (BI_CACHE[number]?.[radix]) {
    return BI_CACHE[number][radix];
  }
  if (!BI_CACHE[number]) {
    BI_CACHE[number] = {};
  }
  return BI_CACHE[number][radix] = bigInt(number, radix);
}

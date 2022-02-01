import bigInt from 'big-integer'

// constants used internally but not expected to be used externally
export const NEGATIVE_ONE = bigInt(-1)
export const ZERO = bigInt(0)
export const ONE = bigInt(1)

// used in liquidity amount math
export const Q96 = bigInt(2).pow(bigInt(96))
export const Q192 = Q96.pow(bigInt(2))

import bigInt, { BigInteger } from 'big-integer'
import { BigintIsh, sqrt } from '@liuqiang1357/uniswap-sdk-core'

/**
 * Returns the sqrt ratio as a Q64.96 corresponding to a given ratio of amount1 and amount0
 * @param amount1 The numerator amount i.e., the amount of token1
 * @param amount0 The denominator amount i.e., the amount of token0
 * @returns The sqrt ratio
 */

export function encodeSqrtRatioX96(amount1: BigintIsh, amount0: BigintIsh): BigInteger {
  const numerator = bigInt(amount1).shiftLeft(bigInt(192))
  const denominator = bigInt(amount0)
  const ratioX192 = numerator.divide(denominator)
  return sqrt(ratioX192)
}

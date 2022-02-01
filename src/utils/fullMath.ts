import { BigInteger } from 'big-integer'
import { ONE, ZERO } from '../internalConstants'

export abstract class FullMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static mulDivRoundingUp(a: BigInteger, b: BigInteger, denominator: BigInteger): BigInteger {
    const product = a.multiply(b)
    let result = product.divide(denominator)
    if (product.remainder(denominator).notEquals(ZERO)) result = result.add(ONE)
    return result
  }
}

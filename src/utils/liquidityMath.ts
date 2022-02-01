import { BigInteger } from 'big-integer'
import { NEGATIVE_ONE, ZERO } from '../internalConstants'

export abstract class LiquidityMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static addDelta(x: BigInteger, y: BigInteger): BigInteger {
    if (y.lesser(ZERO)) {
      return x.subtract(y.multiply(NEGATIVE_ONE))
    } else {
      return x.add(y)
    }
  }
}

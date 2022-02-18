import { MaxUint256 } from '@liuqiang1357/uniswap-sdk-core'
import bigInt, { BigInteger } from 'big-integer'
import invariant from 'tiny-invariant'
import { ONE, ZERO } from '../internalConstants'
import { bigIntCached } from './cache'
import { mostSignificantBit } from './mostSignificantBit'

function mulShift(val: BigInteger, mulBy: BigInteger): BigInteger {
  return val.multiply(mulBy).shiftRight(bigInt(128))
}

const Q32 = bigInt(2).pow(bigInt(32))

export abstract class TickMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  /**
   * The minimum tick that can be used on any pool.
   */
  public static MIN_TICK: number = -887272
  /**
   * The maximum tick that can be used on any pool.
   */
  public static MAX_TICK: number = -TickMath.MIN_TICK

  /**
   * The sqrt ratio corresponding to the minimum tick that could be used on any pool.
   */
  public static MIN_SQRT_RATIO: BigInteger = bigInt('4295128739')
  /**
   * The sqrt ratio corresponding to the maximum tick that could be used on any pool.
   */
  public static MAX_SQRT_RATIO: BigInteger = bigInt('1461446703485210103287273052203988822378723970342')

  /**
   * Returns the sqrt ratio as a Q64.96 for the given tick. The sqrt ratio is computed as sqrt(1.0001)^tick
   * @param tick the tick for which to compute the sqrt ratio
   */
  public static getSqrtRatioAtTick(tick: number): BigInteger {
    invariant(tick >= TickMath.MIN_TICK && tick <= TickMath.MAX_TICK && Number.isInteger(tick), 'TICK')
    const absTick: number = tick < 0 ? tick * -1 : tick

    let ratio: BigInteger =
      (absTick & 0x1) != 0
        ? bigIntCached('fffcb933bd6fad37aa2d162d1a594001', 16)
        : bigIntCached('100000000000000000000000000000000', 16)
    if ((absTick & 0x2) != 0) ratio = mulShift(ratio, bigIntCached('fff97272373d413259a46990580e213a', 16))
    if ((absTick & 0x4) != 0) ratio = mulShift(ratio, bigIntCached('fff2e50f5f656932ef12357cf3c7fdcc', 16))
    if ((absTick & 0x8) != 0) ratio = mulShift(ratio, bigIntCached('ffe5caca7e10e4e61c3624eaa0941cd0', 16))
    if ((absTick & 0x10) != 0) ratio = mulShift(ratio, bigIntCached('ffcb9843d60f6159c9db58835c926644', 16))
    if ((absTick & 0x20) != 0) ratio = mulShift(ratio, bigIntCached('ff973b41fa98c081472e6896dfb254c0', 16))
    if ((absTick & 0x40) != 0) ratio = mulShift(ratio, bigIntCached('ff2ea16466c96a3843ec78b326b52861', 16))
    if ((absTick & 0x80) != 0) ratio = mulShift(ratio, bigIntCached('fe5dee046a99a2a811c461f1969c3053', 16))
    if ((absTick & 0x100) != 0) ratio = mulShift(ratio, bigIntCached('fcbe86c7900a88aedcffc83b479aa3a4', 16))
    if ((absTick & 0x200) != 0) ratio = mulShift(ratio, bigIntCached('f987a7253ac413176f2b074cf7815e54', 16))
    if ((absTick & 0x400) != 0) ratio = mulShift(ratio, bigIntCached('f3392b0822b70005940c7a398e4b70f3', 16))
    if ((absTick & 0x800) != 0) ratio = mulShift(ratio, bigIntCached('e7159475a2c29b7443b29c7fa6e889d9', 16))
    if ((absTick & 0x1000) != 0) ratio = mulShift(ratio, bigIntCached('d097f3bdfd2022b8845ad8f792aa5825', 16))
    if ((absTick & 0x2000) != 0) ratio = mulShift(ratio, bigIntCached('a9f746462d870fdf8a65dc1f90e061e5', 16))
    if ((absTick & 0x4000) != 0) ratio = mulShift(ratio, bigIntCached('70d869a156d2a1b890bb3df62baf32f7', 16))
    if ((absTick & 0x8000) != 0) ratio = mulShift(ratio, bigIntCached('31be135f97d08fd981231505542fcfa6', 16))
    if ((absTick & 0x10000) != 0) ratio = mulShift(ratio, bigIntCached('9aa508b5b7a84e1c677de54f3e99bc9', 16))
    if ((absTick & 0x20000) != 0) ratio = mulShift(ratio, bigIntCached('5d6af8dedb81196699c329225ee604', 16))
    if ((absTick & 0x40000) != 0) ratio = mulShift(ratio, bigIntCached('2216e584f5fa1ea926041bedfe98', 16))
    if ((absTick & 0x80000) != 0) ratio = mulShift(ratio, bigIntCached('48a170391f7dc42444e8fa2', 16))

    if (tick > 0) ratio = MaxUint256.divide(ratio)

    // back to Q96
    return ratio.remainder(Q32).greater(ZERO) ? ratio.divide(Q32).add(ONE) : ratio.divide(Q32)
  }

  /**
   * Returns the tick corresponding to a given sqrt ratio, s.t. #getSqrtRatioAtTick(tick) <= sqrtRatioX96
   * and #getSqrtRatioAtTick(tick + 1) > sqrtRatioX96
   * @param sqrtRatioX96 the sqrt ratio as a Q64.96 for which to compute the tick
   */
  public static getTickAtSqrtRatio(sqrtRatioX96: BigInteger): number {
    invariant(
      sqrtRatioX96.greaterOrEquals(TickMath.MIN_SQRT_RATIO) && sqrtRatioX96.lesser(TickMath.MAX_SQRT_RATIO),
      'SQRT_RATIO'
    )

    const sqrtRatioX128 = sqrtRatioX96.shiftLeft(bigInt(32))

    const msb = mostSignificantBit(sqrtRatioX128)

    let r: BigInteger
    if (bigInt(msb).greaterOrEquals(bigInt(128))) {
      r = sqrtRatioX128.shiftRight(bigInt(msb - 127))
    } else {
      r = sqrtRatioX128.shiftLeft(bigInt(127 - msb))
    }

    let log_2: BigInteger = bigInt(msb)
      .subtract(bigInt(128))
      .shiftLeft(bigInt(64))

    for (let i = 0; i < 14; i++) {
      r = r.multiply(r).shiftRight(bigInt(127))
      const f = r.shiftRight(bigInt(128))
      log_2 = log_2.or(f.shiftLeft(bigInt(63 - i)))
      r = r.shiftRight(f)
    }

    const log_sqrt10001 = log_2.multiply(bigIntCached('255738958999603826347141'))

    const tickLow = log_sqrt10001
      .subtract(bigIntCached('3402992956809132418596140100660247210'))
      .shiftRight(bigInt(128))
      .toJSNumber()

    const tickHigh = log_sqrt10001
      .add(bigIntCached('291339464771989622907027621153398088495'))
      .shiftRight(bigInt(128))
      .toJSNumber()

    return tickLow === tickHigh
      ? tickLow
      : TickMath.getSqrtRatioAtTick(tickHigh).lesserOrEquals(sqrtRatioX96)
      ? tickHigh
      : tickLow
  }
}

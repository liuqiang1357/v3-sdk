import { MaxUint256 } from '@liuqiang1357/uniswap-sdk-core'
import bigInt, { BigInteger } from 'big-integer'
import invariant from 'tiny-invariant'
import { ONE, ZERO, Q96 } from '../internalConstants'
import { FullMath } from './fullMath'

const MaxUint160 = bigInt(2)
  .pow(bigInt(160))
  .subtract(ONE)

function multiplyIn256(x: BigInteger, y: BigInteger): BigInteger {
  const product = x.multiply(y)
  return product.and(MaxUint256)
}

function addIn256(x: BigInteger, y: BigInteger): BigInteger {
  const sum = x.add(y)
  return sum.and(MaxUint256)
}

export abstract class SqrtPriceMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static getAmount0Delta(
    sqrtRatioAX96: BigInteger,
    sqrtRatioBX96: BigInteger,
    liquidity: BigInteger,
    roundUp: boolean
  ): BigInteger {
    if (sqrtRatioAX96.greater(sqrtRatioBX96)) {
      ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
    }

    const numerator1 = liquidity.shiftLeft(bigInt(96))
    const numerator2 = sqrtRatioBX96.subtract(sqrtRatioAX96)

    return roundUp
      ? FullMath.mulDivRoundingUp(FullMath.mulDivRoundingUp(numerator1, numerator2, sqrtRatioBX96), ONE, sqrtRatioAX96)
      : numerator1
          .multiply(numerator2)
          .divide(sqrtRatioBX96)
          .divide(sqrtRatioAX96)
  }

  public static getAmount1Delta(
    sqrtRatioAX96: BigInteger,
    sqrtRatioBX96: BigInteger,
    liquidity: BigInteger,
    roundUp: boolean
  ): BigInteger {
    if (sqrtRatioAX96.greater(sqrtRatioBX96)) {
      ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
    }

    return roundUp
      ? FullMath.mulDivRoundingUp(liquidity, sqrtRatioBX96.subtract(sqrtRatioAX96), Q96)
      : liquidity.multiply(sqrtRatioBX96.subtract(sqrtRatioAX96)).divide(Q96)
  }

  public static getNextSqrtPriceFromInput(
    sqrtPX96: BigInteger,
    liquidity: BigInteger,
    amountIn: BigInteger,
    zeroForOne: boolean
  ): BigInteger {
    invariant(sqrtPX96.greater(ZERO))
    invariant(liquidity.greater(ZERO))

    return zeroForOne
      ? this.getNextSqrtPriceFromAmount0RoundingUp(sqrtPX96, liquidity, amountIn, true)
      : this.getNextSqrtPriceFromAmount1RoundingDown(sqrtPX96, liquidity, amountIn, true)
  }

  public static getNextSqrtPriceFromOutput(
    sqrtPX96: BigInteger,
    liquidity: BigInteger,
    amountOut: BigInteger,
    zeroForOne: boolean
  ): BigInteger {
    invariant(sqrtPX96.greater(ZERO))
    invariant(liquidity.greater(ZERO))

    return zeroForOne
      ? this.getNextSqrtPriceFromAmount1RoundingDown(sqrtPX96, liquidity, amountOut, false)
      : this.getNextSqrtPriceFromAmount0RoundingUp(sqrtPX96, liquidity, amountOut, false)
  }

  private static getNextSqrtPriceFromAmount0RoundingUp(
    sqrtPX96: BigInteger,
    liquidity: BigInteger,
    amount: BigInteger,
    add: boolean
  ): BigInteger {
    if (amount.equals(ZERO)) return sqrtPX96
    const numerator1 = liquidity.shiftLeft(bigInt(96))

    if (add) {
      let product = multiplyIn256(amount, sqrtPX96)
      if (product.divide(amount).equals(sqrtPX96)) {
        const denominator = addIn256(numerator1, product)
        if (denominator.greaterOrEquals(numerator1)) {
          return FullMath.mulDivRoundingUp(numerator1, sqrtPX96, denominator)
        }
      }

      return FullMath.mulDivRoundingUp(numerator1, ONE, numerator1.divide(sqrtPX96).add(amount))
    } else {
      let product = multiplyIn256(amount, sqrtPX96)

      invariant(product.divide(amount).equals(sqrtPX96))
      invariant(numerator1.greater(product))
      const denominator = numerator1.subtract(product)
      return FullMath.mulDivRoundingUp(numerator1, sqrtPX96, denominator)
    }
  }

  private static getNextSqrtPriceFromAmount1RoundingDown(
    sqrtPX96: BigInteger,
    liquidity: BigInteger,
    amount: BigInteger,
    add: boolean
  ): BigInteger {
    if (add) {
      const quotient = amount.lesserOrEquals(MaxUint160)
        ? amount.shiftLeft(bigInt(96)).divide(liquidity)
        : amount.multiply(Q96).divide(liquidity)

      return sqrtPX96.add(quotient)
    } else {
      const quotient = FullMath.mulDivRoundingUp(amount, Q96, liquidity)

      invariant(sqrtPX96.greater(quotient))
      return sqrtPX96.subtract(quotient)
    }
  }
}

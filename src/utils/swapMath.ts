import bigInt, { BigInteger } from 'big-integer'
import { FeeAmount } from '../constants'
import { NEGATIVE_ONE, ZERO } from '../internalConstants'
import { FullMath } from './fullMath'
import { SqrtPriceMath } from './sqrtPriceMath'

const MAX_FEE = bigInt(10).pow(bigInt(6))

export abstract class SwapMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static computeSwapStep(
    sqrtRatioCurrentX96: BigInteger,
    sqrtRatioTargetX96: BigInteger,
    liquidity: BigInteger,
    amountRemaining: BigInteger,
    feePips: FeeAmount
  ): [BigInteger, BigInteger, BigInteger, BigInteger] {
    const returnValues: Partial<{
      sqrtRatioNextX96: BigInteger
      amountIn: BigInteger
      amountOut: BigInteger
      feeAmount: BigInteger
    }> = {}

    const zeroForOne = sqrtRatioCurrentX96.greaterOrEquals(sqrtRatioTargetX96)
    const exactIn = amountRemaining.greaterOrEquals(ZERO)

    if (exactIn) {
      const amountRemainingLessFee = amountRemaining.multiply(MAX_FEE.subtract(bigInt(feePips))).divide(MAX_FEE)
      returnValues.amountIn = zeroForOne
        ? SqrtPriceMath.getAmount0Delta(sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, true)
        : SqrtPriceMath.getAmount1Delta(sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, true)
      if (amountRemainingLessFee.greaterOrEquals(returnValues.amountIn!)) {
        returnValues.sqrtRatioNextX96 = sqrtRatioTargetX96
      } else {
        returnValues.sqrtRatioNextX96 = SqrtPriceMath.getNextSqrtPriceFromInput(
          sqrtRatioCurrentX96,
          liquidity,
          amountRemainingLessFee,
          zeroForOne
        )
      }
    } else {
      returnValues.amountOut = zeroForOne
        ? SqrtPriceMath.getAmount1Delta(sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, false)
        : SqrtPriceMath.getAmount0Delta(sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, false)
      if (amountRemaining.multiply(NEGATIVE_ONE).greaterOrEquals(returnValues.amountOut)) {
        returnValues.sqrtRatioNextX96 = sqrtRatioTargetX96
      } else {
        returnValues.sqrtRatioNextX96 = SqrtPriceMath.getNextSqrtPriceFromOutput(
          sqrtRatioCurrentX96,
          liquidity,
          amountRemaining.multiply(NEGATIVE_ONE),
          zeroForOne
        )
      }
    }

    const max = sqrtRatioTargetX96.equals(returnValues.sqrtRatioNextX96)

    if (zeroForOne) {
      returnValues.amountIn =
        max && exactIn
          ? returnValues.amountIn
          : SqrtPriceMath.getAmount0Delta(returnValues.sqrtRatioNextX96, sqrtRatioCurrentX96, liquidity, true)
      returnValues.amountOut =
        max && !exactIn
          ? returnValues.amountOut
          : SqrtPriceMath.getAmount1Delta(returnValues.sqrtRatioNextX96, sqrtRatioCurrentX96, liquidity, false)
    } else {
      returnValues.amountIn =
        max && exactIn
          ? returnValues.amountIn
          : SqrtPriceMath.getAmount1Delta(sqrtRatioCurrentX96, returnValues.sqrtRatioNextX96, liquidity, true)
      returnValues.amountOut =
        max && !exactIn
          ? returnValues.amountOut
          : SqrtPriceMath.getAmount0Delta(sqrtRatioCurrentX96, returnValues.sqrtRatioNextX96, liquidity, false)
    }

    if (!exactIn && returnValues.amountOut!.greater(amountRemaining.multiply(NEGATIVE_ONE))) {
      returnValues.amountOut = amountRemaining.multiply(NEGATIVE_ONE)
    }

    if (exactIn && returnValues.sqrtRatioNextX96.notEquals(sqrtRatioTargetX96)) {
      // we didn't reach the target, so take the remainder of the maximum input as fee
      returnValues.feeAmount = amountRemaining.subtract(returnValues.amountIn!)
    } else {
      returnValues.feeAmount = FullMath.mulDivRoundingUp(
        returnValues.amountIn!,
        bigInt(feePips),
        MAX_FEE.subtract(bigInt(feePips))
      )
    }

    return [returnValues.sqrtRatioNextX96!, returnValues.amountIn!, returnValues.amountOut!, returnValues.feeAmount!]
  }
}

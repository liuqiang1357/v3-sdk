import bigInt, { BigInteger } from 'big-integer'
import { subIn256 } from '.'

const Q128 = bigInt(2).pow(bigInt(128))

export abstract class PositionLibrary {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  // replicates the portions of Position#update required to compute unaccounted fees
  public static getTokensOwed(
    feeGrowthInside0LastX128: BigInteger,
    feeGrowthInside1LastX128: BigInteger,
    liquidity: BigInteger,
    feeGrowthInside0X128: BigInteger,
    feeGrowthInside1X128: BigInteger
  ) {
    const tokensOwed0 = subIn256(feeGrowthInside0X128, feeGrowthInside0LastX128)
      .multiply(liquidity)
      .divide(Q128)

    const tokensOwed1 = subIn256(feeGrowthInside1X128, feeGrowthInside1LastX128)
      .multiply(liquidity)
      .divide(Q128)

    return [tokensOwed0, tokensOwed1]
  }
}

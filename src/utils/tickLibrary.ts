import bigInt, { BigInteger } from 'big-integer'
import { ZERO } from '../internalConstants'

interface FeeGrowthOutside {
  feeGrowthOutside0X128: BigInteger
  feeGrowthOutside1X128: BigInteger
}

const Q256 = bigInt(2).pow(bigInt(256))

export function subIn256(x: BigInteger, y: BigInteger): BigInteger {
  const difference = x.subtract(y)

  if (difference.lesser(ZERO)) {
    return Q256.add(difference)
  } else {
    return difference
  }
}

export abstract class TickLibrary {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static getFeeGrowthInside(
    feeGrowthOutsideLower: FeeGrowthOutside,
    feeGrowthOutsideUpper: FeeGrowthOutside,
    tickLower: number,
    tickUpper: number,
    tickCurrent: number,
    feeGrowthGlobal0X128: BigInteger,
    feeGrowthGlobal1X128: BigInteger
  ) {
    let feeGrowthBelow0X128: BigInteger
    let feeGrowthBelow1X128: BigInteger
    if (tickCurrent >= tickLower) {
      feeGrowthBelow0X128 = feeGrowthOutsideLower.feeGrowthOutside0X128
      feeGrowthBelow1X128 = feeGrowthOutsideLower.feeGrowthOutside1X128
    } else {
      feeGrowthBelow0X128 = subIn256(feeGrowthGlobal0X128, feeGrowthOutsideLower.feeGrowthOutside0X128)
      feeGrowthBelow1X128 = subIn256(feeGrowthGlobal1X128, feeGrowthOutsideLower.feeGrowthOutside1X128)
    }

    let feeGrowthAbove0X128: BigInteger
    let feeGrowthAbove1X128: BigInteger
    if (tickCurrent < tickUpper) {
      feeGrowthAbove0X128 = feeGrowthOutsideUpper.feeGrowthOutside0X128
      feeGrowthAbove1X128 = feeGrowthOutsideUpper.feeGrowthOutside1X128
    } else {
      feeGrowthAbove0X128 = subIn256(feeGrowthGlobal0X128, feeGrowthOutsideUpper.feeGrowthOutside0X128)
      feeGrowthAbove1X128 = subIn256(feeGrowthGlobal1X128, feeGrowthOutsideUpper.feeGrowthOutside1X128)
    }

    return [
      subIn256(subIn256(feeGrowthGlobal0X128, feeGrowthBelow0X128), feeGrowthAbove0X128),
      subIn256(subIn256(feeGrowthGlobal1X128, feeGrowthBelow1X128), feeGrowthAbove1X128)
    ]
  }
}

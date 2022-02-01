import { MaxUint256 } from '@liuqiang1357/uniswap-sdk-core'
import bigInt, { BigInteger } from 'big-integer'
import invariant from 'tiny-invariant'
import { ZERO } from '../internalConstants'

const TWO = bigInt(2)
const POWERS_OF_2 = [128, 64, 32, 16, 8, 4, 2, 1].map((pow: number): [number, BigInteger] => [
  pow,
  TWO.pow(bigInt(pow))
])

export function mostSignificantBit(x: BigInteger): number {
  invariant(x.greater(ZERO), 'ZERO')
  invariant(x.lesserOrEquals(MaxUint256), 'MAX')

  let msb: number = 0
  for (const [power, min] of POWERS_OF_2) {
    if (x.greaterOrEquals(min)) {
      x = x.shiftRight(bigInt(power))
      msb += power
    }
  }
  return msb
}

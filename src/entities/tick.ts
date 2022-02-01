import bigInt, { BigInteger } from 'big-integer'
import invariant from 'tiny-invariant'
import { BigintIsh } from '@liuqiang1357/uniswap-sdk-core'
import { TickMath } from '../utils'

export interface TickConstructorArgs {
  index: number
  liquidityGross: BigintIsh
  liquidityNet: BigintIsh
}

export class Tick {
  public readonly index: number
  public readonly liquidityGross: BigInteger
  public readonly liquidityNet: BigInteger

  constructor({ index, liquidityGross, liquidityNet }: TickConstructorArgs) {
    invariant(index >= TickMath.MIN_TICK && index <= TickMath.MAX_TICK, 'TICK')
    this.index = index
    this.liquidityGross = bigInt(liquidityGross)
    this.liquidityNet = bigInt(liquidityNet)
  }
}

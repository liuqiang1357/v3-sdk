import { MaxUint256 } from '@liuqiang1357/uniswap-sdk-core'
import bigInt from 'big-integer'
import { ONE } from '../internalConstants'
import { mostSignificantBit } from './mostSignificantBit'

describe('mostSignificantBit', () => {
  it('throws for zero', () => {
    expect(() => mostSignificantBit(bigInt(0))).toThrow('ZERO')
  })
  it('correct value for every power of 2', () => {
    for (let i = 1; i < 256; i++) {
      const x = bigInt(2).pow(bigInt(i))
      expect(mostSignificantBit(x)).toEqual(i)
    }
  })
  it('correct value for every power of 2 - 1', () => {
    for (let i = 2; i < 256; i++) {
      const x = bigInt(2)
        .pow(bigInt(i))
        .subtract(bigInt(1))
      expect(mostSignificantBit(x)).toEqual(i - 1)
    }
  })

  it('succeeds for MaxUint256', () => {
    expect(mostSignificantBit(MaxUint256)).toEqual(255)
  })

  it('throws for MaxUint256 + 1', () => {
    expect(() => mostSignificantBit(MaxUint256.add(ONE))).toThrow('MAX')
  })
})

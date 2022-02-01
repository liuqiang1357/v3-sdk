import bigInt from 'big-integer'
import { ZERO } from '../internalConstants'
import { TickLibrary } from './tickLibrary'

describe('TickLibrary', () => {
  describe('#getFeeGrowthInside', () => {
    it('0', () => {
      const [feeGrowthInside0X128, feeGrowthInside1X128] = TickLibrary.getFeeGrowthInside(
        {
          feeGrowthOutside0X128: ZERO,
          feeGrowthOutside1X128: ZERO
        },
        {
          feeGrowthOutside0X128: ZERO,
          feeGrowthOutside1X128: ZERO
        },
        -1,
        1,
        0,
        ZERO,
        ZERO
      )
      expect(feeGrowthInside0X128).toEqual(ZERO)
      expect(feeGrowthInside1X128).toEqual(ZERO)
    })

    it('non-0, all inside', () => {
      const [feeGrowthInside0X128, feeGrowthInside1X128] = TickLibrary.getFeeGrowthInside(
        {
          feeGrowthOutside0X128: ZERO,
          feeGrowthOutside1X128: ZERO
        },
        {
          feeGrowthOutside0X128: ZERO,
          feeGrowthOutside1X128: ZERO
        },
        -1,
        1,
        0,
        bigInt(2).pow(bigInt(128)),
        bigInt(2).pow(bigInt(128))
      )
      expect(feeGrowthInside0X128).toEqual(bigInt(2).pow(bigInt(128)))
      expect(feeGrowthInside1X128).toEqual(bigInt(2).pow(bigInt(128)))
    })

    it('non-0, all outside', () => {
      const [feeGrowthInside0X128, feeGrowthInside1X128] = TickLibrary.getFeeGrowthInside(
        {
          feeGrowthOutside0X128: bigInt(2).pow(bigInt(128)),
          feeGrowthOutside1X128: bigInt(2).pow(bigInt(128))
        },
        {
          feeGrowthOutside0X128: ZERO,
          feeGrowthOutside1X128: ZERO
        },
        -1,
        1,
        0,
        bigInt(2).pow(bigInt(128)),
        bigInt(2).pow(bigInt(128))
      )
      expect(feeGrowthInside0X128).toEqual(ZERO)
      expect(feeGrowthInside1X128).toEqual(ZERO)
    })

    it('non-0, some outside', () => {
      const [feeGrowthInside0X128, feeGrowthInside1X128] = TickLibrary.getFeeGrowthInside(
        {
          feeGrowthOutside0X128: bigInt(2).pow(bigInt(127)),
          feeGrowthOutside1X128: bigInt(2).pow(bigInt(127))
        },
        {
          feeGrowthOutside0X128: ZERO,
          feeGrowthOutside1X128: ZERO
        },
        -1,
        1,
        0,
        bigInt(2).pow(bigInt(128)),
        bigInt(2).pow(bigInt(128))
      )
      expect(feeGrowthInside0X128).toEqual(bigInt(2).pow(bigInt(127)))
      expect(feeGrowthInside1X128).toEqual(bigInt(2).pow(bigInt(127)))
    })
  })
})

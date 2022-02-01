import bigInt from 'big-integer'
import { PositionLibrary } from '.'
import { ZERO } from '../internalConstants'

describe('PositionLibrary', () => {
  describe('#getTokensOwed', () => {
    it('0', () => {
      const [tokensOwed0, tokensOwed1] = PositionLibrary.getTokensOwed(ZERO, ZERO, ZERO, ZERO, ZERO)
      expect(tokensOwed0).toEqual(ZERO)
      expect(tokensOwed1).toEqual(ZERO)
    })

    it('non-0', () => {
      const [tokensOwed0, tokensOwed1] = PositionLibrary.getTokensOwed(
        ZERO,
        ZERO,
        bigInt(1),
        bigInt(2).pow(bigInt(128)),
        bigInt(2).pow(bigInt(128))
      )
      expect(tokensOwed0).toEqual(bigInt(1))
      expect(tokensOwed1).toEqual(bigInt(1))
    })
  })
})

import bigInt from 'big-integer'
import { Q96 } from '../internalConstants'
import { encodeSqrtRatioX96 } from './encodeSqrtRatioX96'

describe('#encodeSqrtRatioX96', () => {
  it('1/1', () => {
    expect(encodeSqrtRatioX96(1, 1)).toEqual(Q96)
  })

  it('100/1', () => {
    expect(encodeSqrtRatioX96(100, 1)).toEqual(bigInt('792281625142643375935439503360'))
  })

  it('1/100', () => {
    expect(encodeSqrtRatioX96(1, 100)).toEqual(bigInt('7922816251426433759354395033'))
  })

  it('111/333', () => {
    expect(encodeSqrtRatioX96(111, 333)).toEqual(bigInt('45742400955009932534161870629'))
  })

  it('333/111', () => {
    expect(encodeSqrtRatioX96(333, 111)).toEqual(bigInt('137227202865029797602485611888'))
  })
})

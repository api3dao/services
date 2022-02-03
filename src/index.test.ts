import { getServiceData } from '.';

describe('getServiceData', () => {
  it('returns Amberdata service data', () => {
    expect(getServiceData('Amberdata', 'global vwap for eth_usd', 'ropsten')).toEqual({
      beacon: {
        beaconId: '0x52775c1d7c61e5de2a64e58006f4ee1e0f7913dab0dd5d3e10f128c74167f4fe',
        parameters: [
          {
            name: 'pair',
            type: 'bytes32',
            value: 'eth_usd',
          },
          {
            name: '_path',
            type: 'bytes32',
            value: 'payload.vwap,',
          },
          {
            name: '_type',
            type: 'bytes32',
            value: 'int256,timestamp',
          },
          {
            name: '_times',
            type: 'bytes32',
            value: '1000000,',
          },
          {
            name: 'lookbackPeriod',
            type: 'bytes32',
            value: '5',
          },
        ],
        templateId: '0xd218d6d5f630faa290676bebe58c88f68a9dccbfece4a3028cf4a5539f397459',
      },
      contracts: {
        RrpBeaconServer: '0x2cFda716b751eb406C5124C6E4428F2AEA453D96',
      },
    });
  });
});

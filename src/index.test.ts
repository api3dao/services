import services from '.';

describe('getServiceData', () => {
  it('works', () => {
    expect(
      services.getServiceData(
        'Amberdata',
        '0x13a49162b764b0035587d5aa260156533975905bc1b89df9d2b43bd185186306-get _market_spot_vwap_pairs_{pair}_latest',
        'ropsten'
      )
    ).toEqual({
      beacon: {
        beaconId: '0x77898871469bda1f390433935691dea2022f7a7e76fc6cb8d4466a20fe659004',
        parameters: [
          {
            name: 'pair',
            type: 'bytes32',
            value: 'eth_usdc',
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
        ],
        templateId: '0x13a49162b764b0035587d5aa260156533975905bc1b89df9d2b43bd185186306',
      },
      contracts: {
        RrpBeaconServer: '0x2cFda716b751eb406C5124C6E4428F2AEA453D96',
      },
    });
  });
});

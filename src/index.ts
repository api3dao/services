import _chainsDeploymentInfo from '@api3dao/operations/data/chains.json';
import { goSync, isGoSuccess } from './utils';

interface ChainInfo {
  AirnodeRrp: string;
  AccessControlRegistry: string;
  OwnableCallForwarder: string;
  RequesterAuthorizerWithManager: string;
  RrpBeaconServer: string;
}

// Typing this more loosly to avoid TS errors
const chainsDeploymentInfo: { [chainName: string]: ChainInfo } = _chainsDeploymentInfo;

function getServiceData(apiName: string, beaconName: string, chain: string) {
  const chainInfo = chainsDeploymentInfo[chain];
  if (!chainInfo) {
    throw new Error(`Deployment file for ${chain} not found`);
  }

  const goBeaconData = goSync(() => require(`@api3dao/operations/data/apis/${apiName}/beacons/${beaconName}`));
  if (!isGoSuccess(goBeaconData)) throw new Error(`Service data does not exist.`);
  const beaconData = JSON.parse(goBeaconData.data).toString();

  return {
    contracts: {
      AirnodeRrp: chainInfo.AirnodeRrp,
      RrpBeaconServer: chainInfo.RrpBeaconServer,
    },
    airnodes: [],
    beacons: [
      {
        beaconId: beaconData['beaconId'],
        templateId: beaconData['templateId'],
        parameters: beaconData['decodedParameters'],
      },
    ],
    templates: [],
  };
}

export default { getServiceData };

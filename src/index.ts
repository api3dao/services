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

interface ServiceData {
  contracts: {
    RrpBeaconServer: string;
  };
  beacon: {
    beaconId: string;
    templateId: string;
    parameters: string;
  };
}

function getServiceData(apiName: string, beaconName: string, chain: string): ServiceData {
  const chainInfo = chainsDeploymentInfo[chain];
  if (!chainInfo) {
    throw new Error(`Deployment file for ${chain} not found`);
  }

  const goBeaconData = goSync(() => require(`@api3dao/operations/data/apis/${apiName}/beacons/${beaconName}`));
  if (!isGoSuccess(goBeaconData)) throw new Error(`Service data does not exist.`);
  const beaconData = JSON.parse(goBeaconData.data).toString();

  return {
    contracts: {
      RrpBeaconServer: chainInfo.RrpBeaconServer,
    },
    beacon: {
      beaconId: beaconData['beaconId'],
      templateId: beaconData['templateId'],
      parameters: beaconData['decodedParameters'],
    },
  };
}

export default { getServiceData };

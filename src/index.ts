import { readFileSync } from 'fs';

function getServiceData(serviceName: string, chain: string) {
  const deploymentJson = JSON.parse(readFileSync(`./deployments/${chain}.json`).toString());
  if (!deploymentJson) {
    throw new Error(`Deployment file for ${chain} not found`);
  }

  // TODO: import from @operations and filter by serviceName param
  const ethToUsdJson = JSON.parse(readFileSync('../opeartions/data/apis/Amberdata/beacons/ethToUsd.json').toString());

  return {
    contracts: {
      AirnodeRrp: '',
      RrpBeaconServer: deploymentJson['@api3/airnode-protocol/contracts/rrp/requesters/RrpBeaconServer'],
    },
    airnodes: [],
    beacons: [
      {
        beaconId: ethToUsdJson['beaconId'],
        templateId: ethToUsdJson['templateId'],
        parameters: ethToUsdJson['decodedParameters'],
      },
    ],
    templates: [],
  };
}

export default { getServiceData };

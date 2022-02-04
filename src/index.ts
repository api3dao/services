import _chainsDeploymentInfo from '@api3dao/operations/data/chains.json';
import { ethers } from 'ethers';
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

export function getServiceData(apiName: string, beaconName: string, chain: string): ServiceData {
  const chainInfo = chainsDeploymentInfo[chain];
  if (!chainInfo) {
    throw new Error(`Deployment file for ${chain} not found`);
  }

  const goBeaconData = goSync(() => require(`@api3dao/operations/data/apis/${apiName}/beacons/${beaconName}`));
  if (!isGoSuccess(goBeaconData)) throw new Error(`Service data does not exist.`);
  const beaconData = goBeaconData.data;

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

interface MnemonicSender {
  mnemonic: string;
  derivationPath?: string;
}

// Keeping SenderAccount type like this so we can add "PrivateKeySender" (as union with MnemonicSender) if necessary in
// the future.
type SenderAccount = MnemonicSender;

interface WhitelistBeaconReaderResult {
  beaconId: string;
  beaconReaderAddress: string;
  expirationTimestamp: number;
  indefiniteWhitelistStatus: boolean;
}

export async function whitelistBeaconReader(
  beaconId: string,
  beaconReaderAddress: string,
  chain: string,
  providerUrl: string,
  senderAccount: SenderAccount
): Promise<WhitelistBeaconReaderResult> {
  const goBeaconWhitelister = goSync(() =>
    require(`@api3dao/utility-contracts/SelfServeRrpBeaconServerWhitelister/deployments/${chain}/SelfServeRrpBeaconServerWhitelister.json`)
  );
  if (!isGoSuccess(goBeaconWhitelister)) throw new Error(`No whitelister contract found for chain: ${chain}`);
  const beaconWhitelister = goBeaconWhitelister.data;

  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const wallet = ethers.Wallet.fromMnemonic(senderAccount.mnemonic, senderAccount.derivationPath);
  const connectedWallet = wallet.connect(provider);
  const whitelisterContract = new ethers.Contract(beaconWhitelister.address, beaconWhitelister.abi, connectedWallet);

  await whitelisterContract.whitelistReader(beaconId, beaconReaderAddress);

  const eventData = await waitForWhitelistedReaderEvent(whitelisterContract, beaconId, beaconReaderAddress, provider);
  return {
    beaconId: eventData.beaconId,
    beaconReaderAddress: eventData.reader,
    expirationTimestamp: eventData.expirationTimestamp.toNumber() * 1000,
    indefiniteWhitelistStatus: eventData.indefiniteWhitelistStatus,
  };
}

async function waitForWhitelistedReaderEvent(
  whitelisterContract: ethers.Contract,
  beaconId: string,
  beaconReaderAddress: string,
  provider: ethers.providers.JsonRpcProvider
) {
  const filter = whitelisterContract.filters.WhitelistedReader(beaconId, beaconReaderAddress);
  const result = await new Promise((resolve) => provider.once(filter, resolve)).then((rawLog) =>
    whitelisterContract.interface.parseLog(rawLog as ethers.Event)
  );

  return result.args;
}

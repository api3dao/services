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

interface PrivateKeySender {
  privateKey: string;
}

interface MnemonicSender {
  mnemonic: string;
  derivationPath?: string;
}

type SenderAccount = PrivateKeySender | MnemonicSender;

export function isPrivateKeySender(senderAccount: SenderAccount): senderAccount is PrivateKeySender {
  return Object.prototype.hasOwnProperty.call(senderAccount, 'privateKey');
}

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
  const wallet = isPrivateKeySender(senderAccount)
    ? new ethers.Wallet(senderAccount.privateKey)
    : ethers.Wallet.fromMnemonic(senderAccount.mnemonic, senderAccount.derivationPath);
  const connectedWallet = wallet.connect(provider);
  const whitelisterContract = new ethers.Contract(beaconWhitelister.address, beaconWhitelister.abi).connect(
    connectedWallet
  );

  await whitelisterContract.whitelistReader(beaconId, beaconReaderAddress);
  const filter = whitelisterContract.filters.WhitelistedReader(beaconId, beaconReaderAddress);
  // TODO: Simplify
  const { args } = await new Promise((resolve) => provider.once(filter, resolve)).then((rawLog) =>
    whitelisterContract.interface.parseLog(rawLog as ethers.Event)
  );

  return {
    beaconId: args.beaconId,
    beaconReaderAddress: args.reader,
    expirationTimestamp: args.expirationTimestamp.toNumber() * 1000,
    indefiniteWhitelistStatus: args.indefiniteWhitelistStatus,
  };
}

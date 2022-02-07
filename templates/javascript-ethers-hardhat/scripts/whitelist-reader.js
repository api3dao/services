const fs = require("fs");
const hre = require("hardhat");
const { getServiceData, whitelistBeaconReader } = require("@api3/services");

async function main() {
  const network = hre.network.name;

  if (network.toLowerCase() === "localhost") {
    console.log(
      'Whitelisting is not necessary when using the mocked "RrpBeaconServerMock" contract.'
    );
    return;
  }

  // Read BeaconReaderExample contract address deployed using deploy.js
  let beaconReaderExampleAddress = null;
  try {
    const parseResult = JSON.parse(
      fs.readFileSync(`./deployments/${network}.json`).toString()
    );
    beaconReaderExampleAddress = parseResult.beaconReaderExampleAddress;
    if (!beaconReaderExampleAddress) throw new Error("beaconId not found");
  } catch (e) {
    console.log(`Error: ${e}. Please try first running deploy script`);
    return;
  }

  const deployments = getServiceData("Amberdata", "eth_usd", network);
  const beaconId = deployments.beacon.beaconId;

  // This is the account specified in the ".env" file. Hardhat reads that
  // file when reading the configuration in "hardhat.config.js"
  const { mnemonic } = hre.network.config.accounts;
  const result = await whitelistBeaconReader(
    beaconId,
    beaconReaderExampleAddress,
    network.toLowerCase(),
    hre.network.config.url,
    { mnemonic: mnemonic }
  );

  if (result.indefiniteWhitelistStatus) {
    console.log(`Beacon reader whitelisted indefinitely`);
  } else {
    const userFriendlyDate = new Date(
      result.expirationTimestamp * 1000
    ).toLocaleString();
    console.log(`Beacon reader whitelisted until ${userFriendlyDate}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

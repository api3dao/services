const fs = require("fs");
const hre = require("hardhat");
const { getServiceData } = require("@api3/services");

async function main() {
  const network = hre.network.name;

  // Read BeaconReaderExample contract address from deployments files
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

  const beaconReaderExample = await hre.ethers.getContractAt(
    "BeaconReaderExample",
    beaconReaderExampleAddress
  );

  if (network.toLowerCase() === "localhost") {
    // Uses RrpBeaconServerMock contract so any value would work
    beaconId = ethers.utils.hexlify(ethers.utils.randomBytes(32));
  } else {
    const deployments = getServiceData("Amberdata", "eth_usd", network);
    beaconId = deployments.beacon.beaconId;
  }

  try {
    // Read the beacon and print out the raw response returned by ethers
    const response = await beaconReaderExample.readBeacon(beaconId);
    console.log("Raw beacon response:");
    console.log(response);
    console.log();

    // The ethers response is combined array and object with BigInteger
    // values. There are two values returned:
    //  1. value - the actual value of the beacon
    //  2. timestamp - unix timestamp, specifying when was the beacon
    //     value updated
    const value = response.value.toString();
    const timestamp = response.timestamp.toNumber();
    const userFriendlyDate = new Date(timestamp * 1000).toLocaleString();
    console.log(`Beacon value: ${value}, timestamp: ${userFriendlyDate}.`);
  } catch (e) {
    console.error(e);
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

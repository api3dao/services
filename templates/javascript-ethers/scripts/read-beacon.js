const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const network = hre.network.name;

  // Read BeaconReaderExample contract address deployed using deploy.js
  let beaconReaderExampleAddress = null;
  if (network.toLowerCase() === "hardhat") {
    // In case of hardhat network we must re-deploy the contracts
    const RrpBeaconServerMock = await ethers.getContractFactory(
      "RrpBeaconServerMock"
    );
    const rrpBeaconServerMock = await RrpBeaconServerMock.deploy();
    await rrpBeaconServerMock.deployed();
    const BeaconReaderExample = await ethers.getContractFactory(
      "BeaconReaderExample"
    );
    const beaconReaderExample = await BeaconReaderExample.deploy(
      rrpBeaconServerMock.address
    );
    await beaconReaderExample.deployed();
    beaconReaderExampleAddress = beaconReaderExample.address;
  } else {
    try {
      ({ beaconReaderExampleAddress } = JSON.parse(
        fs.readFileSync(`./deployments/${network}.json`).toString()
      ));
      if (!beaconReaderExampleAddress) throw new Error("beaconId not found");
    } catch (e) {
      console.log(`Error: ${e}. Please try first running deploy script`);
      return;
    }
  }

  const beaconReaderExample = await hre.ethers.getContractAt(
    "BeaconReaderExample",
    beaconReaderExampleAddress
  );

  if (
    network.toLowerCase() === "hardhat" ||
    network.toLowerCase() === "localhost"
  ) {
    // Uses RrpBeaconServerMock contract so any value would work
    beaconId = ethers.utils.hexlify(ethers.utils.randomBytes(32));
  } else {
    // TODO: replace with path to services repo
    // Make sure to first whitelist BeaconReaderExample contract in RrpBeaconServer
    const deployments = require(`../services/data/beacons/0.3.1/${network}.json`);
    beaconId = deployments.beacons[0].beaconId;
  }

  try {
    console.log(
      "Beacon value: ",
      await beaconReaderExample.readBeacon(beaconId)
    );
  } catch (e) {
    console.error(e.error || e);
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

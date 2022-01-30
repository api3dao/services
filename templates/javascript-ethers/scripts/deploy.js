// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Get the RrpBeaconServer contract address based on the current network
  const network = hre.network.name;

  let rrpBeaconServerAddress;

  if (
    network.toLowerCase() === "hardhat" ||
    network.toLowerCase() === "localhost"
  ) {
    // Deploy RrpBeaconServerMock contract
    const RrpBeaconServerMock = await ethers.getContractFactory(
      "RrpBeaconServerMock"
    );
    const rrpBeaconServerMock = await RrpBeaconServerMock.deploy();
    await rrpBeaconServerMock.deployed();
    rrpBeaconServerAddress = rrpBeaconServerMock.address;
  } else {
    // TODO: replace with path to services repo
    const deployments = require(`../services/data/beacons/0.3.1/${network}.json`);
    rrpBeaconServerAddress =
      deployments.contracts[
        "@api3/airnode-protocol/contracts/rrp/requesters/RrpBeaconServer"
      ];
  }

  // Deploy BeaconReaderExample contract
  const BeaconReaderExample = await ethers.getContractFactory(
    "BeaconReaderExample"
  );
  const beaconReaderExample = await BeaconReaderExample.deploy(
    rrpBeaconServerAddress
  );
  await beaconReaderExample.deployed();

  // This solves the bug in Mumbai network where the contract address is not the real one
  const txHash = beaconReaderExample.deployTransaction.hash;
  console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
  const txReceipt = await ethers.provider.waitForTransaction(txHash);

  // Output the contract address to the console
  console.log("BeaconReaderExample deployed to:", txReceipt.contractAddress);

  if (network.toLowerCase() !== "hardhat") {
    // Save the contract address to a file
    const destinationDir = "./deployments";
    try {
      fs.mkdirSync(destinationDir, { recursive: true });
    } catch (e) {
      console.log("Cannot create folder ", e);
    }
    fs.writeFileSync(
      path.join(destinationDir, `${network}.json`),
      JSON.stringify(
        { beaconReaderExampleAddress: txReceipt.contractAddress },
        null,
        2
      )
    );
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

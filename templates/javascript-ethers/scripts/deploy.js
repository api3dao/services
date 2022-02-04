// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { getServiceData } = require("@api3/services");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await hre.run("compile");

  // Get the RrpBeaconServer contract address based on the current network
  const network = hre.network.name;

  // Determine the beacon server address. If using the local network, it will
  // deploy the "RrpBeaconServerMock". For remote networks we try to connect
  // to already existing beacon server contract.
  let rrpBeaconServerAddress;
  if (network.toLowerCase() === "localhost") {
    // Deploy the RrpBeaconServerMock contract
    const RrpBeaconServerMock = await ethers.getContractFactory(
      "RrpBeaconServerMock"
    );
    const rrpBeaconServerMock = await RrpBeaconServerMock.deploy();
    await rrpBeaconServerMock.deployed();
    rrpBeaconServerAddress = rrpBeaconServerMock.address;
  } else {
    const deployments = getServiceData(
      "Amberdata",
      "global vwap for eth_usd",
      network
    );
    rrpBeaconServerAddress = deployments.contracts.RrpBeaconServer;
  }

  // Deploy BeaconReaderExample contract
  const BeaconReaderExample = await ethers.getContractFactory(
    "BeaconReaderExample"
  );
  const beaconReaderExample = await BeaconReaderExample.deploy(
    rrpBeaconServerAddress
  );
  await beaconReaderExample.deployed();

  // This solves the bug in Mumbai network where the contract address is not the real one.
  // TODO: Do we need? See: https://github.com/nomiclabs/hardhat/issues/2162#issuecomment-1011824602
  const txHash = beaconReaderExample.deployTransaction.hash;
  console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
  const txReceipt = await ethers.provider.waitForTransaction(txHash);

  // Output the contract address to the console
  console.log("BeaconReaderExample deployed to:", txReceipt.contractAddress);

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

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

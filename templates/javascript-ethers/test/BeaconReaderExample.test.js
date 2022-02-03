const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BeaconReaderExample", function () {
  it("Should return the beacon value", async function () {
    // Deploy RrpBeaconServerMock contract
    const RrpBeaconServerMock = await ethers.getContractFactory(
      "RrpBeaconServerMock"
    );
    const rrpBeaconServerMock = await RrpBeaconServerMock.deploy();
    await rrpBeaconServerMock.deployed();

    // Deploy BeaconReaderExample contract
    const BeaconReaderExample = await ethers.getContractFactory(
      "BeaconReaderExample"
    );
    let beaconReaderExample = await BeaconReaderExample.deploy(
      rrpBeaconServerMock.address
    );
    await beaconReaderExample.deployed();

    // This solves the bug in polygon-mumbai network where the contract address is not the real one
    const txHash = beaconReaderExample.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    beaconReaderExample = await hre.ethers.getContractAt(
      "BeaconReaderExample",
      txReceipt.contractAddress
    );
    const beaconId = ethers.utils.hexlify(ethers.utils.randomBytes(32));

    // Reading the beacon value after 5 seconds just to give enough time to polygon-mumbai network to be ready
    setTimeout(async function () {
      const [value] = await beaconReaderExample.readBeacon(beaconId);
      expect(value.toString()).to.equal("1234567890");
    }, 5000);
  });
});

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

    // Try reading the value
    const beaconId = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    const [value] = await beaconReaderExample.readBeacon(beaconId);

    // Assert that the value is the value returned by "RrpBeaconServerMock"
    expect(value.toString()).to.equal("1234567890");
  });
});

require("@nomiclabs/hardhat-waffle");

require("dotenv").config();
const { NETWORK, PROVIDER_URL, MNEMONIC } = process.env;

// For remote networks, you have to configure hardhat with the accounts
// and provider that should be used to connect to the target chain.
const network = NETWORK
  ? {
      [NETWORK]: {
        ...(PROVIDER_URL && { url: PROVIDER_URL }),
        ...(MNEMONIC && {
          accounts: {
            mnemonic: MNEMONIC,
          },
        }),
      },
    }
  : undefined;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  networks: network,
  mocha: {
    timeout: 120000,
  },
};

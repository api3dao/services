import { HardhatUserConfig } from 'hardhat/types';

const config: HardhatUserConfig = {
  defaultNetwork: 'localhost',
  solidity: {
    compilers: [{ version: '0.8.9', settings: {} }],
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
    },
  },
};

export default config;

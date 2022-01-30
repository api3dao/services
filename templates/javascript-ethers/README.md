# Beacon Reader Example

> A starter project for reading beacon values from a smart contract

This project is composed of the following:

1. A test that uses a mocked RrpBeaconServer to simulate reading a beacon value from a smart contract.
1. A script to deploy the BeaconReaderExample contract to any network. This script will set the address of the RrpBeaconServer contract deployed on the selected network and after the script finishes it will display the address of the contract deployed but also save this address to `deployments` directory on the root of this repo (except for hardhat network since this network is started and stop just for the duration of the script execution).
1. A script to read the beacon value from the deployed contract. If selected network is not `hardhat` or `localhost` then this address must be then whitelisted by the RrpBeaconServer manager account prior to reading the beacon value.

## Instructions

1. Clone this repo
1. Run the following to install the dependencies

```sh
npm install
```

Now depending on the network you are using you will need to do the following:

### Default network

The simplest way to test this project is by using the integrated [Hardhat network](https://hardhat.org/hardhat-network/), in which case no extra steps are needed to run both the test and the scripts.

#### Test

```sh
npx hardhat test test/BeaconReaderExample.test.js
```

#### Script

```sh
npx hardhat run scripts/deploy.js
npx hardhat run scripts/read-beacon.js
```

### Localhost network

You could also start a local ethreum node by running the following command on a separate terminal:

```sh
npx hardhat node
```

#### Test

```sh
npx hardhat test test/BeaconReaderExample.test.js --network localhost
```

#### Script

```sh
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/read-beacon.js --network localhost
```

### Remote networks

This will require that you set some parameters in an .env file. You could rename the [.env.example](./.env.example) file in the root of this repo and replace the placeholders with valid values.

For instance if you wanted to deploy the contract on [Polygon Mumbai Testnet](https://docs.polygon.technology/docs/develop/network-details/network/) you will need to set `NETWORK=polygon-mumbai` and `PROVIDER_URL=https://rpc-mumbai.matic.today`. Keep in mind that you'll need to also set the `MNEMONIC` of an account that needs to have enough funds.

#### Test

```sh
npx hardhat test test/BeaconReaderExample.test.js --network polygon-mumbai
```

#### Script

```sh
npx hardhat run scripts/deploy.js --network polygon-mumbai
npx hardhat run scripts/read-beacon.js --network polygon-mumbai
```

**WARNING:** Please note that whatever value you set for `NETWORK` in the .env file must match a file name within the `./services/data/beacons/0.3.1/` directory. This is because the script will try to find the address of an already deployed RrpBeaconServer contract on the selected network.
Also before actually being able to read the beacon value please remember that you must contact the manager of the deployed RrpBeaconServer contract and ask for the BeaconReaderExample contract to be whitelisted.

# Beacon Reader Example

> A starter project for reading beacon values from a smart contract

This project was created by the `create-beacon-reader-app` CLI from the
[services repository](https://github.com/api3dao/services). This project is
composed of the following:

1. A test that uses a mocked `RrpBeaconServer` contract to simulate reading a
   beacon value from a smart contract.
2. A script to deploy the BeaconReaderExample contract to any network. This
   script will set the address of the `RrpBeaconServer` contract deployed on the
   selected network and after the script finishes it will display the address of
   the contract deployed but also save this address to `deployments` directory
   in the root of this repo.
3. A script to whitelist the beacon reader in order to be able to read the
   beacon value from the target beacon. If the selected network is `localhost`
   then using running this script is not necessary since the `RrpBeaconServer`
   is mocked and returns mocked value independently of the whitelist status.
4. A script to read the beacon value from the deployed contract.

## Instructions

Run the following to install the dependencies

```sh
npm install
# or
yarn install
```

The beacon reader app can be run on multiple networks. Read the section below
for more details.

### Localhost network

First, you need to start a local ethereum node by running the following command
on a separate terminal:

```sh
npm run eth-node
# or
yarn eth-node
```

#### Test

The test command will run the tests defined in the `test` directory.

```sh
npm run test -- --network localhost
# or
yarn test --network localhost
```

#### Script

Use these scripts to deploy smart contracts to the target chain and to read the
beacon value. Since you are using the localhost network and mocked
`RrpBeaconServer`, there is no need whitelist the reader before running the
`read-beacon` script.

You also do not need to edit the `.env` file, since hardhat will connect to the
local chain automatically (using the default configuration). It will also
provide funded accounts to run the scripts below.

```sh
npm run deploy -- --network localhost
npm run read-beacon -- --network localhost
# or
yarn deploy --network localhost
yarn read-beacon --network localhost
```

### Remote networks

This will require that you set some parameters in an `.env` file. You could copy
the [.env.example](./.env.example) file in the root of this repo and replace the
placeholders with valid values.

For instance if you wanted to deploy the contract on
[Polygon Mumbai Testnet](https://docs.polygon.technology/docs/develop/network-details/network/)
you will need to set `NETWORK=polygon-mumbai` and
`PROVIDER_URL=https://rpc-mumbai.matic.today`. Keep in mind that you'll need to
also set the `MNEMONIC` of an account that needs to have enough funds.

#### Test

The test command will run the tests defined in the `test` directory.

```sh
npm run test -- --network polygon-mumbai
# or
yarn test --network polygon-mumbai
```

#### Script

Use these scripts to deploy smart contracts to the target chain and to read the
beacon value for the `eth_usd` endpoint. Since you are using a remote network
you also need to whitelist the beacon reader before attempting to call
`read-beacon` script.

**WARNING:** Please note that whatever value you set for `NETWORK` in the `.env`
file must match a file name within the `@api3/services` repository. This is
because the script does not deploy the mocked `RrpBeaconServer`, but instead
connects to an existing `RrpBeaconServer` provided by API3.

```sh
npm run deploy -- --network polygon-mumbai
npm run whitelist-reader -- --network polygon-mumbai
npm run read-beacon -- --network polygon-mumbai
# or
yarn deploy --network polygon-mumbai
yarn whitelist-reader --network polygon-mumbai
yarn read-beacon --network polygon-mumbai
```

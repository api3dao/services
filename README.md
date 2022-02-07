# @api3/services

> A package that provides information about services already deployed like beacons, airnodes and contract addresses.
> Also provides tools necessary to create projects which use these services.

## User documentation

The user facing documentation will be added to [API3 docs](https://docs.api3.org/) shorty.

## Developer documentation

This package consists of two parts, both related to beacons:

1. API - to get the data about api3 managed services and a beacon whitelisting function
2. CLI - a CLI tool, called `create-beacon-reader-app` which creates a starter project for applications using beacon
   values.

### Installation, building and testing

To install dependencies, run:

```
yarn install
```

To build the project, run:

```
yarn build
```

To test, first build the project and then run:

```
yarn eth-node
```

This is needed because some of the tests require locally running blockchain. After the blockchain is running you can run
the tests:

```
yarn test
```

Look at `package.json` for details and more scripts.

### Using the CLI from source

To run the CLI, make sure you have installed all of the dependencies and run:

```
yarn cli
```

which will run the CLI same way as if you used invoked it with `npx` (but this one will be run from the source).

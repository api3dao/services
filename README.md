# @api3/services

> A package that houses information needed for dapps to interact with API3 services

## `/data/beacons/{version}/{network}.json`

These are JSON files that contains the contract addresses required by the Airkeepers. The file name indicates the
network in which the contracts were deployed.

## `/data/beacons/{version}/{network}.json/contracts`

- `@api3/airnode-protocol/contracts/authorizers/RequesterAuthorizerWithManager`: RequesterAuthorizerWithManager contract
  address
- `@api3/airnode-protocol/contracts/rrp/requesters/RrpBeaconServer`: RrpBeaconServer contract address

## `/data/beacons/{version}/{network}.json/beacons[]`

- `beaconId`: Hash of the 2 fields below
- `templateId`: Hash of `airnode`, `endpointId` and the field below
- `parameters`: Parameters provided by the requester in addition to the parameters in the template

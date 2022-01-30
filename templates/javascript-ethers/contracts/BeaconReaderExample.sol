// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@api3/airnode-protocol/contracts/rrp/requesters/interfaces/IRrpBeaconServer.sol";

contract BeaconReaderExample {
    IRrpBeaconServer public immutable rrpBeaconServer;

    constructor(address _rrpBeaconServerAddress) {
        require(_rrpBeaconServerAddress != address(0), "Zero address");
        rrpBeaconServer = IRrpBeaconServer(_rrpBeaconServerAddress);
    }

    function readBeacon(bytes32 _beaconId)
        external
        view
        returns (int224 value, uint256 timestamp)
    {
        (value, timestamp) = rrpBeaconServer.readBeacon(_beaconId);
    }
}

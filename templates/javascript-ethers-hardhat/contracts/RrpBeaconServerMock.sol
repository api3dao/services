// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@api3/airnode-protocol/contracts/rrp/requesters/interfaces/IRrpBeaconServer.sol";

contract RrpBeaconServerMock is IRrpBeaconServer {
    function extendWhitelistExpiration(
        bytes32 beaconId,
        address reader,
        uint64 expirationTimestamp
    ) external {}

    function setWhitelistExpiration(
        bytes32 beaconId,
        address reader,
        uint64 expirationTimestamp
    ) external {}

    function setIndefiniteWhitelistStatus(
        bytes32 beaconId,
        address reader,
        bool status
    ) external {}

    function revokeIndefiniteWhitelistStatus(
        bytes32 beaconId,
        address reader,
        address setter
    ) external {}

    function setUpdatePermissionStatus(address updateRequester, bool status)
        external
    {}

    function requestBeaconUpdate(
        bytes32 beaconId,
        address requester,
        address designatedWallet,
        bytes calldata parameters
    ) external {}

    function fulfill(bytes32 requestId, bytes calldata data) external {}

    /// @notice Called to read the beacon
    /// @dev The sender must be whitelisted.
    /// If the `timestamp` of a beacon is zero, this means that it was never
    /// written to before, and the zero value in the `value` field is not
    /// valid. In general, make sure to check if the timestamp of the beacon is
    /// fresh enough, and definitely disregard beacons with zero `timestamp`.
    /// @param beaconId ID of the beacon that will be returned
    /// @return value Beacon value
    /// @return timestamp Beacon timestamp
    function readBeacon(bytes32 beaconId)
        external
        view
        override
        returns (int224 value, uint32 timestamp)
    {
        // Any caller can read the beacon
        value = int224(1234567890);
        timestamp = uint32(block.timestamp);
    }

    function readerCanReadBeacon(bytes32 beaconId, address reader)
        external
        view
        returns (bool)
    {}

    function beaconIdToReaderToWhitelistStatus(bytes32 beaconId, address reader)
        external
        view
        returns (uint64 expirationTimestamp, uint192 indefiniteWhitelistCount)
    {}

    function beaconIdToReaderToSetterToIndefiniteWhitelistStatus(
        bytes32 beaconId,
        address reader,
        address setter
    ) external view returns (bool indefiniteWhitelistStatus) {}

    function sponsorToUpdateRequesterToPermissionStatus(
        address sponsor,
        address updateRequester
    ) external view returns (bool permissionStatus) {}

    function deriveBeaconId(bytes32 templateId, bytes calldata parameters)
        external
        pure
        returns (bytes32 beaconId)
    {}
}

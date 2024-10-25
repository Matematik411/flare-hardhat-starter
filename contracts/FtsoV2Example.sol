// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {TestFtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/TestFtsoV2Interface.sol";
import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";

contract FtsoV2FeedConsumer {
    TestFtsoV2Interface internal ftsoV2;
    bytes21 public flrUsdId = 0x01464c522f55534400000000000000000000000000;

    constructor() {
        ftsoV2 = ContractRegistry.getTestFtsoV2();
    }

    function getFlrUsdPrice() external view returns (uint256, int8, uint64) {
        (uint256 feedValue, int8 decimals, uint64 timestamp) = ftsoV2
            .getFeedById(flrUsdId);

        return (feedValue, decimals, timestamp);
    }

    function getFeedPrice(
        bytes21 feedId
    ) external view returns (uint256, int8, uint64) {
        (uint256 feedValue, int8 decimals, uint64 timestamp) = ftsoV2
            .getFeedById(feedId);

        return (feedValue, decimals, timestamp);
    }
}

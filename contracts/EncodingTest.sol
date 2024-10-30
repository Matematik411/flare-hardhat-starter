// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9;

import "./generated/interfaces/verification/IJsonApiVerification.sol";
import "./generated/implementation/verification/JsonApiVerification.sol";

struct Song {
    string verse; // single string data
}

contract EncodingTest {
    Song[] public songs;
    IJsonApiVerification public jsonApiVerification;

    constructor() {
        jsonApiVerification = new JsonApiVerification();
    }

    function addSong(IJsonApi.Response calldata response) public {
        // bytes32[] memory merkleProof = new bytes32[](
        //     response.merkleProof.length
        // );
        IJsonApi.Proof memory proof = IJsonApi.Proof({
            merkleProof: new bytes32[](0),
            data: response
        });
        require(jsonApiVerification.verifyJsonApi(proof), "Invalid proof");

        Song memory _song = abi.decode(
            response.responseBody.abi_encoded_data,
            (Song)
        );

        songs.push(_song);
    }
}

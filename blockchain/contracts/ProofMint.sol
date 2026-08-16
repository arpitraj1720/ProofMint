
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProofMint {
    mapping(string => bool) public hashes;

    function storeHash(string memory hash) public {
        require(!hashes[hash], "Hash already exists");
        hashes[hash] = true;
    }

    function verifyHash(string memory hash) public view returns (bool) {
        return hashes[hash];
    }
}
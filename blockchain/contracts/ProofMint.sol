// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ProofMint
 * @dev Decentralized digital media provenance and copyright notarization protocol.
 * Developed by VIT Chennai students under the academic guidance of Prof. Malathi G.
 */
contract ProofMint {
    struct ProofRecord {
        address registrant;     // Initial minter/creator wallet
        address currentOwner;   // Current ownership / copyright holder
        uint256 timestamp;      // Consensus block timestamp (Proof of Existence)
        uint256 blockNumber;    // Ethereum block height
        bool exists;            // Existence flag
    }

    // Mapping from SHA-256 hash string to ProofRecord
    mapping(string => ProofRecord) private _proofs;

    // Total counter of registered proofs
    uint256 public totalProofs;

    // Events for Etherscan log indexing & off-chain verification
    event ProofRegistered(
        string indexed hashIndex,
        string hash,
        address indexed registrant,
        uint256 timestamp,
        uint256 blockNumber
    );

    event ProofTransferred(
        string indexed hashIndex,
        string hash,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    /**
     * @notice Registers a new image proof with immutable block timestamping.
     * @param hash SHA-256 cryptographic digest of the image.
     */
    function storeHash(string memory hash) public returns (bool) {
        require(bytes(hash).length > 0, "Invalid hash: empty string");
        require(!_proofs[hash].exists, "Hash already exists");

        _proofs[hash] = ProofRecord({
            registrant: msg.sender,
            currentOwner: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true
        });

        totalProofs += 1;

        emit ProofRegistered(hash, hash, msg.sender, block.timestamp, block.number);
        return true;
    }

    /**
     * @notice Simple boolean verification (backwards compatible).
     * @param hash SHA-256 digest to verify.
     */
    function verifyHash(string memory hash) public view returns (bool) {
        return _proofs[hash].exists;
    }

    /**
     * @notice Direct getter for legacy hashes mapping compatibility.
     * @param hash SHA-256 digest.
     */
    function hashes(string memory hash) public view returns (bool) {
        return _proofs[hash].exists;
    }

    /**
     * @notice Retrieves full on-chain provenance and timestamp details.
     * @param hash SHA-256 digest to query.
     */
    function getProof(string memory hash)
        external
        view
        returns (
            address registrant,
            address currentOwner,
            uint256 timestamp,
            uint256 blockNumber,
            bool exists
        )
    {
        ProofRecord memory record = _proofs[hash];
        require(record.exists, "Proof does not exist");
        return (
            record.registrant,
            record.currentOwner,
            record.timestamp,
            record.blockNumber,
            record.exists
        );
    }

    /**
     * @notice Transfers ownership of an image copyright proof to a new address.
     * @param hash SHA-256 digest of the image.
     * @param newOwner Address of the new owner.
     */
    function transferProof(string memory hash, address newOwner) external returns (bool) {
        require(_proofs[hash].exists, "Proof does not exist");
        require(_proofs[hash].currentOwner == msg.sender, "Only current owner can transfer proof");
        require(newOwner != address(0), "Cannot transfer to zero address");
        require(newOwner != msg.sender, "Cannot transfer to self");

        address prevOwner = _proofs[hash].currentOwner;
        _proofs[hash].currentOwner = newOwner;

        emit ProofTransferred(hash, hash, prevOwner, newOwner, block.timestamp);
        return true;
    }
}
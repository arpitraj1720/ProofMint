const { ethers } = require("ethers");

let contractArtifact;
try {
    contractArtifact = require("../contracts/ProofMint.json");
} catch {
    contractArtifact = require("../../../blockchain/artifacts/contracts/ProofMint.sol/ProofMint.json");
}

const provider = new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL
);

const wallet = new ethers.Wallet(
    process.env.BLOCKCHAIN_PRIVATE_KEY,
    provider
);

const contract = new ethers.Contract(
    process.env.PROOFMINT_CONTRACT_ADDRESS,
    contractArtifact.abi,
    wallet
);

const storeHashOnBlockchain = async (hash) => {
    const transaction = await contract.storeHash(hash);
    await transaction.wait();
    return transaction.hash;
};

const verifyHashOnBlockchain = async (hash) => {
    return await contract.verifyHash(hash);
};

const getProofOnBlockchain = async (hash) => {
    try {
        if (typeof contract.getProof === "function") {
            const proof = await contract.getProof(hash);
            return {
                registrant: proof.registrant,
                currentOwner: proof.currentOwner,
                timestamp: Number(proof.timestamp),
                blockNumber: Number(proof.blockNumber),
                exists: proof.exists,
            };
        }
        const exists = await contract.verifyHash(hash);
        return { exists };
    } catch {
        const exists = await contract.verifyHash(hash).catch(() => false);
        return { exists };
    }
};

const transferProofOnBlockchain = async (hash, newOwner) => {
    const tx = await contract.transferProof(hash, newOwner);
    await tx.wait();
    return tx.hash;
};

module.exports = {
    storeHashOnBlockchain,
    verifyHashOnBlockchain,
    getProofOnBlockchain,
    transferProofOnBlockchain,
};
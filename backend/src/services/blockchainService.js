const { ethers } = require("ethers");

const contractArtifact = require("../../../blockchain/artifacts/contracts/ProofMint.sol/ProofMint.json");

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

module.exports = {
    storeHashOnBlockchain,
    verifyHashOnBlockchain,
};
import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    const proofMint = await ethers.getContractAt(
        "ProofMint",
        "0x3E73D50b6591Dd8626eE32ebC367bBDe03E88685"
    );

    console.log("Contract:", await proofMint.getAddress());

    const testHash = "proofmint-sepolia-test-001";

    console.log("Storing hash...");
    const tx = await proofMint.storeHash(testHash);

    console.log("Transaction sent:", tx.hash);

    await tx.wait();

    console.log("Hash stored!");

    const exists = await proofMint.verifyHash(testHash);

    console.log("Does test hash exist?", exists);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    // Deploy the contract
    const proofMint = await ethers.deployContract("ProofMint");
    await proofMint.waitForDeployment();

    console.log("Contract:", await proofMint.getAddress());

    // Store a hash
    const tx = await proofMint.storeHash("abc123");

    console.log("Transaction sent:", tx.hash);

    // Wait for blockchain confirmation
    await tx.wait();

    console.log("Hash stored!");

    console.log("Trying to store the same hash again...");

    const duplicateTx = await proofMint.storeHash("abc123");

    await duplicateTx.wait();

    // Verify the hash
    const exists = await proofMint.verifyHash("abc123");

    console.log("Does abc123 exist?", exists);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
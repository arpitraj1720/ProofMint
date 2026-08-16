import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    const proofMint = await ethers.deployContract("ProofMint");

    await proofMint.waitForDeployment();

    console.log(
        "ProofMint deployed to:",
        await proofMint.getAddress()
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
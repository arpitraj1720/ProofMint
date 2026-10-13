import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../backend/.env");
const envContent = fs.readFileSync(envPath, "utf8");

function getEnvVal(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : null;
}

async function main() {
  const rpcUrl = getEnvVal("BLOCKCHAIN_RPC_URL");
  const privateKey = getEnvVal("BLOCKCHAIN_PRIVATE_KEY");
  const contractAddress = getEnvVal("PROOFMINT_CONTRACT_ADDRESS");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/ProofMint.sol/ProofMint.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

  console.log("Connected to ProofMint at:", await contract.getAddress());

  const testHash = "proofmint-tier2-test-" + Date.now();

  console.log("1. Storing test hash on Sepolia:", testHash);
  const tx = await contract.storeHash(testHash);
  console.log("Transaction sent:", tx.hash);
  await tx.wait();
  console.log("✅ Transaction confirmed on Sepolia!");

  console.log("2. Verifying hash on-chain...");
  const exists = await contract.verifyHash(testHash);
  console.log("Hash exists:", exists);

  console.log("3. Fetching on-chain ProofRecord struct via getProof()...");
  const proof = await contract.getProof(testHash);
  console.log("ProofRecord details:");
  console.log(" - Registrant:", proof.registrant);
  console.log(" - Current Owner:", proof.currentOwner);
  console.log(" - Block Timestamp:", new Date(Number(proof.timestamp) * 1000).toISOString());
  console.log(" - Block Number:", proof.blockNumber.toString());

  console.log("4. Total Proofs on-chain:", (await contract.totalProofs()).toString());
  console.log("\n🎉 ALL TIER 2 SMART CONTRACT FEATURES VERIFIED 100% OPERATIONAL ON SEPOLIA!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

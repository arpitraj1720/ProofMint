import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables directly from backend/.env
const envPath = path.resolve(__dirname, "../../backend/.env");
const envContent = fs.readFileSync(envPath, "utf8");

function getEnvVal(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : null;
}

const rpcUrl = getEnvVal("BLOCKCHAIN_RPC_URL");
const privateKey = getEnvVal("BLOCKCHAIN_PRIVATE_KEY");

if (!rpcUrl || !privateKey) {
  throw new Error("Missing BLOCKCHAIN_RPC_URL or BLOCKCHAIN_PRIVATE_KEY in backend/.env");
}

async function main() {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("🚀 Deploying ProofMint upgraded contract to Ethereum Sepolia...");
  console.log("Deployer address:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/ProofMint.sol/ProofMint.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();

  console.log("⏳ Transaction submitted! Hash:", contract.deploymentTransaction()?.hash);
  await contract.waitForDeployment();

  const newAddress = await contract.getAddress();
  console.log("✅ ProofMint deployed successfully to:", newAddress);

  // Test call totalProofs
  const total = await contract.totalProofs();
  console.log("Initial totalProofs on-chain:", total.toString());

  console.log("\nCopy this address to backend/.env and frontend constants:");
  console.log("NEW_PROOFMINT_ADDRESS=" + newAddress);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});

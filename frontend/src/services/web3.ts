import { ethers } from "ethers";

export const PROOFMINT_CONTRACT_ADDRESS = "0x55fe6BEC3C241840FF337E5CB323671Fe7265cEF";
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"; // 11155111 in hex

const PROOFMINT_ABI = [
  "function storeHash(string memory hash) public returns (bool)",
  "function verifyHash(string memory hash) public view returns (bool)",
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function isMetaMaskAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function connectMetaMask(): Promise<string> {
  if (!isMetaMaskAvailable()) {
    throw new Error("MetaMask is not installed. Please install MetaMask or use Gasless Relayer mode.");
  }

  // Request accounts
  const accounts: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please unlock MetaMask.");
  }

  // Ensure Sepolia network
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (switchError: any) {
    // Error 4902 means the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: "Ethereum Sepolia Testnet",
            nativeCurrency: {
              name: "Sepolia Ether",
              symbol: "SEP",
              decimals: 18,
            },
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
    } else if (switchError.code === 4001) {
      throw new Error("User rejected switching to Ethereum Sepolia network.");
    }
  }

  return accounts[0];
}

export async function computeFileSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function storeHashWithMetaMask(hash: string): Promise<string> {
  if (!isMetaMaskAvailable()) {
    throw new Error("MetaMask is not available in your browser.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    PROOFMINT_CONTRACT_ADDRESS,
    PROOFMINT_ABI,
    signer
  );

  const tx = await contract.storeHash(hash);
  const receipt = await tx.wait();
  return receipt.hash || tx.hash;
}

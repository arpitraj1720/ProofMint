import React, { useState, useEffect } from "react";
import { Page, RegisterStep } from "../types";
import { useAuth } from "../context/AuthContext";
import { registerImage, ApiError } from "../services/api";
import { fmtBytes } from "../utils/formatters";
import {
  CheckCircleIcon,
  XCircleIcon,
  CertificateIcon,
  WalletIcon,
  ZapIcon,
} from "../components/icons/Icons";
import { UploadDropzone } from "../components/common/UploadDropzone";
import { RegistrationProgress } from "../components/common/RegistrationProgress";
import { Toast } from "../components/common/Toast";
import { ProvenanceCertificateModal } from "../components/common/ProvenanceCertificateModal";
import {
  connectMetaMask,
  computeFileSha256,
  storeHashWithMetaMask,
  isMetaMaskAvailable,
} from "../services/web3";

export interface RegisterPageProps {
  setPage: (p: Page) => void;
}

export function RegisterPage({ setPage }: RegisterPageProps) {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<RegisterStep>("idle");
  const [registrationMode, setRegistrationMode] = useState<
    "gasless" | "self_sovereign"
  >("gasless");
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [selfSigningStep, setSelfSigningStep] = useState<string | null>(null);

  const [registeredData, setRegisteredData] = useState<{
    hash: string;
    txHash?: string;
    imageUrl?: string;
    fileName?: string;
    fileSize?: number;
    uploadedAt?: string;
    registrationMode?: "gasless" | "self_sovereign";
    signerAddress?: string;
  } | null>(null);

  const [errorState, setErrorState] = useState<{
    isDuplicate: boolean;
    message: string;
  } | null>(null);

  const [toast, setToast] = useState("");
  const [isCertOpen, setIsCertOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setPage("login");
    }
  }, [isAuthenticated, setPage]);

  // Check if MetaMask is already connected
  useEffect(() => {
    if (isMetaMaskAvailable() && window.ethereum.selectedAddress) {
      setMetaMaskAddress(window.ethereum.selectedAddress);
    }
  }, []);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep("idle");
    setErrorState(null);
    setRegisteredData(null);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStep("idle");
    setErrorState(null);
    setRegisteredData(null);
    setSelfSigningStep(null);
  };

  const handleConnectMetaMask = async () => {
    setConnectingWallet(true);
    setErrorState(null);
    try {
      const address = await connectMetaMask();
      setMetaMaskAddress(address);
      setToast(`Connected: ${address.slice(0, 6)}…${address.slice(-4)}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to connect MetaMask.";
      setErrorState({ isDuplicate: false, message: msg });
    } finally {
      setConnectingWallet(false);
    }
  };

  const handleRegister = async () => {
    if (!file) return;
    setErrorState(null);

    // MODE 1: Self-Sovereign (MetaMask)
    if (registrationMode === "self_sovereign") {
      let currentAddress = metaMaskAddress;
      if (!currentAddress) {
        try {
          currentAddress = await connectMetaMask();
          setMetaMaskAddress(currentAddress);
        } catch (err: unknown) {
          setErrorState({
            isDuplicate: false,
            message:
              err instanceof Error
                ? err.message
                : "MetaMask connection required for self-signing.",
          });
          return;
        }
      }

      setStep("uploading");
      setSelfSigningStep("Computing cryptographic SHA-256 digest in browser...");

      try {
        const hash = await computeFileSha256(file);

        setSelfSigningStep(
          "Awaiting MetaMask signature & Sepolia block confirmation..."
        );
        const clientTxHash = await storeHashWithMetaMask(hash);

        setSelfSigningStep(
          "Proof confirmed on Sepolia! Synchronizing record with ProofMint..."
        );
        const res = await registerImage(file, clientTxHash, currentAddress);

        setRegisteredData({
          hash: res.imageHash || hash,
          txHash: clientTxHash,
          imageUrl: res.image?.imageUrl || preview || "",
          fileName: res.image?.fileName || file.name,
          fileSize: res.image?.fileSize || file.size,
          uploadedAt: res.image?.uploadedAt || new Date().toISOString(),
          registrationMode: "self_sovereign",
          signerAddress: currentAddress,
        });

        setStep("done");
        setToast("Proof registered directly via your MetaMask wallet!");
      } catch (err: unknown) {
        setStep("idle");
        const msg =
          err instanceof Error
            ? err.message
            : "Self-sovereign MetaMask registration failed.";
        setErrorState({ isDuplicate: false, message: msg });
      } finally {
        setSelfSigningStep(null);
      }
    } else {
      // MODE 2: Gasless Relayer (Sponsored)
      setStep("uploading");

      const timer1 = setTimeout(() => {
        setStep((curr) => (curr === "uploading" ? "hashing" : curr));
      }, 700);

      const timer2 = setTimeout(() => {
        setStep((curr) =>
          curr === "hashing" || curr === "uploading" ? "registering" : curr
        );
      }, 1500);

      try {
        const res = await registerImage(file);

        clearTimeout(timer1);
        clearTimeout(timer2);

        setRegisteredData({
          hash: res.imageHash || res.image?.hash || "",
          txHash: res.txHash || res.image?.txHash,
          imageUrl: res.image?.imageUrl || preview || "",
          fileName: res.image?.fileName || file.name,
          fileSize: res.image?.fileSize || file.size,
          uploadedAt: res.image?.uploadedAt || new Date().toISOString(),
          registrationMode: "gasless",
        });

        setStep("done");
        setToast("Image proof registered on Ethereum Sepolia via Gasless Relayer!");
      } catch (err: unknown) {
        clearTimeout(timer1);
        clearTimeout(timer2);
        setStep("idle");

        if (err instanceof ApiError) {
          setErrorState({
            isDuplicate: err.isDuplicate,
            message: err.message,
          });
        } else {
          setErrorState({
            isDuplicate: false,
            message:
              err instanceof Error ? err.message : "Failed to register image.",
          });
        }
      }
    }
  };

  return (
    <div
      className="min-h-screen py-16 px-6"
      style={{ backgroundColor: "#24305E" }}
    >
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: "#F76C6C" }}
          >
            On-Chain Image Registration
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3">
            Register an Image Proof
          </h1>
          <p
            className="text-base max-w-lg mx-auto"
            style={{ color: "rgba(168,208,230,0.7)" }}
          >
            Upload your image to compute an immutable SHA-256 fingerprint, store it on Ethereum Sepolia, and record tamper-evident provenance.
          </p>
        </div>

        {/* Error Alert */}
        {errorState && (
          <div
            className="rounded-md p-4 mb-8 animate-fade-in-up flex items-center justify-between gap-4 shadow-xl"
            style={{
              backgroundColor: "#F76C6C",
            }}
          >
            <div className="flex items-center gap-3">
              <XCircleIcon size={22} color="#FFFFFF" />
              <div>
                <p className="text-sm font-bold text-white leading-tight">
                  {errorState.isDuplicate
                    ? "Duplicate Image Detected"
                    : "Registration Notice"}
                </p>
                <p className="text-xs text-white/95 mt-0.5 leading-relaxed font-medium">
                  {errorState.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setErrorState(null)}
              className="px-3 py-1.5 rounded-md font-bold text-xs cursor-pointer shrink-0 shadow-sm transition hover:bg-white/90"
              style={{ backgroundColor: "#FFFFFF", color: "#F76C6C" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* State 1: Success / Done */}
        {step === "done" && registeredData ? (
          <div
            className="animate-fade-in-up rounded-md overflow-hidden shadow-2xl"
            style={{
              backgroundColor: "#374785",
              border: "1px solid rgba(168,208,230,0.15)",
            }}
          >
            {registeredData.imageUrl && (
              <div
                className="aspect-video overflow-hidden relative flex items-center justify-center"
                style={{ backgroundColor: "#24305E" }}
              >
                <img
                  src={registeredData.imageUrl}
                  alt="Registered"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="p-8">
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-md flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "rgba(248,233,161,0.15)" }}
                >
                  <CheckCircleIcon size={36} color="#F8E9A1" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  Registration Complete!
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "rgba(168,208,230,0.7)" }}
                >
                  Your image fingerprint is permanently confirmed on Ethereum
                  Sepolia.
                </p>
              </div>

              {/* Details card */}
              <div
                className="rounded-md p-6 mb-8 space-y-3"
                style={{ backgroundColor: "rgba(36,48,94,0.6)" }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>Status</span>
                  <span className="font-bold text-[#F8E9A1]">
                    CONFIRMED ON SEPOLIA
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>
                    Signing Mode
                  </span>
                  <span className="font-bold text-white uppercase">
                    {registeredData.registrationMode === "self_sovereign"
                      ? "Self-Sovereign (MetaMask)"
                      : "Gasless Relayer (Sponsored)"}
                  </span>
                </div>
                {registeredData.signerAddress && (
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: "rgba(168,208,230,0.5)" }}>
                      Signer Wallet (msg.sender)
                    </span>
                    <span className="font-mono text-white text-[11px] truncate max-w-[200px]">
                      {registeredData.signerAddress}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>
                    File Name
                  </span>
                  <span className="font-mono text-white truncate max-w-[200px]">
                    {registeredData.fileName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>
                    SHA-256 Fingerprint
                  </span>
                  <span
                    className="font-mono text-white text-[11px] truncate max-w-[200px]"
                    title={registeredData.hash}
                  >
                    {registeredData.hash}
                  </span>
                </div>
                {registeredData.txHash && (
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: "rgba(168,208,230,0.5)" }}>
                      Transaction Hash
                    </span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${registeredData.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs underline font-bold"
                      style={{ color: "#F76C6C" }}
                    >
                      {registeredData.txHash.slice(0, 10)}…
                      {registeredData.txHash.slice(-6)} ↗
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsCertOpen(true)}
                  className="flex-1 py-4 rounded-md font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "white",
                  }}
                >
                  <CertificateIcon size={18} />
                  <span>View Holographic Certificate</span>
                </button>
                <button
                  onClick={() => setPage("dashboard")}
                  className="flex-1 py-4 rounded-md font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md cursor-pointer"
                  style={{ backgroundColor: "#F76C6C", color: "white" }}
                >
                  View in Dashboard
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 rounded-md font-bold text-sm transition-all hover:bg-[#2c3a70] active:scale-95 cursor-pointer text-white border shadow-sm"
                  style={{
                    backgroundColor: "#374785",
                    borderColor: "rgba(168,208,230,0.25)",
                  }}
                >
                  Register Another
                </button>
              </div>
            </div>
          </div>
        ) : step !== "idle" ? (
          /* ── In-progress State & Pipeline ── */
          <div className="space-y-6 animate-fade-in-up">
            {selfSigningStep && (
              <div
                className="rounded-md p-4 flex items-center gap-3 shadow-md"
                style={{
                  backgroundColor: "#374785",
                  borderLeft: "4px solid #F76C6C",
                }}
              >
                <span className="w-4 h-4 border-2 border-white/30 border-t-[#F76C6C] rounded-full animate-spin shrink-0" />
                <span className="text-xs font-mono font-semibold text-white leading-relaxed">
                  {selfSigningStep}
                </span>
              </div>
            )}
            <div
              className="rounded-md p-6 shadow-xl"
              style={{
                backgroundColor: "#374785",
                border: "1px solid rgba(168,208,230,0.15)",
              }}
            >
              <RegistrationProgress step={step} />
            </div>
          </div>
        ) : (
          /* ── Idle / Ready Registration View ── */
          <div className="space-y-6 animate-fade-in-up">
            {/* Dual Web3 Architecture Selector */}
            <div
              className="rounded-md p-5 border shadow-xl"
              style={{
                backgroundColor: "#374785",
                borderColor: "rgba(168,208,230,0.15)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider block text-[#F8E9A1]">
                    Web3 Architecture Mode
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Choose Signing Mode
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#A8D0E6]/80 px-2 py-0.5 rounded bg-[#24305E] border border-white/10">
                  Ethereum Sepolia
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Mode 1: Gasless Relayer */}
                <div
                  onClick={() => setRegistrationMode("gasless")}
                  className={`p-4 rounded-md border cursor-pointer transition-all flex flex-col justify-between ${
                    registrationMode === "gasless"
                      ? "border-[#F76C6C] bg-[#24305E] shadow-md"
                      : "border-white/10 bg-[#24305E]/40 hover:bg-[#24305E]/70 opacity-70"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ZapIcon size={16} className="text-[#F8E9A1]" />
                        <span className="text-xs font-bold text-white">
                          Gasless Relayer Mode
                        </span>
                      </div>
                      {registrationMode === "gasless" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#A8D0E6]/80 mb-2">
                      ProofMint sponsor wallet signs & pays testnet gas on
                      Sepolia. Zero-friction Web2 onboarding without wallet popups.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#F8E9A1] mt-1">
                    Sponsored by Protocol (Zero Gas)
                  </span>
                </div>

                {/* Mode 2: MetaMask Self-Signing */}
                <div
                  onClick={() => setRegistrationMode("self_sovereign")}
                  className={`p-4 rounded-md border cursor-pointer transition-all flex flex-col justify-between ${
                    registrationMode === "self_sovereign"
                      ? "border-[#F76C6C] bg-[#24305E] shadow-md"
                      : "border-white/10 bg-[#24305E]/40 hover:bg-[#24305E]/70 opacity-70"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <WalletIcon size={16} className="text-[#F76C6C]" />
                        <span className="text-xs font-bold text-white">
                          MetaMask Self-Signing
                        </span>
                      </div>
                      {registrationMode === "self_sovereign" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#A8D0E6]/80 mb-2">
                      Connect your MetaMask wallet to sign <code className="text-white font-mono">storeHash</code> directly as <code className="text-white font-mono">msg.sender</code> on Sepolia.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#A8D0E6] mt-1">
                    Direct EOA msg.sender (Self-Sovereign)
                  </span>
                </div>
              </div>

              {/* Self-Sovereign Wallet Status & Connect Button */}
              {registrationMode === "self_sovereign" && (
                <div
                  className="p-3.5 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  style={{
                    backgroundColor: "#24305E",
                    borderColor: "rgba(168,208,230,0.2)",
                  }}
                >
                  {metaMaskAddress ? (
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#A8D0E6]/60 block">
                          Connected Signer Wallet
                        </span>
                        <span className="font-mono text-white font-semibold">
                          {metaMaskAddress.slice(0, 8)}…
                          {metaMaskAddress.slice(-6)} (Sepolia)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-white block">
                        MetaMask Connection Required
                      </span>
                      <span className="text-[11px] text-[#A8D0E6]/70">
                        Connect wallet to authorize and sign your on-chain proof.
                      </span>
                    </div>
                  )}

                  {!metaMaskAddress ? (
                    <button
                      onClick={handleConnectMetaMask}
                      disabled={connectingWallet}
                      className="px-4 py-2 rounded-md font-bold text-xs text-white transition-all hover:opacity-90 cursor-pointer shadow-sm flex items-center justify-center gap-2 shrink-0"
                      style={{ backgroundColor: "#F76C6C" }}
                    >
                      <WalletIcon size={14} />
                      <span>
                        {connectingWallet ? "Connecting..." : "Connect MetaMask"}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectMetaMask}
                      className="text-[11px] underline font-medium text-[#A8D0E6] hover:text-white cursor-pointer"
                    >
                      Change Account
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Media Upload & Action Area */}
            {file ? (
              /* File Selected Preview */
              <div>
                <div
                  className="rounded-md overflow-hidden mb-6 shadow-xl"
                  style={{
                    backgroundColor: "#374785",
                    border: "1px solid rgba(168,208,230,0.15)",
                  }}
                >
                  <div
                    className="aspect-video overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: "#24305E" }}
                  >
                    <img
                      src={preview!}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div
                    className="p-6 flex items-center justify-between border-t"
                    style={{ borderColor: "rgba(168,208,230,0.1)" }}
                  >
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">
                        {file.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(168,208,230,0.5)" }}
                      >
                        {fmtBytes(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer text-white shadow-sm transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: "#F76C6C",
                      }}
                    >
                      Change File
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  className="w-full py-4 rounded-md font-bold text-base transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-xl flex items-center justify-center gap-2 text-white"
                  style={{
                    backgroundColor:
                      registrationMode === "self_sovereign" && !metaMaskAddress
                        ? "#374785"
                        : "#F76C6C",
                  }}
                >
                  {registrationMode === "self_sovereign" ? (
                    <>
                      <WalletIcon size={18} />
                      <span>
                        {!metaMaskAddress
                          ? "Connect MetaMask to Register"
                          : "Sign with MetaMask & Register on Sepolia"}
                      </span>
                    </>
                  ) : (
                    <>
                      <ZapIcon size={18} />
                      <span>Confirm & Register on Blockchain (Gasless)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Dropzone awaiting file */
              <div>
                <UploadDropzone
                  onFile={handleFile}
                  label="Select or drop image to create proof"
                  sub="Securely recorded on Ethereum Sepolia"
                  dark={true}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Holographic Digital Certificate Modal */}
      {registeredData && (
        <ProvenanceCertificateModal
          isOpen={isCertOpen}
          onClose={() => setIsCertOpen(false)}
          data={{
            title: "Certificate of Digital Authenticity",
            fileName: registeredData.fileName || file?.name || "Registered Asset",
            fileSize: registeredData.fileSize || file?.size,
            imageUrl: registeredData.imageUrl || preview || null,
            hash: registeredData.hash,
            txHash: registeredData.txHash || null,
            uploadedAt: registeredData.uploadedAt || new Date().toISOString(),
          }}
        />
      )}
    </div>
  );
}

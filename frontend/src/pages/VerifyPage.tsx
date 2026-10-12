import React, { useState } from "react";
import { Page, VerifyStep } from "../types";
import { verifyImage, VerifyResponse } from "../services/api";
import { formatDate, fmtBytes } from "../utils/formatters";
import { CheckCircleIcon, XCircleIcon } from "../components/icons/Icons";
import { UploadDropzone } from "../components/common/UploadDropzone";
import { CryptographicVisualizer } from "../components/common/CryptographicVisualizer";
import { ProvenanceCertificateModal } from "../components/common/ProvenanceCertificateModal";

export interface VerifyPageProps {
  setPage: (p: Page) => void;
}

export function VerifyPage({ setPage }: VerifyPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<VerifyStep>("idle");
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep("idle");
    setVerifyResult(null);
    setErrorMsg(null);
  };

  const handleVerify = async () => {
    if (!file) return;
    setErrorMsg(null);
    setStep("checking");

    const startTime = Date.now();

    try {
      const res = await verifyImage(file);
      const elapsed = Date.now() - startTime;
      const minDisplayTime = 1600;
      const delay = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setVerifyResult(res);
        setStep("done");
      }, delay);
    } catch (err: unknown) {
      setStep("idle");
      const msg = err instanceof Error ? err.message : "Failed to verify image.";
      setErrorMsg(msg);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStep("idle");
    setVerifyResult(null);
    setErrorMsg(null);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="min-h-screen py-16 px-6" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: "#A8D0E6" }}
          >
            Public Image Verification
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3">
            Verify an Image
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(168,208,230,0.7)" }}>
            Upload any image to verify whether a cryptographic proof exists on Ethereum Sepolia. No account or login required.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            className="rounded-md p-4 mb-8 flex items-center justify-between animate-fade-in-up"
            style={{ backgroundColor: "rgba(247,108,108,0.15)", border: "1px solid rgba(247,108,108,0.3)" }}
          >
            <div className="flex items-center gap-3">
              <XCircleIcon size={20} />
              <span className="text-sm text-white font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-bold underline cursor-pointer"
              style={{ color: "#F76C6C" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* State 1: Verification Result */}
        {step === "done" && verifyResult ? (
          <div
            className="animate-fade-in-up rounded-md overflow-hidden shadow-2xl"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
          >
            {preview && (
              <div
                className="aspect-video overflow-hidden relative flex items-center justify-center"
                style={{ backgroundColor: "#24305E" }}
              >
                <img
                  src={preview}
                  alt="Verification Target"
                  className={`w-full h-full object-contain ${!verifyResult.authentic ? "opacity-40" : ""}`}
                />
              </div>
            )}

            <div className="p-8">
              {verifyResult.authentic ? (
                /* ── Verified State ── */
                <div>
                  <div className="text-center mb-8">
                    <div
                      className="w-16 h-16 rounded-md flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: "rgba(248,233,161,0.15)" }}
                    >
                      <CheckCircleIcon size={36} color="#F8E9A1" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">
                      {verifyResult.title || "✓ Verified"}
                    </h2>
                    <p className="text-base font-medium" style={{ color: "#A8D0E6" }}>
                      {verifyResult.message || "This image matches a registered ProofMint proof."}
                    </p>
                  </div>

                  {/* Public Proof Info Card (Strictly without user email) */}
                  <div
                    className="rounded-md p-6 mb-8 space-y-4"
                    style={{ backgroundColor: "rgba(36,48,94,0.6)", border: "1px solid rgba(168,208,230,0.1)" }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "rgba(168,208,230,0.6)" }}>Status</span>
                      <span
                        className="font-bold text-xs"
                        style={{ color: "#F8E9A1" }}
                      >
                        AUTHENTIC & CONFIRMED
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "rgba(168,208,230,0.6)" }}>Blockchain Network</span>
                      <span className="font-mono text-white text-xs">Ethereum Sepolia Testnet</span>
                    </div>

                    {verifyResult.proofDetails?.uploadedAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: "rgba(168,208,230,0.6)" }}>Registration Date</span>
                        <span className="font-mono text-white text-xs">
                          {formatDate(verifyResult.proofDetails.uploadedAt)}
                        </span>
                      </div>
                    )}

                    {verifyResult.proofDetails?.txHash && (
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: "rgba(168,208,230,0.6)" }}>Transaction Hash</span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${verifyResult.proofDetails.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs underline hover:opacity-80 flex items-center gap-1"
                          style={{ color: "#F76C6C" }}
                        >
                          {verifyResult.proofDetails.txHash.slice(0, 10)}…{verifyResult.proofDetails.txHash.slice(-6)} ↗
                        </a>
                      </div>
                    )}

                    {verifyResult.imageHash && (
                      <div className="pt-2 border-t" style={{ borderColor: "rgba(168,208,230,0.1)" }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-xs uppercase font-bold tracking-wider"
                            style={{ color: "rgba(168,208,230,0.6)" }}
                          >
                            SHA-256 Fingerprint
                          </span>
                          <button
                            onClick={() => copyHash(verifyResult.imageHash!)}
                            className="text-xs flex items-center gap-1 px-2 py-0.5 rounded transition-colors hover:bg-white/10 cursor-pointer"
                            style={{ color: copiedHash ? "#F8E9A1" : "#A8D0E6" }}
                          >
                            {copiedHash ? "Copied!" : "Copy Hash"}
                          </button>
                        </div>
                        <p
                          className="font-mono text-xs text-white break-all p-2.5 rounded"
                          style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                        >
                          {verifyResult.imageHash}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setIsCertOpen(true)}
                      className="flex-1 py-4 rounded-md font-bold text-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        color: "white",
                      }}
                    >
                      <span>📜</span>
                      <span>View Holographic Certificate</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-4 rounded-md font-bold text-sm transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
                      style={{
                        backgroundColor: "rgba(168,208,230,0.1)",
                        color: "#A8D0E6",
                        border: "1px solid rgba(168,208,230,0.2)",
                      }}
                    >
                      Verify Another Image
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Not Registered State ── */
                <div>
                  <div className="text-center mb-8">
                    <div
                      className="w-16 h-16 rounded-md flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: "rgba(247,108,108,0.15)" }}
                    >
                      <XCircleIcon size={36} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">
                      {verifyResult.title || "No Matching Proof Found"}
                    </h2>
                    <p className="text-base" style={{ color: "rgba(168,208,230,0.8)" }}>
                      {verifyResult.message || "No ProofMint registration matching this image was found."}
                    </p>
                  </div>

                  {/* Informational Clarification Banner */}
                  <div
                    className="rounded-md p-5 mb-6 text-sm"
                    style={{ backgroundColor: "rgba(36,48,94,0.6)", border: "1px solid rgba(168,208,230,0.15)" }}
                  >
                    <p className="font-medium mb-3" style={{ color: "#F8E9A1" }}>
                      ℹ️ About this verification result
                    </p>
                    <p className="leading-relaxed" style={{ color: "rgba(168,208,230,0.7)" }}>
                      A failed match means that ProofMint has no matching registered proof on the blockchain; it does not automatically prove that the image is fake or unauthentic.
                    </p>
                  </div>

                  {verifyResult.imageHash && (
                    <div className="rounded-md p-4 mb-8" style={{ backgroundColor: "rgba(36,48,94,0.6)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs uppercase font-bold tracking-wider"
                          style={{ color: "rgba(168,208,230,0.5)" }}
                        >
                          Calculated Image SHA-256 Hash
                        </span>
                        <button
                          onClick={() => copyHash(verifyResult.imageHash!)}
                          className="text-xs flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer"
                          style={{ color: copiedHash ? "#F8E9A1" : "#A8D0E6" }}
                        >
                          {copiedHash ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="font-mono text-xs text-white break-all">{verifyResult.imageHash}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setPage("register")}
                      className="flex-1 py-4 rounded-md font-bold text-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                      style={{ backgroundColor: "#F76C6C", color: "white" }}
                    >
                      Register This Image
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-4 rounded-md font-bold text-sm transition-all hover:bg-white/10 cursor-pointer"
                      style={{
                        backgroundColor: "rgba(168,208,230,0.1)",
                        color: "#A8D0E6",
                        border: "1px solid rgba(168,208,230,0.2)",
                      }}
                    >
                      Try Another Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : step === "checking" ? (
          /* ── Checking State (Cryptographic Visualizer) ── */
          <CryptographicVisualizer
            file={file}
            mode="verify"
            statusText="Querying Ethereum Sepolia smart contract (0x3E73...8685)"
          />
        ) : file ? (
          /* ── File Selected / Ready to Verify ── */
          <div className="animate-fade-in-up">
            <div
              className="rounded-md overflow-hidden mb-6 shadow-xl"
              style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
            >
              <div
                className="aspect-video overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: "#24305E" }}
              >
                <img src={preview!} alt="Preview" className="w-full h-full object-contain" />
              </div>
              <div
                className="p-6 flex items-center justify-between border-t"
                style={{ borderColor: "rgba(168,208,230,0.1)" }}
              >
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{file.name}</p>
                  <p className="text-xs" style={{ color: "rgba(168,208,230,0.5)" }}>
                    {fmtBytes(file.size)}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
                  style={{ color: "rgba(247,108,108,0.9)", backgroundColor: "rgba(247,108,108,0.1)" }}
                >
                  Change Image
                </button>
              </div>
            </div>

            <button
              onClick={handleVerify}
              className="w-full py-4 rounded-md font-bold text-base transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-xl"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              Verify On-Chain Now
            </button>
          </div>
        ) : (
          /* ── Initial Upload Dropzone ── */
          <div className="animate-fade-in-up">
            <UploadDropzone
              onFile={handleFile}
              label="Drag & drop image to verify authenticity"
              sub="or click to browse from device"
              dark={true}
            />
          </div>
        )}
      </div>

      {/* Holographic Digital Certificate Modal */}
      {verifyResult?.authentic && (
        <ProvenanceCertificateModal
          isOpen={isCertOpen}
          onClose={() => setIsCertOpen(false)}
          data={{
            title: verifyResult.title || "Certificate of Digital Authenticity",
            fileName: file?.name || verifyResult.proofDetails?.fileName || "Verified Asset",
            fileSize: file?.size || verifyResult.proofDetails?.fileSize,
            imageUrl: preview || verifyResult.proofDetails?.imageUrl || null,
            hash: verifyResult.imageHash || "",
            txHash: verifyResult.proofDetails?.txHash || null,
            uploadedAt: verifyResult.proofDetails?.uploadedAt || null,
          }}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Page, RegisterStep } from "../types";
import { useAuth } from "../context/AuthContext";
import { registerImage, ApiError } from "../services/api";
import { fmtBytes } from "../utils/formatters";
import { CheckCircleIcon, XCircleIcon } from "../components/icons/Icons";
import { UploadDropzone } from "../components/common/UploadDropzone";
import { RegistrationProgress } from "../components/common/RegistrationProgress";
import { Toast } from "../components/common/Toast";
import { CryptographicVisualizer } from "../components/common/CryptographicVisualizer";
import { ProvenanceCertificateModal } from "../components/common/ProvenanceCertificateModal";

export interface RegisterPageProps {
  setPage: (p: Page) => void;
}

export function RegisterPage({ setPage }: RegisterPageProps) {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<RegisterStep>("idle");
  const [registeredData, setRegisteredData] = useState<{
    hash: string;
    txHash?: string;
    imageUrl?: string;
    fileName?: string;
    fileSize?: number;
    uploadedAt?: string;
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
  };

  const handleRegister = async () => {
    if (!file) return;
    setErrorState(null);
    setStep("uploading");

    const timer1 = setTimeout(() => {
      setStep((curr) => (curr === "uploading" ? "hashing" : curr));
    }, 700);

    const timer2 = setTimeout(() => {
      setStep((curr) => (curr === "hashing" || curr === "uploading" ? "registering" : curr));
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
      });

      setStep("done");
      setToast("Image proof registered on Ethereum Sepolia!");
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
          message: err instanceof Error ? err.message : "Failed to register image.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen py-16 px-6" style={{ backgroundColor: "#24305E" }}>
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
            style={{ backgroundColor: "rgba(247,108,108,0.15)", color: "#F76C6C" }}
          >
            On-Chain Image Registration
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3">
            Register an Image Proof
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(168,208,230,0.7)" }}>
            Upload your image to compute a SHA-256 fingerprint, store it on Ethereum Sepolia, and record proof ownership to your account.
          </p>
        </div>

        {/* Error Alert */}
        {errorState && (
          <div
            className="rounded-2xl p-5 mb-8 animate-fade-in-up flex items-start justify-between gap-4"
            style={{ backgroundColor: "rgba(247,108,108,0.15)", border: "1px solid rgba(247,108,108,0.3)" }}
          >
            <div className="flex items-start gap-3">
              <XCircleIcon size={22} />
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  {errorState.isDuplicate ? "Duplicate Image Detected" : "Registration Error"}
                </p>
                <p className="text-xs" style={{ color: "rgba(168,208,230,0.8)" }}>
                  {errorState.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setErrorState(null)}
              className="text-xs font-bold underline cursor-pointer"
              style={{ color: "#F76C6C" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* State 1: Success / Done */}
        {step === "done" && registeredData ? (
          <div
            className="animate-fade-in-up rounded-3xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
          >
            {registeredData.imageUrl && (
              <div
                className="aspect-video overflow-hidden relative flex items-center justify-center"
                style={{ backgroundColor: "#24305E" }}
              >
                <img src={registeredData.imageUrl} alt="Registered" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="p-8">
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "rgba(248,233,161,0.15)" }}
                >
                  <CheckCircleIcon size={36} color="#F8E9A1" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-2">Registration Complete!</h2>
                <p className="text-sm" style={{ color: "rgba(168,208,230,0.7)" }}>
                  Your image fingerprint is permanently confirmed on Ethereum Sepolia and saved under your account.
                </p>
              </div>

              {/* Details card */}
              <div
                className="rounded-2xl p-6 mb-8 space-y-3"
                style={{ backgroundColor: "rgba(36,48,94,0.6)" }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>Status</span>
                  <span className="font-bold text-[#F8E9A1]">CONFIRMED ON SEPOLIA</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>File Name</span>
                  <span className="font-mono text-white truncate max-w-[200px]">
                    {registeredData.fileName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>SHA-256 Fingerprint</span>
                  <span
                    className="font-mono text-white text-[11px] truncate max-w-[200px]"
                    title={registeredData.hash}
                  >
                    {registeredData.hash}
                  </span>
                </div>
                {registeredData.txHash && (
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: "rgba(168,208,230,0.5)" }}>Transaction Hash</span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${registeredData.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs underline"
                      style={{ color: "#F76C6C" }}
                    >
                      {registeredData.txHash.slice(0, 10)}…{registeredData.txHash.slice(-6)} ↗
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsCertOpen(true)}
                  className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "white",
                  }}
                >
                  
                  <span>View Holographic Certificate</span>
                </button>
                <button
                  onClick={() => setPage("dashboard")}
                  className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md cursor-pointer"
                  style={{ backgroundColor: "#F76C6C", color: "white" }}
                >
                  View in Dashboard
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:bg-white/10 cursor-pointer"
                  style={{
                    backgroundColor: "rgba(168,208,230,0.1)",
                    color: "#A8D0E6",
                    border: "1px solid rgba(168,208,230,0.2)",
                  }}
                >
                  Register Another
                </button>
              </div>
            </div>
          </div>
        ) : step !== "idle" ? (
          /* ── In-progress Cryptographic Visualizer & Ledger Pipeline ── */
          <div className="space-y-6">
            <CryptographicVisualizer
              file={file}
              mode="register"
              statusText="Executing smart contract storeHash() on Ethereum Sepolia"
            />
            <div
              className="rounded-2xl p-6 border text-center shadow-xl"
              style={{ backgroundColor: "#374785", borderColor: "rgba(168,208,230,0.15)" }}
            >
              <div className="max-w-md mx-auto">
                <RegistrationProgress step={step} />
              </div>
            </div>
          </div>
        ) : file ? (
          /* ── File Ready to Register ── */
          <div className="animate-fade-in-up">
            <div
              className="rounded-3xl overflow-hidden mb-6 shadow-xl"
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
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  style={{ color: "rgba(247,108,108,0.9)", backgroundColor: "rgba(247,108,108,0.1)" }}
                >
                  Change File
                </button>
              </div>
            </div>

            <button
              onClick={handleRegister}
              className="w-full py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-xl"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              Confirm & Register on Blockchain
            </button>
          </div>
        ) : (
          /* ── Initial Dropzone ── */
          <div className="animate-fade-in-up">
            <UploadDropzone
              onFile={handleFile}
              label="Select or drop image to create proof"
              sub="Securely recorded on Ethereum Sepolia"
              dark={true}
            />
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

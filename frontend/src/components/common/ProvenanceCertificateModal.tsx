import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { formatDate, fmtBytes } from "../../utils/formatters";
import { ProofMintLogo } from "../ProofMintLogo";
import { DownloadIcon, PrinterIcon, LinkIcon, ImageIcon, CheckCircleIcon } from "../icons/Icons";
import { downloadAsset } from "../../utils/download";

export interface CertificateData {
  title?: string;
  fileName?: string;
  fileSize?: number;
  imageUrl?: string | null;
  hash: string;
  txHash?: string | null;
  uploadedAt?: string | null;
}

export interface ProvenanceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertificateData;
}

const CONTRACT_ADDRESS = "0x55fe6BEC3C241840FF337E5CB323671Fe7265cEF";

export function ProvenanceCertificateModal({
  isOpen,
  onClose,
  data,
}: ProvenanceCertificateModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const etherscanUrl = data.txHash
    ? `https://sepolia.etherscan.io/tx/${data.txHash}`
    : `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`;

  // Generate QR code pointing to Sepolia Etherscan
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(etherscanUrl, {
      margin: 1,
      width: 240,
      color: {
        dark: "#161d3b",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [isOpen, etherscanUrl]);

  if (!isOpen) return null;

  const handleDownloadOriginal = async () => {
    if (!data.imageUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadAsset(data.imageUrl, data.fileName || `proofmint-${data.hash.slice(0, 8)}.png`);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(etherscanUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(data.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md overflow-y-auto animate-fade-in-up"
      style={{ backgroundColor: "rgba(8, 11, 20, 0.88)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-md overflow-hidden shadow-2xl relative my-8"
        style={{
          background: "linear-gradient(135deg, rgba(0, 242, 254, 0.3) 0%, rgba(247, 108, 108, 0.3) 50%, rgba(16, 185, 129, 0.3) 100%)",
          padding: "2px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={certificateRef}
          id="proofmint-certificate"
          className="rounded-md p-6 sm:p-10 relative overflow-hidden"
          style={{ backgroundColor: "#1e2952", color: "#ffffff" }}
        >
          {/* Subtle Background Watermark Hologram */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center select-none"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, #A8D0E6 10%, transparent 60%)",
            }}
          >
            <span className="text-9xl font-black tracking-widest text-white">PROOFMINT</span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded hover:bg-white/10 text-[#A8D0E6] cursor-pointer z-20 text-lg font-bold"
          >
            ×
          </button>

          {/* Certificate Header */}
          <div className="text-center mb-8 relative z-10 border-b pb-6" style={{ borderColor: "rgba(168,208,230,0.15)" }}>
            <div className="flex justify-center mb-3">
              <ProofMintLogo size={36} showWordmark={true} />
            </div>

            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest uppercase mb-2" style={{ color: "#10B981" }}>
              <span>●</span>
              <span>Official Certificate of Digital Provenance</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
              Certificate of Authenticity
            </h2>
            <p className="text-xs font-mono" style={{ color: "rgba(168,208,230,0.7)" }}>
              Ethereum Sepolia Testnet · Immutable Cryptographic Fingerprint
            </p>
          </div>

          {/* Core Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
            {/* Image Preview with Holographic Stamp */}
            <div className="md:col-span-1 flex flex-col items-center">
              <div
                className="w-full aspect-square rounded-md overflow-hidden relative border shadow-lg flex items-center justify-center"
                style={{
                  backgroundColor: "#161d3b",
                  borderColor: "rgba(168,208,230,0.2)",
                }}
              >
                {data.imageUrl ? (
                  <img
                    src={data.imageUrl}
                    alt={data.fileName || "Registered Media"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={36} className="text-[#A8D0E6] mx-auto mb-2 opacity-80" />
                    <span className="text-[11px] font-mono opacity-60">Verified Asset</span>
                  </div>
                )}

                {/* Holographic Seal Stamp */}
                <div
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.9)",
                    color: "#ffffff",
                  }}
                >
                  <CheckCircleIcon size={11} color="#ffffff" />
                  <span>VERIFIED</span>
                </div>
              </div>

              <div className="text-center mt-3 w-full">
                <p className="text-xs font-bold truncate text-white" title={data.fileName}>
                  {data.fileName || "Digital Asset"}
                </p>
                <p className="text-[10px] font-mono" style={{ color: "rgba(168,208,230,0.6)" }}>
                  {data.fileSize ? fmtBytes(data.fileSize) : "Original Resolution"}
                </p>
              </div>
            </div>

            {/* Cryptographic Ledger Details */}
            <div className="md:col-span-2 flex flex-col justify-between space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-md" style={{ backgroundColor: "rgba(22, 29, 59, 0.7)", border: "1px solid rgba(168,208,230,0.12)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-sky-300/60">
                    Deterministic SHA-256 Digest
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    {copiedHash ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-emerald-400 break-all text-[11px] leading-relaxed select-all" title={data.hash}>
                  {data.hash}
                </p>
              </div>

              <div className="p-3.5 rounded-md" style={{ backgroundColor: "rgba(22, 29, 59, 0.7)", border: "1px solid rgba(168,208,230,0.12)" }}>
                <span className="text-[10px] uppercase font-bold text-sky-300/60 block mb-1">
                  Sepolia Transaction Hash
                </span>
                {data.txHash ? (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${data.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#F76C6C] font-bold break-all text-[11px] hover:underline"
                  >
                    {data.txHash} ↗
                  </a>
                ) : (
                  <span className="text-white/40">Verified on ProofMint smart contract</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded-md" style={{ backgroundColor: "rgba(22, 29, 59, 0.7)" }}>
                  <span className="text-[9px] uppercase text-sky-300/50 block">Registration Date</span>
                  <span className="font-semibold text-white">
                    {formatDate(data.uploadedAt || new Date().toISOString())}
                  </span>
                </div>
                <div className="p-2.5 rounded-md" style={{ backgroundColor: "rgba(22, 29, 59, 0.7)" }}>
                  <span className="text-[9px] uppercase text-sky-300/50 block">Smart Contract</span>
                  <span className="font-semibold text-white">
                    {CONTRACT_ADDRESS.slice(0, 6)}…{CONTRACT_ADDRESS.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Verification Strip */}
          <div
            className="p-4 rounded-md flex flex-col sm:flex-row items-center gap-4 mb-6 relative z-10 border"
            style={{
              backgroundColor: "rgba(22, 29, 59, 0.9)",
              borderColor: "rgba(168,208,230,0.15)",
            }}
          >
            {qrCodeUrl && (
              <div className="p-1.5 rounded-md bg-white shadow-md flex-shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="Sepolia Etherscan QR Verification"
                  className="w-20 h-20 sm:w-24 sm:h-24"
                />
              </div>
            )}

            <div className="text-center sm:text-left flex-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981] block mb-1">
                Instant Mobile Verification
              </span>
              <p className="text-xs text-white/90 leading-relaxed font-sans mb-1">
                Scan with any smartphone camera to open and inspect this immutable transaction directly on Ethereum Sepolia Etherscan.
              </p>
              <a
                href={etherscanUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-[#F76C6C] hover:underline font-bold"
              >
                Inspect Ledger Record ↗
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
            {data.imageUrl && (
              <button
                onClick={handleDownloadOriginal}
                disabled={downloading}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-md font-bold text-xs sm:text-sm transition-all hover:bg-emerald-500/20 active:scale-95 cursor-pointer border flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  borderColor: "rgba(16, 185, 129, 0.35)",
                  color: "#10B981",
                }}
              >
                <DownloadIcon size={15} />
                <span>{downloading ? "Downloading..." : "Download Original Media"}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-md font-bold text-xs sm:text-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              <PrinterIcon size={16} />
              <span>Print Certificate</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-md font-bold text-xs sm:text-sm transition-all hover:bg-[#1E284F] active:scale-95 cursor-pointer border flex items-center justify-center gap-2 shadow-sm text-white"
              style={{
                backgroundColor: "#24305E",
                borderColor: "rgba(168,208,230,0.3)",
              }}
            >
              {copiedLink ? <CheckCircleIcon size={16} color="#10B981" /> : <LinkIcon size={16} />}
              <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

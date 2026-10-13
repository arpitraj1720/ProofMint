import React, { useState } from "react";
import { ImageRecord } from "../../services/api";
import { formatDate, fmtBytes } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";
import { CopyIcon, DownloadIcon, CertificateIcon, TransferIcon, CheckCircleIcon } from "../icons/Icons";
import { ProvenanceCertificateModal } from "../common/ProvenanceCertificateModal";
import { TransferOwnershipModal } from "../common/TransferOwnershipModal";
import { downloadAsset } from "../../utils/download";

export interface ImageCardProps {
  image: ImageRecord;
  onImageUpdated?: (updated: ImageRecord) => void;
}

export function ImageCard({ image, onImageUpdated }: ImageCardProps) {
  const [currentImage, setCurrentImage] = useState<ImageRecord>(image);
  const shortHash = currentImage.hash ? `${currentImage.hash.slice(0, 8)}…${currentImage.hash.slice(-6)}` : "";
  const shortTx = currentImage.txHash ? `${currentImage.txHash.slice(0, 8)}…${currentImage.txHash.slice(-6)}` : "";
  const dateStr = formatDate(currentImage.uploadedAt);
  const [copied, setCopied] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  React.useEffect(() => {
    setCurrentImage(image);
  }, [image]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage.imageUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadAsset(currentImage.imageUrl, currentImage.fileName || `proofmint-${currentImage.hash.slice(0, 8)}.png`);
    } finally {
      setDownloading(false);
    }
  };

  const copyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentImage.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        className="rounded-md overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group flex flex-col"
        style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.12)" }}
      >
        <div className="aspect-video overflow-hidden relative" style={{ backgroundColor: "#24305E" }}>
          <img
            src={currentImage.imageUrl}
            alt={currentImage.fileName || "Registered Image"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {currentImage.txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${currentImage.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md transition-opacity hover:opacity-100"
              style={{
                backgroundColor: "rgba(36,48,94,0.9)",
                color: "#F76C6C",
                border: "1px solid rgba(247,108,108,0.3)",
              }}
              title="View transaction on Sepolia Etherscan"
            >
              Sepolia ↗
            </a>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-white truncate mb-1" title={currentImage.fileName}>
              {currentImage.fileName || "Registered Image"}
            </p>
            <p className="text-xs mb-3" style={{ color: "rgba(168,208,230,0.55)" }}>
              {dateStr} {currentImage.fileSize ? `· ${fmtBytes(currentImage.fileSize)}` : ""}
            </p>

            {/* Transferred Indicator */}
            {currentImage.transferredTo && (
              <div
                className="rounded-md p-2.5 mb-3 flex items-center justify-between text-xs"
                style={{
                  backgroundColor: "rgba(248,233,161,0.08)",
                  border: "1px solid rgba(248,233,161,0.25)",
                  color: "#F8E9A1",
                }}
              >
                <div className="truncate">
                  <span className="font-bold">Transferred: </span>
                  <span className="font-mono text-[11px]">
                    {currentImage.transferredTo.slice(0, 6)}…{currentImage.transferredTo.slice(-4)}
                  </span>
                </div>
                {currentImage.transferTxHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${currentImage.transferTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-mono text-[10px] ml-2 shrink-0 font-bold"
                    style={{ color: "#F76C6C" }}
                    title="View transfer on Sepolia"
                  >
                    Tx ↗
                  </a>
                )}
              </div>
            )}

            <div
              className="rounded-md p-2.5 mb-4 flex items-center justify-between"
              style={{ backgroundColor: "rgba(36,48,94,0.5)" }}
            >
              <div className="min-w-0 pr-2">
                <span
                  className="text-[10px] uppercase font-bold tracking-wider block"
                  style={{ color: "rgba(168,208,230,0.5)" }}
                >
                  Fingerprint
                </span>
                <span className="text-xs font-mono text-white block truncate" title={currentImage.hash}>
                  {shortHash}
                </span>
              </div>
              <button
                onClick={copyHash}
                className="p-1.5 rounded text-xs transition-colors hover:bg-white/10"
                style={{ color: copied ? "#F8E9A1" : "#A8D0E6" }}
                title="Copy full hash"
              >
                {copied ? <CheckCircleIcon size={14} color="#F8E9A1" /> : <CopyIcon />}
              </button>
            </div>
          </div>

          <div
            className="pt-3 border-t flex flex-col gap-3"
            style={{ borderColor: "rgba(168,208,230,0.15)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <StatusBadge status="registered" />
                {currentImage.registrationMode === "self_sovereign" && (
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-[#F76C6C] text-white shadow-sm"
                    title={`Self-signed via MetaMask: ${currentImage.signerAddress || ""}`}
                  >
                    MetaMask
                  </span>
                )}
              </div>
              {currentImage.txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${currentImage.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono font-bold underline px-1.5 py-0.5 rounded transition-opacity hover:opacity-80"
                  style={{ color: "#F76C6C" }}
                  title="View on Sepolia"
                >
                  {shortTx} ↗
                </a>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setIsCertOpen(true)}
                className="py-2 px-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95 shadow-sm cursor-pointer text-white"
                style={{
                  backgroundColor: "#10B981",
                }}
                title="View tamper-evident Certificate of Authenticity"
              >
                <CertificateIcon size={13} />
                <span>Cert</span>
              </button>

              <button
                onClick={() => setIsTransferOpen(true)}
                className="py-2 px-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95 shadow-sm cursor-pointer text-white"
                style={{
                  backgroundColor: "#F76C6C",
                }}
                title="Transfer on-chain ownership of this image proof"
              >
                <TransferIcon size={13} />
                <span>Transfer</span>
              </button>

              {currentImage.imageUrl && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="py-2 px-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:bg-[#1E284F] active:scale-95 shadow-sm cursor-pointer text-white border"
                  style={{
                    backgroundColor: "#24305E",
                    borderColor: "rgba(168, 208, 230, 0.25)",
                  }}
                  title="Download original image file"
                >
                  <DownloadIcon size={13} />
                  <span>{downloading ? "..." : "Save"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Holographic Digital Certificate Modal */}
      <ProvenanceCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        data={{
          title: "Certificate of Digital Authenticity",
          fileName: currentImage.fileName || "Registered Media",
          fileSize: currentImage.fileSize,
          imageUrl: currentImage.imageUrl,
          hash: currentImage.hash,
          txHash: currentImage.txHash,
          uploadedAt: currentImage.uploadedAt,
        }}
      />

      {/* On-Chain Ownership Transfer Modal */}
      <TransferOwnershipModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        image={currentImage}
        onSuccess={(updated) => {
          setCurrentImage(updated);
          onImageUpdated?.(updated);
        }}
      />
    </>
  );
}

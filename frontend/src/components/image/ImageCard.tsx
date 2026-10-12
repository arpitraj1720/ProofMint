import React, { useState } from "react";
import { ImageRecord } from "../../services/api";
import { formatDate, fmtBytes } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";
import { CopyIcon, DownloadIcon } from "../icons/Icons";
import { ProvenanceCertificateModal } from "../common/ProvenanceCertificateModal";
import { downloadAsset } from "../../utils/download";

export interface ImageCardProps {
  image: ImageRecord;
}

export function ImageCard({ image }: ImageCardProps) {
  const shortHash = image.hash ? `${image.hash.slice(0, 8)}…${image.hash.slice(-6)}` : "";
  const shortTx = image.txHash ? `${image.txHash.slice(0, 8)}…${image.txHash.slice(-6)}` : "";
  const dateStr = formatDate(image.uploadedAt);
  const [copied, setCopied] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image.imageUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadAsset(image.imageUrl, image.fileName || `proofmint-${image.hash.slice(0, 8)}.png`);
    } finally {
      setDownloading(false);
    }
  };

  const copyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image.hash);
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
            src={image.imageUrl}
            alt={image.fileName || "Registered Image"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {image.txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${image.txHash}`}
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
            <p className="text-sm font-semibold text-white truncate mb-1" title={image.fileName}>
              {image.fileName || "Registered Image"}
            </p>
            <p className="text-xs mb-3" style={{ color: "rgba(168,208,230,0.55)" }}>
              {dateStr} {image.fileSize ? `· ${fmtBytes(image.fileSize)}` : ""}
            </p>

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
                <span className="text-xs font-mono text-white block truncate" title={image.hash}>
                  {shortHash}
                </span>
              </div>
              <button
                onClick={copyHash}
                className="p-1.5 rounded text-xs transition-colors hover:bg-white/10"
                style={{ color: copied ? "#F8E9A1" : "#A8D0E6" }}
                title="Copy full hash"
              >
                {copied ? "✓" : <CopyIcon />}
              </button>
            </div>
          </div>

          <div
            className="flex items-center justify-between pt-3 border-t gap-2"
            style={{ borderColor: "rgba(168,208,230,0.1)" }}
          >
            <StatusBadge status="registered" />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCertOpen(true)}
                className="px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all hover:bg-emerald-500/20 active:scale-95 cursor-pointer"
                style={{
                  color: "#10B981",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
                title="View tamper-evident Certificate of Authenticity"
              >
                <span>📜</span>
                <span>Certificate</span>
              </button>

              {image.imageUrl && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all hover:bg-sky-400/20 active:scale-95 cursor-pointer"
                  style={{
                    color: "#A8D0E6",
                    backgroundColor: "rgba(168, 208, 230, 0.1)",
                    border: "1px solid rgba(168, 208, 230, 0.25)",
                  }}
                  title="Download original image file"
                >
                  <DownloadIcon size={12} />
                  <span>{downloading ? "..." : "Save"}</span>
                </button>
              )}

              {image.txHash ? (
                <a
                  href={`https://sepolia.etherscan.io/tx/${image.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono font-bold underline px-2 py-1 rounded"
                  style={{ color: "#F76C6C" }}
                  title="View on Sepolia"
                >
                  {shortTx} ↗
                </a>
              ) : null}
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
          fileName: image.fileName || "Registered Media",
          fileSize: image.fileSize,
          imageUrl: image.imageUrl,
          hash: image.hash,
          txHash: image.txHash,
          uploadedAt: image.uploadedAt,
        }}
      />
    </>
  );
}

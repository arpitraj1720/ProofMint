import React, { useState } from "react";
import { ImageRecord, transferImage } from "../../services/api";
import { TransferIcon, XCircleIcon } from "../icons/Icons";

export interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageRecord | null;
  onSuccess: (updatedImage: ImageRecord) => void;
}

export function TransferOwnershipModal({
  isOpen,
  onClose,
  image,
  onSuccess,
}: TransferOwnershipModalProps) {
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!isOpen || !image) return null;

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(recipient.trim());

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image._id) {
      setError("Image record is missing an identifier.");
      return;
    }
    if (!isValidAddress) {
      setError("Please enter a valid 42-character Ethereum address (e.g. 0x...).");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await transferImage(image._id, recipient.trim());
      setTxHash(res.transferTxHash);
      onSuccess(res.image);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to transfer ownership on Ethereum blockchain.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setRecipient("");
    setError(null);
    setTxHash(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-md p-6 relative overflow-hidden shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto"
        style={{
          backgroundColor: "#24305E",
          border: "1px solid rgba(168,208,230,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm"
              style={{ backgroundColor: "#F76C6C" }}
            >
              <TransferIcon size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Transfer On-Chain Ownership
              </h2>
              <p className="text-xs" style={{ color: "rgba(168,208,230,0.65)" }}>
                Reassign this individual image proof on Ethereum Sepolia
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white/60 hover:text-white p-1 rounded transition-colors text-lg disabled:opacity-30 cursor-pointer"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Success View */}
        {txHash ? (
          <div className="text-center py-4 flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-md flex items-center justify-center mb-4"
              style={{
                backgroundColor: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                color: "#10B981",
              }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Ownership Transferred!
            </h3>
            <p
              className="text-xs max-w-sm mb-5"
              style={{ color: "rgba(168,208,230,0.75)" }}
            >
              The smart contract has recorded the ownership transfer for this
              image proof to the designated Ethereum wallet.
            </p>

            {/* Recipient summary */}
            <div
              className="w-full rounded-md p-3 mb-4 text-left"
              style={{
                backgroundColor: "rgba(55,71,133,0.45)",
                border: "1px solid rgba(168,208,230,0.15)",
              }}
            >
              <span
                className="text-[10px] uppercase font-bold tracking-wider block mb-1"
                style={{ color: "rgba(168,208,230,0.6)" }}
              >
                New Owner Address
              </span>
              <span className="text-xs font-mono text-white break-all">
                {recipient}
              </span>
            </div>

            {/* Tx link */}
            <div
              className="w-full rounded-md p-3 mb-6 text-left"
              style={{
                backgroundColor: "rgba(55,71,133,0.45)",
                border: "1px solid rgba(168,208,230,0.15)",
              }}
            >
              <span
                className="text-[10px] uppercase font-bold tracking-wider block mb-1"
                style={{ color: "rgba(168,208,230,0.6)" }}
              >
                Sepolia Transaction Hash
              </span>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-bold underline break-all inline-block"
                style={{ color: "#F76C6C" }}
              >
                {txHash} ↗
              </a>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-md font-bold text-sm text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#F76C6C" }}
            >
              Done
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleTransfer} className="space-y-4">
            {/* Selected Image Info Card */}
            <div
              className="rounded-md p-3.5 flex items-center gap-3"
              style={{
                backgroundColor: "rgba(55,71,133,0.5)",
                border: "1px solid rgba(168,208,230,0.15)",
              }}
            >
              <div
                className="w-14 h-14 rounded overflow-hidden flex-shrink-0"
                style={{ backgroundColor: "#1e284f" }}
              >
                <img
                  src={image.imageUrl}
                  alt={image.fileName || "Proof Image"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {image.fileName || "Registered Image"}
                </p>
                <p
                  className="text-xs font-mono truncate"
                  style={{ color: "#A8D0E6" }}
                  title={image.hash}
                >
                  SHA-256: {image.hash?.slice(0, 10)}…{image.hash?.slice(-8)}
                </p>
                {image.transferredTo && (
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: "#F8E9A1" }}
                  >
                    Previously transferred to {image.transferredTo.slice(0, 6)}…
                    {image.transferredTo.slice(-4)}
                  </p>
                )}
              </div>
            </div>

            {/* Explanatory callout without shaded box */}
            <div
              className="py-1 text-xs"
              style={{ color: "rgba(168,208,230,0.75)" }}
            >
              <p>
                This action invokes <code className="text-white font-mono">transferProof(hash, newOwner)</code> on the Sepolia smart contract. The new owner address will become the verifiable owner of this individual asset on-chain.
              </p>
            </div>

            {/* Recipient Address Input */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "#A8D0E6" }}
              >
                Recipient Ethereum Wallet Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x71C...384E"
                disabled={loading}
                className="w-full px-3.5 py-2.5 rounded-md text-xs font-mono text-white placeholder-white/30 focus:outline-none transition-colors border"
                style={{
                  backgroundColor: "rgba(30,40,79,0.8)",
                  borderColor:
                    recipient && !isValidAddress
                      ? "#F76C6C"
                      : "rgba(168,208,230,0.25)",
                }}
              />
              {recipient && !isValidAddress && (
                <p className="text-[11px] mt-1.5" style={{ color: "#F76C6C" }}>
                  Must be a valid 42-character Ethereum hex address starting with 0x.
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="rounded-md p-3 text-xs font-semibold text-white shadow-md flex items-center gap-2"
                style={{
                  backgroundColor: "#F76C6C",
                }}
              >
                <XCircleIcon size={16} color="#FFFFFF" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-2.5 rounded-md text-xs font-bold transition-all hover:bg-[#2c3a70] cursor-pointer disabled:opacity-40 text-white border"
                style={{
                  backgroundColor: "#374785",
                  borderColor: "rgba(168,208,230,0.25)",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !isValidAddress}
                className="flex-1 py-2.5 rounded-md text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm"
                style={{ backgroundColor: "#F76C6C" }}
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Confirming on Sepolia…</span>
                  </>
                ) : (
                  <span>Execute Transfer ↗</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { Page } from "../types";
import { useAuth } from "../context/AuthContext";
import { getImages, ImageRecord } from "../services/api";
import { formatDate, fmtBytes } from "../utils/formatters";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { ImageCard } from "../components/image/ImageCard";
import { UploadIcon, XCircleIcon } from "../components/icons/Icons";

export interface DashboardPageProps {
  setPage: (p: Page) => void;
}

export function DashboardPage({ setPage }: DashboardPageProps) {
  const { user, isAuthenticated } = useAuth();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProofs = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getImages();
      setImages(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load proofs.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPage("login");
      return;
    }
    fetchProofs();
  }, [isAuthenticated, fetchProofs, setPage]);

  const filteredImages = images.filter((img) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (img.fileName && img.fileName.toLowerCase().includes(q)) ||
      (img.hash && img.hash.toLowerCase().includes(q)) ||
      (img.txHash && img.txHash.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f8fb" }}>
      {/* Top Banner */}
      <div style={{ backgroundColor: "#24305E" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                style={{ backgroundColor: "rgba(247,108,108,0.15)", color: "#F76C6C" }}
              >
                Authenticated Proof Dashboard
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white">
                Welcome, {user?.name || "Member"}
              </h1>
              <p className="text-sm mt-1" style={{ color: "rgba(168,208,230,0.65)" }}>
                {user?.email} · Member since {formatDate(user?.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage("register")}
                className="px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg cursor-pointer"
                style={{ backgroundColor: "#F76C6C", color: "white" }}
              >
                + Register New Image
              </button>
              <button
                onClick={() => setPage("profile")}
                className="px-4 py-3.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 cursor-pointer"
                style={{
                  color: "#A8D0E6",
                  backgroundColor: "rgba(168,208,230,0.1)",
                  border: "1px solid rgba(168,208,230,0.2)",
                }}
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <StatCard label="My Registered Proofs" value={images.length} accent="#F8E9A1" />
            <StatCard
              label="Blockchain Confirmed"
              value={images.filter((i) => !!i.txHash || !!i.hash).length}
              accent="#F76C6C"
            />
            <StatCard
              label="Cloud Storage Backed"
              value={images.filter((i) => !!i.imageUrl).length}
              accent="#A8D0E6"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#24305E" }}>
              Your Registered Proofs
            </h2>
            <p className="text-xs" style={{ color: "rgba(36,48,94,0.6)" }}>
              Private to your account · Secured on Ethereum Sepolia
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by file name or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-none border"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(55,71,133,0.2)",
                color: "#24305E",
                minWidth: "220px",
              }}
            />

            {/* Grid/List Toggle */}
            <div
              className="flex gap-1 p-1 rounded-xl bg-white border"
              style={{ borderColor: "rgba(55,71,133,0.15)" }}
            >
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  style={{
                    backgroundColor: view === v ? "#24305E" : "transparent",
                    color: view === v ? "white" : "#24305E",
                  }}
                >
                  {v === "grid" ? "Grid" : "List"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="rounded-2xl p-5 mb-8 flex items-center justify-between shadow-sm"
            style={{ backgroundColor: "rgba(247,108,108,0.1)", border: "1px solid rgba(247,108,108,0.25)" }}
          >
            <div className="flex items-center gap-3">
              <XCircleIcon size={20} />
              <span className="text-sm font-medium" style={{ color: "#24305E" }}>
                {error}
              </span>
            </div>
            <button
              onClick={fetchProofs}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
              style={{ backgroundColor: "#24305E" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl p-4 animate-pulse"
                style={{ backgroundColor: "#374785" }}
              >
                <div className="aspect-video rounded-xl mb-4" style={{ backgroundColor: "#24305E" }} />
                <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: "rgba(168,208,230,0.2)" }} />
                <div className="h-3 rounded w-1/2" style={{ backgroundColor: "rgba(168,208,230,0.1)" }} />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          /* Empty State */
          <div
            className="rounded-3xl p-14 text-center my-6"
            style={{ backgroundColor: "#24305E", border: "1px dashed rgba(168,208,230,0.25)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(168,208,230,0.1)" }}
            >
              <UploadIcon />
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2">No Images Registered Yet</h3>
            <p className="text-sm max-w-md mx-auto mb-8" style={{ color: "rgba(168,208,230,0.65)" }}>
              You have not registered any image proofs yet. Upload an image to record its immutable fingerprint on Ethereum Sepolia.
            </p>
            <button
              onClick={() => setPage("register")}
              className="px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg cursor-pointer"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              + Register Your First Image
            </button>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "#24305E" }}>
              No image proofs matched your search "{searchQuery}".
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img, idx) => (
              <ImageCard key={img._id || img.hash || idx} image={img} />
            ))}
          </div>
        ) : (
          /* List View */
          <div
            className="rounded-2xl overflow-hidden bg-white shadow-sm border"
            style={{ borderColor: "rgba(55,71,133,0.15)" }}
          >
            {filteredImages.map((img, i) => (
              <div
                key={img._id || img.hash || i}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-black/[0.02]"
                style={{
                  borderBottom: i < filteredImages.length - 1 ? "1px solid rgba(55,71,133,0.08)" : "none",
                }}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <img src={img.imageUrl} alt={img.fileName || "Proof"} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "#24305E" }}>
                    {img.fileName || "Registered Image"}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(55,71,133,0.55)" }}>
                    {formatDate(img.uploadedAt)} {img.fileSize ? `· ${fmtBytes(img.fileSize)}` : ""}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <StatusBadge status="registered" />
                </div>
                <div className="hidden md:block text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider block text-gray-400">Fingerprint</span>
                  <span className="text-xs font-mono font-medium" style={{ color: "#24305E" }}>
                    {img.hash ? `${img.hash.slice(0, 8)}…${img.hash.slice(-6)}` : ""}
                  </span>
                </div>
                {img.txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${img.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-bold underline px-3 py-1.5 rounded-lg"
                    style={{ color: "#F76C6C", backgroundColor: "rgba(247,108,108,0.08)" }}
                  >
                    Sepolia ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import {
  registerImage,
  verifyImage,
  getImages,
  ImageRecord,
  ApiError,
} from "./services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "home" | "register" | "verify" | "dashboard" | "about";
type RegisterStep = "idle" | "uploading" | "hashing" | "registering" | "done";
type VerifyStep = "idle" | "checking" | "done";
type VerifyResult = "registered" | "not-registered" | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── SVG Illustrations ────────────────────────────────────────────────────────
function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto select-none animate-float">
      <svg viewBox="0 0 420 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        {/* Background blobs */}
        <ellipse cx="210" cy="200" rx="180" ry="160" fill="#374785" opacity="0.12" />

        {/* Image frame */}
        <rect x="30" y="60" width="120" height="100" rx="12" fill="#24305E" />
        <rect x="38" y="68" width="104" height="84" rx="8" fill="#374785" />
        <circle cx="58" cy="88" r="10" fill="#A8D0E6" opacity="0.5" />
        <path d="M38 130 L70 105 L90 120 L115 95 L142 130Z" fill="#A8D0E6" opacity="0.4" />
        <rect x="38" y="68" width="104" height="84" rx="8" fill="url(#imgGrad)" opacity="0.3" />

        {/* Arrow 1 */}
        <path d="M158 108 L188 108" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M183 103 L190 108 L183 113" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hash/fingerprint block */}
        <rect x="196" y="68" width="100" height="80" rx="12" fill="#F8E9A1" opacity="0.2" stroke="#F8E9A1" strokeWidth="1.5" />
        <text x="246" y="90" textAnchor="middle" fill="#F8E9A1" fontSize="9" fontFamily="JetBrains Mono" opacity="0.9">#</text>
        <text x="246" y="102" textAnchor="middle" fill="#F8E9A1" fontSize="7" fontFamily="JetBrains Mono" opacity="0.7">3a9fc12e</text>
        <text x="246" y="113" textAnchor="middle" fill="#F8E9A1" fontSize="7" fontFamily="JetBrains Mono" opacity="0.7">b4c91f88</text>
        <text x="246" y="124" textAnchor="middle" fill="#F8E9A1" fontSize="7" fontFamily="JetBrains Mono" opacity="0.7">7bc288fa</text>
        <rect x="196" y="68" width="100" height="80" rx="12" fill="none" stroke="#F8E9A1" strokeWidth="1" opacity="0.4" />

        {/* Arrow 2 */}
        <path d="M304 108 L334 108" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M329 103 L336 108 L329 113" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Blockchain blocks */}
        <rect x="342" y="72" width="52" height="36" rx="8" fill="#24305E" stroke="#374785" strokeWidth="1.5" />
        <rect x="346" y="76" width="44" height="28" rx="5" fill="#374785" opacity="0.8" />
        <circle cx="368" cy="90" r="4" fill="#A8D0E6" opacity="0.6" />

        <rect x="342" y="118" width="52" height="36" rx="8" fill="#24305E" stroke="#374785" strokeWidth="1.5" />
        <rect x="346" y="122" width="44" height="28" rx="5" fill="#374785" opacity="0.8" />
        <circle cx="368" cy="136" r="4" fill="#A8D0E6" opacity="0.6" />

        {/* Chain link */}
        <rect x="363" y="108" width="10" height="10" rx="3" fill="#374785" />

        {/* Big verified badge */}
        <circle cx="210" cy="260" r="72" fill="#374785" opacity="0.15" />
        <circle cx="210" cy="260" r="58" fill="#24305E" />
        <circle cx="210" cy="260" r="50" fill="#374785" />
        {/* Check */}
        <path d="M188 260 L204 276 L234 246" stroke="#F76C6C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Yellow star accents */}
        <circle cx="80" cy="210" r="8" fill="#F8E9A1" opacity="0.8" />
        <circle cx="355" cy="200" r="6" fill="#F8E9A1" opacity="0.6" />
        <circle cx="150" cy="290" r="5" fill="#F76C6C" opacity="0.5" />
        <circle cx="280" cy="310" r="4" fill="#A8D0E6" opacity="0.6" />

        {/* Labels */}
        <text x="90" y="175" textAnchor="middle" fill="#24305E" fontSize="9" fontWeight="700" fontFamily="Plus Jakarta Sans" opacity="0.8">IMAGE</text>
        <text x="246" y="158" textAnchor="middle" fill="#F8E9A1" fontSize="9" fontWeight="700" fontFamily="Plus Jakarta Sans" opacity="0.8">FINGERPRINT</text>
        <text x="368" y="168" textAnchor="middle" fill="#A8D0E6" fontSize="9" fontWeight="700" fontFamily="Plus Jakarta Sans" opacity="0.8">PROOF</text>
        <text x="210" y="345" textAnchor="middle" fill="#F76C6C" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans">VERIFIED</text>

        <defs>
          <linearGradient id="imgGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A8D0E6" />
            <stop offset="100%" stopColor="#374785" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#A8D0E6" opacity="0.3" />
      <path d="M24 32V20M24 20L19 25M24 20L29 25" stroke="#374785" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 34H32" stroke="#374785" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L4 6V12C4 16.418 7.582 20.37 12 22C16.418 20.37 20 16.418 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <path d="M8 12L10.5 14.5L16 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XCircleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#F76C6C" strokeWidth="2" />
      <path d="M15 9L9 15M9 9L15 15" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links: { label: string; id: Page }[] = [
    { label: "Home", id: "home" },
    { label: "Register", id: "register" },
    { label: "Verify", id: "verify" },
    { label: "About", id: "about" },
  ];

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setPage("home")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F76C6C" }}>
              <ShieldIcon className="text-white w-4 h-4" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Proof<span style={{ color: "#F76C6C" }}>Mint</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => setPage(l.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: page === l.id ? "#A8D0E6" : "rgba(168,208,230,0.65)",
                  backgroundColor: page === l.id ? "rgba(168,208,230,0.12)" : "transparent",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setPage("dashboard")}
              className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                color: page === "dashboard" ? "#A8D0E6" : "rgba(168,208,230,0.7)",
                backgroundColor: page === "dashboard" ? "rgba(168,208,230,0.12)" : "transparent",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPage("register")}
              className="px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: "#A8D0E6" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen ? (
                <path d="M5 5L17 17M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M3 6H19M3 11H19M3 16H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: "#24305E", borderColor: "rgba(55,71,133,0.5)" }}>
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => { setPage(l.id); setMenuOpen(false); }}
                className="text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{ color: page === l.id ? "#A8D0E6" : "rgba(168,208,230,0.65)" }}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => { setPage("dashboard"); setMenuOpen(false); }}
              className="text-left px-4 py-3 rounded-lg text-sm font-medium"
              style={{ color: page === "dashboard" ? "#A8D0E6" : "rgba(168,208,230,0.65)" }}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setPage("register"); setMenuOpen(false); }}
              className="mt-2 px-4 py-3 text-sm font-bold rounded-lg"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F76C6C" }}>
                <ShieldIcon className="text-white w-4 h-4" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Proof<span style={{ color: "#F76C6C" }}>Mint</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(168,208,230,0.6)" }}>
              The easiest way to prove digital image ownership and verify authenticity on the blockchain.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8E9A1" }}>Product</p>
            {["Register", "Verify", "Dashboard", "About"].map((l) => (
              <button
                key={l}
                onClick={() => setPage(l.toLowerCase() as Page)}
                className="block text-sm mb-2 transition-colors hover:opacity-100"
                style={{ color: "rgba(168,208,230,0.55)" }}
              >
                {l}
              </button>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8E9A1" }}>Network</p>
            <p className="text-sm mb-1" style={{ color: "rgba(168,208,230,0.55)" }}>Ethereum Sepolia</p>
            <p className="text-sm mb-1" style={{ color: "rgba(168,208,230,0.55)" }}>Smart Contract</p>
            <p className="text-sm" style={{ color: "rgba(168,208,230,0.55)" }}>Cloudinary & Mongo Storage</p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(55,71,133,0.4)" }}>
          <p className="text-xs" style={{ color: "rgba(168,208,230,0.35)" }}>
            © 2026 ProofMint. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#F76C6C" }} />
            <span className="text-xs" style={{ color: "rgba(168,208,230,0.45)" }}>Live on Sepolia Testnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div
      className="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5"
      style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
    >
      <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
      <p className="text-sm font-medium" style={{ color: accent || "#A8D0E6" }}>{label}</p>
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "registered" | "verified" | "pending" }) {
  const map = {
    registered: { bg: "rgba(248,233,161,0.2)", color: "#F8E9A1", label: "Registered" },
    verified: { bg: "rgba(168,208,230,0.2)", color: "#A8D0E6", label: "Verified" },
    pending: { bg: "rgba(247,108,108,0.15)", color: "#F76C6C", label: "Pending" },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

// ─── ImageCard ────────────────────────────────────────────────────────────────
function ImageCard({ image }: { image: ImageRecord }) {
  const shortHash = image.hash ? `${image.hash.slice(0, 8)}…${image.hash.slice(-6)}` : "";
  const shortTx = image.txHash ? `${image.txHash.slice(0, 8)}…${image.txHash.slice(-6)}` : "";
  const dateStr = image.uploadedAt
    ? new Date(image.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Registered";

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
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
            className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md transition-opacity hover:opacity-100"
            style={{ backgroundColor: "rgba(36,48,94,0.85)", color: "#F76C6C", border: "1px solid rgba(247,108,108,0.3)" }}
            title="View transaction on Sepolia Etherscan"
          >
            Sepolia ↗
          </a>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-white truncate mb-1" title={image.fileName}>
          {image.fileName || "Registered Image"}
        </p>
        <p className="text-xs mb-3" style={{ color: "rgba(168,208,230,0.55)" }}>
          {dateStr} {image.fileSize ? `· ${fmtBytes(image.fileSize)}` : ""}
        </p>
        <div className="flex items-center justify-between">
          <StatusBadge status="registered" />
          <span className="text-xs font-mono" style={{ color: "rgba(168,208,230,0.4)" }} title={image.txHash || image.hash}>
            {shortTx || shortHash}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── UploadDropzone ───────────────────────────────────────────────────────────
function UploadDropzone({
  onFile,
  label = "Drop your image here",
  sub = "or browse files",
  dark = false,
}: {
  onFile: (f: File) => void;
  label?: string;
  sub?: string;
  dark?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="relative w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-14 px-6"
      style={{
        borderColor: dragging ? "#F76C6C" : dark ? "rgba(168,208,230,0.25)" : "rgba(55,71,133,0.35)",
        backgroundColor: dragging
          ? "rgba(247,108,108,0.04)"
          : dark ? "rgba(255,255,255,0.04)" : "rgba(168,208,230,0.06)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }}
      />
      <div className="mb-4">
        <UploadIcon />
      </div>
      <p className="text-base font-bold mb-1" style={{ color: dark ? "rgba(168,208,230,0.85)" : "#24305E" }}>
        {dragging ? "Release to upload" : label}
      </p>
      <p className="text-sm mb-4" style={{ color: dark ? "rgba(168,208,230,0.45)" : "rgba(55,71,133,0.6)" }}>
        {sub}
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        {["JPG", "JPEG", "PNG", "WEBP"].map((f) => (
          <span key={f} className="text-xs font-mono px-2 py-1 rounded"
            style={{ backgroundColor: dark ? "rgba(168,208,230,0.1)" : "rgba(55,71,133,0.1)", color: dark ? "#A8D0E6" : "#374785" }}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── RegistrationProgress ────────────────────────────────────────────────────
function RegistrationProgress({ step }: { step: RegisterStep }) {
  const steps = [
    { key: "uploading", label: "Uploading image to cloud storage" },
    { key: "hashing", label: "Generating SHA-256 digital fingerprint" },
    { key: "registering", label: "Registering proof on Ethereum Sepolia" },
    { key: "done", label: "Registration complete" },
  ];
  const idx = steps.findIndex((s) => s.key === step);

  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const done = i < idx || step === "done";
        const active = i === idx && step !== "done";
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={{
                backgroundColor: done
                  ? "#F76C6C"
                  : active
                    ? "rgba(247,108,108,0.2)"
                    : "rgba(168,208,230,0.1)",
                border: active ? "2px solid #F76C6C" : "none",
              }}
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : active ? (
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#F76C6C" }} />
              ) : null}
            </div>
            <p
              className="text-sm font-medium transition-colors duration-300"
              style={{ color: done ? "white" : active ? "#A8D0E6" : "rgba(168,208,230,0.35)" }}
            >
              {s.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── BlockchainDetails ────────────────────────────────────────────────────────
function BlockchainDetails({
  hash,
  txHash,
  owner,
  aiLabel,
  aiConfidence,
}: {
  hash: string;
  txHash?: string;
  owner?: string;
  aiLabel?: string;
  aiConfidence?: number;
}) {
  const [open, setOpen] = useState(false);
  const shortHash = hash ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : "";
  const shortTx = txHash ? `${txHash.slice(0, 10)}…${txHash.slice(-6)}` : "";
  const shortOwner = owner ? `${owner.slice(0, 8)}…${owner.slice(-6)}` : "";

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(168,208,230,0.15)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
        style={{ backgroundColor: "rgba(168,208,230,0.06)", color: "#A8D0E6" }}
      >
        <span>Technical & Blockchain Details</span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2.5" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
          <div className="flex justify-between items-center text-xs">
            <span style={{ color: "rgba(168,208,230,0.5)" }}>Network</span>
            <span className="font-mono" style={{ color: "#A8D0E6" }}>Ethereum Sepolia</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span style={{ color: "rgba(168,208,230,0.5)" }}>Algorithm</span>
            <span className="font-mono" style={{ color: "#A8D0E6" }}>SHA-256</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span style={{ color: "rgba(168,208,230,0.5)" }}>Image Fingerprint</span>
            <span className="font-mono font-semibold" style={{ color: "#F8E9A1" }} title={hash}>
              {shortHash || hash}
            </span>
          </div>
          {txHash && (
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: "rgba(168,208,230,0.5)" }}>Transaction</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono underline hover:opacity-80 flex items-center gap-1"
                style={{ color: "#F76C6C" }}
                title={txHash}
              >
                {shortTx || txHash} ↗
              </a>
            </div>
          )}
          {owner && (
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: "rgba(168,208,230,0.5)" }}>Owner</span>
              <span className="font-mono" style={{ color: "#A8D0E6" }} title={owner}>
                {shortOwner || owner}
              </span>
            </div>
          )}
          {aiLabel && aiLabel !== "pending" && (
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: "rgba(168,208,230,0.5)" }}>AI Analysis</span>
              <span className="font-mono capitalize" style={{ color: "#A8D0E6" }}>
                {aiLabel} {aiConfidence ? `(${(aiConfidence * 100).toFixed(0)}%)` : ""}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-xs">
            <span style={{ color: "rgba(168,208,230,0.5)" }}>Status</span>
            <span className="font-mono font-bold" style={{ color: "#F8E9A1" }}>Confirmed</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HowItWorks Section ───────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Upload", desc: "Choose your image from any device. We accept JPG, PNG, and WEBP files." },
    { num: "02", title: "Fingerprint", desc: "ProofMint creates a unique SHA-256 digital fingerprint of your image file." },
    { num: "03", title: "Register", desc: "The fingerprint is permanently recorded on Ethereum Sepolia — immutable and timestamped." },
    { num: "04", title: "Verify", desc: "Anyone can later verify whether the fingerprint exists, proving authenticity in seconds." },
  ];

  return (
    <section className="py-24 px-6" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F76C6C" }}>HOW IT WORKS</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Four steps to<br />
            <span style={{ color: "#A8D0E6" }}>permanent proof.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="relative p-8 transition-all duration-200 group"
              style={{
                borderRight: i < steps.length - 1 ? "1px solid rgba(168,208,230,0.1)" : "none",
              }}
            >
              <div
                className="text-7xl font-extrabold leading-none mb-6 transition-colors duration-200 group-hover:opacity-100"
                style={{ color: "rgba(55,71,133,0.8)", lineHeight: 1 }}
              >
                {s.num}
              </div>
              <h3 className="text-xl font-extrabold text-white mb-3 uppercase tracking-wide">{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.6)" }}>{s.desc}</p>
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: "#F76C6C" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl"
        style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.2)" }}>
        <CheckCircleIcon size={18} color="#F76C6C" />
        <p className="text-sm font-medium text-white">{msg}</p>
        <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100" style={{ color: "#A8D0E6" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pages
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[88vh] flex items-center" style={{ backgroundColor: "#A8D0E6" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                style={{ backgroundColor: "rgba(36,48,94,0.12)", color: "#24305E" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F76C6C" }} />
                Live on Ethereum Sepolia
              </div>
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-none tracking-tight mb-6"
                style={{ color: "#24305E" }}>
                PROVE<br />
                WHAT'S<br />
                <span style={{ color: "#F76C6C" }}>YOURS.</span>
              </h1>
              <p className="text-lg lg:text-xl leading-relaxed mb-10 max-w-md"
                style={{ color: "rgba(36,48,94,0.72)" }}>
                Register your digital images on-chain and verify their authenticity in seconds. No technical knowledge required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setPage("register")}
                  className="px-7 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95 shadow-lg"
                  style={{ backgroundColor: "#F76C6C", color: "white" }}
                >
                  Register an Image
                </button>
                <button
                  onClick={() => setPage("verify")}
                  className="px-7 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-80 active:scale-95"
                  style={{ backgroundColor: "rgba(36,48,94,0.1)", color: "#24305E", border: "2px solid rgba(36,48,94,0.2)" }}
                >
                  Verify an Image
                </button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-16 px-6" style={{ backgroundColor: "#374785" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-12" style={{ color: "#F8E9A1" }}>
            BUILT FOR DIGITAL TRUST
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 3L5 7.5V14C5 19.25 9 24.2 14 25.5C19 24.2 23 19.25 23 14V7.5L14 3Z"
                      stroke="#F76C6C" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M10 14L12.5 16.5L18 11" stroke="#F76C6C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Immutable Proof",
                desc: "Your image fingerprint is recorded on-chain — permanent and tamper-proof.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="13" cy="13" r="7" stroke="#A8D0E6" strokeWidth="1.8" />
                    <path d="M18 18L23 23" stroke="#A8D0E6" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 13L12 15L16 11" stroke="#A8D0E6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Easy Verification",
                desc: "Verify any image in seconds. Anyone can check — no account needed.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="5" y="8" width="18" height="14" rx="3" stroke="#F8E9A1" strokeWidth="1.8" />
                    <path d="M9 8V6C9 4.343 10.343 3 12 3H16C17.657 3 19 4.343 19 6V8" stroke="#F8E9A1" strokeWidth="1.8" strokeLinejoin="round" />
                    <circle cx="14" cy="15" r="2" fill="#F8E9A1" opacity="0.6" />
                  </svg>
                ),
                title: "Secure Storage",
                desc: "Your image metadata is securely stored in MongoDB and Cloudinary.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(36,48,94,0.4)" }}>
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.65)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-24 px-6" style={{ backgroundColor: "#f4f8fb" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F76C6C" }}>GET STARTED</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold" style={{ color: "#24305E" }}>
              Two simple actions.
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Register card */}
            <div
              className="rounded-3xl p-10 flex flex-col gap-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl group"
              style={{ backgroundColor: "#A8D0E6" }}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: "#24305E" }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="5" y="5" width="18" height="18" rx="4" stroke="white" strokeWidth="1.8" />
                    <path d="M14 10V18M10 14H18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold mb-3" style={{ color: "#24305E" }}>Register an Image</h3>
                <p className="text-base leading-relaxed" style={{ color: "rgba(36,48,94,0.68)" }}>
                  Create an immutable blockchain proof for your image. Your ownership is permanent, transparent, and verifiable by anyone.
                </p>
              </div>
              <div className="w-full rounded-2xl overflow-hidden aspect-video flex items-center justify-center"
                style={{ backgroundColor: "rgba(36,48,94,0.08)" }}>
                <svg width="200" height="100" viewBox="0 0 200 100" fill="none">
                  <rect x="30" y="20" width="60" height="60" rx="8" fill="#374785" opacity="0.3" />
                  <rect x="38" y="28" width="44" height="44" rx="5" fill="#374785" opacity="0.5" />
                  <circle cx="50" cy="40" r="6" fill="#A8D0E6" opacity="0.6" />
                  <path d="M38 60 L55 45 L65 55 L80 35 L82 72Z" fill="#24305E" opacity="0.25" />
                  <path d="M100 50 L120 50" stroke="#F76C6C" strokeWidth="2" strokeLinecap="round" />
                  <path d="M116 46 L121 50 L116 54" stroke="#F76C6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="128" y="30" width="44" height="40" rx="8" fill="#24305E" opacity="0.5" />
                  <text x="150" y="48" textAnchor="middle" fill="#F8E9A1" fontSize="8" fontFamily="JetBrains Mono">proof</text>
                  <text x="150" y="58" textAnchor="middle" fill="#F8E9A1" fontSize="7" fontFamily="JetBrains Mono">on-chain</text>
                </svg>
              </div>
              <button
                onClick={() => setPage("register")}
                className="self-start px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#24305E", color: "white" }}
              >
                Register Image →
              </button>
            </div>

            {/* Verify card */}
            <div
              className="rounded-3xl p-10 flex flex-col gap-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl group"
              style={{ backgroundColor: "#24305E" }}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: "#F76C6C" }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="13" cy="13" r="7" stroke="white" strokeWidth="1.8" />
                    <path d="M18.5 18.5L23 23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 13L12.5 15.5L17 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3">Verify an Image</h3>
                <p className="text-base leading-relaxed" style={{ color: "rgba(168,208,230,0.65)" }}>
                  Check whether an image has already been registered on-chain. Get an instant, definitive answer.
                </p>
              </div>
              <div className="w-full rounded-2xl overflow-hidden aspect-video flex items-center justify-center"
                style={{ backgroundColor: "rgba(168,208,230,0.05)" }}>
                <svg width="200" height="100" viewBox="0 0 200 100" fill="none">
                  <rect x="30" y="20" width="60" height="60" rx="8" fill="#374785" opacity="0.5" />
                  <rect x="38" y="28" width="44" height="44" rx="5" fill="#374785" opacity="0.8" />
                  <circle cx="50" cy="40" r="6" fill="#A8D0E6" opacity="0.4" />
                  <path d="M38 60 L55 45 L65 55 L80 35 L82 72Z" fill="#A8D0E6" opacity="0.2" />
                  <circle cx="145" cy="50" r="24" fill="rgba(247,108,108,0.15)" stroke="#F76C6C" strokeWidth="1.5" />
                  <path d="M133 50 L141 58 L157 42" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M95 50 L115 50" stroke="#A8D0E6" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
                </svg>
              </div>
              <button
                onClick={() => setPage("verify")}
                className="self-start px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#F76C6C", color: "white" }}
              >
                Verify Image →
              </button>
            </div>
          </div>
        </div>
      </section>

      <HowItWorksSection />
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
function RegisterPage({ setPage }: { setPage: (p: Page) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [owner, setOwner] = useState("0x2875B260351e1C26076C4AaA914C0d93F21f5D7b");
  const [step, setStep] = useState<RegisterStep>("idle");
  const [registeredData, setRegisteredData] = useState<{
    hash: string;
    txHash?: string;
    imageUrl?: string;
    fileName?: string;
    fileSize?: number;
    owner?: string;
    uploadedAt?: string;
    aiLabel?: string;
    aiConfidence?: number;
  } | null>(null);
  const [errorState, setErrorState] = useState<{
    isDuplicate: boolean;
    message: string;
  } | null>(null);
  const [toast, setToast] = useState("");

  const handleFile = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setStep("idle");
    setErrorState(null);
    setRegisteredData(null);
  };

  const handleRemove = () => {
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
      const ownerAddress = owner.trim() || "0x2875B260351e1C26076C4AaA914C0d93F21f5D7b";
      const res = await registerImage(file, ownerAddress);

      clearTimeout(timer1);
      clearTimeout(timer2);

      setRegisteredData({
        hash: res.imageHash || res.image?.hash || "",
        txHash: res.txHash || res.image?.txHash,
        imageUrl: res.image?.imageUrl || preview || "",
        fileName: res.image?.fileName || file.name,
        fileSize: res.image?.fileSize || file.size,
        owner: res.image?.owner || ownerAddress,
        uploadedAt: res.image?.uploadedAt || new Date().toISOString(),
        aiLabel: res.image?.aiLabel,
        aiConfidence: res.image?.aiConfidence,
      });

      setStep("done");
      setToast("Image registered on blockchain successfully!");
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
        const msg = err instanceof Error ? err.message : "Failed to register image.";
        setErrorState({
          isDuplicate: false,
          message: msg,
        });
      }
    }
  };

  const handleAnother = () => {
    setFile(null);
    setPreview(null);
    setStep("idle");
    setErrorState(null);
    setRegisteredData(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F76C6C" }}>REGISTER</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3">
            Register Your<br />Image
          </h1>
          <p className="text-base" style={{ color: "rgba(168,208,230,0.65)" }}>
            Create a permanent digital proof of your image on Ethereum Sepolia.
          </p>
        </div>

        {/* Error Banner */}
        {errorState && (
          <div
            className="rounded-3xl p-6 mb-6 animate-fade-in-up"
            style={{
              backgroundColor: errorState.isDuplicate ? "rgba(248,233,161,0.12)" : "rgba(247,108,108,0.15)",
              border: `1px solid ${errorState.isDuplicate ? "rgba(248,233,161,0.35)" : "rgba(247,108,108,0.3)"}`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: errorState.isDuplicate ? "rgba(248,233,161,0.2)" : "rgba(247,108,108,0.25)",
                }}
              >
                {errorState.isDuplicate ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#F8E9A1" strokeWidth="2" />
                    <path d="M12 8V12M12 16H12.01" stroke="#F8E9A1" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <XCircleIcon size={20} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-1">
                  {errorState.isDuplicate ? "Duplicate Image Detected (409)" : "Registration Failed"}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(168,208,230,0.8)" }}>
                  {errorState.message}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {errorState.isDuplicate && (
                    <button
                      onClick={() => setPage("verify")}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: "#F76C6C", color: "white" }}
                    >
                      Verify This Image →
                    </button>
                  )}
                  <button
                    onClick={() => setErrorState(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                    style={{ backgroundColor: "rgba(168,208,230,0.1)", color: "#A8D0E6", border: "1px solid rgba(168,208,230,0.2)" }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "done" && registeredData ? (
          /* ── Success state ── */
          <div className="animate-fade-in-up">
            <div className="rounded-3xl overflow-hidden mb-6"
              style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}>
              {(registeredData.imageUrl || preview) && (
                <div className="w-full aspect-video overflow-hidden" style={{ backgroundColor: "#24305E" }}>
                  <img
                    src={registeredData.imageUrl || preview!}
                    alt="Registered"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(247,108,108,0.2)" }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F76C6C" }}>
                      IMAGE REGISTERED (201 CREATED)
                    </p>
                    <p className="text-xl font-extrabold text-white">Your proof is permanently recorded.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Filename", value: registeredData.fileName || file?.name || "" },
                    { label: "Status", value: "Registered on Sepolia" },
                    { label: "Owner Wallet", value: registeredData.owner ? `${registeredData.owner.slice(0, 6)}…${registeredData.owner.slice(-4)}` : "Connected Wallet" },
                    {
                      label: "Date",
                      value: new Date(registeredData.uploadedAt || Date.now()).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-3" style={{ backgroundColor: "rgba(36,48,94,0.5)" }}>
                      <p className="text-xs mb-1" style={{ color: "rgba(168,208,230,0.5)" }}>{label}</p>
                      <p className="text-sm font-semibold text-white truncate">{value}</p>
                    </div>
                  ))}
                </div>

                <BlockchainDetails
                  hash={registeredData.hash}
                  txHash={registeredData.txHash}
                  owner={registeredData.owner}
                  aiLabel={registeredData.aiLabel}
                  aiConfidence={registeredData.aiConfidence}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setPage("verify")}
                className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 text-center"
                style={{ backgroundColor: "#F76C6C", color: "white" }}
              >
                Verify This Image
              </button>
              <button
                onClick={() => setPage("dashboard")}
                className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 text-center"
                style={{ backgroundColor: "#A8D0E6", color: "#24305E" }}
              >
                View in Dashboard
              </button>
              <button
                onClick={handleAnother}
                className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-80 text-center"
                style={{ backgroundColor: "rgba(168,208,230,0.1)", color: "#A8D0E6", border: "1px solid rgba(168,208,230,0.2)" }}
              >
                Register Another
              </button>
            </div>
          </div>
        ) : step !== "idle" ? (
          /* ── Progress state ── */
          <div className="animate-fade-in-up rounded-3xl p-8"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}>
            {preview && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: "#24305E" }}>
                <img src={preview} alt="Registering" className="w-full h-full object-cover opacity-60" />
              </div>
            )}
            <p className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: "#A8D0E6" }}>
              Creating Blockchain Proof
            </p>
            <RegistrationProgress step={step} />
          </div>
        ) : file ? (
          /* ── File selected ── */
          <div className="animate-fade-in-up">
            <div className="rounded-3xl overflow-hidden mb-5"
              style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}>
              <div className="aspect-video overflow-hidden" style={{ backgroundColor: "#24305E" }}>
                <img src={preview!} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{file.name}</p>
                  <p className="text-xs" style={{ color: "rgba(168,208,230,0.5)" }}>{fmtBytes(file.size)}</p>
                </div>
                <button
                  onClick={handleRemove}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                  style={{ backgroundColor: "rgba(247,108,108,0.15)", color: "#F76C6C" }}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Owner Wallet Address Input */}
            <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "rgba(55,71,133,0.5)", border: "1px solid rgba(168,208,230,0.12)" }}>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#A8D0E6" }}>
                PROOFMINT REGISTRATION WALLET
                <span
                  className="block mt-1 normal-case font-normal tracking-normal"
                  style={{ color: "rgba(159, 181, 215, 0.55)" }}
                >
                  This Ethereum address is used by ProofMint to register image proofs on the Sepolia testnet.
                </span>
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-xl text-sm font-mono text-white focus:outline-none transition-colors"
                style={{
                  backgroundColor: "rgba(36,48,94,0.8)",
                  border: "1px solid rgba(168,208,230,0.25)",
                }}
              />
              <p className="text-[11px] mt-2" style={{ color: "rgba(168,208,230,0.45)" }}>
                This Ethereum address will be recorded as the immutable owner on the Sepolia testnet.
              </p>
            </div>

            <button
              onClick={handleRegister}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              Create Blockchain Proof
            </button>
          </div>
        ) : (
          /* ── Upload state ── */
          <UploadDropzone onFile={handleFile} dark />
        )}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── Verify Page ──────────────────────────────────────────────────────────────
function VerifyPage({ setPage }: { setPage: (p: Page) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<VerifyStep>("idle");
  const [result, setResult] = useState<VerifyResult>(null);
  const [verifiedHash, setVerifiedHash] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep("idle");
    setResult(null);
    setVerifiedHash("");
    setErrorMsg(null);
  };

  const handleVerify = async () => {
    if (!file) return;
    setErrorMsg(null);
    setStep("checking");

    try {
      const res = await verifyImage(file);
      setVerifiedHash(res.imageHash || "");
      setResult(res.authentic ? "registered" : "not-registered");
      setStep("done");
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
    setResult(null);
    setVerifiedHash("");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#A8D0E6" }}>VERIFY</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3">
            Verify an Image
          </h1>
          <p className="text-base" style={{ color: "rgba(168,208,230,0.65)" }}>
            Check whether this image has an existing blockchain proof on Ethereum Sepolia.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl p-4 mb-6 animate-fade-in-up flex items-center justify-between"
            style={{ backgroundColor: "rgba(247,108,108,0.15)", border: "1px solid rgba(247,108,108,0.3)" }}>
            <div className="flex items-center gap-3">
              <XCircleIcon size={20} />
              <span className="text-sm text-white font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-bold underline opacity-80 hover:opacity-100"
              style={{ color: "#F76C6C" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {step === "done" && result ? (
          /* ── Result state ── */
          <div className="animate-fade-in-up">
            {result === "registered" ? (
              <div className="rounded-3xl overflow-hidden"
                style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}>
                {preview && (
                  <div className="aspect-video overflow-hidden" style={{ backgroundColor: "#24305E" }}>
                    <img src={preview} alt="Verified" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-8">
                  {/* Big success */}
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "rgba(247,108,108,0.15)" }}>
                      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="animate-fade-in-up">
                        <circle cx="22" cy="22" r="20" stroke="#F76C6C" strokeWidth="2" />
                        <path d="M13 22L19 28L31 16" stroke="#F76C6C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">Image Verified Authentic</h2>
                    <p style={{ color: "rgba(168,208,230,0.65)" }}>This image's SHA-256 fingerprint is registered on Ethereum Sepolia.</p>
                  </div>

                  {/* Info card */}
                  <div className="rounded-2xl p-5 mb-6 space-y-3"
                    style={{ backgroundColor: "rgba(36,48,94,0.5)" }}>
                    {[
                      { label: "Status", value: "REGISTERED & AUTHENTIC", highlight: true },
                      { label: "Blockchain", value: "Ethereum Sepolia" },
                      { label: "Image Fingerprint", value: verifiedHash ? `${verifiedHash.slice(0, 10)}…${verifiedHash.slice(-6)}` : "Confirmed" },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "rgba(168,208,230,0.5)" }}>{label}</span>
                        <span
                          className="text-xs font-mono font-bold px-2 py-1 rounded"
                          style={{
                            backgroundColor: highlight ? "rgba(248,233,161,0.15)" : "transparent",
                            color: highlight ? "#F8E9A1" : "#A8D0E6",
                          }}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setPage("dashboard")}
                      className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                      style={{ backgroundColor: "#A8D0E6", color: "#24305E" }}
                    >
                      View in Dashboard
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: "rgba(168,208,230,0.1)", color: "#A8D0E6", border: "1px solid rgba(168,208,230,0.2)" }}
                    >
                      Verify Another Image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Not registered ── */
              <div className="rounded-3xl overflow-hidden"
                style={{ backgroundColor: "#374785", border: "1px solid rgba(247,108,108,0.2)" }}>
                {preview && (
                  <div className="aspect-video overflow-hidden relative" style={{ backgroundColor: "#24305E" }}>
                    <img src={preview} alt="Not verified" className="w-full h-full object-cover opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <XCircleIcon size={64} />
                    </div>
                  </div>
                )}
                <div className="p-8 text-center">
                  <h2 className="text-3xl font-extrabold text-white mb-3">Not Registered</h2>
                  <p className="mb-4" style={{ color: "rgba(168,208,230,0.65)" }}>
                    This image does not have a matching registration on the blockchain.
                  </p>
                  {verifiedHash && (
                    <div className="rounded-xl p-3 mb-8 max-w-md mx-auto" style={{ backgroundColor: "rgba(36,48,94,0.5)" }}>
                      <p className="text-[11px] mb-1" style={{ color: "rgba(168,208,230,0.5)" }}>Calculated SHA-256 Hash</p>
                      <p className="font-mono text-xs text-white truncate">{verifiedHash}</p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setPage("register")}
                      className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: "#F76C6C", color: "white" }}
                    >
                      Register This Image
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: "rgba(168,208,230,0.1)", color: "#A8D0E6", border: "1px solid rgba(168,208,230,0.2)" }}
                    >
                      Try Another
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : step === "checking" ? (
          /* ── Checking state ── */
          <div className="animate-fade-in-up rounded-3xl p-8 text-center"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}>
            {preview && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-8" style={{ backgroundColor: "#24305E" }}>
                <img src={preview} alt="Checking" className="w-full h-full object-cover opacity-60" />
              </div>
            )}
            <div className="w-16 h-16 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-6"
              style={{ borderColor: "#A8D0E6", borderTopColor: "transparent" }} />
            <p className="text-base font-bold text-white mb-2">Analyzing image...</p>
            <p className="text-sm" style={{ color: "rgba(168,208,230,0.55)" }}>Querying Ethereum Sepolia smart contract...</p>
          </div>
        ) : file ? (
          /* ── File selected ── */
          <div className="animate-fade-in-up">
            <div className="rounded-3xl overflow-hidden mb-4"
              style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}>
              <div className="aspect-video overflow-hidden" style={{ backgroundColor: "#24305E" }}>
                <img src={preview!} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{file.name}</p>
                  <p className="text-xs" style={{ color: "rgba(168,208,230,0.5)" }}>{fmtBytes(file.size)}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: "rgba(247,108,108,0.15)", color: "#F76C6C" }}
                >
                  Remove
                </button>
              </div>
            </div>
            <button
              onClick={handleVerify}
              className="w-full py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#A8D0E6", color: "#24305E" }}
            >
              Verify Registration
            </button>
          </div>
        ) : (
          <UploadDropzone onFile={handleFile} dark label="Drop an image to verify" />
        )}
      </div>
    </div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────
function AboutPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 px-6" style={{ backgroundColor: "#A8D0E6" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "#F76C6C" }}>ABOUT PROOFMINT</p>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ color: "#24305E" }}>
              Your Images.<br />
              Your Proof.<br />
              <span style={{ color: "#374785" }}>On-Chain.</span>
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "rgba(36,48,94,0.7)" }}>
              ProofMint was built for photographers, creators, designers, and businesses who need a simple, trustworthy way to prove digital ownership — without needing to understand the technology underneath.
            </p>
          </div>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "#374785" }}>
            <div className="space-y-4">
              {[
                { n: "Ethereum Sepolia", label: "Blockchain Network" },
                { n: "SHA-256", label: "Cryptographic Fingerprint" },
                { n: "< 2s", label: "Average Verification Time" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-4 border-b"
                  style={{ borderColor: "rgba(168,208,230,0.1)" }}>
                  <span className="text-sm" style={{ color: "rgba(168,208,230,0.65)" }}>{s.label}</span>
                  <span className="text-xl font-extrabold text-white">{s.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      {/* CTA */}
      <section className="py-24 px-6" style={{ backgroundColor: "#374785" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to prove what's yours?</h2>
          <p className="text-base mb-10" style={{ color: "rgba(168,208,230,0.65)" }}>
            Register your first image in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setPage("register")}
              className="px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              Register an Image
            </button>
            <button
              onClick={() => setPage("verify")}
              className="px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-80"
              style={{ backgroundColor: "rgba(168,208,230,0.1)", color: "#A8D0E6", border: "1px solid rgba(168,208,230,0.2)" }}
            >
              Verify an Image
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProofs = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f8fb" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#24305E" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F76C6C" }}>DASHBOARD</p>
              <h1 className="text-4xl font-extrabold text-white">Your Proofs</h1>
            </div>
            <button
              onClick={() => setPage("register")}
              className="self-start sm:self-auto px-5 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              + Register New
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            <StatCard label="Registered Images" value={images.length} accent="#F8E9A1" />
            <StatCard label="Blockchain Proofs" value={images.filter((i) => !!i.txHash || !!i.hash).length} accent="#F76C6C" />
            <StatCard label="Cloud Stored" value={images.filter((i) => !!i.imageUrl).length} accent="#A8D0E6" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: "#24305E" }}>All Registered Images</h2>
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: "rgba(55,71,133,0.1)" }}>
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                style={{
                  backgroundColor: view === v ? "#374785" : "transparent",
                  color: view === v ? "white" : "#374785",
                }}
              >
                {v === "grid" ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" />
                    <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" />
                    <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" />
                    <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 3H13M1 7H13M1 11H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ backgroundColor: "rgba(247,108,108,0.1)", border: "1px solid rgba(247,108,108,0.25)" }}>
            <div className="flex items-center gap-3">
              <XCircleIcon size={24} />
              <div>
                <p className="text-sm font-bold text-white">Error connecting to backend</p>
                <p className="text-xs" style={{ color: "rgba(168,208,230,0.7)" }}>{error}</p>
              </div>
            </div>
            <button
              onClick={fetchProofs}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#374785", color: "white" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl overflow-hidden animate-pulse p-4"
                style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.1)" }}>
                <div className="aspect-video rounded-xl mb-4" style={{ backgroundColor: "#24305E" }} />
                <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: "rgba(168,208,230,0.2)" }} />
                <div className="h-3 rounded w-1/2" style={{ backgroundColor: "rgba(168,208,230,0.1)" }} />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          /* Empty state */
          <div className="rounded-3xl p-12 text-center my-6"
            style={{ backgroundColor: "#24305E", border: "1px dashed rgba(168,208,230,0.2)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(168,208,230,0.1)" }}>
              <UploadIcon />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2">No Images Registered Yet</h3>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: "rgba(168,208,230,0.6)" }}>
              You haven't registered any image proofs yet. Upload an image to create an immutable proof on Ethereum Sepolia.
            </p>
            <button
              onClick={() => setPage("register")}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              + Register Your First Image
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {images.map((img, idx) => (
              <ImageCard key={img._id || img.hash || idx} image={img} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(55,71,133,0.15)" }}>
            {images.map((img, i) => (
              <div
                key={img._id || img.hash || i}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:opacity-90"
                style={{
                  backgroundColor: i % 2 === 0 ? "white" : "rgba(168,208,230,0.04)",
                  borderBottom: i < images.length - 1 ? "1px solid rgba(55,71,133,0.08)" : "none",
                }}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: "#A8D0E6" }}>
                  <img src={img.imageUrl} alt={img.fileName || "Proof"} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#24305E" }}>
                    {img.fileName || "Registered Image"}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(55,71,133,0.5)" }}>
                    {img.uploadedAt
                      ? new Date(img.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "Recently"}{" "}
                    {img.fileSize ? `· ${fmtBytes(img.fileSize)}` : ""}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <StatusBadge status="registered" />
                </div>
                <p className="hidden md:block text-xs font-mono" style={{ color: "rgba(55,71,133,0.4)" }} title={img.txHash || img.hash}>
                  {img.txHash
                    ? `${img.txHash.slice(0, 6)}…${img.txHash.slice(-4)}`
                    : `${img.hash.slice(0, 6)}…${img.hash.slice(-4)}`}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        {!loading && images.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-xs" style={{ color: "rgba(55,71,133,0.4)" }}>
              Showing {images.length} registered {images.length === 1 ? "proof" : "proofs"} · Ethereum Sepolia Testnet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Root App
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState<Page>("home");

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} />;
      case "register": return <RegisterPage setPage={setPage} />;
      case "verify": return <VerifyPage setPage={setPage} />;
      case "about": return <AboutPage setPage={setPage} />;
      case "dashboard": return <DashboardPage setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar page={page} setPage={setPage} />
      <main className="flex-1">{renderPage()}</main>
      <Footer setPage={setPage} />
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import {
  registerImage,
  verifyImage,
  getImages,
  ImageRecord,
  VerifyResponse,
  ApiError,
} from "./services/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProofMintLogo, ProofMintIcon } from "./components/ProofMintLogo";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          initCodeClient: (config: any) => any;
        };
      };
    };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Page =
  | "home"
  | "verify"
  | "login"
  | "register-account"
  | "dashboard"
  | "register"
  | "profile"
  | "about";

type RegisterStep = "idle" | "uploading" | "hashing" | "registering" | "done";
type VerifyStep = "idle" | "checking" | "done";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Recently";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── SVG Illustrations & Icons ────────────────────────────────────────────────
function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto select-none animate-float">
      <svg viewBox="0 0 420 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
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
        <path d="M188 260 L204 276 L234 246" stroke="#F76C6C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        <text x="90" y="175" textAnchor="middle" fill="#24305E" fontSize="9" fontWeight="700" opacity="0.8">IMAGE</text>
        <text x="246" y="158" textAnchor="middle" fill="#F8E9A1" fontSize="9" fontWeight="700" opacity="0.8">FINGERPRINT</text>
        <text x="368" y="168" textAnchor="middle" fill="#A8D0E6" fontSize="9" fontWeight="700" opacity="0.8">PROOF</text>
        <text x="210" y="345" textAnchor="middle" fill="#F76C6C" fontSize="11" fontWeight="800">VERIFIED</text>

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

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({
  page,
  setPage,
  onStartRegister,
}: {
  page: Page;
  setPage: (p: Page) => void;
  onStartRegister: () => void;
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks: { label: string; id: Page }[] = [
    { label: "Home", id: "home" },
    { label: "Verify Image", id: "verify" },
    ...(isAuthenticated ? [{ label: "Dashboard", id: "dashboard" as Page }, { label: "Profile", id: "profile" as Page }] : []),
    { label: "About", id: "about" },
  ];

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => setPage("home")}
            className="flex items-center group cursor-pointer focus:outline-none"
          >
            <ProofMintLogo size={38} showWordmark={true} />
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => setPage(l.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  color: page === l.id ? "#A8D0E6" : "rgba(168,208,230,0.7)",
                  backgroundColor: page === l.id ? "rgba(168,208,230,0.12)" : "transparent",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage("register")}
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95 shadow cursor-pointer"
                  style={{ backgroundColor: "#F76C6C", color: "white" }}
                >
                  + Register Proof
                </button>
                <button
                  onClick={() => setPage("profile")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border"
                  style={{
                    backgroundColor: page === "profile" ? "rgba(168,208,230,0.15)" : "rgba(36,48,94,0.6)",
                    borderColor: "rgba(168,208,230,0.2)",
                    color: "#A8D0E6",
                  }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#374785" }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate text-white">{user?.name}</span>
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  style={{ color: "rgba(247,108,108,0.9)", backgroundColor: "rgba(247,108,108,0.1)" }}
                  title="Log out"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage("login")}
                  className="px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer"
                  style={{ color: "#A8D0E6", backgroundColor: "rgba(168,208,230,0.08)" }}
                >
                  Sign In
                </button>
                <button
                  onClick={onStartRegister}
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95 shadow cursor-pointer"
                  style={{ backgroundColor: "#F76C6C", color: "white" }}
                >
                  Register Image
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg cursor-pointer"
            style={{ color: "#A8D0E6" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen ? (
                <path d="M5 5L17 17M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 6H19M3 11H19M3 16H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t px-6 py-4 flex flex-col gap-2" style={{ backgroundColor: "#24305E", borderColor: "rgba(55,71,133,0.5)" }}>
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => { setPage(l.id); setMenuOpen(false); }}
              className="text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              style={{ color: page === l.id ? "#A8D0E6" : "rgba(168,208,230,0.65)" }}
            >
              {l.label}
            </button>
          ))}
          {isAuthenticated ? (
            <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: "rgba(55,71,133,0.5)" }}>
              <button
                onClick={() => { setPage("register"); setMenuOpen(false); }}
                className="px-4 py-3 text-sm font-bold rounded-xl text-center"
                style={{ backgroundColor: "#F76C6C", color: "white" }}
              >
                + Register New Proof
              </button>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="px-4 py-3 text-sm font-semibold rounded-xl text-center"
                style={{ color: "#F76C6C", backgroundColor: "rgba(247,108,108,0.1)" }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: "rgba(55,71,133,0.5)" }}>
              <button
                onClick={() => { setPage("login"); setMenuOpen(false); }}
                className="px-4 py-3 text-sm font-semibold rounded-xl text-center"
                style={{ color: "#A8D0E6", backgroundColor: "rgba(168,208,230,0.08)" }}
              >
                Sign In
              </button>
              <button
                onClick={() => { onStartRegister(); setMenuOpen(false); }}
                className="px-4 py-3 text-sm font-bold rounded-xl text-center"
                style={{ backgroundColor: "#F76C6C", color: "white" }}
              >
                Register Image
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
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
    registered: { bg: "rgba(248,233,161,0.2)", color: "#F8E9A1", label: "Registered on Sepolia" },
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
  const dateStr = formatDate(image.uploadedAt);
  const [copied, setCopied] = useState(false);

  const copyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group flex flex-col"
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
            className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md transition-opacity hover:opacity-100"
            style={{ backgroundColor: "rgba(36,48,94,0.9)", color: "#F76C6C", border: "1px solid rgba(247,108,108,0.3)" }}
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

          <div className="rounded-lg p-2.5 mb-4 flex items-center justify-between" style={{ backgroundColor: "rgba(36,48,94,0.5)" }}>
            <div className="min-w-0 pr-2">
              <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: "rgba(168,208,230,0.5)" }}>Fingerprint</span>
              <span className="text-xs font-mono text-white block truncate" title={image.hash}>{shortHash}</span>
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

        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(168,208,230,0.1)" }}>
          <StatusBadge status="registered" />
          {image.txHash ? (
            <a
              href={`https://sepolia.etherscan.io/tx/${image.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono underline hover:opacity-80"
              style={{ color: "#F76C6C" }}
              title={image.txHash}
            >
              {shortTx}
            </a>
          ) : (
            <span className="text-xs font-mono" style={{ color: "rgba(168,208,230,0.4)" }}>Confirmed</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── UploadDropzone ───────────────────────────────────────────────────────────
function UploadDropzone({
  onFile,
  label = "Drop your image here",
  sub = "or click to browse files",
  dark = false,
}: {
  onFile: (f: File) => void;
  label?: string;
  sub?: string;
  dark?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="relative w-full rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-12 px-6 group"
      style={{
        borderColor: dragging
          ? "#F76C6C"
          : dark
            ? "rgba(168,208,230,0.25)"
            : "rgba(55,71,133,0.35)",
        backgroundColor: dragging
          ? "rgba(247,108,108,0.06)"
          : dark
            ? "rgba(255,255,255,0.03)"
            : "rgba(168,208,230,0.06)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFile(e.target.files[0]);
        }}
      />
      <div className="mb-4 transition-transform group-hover:scale-110">
        <UploadIcon />
      </div>
      <p
        className="text-base font-bold mb-1 text-center"
        style={{ color: dark ? "rgba(168,208,230,0.9)" : "#24305E" }}
      >
        {dragging ? "Release to upload image" : label}
      </p>
      <p
        className="text-sm mb-4 text-center"
        style={{ color: dark ? "rgba(168,208,230,0.5)" : "rgba(55,71,133,0.6)" }}
      >
        {sub}
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        {["JPG", "PNG", "WEBP", "GIF", "SVG"].map((f) => (
          <span
            key={f}
            className="text-xs font-mono px-2.5 py-1 rounded-md"
            style={{
              backgroundColor: dark ? "rgba(168,208,230,0.1)" : "rgba(55,71,133,0.1)",
              color: dark ? "#A8D0E6" : "#374785",
            }}
          >
            {f}
          </span>
        ))}
      </div>
      <p className="text-[11px] mt-3" style={{ color: dark ? "rgba(168,208,230,0.4)" : "rgba(55,71,133,0.5)" }}>
        Max file size: 10 MB
      </p>
    </div>
  );
}

// ─── RegistrationProgress ────────────────────────────────────────────────────
function RegistrationProgress({ step }: { step: RegisterStep }) {
  const steps = [
    { key: "uploading", label: "Uploading image to cloud storage" },
    { key: "hashing", label: "Generating SHA-256 cryptographic fingerprint" },
    { key: "registering", label: "Registering proof on Ethereum Sepolia" },
    { key: "done", label: "Confirmed on-chain & saved to your account" },
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

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl"
        style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.25)" }}>
        <CheckCircleIcon size={20} color="#F8E9A1" />
        <p className="text-sm font-medium text-white">{msg}</p>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer" style={{ color: "#A8D0E6" }}>
          ✕
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pages
// ═══════════════════════════════════════════════════════════════════════════════

// ─── HomePage ─────────────────────────────────────────────────────────────────
function HomePage({
  setPage,
  onStartRegister,
}: {
  setPage: (p: Page) => void;
  onStartRegister: () => void;
}) {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[85vh] flex items-center" style={{ backgroundColor: "#A8D0E6" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                style={{ backgroundColor: "rgba(36,48,94,0.12)", color: "#24305E" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F76C6C" }} />
                Live on Ethereum Sepolia Testnet
              </div>
              <h1
                className="text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-none tracking-tight mb-6"
                style={{ color: "#24305E" }}
              >
                PROVE<br />
                WHAT'S<br />
                <span style={{ color: "#F76C6C" }}>YOURS.</span>
              </h1>
              <p
                className="text-lg lg:text-xl leading-relaxed mb-10 max-w-md"
                style={{ color: "rgba(36,48,94,0.78)" }}
              >
                Register your digital image proofs on-chain and let anyone verify their authenticity in seconds without technical friction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onStartRegister}
                  className="px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95 shadow-xl cursor-pointer"
                  style={{ backgroundColor: "#F76C6C", color: "white" }}
                >
                  Register Image
                </button>
                <button
                  onClick={() => setPage("verify")}
                  className="px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:bg-black/5 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "rgba(36,48,94,0.1)",
                    color: "#24305E",
                    border: "2px solid rgba(36,48,94,0.2)",
                  }}
                >
                  Verify Image
                </button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-16 px-6" style={{ backgroundColor: "#374785" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-12" style={{ color: "#F8E9A1" }}>
            BUILT FOR DIGITAL TRUST & CRYPTOGRAPHIC CERTAINTY
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Immutable Proof",
                desc: "Your image fingerprint is recorded on Ethereum Sepolia — permanent, tamper-proof, and timestamped.",
              },
              {
                title: "Public Verification",
                desc: "Anyone can verify an image instantly without creating an account or logging in.",
              },
              {
                title: "User Ownership",
                desc: "Each proof is cryptographically linked to your user account, accessible through your private dashboard.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all"
                style={{ backgroundColor: "rgba(36,48,94,0.5)", border: "1px solid rgba(168,208,230,0.15)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 text-xs font-bold font-mono" style={{ backgroundColor: "#F76C6C", color: "white" }}>
                  0{i + 1}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.7)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6" style={{ backgroundColor: "#24305E" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F76C6C" }}>HOW IT WORKS</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Four steps to<br />
              <span style={{ color: "#A8D0E6" }}>permanent authenticity.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Upload", desc: "Upload your image securely. We support JPEG, PNG, WEBP, GIF, and SVG." },
              { num: "02", title: "Fingerprint", desc: "ProofMint computes a deterministic SHA-256 cryptographic hash of your image." },
              { num: "03", title: "Smart Contract", desc: "The fingerprint is stored on Ethereum Sepolia via smart contract transaction." },
              { num: "04", title: "Public Proof", desc: "Anyone with the image file can verify matching proof on the public blockchain." },
            ].map((s) => (
              <div
                key={s.num}
                className="rounded-2xl p-6 relative group transition-all duration-200"
                style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.12)" }}
              >
                <div className="text-5xl font-extrabold mb-4" style={{ color: "#F8E9A1", opacity: 0.8 }}>
                  {s.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.65)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Public VerifyPage ────────────────────────────────────────────────────────
function VerifyPage({ setPage }: { setPage: (p: Page) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<VerifyStep>("idle");
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

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

    try {
      const res = await verifyImage(file);
      setVerifyResult(res);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: "rgba(168,208,230,0.12)", color: "#A8D0E6" }}>
            Public Image Verification
          </div>
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
            className="rounded-2xl p-4 mb-8 flex items-center justify-between animate-fade-in-up"
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
          <div className="animate-fade-in-up rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}>
            {preview && (
              <div className="aspect-video overflow-hidden relative flex items-center justify-center" style={{ backgroundColor: "#24305E" }}>
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
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(248,233,161,0.15)" }}>
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
                  <div className="rounded-2xl p-6 mb-8 space-y-4" style={{ backgroundColor: "rgba(36,48,94,0.6)", border: "1px solid rgba(168,208,230,0.1)" }}>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "rgba(168,208,230,0.6)" }}>Status</span>
                      <span className="font-bold px-2.5 py-1 rounded text-xs" style={{ backgroundColor: "rgba(248,233,161,0.2)", color: "#F8E9A1" }}>
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
                          <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "rgba(168,208,230,0.6)" }}>
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
                        <p className="font-mono text-xs text-white break-all p-2.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                          {verifyResult.imageHash}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                      style={{ backgroundColor: "#F76C6C", color: "white" }}
                    >
                      Verify Another Image
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Not Registered State ── */
                <div>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(247,108,108,0.15)" }}>
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
                    className="rounded-2xl p-5 mb-6 text-sm"
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
                    <div className="rounded-xl p-4 mb-8" style={{ backgroundColor: "rgba(36,48,94,0.6)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "rgba(168,208,230,0.5)" }}>
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
                      className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                      style={{ backgroundColor: "#F76C6C", color: "white" }}
                    >
                      Register This Image
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-4 rounded-xl font-bold text-sm transition-all hover:bg-white/10 cursor-pointer"
                      style={{ backgroundColor: "rgba(168,208,230,0.1)", color: "#A8D0E6", border: "1px solid rgba(168,208,230,0.2)" }}
                    >
                      Try Another Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : step === "checking" ? (
          /* ── Checking State ── */
          <div
            className="animate-fade-in-up rounded-3xl p-12 text-center"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
          >
            {preview && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-8 shadow-lg" style={{ backgroundColor: "#24305E" }}>
                <img src={preview} alt="Checking" className="w-full h-full object-cover opacity-60" />
              </div>
            )}
            <div
              className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-6"
              style={{ borderColor: "#A8D0E6", borderTopColor: "transparent" }}
            />
            <p className="text-xl font-extrabold text-white mb-2">Analyzing Image Fingerprint...</p>
            <p className="text-sm" style={{ color: "rgba(168,208,230,0.6)" }}>
              Querying Ethereum Sepolia smart contract for matching hash...
            </p>
          </div>
        ) : file ? (
          /* ── File Selected / Ready to Verify ── */
          <div className="animate-fade-in-up">
            <div
              className="rounded-3xl overflow-hidden mb-6 shadow-xl"
              style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
            >
              <div className="aspect-video overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#24305E" }}>
                <img src={preview!} alt="Preview" className="w-full h-full object-contain" />
              </div>
              <div className="p-6 flex items-center justify-between border-t" style={{ borderColor: "rgba(168,208,230,0.1)" }}>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{file.name}</p>
                  <p className="text-xs" style={{ color: "rgba(168,208,230,0.5)" }}>{fmtBytes(file.size)}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  style={{ color: "rgba(247,108,108,0.9)", backgroundColor: "rgba(247,108,108,0.1)" }}
                >
                  Change Image
                </button>
              </div>
            </div>

            <button
              onClick={handleVerify}
              className="w-full py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-xl"
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
    </div>
  );
}

// ─── AuthPage (Login & Register Account) ───────────────────────────────────────
function AuthPage({
  initialMode = "login",
  notice,
  setPage,
}: {
  initialMode?: "login" | "register";
  notice?: string;
  setPage: (p: Page) => void;
}) {
  const { login, loginGoogle, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleGoogleAuthResponse = useCallback(
    async (credential: string) => {
      setError(null);
      setLoading(true);
      try {
        await loginGoogle(credential);
        setPage("dashboard");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Google authentication failed.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [loginGoogle, setPage]
  );

  // Initialize Google Identity Services (One-Tap / ID listener)
  useEffect(() => {
    const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientId = rawClientId ? rawClientId.trim() : "";
    if (!clientId || clientId.includes("your_google_oauth_client_id_here")) return;

    const initGsi = () => {
      if (typeof window === "undefined" || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res: { credential?: string }) => {
            if (res.credential) {
              setError(null);
              setLoading(true);
              try {
                await loginGoogle({ idToken: res.credential });
                setPage("dashboard");
              } catch (err: unknown) {
                const msg =
                  err instanceof Error ? err.message : "Google authentication failed.";
                setError(msg);
              } finally {
                setLoading(false);
              }
            }
          },
        });
      } catch (err) {
        console.warn("GSI init warning:", err);
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGsi();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [loginGoogle, setPage]);

  // Click handler for "Continue with Google"
  const handleGoogleClick = () => {
    setError(null);
    const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientId = rawClientId ? rawClientId.trim() : "";

    if (!clientId || clientId.includes("your_google_oauth_client_id_here")) {
      setError(
        "Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in frontend/.env and GOOGLE_CLIENT_ID in backend/.env with your Google OAuth Client ID."
      );
      return;
    }

    if (!window.google?.accounts) {
      setError(
        "Google Identity Services is still loading. Please check your network connection and try again."
      );
      return;
    }

    try {
      // 1. Primary: Use Google OAuth Token Client to open Google Account Picker popup directly
      if (window.google.accounts.oauth2?.initTokenClient) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setError(`Google Sign In: ${tokenResponse.error_description || tokenResponse.error}`);
              return;
            }
            if (tokenResponse.access_token) {
              setError(null);
              setLoading(true);
              try {
                await loginGoogle({ accessToken: tokenResponse.access_token });
                setPage("dashboard");
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Google authentication failed.";
                setError(msg);
              } finally {
                setLoading(false);
              }
            }
          },
          error_callback: (err) => {
            console.error("Google OAuth error:", err);
            setError("Google sign-in popup was closed or cancelled.");
          },
        });

        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      }

      // 2. Fallback: Prompt via GSI ID
      if (window.google.accounts.id) {
        window.google.accounts.id.prompt();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to open Google account picker.";
      setError(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        if (!loginIdentifier.trim()) {
          throw new Error("Please enter your username or email address.");
        }
        await login(loginIdentifier.trim(), password);
      } else {
        if (!username.trim()) {
          throw new Error("Please enter your username.");
        }
        if (!email.trim()) {
          throw new Error("Please enter your email address.");
        }
        await register(username.trim(), email.trim(), password);
      }
      setPage("dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-6 flex items-center justify-center" style={{ backgroundColor: "#24305E" }}>
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Notice from Landing CTA */}
        {notice && (
          <div
            className="rounded-2xl p-4 mb-6 flex items-center gap-3"
            style={{ backgroundColor: "rgba(248,233,161,0.15)", border: "1px solid rgba(248,233,161,0.3)" }}
          >
            <span className="text-lg">🔒</span>
            <span className="text-xs font-medium" style={{ color: "#F8E9A1" }}>{notice}</span>
          </div>
        )}

        {/* Main Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mx-auto mb-3.5">
              <ProofMintIcon size={52} />
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              {mode === "login" ? "Sign In to ProofMint" : "Create Your Account"}
            </h1>
            <p className="text-xs mt-1" style={{ color: "rgba(168,208,230,0.6)" }}>
              {mode === "login" ? "Access your personal image proofs and dashboard" : "Register and manage immutable image proofs on-chain"}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: "rgba(36,48,94,0.6)" }}>
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className="flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
              style={{
                backgroundColor: mode === "login" ? "#F76C6C" : "transparent",
                color: mode === "login" ? "white" : "rgba(168,208,230,0.6)",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className="flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
              style={{
                backgroundColor: mode === "register" ? "#F76C6C" : "transparent",
                color: mode === "register" ? "white" : "rgba(168,208,230,0.6)",
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="rounded-xl p-3.5 mb-5 text-xs font-medium flex items-center gap-2.5 animate-fade-in-up"
              style={{ backgroundColor: "rgba(247,108,108,0.15)", border: "1px solid rgba(247,108,108,0.3)", color: "white" }}
            >
              <XCircleIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all hover:bg-white/10 active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-3 border"
              style={{
                backgroundColor: "rgba(36,48,94,0.8)",
                borderColor: "rgba(168,208,230,0.25)",
                color: "#FFFFFF",
              }}
            >
              <GoogleIcon className="w-5 h-5 flex-shrink-0" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-5">
            <div className="flex-1 border-t" style={{ borderColor: "rgba(168,208,230,0.15)" }} />
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(168,208,230,0.45)" }}>
              or continue with {mode === "login" ? "credentials" : "email"}
            </span>
            <div className="flex-1 border-t" style={{ borderColor: "rgba(168,208,230,0.15)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "login" ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#A8D0E6" }}>
                  Username or Email Address
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. alice123 or you@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white focus:outline-none transition-colors"
                  style={{
                    backgroundColor: "rgba(36,48,94,0.7)",
                    border: "1px solid rgba(168,208,230,0.2)",
                  }}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#A8D0E6" }}>
                    Your Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alice123"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "rgba(36,48,94,0.7)",
                      border: "1px solid rgba(168,208,230,0.2)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#A8D0E6" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "rgba(36,48,94,0.7)",
                      border: "1px solid rgba(168,208,230,0.2)",
                    }}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#A8D0E6" }}>
                Password {mode === "register" && <span className="text-[10px] font-normal lowercase">(min 6 chars)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white focus:outline-none transition-colors pr-12"
                  style={{
                    backgroundColor: "rgba(36,48,94,0.7)",
                    border: "1px solid rgba(168,208,230,0.2)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 cursor-pointer"
                  style={{ color: "#A8D0E6" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-lg mt-2 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#F76C6C",
                color: "white",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === "login" ? (
                "Sign In to Dashboard"
              ) : (
                "Create Account & Proceed"
              )}
            </button>
          </form>

          {/* Footer switcher */}
          <div className="mt-6 text-center text-xs" style={{ color: "rgba(168,208,230,0.6)" }}>
            {mode === "login" ? (
              <p>
                Don't have an account yet?{" "}
                <button
                  onClick={() => { setMode("register"); setError(null); }}
                  className="font-bold underline cursor-pointer hover:opacity-100"
                  style={{ color: "#F8E9A1" }}
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(null); }}
                  className="font-bold underline cursor-pointer hover:opacity-100"
                  style={{ color: "#F8E9A1" }}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────
function DashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  const { user, isAuthenticated, logout } = useAuth();
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: "rgba(247,108,108,0.15)", color: "#F76C6C" }}>
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
                style={{ color: "#A8D0E6", backgroundColor: "rgba(168,208,230,0.1)", border: "1px solid rgba(168,208,230,0.2)" }}
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <StatCard label="My Registered Proofs" value={images.length} accent="#F8E9A1" />
            <StatCard label="Blockchain Confirmed" value={images.filter((i) => !!i.txHash || !!i.hash).length} accent="#F76C6C" />
            <StatCard label="Cloud Storage Backed" value={images.filter((i) => !!i.imageUrl).length} accent="#A8D0E6" />
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
            <div className="flex gap-1 p-1 rounded-xl bg-white border" style={{ borderColor: "rgba(55,71,133,0.15)" }}>
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
              <span className="text-sm font-medium" style={{ color: "#24305E" }}>{error}</span>
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(168,208,230,0.1)" }}>
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
            <p className="text-sm" style={{ color: "#24305E" }}>No image proofs matched your search "{searchQuery}".</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img, idx) => (
              <ImageCard key={img._id || img.hash || idx} image={img} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="rounded-2xl overflow-hidden bg-white shadow-sm border" style={{ borderColor: "rgba(55,71,133,0.15)" }}>
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

// ─── RegisterPage (In-Dashboard Image Registration) ───────────────────────────
function RegisterPage({ setPage }: { setPage: (p: Page) => void }) {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: "rgba(247,108,108,0.15)", color: "#F76C6C" }}>
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
                <p className="text-xs" style={{ color: "rgba(168,208,230,0.8)" }}>{errorState.message}</p>
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
              <div className="aspect-video overflow-hidden relative flex items-center justify-center" style={{ backgroundColor: "#24305E" }}>
                <img src={registeredData.imageUrl} alt="Registered" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(248,233,161,0.15)" }}>
                  <CheckCircleIcon size={36} color="#F8E9A1" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-2">Registration Complete!</h2>
                <p className="text-sm" style={{ color: "rgba(168,208,230,0.7)" }}>
                  Your image fingerprint is permanently confirmed on Ethereum Sepolia and saved under your account.
                </p>
              </div>

              {/* Details card */}
              <div className="rounded-2xl p-6 mb-8 space-y-3" style={{ backgroundColor: "rgba(36,48,94,0.6)" }}>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>Status</span>
                  <span className="font-bold text-[#F8E9A1]">CONFIRMED ON SEPOLIA</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>File Name</span>
                  <span className="font-mono text-white truncate max-w-[200px]">{registeredData.fileName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "rgba(168,208,230,0.5)" }}>SHA-256 Fingerprint</span>
                  <span className="font-mono text-white text-[11px] truncate max-w-[200px]" title={registeredData.hash}>
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

              <div className="flex flex-col sm:flex-row gap-4">
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
                  style={{ backgroundColor: "rgba(168,208,230,0.1)", color: "#A8D0E6", border: "1px solid rgba(168,208,230,0.2)" }}
                >
                  Register Another Image
                </button>
              </div>
            </div>
          </div>
        ) : step !== "idle" ? (
          /* ── In-progress State ── */
          <div
            className="animate-fade-in-up rounded-3xl p-10 text-center shadow-2xl"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
          >
            {preview && (
              <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-8 shadow-md" style={{ backgroundColor: "#24305E" }}>
                <img src={preview} alt="Uploading" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="max-w-md mx-auto mb-8">
              <RegistrationProgress step={step} />
            </div>
          </div>
        ) : file ? (
          /* ── File Ready to Register ── */
          <div className="animate-fade-in-up">
            <div
              className="rounded-3xl overflow-hidden mb-6 shadow-xl"
              style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
            >
              <div className="aspect-video overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#24305E" }}>
                <img src={preview!} alt="Preview" className="w-full h-full object-contain" />
              </div>
              <div className="p-6 flex items-center justify-between border-t" style={{ borderColor: "rgba(168,208,230,0.1)" }}>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{file.name}</p>
                  <p className="text-xs" style={{ color: "rgba(168,208,230,0.5)" }}>{fmtBytes(file.size)}</p>
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
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
function ProfilePage({ setPage }: { setPage: (p: Page) => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [registeredCount, setRegisteredCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setPage("login");
      return;
    }
    getImages()
      .then((imgs) => setRegisteredCount(imgs.length))
      .catch(() => { });
  }, [isAuthenticated, setPage]);

  const handleLogout = () => {
    logout();
    setPage("home");
  };

  return (
    <div className="min-h-screen py-16 px-6" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-xl mx-auto animate-fade-in-up">
        {/* Profile Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-5 mb-8 pb-8 border-t-0 border-b" style={{ borderColor: "rgba(168,208,230,0.15)" }}>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-md flex-shrink-0"
              style={{ backgroundColor: "#F76C6C" }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ backgroundColor: "rgba(248,233,161,0.2)", color: "#F8E9A1" }}>
                Active Member
              </div>
              <h1 className="text-2xl font-extrabold text-white truncate">{user?.name}</h1>
              <p className="text-xs truncate" style={{ color: "rgba(168,208,230,0.7)" }}>{user?.email}</p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "rgba(36,48,94,0.6)" }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "rgba(168,208,230,0.5)" }}>
                  Username
                </span>
                <span className="text-sm font-semibold text-white">{user?.username || user?.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "rgba(36,48,94,0.6)" }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "rgba(168,208,230,0.5)" }}>
                  Email Address
                </span>
                <span className="text-sm font-semibold text-white">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "rgba(36,48,94,0.6)" }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "rgba(168,208,230,0.5)" }}>
                  Account Created
                </span>
                <span className="text-sm font-semibold text-white">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "rgba(36,48,94,0.6)" }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "rgba(168,208,230,0.5)" }}>
                  Total Registered Proofs
                </span>
                <span className="text-sm font-extrabold text-[#F8E9A1]">
                  {registeredCount !== null ? registeredCount : (user?.registeredCount ?? 0)} proofs on Ethereum Sepolia
                </span>
              </div>
              <button
                onClick={() => setPage("dashboard")}
                className="text-xs font-bold underline cursor-pointer"
                style={{ color: "#A8D0E6" }}
              >
                View Proofs →
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setPage("dashboard")}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 cursor-pointer text-center"
              style={{ backgroundColor: "#A8D0E6", color: "#24305E" }}
            >
              Go to Proofs Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-red-500/20 cursor-pointer text-center border"
              style={{
                color: "#F76C6C",
                backgroundColor: "rgba(247,108,108,0.1)",
                borderColor: "rgba(247,108,108,0.3)",
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AboutPage ────────────────────────────────────────────────────────────────
function AboutPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen py-16 px-6" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="text-center mb-16">
          <div className="flex justify-center mx-auto mb-5">
            <ProofMintIcon size={64} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F76C6C" }}>ABOUT PROOFMINT</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Cryptographic Image Proofs
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "rgba(168,208,230,0.7)" }}>
            ProofMint establishes indisputable provenance and timestamped authenticity for digital images on Ethereum Sepolia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="rounded-3xl p-8" style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}>
            <h3 className="text-xl font-bold text-white mb-3">Immutable SHA-256 Hashing</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.7)" }}>
              ProofMint never alters or stores insecure credentials on-chain. We calculate deterministic SHA-256 fingerprints directly from image byte buffers, ensuring that even a 1-pixel change produces a completely distinct hash.
            </p>
          </div>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}>
            <h3 className="text-xl font-bold text-white mb-3">Decentralized Smart Contracts</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.7)" }}>
              Proofs are written directly into our Ethereum Sepolia smart contract. Once stored, a proof cannot be removed, tampered with, or forged by any third party.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setPage("verify")}
            className="px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 cursor-pointer shadow-lg"
            style={{ backgroundColor: "#F76C6C", color: "white" }}
          >
            Try Public Verification Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer style={{ backgroundColor: "#24305E", borderTop: "1px solid rgba(168,208,230,0.1)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <ProofMintLogo size={32} showWordmark={true} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: "rgba(168,208,230,0.6)" }}>
            <button onClick={() => setPage("home")} className="hover:text-white transition-colors cursor-pointer">Home</button>
            <button onClick={() => setPage("verify")} className="hover:text-white transition-colors cursor-pointer">Verify Image</button>
            <button onClick={() => setPage("about")} className="hover:text-white transition-colors cursor-pointer">About</button>
          </div>

          <p className="text-xs" style={{ color: "rgba(168,208,230,0.4)" }}>
            © 2026 ProofMint. Built on Ethereum Sepolia.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Root App Content & Router
// ═══════════════════════════════════════════════════════════════════════════════
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState<Page>("home");
  const [authNotice, setAuthNotice] = useState<string | undefined>(undefined);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleStartRegister = () => {
    if (isAuthenticated) {
      setPage("register");
    } else {
      setPage("login");
    }
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage setPage={setPage} onStartRegister={handleStartRegister} />;
      case "verify":
        return <VerifyPage setPage={setPage} />;
      case "login":
      case "register-account":
        return (
          <AuthPage
            initialMode={page === "register-account" ? "register" : "login"}
            notice={authNotice}
            setPage={setPage}
          />
        );
      case "dashboard":
        return <DashboardPage setPage={setPage} />;
      case "register":
        return <RegisterPage setPage={setPage} />;
      case "profile":
        return <ProfilePage setPage={setPage} />;
      case "about":
        return <AboutPage setPage={setPage} />;
      default:
        return <HomePage setPage={setPage} onStartRegister={handleStartRegister} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        page={page}
        setPage={(p) => {
          setAuthNotice(undefined);
          setPage(p);
        }}
        onStartRegister={handleStartRegister}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer setPage={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { fmtBytes } from "../../utils/formatters";

export interface CryptographicVisualizerProps {
  file: File | null;
  mode?: "verify" | "register";
  statusText?: string;
  onHashCalculated?: (hash: string) => void;
}

export function CryptographicVisualizer({
  file,
  mode = "verify",
  statusText,
  onHashCalculated,
}: CryptographicVisualizerProps) {
  const [realHash, setRealHash] = useState<string>("");
  const [displayChars, setDisplayChars] = useState<string>("");
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [hexMatrix, setHexMatrix] = useState<string[]>([]);
  const [activeByteIndex, setActiveByteIndex] = useState<number>(0);

  // Compute actual SHA-256 in browser via Web Crypto API
  useEffect(() => {
    let isMounted = true;
    if (!file) return;

    file.arrayBuffer().then(async (buffer) => {
      try {
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        if (isMounted) {
          setRealHash(hashHex);
          if (onHashCalculated) onHashCalculated(hashHex);
        }
      } catch (err) {
        console.warn("Client SHA-256 calculation fallback:", err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [file, onHashCalculated]);

  // Generate random streaming hex matrix rows
  useEffect(() => {
    const chars = "0123456789abcdef";
    const interval = setInterval(() => {
      const rows: string[] = [];
      for (let r = 0; r < 4; r++) {
        let row = "";
        for (let c = 0; c < 16; c++) {
          row += chars[Math.floor(Math.random() * chars.length)];
          if (c % 2 === 1 && c < 15) row += " ";
        }
        rows.push(row);
      }
      setHexMatrix(rows);
      setActiveByteIndex((prev) => (prev + 1) % 64);
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Animate the hash lock-in
  useEffect(() => {
    if (!realHash) return;

    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += 2;
      if (currentLength >= 64) {
        currentLength = 64;
        setDisplayChars(realHash);
        clearInterval(interval);
      } else {
        const hex = realHash.slice(0, currentLength);
        const randomFill = Array.from({ length: 64 - currentLength }, () =>
          "0123456789abcdef"[Math.floor(Math.random() * 16)]
        ).join("");
        setDisplayChars(hex + randomFill);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [realHash]);

  // Stage timeline
  const stages = useMemo(
    () =>
      mode === "verify"
        ? [
            { label: "Reading raw image binary stream", doneAfter: 200 },
            { label: "Calculating deterministic SHA-256 digest", doneAfter: 800 },
            { label: "Querying ProofMint smart contract on Sepolia", doneAfter: 1800 },
            { label: "Validating cryptographic consensus & state trie", doneAfter: 2800 },
          ]
        : [
            { label: "Parsing byte buffer & Cloudinary streaming", doneAfter: 200 },
            { label: "Generating immutable SHA-256 fingerprint", doneAfter: 800 },
            { label: "Preparing Sepolia transaction storeHash()", doneAfter: 1600 },
            { label: "Awaiting blockchain confirmation & receipt", doneAfter: 2600 },
          ],
    [mode]
  );

  useEffect(() => {
    const timers = stages.map((s, i) =>
      setTimeout(() => {
        setStageIndex(i);
      }, s.doneAfter)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, [stages]);

  return (
    <div
      className="rounded-3xl p-6 sm:p-8 border relative overflow-hidden font-sans text-left shadow-2xl animate-fade-in-up"
      style={{
        backgroundColor: "#1b2345",
        borderColor: "rgba(168,208,230,0.2)",
      }}
    >
      {/* Background cyber scanline gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 242, 254, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 254, 0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header telemetry tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 border-b pb-4" style={{ borderColor: "rgba(168,208,230,0.12)" }}>
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
            Cryptographic Pipeline Active
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: "rgba(168,208,230,0.7)" }}>
          <span>Input:</span>
          <span className="text-white font-semibold">{file?.name ? file.name : "Buffer"}</span>
          <span>({fmtBytes(file?.size)})</span>
        </div>
      </div>

      {/* Streaming Hex Matrix Visualization */}
      <div
        className="rounded-2xl p-4 mb-6 relative overflow-hidden font-mono text-xs border"
        style={{
          backgroundColor: "#0f162e",
          borderColor: "rgba(168,208,230,0.15)",
        }}
      >
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[#A8D0E6]/60 mb-2">
          <span>Raw Byte Buffer Stream (SHA-256 Round Function)</span>
          <span className="text-emerald-400">Stream [Active]</span>
        </div>

        <div className="space-y-1 select-none font-mono">
          {hexMatrix.map((row, idx) => (
            <div key={idx} className="flex justify-between items-center text-[11px] opacity-75">
              <span className="text-sky-400/40">0x{(idx * 16).toString(16).padStart(4, "0")}:</span>
              <span className="text-[#A8D0E6] tracking-wider">{row}</span>
              <span className="text-emerald-400/60 hidden sm:inline">[{activeByteIndex + idx * 8}]</span>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time 64-character SHA-256 Digest Lock-in */}
      <div
        className="rounded-2xl p-4 sm:p-5 mb-6 border relative"
        style={{
          backgroundColor: "rgba(36,48,94,0.7)",
          borderColor: displayChars.length === 64 ? "rgba(16,185,129,0.4)" : "rgba(247,108,108,0.3)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: displayChars.length === 64 ? "#10B981" : "#F76C6C" }} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              SHA-256 Fingerprint (256-Bit Digest)
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded text-emerald-300 bg-emerald-500/10">
            {displayChars.length === 64 ? "✓ 32 BYTES LOCKED" : "COMPUTING..."}
          </span>
        </div>

        {/* 64-character hash display with highlighted chunks */}
        <div className="p-3 rounded-xl bg-black/30 border border-white/5 font-mono text-xs sm:text-sm text-emerald-400 break-all tracking-wider leading-relaxed">
          {displayChars ? (
            <>
              <span className="text-[#F8E9A1] font-bold">{displayChars.slice(0, 8)}</span>
              <span className="text-white">{displayChars.slice(8, 56)}</span>
              <span className="text-[#F76C6C] font-bold">{displayChars.slice(56)}</span>
            </>
          ) : (
            <span className="text-white/30 animate-pulse">Initializing cryptographic state...</span>
          )}
        </div>
      </div>

      {/* Step-by-Step Ledger Execution */}
      <div className="space-y-2.5">
        {stages.map((stage, i) => {
          const isDone = i < stageIndex;
          const isActive = i === stageIndex;

          return (
            <div
              key={i}
              className="flex items-center gap-3 text-xs transition-all duration-300"
              style={{
                opacity: isDone || isActive ? 1 : 0.4,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold transition-colors duration-300"
                style={{
                  backgroundColor: isDone
                    ? "#10B981"
                    : isActive
                      ? "#F76C6C"
                      : "rgba(168,208,230,0.15)",
                  color: isDone || isActive ? "white" : "rgba(168,208,230,0.4)",
                }}
              >
                {isDone ? "✓" : isActive ? "▶" : i + 1}
              </div>

              <p
                className={`font-medium transition-colors ${
                  isActive ? "text-white font-semibold" : isDone ? "text-emerald-300" : "text-white/50"
                }`}
              >
                {stage.label}
              </p>

              {isActive && (
                <span className="ml-auto font-mono text-[10px] text-[#F8E9A1] animate-pulse">
                  Executing...
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Subtext description */}
      <div className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between text-[11px]" style={{ borderColor: "rgba(168,208,230,0.1)", color: "rgba(168,208,230,0.6)" }}>
        <span>Target: <code className="text-white font-mono">ProofMint.sol (Sepolia)</code></span>
        <span>{statusText || "Collision resistance: 2^128 · Tamper evident"}</span>
      </div>
    </div>
  );
}

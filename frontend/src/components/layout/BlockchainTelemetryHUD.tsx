import React, { useState, useEffect, useCallback } from "react";

export interface TelemetryData {
  blockNumber: number | null;
  gasPriceGwei: string | null;
  latencyMs: number | null;
  status: "connected" | "connecting" | "error";
  lastUpdated: string | null;
}

const CONTRACT_ADDRESS = "0x3E73D50b6591Dd8626eE32ebC367bBDe03E88685";
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const ETHERSCAN_URL = `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`;

export function BlockchainTelemetryHUD() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    blockNumber: null,
    gasPriceGwei: null,
    latencyMs: null,
    status: "connecting",
    lastUpdated: null,
  });

  const [copiedContract, setCopiedContract] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    setIsRefreshing(true);
    const start = performance.now();

    try {
      // 1. Fetch Block Number
      const blockRes = await fetch(SEPOLIA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      });
      const blockData = await blockRes.json();
      const blockNum = blockData?.result ? parseInt(blockData.result, 16) : null;

      // 2. Fetch Gas Price
      const gasRes = await fetch(SEPOLIA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_gasPrice",
          params: [],
          id: 2,
        }),
      });
      const gasData = await gasRes.json();
      const gasWei = gasData?.result ? parseInt(gasData.result, 16) : 1000000000;
      const gasGwei = (gasWei / 1e9).toFixed(1);

      const elapsed = Math.round(performance.now() - start);

      setTelemetry({
        blockNumber: blockNum,
        gasPriceGwei: gasGwei,
        latencyMs: elapsed,
        status: "connected",
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch {
      setTelemetry((prev) => ({
        ...prev,
        status: prev.blockNumber ? "connected" : "error",
        latencyMs: Math.round(performance.now() - start),
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    // Refresh telemetry every 30 seconds
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const copyContract = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <>
      {/* ── Top Telemetry Strip ── */}
      <aside
        aria-label="Live Ethereum Sepolia Telemetry"
        className="w-full text-xs select-none border-b transition-colors relative z-40"
        style={{
          backgroundColor: "#161d3b",
          borderColor: "rgba(168,208,230,0.12)",
          color: "rgba(168,208,230,0.85)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar font-mono">
          {/* Left: Network & Heartbeat */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  telemetry.status === "connected" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  telemetry.status === "connected" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>

            <span className="font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Ethereum Sepolia</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-normal"
                style={{ backgroundColor: "rgba(168,208,230,0.12)", color: "#A8D0E6" }}
              >
                11155111
              </span>
            </span>

            <span className="text-white/20 hidden sm:inline">|</span>

            {/* Live Block Number */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px]">
              <span className="text-white/40">Block:</span>
              <span className="text-emerald-400 font-semibold">
                {telemetry.blockNumber
                  ? `#${telemetry.blockNumber.toLocaleString()}`
                  : "Syncing..."}
              </span>
            </span>

            {/* Live Gas */}
            <span className="hidden md:inline-flex items-center gap-1 text-[11px]">
              <span className="text-white/40">Gas:</span>
              <span style={{ color: "#F8E9A1" }}>
                {telemetry.gasPriceGwei ? `~${telemetry.gasPriceGwei} Gwei` : "Optimal"}
              </span>
            </span>
          </div>

          {/* Center/Right: Verified Contract Address Chip */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all duration-150"
              style={{
                backgroundColor: "rgba(36,48,94,0.6)",
                borderColor: "rgba(168,208,230,0.2)",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981]">
                Contract
              </span>
              <a
                href={ETHERSCAN_URL}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-[#A8D0E6] transition-colors underline decoration-white/30 hover:decoration-[#A8D0E6]"
                title="View contract on Sepolia Etherscan"
              >
                {`${CONTRACT_ADDRESS.slice(0, 6)}…${CONTRACT_ADDRESS.slice(-4)}`} ↗
              </a>
              <button
                onClick={copyContract}
                className="p-0.5 hover:opacity-100 opacity-60 text-[#A8D0E6] cursor-pointer ml-0.5"
                title="Copy contract address"
              >
                {copiedContract ? (
                  <span className="text-emerald-400 font-bold text-[10px]">✓</span>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>

            {/* RPC Latency & Details Trigger */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:bg-white/10 active:scale-95 cursor-pointer border"
              style={{
                backgroundColor: "rgba(168,208,230,0.08)",
                borderColor: "rgba(168,208,230,0.15)",
                color: "#A8D0E6",
              }}
              title="Open Live Sepolia Telemetry Modal"
            >
              {telemetry.latencyMs !== null && (
                <span className="text-emerald-400">{telemetry.latencyMs}ms</span>
              )}
              <span className="hidden sm:inline">Telemetry</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Telemetry Details Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in-up"
          style={{ backgroundColor: "rgba(10, 15, 30, 0.85)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border relative font-sans"
            style={{
              backgroundColor: "#24305E",
              borderColor: "rgba(168,208,230,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: "rgba(168,208,230,0.15)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-emerald-400"
                  style={{ backgroundColor: "rgba(16,185,129,0.15)" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Ethereum Sepolia HUD</h3>
                  <p className="text-xs" style={{ color: "rgba(168,208,230,0.6)" }}>
                    Real-time network node metrics & contract registry
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#A8D0E6] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Key Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
              <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: "#374785", borderColor: "rgba(168,208,230,0.12)" }}>
                <span className="text-[10px] uppercase font-bold text-[#A8D0E6]/60 block mb-1">Network Chain ID</span>
                <p className="text-sm font-bold text-white">11155111</p>
                <span className="text-[10px] text-emerald-400 font-sans">● Live Testnet</span>
              </div>

              <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: "#374785", borderColor: "rgba(168,208,230,0.12)" }}>
                <span className="text-[10px] uppercase font-bold text-[#A8D0E6]/60 block mb-1">Current Block</span>
                <p className="text-sm font-bold text-emerald-400">
                  {telemetry.blockNumber ? `#${telemetry.blockNumber.toLocaleString()}` : "Syncing..."}
                </p>
                <span className="text-[10px] text-white/50 font-sans">~12s Finality</span>
              </div>

              <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: "#374785", borderColor: "rgba(168,208,230,0.12)" }}>
                <span className="text-[10px] uppercase font-bold text-[#A8D0E6]/60 block mb-1">Base Gas Price</span>
                <p className="text-sm font-bold text-[#F8E9A1]">
                  {telemetry.gasPriceGwei ? `${telemetry.gasPriceGwei} Gwei` : "..."}
                </p>
                <span className="text-[10px] text-emerald-400 font-sans">Optimal throughput</span>
              </div>

              <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: "#374785", borderColor: "rgba(168,208,230,0.12)" }}>
                <span className="text-[10px] uppercase font-bold text-[#A8D0E6]/60 block mb-1">Node Latency</span>
                <p className="text-sm font-bold text-white">
                  {telemetry.latencyMs !== null ? `${telemetry.latencyMs} ms` : "..."}
                </p>
                <span className="text-[10px] text-emerald-400 font-sans">Public Node RPC</span>
              </div>
            </div>

            {/* Smart Contract Card */}
            <div
              className="p-4 rounded-2xl border mb-6"
              style={{ backgroundColor: "rgba(36,48,94,0.7)", borderColor: "rgba(168,208,230,0.2)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F8E9A1]">
                  Deployed Smart Contract
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded text-emerald-400 bg-emerald-500/15">
                  Solidity ^0.8.28
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 font-mono text-xs">
                <span className="text-white truncate mr-2" title={CONTRACT_ADDRESS}>
                  {CONTRACT_ADDRESS}
                </span>
                <button
                  onClick={copyContract}
                  className="px-2 py-1 rounded text-[11px] font-bold text-white hover:bg-white/10 cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: "rgba(168,208,230,0.15)" }}
                >
                  {copiedContract ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px]" style={{ color: "rgba(168,208,230,0.6)" }}>
                <span>Method signatures: <code className="text-[#A8D0E6]">storeHash()</code>, <code className="text-[#A8D0E6]">verifyHash()</code></span>
                <a
                  href={ETHERSCAN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#F76C6C] font-bold hover:underline"
                >
                  View on Etherscan ↗
                </a>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTelemetry}
                disabled={isRefreshing}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all hover:bg-white/10 active:scale-95 cursor-pointer border flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "rgba(168,208,230,0.1)",
                  borderColor: "rgba(168,208,230,0.25)",
                  color: "#A8D0E6",
                }}
              >
                <span className={isRefreshing ? "animate-spin" : ""}>⟳</span>
                <span>{isRefreshing ? "Pinging Node..." : "Refresh Live Metrics"}</span>
              </button>

              <a
                href={ETHERSCAN_URL}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-center transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                style={{ backgroundColor: "#F76C6C", color: "white" }}
              >
                Explore Contract ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

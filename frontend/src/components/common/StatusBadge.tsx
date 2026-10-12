import React from "react";

export interface StatusBadgeProps {
  status: "registered" | "verified" | "pending";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map = {
    registered: { bg: "rgba(248,233,161,0.2)", color: "#F8E9A1", label: "Registered on Sepolia" },
    verified: { bg: "rgba(168,208,230,0.2)", color: "#A8D0E6", label: "Verified" },
    pending: { bg: "rgba(247,108,108,0.15)", color: "#F76C6C", label: "Pending" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}
